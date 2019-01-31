//结构化数据交换的任务***********************************************************

//做定时的任务id***************
var taskIdForCron;

var taskList;
$(function() {
	//控制消息显示时长**********
	toastr.options={
		hideDuration:500,
		positionClass:"toast-top-center",
		timeOut:800,
	}
	taskList = $("#commonList").jqGrid({
		url: contextPath + "/singleTableSwitch/showTask", //请求
		datatype: "json", //返回类型
		autowidth: true, //自动宽度
        height:document.body.clientHeight-230,
		mtype: "GET",
		multiselect: true, //多选
		colNames: ["ID", "任务名称","创建人", "创建时间","开始时间","结束时间","交换状态" ],
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
			{name: "createDate",width: 200,index: "createDate",align: "center",
				searchoptions: {dataInit: PlatformUI.defaultJqueryUIDatePick},
				sortable: true,
				formatter: "date",
				formatoptions: {srcformat: "U",	newformat: "Y-m-d H:i:s"}
			},
			{name: "startTime",hidden: false,sortable:false,align: "center",
				searchoptions: {dataInit: PlatformUI.defaultJqueryUIDatePick},
				sortable: true,
				formatter: "date",
				formatoptions: {srcformat: "U",	newformat: "Y-m-d H:i:s"}
			},
			{name: "endTime",hidden: false,sortable:false,align: "center",
				searchoptions: {dataInit: PlatformUI.defaultJqueryUIDatePick},
				sortable: true,
				formatter: "date",
				formatoptions: {srcformat: "U",	newformat: "Y-m-d H:i:s"}
			},
			{name: "state",hidden: false,sortable:false,align: "center",
				formatter: function (value, grid, rows, state) { 
					var myState;
					switch (value){
						case null:
							myState="";
							break;
						case 0:
							myState="排队中";
							break;
						case 2:
							myState="正在传输";
							break;
						case 20:
							myState="传输失败";
							break;
						case 3:
							myState="传输完成";
							break;
					}
					return myState;
				},
			},
		],
		pager: "#commonPager",
		rowNum: 10,
		rowList: [10, 20, 30],
		sortname: "createDate",
		sortorder: "desc",
		viewrecords: true,
		gridview: true,
		autoencode: true,
		caption: "已配置成功的任务, 请点击交换"
	});

	//绑定刷新事件
	$("#commonRefreshBtn").click(function() {
		location.href = location;
	});

	//交换数据 按钮  *********************************************************
	//点击时，先检查事件连接 (即数据库连接是否成功)
	$("#switchDateBtn").click(function() {
		var ids = taskList.jqGrid('getGridParam', 'selarrrow');
		if(ids.length == 0) {
			toastr.warning("选择一条或多条要交换的数据!");
			return;
		}
		switchData(ids);
	});
	
	//配置定时任务**************************************************
	$("#ScheduleConfig").click(function() {
		var ids = taskList.jqGrid('getGridParam', 'selarrrow');
		if(ids.length != 1) {
			toastr.warning("选择一条任务!");
			return;
		}
		//并且把任务id赋值给全局变量
		taskIdForCron = ids[0];
		showSchedule();
	});
	
	//查看当前任务的定时任务*********************************************
	$("#viewSchedule").click(function() {
		var ids = taskList.jqGrid('getGridParam', 'selarrrow');
		if(ids.length != 1) {
			toastr.warning("选择一条任务!");
			return;
		}
		//并且把任务id赋值给全局变量
		taskIdForCron = ids[0];
		openSchedule();
	});
	
	//定时页面中, 提交定时任务******************************************
	$("#myCron").click(function() {
		var timeValue = $("#runTime").html().trim();
		if(timeValue == null || timeValue==""){
			toastr.warning("请先选择时间!");
			return;
		}
		doSchedule();
	});
	
	//定时页面中, 取消定时任务******************************************
	$("#cancelSchedule").click(function() {
		var ids = taskList.jqGrid('getGridParam', 'selarrrow');
		if(ids.length != 1) {
			toastr.warning("选择一条任务!");
			return;
		}
		//并且把任务id赋值给全局变量
		taskIdForCron = ids[0];
		cancelSchedule();
	});
	
});

//*********************方法区**********************

