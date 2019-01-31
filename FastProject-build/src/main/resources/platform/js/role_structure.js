//给角色关联库权限和表权限***********************************************************

var roleIdForDBAuth;//给角色分配库权限时,角色id****
var dbIdForTable;//查看角色下的某个可读库中的表, 需要这个dbId;***
var pageRowNum = 10;
var pageRowList = [10,20,30];
$(function() {
	//控制消息显示时长**********
	toastr.options={
		hideDuration:500,
		positionClass:"toast-top-center",
		timeOut:800,
	}
	
	//新增库权限*******************************
	$("#databaseAuth").click(function  () {
		var ids = $("#rolesList").jqGrid('getGridParam', 'selarrrow');
		if(ids.length != 1) {
			toastr.warning("请选择一个角色!");
			return;
		}
		roleIdForDBAuth = ids[0];//把roleId赋给全局变量,用于readOrWrite方法
		reloadShowAllDataBase(ids[0]);//重新载入
		showDataBaseWindow();		//打开窗口
		showAllDataBase(ids[0]);	//展示所有数据库
	});
	
	//新增表权限******************************
	$("#tableAuth").click(function  () {
		var ids = $("#rolesList").jqGrid('getGridParam', 'selarrrow');
		if(ids.length != 1) {
			toastr.warning("请选择一个角色!");
			return;
		}
		roleIdForDBAuth = ids[0];//把roleId赋给全局变量,用于readOrWrite方法
		reloadDataBaseTable(ids[0]);//重新载入
		showTableWindow();//打开窗口
		populateDataBaseTable();//展示当前role已经配置好的可读库
	});
	
	//事件委托
	//数据库读写权限分配 的单击事件***************************
	$("#databaseList").on("click",".checkbox",readOrWrite);
	//可读库下的表的单击事件**************
	$("#tables").on("click",".tableRead",readTabels);
	
	//绑定普通页面查询框体点击事件**************************
    $(".Middle").on("click","#commonSearchBtn",commonInputSearch);

	//绑定查询框回车事件**********************************
    $(".Middle").on("keyup","#commonSearchInput",function(event){
        if(event.keyCode == 13){
            commonInputSearch();
        }
    });

	//绑定"查询全部"点击事件**************************
    $(".Middle").on("click","#commonSearchAll",commonInputSearchAll);

});

//*********************页面展示区***************************************

//打开数据库列表窗口**************
function showDataBaseWindow () {
	$('#database').show();
	$('#database').window({
		title:"请给当前角色配置数据库读写权限", 
		width:900, height:500, modal:true
	});
}
//打开窗口, 给可读库下的表配置权限**********
function showTableWindow(){
	$('#dataBaseTable').show();
	$('.Middle').hide();//把右边栏隐藏起来 
	$('#dataBaseTable').window({ 
		title: "给可读库下的表配置权限", maximized: true, modal:true 
	}); //maximized :面板最大化
}

//*********************方法区******************************************

//分配库权限的窗口, 每次都要刷新***********
//避免上一个role的读写状态有残留显示
function reloadShowAllDataBase (roleId){
	$("#databaseList").jqGrid('setGridParam',{
		url: contextPath + "/db/authority/database/checked/role/"+roleId,
		datatype : 'json',
	}).trigger('reloadGrid');//重新载入
}

//打开数据库列表窗口后, 填充数据**************
function showAllDataBase (roleId) {
	allDBList =  $("#databaseList").jqGrid({
		url: contextPath + "/db/authority/database/checked/role/"+roleId,
		datatype: "json",
		width: 850,
        height:300,
        // height:document.body.clientHeight-230,
		mtype: "GET",
		multiselect: false,
		colNames: [ "id","数据库IP","数据库实例名","数据库别名","读权限","写权限","选择权限"],
		colModel: [
			{ name: "id", index:"id",hidden: true},
			{ name: "ipAddr", index:"ipAddr", align:"center", sortable: true},
			{ name: "instName", index:"instName", align:"center", sortable: true},
			{ name: "nickName", index:"nickName", align:"center", sortable: true},
			
			{ name: "read", index:"read",hidden: true,			},
			{ name: "write", index:"write",hidden: true,			},
			{ name: "id", index:"id", align:"center", sortable: false,
				//value 当前单元格的值, rows当前行的值, 其余两个是jqGrid定义的
				formatter: function (value, grid, rows, state) { 
					if(rows.read){
						var read ='<label>'+'可读<input type="checkbox" id="'+value+'"  value="read" class="checkbox" checked="checked"/>' +'</label>  ';
					}else{
						var read ='<label>'+'可读<input type="checkbox" id="'+value+'"  value="read" class="checkbox" />' +'</label>  ';
					}
					
					if(rows.write){
						var write ='  <label>' +'可写<input type="checkbox" id="'+value+'"  value="write" class="checkbox" checked="checked"/>' +'</label>  ';
					}else{
						var write ='  <label>' +'可写<input type="checkbox" id="'+value+'"  value="write" class="checkbox"/>' +'</label>  ';
					}
					return	read + write;
				},
			},
		],
		pager: "#databasePager",
		rowNum: 7,
		rowList: [7,14,21],
		sortname:"nickName",
		sortorder:"desc",
		viewrecords: true,
		gridview: true,
		autoencode: true,
	});
}

