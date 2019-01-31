/**
 * 定义对象: 用户信息
 */
DATAX.UserInfo = new function () {

    var self = this;
    var userInfoList;
    var currentUserId;
    var pageRowNum = 10;
    var pageRowList = [10,20,30];

    // var userIdForRole;//给用户关联角色的时候,需要这个用户id********
    var userIdForDbAuth;//给用户配置数据库权限的时候 ,需要这个用户id*******
    var dbIdForTable;//给用户的可读库的表设置权限的时候, 需要这个dbId******

    self.model = (function () {

        //定义初始化值
        var operation, currentEditId;
        var userId;

        return {
            // 默认用户信息表格
            defaultGrid: function () {

                userInfoList = $("#userInfoList").jqGrid({
                    url: contextPath + "/userInfo",
                    datatype: "json",
                    autowidth: true,
                    height:document.body.clientHeight-230,
                    mtype: "GET",
                    multiselect: true,
                    colNames: ["ID", "用户名", "角色", "组织机构", "昵称", "创建时间"],
                    colModel: [{name: "id", index: "id", hidden: true},
                        {name: "username", index: "username", align: "center", sortable: true},
                        {name: "roles", index: "roles", align: "center", sortable: false,title:false,formatter:rolesFormat},
                        {name: "organizations", index: "organizations", align: "center", sortable: false},
                        {name: "nickName", index: "nickName", align: "center", sortable: false},
                        {name: "gmtCreate", width: 200, index: "gmtCreate", align: "center", searchoptions: {dataInit: PlatformUI.defaultJqueryUIDatePick},
                            sortable: true, formatter: "date", formatoptions: {srcformat: "U", newformat: "Y-m-d H:i:s"}
                        }
                    ],
                    pager: "#userInfoPager",
                    rowNum: pageRowNum,
                    rowList: pageRowList,
                    sortname: "gmtCreate",
                    sortorder: "desc",
                    viewrecords: true,
                    gridview: true,
                    autoencode: true,
                    caption: "账号管理列表"
                });
                function rolesFormat (value, grid, rows, state) {
                    return '<a title="用户关联的角色 + 组织关联的角色" >'+value+'</a>';
                }
            },

            // 自定义用户信息表格 customGrid

            //文件传输权限初始化页面, 展示的用户信息列表 ( 左边栏 )
            customGrid: function () {
                userInfoList = $("#userInfoList").jqGrid({
                    url: contextPath + "/userInfo",
                    datatype: "json",
                    autowidth: true,
                    height:document.body.clientHeight-230,
                    mtype: "GET",
                    multiselect: true,
                    colNames: ["ID", "用户名", "角色", '操作'],
                    colModel: [{name: "id", index: "id", hidden: true},
                        {name: "username", index: "username", align: "center", sortable: true},
                        {name: "roles", index: "roles", align: "center",sortable: false},
                        {name: 'userInfoDetail', index: 'userInfoDetail', align: "center", sortable: false,formatter: userInfoDetailFormat}
                    ],
                    // rowNum: -1, //不显示分页
                    pager: "#userInfoPager",
                    rowNum: pageRowNum,
                    rowList: pageRowList,
                    sortname:"username",
                    sortorder:"desc",
                    viewrecords: true,
                    gridview: true,
                    autoencode: true,
                    caption: "用户配置信息展示",
                    gridComplete: function () {
                        $("#userInfoPager_left").hide();//隐藏这个td, fileAuthority页面的'用户列表'页脚即可显示完整
                    }
                });
                function userInfoDetailFormat (value, grid, rows, state) {
                    return '<a href="javascript:void(0)" style="color:#47a8ea" class="showUserInfoDetail" name=\"userInfoDetail_'
                        + rows.id + '\" >详情</a>';
                }
            },

            //引用 : 文件传输权限设置页面, 用户信息详情(左栏)
            //参数 : obj : DATAX.FileAuthority.view
            //       id : 所选userInfoId

            userInfoDetail: function (thisBtn, id, obj) {

                var userInfoDetail = thisBtn.attr("name");//获取详情选项的name属性
                var index = userInfoDetail.indexOf(id);//判断所选currentUserId,是否与所选'详情'一致
                if (index === -1) {
                    toastr.warning("请点击用户对应的详情!");
                    return false;
                }

                // 这里是异步获取数据, 这样是拿不到数据的...
                PlatformUI.ajax({
                    url: contextPath + "/userInfo/" + id,
                    afterOperation: function (data, textStatus, jqXHR) {
                        obj.showUserInfoDetailWindow(data);
                    }
                });
            },

            add: function () {
                this.changeEditForm(true);
                operation = "add";
            },

            edit: function (view) {
                this.changeEditForm(true);
                var ids = userInfoList.jqGrid('getGridParam', 'selarrrow');
                if (ids.length != 1) {
                    toastr.warning("选择一条要编辑的数据!");
                    return;
                }

                currentUserId = ids[0];
                operation = "edit";

                PlatformUI.ajax({
                    url: contextPath + "/userInfo/" + currentUserId,
                    afterOperation: function (data, textStatus, jqXHR) {
                        view.showCommonDetailWindow(data);
                        PlatformUI.populateForm("commonDetailForm", data); //回显数据
                        PlatformUI.validateForm("commonDetailForm"); //验证表单
                    }
                });
            },

            save: function () {
                (operation == "add") ? (this.addUserInfo()) : (this.updateUserInfo());
            },

            reset: function () {
                $("#commonDetailForm")[0].reset();
                PlatformUI.validateForm("commonDetailForm");
            },

            del: function () {
                var ids = userInfoList.jqGrid('getGridParam', 'selarrrow');
                if (ids.length == 0) {
                    toastr.warning("请至少选择一条要删除的数据!");
                    return;
                }
                //批量删除ajax
                $.messager.confirm('操作', '请确认删除数据', function (r) {
                    if (r) {
                        PlatformUI.ajax({
                            url: contextPath + "/userInfo",
                            type: "post",
                            data: {_method: "delete", ids: ids},
                            afterOperation: function () {
                                PlatformUI.refreshGrid(userInfoList, {sortname: "gmtCreate", sortorder: "desc"});
                            }
                        });
                    }
                });
            },

            //新增用户
            addUserInfo: function () {
                if (PlatformUI.formIsValid("commonDetailForm")) { //验证

                    var params = $("#commonDetailForm").serialize();

                    $.ajax({
                        type: "POST",
                        url: contextPath + "/userInfo",
                        data: params,
                        success: function (returnData) {
                            if (returnData.statusCode <= 200) {
                                toastr.success(returnData.statusText);
                            } else if ((returnData.statusCode >= 400) && (returnData.statusCode < 500)) {
                                toastr.warning(returnData.statusText);
                            } else if (returnData.statusCode >= 500) {
                                toastr.warning(returnData.statusText);
                            }
                            //并关闭当前页面
                            PlatformUI.refreshGrid(userInfoList, {sortname: "gmtCreate", sortorder: "desc"});
                            $("#commonDetailForm")[0].reset();
                            $('#commonDetail').window('close');
                        },
                        error: function (returnData) {
                            var code = returnData.responseJSON.statusCode;
                            var text = returnData.responseJSON.statusText;

                            if ((code >= 400) && (code < 500)) {
                                toastr.warning(text);
                            } else if (code >= 500) {
                                toastr.error(text);
                            }
                        }
                    });

                } else {
                    toastr.warning("表单验证失败");
                }

            },

            //更新用户信息
            updateUserInfo: function () {
                if (PlatformUI.formIsValid("commonDetailForm")) {
                    var params = $("#commonDetailForm").serialize();
                    PlatformUI.ajax({
                        url: contextPath + "/userInfo/" + currentUserId,
                        type: "post",
                        data: params + "&_method=put",
                        afterOperation: function () {
                            PlatformUI.refreshGrid(userInfoList,
                                {
                                    sortname: "gmtCreate", sortorder: "desc",
                                    page: userInfoList.jqGrid("getGridParam").page
                                });
                            $("#commonDetailForm")[0].reset();
                            $('#commonDetail').window('close');
                        }
                    });
                } else {
                    toastr.warning("表单验证失败");
                }
            },

            //查看/编辑form切换函数
            changeEditForm: function (flag) {
                flag ? $("#commonDetailBtnKit").show() : $("#commonDetailBtnKit").hide()
                $("#commonDetailForm input").each(function () {
                    $(this).attr("readOnly", !flag);
                });
            },

            getUserId: function () {
                var ids = userInfoList.jqGrid('getGridParam', 'selarrrow');
                if (ids.length != 1) {
                    toastr.warning("请选择一个用户!");
                    return false;
                }
                currentUserId = ids[0];
                userName = userInfoList.jqGrid("getCell", currentUserId, "username");
                return currentUserId;
            },

            // 角色关联按钮
            joinRole: function () {
                var ids = userInfoList.jqGrid('getGridParam', 'selarrrow');
                if (ids.length != 1) {
                    toastr.warning("选择一条要编辑的数据!");
                    return false;
                }
                userId = ids[0];
                return userId;
            },

            // 关联组织按钮的单击事件
            joinOrg: function () {
                var ids = userInfoList.jqGrid('getGridParam', 'selarrrow');
                if (ids.length != 1) {
                    toastr.warning("选择一个需要关联组织的用户!");
                    return false;
                }
                userId = ids[0];
                return userId;
            },

            //查询所选用户的文件传输权限配置****************************************************
            ownFileAuthority: function () {
                var ids = userInfoList.jqGrid('getGridParam', 'selarrrow');
                if (ids.length != 1) {
                    toastr.warning("选择一条要查看的数据!");
                    return false;
                }
                userId = ids[0];
                return userId;
            },

            // 包装平台提供的刷新表格, 适用于jqGrid表格
            wrapRefresh: function () {
                PlatformUI.refreshGrid(userInfoList, {sortname: "gmtCreate", sortorder: "desc"});
            },

            //分配库权限的窗口, 每次都要刷新*************************************************
            //避免上一个用户的读写状态有残留显示
            reloadShowAllDataBase: function (userId) {
                $("#databaseList").jqGrid('setGridParam', {
                    url: contextPath + "/db/authority/database/checked/" + userId,
                    datatype: 'json',
                }).trigger('reloadGrid');//重新载入
            },

            //展示出所有的数据库配置********************************************************************
            //并给选中的用户配置 库的读写权限
            showAllDataBase: function (userId) {
                allDBList = $("#databaseList").jqGrid({
                    url: contextPath + "/db/authority/database/checked/" + userId,
                    datatype: "json",
                    width: 850,
                    // height:document.body.clientHeight-230,
                    height:300,
                    mtype: "GET",
                    multiselect: false,
                    colNames: ["id", "数据库IP", "数据库实例名", "数据库别名", "读权限", "写权限", "选择权限"],
                    colModel: [
                        {name: "id", index: "id", hidden: true},
                        {name: "ipAddr", index: "ipAddr", align: "center", sortable: true},
                        {name: "instName", index: "instName", align: "center", sortable: true},
                        {name: "nickName", index: "nickName", align: "center", sortable: true},

                        {name: "read", index: "read", hidden: true,},
                        {name: "write", index: "write", hidden: true,},
                        {
                            name: "id", index: "id", align: "center", sortable: false,
                            //value 当前单元格的值, rows当前行的值, 其余两个是jqGrid定义的
                            formatter: function (value, grid, rows, state) {
                                if (rows.read) {
                                    var read = '<label>' + '可读<input type="checkbox" id="' + value + '"  value="read" class="checkbox" checked="checked"/>' + '</label>  ';
                                } else {
                                    var read = '<label>' + '可读<input type="checkbox" id="' + value + '"  value="read" class="checkbox" />' + '</label>  ';
                                }

                                if (rows.write) {
                                    var write = '  <label>' + '可写<input type="checkbox" id="' + value + '"  value="write" class="checkbox" checked="checked"/>' + '</label>  ';
                                } else {
                                    var write = '  <label>' + '可写<input type="checkbox" id="' + value + '"  value="write" class="checkbox"/>' + '</label>  ';
                                }
                                return read + write;
                            },
                        },
                    ],
                    pager: "#databasePager",
                    rowNum: 7,
                    rowList: [7,14,21],
                    sortname: "nickName",
                    sortorder: "desc",
                    viewrecords: true,
                    gridview: true,
                    autoencode: true,
                });
            },

            //重新载入左边栏(数据库列表)**********************************************************
            reloadDataBases: function (userId) {
                $("#dbs").jqGrid('setGridParam', {
                    url: contextPath + "/db/authority/database/read/" + userId,
                    datatype: 'json',
                }).trigger('reloadGrid');
            },

            //展示当前用户的可读库***************************************************************
            populateDataBaseTable: function () {
                dataBaseForTable = $("#dbs").jqGrid({
                    url: contextPath + "/db/authority/database/read/" + userIdForDbAuth,
                    datatype: "json",
                    autowidth: true,
                    height:document.body.clientHeight-230,
                    mtype: "GET",
                    colNames: ["id", "数据库名称", "数据库别名", "ip", "端口", "实例名"],
                    colModel: [
                        {name: "id", index: "id", hidden: true},
                        {name: "userName", index: "userName", align: "center", sortable: false},
                        {name: "nickName", index: "nickName", align: "center", sortable: false},
                        {name: "ipAddr", index: "ipAddr", align: "center", sortable: false},
                        {name: "port", index: "port", align: "center", sortable: false},
                        {name: "instName", index: "instName", align: "center", sortable: false},
                    ],
                    //双击行的时候触发,右边栏显示 , rowid是当前行的id(0,1,2,3...)

                    //右边栏上有搜索条件, 在这里双击的时候, 也会带上, 变成后台QueryParams参数中的值
                    ondblClickRow: function (rowid) {
                        $(".Middle").show();
                        var rowData = $(this).getRowData(rowid);
                        // console.isShowlog(rowData);

                        dbIdForTable = rowData.id;  //把当前数据库id , 赋给全局变量
                        self.model.reloadTables(dbIdForTable); //每次点击都重新载入 当前数据库下所有的表
                        self.model.showTableOfDataBase(rowData.id); //展示当前可读库下的所有的表
                    },
                    pager: "#dbsPage",
                    rowNum: pageRowNum,
                    rowList: pageRowList,
                    viewrecords: true,//显示总记录数
                    gridview: true,
                    autoencode: true,
                    caption: "当前用户的可读库------(双击选中)",
                    sortname: "",
                    sortorder: "asc",
                });
            },

            //重新载入右边栏(表)**********************************************************
            reloadTables: function (dbId) {
                $("#tables").jqGrid('setGridParam', {
                    url: contextPath + "/db/authority/table/checked/" + dbId + "/" + userIdForDbAuth,
                    //右边栏上有搜索条件, 在这里双击的时候, 也会带上, 变成后台QueryParams参数中的值, 这里清空
                    postData:{filters:null},
                    datatype: 'json',
                }).trigger('reloadGrid');
            },

            //展示当前可读库下的所有表**********************************************************
            showTableOfDataBase: function (dbId) {
                var $dom='<li>表名： <input type="text" id="commonSearchInput"></li>' +
                    '<li><input type="button" id="commonSearchBtn" value="  查 询  " style="margin-left: 10px" /></li>' +
                    '<li><input type="button" id="commonSearchAll" value="查询全部" style="margin-left: 10px"/></li>';
                tables = $("#tables").jqGrid({
                    url: contextPath + "/db/authority/table/checked/" + dbId + "/" + userIdForDbAuth,
                    datatype: "json",
                    mtype: "GET",
                    autowidth: true,
                    height:document.body.clientHeight-230,
                    multiselect: false,
                    colNames: ["id", "表名", "备注名", "可读权限"],
                    colModel: [
                        {name: "id", index: "id", hidden: true},
                        {name: "tableName", index: "tableName", align: "center", sortable: true},
                        {name: "comment", index: "comment", align: "center", sortable: true},
                        {
                            name: "tableName", index: "tableName", align: "center", sortable: false,
                            formatter: function (value, grid, rows, state) { //value 当前单元格的值, rows当前行的值, 其余两个是jqGrid定义的
                                var read = (rows.checked) ?
                                    ('<label>可读 <input type="checkbox" name="' + value + '" class="tableRead" checked="checked"/></label>') :
                                    ('<label>可读 <input type="checkbox" name="' + value + '" class="tableRead" /></label>');
                                return read;
                            },
                        },
                    ],
                    pager: "#columnsPage",
                    rowNum: pageRowNum,
                    rowList: pageRowList,
                    sortname: "tableName",
                    sortorder: "asc",
                    viewrecords: true,
                    gridview: true,
                    autoencode: true,
                    caption:$dom
                });
            },

            //为当前用户设置数据库的 "读/写"权限
            setUserDataBaseAuth: function (readOrWrite, databaseId, flag) {
                $.ajax({
                    type: "PUT",
                    url: contextPath + "/db/authority/" + readOrWrite,
                    dataType: "json",
                    data: {
                        "userId": userIdForDbAuth,
                        "databaseId": databaseId,
                        "checked": flag
                    },
                    success: function (returnData) {
                        if (returnData.statusCode <= 200) {
                            toastr.success(returnData.statusText);
                        } else if ((returnData.statusCode >= 400) && (returnData.statusCode < 500)) {
                            toastr.warning(returnData.statusText);
                        } else if (returnData.statusCode >= 500) {
                            toastr.error(returnData.statusText);
                        }
                    },
                    error: function () {
                        toastr.warning('好像出现异常了!');
                    }
                });
            },

            //为当前表设置读权限
            setTabelAuthToRead: function (tableName, flag) {
                $.ajax({
                    type: "PUT",
                    url: contextPath + "/db/authority/table",
                    dataType: "json",
                    data: {
                        "userId": userIdForDbAuth,
                        "databaseConfigId": dbIdForTable,
                        "tableName": tableName,
                        "checked": flag
                    },
                    success: function (returnData) {
                        if (returnData.statusCode <= 200) {
                            toastr.success(returnData.statusText);
                        } else if ((returnData.statusCode >= 400) && (returnData.statusCode < 500)) {
                            toastr.warning(returnData.statusText);
                        } else if (returnData.statusCode >= 500) {
                            toastr.error(returnData.statusText);
                        }
                    },
                    error: function () {
                        toastr.warning('好像出现异常了!');
                    }
                });
            },
            
            //普通框体查询
        	commonInputSearch :function (){
        		var commonSearchInputValue = $("#commonSearchInput").val();
        		var rules = [];
        		if(commonSearchInputValue != ""){
        			rules.push({"field":"tableName","op":"cn","data":commonSearchInputValue});
        		}else{
        			return;
        		}
        		var filters = {"groupOp":"AND","rules":rules};
        		tables.jqGrid("setGridParam", {
        			postData: {filters:JSON.stringify(filters)},
        			page: 1
        		}).trigger("reloadGrid");
        	},
        	
        	//查询全部表***
        	commonInputSearchAll : function (){
        		//把filters清空后, 传到后台
        		var filters = new Array();
        		tables.jqGrid("setGridParam", {
        			postData: {filters:null},
        			page: 1
        		}).trigger("reloadGrid");
        	},

        }

    })(),

        self.view = (function () {

            return {

                render: function (model) {
                    model.defaultGrid();
                },

                init: function () {
                    var p = DATAX.namespace("DATAX.UserInfo.presenter"); // 使用对应的模块先引用
                    p.defaultInit();

                    $("#userInfoAddBtn").click(p.commonShowAddBtn); // 绑定新增事件
                    $("#userInfoEditBtn").click(p.commonShowEditBtn); // 编辑按钮 的单击事件
                    $("#userInfoSaveBtn").click(p.commonSaveBtn); // 表单保存操作
                    $("#userInfoResetBtn").click(p.commonResetBtn); // 表单重置操作

                    $("#userInfoDelBtn").click(p.commonDelBtn); // 批量删除事件
                    $("#userInfoRefreshBtn").click(p.commonRefreshBtn); // 绑定刷新事件


                    $("#associationRoleBtn").click(p.associationRoleBtn); // 角色关联按钮

                    $("#associationOrg").click(p.associationOrg); // 关联组织按钮的单击事件
                    $('#orgDetail').on("click", "#organizationAdd", p.organizationAdd); // 保存用户到选中的"组织机构"下

                    $("#dataBaseAuth").click(p.dataBaseAuth); //分配库权限按钮
                    $("#tableAuth").click(p.tableAuth); //分配table权限按钮

                    //数据库读写权限分配 的单击事件*******************************************
                    $("#databaseList").on("click", ".checkbox", p.readOrWrite);
                    $("#tables").on("click", ".tableRead", p.readTabels);

                    //绑定普通页面查询框体点击事件**************************
                    $(".Middle").on("click","#commonSearchBtn",self.presenter.commonSearch);

                    //绑定查询框回车事件**********************************
                    $(".Middle").on("keyup","#commonSearchInput",self.presenter.commonSearchInput);

                    //绑定"查询全部"点击事件**************************
                    $(".Middle").on("click","#commonSearchAll",self.presenter.commonInputSearchAll);
                	
                },

                //弹出表单框体(分为新增弹出/更新弹出)************************************************************
                showCommonDetailWindow: function (data) {

                    //表单重置
                    $("#commonDetailForm")[0].reset();
                    $("#commonDetailForm #id").val("");

                    //验证表单
                    PlatformUI.validateForm("commonDetailForm");
                    $('#commonDetail').show();

                    var _title = null;
                    (data == null || data == undefined) ?
                        (_title = "添加", $("#username").removeAttr("disabled")) : (_title = "更新(用户名不能修改)", $("#username").attr("disabled", "disabled"));

                    $('#commonDetail').window({
                        title: _title, width: 300, height: 250,
                        modal: true, collapsible: false, minimizable: false, maximizable: false,
                        resizable: false /*禁用 :折叠   最小化  最大化 */
                    });
                },

                showRoleDetailWindow: function () { //弹出"关联角色"表单框体
                    $('#roleDetail').show();
                    $('#roleDetail').window({title: "角色权限", width: 900, height: 500, modal: true});
                },

                orgDetailWindow: function () { //弹出"组织机构"框体
                    $('#orgDetail').show();
                    $('#orgDetail').window({title: "组织机构树状图 (当前用户所属机构为选中状态)", width: 900, height: 500, modal: true});
                },

                fileAuthorityWindow: function (userId) { // 弹出"所选用户的所有文件传输权限"框体
                    $('#fileAuthorityForm').show();
                    $('#fileAuthorityForm').window({title: " 请点击 + 号查看 ", width: 900, height: 500, modal: true});
                },

                //弹出"所有数据库"框体******************************************************
                dataBaseWindow: function () {
                    $('#database').show();
                    $('#database').window({title: "请给当前用户配置数据库读写权限", width: 900, height: 500, modal: true});
                },

                //展示当前用户的可读库*****************************************************************
                dataBaseTableWindow: function () {
                    $('#dataBaseTable').show();
                    $('.Middle').hide();//把右边栏隐藏起来
                    $('#dataBaseTable').window({title: "给可读库下的表配置权限", maximized: true, modal: true}); //maximized :面板最大化
                },

            }

        })(),

        self.presenter = (function () {

            return {

                defaultInit: function () { //初始化用户信息表格
                    self.view.render(self.model);
                },

                commonShowAddBtn: function () {
                    self.model.add(); //绑定新增事件
                    self.view.showCommonDetailWindow();
                },

                commonShowEditBtn: function () {
                    self.model.edit(self.view); //编辑按钮 的单击事件
                },

                commonSaveBtn: function () {
                    self.model.save(); //表单保存操作
                },

                commonResetBtn: function () {
                    self.model.reset(); //表单重置操作
                },

                commonDelBtn: function () {
                    self.model.del(); //批量删除事件
                },

                commonRefreshBtn: function () {
                    location.href = location; //绑定刷新事件
                },

                //角色关联按钮**********************************************************************

                associationRoleBtn: function () {
                    var roleModel = DATAX.Role.model; // 获取角色对象的model
                    var userId = self.model.joinRole(); // 获取用户id
                    if (userId == false) {
                        return false; // 仅支持同时为一个用户配置角色信息, 错误操作, 给出提示, 结束程序
                    } else {
                        var $warpDom = $('#roleDetail');
                        self.view.showRoleDetailWindow(); // 弹窗
                        roleModel.populateComplexForm(userInfoList, $warpDom, userId); // 填充
                    }
                },

                assignRoleBtn: function () { // 分配角色 
                    DATAX.Role.model.userAssignRole();
                    self.model.wrapRefresh();
                },

                disassignRoleBtn: function () { // 删除角色( 只是角色与用户解除关联关系, 不做删除处理 ) 
                    DATAX.Role.model.userDisassignRole();
                    self.model.wrapRefresh();
                },

                //关联组织按钮的单击事件*************************************************************

                associationOrg: function () {
                    var orgModel = DATAX.Organization.model;  // 获取组机机构对象的model
                    var userId = self.model.joinOrg();
                    if (userId == false) {
                        return false; // 仅支持同时为一个用户配置组织机构, 错误操作, 给出提示, 结束程序
                    } else {
                        self.view.orgDetailWindow(); // 弹窗
                        orgModel.getOrgTree(userId); // 填充
                    }
                },

                organizationAdd: function () {
                    DATAX.Organization.model.assignOrg(); // 保存用户到选中的"组织机构"下
                    $('#orgDetail').window('close', true); //并关闭当前页面
                    self.model.wrapRefresh();
                    // location.href = location;
                },

                // 查看权限按钮的单击事件, 查看当前用户下所有的文件传输权限**************************************
                ownFileAuthority: function () {
                    var authModel = DATAX.FileAuthority.model; // 获取文件传输权限对象的model
                    var userId = self.model.ownFileAuthority();
                    if (userId == false) {
                        return false; // 仅支持同时查看一个用户的文件传输权限配置, 错误操作, 给出提示, 结束程序
                    } else {
                        authModel.reloadOwnFileAuthority(userId);
                        self.view.fileAuthorityWindow();
                        // authModel.userFileAuthority(userId);
                        var page = "userInfo";
                        authModel.showUserFtpConfig(userId, page);
                    }
                },

                //分配库权限按钮 ：dataBaseAuth**************************************************************
                dataBaseAuth: function () {
                    var ids = userInfoList.jqGrid('getGridParam', 'selarrrow');
                    if (ids.length != 1) {
                        toastr.warning("请选择一个用户!");
                        return;
                    }
                    //把userid 赋值给全局变量, readOrWrite方法要用;
                    userIdForDbAuth = ids[0];
                    //重新载入,避免上一个用户的读写状态有残留显示
                    self.model.reloadShowAllDataBase(userIdForDbAuth);
                    self.view.dataBaseWindow();
                    self.model.showAllDataBase(userIdForDbAuth);
                },

                tableAuth: function () {
                    var ids = userInfoList.jqGrid('getGridParam', 'selarrrow');
                    if (ids.length != 1) {
                        toastr.warning("请选择一个用户!");
                        return;
                    }
                    //把userid 赋值给全局变量, readOrWrite方法要用;
                    userIdForDbAuth = ids[0];
                    //重新载入
                    self.model.reloadDataBases(userIdForDbAuth);
                    self.view.dataBaseTableWindow();
                    self.model.populateDataBaseTable();
                },

                //点击checkbox事件, 获取数据库id 和 读写标识***************************************
                readOrWrite: function () {
                    var readOrWrite = $(this).attr("value");	//读写标识 read / write
                    var databaseId = $(this).attr("id");		//数据库id
                    var flag = $(this).is(':checked');			//判断是否被选中了

// 					console.isShowlog("readOrWrite:"+readOrWrite);
// 					console.isShowlog("当前用户id:"+userIdForDbAuth);
// 					console.isShowlog("数据库id:"+databaseId);
// 					console.isShowlog("flag:"+flag);

                    if ((readOrWrite == "" ) || (readOrWrite == null)) {
                        toastr.warning('好像出现异常了!');
                        return;
                    }

                    //为当前用户设置数据库的 "读/写"权限
                    self.model.setUserDataBaseAuth(readOrWrite, databaseId, flag);
                },

                //当前用户的可读库中的表 , 设置是否可读***********************************************
                readTabels: function () {
                    var tableName = $(this).attr("name");	//表名
                    var flag = $(this).is(':checked');		//判断是否被选中了
                    //	console.isShowlog("tableName:"+tableName);
                    //	console.isShowlog("flag:"+flag);
                    self.model.setTabelAuthToRead(tableName, flag); //为当前表设置读权限
                },
                
                commonSearchInput : function(event){
            		if(event.keyCode == 13){  
                    	self.model.commonInputSearch(); 
                    }
            	},
            	
            	commonSearch :function(){
            		self.model.commonInputSearch();
            	},
            	
            	//查询全部表*****
            	commonInputSearchAll: function(){
            		self.model.commonInputSearchAll();
            	},
            }
        })()
};