//定时任务的窗口展示出来********************************************
function showSchedule(){
	$("#Schedule").show();
	$('#Schedule').window({
		title:"请给当前任务配置定时任务",
	    modal:true
	});
}

//查看当前用户的定时任务的窗口显示出来*******************************
function openSchedule(){
	$("#usersSchedule").show();
	$('#usersSchedule').window({
		title:"当前任务最近的五次定时",
		width:400,
	    height:250,
	    modal:true
	});
	viewTaskSchedule();
}
//请求后台, 把五次任务展示出来*****************************
function viewTaskSchedule(){
//	console.isShowlog(taskIdForCron);
	jQuery.ajax({
		type: "POST",
		url: contextPath + "/schedule/view",
		data: {
			"tableSwitchConfigId": taskIdForCron,
		},
		success: function(returnData) {
//			console.isShowlog(returnData);
			var result = formatDate(returnData);
			if(returnData == "" || returnData == null){
				$("#ScheduleRunTime").html("此任务暂未配置定时计划");
			}else{
				$("#ScheduleRunTime").html(result);
			}
		},
		error: function(xhr,status,error) {
			toastr.warning('出现异常!');
		},
		traditional: true
	});
}

//提交定时任务****************************************************
function doSchedule(){
//	console.isShowlog(taskIdForCron);
	var cron = $("#cron").val() ;
	cron = cron.substr(0,cron.length-1);
//	console.isShowlog(cron);

	jQuery.ajax({
		type: "POST",
		url: contextPath + "/schedule/schedule",
		data: {
			"tableSwitchConfigId": taskIdForCron,
			"cron": cron,
		},
		success: function(returnData) {
			if(returnData.statusCode <= 200){
				toastr.success(returnData.statusText);
				//关闭当前窗口
				$('#Schedule').window('close');
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

//删除定时任务****************************************************
function cancelSchedule(){
//	console.isShowlog(taskIdForCron);
	jQuery.ajax({
		type: "POST",
		url: contextPath + "/schedule/cancelSchedule",
		data: {
			"tableSwitchConfigId": taskIdForCron,
		},
		success: function(returnData) {
			if(returnData.statusCode <= 200){
				toastr.success(returnData.statusText);
				//关闭当前窗口
				$('#Schedule').window('close');
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

//执行任务, 交换数据**********************************************************
function switchData(ids){
	jQuery.ajax({
		type: "GET",
		url: contextPath + "/singleTableSwitch/switchData",
		data: {
			"ids": ids,
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
		error: function(xhr,status,error) {
			
		},
		traditional: true
	});
}

//-------------------------------------------------------------------------

//把返回的时间戳数组格式化成时间************************************
function formatDate(array){
	var result ="" ;
	for(var i=0 ; i<array.length ; i++ ){
		//将时间戳, 传到构造器中, 得到一个日期
		//格式为: Thu Jul 12 2018 09:40:00 GMT+0800 (中国标准时间)
		var date = new Date(array[i]);
		var tempresult = convertDate(date);
		
		result += ''+tempresult+'<br/>'
	}
	return result;
}

//把收到的时间戳, 格式化成"日期+时间"的格式*****************************
function convertDate(date){
//	console.isShowlog("格式化前: "+date);
	var formatdate ;
	//两种分隔符
	var seperator1 = "-";
	var seperator2 = ":";
	
	//得到年
	var year = date.getFullYear();
	//得到月份的索引0-11,所以需要相应的+1,变成1-12,并且把1-9变成01-09
	var month = date.getMonth()+1;
	if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
	//得到日, 并且把1-9变成01-09,
	var day = date.getDate();
	if (day >= 0 && day <=9) {
		day = "0"+day;//number-->String
	}
	//得到时,分, 秒
	var hour = date.getHours();
	var min = date.getMinutes();
	var sec = date.getSeconds();
	formatdate = year + seperator1 + month + seperator1+ day+" "
		+ hour + seperator2 +min +seperator2 + sec;
//	console.isShowlog("格式化后: "+formatdate);
	return formatdate;
}

//查看/编辑form切换函数
function changeEditForm(flag) {
	if(flag) {
		$("#commonDetailBtnKit").show();
	} else {
		$("#commonDetailBtnKit").hide();
	}
	$("#commonDetailForm input").each(function() {
		$(this).attr("readOnly", !flag);
	});
}
