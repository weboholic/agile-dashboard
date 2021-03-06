<?php

namespace RGies\MetricsBundle\Controller;

use RGies\MetricsBundle\Entity\Dashboard;
use RGies\MetricsBundle\Entity\User;
use RGies\MetricsBundle\Entity\Domain;
use RGies\MetricsBundle\Form\UserRegisterType;
use RGies\MetricsBundle\Form\MyProfileType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\Security\Acl\Exception\Exception;
use Symfony\Component\Security\Core\SecurityContextInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

class DefaultController extends Controller
{
    const LAST_VISITED_DASHBOARD = 'last_dashboard_id';

    /**
     * Website home action.
     *
     * @Route("/", name="start")
     * @Route("/id/{id}", name="home")
     * @Template()
     */
    public function indexAction(Request $request, $id = null)
    {
        $em = $this->getDoctrine()->getManager();
        $dashboard = null;

        // set default domain
        if (!$request->getSession()->has('domain') || !$request->getSession()->get('domain')) {
            $domain = 1;
            $request->getSession()->set('domain', $domain);
        } else {
            $domain = $request->getSession()->get('domain');
        }

        // set domain name
        if (!$request->getSession()->has('domain-name')) {
            $domainEntity = $em->getRepository('MetricsBundle:Domain')->find($domain);
            $request->getSession()->set('domain-name', $domainEntity->getTitle());
        }

        // get dashboards
        $dashboards = $em->getRepository('MetricsBundle:Dashboard')
                ->createQueryBuilder('d')
                ->where('d.domain = :domain')
                ->orderBy('d.pos', 'ASC')
                ->setParameter('domain', $request->getSession()->get('domain'))
                ->getQuery()->getResult();

        // create default dashboard
        if (!$dashboards) {
            return $this->redirect($this->generateUrl('recipe_library'));
        } else if ($id) {
            // create cookie
            $expire = new \DateTime('+600 days');
            $cookie = new Cookie(self::LAST_VISITED_DASHBOARD, $id, $expire);
            $response = new Response();
            $response->headers->setCookie($cookie);
            $response->sendHeaders();
        } else if ($request->cookies->has(self::LAST_VISITED_DASHBOARD)) {
            $id = $request->cookies->get(self::LAST_VISITED_DASHBOARD);
        } else {
            $dashboard = $dashboards[0];
        }

        if (!$dashboard && $id) {
            $dashboard = $em->getRepository('MetricsBundle:Dashboard')->find($id);

            if (!$dashboard || $dashboard->getDomain() != $domain) {
                $result = $em->getRepository('MetricsBundle:Dashboard')->findBy(
                    array('domain' => $domain),
                    array('pos'=>'ASC')
                );
                $dashboard = $result[0];
            }
        }

        // get widgets
        $widgets = $em->getRepository('MetricsBundle:Widgets')
            ->createQueryBuilder('w')
            ->where('w.dashboard = :id')
            ->andWhere('w.enabled = 1')
            ->orderBy('w.pos')
            ->setParameter('id', $dashboard->getId())
            ->getQuery()->getResult();

        return array (
            'interval'      => $this->getParameter('widget_update_interval'),
            'widgets'       => $widgets,
            'dashboards'    => $dashboards,
            'dashboard'     => $dashboard,
        );
    }

