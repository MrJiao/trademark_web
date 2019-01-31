var dataSwitchHisList;

$(function(){
	
	dataSwitchHisList = $("#commonList").jqGrid({
        url: contextPath + "/dataSwitchHis",
        datatype: "json",
        autowidth: true,
        height:document.body.clientHeight-230,
        mtype: "GET",
        multiselect: true,
        colNames: ["ID", "源表名","状态","日志流水标识","目标表名","交换时间","事件标识", "创建时间"],
        colModel: [
            { name: "id", index:"id",hidden: true},
			{ name: "srcTableName", index:"srcTableName", align:"center", sortable: true},
			{ name: "statusCd", index:"statusCd", align:"center", sortable: true},
			{ name: "logId", index:"logId", align:"center", sortable: true},
			{ name: "targerTableName", index:"targerTableName", align:"center", sortable: true},
			{ name: "switchDate",width:200, index:"switchDate",align:"center", searchoptions:{dataInit:PlatformUI.defaultJqueryUIDatePick}, sortable: true ,formatter:"date",formatoptions: { srcformat: "U", newformat: "Y-m-d H:i:s" }},
			{ name: "evtId", index:"evtId", align:"center", sortable: true},

            { name: "gmtCreate",width:200, index:"gmtCreate",align:"center", searchoptions:{dataInit:PlatformUI.defaultJqueryUIDatePick}, sortable: true ,formatter:"date",formatoptions: { srcformat: "U", newformat: "Y-m-d H:i:s" }}
            ],
        pager: "#commonPager",
        rowNum: 10,
        rowList: [10, 20, 30],
        sortname:"gmtCreate",
		sortorder:"desc",
        viewrecords: true,
        gridview: true,
        autoencode: true,
        caption: "数据交换历史记录列表"
    });
    
//  //绑定检索事件
//	$("#commonRetrieveBtn").click(function(){
//		$("#commonSearchInput").val("");
//		dataSwitchHisList.jqGrid("setGridParam", {
//			postData: {filters:{}}
//		});
//		dataSwitchHisList.jqGrid('searchGrid', {multipleSearch:true,drag:false,searchOnEnter:true,top:150,left:200});
//	});
	
	//绑定刷新事件
	$("#commonRefreshBtn").click(function(){
		location.href = location;
	});
	
//	//绑定导出excel事件
//	$("#commonExportBtn").click(function(){
//		PlatformUI.exportGrid("commonList", "from TLDEP_DATA_SWITCH_HIS");
//	});
//	
//	//绑定普通页面查询框体点击事件
//	$("#commonSearchBtn").click(function(){
//		commonInputSearch();
//	});
//	
//	//绑定查询框回车事件
//	$("#commonSearchInput").keyup(function(event){
//		if(event.keyCode == 13){  
//      	commonInputSearch(); 
//      }
//	});
	
	//绑定新增事件
	$("#commonShowAddBtn").click(function(){
		changeEditForm(true);
		operation = "add";
		showCommonDetailWindow();
	});
	
	//表单保存操作
	 $("#commonSaveBtn").click(function(){
	 	if(operation == "add"){
	 		addDataSwitchHis();
	 	}else{
	 		updateDataSwitchHis();
	 	}
	 });
	 
	  //表单重置操作
	$("#commonResetBtn").click(function(){
		$("#commonDetailForm")[0].reset();
		PlatformUI.validateForm("commonDetailForm");
	});
	
	//编辑按钮
	$("#commonShowEditBtn").click(function(){
		changeEditForm(true);
		var ids = dataSwitchHisList.jqGrid ('getGridParam', 'selarrrow');
		if(ids.length != 1){
			toastr.warning("选择一条要编辑的数据!");
			return;
		}
		currentEditId = ids[0];
		operation = "edit";
		PlatformUI.ajax({
			url: contextPath + "/dataSwitchHis/" + ids[0],
			afterOperation: function(data, textStatus,jqXHR){
				showCommonDetailWindow();
				PlatformUI.populateForm("commonDetailForm", data);
				//填充复杂数据
				
				//验证表单
				PlatformUI.validateForm("commonDetailForm");
			}
		});
	});
	
	//查看按钮
	$("#commonViewBtn").click(function(){
		var ids = dataSwitchHisList.jqGrid ('getGridParam', 'selarrrow');
		if(ids.length != 1){
			toastr.warning("选择一条要查看的数据!");
			return;
		}
		PlatformUI.ajax({
			url: contextPath + "/dataSwitchHis/" + ids[0],
			afterOperation: function(data, textStatus,jqXHR){
				showCommonDetailWindow();
				PlatformUI.populateForm("commonDetailForm", data);
				changeEditForm(false);
				//填充复杂数据
				
				//验证表单
				PlatformUI.validateForm("commonDetailForm");
			}
		});
	});
	
	//批量删除事件
	$("#commonDelBtn").click(function(){
		var ids = dataSwitchHisList.jqGrid ('getGridParam', 'selarrrow');
		if(ids.length == 0){
			toastr.warning("请至少选择一条要删除的数据!");
			return;
		}
		//批量删除ajax
		$.messager.confirm('操作','请确认删除数据',function(r){
	    	if (r){
		        PlatformUI.ajax({
					url: contextPath + "/dataSwitchHis",
					type: "post",
					data: {_method:"delete",ids:ids},
					afterOperation: function(){
						PlatformUI.refreshGrid(dataSwitchHisList, {sortname:"gmtCreate",sortorder:"desc"});
					}
				});
		    }
		});
	});
	
});


