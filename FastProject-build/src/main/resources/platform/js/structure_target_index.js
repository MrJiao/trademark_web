//结构化目标库设置js**************************************************

//配置成功的源******************
var halfList;

//展示所有的目标数据库***********
var targetDBList;

//映射字段**********************
var Mapping ={};

//映射表名**********************
var tableMapping ={};

//有源且有目标的事件(一个或者多个),叫做任务**********
var task;

//保存需要交换的SingleTableSwitchConfig的ids
var fromIds =[];

//保存需要交换目标表名***********
var targetNames =[];

//判断是复制,还是聚合, 还是分发***
var targetType;

$(function() {
	//控制消息显示时长**********
	toastr.options={
		hideDuration:500,
		positionClass:"toast-top-center",
		timeOut:800,
	}

	//展示配置完成的任务******************************************
	task = $("#eventList").jqGrid({
		url: contextPath + "/singleTableSwitch/showTask", //请求
		datatype: "json", //返回类型
		autowidth: true, //自动宽度
        height:document.body.clientHeight-230,
		mtype: "GET",
		multiselect: true, //多选
		colNames: ["ID", "任务名称","创建人", "任务详情","创建时间",],
		colModel: [
			{name: "id",	  index: "id",	hidden: true,	sortable:false,},
			{name: "taskName",hidden: false,sortable:false,align: "center",},
			{name: "userInfo",hidden: false,sortable:false,align: "center",
				//value 当前单元格的值, rows当前行的值, 其余两个是jqGrid定义的
				//优先显示昵称 , 如果昵称为空, 再显示userName
				formatter: function (value, grid, rows, state) { 
					if(value.nickName == null){
						return value.username;
					}else{
						return value.nickName;
					}
				},
			},
			{name: "singleTableSwitchConfigSet",hidden: false,sortable:false,align: "center",
				formatter: function (value, grid, rows, state) { 
					//给全局变量tableMapping增加一个rows.id属性, 属性值是value
					console.log(value);
					
					tableMapping[rows.id] = value;
					return '<a href="javascript: ;" style="color:#47a8ea"'+
						' class="tableNameMapping" name="'+rows.id+'" >点击查看详情</a>'
				},
			},
			{name: "createDate",width: 200,index: "createDate",align: "center",
				searchoptions: {dataInit: PlatformUI.defaultJqueryUIDatePick},
				sortable: true,
				formatter: "date",
				formatoptions: {srcformat: "U",	newformat: "Y-m-d H:i:s"}
			},
		],
		pager: "#eventPager",
		rowNum: 10,
		rowList: [10, 20, 30],
		sortname: "createDate",
		sortorder: "desc",
		viewrecords: true,
		gridview: true,
		autoencode: true,
		caption: "已配置成功的任务, 请去交换页处理"
	});
	
	
	//绑定刷新事件**********************************
	$("#commonRefreshBtn").click(function() {
		location.href = location;
	});
	
	//绑定 新增配置(目标库)事件**********************************
	$("#target").click(function() {
		//重新加载 willdo
		
		showHalfEventListWindow();
	});
	
	//删除 任务按钮  *********************************************************
	$("#deleteTask").click(function() {
		var ids = task.jqGrid('getGridParam', 'selarrrow');
		if(ids.length == 0) {
			toastr.warning("请选择一条或多条 需要删除的数据!");
			return;
		}
		//批量删除ajax
		$.messager.confirm('操作', '请确认删除数据', function(r) {
			if(r) {
				jQuery.ajax({
					type: "GET",
					url: contextPath + "/singleTableSwitch/deleteTask",
					data: {
						"ids": ids,
					},
					success: function(returnData) {
						if(returnData.statusCode <= 200){
							toastr.success(returnData.statusText);
							location.href = location;
						}else if((returnData.statusCode >=400) && (returnData.statusCode <500) ){
							toastr.warning(returnData.statusText);
						}else if(returnData.statusCode >= 500){
							toastr.error(returnData.statusText);
						}
					},
					error: function(xhr,status,error) {
						toastr.warning("删除失败, 请联系管理员");
					},
					traditional: true
				});
			}
		});
	});
	
	//去选择目标数据库**********************************
	//一库多表 复制到 另一库多表
	$("#copy").click(function() {
		validateEvent();//先校验这些事件
	});
	
	//开始聚合****************************************
	//多库一表 聚合到 一库一表
	$("#together").click(function() {
		validateTogether();
	});
	
	//开始分发****************************************
	//一库一表 分发到 多库一表
	$("#distribute").click(function() {
		validateDistributeEvent();
	});
	
	//"选中此目标数据库" 按钮的单击事件**********************************
	//分三种情况, 复制(只能选一个库),分发(选多个库)
	$("#sure").click(function() {
		var taskName =$("#targetName").val().trim();
		if(taskName == "" || null){
			toastr.warning("请填写任务名称");
			return ;
		}
		var ids = targetDBList.jqGrid ('getGridParam', 'selarrrow');
		if (targetType == "Copy") {
			//获取选中行的id
			if(ids.length != 1){
				toastr.warning("复制时, 请选择一个数据库!");
				return;
			}
			saveCopyTask(ids[0],taskName);
		}else if(targetType == "Distribute"){
			if(ids.length == 0){
				toastr.warning("分发时,可以选择多个数据库!");
				return;
			}
			saveDistributeTask(ids,taskName);
		}else if( targetType ="Together"){
			if(ids.length != 1){
				toastr.warning("聚合时, 请选择一个数据库!");
				return;
			}
			saveCopyTask(ids[0],taskName);
		}
	});
	
	//映射字段详情 的单击事件**************************************************************
	//事件委托
	$("#halfEventList").on("click",".mappingDetail",showMapping);
	function showMapping(){
		//通过当前a标签, 拿到全局变量Mapping的属性, 和属性值
		var index = $(this).attr("name");
		showMappingTable(Mapping[index]);
	}
	
	//映射tableName详情 的单击事件**************************************************************
	//事件委托
	$("#eventList").on("click",".tableNameMapping",tableNameMapping);
	function tableNameMapping(){
		//通过当前a标签, 拿到全局变量tableMapping的属性, 和属性值
		var index = $(this).attr("name");
		showTableNameMapping(tableMapping[index]);
	}

});