//点击checkbox事件, 获取数据库id 和 读写标识***********
function readOrWrite (){
	var readOrWrite = $(this).attr("value");	//读写标识 read / write 
	var databaseId = $(this).attr("id");		//数据库id
	var flag = $(this).is(':checked');			//判断是否被选中了
//	console.isShowlog("readOrWrite:"+readOrWrite);
//	console.isShowlog("当前roleid:"+roleIdForDBAuth);
//	console.isShowlog("数据库id:"+databaseId);
//	console.isShowlog("flag:"+flag);
	if( (readOrWrite == "" ) || (readOrWrite == null)){
		toastr.warning('好像出现异常了!');
		return ;
	}
	//为当前role设置数据库的 "读/写"权限
	setRoleDataBaseAuth( readOrWrite, databaseId, flag );
}

//为当前role设置数据库的 "读/写"权限****************
function setRoleDataBaseAuth ( readOrWrite, databaseId, flag ) {
	$.ajax({
		type: "PUT",
		url: contextPath + "/db/authority/role/"+readOrWrite,
		dataType: "json",
		data:{
			"roleId" : roleIdForDBAuth,
			"databaseId" : databaseId,
			"checked" : flag
		},
		success: function(returnData) {
			if(returnData.statusCode <= 200){
				toastr.success(returnData.statusText);
			}else if((returnData.statusCode >=400) && (returnData.statusCode <500) ){
				toastr.warning(returnData.statusText);
			}else if(returnData.statusCode >= 500){
				toastr.error(returnData.statusText);
			}
		},
		error:function(){
			toastr.warning('好像出现异常了!');
		}
	});
}

//-----------------------------------------------------------------------------------------
//给可读库下的表配置权限, 先展示当前role下的可读库**********

//每次都重新载入
function reloadDataBaseTable (roleId){
	$("#dbs").jqGrid('setGridParam',{
		url: contextPath + "/db/authority/database/read/role/"+roleIdForDBAuth,
		datatype : 'json',
	}).trigger('reloadGrid');//重新载入
}

