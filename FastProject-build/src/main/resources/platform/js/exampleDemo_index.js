var exampleDemoList;

$(function(){
	
	
	exampleDemoList = $("#commonList").jqGrid({ //$("#commonList")--<table id="commonList"></table>
        url: contextPath + "/exampleDemo", //请求
        datatype: "json", //返回类型
        autowidth: true,//自动宽度
        height:300,
        mtype: "GET",
        multiselect: true,//多选
        colNames: ["ID", "名称","密码","描述", "创建时间"],//表头
        colModel: [
            { name: "id", index:"id",hidden: true},//name 属性名  index 排序字段 align 居中模式 sortable 表头是否可搜索
			{ name: "name", index:"name", align:"center", sortable: true},
			{ name: "password", index:"password", align:"center", sortable: true},
			{ name: "remarks", index:"remarks", align:"center", sortable: true},

            { name: "gmtCreate",width:200, index:"gmtCreate",align:"center", searchoptions:{dataInit:PlatformUI.defaultJqueryUIDatePick}, sortable: true ,formatter:"date",formatoptions: { srcformat: "U", newformat: "Y-m-d H:i:s" }}
            ],
        pager: "#commonPager",//<div id="commonPager"></div>
        rowNum: 10,// 页大小
        rowList: [10, 20, 30], //可选择的页大小
        sortname:"gmtCreate",//默认排序字段
		sortorder:"desc",//排序方式
        viewrecords: true,
        gridview: true,
        autoencode: true,
        caption: "例子Demo列表"//标题名
    });
    
    //绑定检索事件
	$("#commonRetrieveBtn").click(function(){
		$("#commonSearchInput").val("");
		exampleDemoList.jqGrid("setGridParam", {
			postData: {filters:{}}
		});
		exampleDemoList.jqGrid('searchGrid', {multipleSearch:true,drag:false,searchOnEnter:true,top:150,left:200});
	});
	
	//绑定刷新事件
	$("#commonRefreshBtn").click(function(){
		location.href = location;
	});
	
	//绑定导出excel事件
	$("#commonExportBtn").click(function(){
		PlatformUI.exportGrid("commonList", "from example_demo");
	});
	
	//绑定普通页面查询框体点击事件
	$("#commonSearchBtn").click(function(){
		commonInputSearch();
	});
	
	//绑定查询框回车事件
	$("#commonSearchInput").keyup(function(event){
		if(event.keyCode == 13){  
        	commonInputSearch(); 
        }
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
	 		addExampleDemo();
	 	}else{
	 		updateExampleDemo();
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
		var ids = exampleDemoList.jqGrid ('getGridParam', 'selarrrow');//selarrrow:获取选中数据的id
		if(ids.length != 1){
			toastr.warning("选择一条要编辑的数据!");
			return;
		}
		currentEditId = ids[0];
		operation = "edit";
		PlatformUI.ajax({
			url: contextPath + "/exampleDemo/" + ids[0],
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
		var ids = exampleDemoList.jqGrid ('getGridParam', 'selarrrow');
		if(ids.length != 1){
			toastr.warning("选择一条要查看的数据!");
			return;
		}
		PlatformUI.ajax({
			url: contextPath + "/exampleDemo/" + ids[0],
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
		var ids = exampleDemoList.jqGrid ('getGridParam', 'selarrrow');
		if(ids.length == 0){
			toastr.warning("请至少选择一条要删除的数据!");
			return;
		}
		//批量删除ajax
		$.messager.confirm('操作','请确认删除数据',function(r){
	    	if (r){
		        PlatformUI.ajax({
					url: contextPath + "/exampleDemo",
					type: "post",
					data: {_method:"delete",ids:ids},
					afterOperation: function(){
						PlatformUI.refreshGrid(exampleDemoList, {sortname:"gmtCreate",sortorder:"desc"});
					}
				});
		    }
		});
	});
	
});


//*********************方法区**********************


//普通框体查询
function commonInputSearch(){
	var commonSearchInputValue = $("#commonSearchInput").val();
	var rules = [];
	if(commonSearchInputValue != ""){
		rules.push({"field":"name","op":"cn","data":commonSearchInputValue});
	}else{
		return;
	}
	var filters = {"groupOp":"AND","rules":rules};
	exampleDemoList.jqGrid("setGridParam", {
		postData: {filters:JSON.stringify(filters)},
		page: 1
	}).trigger("reloadGrid");
}

//弹出表单框体
function showCommonDetailWindow(){
	//表单重置
	$("#commonDetailForm")[0].reset();
	$("#commonDetailForm #id").val("");
	//验证表单
	PlatformUI.validateForm("commonDetailForm");
	$('#commonDetail').show();
	$('#commonDetail').window({
		title:"例子Demo详细信息",
	    width:750,
	    height:250,
	    modal:true
	});
	//填充复杂字段信息
}


//新增
var addExampleDemo = function(){
	if(PlatformUI.formIsValid("commonDetailForm")){//验证(如果平台界面表格有效)
 		//ajax保存
 		var params = $("#commonDetailForm").serialize(); //serialize()方法：表单序列化为键值对（key1=value1&key2=value2…）后提交
 		PlatformUI.ajax({
 			url: contextPath + "/exampleDemo",
 			type: "post",
 			data: params,
			afterOperation: function(){
				PlatformUI.refreshGrid(exampleDemoList, {sortname:"gmtCreate",sortorder:"desc"});
				$("#commonDetailForm")[0].reset();
				$('#commonDetail').window('close');
			}
 		});
 	}else{
 		toastr.warning("表单验证失败");
 	}
}

//更新
var updateExampleDemo = function(){
	if(PlatformUI.formIsValid("commonDetailForm")){
		//ajax更新
 		var params = $("#commonDetailForm").serialize();
 		PlatformUI.ajax({
 			url: contextPath + "/exampleDemo/" + currentEditId,
 			type: "post",
 			data: params + "&_method=put",
			afterOperation: function(){
				PlatformUI.refreshGrid(exampleDemoList, {
					sortname:"gmtCreate",
					sortorder:"desc",
					page:exampleDemoList.jqGrid("getGridParam").page
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
