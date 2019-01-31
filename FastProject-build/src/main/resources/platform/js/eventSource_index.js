//结构化_源库设置js*****************

var eventSourceList;
var halfList;

//展示所有的源数据库****************
var allDBList;

//左边栏的对象及属性****************
var left = {
	rowData:null
};

//左边栏的对象及属性****************
var middle = {
	tableName:null,
	columnArray:[],
	dbId:null,
	owner:null,
	type:null,
};

//映射字段**********************
var Mapping ={};

$(function() {
	//控制消息显示时长**********
	toastr.options={
		hideDuration:500,
		positionClass:"toast-top-center",
		timeOut:800,
	}

	//展示配置了完成的源*****************************************************************
	halfList = $("#halfList").jqGrid({
		url: contextPath + "/singleTableSwitch/showHalf",
		datatype: "json", //返回类型
		autowidth: true, //自动宽度
        height:document.body.clientHeight-230,
		mtype: "GET",
		multiselect: true, //多选
		colNames: ["ID", "源数据库名","源表名","映射字段","备忘名","创建人"],
		colModel: [
			{name: "id",index: "id",hidden: true},
			{name: "databaseConfig.nickName", sortable:false, align:"center",},
			{name: "fromTableName",sortable:false,align:"center",},//源表名
			{name: "columnMappingList",sortable:false,align:"center",
				//value 当前单元格的值, rows当前行的值, 其余两个是jqGrid定义的
				formatter: function (value, grid, rows, state) { 
//					console.isShowlog("类型: "+typeof value);	console.isShowlog(value);	console.isShowlog(rows.id);
					//给全局变量Mapping增加一个rows.id属性, 属性值是value
					Mapping[rows.id] = value;
					return '<a href="javascript: ;" style="color:#47a8ea" class="mappingDetail" '
							+' name="'+rows.id+'" >点击查看详情</a>'
				},
			},
			{name: "remarks",sortable:false,align:"center"},//备忘名
			{name: "userInfo.nickName",sortable:false,align:"center"},//创建人
		],
		
		pager: "#halfPager",
		rowNum: 15,
		rowList: [10,20,30],
		viewrecords: true,
		gridview: true,
		autoencode: true,
		caption: "已配置源数据库 + 源表名 + 字段名 "
	});
	
	
	//绑定刷新事件**********************************
	$("#commonRefreshBtn").click(function() {
		location.href = location;
	});

	//批量删除源配置************************************************************
	$("#commonDelBtn").click(function() {
		var ids = halfList.jqGrid('getGridParam', 'selarrrow');
		if(ids.length == 0) {
			toastr.warning("请选择一条或多条!");
			return;
		}
//		console.isShowlog(ids);
		//批量删除ajax
		$.messager.confirm('操作', '请确认删除数据', function(r) {
			if(r) {
				jQuery.ajax({
					type: "GET",
					url: contextPath + "/singleTableSwitch/delete",
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
	
	
	//配置1按钮的单击事件***********************************************
	$("#add1").click(function() {
		//展示admin给当前用户配好的可读库
		showSourceDB1();
	});
	
	//查看选中的 '源数据库' 中的表********************************************
	//展示admin给当前用户配好的可读表
	$("#viewTables").click(function() {
		//获取选中行的id
		var ids = allDBList.jqGrid ('getGridParam', 'selarrrow');
		if(ids.length != 1){
			toastr.warning("选择一个数据库!");
			return;
		}
		//在这里, 就把当前数据库的id, 赋给全局变量
		middle.dbId = ids[0];
		
		//每次点击, 都重新请求jqGrid(已生效)
		reloadTables(ids[0]);
		
		//展示admin给当前用户配好的可读表
		showSourceDB1Table(ids[0]);
		
		//打开sourceDBTable大页面的时候, 关闭展示数据库列表的sourceDBList
		$('#sourceDBList').window('close');
		//并且关闭中间栏和右边栏, 避免上一次打开的中间栏和右边栏仍然打开
		$(".Middle").hide();
		$(".right").hide();
		
	});
	
	
	//中间栏'选中这些字段'按钮******************************************
	$("#addColumn").click(function(){
		//这时不应判断当前页面是否有字段被选中, 而是看全局变量middle.columnArray
//		var ids = $("#oneTable").jqGrid ('getGridParam', 'selarrrow');
		if(middle.columnArray.length == 0){
			toastr.warning("至少选择一个字段");
			return;
		}
		//把当前表名&字段名, 添加到右边栏
		addTableName(middle.tableName,middle.columnArray);
	});
	
	//右边栏'保存字段'按钮******************************************
	$("#saveColumn").click(function(){
		var targetColumnArr = $('.targetColumn');
        var result = [];
        targetColumnArr.each(function(){
        	if($(this).val().trim() == "" || null){
        		//如果没有填, 则跳出这个each循环, 后面的也不再执行
        		return false;
        	}
        	//把字段, 全部转换成大写
            result.push($(this).val().trim().toUpperCase());
        });
        
        //如果targetColumnArr和result长度不等 , 说明有字段没有填写
        if(targetColumnArr.length != result.length){
        	toastr.warning("请把目标字段名填完整");
        	return ;
        }
        
        //给此事件起个备忘名吧...
        var remarks = $("#remarks").val();
        if((remarks == null) || (remarks == "") ){
        	toastr.warning("给此事件起个备忘名吧");
        	return ;
        }
        
        //判断自定义字段名是否有重复*******************************
        //result是引用数据类型,直接赋值给另一个数组resultTemp, 指向的也是同一内存地址
        var resultTemp=[];
        for(var i=0;i<result.length;i++){
        	resultTemp.push( result[i] );
        }
        //先排序, 再判断 , 	并且判断 以字母、数字、下划线(_)  ,数组不能开头
        resultTemp.sort();
//        console.isShowlog(resultTemp);
		var reg = new RegExp(/^[A-z]+\w*$/);
        for(var i=0;i<resultTemp.length;i++){
	        if (resultTemp[i]==resultTemp[i+1]){
	        	toastr.warning("字段名有重复: "+resultTemp[i]);
	        	return; 
	        }
	        
	        if(!reg.test( resultTemp[i] ) ) {
				toastr.warning("字段名只能由数字,字母,下划线 组成,且不以数字开头!");
				return ;
			}
        }
        
        //result 第一个元素是目标表名(自定义), 剩下的是目标字段名(自定义)
        var targetTableName = result[0];
        result = result.slice(1);	
        //进行保存操作
//    	allColumns(middle.dbId,middle.tableName,middle.columnArray,targetTableName, result);
    	allColumns(middle,targetTableName, result,remarks);
	});
	
	//映射字段详情 的单击事件**************************************************************
	//事件委托
	$("#halfList").on("click",".mappingDetail",showMapping);
	function showMapping(){
		//通过当前a标签, 拿到全局变量Mapping的属性, 和属性值
		var index = $(this).attr("name");
		showMappingTable(Mapping[index]);
	}
	
});

//*********************方法区******************************************


//展示admin给当前用户配好的可读库******************************************************
function showSourceDB1(){
	$('#sourceDBList').show();
	$('#sourceDBList').window({
		title: "数据库列表",
		width:500,
	    height:500,
	    modal:true
	});
	//展示admin给当前用户配好的可读库
	populateAllDB();
}

//展示admin给当前用户配好的可读库******************************************************
function populateAllDB(){
	allDBList =  $("#allDBList").jqGrid({
        url: contextPath + "/db/authority/database/read",
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
        pager: "#allDBListPager",
        rowNum: 10,
        rowList: [10, 20, 30],
        viewrecords: true,
        gridview: true,
        autoencode: true,
	});
	//每次进来 , 就清除上一次选中的状态
	$("#allDBList").jqGrid('resetSelection');
}

//展示当前数据库下,admin给当前用户配好的可读表*****************************
function showSourceDB1Table(id){
	$('#sourceDBTable').show();
	$('#sourceDBTable').window({
		title: "一库多表多字段 --> 一库多表多字段",
		maximized: true,//面板最大化
	    modal:true
	});
	//展示admin给当前用户配好的可读表
	populateDBsTable(id);
}

//展示admin给当前用户配好的可读表*****************************************
function populateDBsTable(id){
	tables = $("#tables").jqGrid({
		url: contextPath + "/db/authority/table/"+id,
        datatype: "json",
        autowidth: true,
        // height:450,
        height:document.body.clientHeight-300,
        mtype: "GET",
        colNames: [ "表名","备注","所属者","类型"],
        colModel: [
        	{ name: "tableName", index:"tableName", align:"center",sortable: true},
			{ name: "comment", index:"comment", align:"center"},
			{ name: "owner", index:"owner", hidden: true},
			{ name: "type", index:"type", hidden: true},
        ],
        //双击行的时候触发,rowid是当前行的id(0,1,2,3...)
        ondblClickRow:function(rowid){	
        	//双击后, 右边栏需要清空, 并隐藏, 全局变量 middle.columnArray也要清空
        	$(".right").hide();
        	$("#columns").empty();
        	middle.columnArray.splice(0,middle.columnArray.length); 
        	
        	//双击后 , 中间栏显示出来,并且每次双击都重新载入
        	left.rowData = $(this).getRowData(rowid);
//        	console.isShowlog("当前表: "+left.rowData);
//        	console.isShowlog("当前数据库: "+id);
//        	console.isShowlog("当前数据库: "+middle.dbId);
        	
        	//重新载入表中的所有字段
        	//这里直接使用传进来的数据库id, 可能会是上一次的id
        	//所以直接用全局变量
        	reloadColumnNames(middle.dbId,left.rowData);
        	$(".Middle").show();
        	//填充当前表的字段 到 中间栏
        	populateTableNames(middle.dbId,left.rowData);
        },
        pager:"#tablesPage",
        rowNum: 10,
        rowList: [10, 20, 30],
        viewrecords: true,//显示总记录数
        gridview: true,
        autoencode: true,
        caption: "当前数据库中的表------(双击选中)",
        sortname: "tableName",
		sortorder: "asc",
		gridComplete: function () {
		    $("#tablesPage_left").hide();
		    //隐藏这个td, 页脚左边会隐藏一个空白...显示跟多
		},
    });
}

//重新载入当前数据库下所有的表*********************************************************
function reloadTables(dbId){
    $("#tables").jqGrid('setGridParam',{
    	url: contextPath + "/db/authority/table/"+dbId,
		datatype : 'json',
		//这个参数很重要, 每次重新加载的时候,从第一页开始展示
		page:1,
	}).trigger('reloadGrid');
}

//展示选中的表的字段, 填到中间栏***************************************************
function populateTableNames(DBid,tableData){
	//把当前表名赋给全局变量	//把当前数据库id赋给全局变量dbId
	middle.tableName = tableData.tableName;
	middle.owner = tableData.owner;
	middle.type = tableData.type;
//	middle.dbId = DBid;
	
	oneTable = $("#oneTable").jqGrid({
		url: contextPath + "/db/getColumnNames",
		datatype: "json",
		autowidth: true,
		// height:450,
        height:document.body.clientHeight-300,
		mtype: "GET",
		postData:{
			'dbId':DBid,
			'tableName':middle.tableName,
			'owner':middle.owner,
			'type':middle.type,
		},
        multiselect: true,
		colNames: [ "字段名","备注"],
		colModel: [
			{ name: "columnName", index:"columnName", align:"center", sortable: true},
			{ name: "comment", index:"comment", align:"center", sortable: true},
		],
		//当选择行时触发此事件。rowid:当前行id；status:选择状态
		onSelectRow: function(rowid,status){
			if(status){
				//把当前选中的行的columnName 暂存到全局变量中, 这样就不怕翻页了
				var rowData = $("#oneTable").getRowData(rowid);
				middle.columnArray.push(rowData.columnName);
//				console.isShowlog("新增后:"+middle.columnArray);
				//需要注意, 如果第一页选中了N个, 暂存到全局变量中, 去了其他页面, 再回到第一页
				//由于gridComplete方法, 会回显, 回显也相当于选中☑操作, 所以又会添加这N个到全局变量中
				//所以, 还需要进行js去重操作
				var result = [],
				i,
				j,
				len = middle.columnArray.length;
				for(i = 0; i < len; i++) {
					for(j = i + 1; j < len; j++) {
						if(middle.columnArray[i] === middle.columnArray[j]) {
							j = ++i;
						}
					}
					result.push(middle.columnArray[i]);
				}
//				console.isShowlog(result);
				//先把middle.columnArray清空, 再把result的元素, 交给middle.columnArray
				middle.columnArray.splice(0,middle.columnArray.length); 
				for(var i=0;i<result.length;i++){
					middle.columnArray.push( result[i] );
		        }
			}else{
				//移除这个元素
				var rowData = $("#oneTable").getRowData(rowid);
				var index = middle.columnArray.indexOf(rowData.columnName);
				middle.columnArray.splice(index,1);
//				console.isShowlog("删除后:"+middle.columnArray);
			}
		},
		//multiselect为ture，且点击头部的checkbox时才会触发此事件。
		//ids:所有行的id组成的数组 ,无论checkbox是否选择，ids始终有值
		onSelectAll:function(ids,status){
			//如果选中, 则把这些行加入到middle.columnArray中,
			if(status){
				for(var i=0;i<ids.length;i++){
					var rowData = $("#oneTable").getRowData(ids[i]);
					middle.columnArray.push( rowData.columnName );
		        }
//				console.isShowlog("去重前: "+ middle.columnArray);
				//同样, 别忘了去重
				var result = [],	i,	j,	len = middle.columnArray.length;
				for(i = 0; i < len; i++) {
					for(j = i + 1; j < len; j++) {
						if(middle.columnArray[i] === middle.columnArray[j]) {
							j = ++i;
						}
					}
					result.push(middle.columnArray[i]);
				}
//				console.isShowlog("去重后: "+result);
				//先把middle.columnArray清空, 再把result的元素, 交给middle.columnArray
				middle.columnArray.splice(0,middle.columnArray.length); 
				for(var i=0;i<result.length;i++){
					middle.columnArray.push( result[i] );
		        }
			}else{
				for(var i=0;i<ids.length;i++){
					//移除这个元素
					var rowData = $("#oneTable").getRowData(ids[i]);
					var index = middle.columnArray.indexOf(rowData.columnName);
					middle.columnArray.splice(index,1);
		        }
			}
		},
		gridComplete: function() {
        	//先判断有多少行数据(固定写法)
        	var rowNum = $(this).jqGrid('getGridParam','records');
        	//获取id数组(传入表格的id)
        	var ids = $('#oneTable').getDataIDs();
        	
        	for( var i=0 ; i<rowNum ; i++ ){
        		//获取某一行的数据(传入表格的id,和某一行的id)
        		var rowData = $("#oneTable").getRowData(ids[i]);
        		//判断这个数据, 在全局变量middle.columnArray中是否存在,不存在就返回-1
        		var index = middle.columnArray.indexOf(rowData.columnName);
        		if(index != -1){
        			//通过id, 设置某一行被选中,
        			$("#oneTable").jqGrid('setSelection',''+ids[i]+'');
        		}
        	}
        	$("#columnsPage_left").hide();
		    //隐藏这个td, 页脚左边会隐藏一个空白...显示更多;
        },
		pager: "#columnsPage",
		rowNum: 50,
		rowList: [30, 50, 70, 100],
		viewrecords: true,
		gridview: true,
		autoencode: true,
		caption: "当前表的字段",
	});
}

//重新载入表中的所有字段*********************************************************
function reloadColumnNames(DBid,tableData){
	var tableName = tableData.tableName;
    $("#oneTable").jqGrid('setGridParam',{
    	url: contextPath + "/db/getColumnNames",
		datatype : 'json',
		//这个参数很重要, 每次重新加载的时候,从第一页开始展示
		page:1,
		postData:{
			'dbId':DBid,
			'tableName':tableName,
		},
	}).trigger('reloadGrid');
}

//把选中的表及其字段添加到右边栏************************************************
function addTableName(tableName,columnArray){
	$(".right").show();
	$("#columns").jqGrid({
		datatype: "json",
		autowidth:true,
		// height: 450,
		height: (document.body.clientHeight-($(".btn_center").height()+30+$(".ui-jqgrid-caption").height()+$(".pg_columnsPage").height()+$(".window-header").height()+2+2+150)),
		caption: "需要交换的字段"
	});
	rightAppend(tableName,columnArray);
}

//填充右边栏table的方法********************************************************
function rightAppend(tableName,columnArray){
	//先设置样式,先清空再添加内容, 防止累加
	$("#columns").css("width","100%");
	$("#columns").empty();
	
	//拼接表名(源表名 , 目标表名, 先隐藏起来, 这里用不着)
	$("#columns").append("" +
		"<tr hidden='hidden' >" +
			"<th >源表名" + "</th>" +
			"<th >目标表名(自定义)" + "</th>" +
		"</tr>" +
		"<tr hidden='hidden'>" +
			"<td >" +tableName+ "</td>" +
			"<td ><input  id='' class='targetColumn' value='"+tableName+"' disabled='disabled'/>" + "</td>" +
		"</tr>" +
		"<tr >" +
			"<th >源字段名" + "</th>" +
			"<th >目标字段名(自定义)" + "</th>" +
		"</tr>" +
	"");
	//拼接字段名
	for(var i = 0; i < columnArray.length; i++ ){
		$("#columns").append("" +
			"<tr>" +
			"<td >" + columnArray[i] + "</td>" +
			"<td ><input  id='' class='targetColumn' value='"+columnArray[i]+"' />" + "</td>" +
			"</tr>" +
		"");
	}
	//给th td设置样式
	$("#columns th").css("border-bottom","1px solid #e4e4e4");
	$("#columns th").css("padding","8px 5px");
	$("#columns th").css("color","red");
	
	$("#columns td").css("border-bottom","1px solid #e4e4e4");
	$("#columns td").css("padding","8px 5px");
}

//把表名, 字段名, 自定义字段名, 保存成一个"源" ************************************************
//保存到数据库中
function allColumns (middle,targetTableName,targetColumnArray,remarks){
//	console.isShowlog(middle);
//	console.isShowlog(targetTableName);
//	console.isShowlog(targetColumnArray);

	//如果数据超多的话, get请求长度有限, 无法把参数传递到后台, 所以请使用post
	//targetTableName , 这个方法不需要
	jQuery.ajax({
		type: "POST",
		url: contextPath + "/singleTableSwitch/saveFromTable",
		data: {
			"fromDbId": middle.dbId,
			"fromTableName": middle.tableName,
			"fromColumnArray": middle.columnArray,
			"targetColumnArray": targetColumnArray,
			"owner": middle.owner,
			"type": middle.type,
			"remarks": remarks,
		},
		success: function(returnData) {
			if(returnData.statusCode <= 200){
				toastr.success(returnData.statusText);
				//保存成功后, 还需要把右边栏清空并隐藏, 关闭sourceDBTable窗口
				$(".right").hide();
	        	$("#columns").empty();
	        	$('#sourceDBTable').window('close');
	        	PlatformUI.refreshGrid(halfList);
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

//*************************************************************************************
//展示映射字段列表************************************************************
function showMappingTable(mapping){
//	console.isShowlog(mapping);
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


//填充复杂表单
function populateComplexForm(data) {
	//console.isShowlog(data);
	$("#srcIpAddr").val(data.interfaceConfigParam.srcIpAddr);
	$("#srcInsName").val(data.interfaceConfigParam.srcInsName);
	$("#srcPort").val(data.interfaceConfigParam.srcPort);
	$("#srcUser").val(data.interfaceConfigParam.srcUser);
	$("#srcPassword").val(data.interfaceConfigParam.srcPassword);
	$("#targetIpAddr").val(data.interfaceConfigParam.targetIpAddr);
	$("#targetInsName").val(data.interfaceConfigParam.targetInsName);
	$("#targetPort").val(data.interfaceConfigParam.targetPort);
	$("#targetUser").val(data.interfaceConfigParam.targetUser);
	$("#targetPassword").val(data.interfaceConfigParam.targetPassword);
}

//这里是easyUI扩展的表单验证器****************************************************************
$.extend($.fn.validatebox.defaults.rules, {
	range:{
        validator:function(value,param){
        	if(/^[1-9]\d*$/.test(value)){
        		return value >=0 && value <=65536
        	}else{
        		return false;
        	}
        },
        message:'输入的数字在{1}到{65536}之间'
	},
    ip: {// 验证IP地址
        validator: function (value) {
        	 var reg = /^((1?\d?\d|(2([0-4]\d|5[0-5])))\.){3}(1?\d?\d|(2([0-4]\d|5[0-5])))$/ ;  
             return reg.test(value);  
        },
        message: 'IP地址格式不正确'
    }
});