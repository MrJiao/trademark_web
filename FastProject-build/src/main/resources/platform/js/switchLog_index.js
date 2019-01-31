//**************************************
var switchLogList;

$(function(){
	//控制消息显示时长**********
	toastr.options={
		hideDuration:500,
		positionClass:"toast-top-center",
		timeOut:800,
	}
	
	switchLogList = $("#commonList").jqGrid({
        url: contextPath + "/switchLog",
        datatype: "json",
        autowidth: true,
        height:document.body.clientHeight-230,
        mtype: "GET",
        multiselect: true,
        colNames: ["ID","任务名称","交换类型","开始时间","结束时间","传输状态","错误详情"],
        colModel: [
            { name: "id", index:"id",hidden: true},
            { name: "taskName", index:"taskName", align:"center", sortable: true},
			{ name: "type", index:"type", align:"center", sortable: true,
            	//value 当前单元格的值, rows当前行的值, 其余两个是jqGrid定义的
            	//type=1,则显示"结构化"; type=2,则显示"非结构化"
				formatter: function (value, grid, rows, state) { 
					if(value == "1"){
						return "结构化";
					}else{
						return "非结构化";
					}
				},
			},
			{ name: "startTime",width:200, index:"startTime",align:"center", 
				searchoptions:{dataInit:PlatformUI.defaultJqueryUIDatePick}, 
				sortable: false ,formatter:"date",formatoptions: { srcformat: "U", newformat: "Y-m-d H:i:s" }
			},
			{ name: "endTime",width:200, index:"endTime",align:"center", 
				searchoptions:{dataInit:PlatformUI.defaultJqueryUIDatePick}, 
				sortable: false ,formatter:"date",formatoptions: { srcformat: "U", newformat: "Y-m-d H:i:s" }
			},
			{ name: "state", index:"state", align:"center", sortable: false,
				//参照switchData_inde.js
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
							myState="失败";
							break;
						case 3:
							myState="传输完成";
							break;
					}
					return myState;
				},
			},
			{ name: "resultMessage", index:"resultMessage", align:"center", sortable: false,
				formatter: function (value, grid, rows, state) { 
					if((value == null)|| (value == "") ){
						return "无错误"
					}else{
						return value;
					}
				}
			},
		],
        pager: "#commonPager",
        rowNum: 10,
        rowList: [10, 20, 30],
        sortname:"taskName",
		sortorder:"desc",
        viewrecords: true,
        gridview: true,
        autoencode: true,
        caption: "两级数据交换日志列表"
    });
    
    //绑定检索事件
	$("#commonRetrieveBtn").click(function(){
		$("#commonSearchInput").val("");
		switchLogList.jqGrid("setGridParam", {
			postData: {filters:{}}
		});
		switchLogList.jqGrid('searchGrid', {
			multipleSearch:true,drag:false,searchOnEnter:true,top:150,left:200
		});
	});
	
	//绑定刷新事件
	$("#commonRefreshBtn").click(function(){
		location.href = location;
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
	
	//批量删除事件
	$("#commonDelBtn").click(function(){
		var ids = switchLogList.jqGrid ('getGridParam', 'selarrrow');
		if(ids.length == 0){
			toastr.warning("请至少选择一条要删除的数据!");
			return;
		}
		//批量删除ajax
		$.messager.confirm('操作','请确认删除数据',function(r){
	    	if (r){
		        PlatformUI.ajax({
					url: contextPath + "/switchLog",
					type: "post",
					data: {_method:"delete",ids:ids},
					afterOperation: function(){
						PlatformUI.refreshGrid(switchLogList, {sortname:"taskName",sortorder:"desc"});
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
		rules.push({"field":"taskName","op":"cn","data":commonSearchInputValue});
	}else{
		return;
	}
	var filters = {"groupOp":"AND","rules":rules};
	switchLogList.jqGrid("setGridParam", {
		postData: {filters:JSON.stringify(filters)},
		page: 1
	}).trigger("reloadGrid");
}