function populateDataBaseTable (){
	dataBaseForTable = $("#dbs").jqGrid({
		url: contextPath + "/db/authority/database/read/role/"+roleIdForDBAuth,
        datatype: "json",
        autowidth: true,
        height:document.body.clientHeight-230,
        mtype: "GET",
        colNames: [ "id","数据库名称","数据库别名","ip","端口","实例名"],
        colModel: [
        	{ name: "id", index:"id",hidden: true},
			{ name: "userName", index:"userName", align:"center", sortable: false},
			{ name: "nickName", index:"nickName", align:"center", sortable: false},
			{ name: "ipAddr", index:"ipAddr", align:"center", sortable: false},
			{ name: "port", index:"port", align:"center", sortable: false},
			{ name: "instName", index:"instName", align:"center", sortable: false},
        ],
        //双击行的时候触发,右边栏显示 , rowid是当前行的id(0,1,2,3...)
        
        //右边栏上有搜索条件, 在这里双击的时候, 也会带上, 变成后台QueryParams参数中的值
        ondblClickRow:function(rowid){	
        	$(".Middle").show();
        	var rowData = $(this).getRowData(rowid);
//        	console.isShowlog(rowData);
        	dbIdForTable = rowData.id;  //把当前数据库id , 赋给全局变量
        	reloadTables(rowData.id); //每次点击都重新载入, 当前数据库下所有的表
        	showTableOfDataBase(rowData.id); //展示当前可读库下的所有的表
        },
        pager:"#dbsPage",
        rowNum: pageRowNum,
        rowList: pageRowList,
        viewrecords: true,//显示总记录数
        gridview: true,
        autoencode: true,
        caption: "当前角色的可读库------(双击选中)",
        sortname: "",
		sortorder: "asc",
    });
}
//当前可读库下的表,  每次都要刷新***********
function reloadTables (dbId){
	$("#tables").jqGrid('setGridParam',{
		url: contextPath + "/db/authority/tableForRole/checked/"+dbId+"/"+roleIdForDBAuth,
		datatype : 'json',
		//右边栏上有搜索条件, 在这里双击的时候, 也会带上, 变成后台QueryParams参数中的值, 这里清空
		postData:{filters:null},
	}).trigger('reloadGrid');//重新载入
}
//展示当前可读库下的所有表*******************
function showTableOfDataBase (dbId){
    var $dom='<li>表名： <input type="text" id="commonSearchInput"></li>' +
			 '<li><input type="button" id="commonSearchBtn" value="   查询   " style="margin-left: 10px" /></li>' +
			 '<li><input type="button" id="commonSearchAll" value="查询全部" style="margin-left: 10px"/></li>';
//	console.isShowlog("dbId:"+dbId);
//	console.isShowlog("roleId:"+roleIdForDBAuth);
	tables =  $("#tables").jqGrid({
		url: contextPath + "/db/authority/tableForRole/checked/"+dbId+"/"+roleIdForDBAuth,
		datatype: "json",
		mtype: "GET",
		autowidth:true,
        height:document.body.clientHeight-230,
		multiselect: false,
		colNames: [ "id","表名","备注名","可读权限"],
		colModel: [
			{ name: "id", index:"id",hidden: true},
			{ name: "tableName", index:"tableName", align:"center", sortable: true},
			{ name: "comment", index:"comment", align:"center", sortable: true},
			{ name: "tableName", index:"tableName", align:"center", sortable: false,
				formatter: function (value, grid, rows, state) { //value 当前单元格的值, rows当前行的值, 其余两个是jqGrid定义的
					var read = (rows.checked) ?
					('<label>可读 <input type="checkbox" name="'+value+'" class="tableRead" checked="checked"/></label>') :
					('<label>可读 <input type="checkbox" name="'+value+'" class="tableRead" /></label>');
					return	read;
				},
			},
		],
		pager: "#columnsPage",
		rowNum: pageRowNum,
		rowList: pageRowList,
		sortname:"tableName",
		sortorder:"asc",
		viewrecords: true,
		gridview: true,
		autoencode: true,
        caption:$dom
	});
}
//当前role的可读库中的表, 绑定单击事件 , 设置是否可读**********
function readTabels (){
	var tableName= $(this).attr("name");	//表名
	var flag = $(this).is(':checked');		//判断是否被选中了
//	console.isShowlog("tableName:"+tableName);
//	console.isShowlog("flag:"+flag);
	setTabelAuthToRead( tableName, flag ); //为当前表设置读权限
}

//为当前表设置读权限********
function setTabelAuthToRead( tableName, flag ) {
	$.ajax({
		type: "PUT",
		url: contextPath + "/db/authority/role/table",
		dataType: "json",
		data:{
			"roleId" : roleIdForDBAuth,
			"databaseConfigId" : dbIdForTable,
			"tableName" : tableName,
			"checked" : flag
		},
		success: function(returnData) {
			if(returnData.statusCode <= 200){
				toastr.success(returnData.statusText);
			}else if((returnData.statusCode >=400) && (returnData.statusCode <500) ){
				toastr.warning(returnData.statusText);
			}else if(returnData.statusCode >= 500){
				toastr.error(returnData.statusText);
			}
		},
		error:function(){
			toastr.warning('好像出现异常了!');
		}
	});
}

//普通框体查询
function commonInputSearch(){
	var commonSearchInputValue = $("#commonSearchInput").val();
	var rules = [];
	if(commonSearchInputValue != ""){
		rules.push({"field":"tableName","op":"cn","data":commonSearchInputValue});
	}else{
		return;
	}
	var filters = {"groupOp":"AND","rules":rules};
	tables.jqGrid("setGridParam", {
		postData: {filters:JSON.stringify(filters)},
		page: 1
	}).trigger("reloadGrid");
}

function commonInputSearchAll(){
	//把filters清空后, 传到后台
	var filters = new Array();
	tables.jqGrid("setGridParam", {
		postData: {filters:null},
		page: 1
	}).trigger("reloadGrid");
}
