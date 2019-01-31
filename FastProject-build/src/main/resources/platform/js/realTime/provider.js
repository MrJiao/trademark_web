//获取模式的 提供方......js
var providerList;

$(function(){
	//控制消息显示时长**********
	toastr.options={
		hideDuration:800,
		positionClass:"toast-top-center",
		timeOut:1000,
	}


	providerList = $("#commonList").jqGrid({
        url: contextPath + "/provider",
        datatype: "json",
        width:$(".data_grid").width(),
        height:document.body.clientHeight-230,
        mtype: "GET",
        multiselect: true,
        colNames: ["ID", "名字","url","备注","创建人","创建时间", "更新时间"],
        colModel: [
            { name: "id", index:"id",hidden: true},
			{ name: "name", index:"name", align:"center", sortable: true},
			{ name: "url", index:"url", align:"center", sortable: false},
			{ name: "remark", index:"remark", align:"center", sortable: false},
			{ name: "userInfo",sortable:false,align: "center",formatter: userInfoFormat },
			{ name: "createDate",width:200, index:"createDate",align:"center", hidden: true},
            { name: "gmtModified",width:200, index:"gmtModified",align:"center",formatter:gmtModifiedFormat }
		],
        pager: "#commonPager",
        rowNum: 10,
        rowList: [10, 20, 30],
        sortname:"createDate",
		sortorder:"desc",
        viewrecords: true,
        gridview: true,
        autoencode: true,
        caption: "实时数据-获取模式"
    });

    //优先显示昵称 , 如果昵称为空, 再显示userName
    function userInfoFormat (value, grid, rows, state) {
        return (value.nickName == null) ? value.username : value.nickName;
    }

    function gmtModifiedFormat (value, grid, rows, state) {
        if(!value) {
            return cusomFormatDate(rows.createDate);
        }
        return cusomFormatDate(value);
    }

	//绑定刷新事件
	$("#commonRefreshBtn").click(function(){
		location.href = location;
	});
	
	//绑定新增事件*************
	$("#commonShowAddBtn").click(function(){
		changeEditForm(true);
		operation = "add";
		showCommonDetailWindow();
	});
	
	//表单保存操作***********(新增和更新)
	$("#commonSaveBtn").click(function(){
		if(operation == "add"){
			addProvider();
		}else{
			updateProvider();
		}
	});
	
	//+号点击事件, 增加一行(事件委托)*************************
	$("#commonDetailForm").on("click","#addLine",addLine);
	//删除一行(事件委托)************************************
	$("#commonDetailForm").on("click",".offLine",deleteLine);
	 
	//表单重置操作
	$("#commonResetBtn").click(function(){
		$("#commonDetailForm")[0].reset();
		PlatformUI.validateForm("commonDetailForm");
	});
	
	//编辑时回显******************
	$("#commonShowEditBtn").click(function(){
		changeEditForm(true);
		operation = "edit";
		
		var ids = providerList.jqGrid ('getGridParam', 'selarrrow');
		if(ids.length != 1){
			toastr.warning("选择一条要编辑的数据!");
			return;
		}
		currentEditId = ids[0];		//这是一个全局变量
		PlatformUI.ajax({
			url: contextPath + "/provider/" + ids[0],
			afterOperation: function(data, textStatus,jqXHR){
				showCommonDetailWindow();
				//填充复杂数据....
				populateForm( data,"edit");
				
				//验证表单
				PlatformUI.validateForm("commonDetailForm");
			}
		});
	});
	
	//查看时回显***************************
	$("#commonViewBtn").click(function(){

		var ids = providerList.jqGrid ('getGridParam', 'selarrrow');
		if(ids.length != 1){
			toastr.warning("选择一条要查看的数据!");
			return;
		}
		PlatformUI.ajax({
			url: contextPath + "/provider/" + ids[0],
			afterOperation: function(data, textStatus,jqXHR){
				showCommonDetailWindow();
				//填充复杂数据************
				populateForm( data,"view");
                //表单回显构建完毕,在设置input只读
                changeEditForm(false);
				//验证表单
				PlatformUI.validateForm("commonDetailForm");
			}
		});
	});
	
	//批量删除事件
	$("#commonDelBtn").click(function(){
		var ids = providerList.jqGrid ('getGridParam', 'selarrrow');
		if(ids.length == 0){
			toastr.warning("请至少选择一条要删除的数据!");
			return;
		}
		//批量删除ajax
		$.messager.confirm('操作','请确认删除数据',function(r){
	    	if (r){
		        PlatformUI.ajax({
					url: contextPath + "/provider",
					type: "post",
					data: {_method:"delete",ids:ids},
					afterOperation: function(){
						PlatformUI.refreshGrid(providerList, {sortname:"createDate",sortorder:"desc"});
					}
				});
		    }
		});
	});

    //查看已申请此数据的用户
    $("#alreadyApplyDataUser").click(function () {
        var id = getSelectedId();
        if (id){
            showAlreadyApplyDataUserWindow();
            populateShowUserForm(id);
		}
    });

});