//<---------------------------------------方法区--------------------------------------------->

//显示隐藏的窗口****************************************************************************
function showHalfEventListWindow(){
	$('#sourceList').show();
	$('#sourceList').window({
		title: "已配置的源事件列表",
		width:500,
	    height:500,
	    maximized: true,//面板最大化
	    modal:true
	});
	showHalfEventList();
}

//展示所有配置成功的源(也叫配置了一半的事件)************************************************
function showHalfEventList(){
	halfList = $("#halfEventList").jqGrid({
		url: contextPath + "/singleTableSwitch/showHalf",
		datatype: "json", //返回类型
		autowidth: true, //自动宽度
        height:document.body.clientHeight-230,
		mtype: "GET",
		multiselect: true, //多选
		colNames: ["ID", "源数据库名","源表名","目标表名(可修改)","映射字段","备忘名"],
		colModel: [
			{name: "id",index: "id",hidden: true},
			{name: "databaseConfig.nickName", width:"70",sortable:false,align:"center",},
			{name: "fromTableName",sortable:false,align:"center",},//源表名
			//目标表名(源表名肯定唯一, 所以可以赋给id)
			{name: "fromTableName",index: "fromTableName",sortable:false,align:"center",
				formatter: function (value, grid, rows, state) { 
					return '<input class="toTableName " '
					+'placeholder="请填写目标表名" value="'+value+'" id="'+value+'"/>';
				},
			},
			{name: "columnMappingList",sortable:false,width:"70",align:"center",
				formatter: function (value, grid, rows, state) { 
					Mapping[rows.id] = value;
					return '<a href="javascript: ;" style="color:#47a8ea" '+
					' class="mappingDetail" name="'+rows.id+'" >点击查看详情</a>'
				},
			},
			{name: "remarks",sortable:false,align:"center"},//备忘名
		],
		gridComplete: function() {
			//设置样式
			$(".toTableName").css("width","90%");
        },
		pager: "#halfEventPager",
		rowNum: 30,
		rowList: [30,50,70,100],
		viewrecords: true,
		gridview: true,
		autoencode: true,
	});
}