//*********************方法区**********************


////普通框体查询
//function commonInputSearch(){
//	var commonSearchInputValue = $("#commonSearchInput").val();
//	var rules = [];
//	if(commonSearchInputValue != ""){
//		rules.push({"field":"logId","op":"cn","data":commonSearchInputValue});
//	}else{
//		return;
//	}
//	var filters = {"groupOp":"AND","rules":rules};
//	dataSwitchHisList.jqGrid("setGridParam", {
//		postData: {filters:JSON.stringify(filters)},
//		page: 1
//	}).trigger("reloadGrid");
//}

//弹出表单框体
function showCommonDetailWindow(){
	//表单重置
	$("#commonDetailForm")[0].reset();
	$("#commonDetailForm #id").val("");
	//验证表单
	PlatformUI.validateForm("commonDetailForm");
	$('#commonDetail').show();
	$('#commonDetail').window({
		title:"数据交换历史记录详细信息",
	    width:750,
	    height:250,
	    modal:true
	});
	//填充复杂字段信息
}


//新增
var addDataSwitchHis = function(){
	if(PlatformUI.formIsValid("commonDetailForm")){//验证
 		//ajax保存
 		var params = $("#commonDetailForm").serialize();
 		PlatformUI.ajax({
 			url: contextPath + "/dataSwitchHis",
 			type: "post",
 			data: params,
			afterOperation: function(){
				PlatformUI.refreshGrid(dataSwitchHisList, {sortname:"gmtCreate",sortorder:"desc"});
				$("#commonDetailForm")[0].reset();
				$('#commonDetail').window('close');
			}
 		});
 	}else{
 		toastr.warning("表单验证失败");
 	}
}

//更新
var updateDataSwitchHis = function(){
	if(PlatformUI.formIsValid("commonDetailForm")){
		//ajax更新
 		var params = $("#commonDetailForm").serialize();
 		PlatformUI.ajax({
 			url: contextPath + "/dataSwitchHis/" + currentEditId,
 			type: "post",
 			data: params + "&_method=put",
			afterOperation: function(){
				PlatformUI.refreshGrid(dataSwitchHisList, {
					sortname:"gmtCreate",
					sortorder:"desc",
					page:dataSwitchHisList.jqGrid("getGridParam").page
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
