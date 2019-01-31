var dbConfigList;

$(function(){
	//控制消息显示时长**********
	toastr.options={
		hideDuration:500,
		positionClass:"toast-top-center",
		timeOut:800,
	}
	
	dbConfigList = $("#commonList").jqGrid({
        url: contextPath + "/db",
        datatype: "json",
        autowidth: true,
        height:document.body.clientHeight-230,
        mtype: "GET",
        multiselect: true,
        colNames: [ "id","数据库用户名","数据库密码","数据库IP","数据库端口","数据库实例名","数据库别名"],
        colModel: [
            { name: "id", index:"id",hidden: true},
			{ name: "userName", index:"userName", align:"center", sortable: true},
			{ name: "passWord", index:"passWord", align:"center", sortable: true},
			{ name: "ipAddr", index:"ipAddr", align:"center", sortable: true},
			{ name: "port", index:"port", align:"center", sortable: true},
			{ name: "instName", index:"instName", align:"center", sortable: true},
			{ name: "nickName", index:"nickName", align:"center", sortable: true},
        ],
        pager: "#commonPager",
        rowNum: 10,
        rowList: [10, 20, 30],
        viewrecords: true,
        gridview: true,
        autoencode: true,
        caption: "数据库账号信息"
    });
    
	//绑定刷新事件*******一定要location.href = location;以免IE9会提示下载
	$("#commonRefreshBtn").click(function(){
		location.href = location;
	});
	
	
	//绑定新增事件
	$("#commonShowAddBtn").click(function(){
		changeEditForm(true);
		operation = "add";
		showCommonDetailWindow();
	});
	
	//测试链接****************************
	
	$("#testDataBase").click(function(){
		testDataBase();
	});
	
	//表单保存操作
	 $("#commonSaveBtn").click(function(){
	 	if(operation == "add"){
	 		addDbConfig();
	 	}else{
	 		updateDbConfig();
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
		var ids = dbConfigList.jqGrid ('getGridParam', 'selarrrow');
		if(ids.length != 1){
			toastr.warning("选择一条要编辑的数据!");
			return;
		}
		currentEditId = ids[0];
		operation = "edit";
		PlatformUI.ajax({
			url: contextPath + "/db/" + ids[0],
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
		var ids = dbConfigList.jqGrid ('getGridParam', 'selarrrow');
		if(ids.length != 1){
			toastr.warning("选择一条要查看的数据!");
			return;
		}
		PlatformUI.ajax({
			url: contextPath + "/db/" + ids[0],
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
		var ids = dbConfigList.jqGrid ('getGridParam', 'selarrrow');
		if(ids.length == 0){
			toastr.warning("请至少选择一条要删除的数据!");
			return;
		}
		//批量删除ajax
		$.messager.confirm('操作','请确认删除数据',function(r){
	    	if (r){
		        PlatformUI.ajax({
					url: contextPath + "/db",
					type: "post",
					data: {_method:"delete",ids:ids},
					afterOperation: function(){
						PlatformUI.refreshGrid(dbConfigList, {sortname:"createDate",sortorder:"desc"});
					}
				});
		    }
		});
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
		title:"新增-数据库账号",
	    width:400,
	    height:400,
	    modal:true
	});
	//填充复杂字段信息
}

//测试这个链接****************************************************
function testDataBase(){
	if(PlatformUI.formIsValid("commonDetailForm")){//验证
		toastr.warning("校验中, 请稍等......");
 		//ajax保存
 		var params = $("#commonDetailForm").serialize();
 		PlatformUI.ajax({
 			url: contextPath + "/db/test",
 			type: "post",
 			data: params,
			afterOperation: function(returnData){
			}
 		});
 	}else{
 		toastr.warning("表单验证失败");
 	}
}

//新增**********************************************************
var addDbConfig = function(){
	if(PlatformUI.formIsValid("commonDetailForm")){//验证
		//校验中, 把commonSaveBtn按钮禁用, 以免用户不停点击, 请求返回后,再接禁;
		toastr.warning("校验中, 请稍等......");
		$("#commonSaveBtn").attr("disabled", true);

 		//ajax保存
 		var params = $("#commonDetailForm").serialize();
 		PlatformUI.ajax({
 			url: contextPath + "/db",
 			type: "post",
 			data: params,
			afterOperation: function(returnData){
				//把按钮解禁
				$("#commonSaveBtn").attr("disabled",false);
				
				if(returnData.statusCode <= 200){
					//保存成功后, 还需要把右边栏清空并隐藏, 关闭sourceDBTable窗口
					$("#commonDetailForm")[0].reset();
					$('#commonDetail').window('close');
		        	PlatformUI.refreshGrid(dbConfigList);
				}else if((returnData.statusCode >=400) && (returnData.statusCode <500) ){
				}else if(returnData.statusCode >= 500){
				}
			}
 		});
 	}else{
 		toastr.warning("表单验证失败");
 	}
}

//更新***********************************************************
var updateDbConfig = function(){
	if(PlatformUI.formIsValid("commonDetailForm")){
		//校验中, 把commonSaveBtn按钮禁用, 以免用户不停点击, 请求返回后,再接禁;
		toastr.warning("校验中, 请稍等......");
		$("#commonSaveBtn").attr("disabled", true);
		
		//ajax更新
 		var params = $("#commonDetailForm").serialize();
 		PlatformUI.ajax({
 			url: contextPath + "/db/" + currentEditId,
 			type: "post",
 			data: params + "&_method=put",
			afterOperation: function(returnData){
				//把按钮解禁
				$("#commonSaveBtn").attr("disabled",false);
				if(returnData.statusCode <= 200){
					PlatformUI.refreshGrid(dbConfigList, 
							{page:dbConfigList.jqGrid("getGridParam").page});
					$("#commonDetailForm")[0].reset();
					$('#commonDetail').window('close');
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