//复制事件.....展示admin给当前用户配好的可写库之前
//先要校验这些事件 *******************************************************************
function validateEvent(){
	var ids = halfList.jqGrid('getGridParam', 'selarrrow');
	if(ids.length == 0) {
		toastr.warning("请选择一条或多条事件!");
		return;
	}
	//校验目标表名是否填写完整
	var flag = true ;
	$(".toTableName").each(function(){
		var value = $(this).val().trim();
		if(value == ""){
			flag = false;//直接return, 没什么用, 循环还是会继续执行
		}
	});
	if( !flag ){
		toastr.warning("请将目标表名填写完整!");
		return ;
	}
	
	//两条及以上数据的时候,	//1.需要判断是否都属于同一个源数据库
	//2.如果同一个数据库, 还要判断目标表名是否一致,一致则报错
	if(ids.length >=2 ){
		//把多条数据的'源数据库名'放到一个数组中, 然后拼成一个字符串
		var tempNickName = [];
		for( var i=0 ; i<ids.length ; i++ ){
			//获取某一行的数据(传入表格的id,和某一行的id)
			var rowData = $("#halfEventList").getRowData(ids[i]);
//			console.isShowlog(rowData);
			//用这种方式获取对象的属性,棒棒哒
			tempNickName.push(rowData["databaseConfig.nickName"]);
		}
//		console.isShowlog(tempNickName);
		//然后把数组变成字符串
		var tempNickNameStr = JSON.stringify(tempNickName);
		
		//然后判断 多条数据的'源数据库名', 第一次和最后一次出现的位置,是否一致, 
		//如果一致, 说明它只出现了一次, 在多条数据的前提下, 它肯定和别的不一样,则报错
		for( var i=0 ; i<ids.length ; i++ ){
			if(tempNickNameStr.indexOf(tempNickName[i]) == tempNickNameStr.lastIndexOf(tempNickName[i]) ){
				toastr.warning("复制时, 仅支持选择同一个库下的多张表");
				return;
			}
		}
		
		//走到这里, 说明多条数据是同一个数据库, 那么表名不能相同,使用上面的原理
		var tempTableName = [];
		var tableNames = $('.toTableName');
		for( var i=0 ; i<tableNames.length ; i++ ){
//			console.isShowlog( $(tableNames[i]).val().trim() );
			tempTableName.push($(tableNames[i]).val().trim());
		}
		var tempTableNameStr = JSON.stringify(tempTableName);
//		console.isShowlog( tempTableNameStr );
		for( var i=0 ; i<tableNames.length ; i++ ){
			if(tempTableNameStr.indexOf(tempTableName[i]) != tempTableNameStr.lastIndexOf(tempTableName[i]) ){
				toastr.warning("同一个库, 表名不能相同");
				return;
			}
		}
	}
	
	//开始给targetNames数组赋值前,需要先清空,以免上一次和这一次的值会累加
	targetNames.splice(0,targetNames.length);
	
	for( var i=0 ; i<ids.length ; i++ ){
		var rowData = $("#halfEventList").getRowData(ids[i]);//获取某一行的数据(传入表格的id,和某一行的id)
		//得到一个这样的字符串(<input class="toTableName "  value="ROLE" id="ROLE" >)
//		console.isShowlog(rowData.fromTableName);
		
		//把字符串多次截取,得到id
		var result = rowData.fromTableName.split('id="');
		result = result[1].split('"');
//		console.isShowlog(result[0] );
//		console.isShowlog( $("#"+result[0]+"").val() );
		//字母、数字、下划线(_)  ,数组不能开头
		var reg = new RegExp(/^[A-z]+\w*$/);
		if(!reg.test( $("#"+result[0]+"").val().trim().toUpperCase() ) ) {
			toastr.warning("目标表名只能由数字字母下划线组成,且不以数字开头!");
			return ;
		}
		//把目标表名tempTableName赋值给全局变量,这里需要大写
		targetNames.push($("#"+result[0]+"").val().trim().toUpperCase());
	}
	
	//把源的ids赋值给全局变量
	fromIds = ids;
	
	$('#targetDBWindow').show();
	$('#targetDBWindow').window({
		title: "目标数据库列表",
		width:500,
	    height:500,
	    modal:true
	});
	//设置类型为复制;
	targetType ="Copy"
	//展示所有的目标数据库
	populateTargetDB();
}

