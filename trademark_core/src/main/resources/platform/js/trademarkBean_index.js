$.namespace("trademarkBean_index.P");
$.namespace("trademarkBean_index.M");
$.namespace("trademarkBean_index.V");
$(function () {
    trademarkBean_index.P.init();
});

trademarkBean_index.V = (function (){
    var trademarkBeanList;

    return{
        init: function (){
            trademarkBeanList = $("#commonList").jqGrid({
                url: contextPath + "/trademarkBean",
                datatype: "json",
                autowidth: true,
                height:document.body.clientHeight-230,
                mtype: "GET",
                multiselect: true,
                colNames: ["id","页码编号","商标号","期号","申请日期","商标名","申请人","地址","代理机构","异议期限-开始","异议期限-截止","公告日期","类型","被选择的类型","外国申请人","外国代理所","外国邮箱","备注","创建时间"],
                colModel: [
                    { name: "id", index:"id",align:"center",hidden: true, sortable: true},
                    { name: "page_no", index:"page_no",align:"center", sortable: true},
                    { name: "number", index:"number",align:"center",hidden: false, sortable: true},
                    { name: "anNum", index:"anNum",align:"center",hidden: false, sortable: true},
                    { name: "applicationDate", index:"applicationDate",align:"center",hidden: false, sortable: true,searchoptions:{dataInit:PlatformUI.defaultJqueryUIDatePick},formatter:"date",formatoptions: { srcformat: "U", newformat: "Y-m-d H:i:s" }},
                    { name: "name", index:"name",align:"center",hidden: false, sortable: true},
                    { name: "applicant", index:"applicant",align:"center",hidden: false, sortable: true},
                    { name: "address", index:"address",align:"center",hidden: false, sortable: true},
                    { name: "agency", index:"agency",align:"center",hidden: false, sortable: true},
                    { name: "yiyiStartDate", index:"yiyiStartDate",align:"center",hidden: false, sortable: true,searchoptions:{dataInit:PlatformUI.defaultJqueryUIDatePick},formatter:"date",formatoptions: { srcformat: "U", newformat: "Y-m-d H:i:s" }},
                    { name: "yiyiEndDate", index:"yiyiEndDate",align:"center",hidden: false, sortable: true,searchoptions:{dataInit:PlatformUI.defaultJqueryUIDatePick},formatter:"date",formatoptions: { srcformat: "U", newformat: "Y-m-d H:i:s" }},
                    { name: "ann_date", index:"ann_date",align:"center",hidden: false, sortable: true,searchoptions:{dataInit:PlatformUI.defaultJqueryUIDatePick},formatter:"date",formatoptions: { srcformat: "U", newformat: "Y-m-d H:i:s" }},
                    { name: "type", index:"type",align:"center",hidden: true, sortable: true},
                    { name: "choosedType", index:"choosedType",align:"center",hidden: true, sortable: true},
                    { name: "client", index:"client",align:"center",hidden: false, sortable: true},
                    { name: "representatives", index:"representatives",align:"center",hidden: false, sortable: true},
                    { name: "email", index:"email",align:"center",hidden: false, sortable: true},
                    { name: "remark", index:"remark",align:"center",hidden: false, sortable: true},
                    { name: "gmt_create", index:"gmt_create",align:"center",hidden: true, sortable: true,searchoptions:{dataInit:PlatformUI.defaultJqueryUIDatePick},formatter:"date",formatoptions: { srcformat: "U", newformat: "Y-m-d H:i:s" }}
                ],
                pager: "#commonPager",
                rowNum: 10,
                rowList: [10, 20,40,80],
                sortname:"page_no",
                sortorder:"asc",
                viewrecords: true,
                gridview: true,
                autoencode: true,
                caption: "商标数据"
            });
        },
        getJqGrid: function () {
            return trademarkBeanList;
        },
        flushPage: function () {
            location.href = location;
        },//查看/编辑form切换函数
        changeEditForm:function (flag){
            if(flag){
                $("#commonDetailBtnKit").show();
            }else{
                $("#commonDetailBtnKit").hide();
            }
            $("#commonDetailForm input").each(function(){
                $(this).attr("readOnly", !flag);
            });
        },
        //弹出表单框体
        showCommonDetailWindow:function (){
            //表单重置
            $("#commonDetailForm")[0].reset();
            $("#commonDetailForm #id").val("");
            //验证表单
            this.validateForm();
            $('#commonDetail').show();
            $('#commonDetail').window({
                title:"交付规则详细信息",
                width:1075,
                height:650,
                modal:true
            });
            //填充复杂字段信息
        },
        closeCommonDetailWindow:function(){
            $('#commonDetail').window('close');
        },
        resetForm : function () {
            $("#commonDetailForm")[0].reset();
        },
        //展示再次确认弹框
        showConfirm : function (title,content,callback) {
            $.messager.confirm(title,content,callback);
        },
        refreshGrid:function () {
            PlatformUI.refreshGrid(this.getJqGrid(), {sortname:"page_no",sortorder:"desc"});
        },
        populateForm: function (data) {
            data["applicationDate"] = ExtendDate.getSmpFormatDateByLong(data["applicationDate"], false);
            data["yiyiStartDate"] = ExtendDate.getSmpFormatDateByLong(data["yiyiStartDate"], false);
            data["yiyiEndDate"] = ExtendDate.getSmpFormatDateByLong(data["yiyiEndDate"], false);
            data["ann_date"] = ExtendDate.getSmpFormatDateByLong(data["ann_date"], false);
            data["gmt_create"] = ExtendDate.getSmpFormatDateByLong(data["gmt_create"], false);
            PlatformUI.populateForm("commonDetailForm", data);
        },
        validateForm: function () {
            PlatformUI.validateForm("commonDetailForm");
        },
        showWarning: function (msg) {
            toastr.warning(msg);
        },
        setTrademarkUrl:function(id){
            $("#img_trademark").attr("src", contextPath+"/trademarkBean/image/"+id);
        }
    };
})();