    /**
     * Lists all Recipes.
     *
     * @Route("/recipes/{type}", name="recipe_library")
     * @Method("GET")
     * @Template()
     */
    public function recipesAction(Request $request, $type = 'dashboard')
    {
        $em = $this->getDoctrine()->getManager();

        // setup jira credential if nothing exists
        if (!$this->get('credentialService')->hasCredentials('JiraCoreWidgetBundle')) {
            return $this->redirect($this->generateUrl('jira_core_widget_login_edit'));
        }

        $entities = $em->getRepository('MetricsBundle:Recipe')->findBy(
            array('type' => $type),
            array('id' => 'DESC')
        );

        // check if dashboard exists
        if ($type == 'widget') {
            $dashboards = $em->getRepository('MetricsBundle:Dashboard')
                ->createQueryBuilder('d')
                ->where('d.domain = :domain')
                ->orderBy('d.pos', 'ASC')
                ->setParameter('domain', $request->getSession()->get('domain'))
                ->getQuery()->getResult();

            if (!$dashboards) {
                $dashboard = new Dashboard();
                $dashboard->setTitle('Main Metrics')
                    ->setDomain($request->getSession()->get('domain'))
                    ->setPos(1);
                $em->persist($dashboard);
                $em->flush();
            }
        }

        if (!$entities) {
            if ($type == 'dashboard') {
                return $this->redirect($this->generateUrl('dashboard_new'));
            } else {
                return $this->redirect($this->generateUrl('widgets_new'));
            }
        }

        return array(
            'type'      => $type,
            'entities'  => $entities,
        );
    }