//展示所有的目标数据库**************************************************************
function populateTargetDB(){
	targetDBList =  $("#targetDBList").jqGrid({
        url: contextPath + "/db/authority/database/write",
        datatype: "json",
        width: 450,
        height:document.body.clientHeight-230,
        mtype: "GET",
        multiselect: true,
        colNames: ["ID","数据库别名"],
        colModel: [
            { name: "id", index:"id",hidden: true},
			{ name: "nickName", index:"nickName", align:"center", sortable: false },
        ],
        pager: "#targetDBPager",
        rowNum: 10,
        rowList: [10, 20, 30],
        viewrecords: true,
        gridview: true,
        autoencode: true,
	});
	//每次进来 , 就清除上一次选中的状态
	$("#targetDBList").jqGrid('resetSelection');
	$("#targetName").val("");
}

//"聚合"与"复制" ***********************************************************
//把任务(由一个或者多个事件(SingleTableSwitchConfig)组成)保存到数据库中
function saveCopyTask(targetDataBaseId,taskName){
//	console.isShowlog("目标数据库id:"+targetDataBaseId);....
//	console.isShowlog(fromIds);
//	console.isShowlog(targetNames);
//	console.isShowlog(taskName);
	jQuery.ajax({
		type: "GET",
		url: contextPath + "/singleTableSwitch/saveTaskConfig",
		data: {
			"targetDbIds": targetDataBaseId,
			"fromIds": fromIds,
			"targetNames": targetNames,
			"taskName": taskName,
		},
		success: function(returnData) {
			if(returnData.statusCode <= 200){
				toastr.success(returnData.statusText);
				//需要关闭当前目标库窗口, 和源事件列表窗口, 并且刷新主页面
				$('#targetDBWindow').window('close');
				$('#sourceList').window('close');
				PlatformUI.refreshGrid(task);
				
			}else if((returnData.statusCode >=400) && (returnData.statusCode <500) ){
				toastr.warning(returnData.statusText);
			}else if(returnData.statusCode >= 500){
				toastr.error(returnData.statusText);
			}
		},
		error: function(xhr,status,error) {
			toastr.warning('保存失败, 请重试或者联系管理员');
		},
		traditional: true
	});
}

//"分发"********************************************************************
function saveDistributeTask(targetDbIds,taskName){
	jQuery.ajax({
		type: "GET",
		url: contextPath + "/singleTableSwitch/saveDistributeTask",
		data: {
			"targetDbIds": targetDbIds,
			"fromIds": fromIds,
			"targetTableNames": targetNames,
			"taskName": taskName,
		},
		success: function(returnData) {
			if(returnData.statusCode <= 200){
				toastr.success(returnData.statusText);
				//需要关闭当前目标库窗口, 和源事件列表窗口, 并且刷新主页面
				$('#targetDBWindow').window('close');
				$('#sourceList').window('close');
				PlatformUI.refreshGrid(task);
			}else if((returnData.statusCode >=400) && (returnData.statusCode <500) ){
				toastr.warning(returnData.statusText);
			}else if(returnData.statusCode >= 500){
				toastr.error(returnData.statusText);
			}
		},
		error: function(xhr,status,error) {
			toastr.warning('保存失败, 请重试或者联系管理员');
		},
		traditional: true
	});
}


