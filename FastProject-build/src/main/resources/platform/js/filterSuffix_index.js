var filterSuffixList;

//****************************************************************************
$(function(){
	//控制消息显示时长**********
	toastr.options={
		hideDuration:500,
		positionClass:"toast-top-center",
		timeOut:800,
	}
	
	filterSuffixList = $("#commonList").jqGrid({
        url: contextPath + "/filterSuffix",
        datatype: "json",
        autowidth: true,
        height:document.body.clientHeight-230,
        mtype: "GET",
        multiselect: true,
        colNames: ["ID","条件名称","正则表达式","创建时间", "修改时间"],
        colModel: [
            { name: "id", index:"id",hidden: true},
            { name: "name", index:"name", align:"center", sortable: true},
            { name: "reg", index:"reg", align:"center", sortable: true},
            { name: "createDate",width:200, index:"createDate",align:"center", 
           	 sortable: true ,
           	 formatter:"date",formatoptions: { srcformat: "U", newformat: "Y-m-d H:i:s" }
            },
			{ name: "gmtModified",width:200, index:"gmtModified",align:"center",
            	 sortable: true ,
            	formatter:"date",formatoptions: { srcformat: "U", newformat: "Y-m-d H:i:s" }
            },
            
        ],
        pager: "#commonPager",
        rowNum: 30,
        rowList: [20, 40, 60],
        sortname:"createDate",
		sortorder:"desc",
        viewrecords: true,
        gridview: true,
        autoencode: true,
        caption: "已添加的匹配条件"
    });
    
	//绑定刷新事件
	$("#commonRefreshBtn").click(function(){
		location.href = location;
	});
	
	//绑定新增事件
	$("#commonShowAddBtn").click(function(){
		changeEditForm(true);
		operation = "add";
		showCommonDetailWindow();
	});
	
	//表单保存操作
	 $("#commonSaveBtn").click(function(){
	 	if(operation == "add"){
	 		addFilterSuffix();
	 	}else{
	 		updateFilterSuffix();
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
		var ids = filterSuffixList.jqGrid ('getGridParam', 'selarrrow');
		if(ids.length != 1){
			toastr.warning("选择一条要编辑的数据!");
			return;
		}
		currentEditId = ids[0];
		operation = "edit";
		PlatformUI.ajax({
			url: contextPath + "/filterSuffix/" + ids[0],
			afterOperation: function(data, textStatus,jqXHR){
				showCommonDetailWindow();
				PlatformUI.populateForm("commonDetailForm", data);
				//验证表单
				PlatformUI.validateForm("commonDetailForm");
			}
		});
	});
	
	//批量删除事件
	$("#commonDelBtn").click(function(){
		var ids = filterSuffixList.jqGrid ('getGridParam', 'selarrrow');
		if(ids.length == 0){
			toastr.warning("请至少选择一条要删除的数据!");
			return;
		}
		//批量删除ajax
		$.messager.confirm('操作','请确认删除数据',function(r){
	    	if (r){
		        PlatformUI.ajax({
					url: contextPath + "/filterSuffix",
					type: "post",
					data: {_method:"delete",ids:ids},
					afterOperation: function(){
						PlatformUI.refreshGrid(filterSuffixList, {sortname:"createDate",sortorder:"desc"});
					}
				});
		    }
		});
	});
	
});


//*********************方法区**********************


//弹出表单框体*******************
function showCommonDetailWindow(){
	//表单重置
	$("#commonDetailForm")[0].reset();
	$("#commonDetailForm #id").val("");
	//验证表单
	PlatformUI.validateForm("commonDetailForm");
	$('#commonDetail').show();
	$('#commonDetail').window({
		title:"新增需要过滤的后缀名",
	    width:350,
	    height:250,
	    modal:true
	});
}


//新增************
var addFilterSuffix = function(){
	if(PlatformUI.formIsValid("commonDetailForm")){//验证
 		//ajax保存
 		var params = $("#commonDetailForm").serialize();
 		PlatformUI.ajax({
 			url: contextPath + "/filterSuffix",
 			type: "post",
 			data: params,
			afterOperation: function(returnData){
				if(returnData.statusCode <= 200){
					$("#commonDetailForm")[0].reset();
					$('#commonDetail').window('close');
		        	PlatformUI.refreshGrid(filterSuffixList, {sortname:"createDate",sortorder:"desc"});
				}else if((returnData.statusCode >=400) && (returnData.statusCode <500) ){
				}else if(returnData.statusCode >= 500){
				}
			}
 		});
 	}else{
 		toastr.warning("表单验证失败");
 	}
}

//更新*******
var updateFilterSuffix = function(){
	if(PlatformUI.formIsValid("commonDetailForm")){
		//ajax更新
 		var params = $("#commonDetailForm").serialize();
 		PlatformUI.ajax({
 			url: contextPath + "/filterSuffix/" + currentEditId,
 			type: "post",
 			data: params + "&_method=put",
			afterOperation: function(returnData){
				if(returnData.statusCode <= 200){
					$("#commonDetailForm")[0].reset();
					$('#commonDetail').window('close');
		        	PlatformUI.refreshGrid(filterSuffixList, {sortname:"createDate",sortorder:"desc"});
				}else if((returnData.statusCode >=400) && (returnData.statusCode <500) ){
				}else if(returnData.statusCode >= 500){
				}
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
