
//jqgrid导出excel
function exportGrid(gridId, sqlTemplate, fileName, extraParams){
	var exportUrl = contextPath + "/export/jqgrid";
	var checkBoxTemplate = "<input role='checkbox' id='cb_list' class='cbox' type='checkbox'/>";
	var colModels = $("#" + gridId).jqGrid('getGridParam','colModel');
	var colNames = $("#" + gridId).jqGrid('getGridParam','colNames');
	var ids = $("#" + gridId).jqGrid ('getGridParam', 'selarrrow');
	var postData = $("#" + gridId).jqGrid ('getGridParam', 'postData');
	var caption = $("#" + gridId).jqGrid ('getGridParam', 'caption');
	var fields = [];
	var enabledColNameIndex = [];
	for(var i = 0;i < colModels.length; i++){
		var col = colModels[i];
		if(!col.hidden && col.name != "cb" && col.name.indexOf("customColumn") == -1){
			enabledColNameIndex.push(i);
			fields.push(col.index);
		}
	}
	var filterColNames = [];
	for(var i = 0;i < enabledColNameIndex.length;i++){
		filterColNames.push(colNames[enabledColNameIndex[i]]);
	}
	var fieldsParam = fields.join();
	var colNameParam = filterColNames.join();
	//装载列表头参数，列表字段参数
	var params = {};
	params.colNameParam = colNameParam;
	params.fieldsParam = fieldsParam;
	if(ids.length != 0){
		idsParam = ids.join();
		params.ids = idsParam;
	}
	//装载当前的jqgrid条件参数
	params = $.extend(params, postData);
	//装载hqlTemplaate和文件名称参数
	if(!fileName){
		fileName = caption + ".xls";
	}
	params.fileName = fileName;
	params.sqlTemplate = sqlTemplate;
	//装载格外的参数
	params = $.extend(params, extraParams);
	//构造form表单，进行post提交
	if($("#common_exportForm").get(0)){
		$("#common_exportForm").remove();
	}
	var form = $(document.createElement('form'))
		.attr("id", "common_exportForm").attr('action', exportUrl)
			.attr('method','post').css("display", "none");
    $('body').append(form);
    for(var attr in params){
    	var key = attr, value = params[attr];
    	if(value != ""){
		 	$(document.createElement('input')).attr('type', 'hidden').attr('name', key).attr('value', value).appendTo(form);
		}
    }
    $(form).submit();
}

//自定义ajax方法
function ajax(options){
	$.ajax({
		url: options.url,
		dataType: options.dataType || "json",
		type: options.type || "get",
		data: options.data,
		success: function(data, textStatus,jqXHR){
			if(data.hasOwnProperty("message")){
				data = data.message
			}
			if(data.status){
				if(data.status == 1 || data.status == 200){
					toastr.success(data.statusText);
				}else{
					toastr.error(data.statusText);
				}
			}
			if(options.afterOperation){
				options.afterOperation(data, textStatus,jqXHR);
			}
		},
		error:function(data, textStatus,jqXHR){
			if(!(data.status == 200)){
				toastr.error("服务器异常");
			}
			if(options.afterOperation){
				options.afterOperation(data, textStatus,jqXHR);
			}
		}
	});
}

//判断表单是否验证合法
function formIsValid(formId){
	var flag = true;
	$("#" + formId).find(".easyui-validatebox").each(function(index, e){
		if(!$(e).validatebox("isValid")){
			flag = $(e).validatebox("isValid");
			return false;
		}
	});
	return flag;
}

//启动form验证
function validateForm(formId){
	$("#" + formId).find(".easyui-validatebox").each(function(index, e){
		$(e).validatebox("validate");
	});
}


//列表刷新
function refreshGrid(grid, options, url){
	var defaultSortName = grid.jqGrid('getGridParam','sortname');
	var defaultSortOrder = grid.jqGrid('getGridParam','sortorder');
	var objOptions = {
		postData: {filters:{}},
		sortname: options.sortname || defaultSortName,//"createDate"
		sortorder: options.sortorder || defaultSortOrder,//"desc"
		page: options.page || 1
	};
	if(url){
		objOptions.url = url;
	}
	grid.jqGrid("setGridParam", objOptions).trigger("reloadGrid");
}

//填充表单
var populateForm = function(formId, data){
	for(var attr in data){
		var formField = $("#" + attr);
		if(!formField[0]){
			formField = $("#" + formId).find("input[name=" + attr + "]");
		}
		if(formField[0]){
			if(formField.attr("type") == "radio"
					|| formField.attr("type") == "checkbox"){
				for(var i = 0;i < formField.length;i++){
					if($(formField.get(i)).attr("value") == data[attr].toString()){
						$(formField.get(i)).prop("checked", true);
					}
				}
			}else if(formField.get(0).nodeName.toLowerCase() == "select"){
				if(data[attr]){
					formField.find("option[value=" + data[attr] + "]").prop('selected', true);
				}else{
					formField.find("option:first").prop("selected", true);
				}
			}else{
				formField.val(data[attr]);
			}
		}
	}
}

