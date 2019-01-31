/**
 * 定义对象: 非结构化数据交换任务
 */

DATAX.FileSwitch = new function () {

    var self = this;
    var isPage = "fileSwitch";
    var fileSwitchConfigList;//非结构化数据交换,任务列表
    //做定时的任务id***************
    var taskIdForCron;

    self.model = (function () {

        return {

            defaultGrid: function () {
                fileSwitchConfigList = $("#fileSwitchList").jqGrid({
                    url: contextPath + "/fileSwitchConfig",
                    datatype: "json",
                    autowidth: true,
                    height:document.body.clientHeight-230,
                    mtype: "GET",
                    multiselect: true,
                    colNames: ["ID","任务名称", "已选文件类型", "任务详情", "创建时间","开始时间","结束时间","传输状态"],
                    colModel: [{name: "id", index: "id", hidden: true},
                        {name: "taskName", index: "taskName", align: "center", sortable: true},
                        {name: "filterSuffix", index: "filterSuffix", align: "center", sortable: false,
                            formatter: function (value, grid, rows, state) { //value 当前单元格的值, rows当前行的值, 其余两个是jqGrid定义的
                                return (value == null ) ? ("全选") : (value.name);
                            }},
                        {name: "showTaskDetail", index: "showTaskDetail", align: "center",
                            formatter: function (value, grid, rows, state) {
                                return '<a href="javascript:void(0)" style="color:#47a8ea" class="showHiddenTaskDetail" name=\"'+rows.id+'\" >点击查看</a>';
                            }},
                        {name: "createDate", width: 200, index: "createDate", align: "center",
                            searchoptions: {dataInit: PlatformUI.defaultJqueryUIDatePick},sortable: true,
                            formatter: "date", formatoptions: {srcformat: "U", newformat: "Y-m-d H:i:s"}
                        },
                        {name: "startTime",hidden: false,sortable:false,align: "center",
                            searchoptions: {dataInit: PlatformUI.defaultJqueryUIDatePick},sortable: true,
                            formatter: "date", formatoptions: {srcformat: "U",	newformat: "Y-m-d H:i:s"}
                        },
                        {name: "endTime",hidden: false,sortable:false,align: "center",
                            searchoptions: {dataInit: PlatformUI.defaultJqueryUIDatePick},sortable: true,
                            formatter: "date", formatoptions: {srcformat: "U",	newformat: "Y-m-d H:i:s"}
                        },
                        {name: "state", index: "state", align: "center", sortable: true,
                            formatter: function (value, grid, rows, state) {
                                switch (value) {
                                    case null:
                                        value = "";
                                        break;
                                    case DATAX.WAITING:
                                        value = "";//排队中
                                        break;
                                    case DATAX.START:
                                        value = "拷贝中";
                                        break;
                                    case DATAX.ERROR:
                                        value = "错误";
                                        break;
                                    case DATAX.COMPLETE:
                                        value = "完成";
                                        break;
                                    case DATAX.FILE_WAITING:
                                        value = "等待中";
                                        break;
                                }
                                return value;
                            }
                        },
                    ],
                    pager: "#fileSwitchPager",
                    rowNum: 10,
                    rowList: [10, 20, 30],
                    sortname: "createDate",
                    sortorder: "desc",
                    viewrecords: true,
                    gridview: true,
                    autoencode: true,
                    caption: "非结构化数据交换列表"
                });
            },

            switch: function () {
                var ids = fileSwitchConfigList.jqGrid('getGridParam', 'selarrrow');
                jQuery.ajax({
                    type: "POST",
                    url: contextPath + "/fileSwitch/switchFile",
                    data: { "ids[]": ids },
                    success: function (returnData) {
                        if (returnData.statusCode <= 200) {
                            toastr.success(returnData.statusText);
                        }
                        else if ((returnData.statusCode >= 400) && (returnData.statusCode < 500)) {
                            toastr.warning(returnData.statusText);
                        }
                        else if (returnData.statusCode >= 500) {
                            toastr.warning(returnData.statusText);
                        }
                    },
                    error: function (xhr, status, error) {
                        toastr.warning('出现异常, 请联系管理员');
                    },
                });
            },

            //把返回的时间戳数组格式化成时间************************************
            formatDate : function (array){
                var result ="" ;
                for(var i=0 ; i<array.length ; i++ ){
                    //将时间戳, 传到构造器中, 得到一个日期
                    //格式为: Thu Jul 12 2018 09:40:00 GMT+0800 (中国标准时间)
                    var date = new Date(array[i]);
                    var tempresult = self.model.convertDate(date);

                    result += ''+tempresult+'<br/>'
                }
                return result;
            },

             //把收到的时间戳, 格式化成"日期+时间"的格式*****************************
            convertDate : function (date){
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
            },


            //提交定时任务****************************************************
            doSchedule : function (){
                var cron = $("#cron").val() ;
                cron = cron.substr(0,cron.length-1);
                jQuery.ajax({
                    type: "POST",
                    url: contextPath + "/schedule/switchFileSchedule",
                    data: {
                        "fileSwitchConfigId": taskIdForCron,
                        "cron": cron,
                    },
                    success: function(returnData) {
                        if(returnData.statusCode <= 200){
                            toastr.success(returnData.statusText);
                            $('#Schedule').window('close');//关闭当前窗口
                        }
                        else if((returnData.statusCode >=400) && (returnData.statusCode <500) ){
                            toastr.warning(returnData.statusText);
                        }
                        else if(returnData.statusCode >= 500){
                            toastr.error(returnData.statusText);
                        }
                    },
                    error: function(xhr,status,error) {
                        toastr.warning('保存失败, 请重试或者联系管理员');
                    },
                    traditional: true
                });
            },

            //删除定时任务****************************************************
            cancelSchedule : function (){
                	// console.isShowlog(taskIdForCron);
                jQuery.ajax({
                    type: "POST",
                    url: contextPath + "/schedule/cancelSchedule/file",
                    data: {
                        "fileSwitchConfigId": taskIdForCron,
                    },
                    success: function(returnData) {
                        if(returnData.statusCode <= 200){
                            toastr.success(returnData.statusText);
                            // $('#Schedule').window('close');//关闭当前窗口
                        }
                        else if((returnData.statusCode >=400) && (returnData.statusCode <500) ){
                            toastr.warning(returnData.statusText);
                        }
                        else if(returnData.statusCode >= 500){
                            toastr.error(returnData.statusText);
                        }
                    },
                    error: function(xhr,status,error) {
                        toastr.warning('保存失败, 请重试或者联系管理员');
                    },
                    traditional: true
                });
            },

            //请求后台, 把五次任务展示出来*****************************
            viewTaskSchedule :function (){
                	// console.isShowlog(taskIdForCron);
                jQuery.ajax({
                    type: "POST",
                    url: contextPath + "/schedule/view/file",
                    data: {
                        "fileSwitchConfigId": taskIdForCron,
                    },
                    success: function(returnData) {
                        //			console.isShowlog(returnData);
                        var result = self.model.formatDate(returnData);
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
            },
        }
    })(),

    self.view = (function () {
        return {
            render: function () {
                self.model.defaultGrid();
            },

            init: function () {
                var p = DATAX.namespace("DATAX.FileSwitch.presenter"); // 使用对应的模块先引用
                p.defaultInit();
                DATAX.FileSwitchConfig.model.defaultGrid(isPage);//初始化展示任务列表
                $("#commonShowSwitchBtn").click(p.switch); //交换按钮的单击事件
                $("#commonRefreshBtn").click(p.refresh);//绑定刷新事件

                //查看任务详情
                $("#fileSwitchList").on("click",".showHiddenTaskDetail",function(){
                    $currentShowHiddenTaskDetail = $(this);
                    DATAX.FileSwitchConfig.presenter.showHiddenTaskDetail( $currentShowHiddenTaskDetail );
                });

                $("#scheduleConfig").click(p.scheduleConfig); //配置定时任务
                $("#Schedule").on('click','#myCron',p.submitCron);//定时页面中, 提交定时任务

                $("#cancelSchedule").click(p.cancelSchedule); //定时页面中, 取消定时任务
                $("#viewSchedule").click(p.viewSchedule);  //查看当前任务的定时任务


            },

            //表单回显的时候, 填充复杂表单
            populateComplexForm: function (data) {

            },

            //弹出表单框体
            showCommonDetailWindow: function () {

            },

            //定时任务的窗口展示出来********************************************
            showSchedule : function (){
                $("#Schedule").show();
                $('#Schedule').window({
                    title:"请给当前任务配置定时任务", width: 800, height: 500,modal:true
                });
            },
            //查看当前用户的定时任务的窗口显示出来*******************************
            openSchedule : function (){
                $("#usersSchedule").show();
                $('#usersSchedule').window({
                    title:"当前任务最近的五次定时", width:400, height:250, modal:true
                });
            },
        }
    })(),

    self.presenter = (function () {
        return {
            defaultInit: function () {
                self.view.render();
            },
            switch: function () {
                self.model.switch();
            },

            refresh : function(){
                var _URL = location.href;

                //------------------------------------------------------
                // 这里重写了String的endWith(),
                // 这里的变量赋值写法,不要优化精简,
                // 不然IE浏览器会提示异常:对象不支持“endWith”属性或方法
                var strA = _URL;
                var strB = "#";
                var bool = strA.endWith(strB);
                //------------------------------------------------------

                if(bool){
                    _URL = _URL.substr(0,_URL.length-1);
                }
                location.href = _URL;
                // location.href = location;
                // location.href = "";
            },

            //配置定时任务
            scheduleConfig : function() {
                var ids = fileSwitchConfigList.jqGrid('getGridParam', 'selarrrow');
                if(ids.length != 1) {
                    toastr.warning("选择一条任务!");
                    return;
                }
                //并且把任务id赋值给全局变量
                taskIdForCron = ids[0];
                self.view.showSchedule();
            },
            submitCron : function () {
                var timeValue = $("#runTime").html().trim();
                if(timeValue == null || timeValue==""){
                    toastr.warning("请先选择时间!");
                    return;
                }
                self.model.doSchedule();
            },

            //定时页面中, 取消定时任务
            cancelSchedule : function() {
                var ids = fileSwitchConfigList.jqGrid('getGridParam', 'selarrrow');
                if(ids.length != 1) {
                    toastr.warning("选择一条任务!");
                    return;
                }
                //并且把任务id赋值给全局变量
                taskIdForCron = ids[0];
                self.model.cancelSchedule();
            },
            //查看当前任务的定时任务
            viewSchedule : function() {
                var ids = fileSwitchConfigList.jqGrid('getGridParam', 'selarrrow');
                if(ids.length != 1) {
                    toastr.warning("选择一条任务!");
                    return;
                }
                //并且把任务id赋值给全局变量
                taskIdForCron = ids[0];
                self.view.openSchedule();
                self.model.viewTaskSchedule();
            },

        }
    })()
};
