var controllerLogList;

$(function(){
	//控制消息显示时长**********
	toastr.options={
		hideDuration:500,
		positionClass:"toast-top-center",
		timeOut:800,
	}
	
	controllerLogList = $("#commonList").jqGrid({
        url: contextPath + "/controllerLog",
        datatype: "json",
        autowidth: true,
        // height:430,
        height:document.body.clientHeight-230,
        mtype: "GET",
        multiselect: true,
        colNames: ["ID","用户名","操作时间","用户ip","url","操作","状态","参数","等级"],
        colModel: [
            { name: "id", index:"id",hidden: true},
			{ name: "username", index:"username", align:"center", sortable: true},
			{ name: "operateTime",width:200, index:"operateTime",align:"center", searchoptions:{dataInit:PlatformUI.defaultJqueryUIDatePick}, sortable: true ,formatter:"date",formatoptions: { srcformat: "U", newformat: "Y-m-d H:i:s" }},
			{ name: "ip", index:"ip", align:"center", sortable: true},
            { name: "url", index:"url", align:"center", sortable: true},
			{ name: "methodName", index:"methodName", align:"center", sortable: true},
			{ name: "success", index:"success", align:"center", sortable: true},
			{ name: "param", index:"param", align:"center", sortable: true},
            { name: "level", index:"level", align:"center", sortable: true},
            ],
        pager: "#commonPager",
        rowNum: 10,
        rowList: [10, 20, 30],
        sortname:"operateTime",
		sortorder:"desc",
        viewrecords: true,
        gridview: true,
        autoencode: true,
        caption: "日志列表"
    });
    
    //绑定检索事件
	$("#commonRetrieveBtn").click(function(){
		controllerLogList.jqGrid("setGridParam", {
			postData: {filters:{}}
		});
		controllerLogList.jqGrid('searchGrid', {multipleSearch:true,drag:false,searchOnEnter:true,top:150,left:200});
	});
	
	//绑定刷新事件
	$("#commonRefreshBtn").click(function(){
		location.href = location;
	});
	
	
	//表单保存操作
	 $("#commonSaveBtn").click(function(){
	 	if(operation == "add"){
	 		addControllerLog();
	 	}else{
	 		updateControllerLog();
	 	}
	 });
	 
	  //表单重置操作
	$("#commonResetBtn").click(function(){
		$("#commonDetailForm")[0].reset();
		PlatformUI.validateForm("commonDetailForm");
	});
			
});


//*********************方法区**********************

//弹出表单框体
function showCommonDetailWindow(){
	//表单重置
	$("#commonDetailForm")[0].reset();
	$("#commonDetailForm #id").val("");
	//验证表单
	PlatformUI.validateForm("commonDetailForm");
	$('#commonDetail').show();
	$('#commonDetail').window({
		title:"日志详细信息",
	    width:750,
	    height:250,
	    modal:true
	});
	//填充复杂字段信息
}


//新增
var addControllerLog = function(){
	if(PlatformUI.formIsValid("commonDetailForm")){//验证
 		//ajax保存
 		var params = $("#commonDetailForm").serialize();
 		PlatformUI.ajax({
 			url: contextPath + "/controllerLog",
 			type: "post",
 			data: params,
			afterOperation: function(){
				PlatformUI.refreshGrid(controllerLogList, {sortname:"createDate",sortorder:"desc"});
				$("#commonDetailForm")[0].reset();
				$('#commonDetail').window('close');
			}
 		});
 	}else{
 		toastr.warning("表单验证失败");
 	}
}

//更新
var updateControllerLog = function(){
	if(PlatformUI.formIsValid("commonDetailForm")){
		//ajax更新
 		var params = $("#commonDetailForm").serialize();
 		PlatformUI.ajax({
 			url: contextPath + "/controllerLog/" + currentEditId,
 			type: "post",
 			data: params + "&_method=put",
			afterOperation: function(){
				PlatformUI.refreshGrid(controllerLogList, {
					sortname:"createDate",
					sortorder:"desc",
					page:controllerLogList.jqGrid("getGridParam").page
				});
				$("#commonDetailForm")[0].reset();
				$('#commonDetail').window('close');
			}
 		});
	}else{
 		toastr.warning("表单验证失败");
 	}
}

//查看/编辑form切换函数
function changeEditForm(flag){
	if(flag){
		$("#commonDetailBtnKit").show();
	}else{
		$("#commonDetailBtnKit").hide();
	}
	$("#commonDetailForm input").each(function(){
		$(this).attr("readOnly", !flag);
	});
}