//jqgrid查询时候的日期控件
var datePick = function(elem){
	$("#" + elem.id).datepicker({dateFormat: "yy-mm-dd"});
}

//jqGrid boolean字段的显示
var ynFormatter = function(cellvalue, options, rowObject){
	if(cellvalue == true){
		return "是";
	}else{
		return "否";
	}
}

//根据父级码值加载码表comboTree
function loadCodeToComboTree(inputId, code, required){
	if(required == undefined){
		required = true;
	}
	var combotree =  $("#" + inputId).combotree({
		required: required,
		url: contextPath + "/code/children/code",
	    method:"get",
	    queryParams:{code: code},
	    loadFilter: function(data){
	    	return formatEasyUITreeData(data);//格式化数据
	    }
	});
	return combotree;
}

//根据父级id加载码表comboTree
function loadCodeByIdToComboTree(inputId, id, required){
	if(required == undefined){
		required = true;
	}
	var combotree =  $("#" + inputId).combotree({
		required: required,
		url: contextPath + "/code/children/" + id,
	    method:"get",
	    loadFilter: function(data){
	    	return formatEasyUITreeData(data);//格式化数据
	    }
	});
	return combotree;
}

//通过ztreeAPI进行格式化然后传递给easyUI的combotree
function formatEasyUITreeData(data){
	$(data).each(function(){
		this.text = this.name;
	});
	var utilTreeSetting = {
		data: {
			simpleData: {
				enable: true
			}
		}
	};
	if(!$("#utilTree").get(0)){
		$("body").append("<div style='display:none;'><ul id='utilTree'></ul></div>");
	}
	var utilTree = $.fn.zTree.init($("#utilTree"), utilTreeSetting);
	var nodes = utilTree.transformTozTreeNodes(data);
	return nodes;
}

//构建工具zTree
function buildUtilZtree(data){
	var utilTreeSetting = {
		data: {
			simpleData: {
				enable: true
			}
		}
	};
	if(!$("#utilTree2").get(0)){
		$("body").append("<div style='display:none;'><ul id='utilTree2'></ul></div>");
	}
	var utilTree = $.fn.zTree.init($("#utilTree2"), utilTreeSetting, data);
	return utilTree;
}

//行政区划加载
function loadRegion(inputId, parentId, option){
	if(!option){
		option = {};
	}
	var combobox =  $("#" + inputId).combobox({
		required: option.required == null ? false : option.required,
		url: contextPath + "/region/parent/" + parentId,
	   	valueField:'id',
	   	textField:'codeName',
	   	onSelect: option.onSelect,
	   	onUnselect: option.onUnselect,
	   	onBeforeLoad: option.onBeforeLoad,
	   	onLoadSuccess: option.onLoadSuccess,
	   	onLoadError: option.onLoadError
	});
	return combobox;
}

//根据父级id加载所有子组织机构
function loadOrgChildrenByIdToComboTree(inputId, id, required){
	if(required == undefined){
		required = true;
	}
	var combotree =  $("#" + inputId).combotree({
		required: required,
		url: contextPath + "/org/children/" + id,
	    method:"get",
	    loadFilter: function(data){
	    	return formatEasyUITreeData(data);//格式化数据
	    }
	});
	return combotree;
}

//根据父级的组织机构类型加载所有子组织机构
function loadOrgChildrenToComboTree(inputId, typeCode, required){
	if(required == undefined){
		required = true;
	}
	var combotree =  $("#" + inputId).combotree({
		required: required,
		url: contextPath + "/org/children/code",
	    method:"get",
	    queryParams:{typeCode: typeCode},
	    loadFilter: function(data){
	    	return formatEasyUITreeData(data);//格式化数据
	    }
	});
	return combotree;
}

//根据组织机构类型加载所有组织机构
function loadOrgToComboTree(inputId, typeCode, required){
	if(required == undefined){
		required = true;
	}
	var combotree =  $("#" + inputId).combotree({
		required: required,
		url: contextPath + "/org/list/code",
	    method:"get",
	    queryParams:{typeCode: typeCode},
	    loadFilter: function(data){
	    	return formatEasyUITreeData(data);//格式化数据
	    }
	});
	return combotree;
}

//系统所有人员加载
function loadSystemPerson(inputId, option){
	if(!option){
		option = {};
	}
	var combobox =  $("#" + inputId).combobox({
		required: option.required == null ? false : option.required,
		url: contextPath + "/person/list/all",
	   	valueField:'id',
	   	textField:'personName',
	   	onSelect: option.onSelect,
	   	onUnselect: option.onUnselect,
	   	onBeforeLoad: option.onBeforeLoad,
	   	onLoadSuccess: option.onLoadSuccess,
	   	onLoadError: option.onLoadError
	});
	return combobox;
}

//判断字符串是否为空
function strIsNotEmpty(str){
	if(str != "" && str != null){
		return true;
	}else{
		return false;
	}
}