//------------------------方法区-----------------------//

// 获取所选行数据的ID
function getSelectedId() {
    var ids = providerList.jqGrid ('getGridParam', 'selarrrow');
    if(ids.length != 1){
        toastr.warning("选择一条要查看的数据!");
        return;
    }
    return ids[0];
}


//弹出表单框体**************************************
function showCommonDetailWindow(){
	//表单重置, 把jQuery对象改成dom对象, reset()是dom的方法..
	$("#commonDetailForm")[0].reset();
	$("#commonDetailForm #id").val("");
	//验证表单
	PlatformUI.validateForm("commonDetailForm");
	$('#commonDetail').show();
	$('#commonDetail').window({
		title:"获取模式-数据提供方填写",
	    modal:true,
	    maximized: true,//面板最大化
	});
	
	$(".benchmark").remove();//清空所有的 ".benchmark" , 重新构建....
	addFirstLine();			//构建第一行....

    $('.required').validatebox({
        required:true
    });
}

//弹出表单框体**************************************
function showAlreadyApplyDataUserWindow(){
    $(".showUser").show();
    $(".showUser").window({
        title:"已经申请此数据的用户", modal:true, maximized: true,//面板最大化
    });
}

var populateShowUserForm = function (id) {

    $(".userContainer").remove();// 移除上一个用户信息容器 // 构建一个专属容器
    var $dom = ["<div class='clear userContainer'> ",
        "<table id='showUserList'></table>",
        "<div id='showUserPager'></div>",
        "</div>"].join("");
    $(".showUser").append($dom);


    $("#showUserList").jqGrid({
        url: contextPath + "/provider/follower/" + id,
        datatype: "json",
        width:$(".data_grid").width(),
        height:document.body.clientHeight-185,
        mtype: "GET",
        multiselect: false,
        colNames: ["ID", "姓名","备注","上一次申请时间"],
        colModel: [
            { name: "id", index:"id",hidden: true},
            { name: "userName",sortable:false,align: "center"},
            { name: "nickName", index:"nickName", align:"center", sortable: false,formatter:nickNameFormat},
            { name: "createDate",width:200, index:"createDate",align:"center",formatter:createDateFormat }
        ],
        pager: "#showUserPager",
        rowNum: 10,
        rowList: [10, 20, 30],
        sortname:"createDate",
        sortorder:"desc",
        viewrecords: true,
        gridview: true,
        autoencode: true,
        caption: currentDataDescription()
    });

    function currentDataDescription(){
        var currentDataName = providerList.jqGrid("getCell",getSelectedId(),"name");
        var currentDataRemark = providerList.jqGrid("getCell",getSelectedId(),"remark");
        return "数据名称: " + currentDataName + "  备注: " + currentDataRemark;
    }

    //优先显示昵称 , 如果昵称为空, 再显示userName
    function nickNameFormat (value, grid, rows, state) {
        return (rows.nickName == null) ? rows.userName : rows.nickName;
    }

    function createDateFormat (value, grid, rows, state) {
        if(!value) {
            return "获取失败";
        }
        return cusomFormatDate(value);
    }
}





