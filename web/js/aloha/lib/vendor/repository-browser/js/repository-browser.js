(function(){function i(d,n,i,s){function p(a){a.attr("unselectable","on");a.css({"-webkit-user-select":"none","user-select":"none"});a.onselectstart=function(){return!1}}function t(a){d.each(k,function(a){this.element.css("z-index",l+a)});a.element.css("z-index",l+1+k.length)}function u(){var a=d('<div class="repository-browser-modal-window" style="z-index: '+l+';"></div>');d("body").append(a);return a}function q(){var a=d("body");a.removeAttr("unselectable");a.css({"-webkit-user-select":"all","user-select":"all"});
a.onselectstart=null;d(".repository-browser-modal-overlay").hide()}function v(a){d.each("arrow-000-medium.png,arrow-180.png,arrow-315-medium.png,arrow-stop-180.png,arrow-stop.png,arrow.png,control-stop-square-small.png,folder-horizontal-open.png,folder-open.png,magnifier-left.png,page.png,picture.png,sort-alphabet-descending.png,sort-alphabet.png".split(","),function(){document.createElement("img").src=a+"img/"+this})}function w(a,b,c){var e=d('<div class="repository-browser-tree-header repository-browser-grab-handle">'+
a._i18n("Repository Browser")+"</div>"),f=d('<div class="repository-browser-tree"></div>');b.append(e,f);f.height(c-e.outerHeight(!0));f.bind("loaded.jstree",function(){d(this).find(">ul>li:first").css("padding-top",5);d(this).find('li[rel="repository"]:first').each(function(a,b){f.jstree("open_node",b)})});f.bind("select_node.jstree",function(b,c){c.args[0].context||a.treeNodeSelected(c.rslt.obj)});f.bind("open_node.jstree",function(b,c){a.folderOpened(c.rslt.obj)});f.bind("close_node.jstree",function(b,
c){a.folderClosed(c.rslt.obj)});f.jstree({types:a.types,rootFolderId:a.rootFolderId,plugins:["themes","json_data","ui","types"],core:{animation:250},ui:{select_limit:1},themes:{theme:"browser",url:a.rootPath+"css/jstree.css",dots:!0,icons:!0},json_data:{correct_state:!0,data:function(b,c){a.manager?(a.jstree_callback=c,a._fetchSubnodes.call(a,b,c)):c()}}});return f}function x(a,b){var c=d('<div class="repository-browser-grid repository-browser-shadow repository-browser-top"><div class="ui-layout-west"></div><div class="ui-layout-center"></div></div>');
b.append(c);return c}function y(a,b){var c=b.find(".ui-jqgrid-titlebar"),e='<div class="repository-browser-btns"><input type="text" class="repository-browser-search-field" /><span class="repository-browser-btn repository-browser-search-btn"><span class="repository-browser-search-icon"></span></span><span class="repository-browser-btn repository-browser-close-btn">'+a._i18n("Close")+'</span><div class="repository-browser-clear"></div></div>';c.addClass("repository-browser-grab-handle").append(e);c.find(".repository-browser-search-btn").click(function(){a._triggerSearch()});
var f=c.find(".repository-browser-search-field").keypress(function(b){13===b.keyCode&&a._triggerSearch()});f.val(a._i18n("Input search text...")).addClass("repository-browser-search-field-empty");f.focus(function(){f.val()===a._i18n("Input search text...")&&f.val("").removeClass("repository-browser-search-field-empty")});f.blur(function(){""===f.val()&&f.val(a._i18n("Input search text...")).addClass("repository-browser-search-field-empty")});c.find(".repository-browser-close-btn").click(function(){a.close()});
c.find(".repository-browser-btn").mousedown(function(){d(this).addClass("repository-browser-pressed")}).mouseup(function(){d(this).removeClass("repository-browser-pressed")});return c}function z(a,b,c){var e=d('<table id="list-'+ ++m+'" class="repository-browser-list"></table>'),f=[""],g=[{name:"id",sorttype:"int",firstsortorder:"asc",hidden:!0}];d.each(a.columns,function(a,b){f.push(b.title||"&nbsp;");g.push({name:a,width:b.width,sortable:b.sortable,sorttype:b.sorttype,resizable:b.resizable,fixed:b.fixed})});
var h="repository-browser-list-page-"+ ++m;b.append(e,'<div id="'+h+'" class="repository-browser-grab-handle"></div>');e.jqGrid({datatype:"local",width:b.width(),shrinkToFit:!0,colNames:f,colModel:g,caption:"&nbsp;",altRows:!0,altclass:"repository-browser-list-altrow",resizeclass:"repository-browser-list-resizable",pager:h,viewrecords:!0,onPaging:function(){},loadError:function(){},ondblClickRow:function(){},gridComplete:function(){},loadComplete:function(){}});b.find(".ui-jqgrid-bdiv").height(c-
(b.find(".ui-jqgrid-titlebar").height()+b.find(".ui-jqgrid-hdiv").height()+b.find(".ui-jqgrid-pager").height()));e.click(function(){a.rowClicked.apply(a,arguments)});b.find(".ui-pg-button").unbind().find(">span.ui-icon").each(function(){var b=d(this).parent(),c=this.className.match(/ui\-icon\-seek\-([a-z]+)/)[1];a._pagingBtns[c]=b;b.addClass("ui-state-disabled").click(function(){d(this).hasClass("ui-state-disabled")||a._doPaging(c)})});b.find(".ui-pg-input").parent().hide();b.find(".ui-separator").parent().css("opacity",
0).first().hide();var r=e[0].p;b.find(".ui-jqgrid-view tr:first th div").each(function(b){!1!==r.colModel[b].sortable&&(d(this).css("cursor","pointer"),d(this).unbind().click(function(c){c.stopPropagation();a._sortList(r.colModel[b],this)}))});y(a,b);return e}function A(a,b){var c=a.element.attr("data-repository-browser",++m),e=x(a,c);e.resize();c.css("width",b.maxWidth);e.css("width",b.maxWidth);var d=w(a,e.find(".ui-layout-west"),e.height()),g=z(a,e.find(".ui-layout-center"),e.height()),h=e.layout({west__size:b.treeWidth-
1,west__minSize:0,west__maxSize:b.maxWidth,center__size:"auto",paneClass:"ui-layout-pane",resizerClass:"ui-layout-resizer",togglerClass:"ui-layout-toggler",onresize:function(a,b){"center"===a&&g.setGridWidth(b.width())}});c.hide();q();h.sizePane("west",b.treeWidth);c.resizable({autoHide:!0,minWidth:b.minWidth,minHeight:b.minHeight,maxWidth:b.maxWidth,maxHeight:b.maxHeight,handles:"all",resize:function(c,e){a._resizeHorizontal(b.maxWidth-e.size.width);a._resizeVertical(b.maxHeight-e.size.height);a._resizeInnerComponents()}});
p(e);c.mousedown(function(){t(a)});return{$elem:c,$grid:e,$tree:d,$list:g}}var j=d(window),o=0,k=[],l=99999,B={repositoryManager:null,repositoryFilter:[],objectTypeFilter:[],renditionFilter:["cmis:none"],filter:["url"],element:null,isFloating:!1,padding:50,maxHeight:1E3,minHeight:400,minWidth:660,maxWidth:2E3,treeWidth:300,listWidth:"auto",pageSize:10,adaptPageSize:!1,rowHeight:24,rootPath:"",rootFolderId:"aloha",columns:{icon:{title:"",width:30,sortable:!1,resizable:!1},name:{title:"Name",width:200,
sorttype:"text"},url:{title:"URL",width:220,sorttype:"text"},preview:{title:"Preview",width:150,sorttype:"text"}},i18n:{Browsing:"Browsing",Close:"Close","in":"in","Input search text...":"Input search text...",numerous:"numerous",of:"of","Repository Browser":"Repository Browser",Search:"Search","Searching for":"Searching for",Viewing:"Viewing"}},m=(new Date).getTime(),n=n.extend({opened:!1,grid:null,tree:null,list:null,_searchQuery:null,_orderBy:null,_currentFolder:null,_objs:{},_resizeInnerComponents:function(){var a=
this.grid.find(".repository-browser-tree-header"),b=this.grid.find(".ui-layout-center");this.tree.height(this.grid.height()-a.outerHeight(!0));b.find(".ui-jqgrid-bdiv").height(this.grid.height()-(b.find(".ui-jqgrid-titlebar").height()+b.find(".ui-jqgrid-hdiv").height()+b.find(".ui-jqgrid-pager").height()));this._adaptPageSize()&&this._currentFolder&&this._fetchItems(this._currentFolder)},_resizeVertical:function(a){a=a>0?Math.max(this.minHeight,this.maxHeight-a):this.maxHeight;this.element.height(a);
this.grid.height(a)},_resizeHorizontal:function(a){a=a>0?Math.max(this.minWidth,this.maxWidth-a):this.maxWidth;this.element.width(a);this.grid.width(a)},_onWindowResized:function(){this._resizeHorizontal(this.maxWidth-j.width()+this.padding);this._resizeVertical(this.maxHeight-j.height()+this.padding);this._resizeInnerComponents()},_clearSearch:function(){this.grid.find(".repository-browser-search-field").val(this._i18n("Input search text...")).addClass("repository-browser-search-field-empty");this._searchQuery=
null},_i18n:function(a){return this.i18n[a]||a},_adaptPageSize:function(){if(!this.adaptPageSize||!this.list||!this.rowHeight)return!1;var a=this.grid.find(".ui-jqgrid-bdiv").innerHeight()-20;return a&&(a=Math.floor(a/this.rowHeight),a<=0&&(a=1),a!==this.pageSize)?(this.pageSize=a,!0):!1},_constructor:function(){this.init.apply(this,arguments)},init:function(a){a.repositoryManager||d("body").trigger("repository-browser-error","Repository Manager not configured");var b=this,a=d.extend({},B,a,{i18n:s});
if(!a.element||0===a.element.length)a.isFloating=!0,a.element=u();b.manager=a.repositoryManager;b._objs={};b._searchQuery=null;b._orderBy=null;b._pagingOffset=0;b._pagingCount=void 0;b._pagingBtns={first:null,end:null,next:null,prev:null};d.extend(b,a);v(a.rootPath);a=A(b,a);b.grid=a.$grid;b.list=a.$list;b.tree=a.$tree;b.element=a.$elem;b.$_grid=b.grid;b.$_list=b.list;b._cachedRepositoryObjects=b._objs;b._adaptPageSize();b.close();j.resize(function(){b._onWindowResized()});if(b.manager)b._currentFolder=
b.getSelectedFolder(),b._fetchRepoRoot(b.jstree_callback);k.push(this);i.pub("repository-browser.initialized",{data:this})},harvestRepoObject:function(a){var b=++m;return this.processRepoObject(this._objs[b]=d.extend(a,{uid:b,loaded:!1}))},processRepoObject:function(a){var b="",c,e,f,g=this;switch(a.baseType){case "folder":b="folder";break;case "document":b="document"}a.type&&(c={rel:a.type,"data-rep-oobj":a.uid});e=a.hasMoreItems||"folder"===a.baseType?"closed":null;!1===a.hasMoreItems&&(e=null);
a.children&&(f=[],d.each(a.children,function(){f.push(g.harvestRepoObject(this));e="open"}));this._currentFolder&&this._currentFolder.id===a.id&&window.setTimeout(function(){g.tree.jstree("select_node",'li[data-rep-oobj="'+a.uid+'"]')},0);return{data:{title:a.name,attr:{"data-rep-oobj":a.uid},icon:b},attr:c,state:e,resource:a,children:f}},_processRepoResponse:function(a,b,c){var e=this,f=e._currentFolder&&e._currentFolder.id,g=[],h=null;"function"===typeof b&&(c=b,b=void 0);d.each(a,function(){g.push(e.harvestRepoObject(this));
f===this.id&&(h=this)});"function"===typeof c&&c.call(e,g,b);h&&window.setTimeout(function(){e.tree.jstree("select_node",'li[data-repo-obj="'+h.uid+'"]')},0)},_getObjectFromCache:function(a){if("object"===typeof a)return this._objs[a.find("a:first").attr("data-rep-oobj")]},queryRepository:function(a,b){var c=this;c.manager.query(a,function(a){c._processRepoResponse(a.results>0?a.items:[],{timeout:a.timeout,numItems:a.numItems,hasMoreItems:a.hasMoreItems},b)})},_listItems:function(a){var b=this,c=
this.list.clearGridData();d.each(a,function(){var a=this.resource;c.addRowData(a.uid,d.extend({id:a.id},b.renderRowCols(a)))})},_processItems:function(a,b){var c=this._pagingBtns;this._pagingCount=b&&"number"===typeof b.numItems?b.numItems:void 0;this.grid.find(".loading").hide();this.list.show();this._listItems(a);this._pagingOffset<=0?c.first.add(c.prev).addClass("ui-state-disabled"):c.first.add(c.prev).removeClass("ui-state-disabled");isNaN(this._pagingCount)?(c.end.addClass("ui-state-disabled"),
a.length<=this.pageSize?c.next.addClass("ui-state-disabled"):c.next.removeClass("ui-state-disabled")):this._pagingOffset+this.pageSize>=this._pagingCount?c.end.add(c.next).addClass("ui-state-disabled"):c.end.add(c.next).removeClass("ui-state-disabled");var e;0===a.length&&0===this._pagingOffset?e=c=0:(c=this._pagingOffset+1,e=c+a.length-1);var d="number"===typeof this._pagingCount?this._pagingCount:this._i18n("numerous");this.grid.find(".ui-paging-info").html(this._i18n("Viewing")+" "+c+" - "+e+" "+
this._i18n("of")+" "+d);b&&b.timeout&&this.handleTimeout()},_fetchSubnodes:function(a,b){var c=this;-1===a?c._fetchRepoRoot(b):a.each(function(){var a=c._getObjectFromCache(d(this));"object"===typeof a&&c.fetchChildren(a,b)})},_fetchRepoRoot:function(a){this.getRepoChildren({inFolderId:this.rootFolderId,repositoryFilter:this.repositoryFilter},function(b){"function"===typeof a&&a(b)})},_fetchItems:function(a){if(a){var b=this,c="string"===typeof this._searchQuery;b.list.setCaption(c?b._i18n("Searching for")+
" "+b._searchQuery+" "+b._i18n("in")+" "+a.name:b._i18n("Browsing")+": "+a.name);b.list.hide();b.grid.find(".loading").show();b.queryRepository({repositoryId:a.repositoryId,inFolderId:a.id,queryString:b._searchQuery,orderBy:b._orderBy,skipCount:b._pagingOffset,maxItems:b.pageSize,objectTypeFilter:b.objectTypeFilter,renditionFilter:b.renditionFilter,filter:b.filter,recursive:c},function(a,c){b._processItems(a,c)})}},fetchChildren:function(a,b){var c=this;(!0===a.hasMoreItems||"folder"===a.baseType)&&
!1===a.loaded&&c.getRepoChildren({inFolderId:a.id,repositoryId:a.repositoryId},function(e){c._objs[a.uid].loaded=!0;"function"===typeof b&&b(e)})},getRepoChildren:function(a,b){var c=this;c.manager.getChildren(a,function(a){c._processRepoResponse(a,b)})},_doPaging:function(a){switch(a){case "first":this._pagingOffset=0;break;case "end":this._pagingOffset=this._pagingCount%this.pageSize===0?this._pagingCount-this.pageSize:this._pagingCount-this._pagingCount%this.pageSize;break;case "next":this._pagingOffset+=
this.pageSize;break;case "prev":if(this._pagingOffset-=this.pageSize,this._pagingOffset<0)this._pagingOffset=0}this._fetchItems(this._currentFolder)},renderRowCols:function(a){var b={};d.each(this.columns,function(c){switch(c){case "icon":b.icon='<div class="repository-browser-icon repository-browser-icon-'+a.type+'"></div>';break;default:b[c]=a[c]||"--"}});return b},_sortList:function(a,b){this.grid.find("span.ui-grid-ico-sort").addClass("ui-state-disabled");a.sortorder="asc"===a.sortorder?"desc":
"asc";d(b).find("span.s-ico").show().find(".ui-icon-"+a.sortorder).removeClass("ui-state-disabled");this._setSortOrder(a.name,a.sortorder)._fetchItems(this._currentFolder)},_setSortOrder:function(a,b){var c=this._orderBy||[],d,f,g=!1,h,j,i={};i[a]=b||"asc";for(h=0,j=c.length;h<j;h++){f=c[h];for(d in f)if(f.hasOwnProperty(d)&&d===a){c.splice(h,1);c.unshift(i);g=!0;break}if(g)break}g&&c.unshift(i);this._orderBy=c;return this},rowClicked:function(a){var a=d(a.target).parent("tr"),b=null;a.length>0&&
(b=this._objs[a.attr("id")],this.onSelect(b));return b},treeNodeSelected:function(a){if(a=this._getObjectFromCache(a))this._pagingOffset=0,this._clearSearch(),this._currentFolder=a,this._fetchItems(a),this.folderSelected(a)},_triggerSearch:function(){var a=this.grid.find("input.repository-browser-search-field"),b=a.val();""===b||a.hasClass("repository-browser-search-field-empty")?b=null:""===b&&(b=null);this._pagingOffset=0;this._searchQuery=b;this._fetchItems(this._currentFolder)},getFieldOfHeader:function(a){return a.find("div.ui-jqgrid-sortable").attr("id").replace("jqgh_",
"")},setObjectTypeFilter:function(a){this.objectTypeFilter="string"===typeof a?[a]:a},getObjectTypeFilter:function(){return this.objectTypeFilter},show:function(){if(!this.opened){this.opened=!0;var a=this.element;this.isFloating?(p(d("body")),d(".repository-browser-modal-overlay").stop().css({top:0,left:0}).show(),a.stop().show().css({left:j.scrollLeft()+this.padding/2,top:j.scrollTop()+this.padding/2}).draggable({handle:a.find(".repository-browser-grab-handle")}),this.grid.css({marginTop:0,opacity:0}).animate({marginTop:0,
opacity:1},1500,"easeOutExpo",function(){d.browser.msie&&d(this).add(a).css("filter","progid:DXImageTransform.Microsoft.gradient(enabled = false)")})):a.stop().show().css({opacity:1,filter:"progid:DXImageTransform.Microsoft.gradient(enabled = false)"});this._onWindowResized();this.element.resize();o++}},open:function(){this.show()},close:function(){if(this.opened)this.opened=!1,this.element.fadeOut(250,function(){d(this).css("top",0).hide();(0===o||0===--o)&&q()})},refresh:function(){this._currentFolder&&
this._fetchItems(this._currentFolder)},folderOpened:function(a){(a=this._getObjectFromCache(a))&&this.manager.folderOpened(a)},folderClosed:function(a){(a=this._getObjectFromCache(a))&&this.manager.folderClosed(a)},folderSelected:function(a){this.manager.folderSelected(a)},getSelectedFolder:function(){if("function"===typeof this.manager.getSelectedFolder)return this.manager.getSelectedFolder()},destroy:function(){},onSelect:function(){},handleTimeout:function(){}});d(function(){var a=d('<div class="repository-browser-modal-overlay" style="z-index: '+
l+';"></div>');d("body").append(a);a.click(function(){d.each(k,function(a,c){c.close()})})});return n}"function"===typeof define?(define("repository-browser-i18n-de",[],function(){return{Browsing:"Durchsuchen",Close:"Schließen","in":"in","Input search text...":"Suchtext einfügen...",numerous:"zahlreiche",of:"von","Repository Browser":"Repository Browser",Search:"Suchen","Searching for":"Suche nach",Viewing:"Anzeige","button.switch-metaview.tooltip":"Zwischen Metaansicht und normaler Ansicht umschalten"}}),
define("repository-browser-i18n-en",[],function(){return{Browsing:"Browsing",Close:"Close","in":"in","Input search text...":"Input search text...",numerous:"numerous",of:"of","Repository Browser":"Repository Browser",Search:"Search","Searching for":"Searching for",Viewing:"Viewing","button.switch-metaview.tooltip":"Switch between meta and normal view"}}),define("RepositoryBrowser",["jquery","Class","PubSub","repository-browser-i18n-"+(window&&window.__DEPS__&&window.__DEPS__.lang||"en"),"jstree",
"jqgrid","jquery-layout"],i)):window.Browser=i(window.jQuery,window.Class,{pub:function(){}})})();