//验证分发事件***********************************************************************
//逻辑和 validateEvent() 方法一致
function validateDistributeEvent(){
	var ids = halfList.jqGrid('getGridParam', 'selarrrow');
	if(ids.length != 1) {
		toastr.warning("分发时, 请选择一条源事件!");
		return;
	}
	//校验目标表名是否填写完整
	var flag = true ;
	$(".toTableName").each(function(){
		var value = $(this).val().trim();
		if(value == ""){
			flag = false;//直接return, 没什么用, 循环还是会继续执行
		}
	});
	if( !flag ){
		toastr.warning("请将目标表名填写完整!");
		return ;
	}
	//开始给targetNames数组赋值前,需要先清空,以免上一次和这一次的值会累加
	targetNames.splice(0,targetNames.length);
	
	var rowData = halfList.getRowData(ids[0]);//获取某一行的数据(传入表格的id,和某一行的id)
	//得到一个这样的字符串(<input class="toTableName " value="ROLE" id="ROLE" >)
//		console.isShowlog(rowData.fromTableName);
	
	//把字符串多次截取,得到id
	var result = rowData.fromTableName.split('id="');
	result = result[1].split('"');
	
	//字母、数字、下划线(_)  ,数组不能开头
	var reg = new RegExp(/^[A-z]+\w*$/);
	if(!reg.test( $("#"+result[0]+"").val().trim().toUpperCase() ) ) {
		toastr.warning("目标表名只能由数字,字母,下划线 组成,且不以数字开头!");
		return ;
	}
	
	//把目标表名tempTableName赋值给全局变量,这里需要大写
	targetNames.push($("#"+result[0]+"").val().trim().toUpperCase());
	
	//把源的ids赋值给全局变量
	fromIds = ids;
	$('#targetDBWindow').show();
	$('#targetDBWindow').window({
		title: "目标数据库列表",
		width:500,
	    height:500,
	    modal:true
	});
	//设置类型为分发;
	targetType ="Distribute"
	//展示所有的目标数据库
	populateTargetDB();
}

//验证聚合事件***********************************************************************
function validateTogether(){
	var ids = halfList.jqGrid('getGridParam', 'selarrrow');
	if(ids.length < 2) {
		toastr.warning("聚合时,至少需要两条事件");
		return;
	}
	//校验目标表名是否填写完整
	var flag = true ;
	$(".toTableName").each(function(){
		var value = $(this).val().trim();
		if(value == ""){
			flag = false;//直接return, 没什么用, 循环还是会继续执行
		}
	});
	if( !flag ){
		toastr.warning("请将目标表名填写完整!");
		return ;
	}
	
	//1.判断是否都各自属于不同的数据库, 如果有相同, 则报错
	//2.如果同一个数据库, 还要判断目标表名是否一致,一致则报错
	//把多条数据的'源数据库名'放到一个数组中, 然后拼成一个字符串
	var tempNickName = [];
	for( var i=0 ; i<ids.length ; i++ ){
		//获取某一行的数据(传入表格的id,和某一行的id)
		var rowData = $("#halfEventList").getRowData(ids[i]);
//			console.isShowlog(rowData);
		//用这种方式获取对象的属性,棒棒哒
		tempNickName.push(rowData["databaseConfig.nickName"]);
	}
//		console.isShowlog(tempNickName);
	//然后把数组变成字符串
	var tempNickNameStr = JSON.stringify(tempNickName);
	
	//然后判断 多条数据的'源数据库名', 第一次和最后一次出现的位置,是否一致, 
	//如果一致, 说明它只出现了一次, 正确
	for( var i=0 ; i<ids.length ; i++ ){
		if(tempNickNameStr.indexOf(tempNickName[i]) != tempNickNameStr.lastIndexOf(tempNickName[i]) ){
			toastr.warning("聚合时,需要每条事件属于不同的数据库...");
			return;
		}
	}
		
	//目标表名必须相同,使用上面的原理
	var tempTableName = [];
	var tableNames = $('.toTableName');
	for( var i=0 ; i<tableNames.length ; i++ ){
//			console.isShowlog( $(tableNames[i]).val().trim() );
		tempTableName.push($(tableNames[i]).val().trim());
	}
	var tempTableNameStr = JSON.stringify(tempTableName);
//		console.isShowlog( tempTableNameStr );
	for( var i=0 ; i<tableNames.length ; i++ ){
		if(tempTableNameStr.indexOf(tempTableName[i]) == tempTableNameStr.lastIndexOf(tempTableName[i]) ){
			toastr.warning("聚合时, 目标表名必须相同");
			return;
		}
	}
	
	//开始给targetNames数组赋值前,需要先清空,以免上一次和这一次的值会累加
	targetNames.splice(0,targetNames.length);
	for( var i=0 ; i<ids.length ; i++ ){
		var rowData = $("#halfEventList").getRowData(ids[i]);//获取某一行的数据(传入表格的id,和某一行的id)
		//得到一个这样的字符串(<input class="toTableName "  value="ROLE" id="ROLE" >)
//		console.isShowlog(rowData.fromTableName);
		
		//把字符串多次截取,得到id
		var result = rowData.fromTableName.split('id="');
		result = result[1].split('"');
//		console.isShowlog(result[0] );
//		console.isShowlog( $("#"+result[0]+"").val() );
		//字母、数字、下划线(_)  ,数组不能开头
		var reg = new RegExp(/^[A-z]+\w*$/);
		if(!reg.test( $("#"+result[0]+"").val().trim().toUpperCase() ) ) {
			toastr.warning("目标表名只能由数字字母下划线组成,且不以数字开头!");
			return ;
		}
		//把目标表名tempTableName赋值给全局变量,这里需要大写
		targetNames.push($("#"+result[0]+"").val().trim().toUpperCase());
	}
	
	//willdo目标字段名必须一致(交给后台做)
	
	//把源的ids赋值给全局变量
	fromIds = ids;
	$('#targetDBWindow').show();
	$('#targetDBWindow').window({
		title: "目标数据库列表",
		width:500,
	    height:500,
	    modal:true
	});
	//设置类型为复制;
	targetType ="Together"
	//展示所有的目标数据库
	populateTargetDB();
}