//新增*********************************************
var addProvider = function(){
	var flag = validate();
	if(!flag){
		toastr.warning("请将表单填写完整");
		return;
	}
	//ajax保存
	var params = getParams();
	var providerVO = {
		"name":	$("#name").val().trim(),
		"url":	$("#customUrl").val().trim(),
		"remark": $("#remark").val().trim(),
		"paramList":params
	};
    $.ajax({
        type: "POST",
        url:contextPath + "/provider",
        data: JSON.stringify(providerVO),
        contentType:"application/json; charset=utf-8",
        success: function(returnData) {

			if(returnData.statusCode <= 200){
				toastr.success(returnData.statusText);
				// location.href = location;
			}else if((returnData.statusCode >=400) && (returnData.statusCode <500) ){
				toastr.warning(returnData.statusText);
			}else if(returnData.statusCode >= 500){
				toastr.error(returnData.statusText);
			}

            $('#commonDetail').window('close');
            PlatformUI.refreshGrid(providerList, {sortname: "createDate", sortorder: "desc"});

		},
		error: function(xhr,status,error) {
			toastr.warning("创建失败, 请联系管理员");
		},
    })
}

//更新********************************
var updateProvider = function(){
	var flag = validate();
	if(!flag){
		toastr.warning("请将表单填写完整");
		return;
	}
	//ajax保存
	var params = getParams();
	var providerVO = {
		"name":	$("#name").val().trim(),
		"url":	$("#customUrl").val().trim(),
		"remark": $("#remark").val().trim(),
		"paramList":params
	};
    $.ajax({
        type: "PUT",
        url: contextPath + "/provider/" + currentEditId,
        dataType:"json",
        data: JSON.stringify(providerVO),
        contentType:"application/json; charset=utf-8",
		success: function(returnData) {
			if(returnData.statusCode <= 200){
				toastr.success(returnData.statusText);
				// location.href = location;
			}else if((returnData.statusCode >=400) && (returnData.statusCode <500) ){
				toastr.warning(returnData.statusText);
			}else if(returnData.statusCode >= 500){
				toastr.error(returnData.statusText);
			}

            $('#commonDetail').window('close');
            PlatformUI.refreshGrid(providerList, {sortname: "createDate", sortorder: "desc"});

		},
		error: function(xhr,status,error) {
			toastr.warning("创建失败, 请联系管理员");
		},
    })
	
}

//验证表单是否填写完整**********
var validate = function(){
	//简单粗暴的验证... 只要不为空就行...
	var allInput = $("#table .required");
	var allInput2 = $("#table_new .required");
	
	var flag = true;
	for(var i = 0; i < allInput.length; i++) { 	
		var temp = $(allInput[i]).val().trim();
		if((temp == null) || (temp == "") ){
			flag = false;
			break;	//增加效率
		}
	}
	for(var i = 0; i < allInput2.length; i++) { 	
		var temp = $(allInput2[i]).val().trim();
		if((temp == null) || (temp == "") ){
			flag = false;
			break;	//增加效率
		}
	}
	return flag;
}

//构建其他行, 尾巴为x号************
var addLine = function (){
    var trDom = ['<table  class = "t2 benchmark">',
        '	<tr>',
        '		<th>参数名:</th>',
        '		<td><input class="required" type="text"  /></td>',
        '		<th>示例值:</th>',
        '		<td><input class="required" type="text"  /></td>',
        '		<th rowspan="2"><a class=\'offLine\' href=\'javascript:;\'  title=\'删除此行\'>✖</a></th>',
        '	</tr>',
        '	<tr>',
        '		<th>参数类型:</th>',
        '		<td><input class="required" type="text"  /></td>',
        '		<th>描述:</th>',
        '		<td><input class="required" type="text"  /></td>',
        '	</tr>',
        '</table>'].join("");
    $("#table_new").append(trDom);
    $('.required').validatebox({
        required:true
    });
}

//构建第一行... 尾巴为+号***********
var addFirstLine = function (){
    var trDom = ['<table  class = "t2 benchmark">',
        '	<tr>',
        '		<th>参数名:</th>',
        '		<td><input class="required" type="text" placeholder="示例: user_id" /></td>',
        '		<th>示例值:</th>',
        '		<td><input class="required" type="text" placeholder="示例: 1313sdaf132" /></td>',
        '		<th rowspan="2"><a id=\'addLine\' href=\'javascript:;\'  title=\'添加一行\'>✚</a></th>',
        '	</tr>',
        '	<tr>',
        '		<th>参数类型:</th>',
        '		<td><input class="required" type="text" placeholder="示例: String" /></td>',
        '		<th>描述:</th>',
        '		<td><input class="required" type="text" placeholder="示例: 用户id" /></td>',
        '	</tr>',
        '</table>'].join("");
    $("#table_new").append(trDom);
}