trademarkBean_index.M = (function (){
    var V = trademarkBean_index.V;
    function downloadFile(url) {
        try{
            var elemIF = document.createElement("iframe");
            elemIF.src = url;
            elemIF.style.display = "none";
            document.body.appendChild(elemIF);
        }catch(e){

        }
    };
    var ids;
    var currentPage=0;
    return{
        initPage:function(){
            currentPage=0;
        },
        //获取选中的ids
        getJQSelectIds: function () {
            ids = V.getJqGrid().jqGrid('getGridParam', 'selarrrow');
            return ids;
        },
        //获取当前页
        getJqPage: function(){
            return V.getJqGrid().jqGrid("getGridParam").page;
        },
        //获取搜索框内容
        getSearchId:function () {
            return $("#commonSearchInput").val();
        },
        //发起搜索
        postSearch: function (searchId){
            var rules = [];
            if(searchId != ""){
                rules.push({"field":"id","op":"cn","data":searchId});
            }else{
                return;
            }
            var filters = {"groupOp":"AND","rules":rules};
            V.getJqGrid().jqGrid("setGridParam", {
                postData: {filters:JSON.stringify(filters)},
                page: 1
            }).trigger("reloadGrid");
        },
        //新增
        postFormData : function(){
            //验证
            if(PlatformUI.formIsValid("commonDetailForm")){
                //ajax保存
                var params = $("#commonDetailForm").serialize();
                PlatformUI.ajax({
                    url: contextPath + "/trademarkBean",
                    type: "post",
                    data: params,
                    afterOperation: function(){
                        V.refreshGrid();
                        V.resetForm();
                    }
                });
            }else{
                toastr.warning("表单验证失败");
            }
        },
        //更新
        updateItemData : function(selectId){
            if(PlatformUI.formIsValid("commonDetailForm")){
                //ajax更新
                var params = $("#commonDetailForm").serialize();
                PlatformUI.ajax({
                    url: contextPath + "/trademarkBean/" + selectId,
                    type: "post",
                    data: params + "&_method=put",
                    afterOperation: function(){
                        PlatformUI.refreshGrid(V.getJqGrid(), {
                            sortname:"page_no",
                            sortorder:"desc",
                            page:this.getJqPage()
                        });
                        //V.closeCommonDetailWindow();
                    }
                });
            }else{
                toastr.warning("表单验证失败");
            }
        },
        //获取单条jqgrid行数据
        getItemData : function(id,callback){
            PlatformUI.ajax({
                url: contextPath + "/trademarkBean/" + id,
                afterOperation: callback});
        },
        //批量删除
        batchDeleteItemDate:function (ids,callback) {
            PlatformUI.ajax({
                url: contextPath + "/trademarkBean",
                type: "post",
                data: {_method:"delete",ids:ids},
                afterOperation:callback
            });
        },

        exportName:function(ids){
            var url=contextPath + "/trademarkBean/trademark_name?";
            for( var index in ids){
                url = url+'ids[]='+ids[index]+'&';
            }
            url = url.substr(0,url.length-1);
            downloadFile(url);
        },
        exportAllName:function(){
            var url=contextPath + "/trademarkBean/trademark_all_name";
            downloadFile(url);
        },
        exportAllNumber:function(){
            var url=contextPath + "/trademarkBean/trademark_all_number";
            downloadFile(url);
        },
        exportZip:function(ids){
            var url=contextPath + "/trademarkBean/trademark_zip?";
            var liushui = $("#inputLiuShui").val();
            if(liushui==null || liushui==''){
                toastr.warning("请输入流水号");
                return;
            }

            for( var index in ids){
                url = url+'ids[]='+ids[index]+'&';
            }
            url = url+"liushui="+liushui;
            downloadFile(url);
        },
        exportAllZip:function(){
            var url=contextPath + "/trademarkBean/trademark_all_zip?";
            var liushui = $("#inputLiuShui").val();
            if(liushui==null || liushui==''){
                toastr.warning("请输入流水号");
                return;
            }
            url = url+"liushui="+liushui;
            downloadFile(url);
        },
        sameNameSearch: function (annm) {
            V.getJqGrid().setGridParam({url:contextPath +"/trademarkBean/sameName/"+annm}).trigger("reloadGrid");
        },
        getAnnm: function () {
            return $("#inputAnnm").val();
        },
        nextPage:function(){
            if(currentPage<ids.length-1)
                currentPage++;
        },
        prePage:function(){
            if(currentPage>0)
                currentPage--;
        },
        getCurrentPageId:function(){
           return ids[currentPage];
        },
        //批量高精度识别
        batchGaoItemDate:function (ids,callback) {
            PlatformUI.ajax({
                url: contextPath + "/trademarkBean/gao",
                type: "post",
                data: {_method:"put",ids:ids},
                afterOperation:callback
            });
        },
        //高精度识别
        gaoItemDate:function (id,callback) {
            PlatformUI.ajax({
                url: contextPath + "/trademarkBean/gao/"+id,
                type: "post",
                data: {_method:"put"},
                afterOperation:callback
            });
        },
    };
})();