    /**
     * Use recipe setup form.
     *
     * @Route("/recipes/use/{id}", name="recipe_use")
     * @Method("GET")
     * @Template()
     */
    public function recipeUseAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('MetricsBundle:Recipe')->find($id);
        $dashboard = null;

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Recipe entity.');
        }

        // if no custom fields exists create new dashboard or widget from recipe
        if (!count($entity->getRecipeFields())) {
            // create dashboard or widget entity
            try {
                $dashboardId = $this->_createRecipeEntity($request, $entity);
            } catch (\Exception $e) {
                $this->addFlash('error', $e->getMessage());
                return $this->redirect($this->generateUrl('home'));
            }

            // redirect to target dashboard
            return $this->redirect($this->generateUrl('home', ['id' => $dashboardId]));
        }

        $fields = $em->getRepository('MetricsBundle:RecipeFields')->findBy(
            array('recipe' => $entity->getId()),
            array('pos' => 'ASC')
        );

        return array(
            'entity' => $entity,
            'fields' => $fields,
        );
    }

    /**
     * Add dashboard or widget from recipe.
     *
     * @Route("/recipe/add/{id}", name="recipe_add")
     * @Template()
     */
    public function recipeAddAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('MetricsBundle:Recipe')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Recipe entity.');
        }

        // create dashboard or widget entity
        try {
            $dashboardId = $this->_createRecipeEntity($request, $entity, $request->get('field'));
        } catch (\Exception $e) {
            $this->addFlash('error', $e->getMessage());
            return $this->redirect($this->generateUrl('home'));
        }

        // redirect to target dashboard
        return $this->redirect($this->generateUrl('home', ['id' => $dashboardId]));
    }

    /**
     * Create Dashboard or Widget entity from recipe.
     *
     * @param $request
     * @param $entity
     * @param $fields
     */
    protected function _createRecipeEntity($request, $entity, $fields = null)
    {
        $em = $this->getDoctrine()->getManager();
        $configFile = $this->getParameter('recipe_directory') . '/' . $entity->getJsonConfig();

        if (!file_exists($configFile)) {
            throw $this->createNotFoundException('Config file [' . $configFile . '] not found.');
        }

        // load json config
        $import = file_get_contents($configFile);

        // replace variables
        if ($fields) {
            foreach ($fields as $key=>$value) {
                $placeholder = '%custom_field_' . $key . '%';
                $import = str_replace($placeholder, $value, $import);
            }
        }

        $import = json_decode($import, true);

        // check for recipe type dashboard or widget
        switch ($entity->getType())
        {
            case 'dashboard':
                if ($this->get('LicenseService')->limitReached('Dashboard')) {
                    throw $this->createNotFoundException('Dashboard limit reached.');
                }

                $title = $import['dashboard']['title'];
                $dashboard = $this->get('DashboardService')->import($import, $title);
                $dashboardId = $dashboard->getId();
                break;

            case 'widget':
                if (!$request->cookies->has(WidgetsController::LAST_VISITED_DASHBOARD)) {
                    throw $this->createNotFoundException('No dashboard defined.');
                }

                $dashboardId = $request->cookies->get(WidgetsController::LAST_VISITED_DASHBOARD);
                $dashboard = $em->getRepository('MetricsBundle:Dashboard')->find($dashboardId);

                if (!$dashboard) {
                    throw $this->createNotFoundException('Unable to find Dashboard entity.');
                }

                if (!$this->get('AclService')->userHasEntityAccess($dashboard)) {
                    throw $this->createNotFoundException('No access allowed.');
                }

                $this->get('WidgetService')->import($import, $dashboard);
                break;

            Default:
                throw $this->createNotFoundException('Unknown Recipe type [' . $entity->getType() . '].');

        }

        return $dashboardId;
    }

    /**
     * Imprint action.
     *
     * @Route("/imprint/", name="imprint")
     * @Template()
     */
    public function imprintAction()
    {
        return array();
    }

    /**
     * Contact action.
     *
     * @Route("/contact/", name="contact")
     * @Template()
     */
    public function contactAction(Request $request)
    {
        $emailTo = $this->container->getParameter('platform_contact');

        if ($request->getMethod() == 'POST')
        {
            $contact = $request->request->all();

            $message = \Swift_Message::newInstance()
                ->setSubject('Contact Request')
                ->setFrom($emailTo)
                ->setTo($emailTo)
                ->setBody($this->renderView('MetricsBundle:Email:contactEmail.txt.twig', array('contact' => $contact)));

            $this->get('mailer')->send($message);
            $this->get('session')->getFlashBag()->add('message', 'Your contact message was successfully sent. Thank you!');
        }

        return array();
    }

    /**
     * About action.
     *
     * @Route("/about/", name="about")
     * @Template()
     */
    public function aboutAction()
    {
        return array();
    }

    /**
     * Login action.
     *
     * @Route("/login/", name="login")
     * @Route("/login-auth/", name="login_auth")
     * @Template()
     */
    public function loginAction(Request $request)
    {
        $session = $request->getSession();

        // get the login error if there is one
        if ($request->attributes->has(SecurityContextInterface::AUTHENTICATION_ERROR)) {
            $error = $request->attributes->get(SecurityContextInterface::AUTHENTICATION_ERROR);
        } elseif (null !== $session && $session->has(SecurityContextInterface::AUTHENTICATION_ERROR)) {
            $error = $session->get(SecurityContextInterface::AUTHENTICATION_ERROR);
            $session->remove(SecurityContextInterface::AUTHENTICATION_ERROR);
        } else {
            $error = '';
        }

        // last username entered by the user
        $lastUsername = (null === $session) ? '' : $session->get(SecurityContextInterface::LAST_USERNAME);

        return array(
            // last username entered by the user
            'last_username' => $lastUsername,
            'error'         => $error,
        );
    }

    /**
     * User registration.
     *
     * @Route("/register/{token}", name="registration")
     * @Template()
     */
    public function registerAction(Request $request, $token)
    {
        $tokenService = $this->get('security_token_service');
        $params = $tokenService->isValid($token, 'user_registration');
        $em = $this->getDoctrine()->getManager();

        if (!$params)
        {
            throw $this->createNotFoundException('Access not allowed.');
        }

        if (isset($params['userId'])) {
            $entity = $em->getRepository('MetricsBundle:User')->find($params['userId']);
        }
        else {
            $entity = new User();
        }

        $form = $this->createForm(new UserRegisterType($this->container, $params), $entity, array(
            'action' => $this->generateUrl('registration', array('token' => $token)),
            'method' => 'POST',
        ));

        $form->add(
            'submit', 'submit',
            array(
                'label' => 'Register',
                'attr' => array('class' => 'btn btn-primary pull-right'),
            )
        );

        if ($request->request->get('rgies_MetricsBundle_user_register'))
        {
            // add user
            $form->handleRequest($request);

            if ($form->isValid()) {
                $entity->setIsActive(true);
                $entity->setDomain($params['domain']);

                if (isset($params['userRole'])) {
                    $entity->setRole($params['userRole']);
                }

                try {
                    $em->persist($entity);
                    $em->flush();
                }
                catch(\Doctrine\DBAL\DBALException $e) {
                    $this->get('session')->getFlashBag()->add('message', 'Username or email already exists. Please change username and email.');

                    return array(
                        'entity' => $entity,
                        'form'   => $form->createView(),
                    );
                }

                $session = $request->getSession();
                if (null !== $session)
                {
                    $session->set(SecurityContextInterface::LAST_USERNAME, $entity->getUsername());
                }

                $tokenService->validate($token, 'user_registration');

                return $this->redirect($this->generateUrl('login'));
            }
        }

        return array(
            'entity' => $entity,
            'form'   => $form->createView(),
        );
    }

    /**
     * @Route("/myprofile/", name="myprofile")
     * @Template()
     */
    public function myprofileAction()
    {
        $id = $this->getUser()->getId();

        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('MetricsBundle:User')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find User entity.');
        }

        $editForm = $this->createForm(new MyProfileType($this->container), $entity, array(
            'action' => $this->generateUrl('myprofile_update', array('id' => $entity->getId())),
            'method' => 'PUT',
        ));

        $domain = $em->getRepository('MetricsBundle:Domain')->find($entity->getDomain());
        $domainName = $domain->getTitle();

        $editForm->add('submit', 'submit'
            , array('label' => 'Update', 'attr' => array('class' => 'btn btn-primary pull-right')));

        return array(
            'domainName'  => $domainName,
            'entity'      => $entity,
            'edit_form'   => $editForm->createView(),
        );

        return array();
    }

    /**
     * Edits an existing User entity.
     *
     * @Route("/myprofile/update/", name="myprofile_update")
     * @Method("PUT")
     * @Template("MetricsBundle:Default:myprofile.html.twig")
     */
    public function updateAction(Request $request)
    {
        $id = $this->getUser()->getId();

        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('MetricsBundle:User')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find User entity.');
        }

        $editForm = $this->createForm(new MyProfileType($this->container), $entity, array(
            'action' => $this->generateUrl('myprofile_update', array('id' => $entity->getId())),
            'method' => 'PUT',
        ));

        $editForm->add('submit', 'submit', array('label' => 'Update'));

        $editForm->handleRequest($request);

        if ($editForm->isValid()) {
            $em->flush();

            return $this->redirect($this->generateUrl('home'));
        }

        return array(
            'entity'      => $entity,
            'edit_form'   => $editForm->createView(),
        );
    }

    /**
     * Logout action.
     *
     * @Route("/logout/", name="logout")
     * @Template()
     */
    public function logoutAction()
    {
        return array();
    }

    /**
     * Service Provider Management.
     *
     * @Route("/provider/", name="provider")
     * @Template()
     */
    public function providerAction()
    {
        $provider = $this->getParameter('service_provider');
        $em = $this->getDoctrine()->getManager();

        $data = array();
        foreach ($provider as $key=>$item) {
            $credential = $em->getRepository('MetricsBundle:Credential')->findBy(
                array(
                    'domain' => $this->get('session')->get('domain'),
                    'provider' => $key
                )
            );

            $config = $this->getParameter($key . 'Config');
            $data[$key]['icon'] = $config['icon'];
            $data[$key]['action'] = $config['action'];
            $data[$key]['name'] = $item;

            if ($credential) {
                $entity = $credential[0];
                $data[$key]['connected'] = $entity->getConnected();
            }
        }


        return array(
            'provider' => $data,
        );
    }
}