//删除一行**********************************
var deleteLine = function(){
	var trDom = $(this).parent().parent().parent().parent();
	trDom.remove();
}

//获取参数数组****************************
var getParams = function (){
	var jsonArray = new Array();
	
	var len = $(".benchmark").length;//有多少个benchmark. table_new下就有几个table
	for(var i = 0; i < len; i++) { 			//遍历数组
		//jquery对象加上脚标后, 又变成dom对象...
		var row ={
			"key"		: $( $( $(".benchmark")[i] ).find("input")[0] ).val().trim(),
			"value"		: $( $( $(".benchmark")[i] ).find("input")[1] ).val().trim(),	
			"paramType"	: $( $( $(".benchmark")[i] ).find("input")[2] ).val().trim(),	
			"describe"	: $( $( $(".benchmark")[i] ).find("input")[3] ).val().trim(),	
		};
		jsonArray.push(row);
	}
	return jsonArray;
}

//回显****************************************
var populateForm = function(data,type){
	var table = $("#table");
	$("#name").val(data.name);
	$("#customUrl").val(data.url);
	$("#remark").val(data.remark);
	
	//先清空所有.benchmark, 再构建.....
	$(".benchmark").remove();
	//编辑回显....(如果是查看回显, 尾巴上不需要有 +号x号; 如果是编辑回显, 需要有;)
	if(type == "edit"){
        for(var i = 0; i < data.params.length; i++) {
            if(i == 0){
                var trDom = ['<table  class = "t2 benchmark">',
                    '	<tr>',
                    '		<th>参数名:</th>',
                    '		<td><input class="required"	type="text"  /></td>',
                    '		<th>示例值:</th>',
                    '		<td><input class="required"	type="text"  /></td>',
                    '		<th rowspan="2"><a id=\'addLine\' href=\'javascript:;\'  title=\'添加一行\'>✚</a></th>',
                    '	</tr>',
                    '	<tr>',
                    '		<th>参数类型:</th>',
                    '		<td><input class="required"	type="text"  /></td>',
                    '		<th>描述:</th>',
                    '		<td><input class="required"	type="text"  /></td>',
                    '	</tr>',
                    '</table>'].join("");
            }else{
                var trDom = ['<table  class = "t2 benchmark">',
                    '	<tr>',
                    '		<th>参数名:</th>',
                    '		<td><input class="required"	type="text"  /></td>',
                    '		<th>示例值:</th>',
                    '		<td><input class="required"	type="text"  /></td>',
                    '		<th rowspan="2"><a class=\'offLine\' href=\'javascript:;\'  title=\'删除此行\'>✖</a></th>',
                    '	</tr>',
                    '	<tr>',
                    '		<th>参数类型:</th>',
                    '		<td><input class="required"	type="text"  /></td>',
                    '		<th>描述:</th>',
                    '		<td><input class="required"	type="text"  /></td>',
                    '	</tr>',
                    '</table>'].join("");
            }
            $("#table_new").append(trDom);
        }
		
		//查看回显****
	}else if(type == "view"){
        for(var i = 0; i < data.params.length; i++) {
            var trDom = ['<table  class = "t2 benchmark">',
                '	<tr>',
                '		<th>参数名:</th>',
                '		<td><input class="required"	type="text"  /></td>',
                '		<th>示例值:</th>',
                '		<td><input class="required"	type="text"  /></td>',
                '	</tr>',
                '	<tr>',
                '		<th>参数类型:</th>',
                '		<td><input class="required"	type="text"  /></td>',
                '		<th>描述:</th>',
                '		<td><input class="required"	type="text"  /></td>',
                '	</tr>',
                '</table>'].join("");
            $("#table_new").append(trDom);
        }
	}
	//填充
	for(var i = 0; i < data.params.length; i++) { 	
		$( $( $(".benchmark")[i] ).find("input")[0] ).val(data.params[i].key);
		$( $( $(".benchmark")[i] ).find("input")[1] ).val(data.params[i].value);
		$( $( $(".benchmark")[i] ).find("input")[2] ).val(data.params[i].paramType);
		$( $( $(".benchmark")[i] ).find("input")[3] ).val(data.params[i].describe);
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