trademarkBean_index.P = (function (){
    var M = trademarkBean_index.M;
    var V = trademarkBean_index.V;
    function checkSelected() {
        var ids = M.getJQSelectIds();
        if (ids.length < 1) {
            V.showWarning("选择一条数据!");
            return false;
        }
        return true;
    }

    function initListener() {
        //绑定检索事件
        $("#commonRetrieveBtn").click(function(){
            V.getJqGrid().setGridParam({url:contextPath +"/trademarkBean"});
            $("#commonSearchInput").val("");
            V.getJqGrid().jqGrid("setGridParam", {
                postData: {filters:{}}
            });
            V.getJqGrid().jqGrid('searchGrid', {multipleSearch:true,drag:false,searchOnEnter:true,top:150,left:200});
        });

        //绑定刷新事件
        $("#commonRefreshBtn").click(function(){
            V.flushPage();
        });

        //绑定导出excel事件
        $("#commonExportBtn").click(function(){
            //PlatformUI.exportGrid("commonList", "from jackson_delivery_rule");
        });

        //绑定普通页面查询框体点击事件
        $("#commonSearchBtn").click(function(){
            V.getJqGrid().setGridParam({url:contextPath +"/trademarkBean"});
            M.postSearch(M.getSearchId());
        });

        //绑定查询框回车事件
        $("#commonSearchInput").keyup(function(event){
            if(event.keyCode == 13){
                M.postSearch(M.getSearchId());
            }
        });

        //绑定新增事件
        $("#commonShowAddBtn").click(function(){
            V.changeEditForm(true);
            operation = "add";
            V.showCommonDetailWindow();
        });

        //表单保存操作
        $("#commonSaveBtn").click(function(){
            if(operation == "add"){
                M.postFormData();
            }else{
                M.updateItemData(M.getCurrentPageId());

            }
        });

        //表单重置操作
        $("#commonResetBtn").click(function(){
            V.resetForm();
            V.validateForm();
        });

        //编辑按钮
        $("#commonShowEditBtn").click(function(){
            M.initPage();
            V.changeEditForm(true);
            var ids =   M.getJQSelectIds();
            operation = "edit";
            M.getItemData(ids[0],function(data, textStatus,jqXHR){
                V.showCommonDetailWindow();
                V.populateForm(data);
                V.setTrademarkUrl(ids[0]);
                //填充复杂数据
                //验证表单
                V.validateForm();
            })
        });

        //查看按钮
        $("#commonViewBtn").click(function(){
            var ids = V.getJqGrid().jqGrid ('getGridParam', 'selarrrow');
            if(!checkSelected())return;
            M.getItemData(ids[0],function(data, textStatus,jqXHR){
                V.showCommonDetailWindow();
                V.populateForm(data);
                V.changeEditForm(false);
                //填充复杂数据
                //验证表单
                V.validateForm();
            })
        });

        //批量删除事件
        $("#commonDelBtn").click(function(){
            var ids = M.getJQSelectIds();
            if(!checkSelected())return;
            //批量删除ajax

            V.showConfirm('操作','请确认删除数据',function(isOk){
                if (isOk){
                    M.batchDeleteItemDate(ids,function(){
                        V.refreshGrid();
                    });
                }
            });
        });
        //导出商标名称
        $("#exportBtn").click(function(){
            var ids = M.getJQSelectIds();
            M.exportName(ids);
        });

        //导出商标名称
        $("#exportAllNameBtn").click(function(){
            M.exportAllName();
        });

        //导出注册号/商标号
        $("#exportNumberBtn").click(function(){
            M.exportAllNumber();
        });

        //导出商标名称
        $("#exportZipBtn").click(function(){
            var ids = M.getJQSelectIds();
            M.exportZip(ids);
        });
        $("#exportAllZipBtn").click(function(){
            M.exportAllZip();
        });


        $("#sameNameSearchBtn").click(function () {
            var annm = M.getAnnm();
            M.sameNameSearch(annm);
        });

        $("#commonNextPage").click(function () {

            M.nextPage();
            operation = "edit";
            var id = M.getCurrentPageId();
            M.getItemData(id,function(data, textStatus,jqXHR){
                V.showCommonDetailWindow();
                V.populateForm(data);
                V.setTrademarkUrl(id);
                //填充复杂数据
                //验证表单
                //V.validateForm();
            })
        });

        $("#commonPrePage").click(function () {
            M.prePage();
            operation = "edit";
            var id = M.getCurrentPageId();
            M.getItemData(id,function(data, textStatus,jqXHR){
                V.showCommonDetailWindow();
                V.populateForm(data);
                V.setTrademarkUrl(id);
            })
        });

        $("#commonGao").click(function () {
            var id = M.getCurrentPageId();
            M.gaoItemDate(id,function (data) {
                V.showCommonDetailWindow();
                V.populateForm(data);
                V.setTrademarkUrl(id);
            });
        });

        $("#commonBatchGao").click(function () {
            var ids = M.getJQSelectIds();
            M.batchGaoItemDate(ids,function () {
                V.refreshGrid();
            });
        });
    }

    return {
        init: function () {
            V.init();
            initListener();
        }
    }
})();