//展示表名映射列表************************************************************
function showTableNameMapping(mapping){
//	console.isShowlog(mapping);
	$('#tableMapping').show();
	$('#tableMapping').window({
		title: "表名映射",
		width:500,
	    height:400,
	    modal:true
	});
	$("#tableNameMapping").css("width","100%");
	$("#tableNameMapping").empty();
	//拼接表名
	$("#tableNameMapping").append("" +
		"<tr >" +
			"<th >源表名" + "</th>" +
			"<th > ( 源  库  )" + "</th>" +
			"<th > --->" + "</th>" +
			"<th >目标表名" + "</th>" +
			"<th > ( 目 标 库 )" + "</th>" +
		"</tr>" +
	"");
	//拼接映射字段名
	for(var i = 0; i < mapping.length; i++ ){
		$("#tableNameMapping").append("" +
			"<tr>" +
			"<td >" + mapping[i].fromDBTableConfig.fromTableName + "</td>" +
			"<td > ("+ mapping[i].fromDBTableConfig.databaseConfig.nickName +")</td>" +
			"<td >---> " + "</td>" +
			"<td >" +mapping[i].toTableName + "</td>" +
			"<td > ("+ mapping[i].toDatabaseConfig.nickName +")</td>" +
			"</tr>" +
		"");
	}
	$("#tableNameMapping th").css("border-bottom","1px solid #e4e4e4");
	$("#tableNameMapping th").css("padding","8px 5px");
	$("#tableNameMapping th").css("color","red");
	
	$("#tableNameMapping td").css("border-bottom","1px solid #e4e4e4");
	$("#tableNameMapping td").css("padding","8px 5px");
}

//展示映射字段列表************************************************************
function showMappingTable(mapping){
	$('#mapping').show();
	$('#mapping').window({
		title: "字段名映射",
		width:500,
	    height:400,
	    modal:true
	});
	
	$("#mappingTable").css("width","100%");
	$("#mappingTable").empty();
	//拼接表名
	$("#mappingTable").append("" +
		"<tr >" +
			"<th >源字段名" + "</th>" +
			"<th > --->" + "</th>" +
			"<th >目标字段名" + "</th>" +
		"</tr>" +
	"");
	//拼接映射字段名
	for(var i = 0; i < mapping.length; i++ ){
		$("#mappingTable").append("" +
			"<tr>" +
			"<td >" + mapping[i].fromColumnName + "</td>" +
			"<td >---> " + "</td>" +
			"<td >" +mapping[i].toColumnName + "</td>" +
			"</tr>" +
		"");
	}
	$("#mappingTable th").css("border-bottom","1px solid #e4e4e4");
	$("#mappingTable th").css("padding","8px 5px");
	$("#mappingTable th").css("color","red");
	
	$("#mappingTable td").css("border-bottom","1px solid #e4e4e4");
	$("#mappingTable td").css("padding","8px 5px");
}
