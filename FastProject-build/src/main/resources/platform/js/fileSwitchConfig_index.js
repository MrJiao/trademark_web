/**
 * 定义对象: 非结构化数据交换, 参数配置
 */

DATAX.FileSwitchConfig = new function () {

    var self = this;
    var isPage = "fileSwitchConfig";
    var fileSwitchConfigList;//非结构化数据交换,任务列表

    var fromFileNum = 0;
    var toFileNum = 0;
    var sourceFtpSelect = "sourceFtpSelect";
    var targetFtpSelect = "targetFtpSelect";

    var targetType;//ftp配置的类型 FROM / TO

    self.model = (function () {

        return {

            defaultGrid: function () {
                fileSwitchConfigList = $("#commonList").jqGrid({
                    url: contextPath + "/fileSwitchConfig",
                    datatype: "json",
                    autowidth: true,
                    height:document.body.clientHeight-230,
                    mtype: "GET",
                    multiselect: true,
                    colNames: ["ID","任务名称", "已选文件类型", "源FTP账号名称", "源文件地址", "目标FTP账号名称", "目标文件地址", "创建时间"],
                    colModel: [{name: "id", index: "id", hidden: true},
                        {name: "taskName", index: "taskName", align: "center", sortable: true},
                        {name: "filterSuffix", index: "filterSuffix", align: "center",
                            formatter: function (value, grid, rows, state) { //value 当前单元格的值, rows当前行的值, 其余两个是jqGrid定义的
                                return (value == null ) ? ("全选") : (value.name);
                            }},
                        {name: "fromFtpAccount.nickName", index: "fromFtpAccount", align: "center",sortable: false},
                        {name: "fromUrl", index: "fromUrl", align: "center", sortable: false},
                        {name: "toFtpAccount.nickName", index: "toFtpAccount", align: "center",sortable: false},
                        {name: "toUrl", index: "toUrl", align: "center",sortable: false},
                        {name: "createDate", width: 200, index: "createDate", align: "center",
                            searchoptions: {dataInit: PlatformUI.defaultJqueryUIDatePick},
                            sortable: true, formatter: "date", formatoptions: {srcformat: "U", newformat: "Y-m-d H:i:s"}
                        }
                    ],
                    pager: "#commonPager",
                    rowNum: 10,
                    rowList: [10, 20, 30],
                    sortname: "createDate",
                    sortorder: "desc",
                    viewrecords: true,
                    gridview: true,
                    autoencode: true,
                    caption: "非结构化数据交换参数设置列表"
                });
            },

            save: function () {
                var sourceName = $("#sourceName").val().trim();

                var sourceFtp = $("#sourceFtpSelect option:selected");
                var fromFtpId = $(sourceFtp).attr("value");

                var targetFtp = $("#targetFtpSelect option:selected");
                var toFtpId = $(targetFtp).attr("value");

                var fromUrl = $("#fromFileUrl").val().trim();
                var toUrl = $("#toFileUrl").val().trim();

                var filterSuffixId = $("#hasSelectSuffix").attr("selectFilterSuffixId");

                if ((sourceName == "") || (fromFtpId == "") || (toFtpId == "") || (fromUrl == "") || (toUrl == "")) {
                    toastr.warning('请将字段填写完整');
                    return;
                }

                var configData = {
                    "id": null,
                    "fromFtpId": fromFtpId,
                    "toFtpId": toFtpId,
                    "fromUrl": fromUrl,
                    "toUrl": toUrl,
                    "eventName": sourceName,
                    "filterSuffixId": filterSuffixId
                };

                (operation == "add") ?
                (this.addFileSwitchConfig(configData)) : (configData["_method"]="PUT",this.updateFileSwitchConfig(configData));

                //清空历史属性/值
                $("#hasSelectSuffix").val("");
                $("#hasSelectSuffix").attr("selectFilterSuffixId", "");
            },

            //新增"非结构化数据交换的参数设置"*********************************************************************
            addFileSwitchConfig: function (configData) {

                jQuery.ajax({
                    type: "POST",
                    url: contextPath + "/fileSwitchConfig",
                    data: configData,
                    success: function (returnData) {
                        if (returnData.statusCode == 0) {
                            toastr.success(returnData.statusText);
                        } else if (returnData.statusCode == 405) {
                            toastr.warning("配置失败,请联系管理员!");
                        }
                        PlatformUI.refreshGrid(fileSwitchConfigList, {sortname: "createDate", sortorder: "desc"});
                        $("#commonDetailForm")[0].reset();//将当前窗口内容清空(如果不清空,再次请求,select的option会累加)
                        $('#commonDetail').window('close');//关掉此窗口, 并刷新页面
                    },
                    error: function (xhr, status, error) {
                        toastr.warning("配置失败,请联系管理员!");
                    }
                });
            },

            //更新"非结构化数据交换的参数设置"*********************************************************************
            updateFileSwitchConfig: function (configData) {
                jQuery.ajax({
                    type: "POST",
                    url: contextPath + "/fileSwitchConfig/" + currentEditId,
                    data: configData,
                    success: function (returnData) {
                        if (returnData.statusCode == 0) {
                            toastr.success(returnData.statusText);
                        } else if (returnData.statusCode == 405) {
                            toastr.warning("配置失败,请联系管理员!");
                        }
                        PlatformUI.refreshGrid(fileSwitchConfigList, {sortname: "createDate", sortorder: "desc"});
                        $("#commonDetailForm")[0].reset();//将当前窗口内容清空(如果不清空,再次请求,select的option会累加)
                        $('#commonDetail').window('close');//关掉此窗口, 并刷新页面
                    },
                    error: function (xhr, status, error) {
                        toastr.warning("配置失败,请联系管理员!");
                    }
                });
            },

            //选择指定类型文件,以便传输
            filterSuffix: function () {

                filterSuffixList = $("#suffixList").jqGrid({
                    url: contextPath + "/filterSuffix",
                    datatype: "json",
                    autowidth: true,
                    height:document.body.clientHeight-245,
                    mtype: "GET",
                    multiselect: true,
                    // multiboxonly: true,
                    colNames: ["ID", "条件名称", "正则表达式"],
                    colModel: [
                        {name: "id", index: "id", hidden: true},
                        {name: "name", index: "name", align: "center", sortable: true},
                        {name: "reg", index: "reg", align: "center", sortable: true},
                    ],
                    pager: "#suffixPager",
                    rowNum: 6,
                    rowList: [6, 12, 18],
                    sortname: "name",
                    sortorder: "desc",
                    viewrecords: true,
                    gridview: true,
                    autoencode: true,
                    caption: "已添加的匹配后缀名",
                    beforeSelectRow: function () {
                        $("#suffixList").jqGrid('resetSelection');
                    },
                    onSelectRow: function (id) {
                        var name = $(this).jqGrid("getCell", id, "name");
                        $("#hasSelectSuffix").val(name); // 填充选中的正则表达式
                        $("#hasSelectSuffix").attr("selectFilterSuffixId", id);//为input添加自定义属性

                        $('#showSuffix').window({
                            onBeforeClose:function(){
                                //选择或反选指定行。如果onselectrow为ture则会触发事件onSelectRow，onselectrow默认为ture
                                $("#suffixList").jqGrid('setSelection',id);
                            }
                        });
                    },
                    gridComplete: function () {
                        $("#jqgh_suffixList_cb").hide();//checkboxAll
                    }
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
                    var p = DATAX.namespace("DATAX.FileSwitchConfig.presenter"); // 使用对应的模块先引用
                    p.defaultInit();

                    $("#commonViewBtn").click(p.commonView); //绑定查看事件
                    $("#commonRefreshBtn").click(p.commonRefresh); //绑定刷新事件
                    $("#commonShowAddBtn").click(p.commonShowAdd); //新增按钮的单击事件
                    $("#commonSaveBtn").click(p.commonSave); //保存按钮的单击事件(有新增的保存, 和更新的保存, 这两种)
                    $("#sourceName").change(self.view.sourceName); //事件名称的联动

                    //"点击获取文件夹"的单击事件*************************************************
                    //如果select下拉改变了, 那么
                    //1.这两个放置"源/目标文件夹"的form
                    //2.要清空, 并且flag要清零
                    //3.用来显示被选中的文件夹的input 需要清空
// 					var fromFileNum = 0;
// 					var toFileNum = 0;

                    //下拉框事件, 选择配置的ftp(ftp别名)
                    $("#commonDetailForm").on("change", "#sourceFtpSelect", self.view.sourceFtpSelect);
                    $("#commonDetailForm").on("change", "#targetFtpSelect", self.view.targetFtpSelect);

                    $("#commonDetailForm").on("click", "#getSourceFolders", p.getSourceFolders);//点击获取源文件夹
                    $("#commonDetailForm").on("click", "#getToFolders", p.getToFolders);//点击获取目标文件夹
                    $("#commonDetailForm").on("click", "#filterSuffix", p.filterSuffix);//点击展示文件类型

                    //选中源/目标文件夹后 , 执行保存操作**************************************************
                    //并且把这个值, 赋给对应的输入框
                    $("#showFolder").on("click", "#saveSoureFolder", p.saveSoureFolder);
                    $("#showFolder").on("click", "#saveToFolder", p.saveToFolder);

                    $("#commonResetBtn").click(p.commonReset);//表单重置操作
                    $("#commonShowEditBtn").click(p.commonShowEdit);//编辑按钮
                    $("#commonDelBtn").click(p.commonDel);//批量删除事件
                },

                //表单回显的时候, 填充复杂表单**************************************************************
                populateComplexForm: function (data) {

                    //leftTable 表单回显
                    $("#sourceName").val(data.taskName);
                    var id = data.fromFtpAccount.id;
                    var nickName = data.fromFtpAccount.nickName;
                    $("<option value=" + id + ">" + nickName + "</option>").appendTo("#sourceFtpSelect");
                    $("#sourceFtpSelect option[value='" + id + "']").attr("selected", "selected");
                    $("#fromFileUrl").val(data.fromUrl);

                    //指定传输文件类型
                    if( data.filterSuffix == null || data.filterSuffix == undefined) {
                        $("#hasSelectSuffix").val("全选");
                    } else {
                        $("#hasSelectSuffix").val(data.filterSuffix.name);
                    }

                    //rightTable 表单回显
                    $("#targetName").val(data.taskName);
                    id = data.toFtpAccount.id;
                    nickName = data.toFtpAccount.nickName;
                    $("<option value=" + id + ">" + nickName + "</option>").appendTo("#targetFtpSelect");
                    $("#targetFtpSelect option[value='" + id + "']").attr("selected", "selected");
                    $("#toFileUrl").val(data.toUrl);
                },

                //弹出表单框体***************************************************************************
                showCommonDetailWindow: function () {

                    $("#commonDetailForm")[0].reset();//表单重置
                    $("#sourceFtpSelect option").remove();
                    $("#targetFtpSelect option").remove();
                    $("#commonDetailForm #id").val("");

                    PlatformUI.validateForm("commonDetailForm");//验证表单
                    $('#commonDetail').show();
                    $('#commonDetail').window({
                        title: " ", width: 800, height: 450, modal: true
                        // 非结构化数据交换参数设置详细信息 弹窗
                    });
                },

                //展示文件类型过滤弹窗
                showSuffixWindow: function () {
                    $('#showSuffix').show();
                    $('#showSuffix').window({
                        title: "  ", width: 800, height: 450, modal: true
                        //title: 文件类型展示
                    });
                },

                //事件名称的联动
                sourceName: function () {
                    var sourceValue = $("#sourceName").val();
                    $("#targetName").val(sourceValue);
                },

                //动态拼装一个下拉框
                createFtpSelect: function (data, id) {
                    for (var i = 0; i < data.length; i++) {
                        $("<option value=" + data[i].id + ">" + data[i].nickName + "</option>").appendTo("#" + id);
                    }
                },

                sourceFtpSelect: function () {
                    fromFileNum = 0;
                    // $("#fileManager").empty();
                    $("#fromFileUrl").val("");
                },

                targetFtpSelect: function () {
                    toFileNum = 0;
                    // $("#fileManager").empty();
                    $("#toFileUrl").val("");
                },

                //点击获取源文件夹 弹窗
                showFolderWindow: function () {
                    $('#showFolder').show();
                    $('#showFolder').window({
                        title: "文件夹展示", width: 800, height: 460, modal: true
                    });
                },

                //点击获取源文件夹 弹窗
                showSourceFolderWindow: function () {
                    $('#sourceFolder').show();
                    $('#sourceFolder').window({
                        title: "源文件夹", width: 800, height: 460, modal: true
                    });
                },

                //点击获取目标文件夹 弹窗
                showTargetFolderWindow: function () {
                    $('#toFolder').show();
                    $('#toFolder').window({
                        title: "目标文件夹", width: 800, height: 450, modal: true
                    });
                },

                //查看/编辑/新增form切换函数
                changeEditForm: function (flag) {
                    flag ?
                        ( $("#commonDetailBtnKit").show(), $("#fileSwitchConfigLeftBtn").show(), $("#fileSwitchConfigRightBtn").show() ) :
                        ( $("#commonDetailBtnKit").hide(), $("#fileSwitchConfigLeftBtn").hide(), $("#fileSwitchConfigRightBtn").hide() )

                    $("#commonDetailForm input").each(function () {
                        $(this).attr("readOnly", !flag);
                    });
                },

                //修改创建的容器的css样式
                editStyle: function (wrap, id) {
                    var buttonValue = ( id == "leftTable" ) ? "确定源" : "确定目标";
                    var buttonId = ( id == "leftTable" ) ? "saveSoureFolder" : "saveToFolder";

                    var $fileManager = wrap[0].children[0];
                    var $filePath = $fileManager.children[0];
                    var $fileList = $fileManager.children[1];

                    $($filePath).css({"width": "735px"});
                    $($fileList).css({"width": "750px", "height": "300px"});
                    $($fileManager).append('<input type="button" class="btn_blue" id="' + buttonId + '" style="margin: 10px 0px 0px 350px;" value="' + buttonValue + '" />');
                },
                //清空
                emptyFolder: function () {
                    if ($("#fileManager").length > 0 && $("#filesPath").length > 0 && $("#filesList").length > 0) {//js判断元素是否存在
                        $("#fileManager").find("#saveSoureFolder").remove();//"确定源"按钮, 删除
                        $("#fileManager").find("#saveToFolder").remove();//"确定目标"按钮, 删除
                        $("#filesPath").empty();
                        $("#filesList").empty();
                    }
                },
            }
        })(),

        self.presenter = (function () {
            return {
                defaultInit: function () {
                    self.view.render();
                },

                //绑定刷新事件
                commonRefresh: function () {
                    location.href = location;
                },

                //新增按钮的单击事件
                commonShowAdd: function () {
                    self.view.changeEditForm(true);
                    operation = "add";
                    self.view.showCommonDetailWindow();

                    //弹窗页面的操作****************************************************

                    //当传入的targetType = to, 并且select= targetFtpSelect, 为获取目标FTP
                    //当传入的targetType = from, 并且select= sourceFtpSelect, 为获取源FTP
                    //这里ajax要设置成同步的, 因为只有在success方法中, 完全构建出option后,
                    //在populateComplexForm这个方法中, 才能进行判断并选中option

                    var data, fModel = DATAX.FileAuthority.model;

                    targetType = DATAX.FTP_TARGET_TYPE_FROM;
                    fModel.findFtpAccountList(targetType);
                    data = fModel.getFtpAccountList();
                    self.view.createFtpSelect(data, sourceFtpSelect);

                    targetType = DATAX.FTP_TARGET_TYPE_TO;
                    fModel.findFtpAccountList(targetType);
                    data = fModel.getFtpAccountList();
                    self.view.createFtpSelect(data, targetFtpSelect);
                },

                //"点击获取文件夹"的单击事件*************************************************
                //如果select下拉改变了, 那么
                //1.这两个放置"源/目标文件夹"的form
                //2.要清空, 并且flag要清零
                //3.用来显示被选中的文件夹的input 需要清空

                getSourceFolders: function () {

                    self.view.emptyFolder();

                    var outerId = "leftTable";
                    var sourceFtp = $("#" + sourceFtpSelect + " option:selected");
                    var fromFtpId = $(sourceFtp).attr("value");
                    if(!fromFtpId){ //fromFtpId = undefined
                        toastr.warning("没有源FTP,请联系管理员!")
                        return false;
                    }

                    self.view.showFolderWindow();

                    var params = {"ftpId": fromFtpId, "targetType": DATAX.FTP_TARGET_TYPE_FROM};
                    var wrap = $("#showFolder").attr("name", "source"); // 最外层容器

                    DATAX.FileManager.view.init(wrap, params, isPage);//展示文件夹 <------------------------------
                    self.view.editStyle(wrap, outerId);//修改容器的css样式
                },

                getToFolders: function () {

                    self.view.emptyFolder();

                    var outerId = "rightTable";
                    var targetFtp = $("#" + targetFtpSelect + " option:selected");
                    var fromFtpId = $(targetFtp).attr("value");
                    if(!fromFtpId){ //fromFtpId = undefined
                        toastr.warning("没有目标FTP,请联系管理员!")
                        return false;
                    }

                    self.view.showFolderWindow();

                    var params = {"ftpId": fromFtpId, "targetType": DATAX.FTP_TARGET_TYPE_TO};
                    var wrap = $("#showFolder").attr("name", "to"); // 最外层容器

                    DATAX.FileManager.view.init(wrap, params, isPage);//展示文件夹<------------------------------
                    self.view.editStyle(wrap, outerId);//修改容器的css样式
                },

                fromButton: function () {
                    //判断是第一个按钮还是第二个
                    if ($(this).val() == "点击获取源文件夹") {
                        fromFileNum++;
                        self.view.showSourceFolderWindow();

                        if (fromFileNum == 1) { //这里判断点击次数, 防止内容累加
                            if ($("#fileManager").length > 0 && $("#filesPath").length > 0 && $("#filesList").length > 0) {//js判断元素是否存在
                                $("#filesPath").empty();
                                $("#filesList").empty();
                                $("#fileManager").find("#saveToFolder").remove();
                                // console.isShowlog($("#fileManager").parent());
                            }
                            var sourceFtp = $("#" + sourceFtpSelect + " option:selected");
                            var fromFtpId = $(sourceFtp).attr("value");
                            var params = {"ftpId": fromFtpId, "targetType": DATAX.FTP_TARGET_TYPE_FROM};
                            var wrap = $("#sourceFolder"); // 最外层容器
                            DATAX.FileManager.view.customInit(wrap, params);
                            var id = "sourceFolder";
                            self.view.editStyle(id);//修改创建的容器的css样式
                        }
                    } else {
                        toFileNum++;
                        self.view.showTargetFolderWindow();
                        if (toFileNum == 1) { //这里判断点击次数, 防止内容累加
                            if ($("#fileManager").length > 0 && $("#filesPath").length > 0 && $("#filesList").length > 0) {//js判断元素是否存在
                                $("#filesPath").empty();
                                $("#filesList").empty();
                                $("#fileManager").find("#saveSoureFolder").remove();
                            }
                            var targetFtp = $("#" + targetFtpSelect + " option:selected");
                            var fromFtpId = $(targetFtp).attr("value");
                            var params = {"ftpId": fromFtpId, "targetType": DATAX.FTP_TARGET_TYPE_TO};
                            var wrap = $("#toFolder"); // 最外层容器
                            DATAX.FileManager.view.customInit(wrap, params);
                            var id = "toFolder";
                            self.view.editStyle(id);//修改创建的容器的css样式
                        }
                    }
                },

                //选中源/目标文件夹后 , 执行保存操作, 获取单选按钮对应的文件夹**************************************************
                //并且把这个值, 赋给对应的输入框
                saveSoureFolder: function () {
                    var source = $("input[name='source']:checked").siblings("input[name='filePath']").val();
                    $("#fromFileUrl").val(source);
                    $('#showFolder').window('close');
                    DATAX.Folder.level = 0; //fileSwitchConfig页面, 记录文件夹进入的层级, 点击确定源或确定目标后,将level置零
                },

                saveToFolder: function () {
                    var source = $("input[name='to']:checked").siblings("input[name='filePath']").val();
                    $("#toFileUrl").val(source);
                    $('#showFolder').window('close');
                    DATAX.Folder.level = 0; //fileSwitchConfig页面, 记录文件夹进入的层级, 点击确定源或确定目标后,将level置零
                },

                //选择指定类型文件,以便传输
                filterSuffix: function () {
                    self.view.showSuffixWindow();
                    self.model.filterSuffix();
                },

                //保存按钮的单击事件(有新增的保存, 和更新的保存, 这两种)
                commonSave: function () {
                    self.model.save();
                    // location.href = location;
                },

                //表单重置操作
                commonReset: function () {
                    $("#commonDetailForm")[0].reset();
                    PlatformUI.validateForm("commonDetailForm");
                },

                //绑定查看事件
                commonView: function () {
                    self.view.changeEditForm(false);
                    var ids = fileSwitchConfigList.jqGrid('getGridParam', 'selarrrow');
                    if (ids.length != 1) {
                        toastr.warning("选择一条要编辑的数据!");
                        return;
                    }
                    currentEditId = ids[0];
                    PlatformUI.ajax({
                        url: contextPath + "/fileSwitchConfig/" + ids[0],
                        afterOperation: function (data, textStatus, jqXHR) {
                            self.view.showCommonDetailWindow();
                            self.view.populateComplexForm(data);//填充复杂数据
                            PlatformUI.validateForm("commonDetailForm");//验证表单
                        }
                    });
                },

                //查看详情
                showHiddenTaskDetail: function ( obj ) {
                    self.view.changeEditForm(false);
                    var currentTaskId =  obj.attr("name");
                    PlatformUI.ajax({
                        url: contextPath + "/fileSwitchConfig/" + currentTaskId,
                        afterOperation: function (data, textStatus, jqXHR) {
                            self.view.showCommonDetailWindow();
                            self.view.populateComplexForm(data);//填充复杂数据
                            // PlatformUI.validateForm("commonDetailForm");//验证表单
                        }
                    });
                },

                //编辑按钮
                commonShowEdit: function () {
                    self.view.changeEditForm(true);
                    var ids = fileSwitchConfigList.jqGrid('getGridParam', 'selarrrow');
                    if (ids.length != 1) {
                        toastr.warning("选择一条要编辑的数据!");
                        return;
                    }
                    currentEditId = ids[0];
                    operation = "edit";
                    PlatformUI.ajax({
                        url: contextPath + "/fileSwitchConfig/" + ids[0],
                        afterOperation: function (data, textStatus, jqXHR) {
                            self.view.showCommonDetailWindow();
                            self.view.populateComplexForm(data);//填充复杂数据
                            PlatformUI.validateForm("commonDetailForm");//验证表单
                        }
                    });
                },

                //批量删除事件
                commonDel: function () {
                    var ids = fileSwitchConfigList.jqGrid('getGridParam', 'selarrrow');
                    if (ids.length == 0) {
                        toastr.warning("请至少选择一条要删除的数据!");
                        return;
                    }

                    //批量删除ajax
                    $.messager.confirm('操作', '请确认删除数据', function (r) {
                        if (r) {
                            PlatformUI.ajax({
                                url: contextPath + "/fileSwitchConfig",
                                type: "post",
                                data: {_method: "delete", ids: ids},
                                afterOperation: function () {
                                    PlatformUI.refreshGrid(fileSwitchConfigList, {
                                        sortname: "createDate",
                                        sortorder: "desc"
                                    });
                                }
                            });
                        }
                    });
                },
            }
        })()
};
