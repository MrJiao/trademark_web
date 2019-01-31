/**
 * 给userInfo配置非结构化文件传输权限
 */

DATAX.FileAuthority = new function () {

    var self = this;
    var page = "currentPage"; //这里指xx方法在当前js文件内被引用(作用:坐标/标记)
    var pageRowNum = 10;
    var pageRowList = [10,20,30];

    var showFileAuthorityList;
    var ofileAuthorityPath = []; //[ path, path... ]

    var operation; //操作:'为用户配置文件' / 操作:'新增文件'(老用户追加文件传输权限)
    var $currentAppendFileConfig;//存储当前被点击的 '继续添加'
    var $currentDoConfigAuth;//存储当前被点击的 '为用户配置文件'
    var sysPathSign = DATAX.System.getPathSign(); //系统平台是: win  mac linux, 对应文件分隔符是 "/" 还是 "\"

    self.model = (function () {

        var userId; //用户账户页面, 查看权限按钮, 传递过来的参数
        var userName; //所选用户名称
        var userNickName; //所选用户昵称
        var _fileAuthorityId;//根据path查找的fileAuthorityId
        return {

            //默认表格
            defaultGrid: function () {},

            //自定义表格 customGrid

            // 用户配置信息展示****************************************************************
            //重新载入 '文件传输权限'
            reloadOwnFileAuthority: function (id) {
                userId = id;
                $("#currentUserIdTable").jqGrid('setGridParam', {
                    url: contextPath + "/fileAuthority/user/fTPAccountVoList/jq",
                    datatype: 'json',
                    postData: {'searchField': 'userId', 'searchString': userId, 'searchOper': "eq"}
                }).trigger('reloadGrid');
            },

            //执行删除 (删除用户文件传输权限配置)
            doDeleteUserAllFileAuthorityConfig: function (userId) {
                var AjaxUrl = contextPath + "/fileAuthority/user";
                $.ajax({
                    url: AjaxUrl,
                    type: "post",
                    data: {"_method": "DELETE", "userId": userId},
                    dataType: "json",
                    success: function (data) {
                        toastr.success(data.statusText);
                    },
                    error: function (data) {
                        toastr.warning(data.statusText);
                    }
                });
            },


            //用被选中的用户的id, 去查询当前用户下的FTP配置, 并填充数据到中间栏
            showUserFtpConfig: function (userId, page) {
                var flag = "false";
                if ( page == "userInfo" ) {
                    var customCaption = "所选用户的文件传输权限";
                } else if ( page == "currentPage" ) {
                    var customCaption = "用户 <a style='color: red'>" + userName + " </a>" + " 的FTP配置信息";
                }

                $(".container").remove();//移除上一个用户的FTP容器
                $(".allFtpContainer").remove();//移除上一个展示所用allFTP的容器,在ftpAccount页面
                $(".fileContainer").remove();//还要移除用户的FTP下的文件夹容器

                //构建一个属于当前用户的专属容器
                // $(".ftpPd").append("<div class='data_grid clear container'> <table id='currentUserIdTable'></table><div id='currentUserIdPager'></div> </div>");
                $(".ftpPd").append("<div class='data_grid clear container'> <table id='currentUserIdTable'></table></div>");

                //给某个用户的专属容器添加数据
                ftpListTable = $("#currentUserIdTable").jqGrid({
                    // width: 700,
                    width: $(".ftpPd").width()-30,
                    // height: 351, //去除分页
                    // height: 300,
                    height: (document.body.clientHeight-($(".btn_center").height()+$(".ui-jqgrid-caption").height()+$(".pg_userInfoPager").height()+150)),
                    colNames: ["uniqueId", "FTP类型","FTP别名", "FTP账号", "FTP详情", "操作", "操作"],
                    colModel: [
                        // uniqueId 的值为:ftpId + targetType ,这样做的目的是为了解决同源配置的应用场景,方便获取targetType类型
                        {name: "uniqueId", index: "uniqueId",hidden: true},
                        {name: "targetType", index: "targetType", align: "center", sortable: false, formatter: targetTypeFormat},
                        {name: "nickName", index: "nickName", align: "center", sortable: false},
                        {name: "username", index: "username", align: "center", sortable: true},
                        {name: 'ftpDetail', index: 'ftpDetail', align: "center", sortable: false,title: false,formatter:ftpDetailFormat},
                        {name: 'appendFileConfig', index: 'appendFileConfig', align: "center", sortable: false,formatter:appendFileConfigFormat,title: false},
                        {name: "deleteUserFtpConfig", index: "deleteUserFtpConfig", align: "center", sortable: false,formatter:appendFileConfigFormat,title: false},
                    ],
                    caption: customCaption,
                    //子表格********************************************************
                    subGrid: true,
                    //子表格容器的id和需要展开子表格的行id，将传入此事件函数, 这里行id, 正好就是ftpId
                    //8.30修改,解决FTP同源配置的场景, id由uniqueId替代, 表格的row_id变为自然数: 1 , 2 , 3 ...
                    subGridRowExpanded: function (subgrid_id, row_id) {
                        //获取这一行的数据(传入表格的id,和某一行的id)
                        var rowData = $("#currentUserIdTable").getRowData(row_id);
                        var uniqueId = rowData.uniqueId;
                        var targetType = rowData.targetType;
                        targetType = (targetType == DATAX.FTP_FROM) ? DATAX.FTP_TARGET_TYPE_FROM : DATAX.FTP_TARGET_TYPE_TO
                        var ftpId = uniqueId.substring( 0, uniqueId.indexOf(targetType) );

                        // 自定义表头字段:文件夹名称
                        var customIcon = '<label id="customIcon">文件夹名称</label>';

                        var subgrid_table_id = subgrid_id + "_t";

                        $("#" + subgrid_id).html("<table id='" + subgrid_table_id + "' class='scroll'></table>");
                        jQuery("#" + subgrid_table_id).jqGrid({
                            url: contextPath + "/fileAuthority/ftp/fileAuthority/jq",
                            datatype: "json",
                            postData: {
                                'searchField': 'userId,ftpId,targetType',
                                'searchString': userId + ',' + ftpId + ',' + targetType,
                                'searchOper': "eq"
                            },
                            autowidth: true,
                            colNames: ["ID", customIcon, "路径", "权限", "操作"],
                            colModel: [
                                {name: "id", index: "id", hidden: true},
                                {name: "filename", index: "filename", align: "center", sortable: false,formatter: filenameFormat},
                                {name: "path", index: "path", align: "center", sortable: false},
                                {name: "authority", index: "authority", align: "center", sortable: false,formatter: authorityFormat},
                                {name: "deleteFileConfig", index: "deleteFileConfig", align: "center", sortable: false,formatter: deleteFileConfigFormat,title: false}
                            ],
                            loadComplete:function(){
                                if ( page == "userInfo" ) {
                                    $(this).setGridParam().hideCol("deleteFileConfig");
                                }
                                $(this).setGridHeight(275,true);
                            }
                        });
                    },
                    loadComplete:function(){
                        if ( page == "userInfo" ) {
                            $(this).setGridParam().hideCol(["ftpDetail","appendFileConfig","deleteUserFtpConfig"]);//隐藏多列
                            $(this).setGridWidth(880,true);
                        }
                    }
                });

                $.ajax({
                    url:contextPath + "/fileAuthority/user/fTPAccountVoList/jq",
                    type:"GET",
                    data: {'searchField': 'userId', 'searchString': userId, 'searchOper': "eq"},
                    async:false, //是否为异步请求
                    dataType:"json",
                    success : function(data){
                        for(var i=0;i<=data.length;i++){
                            $("#currentUserIdTable").jqGrid('addRowData',i+1,data[i]);
                        }
                    }
                });

                function  targetTypeFormat(value, grid, rows, state) {
                    return (value == DATAX.FTP_TARGET_TYPE_FROM) ? DATAX.FTP_FROM : DATAX.FTP_TO
                }

                function ftpDetailFormat (value, grid, rows, state) {
                    return '<a href="javascript:void(0)" style="color:#47a8ea" '
                        + ' class="showFtpDetail" title="点击查看详情" name=\"'+rows.id+'\" >详情</a>';
                }

                function appendFileConfigFormat (value, grid, rows, state) {
                    return '<a href="javascript:void(0)" style="color:#47a8ea" class="appendFileConfig" '
                        + ' currentNickName = \"'+ rows.nickName +'\" '
                        + ' title="在该FTP服务器上,继续追文件传输权限配置" '
                        + ' currentTargetType = \"'+rows.targetType+'\" '
                        + ' name=\"'+rows.id+'\" >继续添加</a>'
                }

                function appendFileConfigFormat (value, grid, rows, state) {
                    return '<a href="javascript:void(0)" style="color:#47a8ea" class="deleteUserFtpConfig" '
                        + ' currentTargetType = \"'+rows.targetType+'\" '
                        + ' title="删除该FTP的所有权限" '
                        + ' name=\"'+rows.id+'\" >删除</a>'
                }

                function filenameFormat (value, grid, rows, state) {
                    var path = rows.path;
                    var arr = path.split(sysPathSign);
                    var folderName = arr[arr.length - 1];
                    return folderName;
                }

                function authorityFormat(value, grid, rows, state) {
                    value = (targetType == DATAX.FTP_TARGET_TYPE_FROM) ?
                        DATAX.FILE_READ : ((targetType == DATAX.FTP_TARGET_TYPE_TO) ? DATAX.FILE_WRITE : ( "获取失败!" ))
                    return value
                }

                function deleteFileConfigFormat (value, grid, rows, state) {

                    // 自定义属性currentGid / currentTargetType / currentFtpId,
                    // 来缓存gid / ftpId / targetType;
                    // 这里row.id 指fileAuthorityId

                    return '<a href="javascript:void(0)" style="color:#47a8ea" class="deleteFileConfig" title="删除该权限" '
                        + ' currentGid = \"'+grid.gid+'\" '
                        + ' currentTargetType = \"'+targetType+ '\"'
                        + ' currentFtpId = \"'+ftpId+ '\"'
                        + ' name=\"'+rows.id+'\" >删除</a>'
                }
            },

            // 右栏展示文件夹区域, checkbox勾选, 根据path 返回fileAuthorityId
            getIdByPath : function (currentPath,roleId,userId,targetType){
                $.ajax({
                    url: contextPath + "/fileAuthority/findIdByPath",
                    type: "get",
                    async:false, //是否异步
                    data: { "path": currentPath, "roleId":roleId, "userId": userId, "targetType": targetType },
                    dataType: "text",
                    success: function (data) {
                        _fileAuthorityId = data;
                        return _fileAuthorityId;
                    },
                    error: function (data) {
                        toastr.warning(data.statusText);
                    }
                });
            },

            get_fileAuthorityId : function () {
                return _fileAuthorityId;
            },

            //执行删除 (删除用户某个ftp下的文件配置)
            deleteUserFtpConfig: function (userId, ftpId, targetType) {
                var AjaxUrl = contextPath + "/fileAuthority/user/ftp";
                $.ajax({
                    url: AjaxUrl,
                    type: "post",
                    data: {"_method": "DELETE", "userId": userId, "ftpId": ftpId, "targetType": targetType},
                    dataType: "json",
                    success: function (data) {
                        toastr.success(data.statusText);
                        self.model.reloadUserFtpConfig(userId);//重新载入用户ftp配置
                    },
                    error: function (data) {
                        toastr.warning(data.statusText);
                    }
                });
            },

            /*======================================= 点击'去配置',左侧区域初始化  =====================================*/

            //构建表格,用户选择文件时,已选文件在这里展示,并提供对文件的权限设置
            showSelecteFile: function (params) {
                var customCaptionHTML = function () { //自定义表格 标题
                    var captionHTML = " ";
                    var ftpNickName = params.ftpNickName;
                    var targetType = (params.targetType == DATAX.FTP_TARGET_TYPE_FROM) ? DATAX.FTP_FROM : DATAX.FTP_TO

                    var caption = $('<a> &nbsp;&nbsp;用户 : </a><a>'+ userName + '</a>'
                                +   '<a> | 所选FTP : </a><a>' + ftpNickName + '</a>'
                                +   '<a> | 设置FTP类型为 : </a><a>' + targetType + '</a>').css({"font-weight": "normal", "font-size": "12px"});

                    for (var i = 0; i < caption.length; i++) {
                        (i % 2 == 0) ? $(caption[i]).css("color", "black") : $(caption[i]).css("color", "red");
                        captionHTML += caption[i].outerHTML;
                    }
                    return captionHTML;
                };

                $(".fileContainer").remove();// 移除上一个FTP的文件夹容器 // 构建一个属于当前FTP的专属容器
                var $dom = ["<div class='clear fileContainer'> ",
                                "<table id='showFileAuthorityList'></table>",
                                "<div id='showFileAuthorityListPage'></div>",
                            "</div>"].join("");
                $(".showFileAuthorityAndFile").append($dom);

                // 自定义表头字段:文件夹名称
                var customIcon = '<label id="customIcon">文件夹名称</label>';

                showFileAuthorityList = $("#showFileAuthorityList").jqGrid({
                    width:$(".showFileAuthorityAndFile").width()-30,
                    height:document.body.clientHeight-205,
                    multiselect: false,//列表中checkbox隐藏
                    colNames: ["ID", customIcon, "路径", "操作"],
                    colModel: [
                        {name: "id", index: "id", hidden: true},
                        {name: "filename", index: "filename", align: "center", sortable: false,formatter: filenameFormat},
                        {name: "path", index: "path", align: "center", sortable: false},
                        {name: "deselectionFile", index: "deselectionFile", align: "center", sortable: false,formatter: deselectionFileFormat}
                    ],
                    pager: "#showFileAuthorityListPage",
                    rowNum: 10,
                    rowList: [10,20,30],
                    sortname:"username",
                    sortorder:"desc",
                    viewrecords: true,
                    gridview: true,
                    autoencode: true,
                    caption: customCaptionHTML()
                });

                $.ajax({
                    url:contextPath + "/fileAuthority/ftp/fileAuthority/jq",
                    type:"GET",
                    data: {
                        'searchField': 'userId,ftpId,targetType',
                        'searchString': userId + ',' + params.ftpId + ',' + params.targetType,
                        'searchOper': "eq"
                    },
                    async:false, //是否为异步请求
                    dataType:"json",
                    success : function(data){
                        var arr = data.items;
                        var len = arr.length;
                        for(var i=0;i<=len;i++){
                            $("#showFileAuthorityList").jqGrid('addRowData',i+1,arr[i]);
                        }

                        ofileAuthorityPath = [];// 清空重新填充
                        var that = $("#showFileAuthorityList");
                        var rowNum = that.jqGrid('getGridParam', 'records');//先判断有多少行数据, 并获取id数组
                        var arrays = that.jqGrid('getDataIDs');
                        for (var i = 0; i < rowNum; i++) { //获取路径, 截取路径, 给文件名称列赋值
                            var path = that.jqGrid("getCell", arrays[i], "path");
                            ofileAuthorityPath.push(path);
                        }
                        return ofileAuthorityPath;

                    }
                });

                function filenameFormat(value, grid, rows, state) {
                    var path = rows.path;
                    var arr = path.split(sysPathSign);
                    var folderName = arr[arr.length - 1];
                    return folderName;
                }

                //自定义属性currentGid / currentTargetType / currentFtpId, 缓存gid / ftpId / targetType;这里row.id 指fileAuthorityId
                function deselectionFileFormat(value, grid, rows, state) {
                    return '<a href="javascript:void(0)" style="color:#47a8ea" class="deselectionFile" title="删除该文件传输权限配置"  '
                        +'currentGid = \"'+grid.gid+'\" ' + 'currentPath = \"'+rows.path+'\" '
                        +'currentTargetType = \"'+params.targetType+'\"  currentFtpId = \"'+params.ftpId+'\" name=\"'+rows.id+'\" >取消选择</a>';
                }
            },

            // setAndGetofileAuthorityPath: function () {
            //     ofileAuthorityPath = [];// 清空重新填充
            //     var that = $("#showFileAuthorityList");
            //     var rowNum = that.jqGrid('getGridParam', 'records');//先判断有多少行数据, 并获取id数组
            //     var arrays = that.jqGrid('getDataIDs');
            //     for (var i = 0; i < rowNum; i++) { //获取路径, 截取路径, 给文件名称列赋值
            //         var path = that.jqGrid("getCell", arrays[i], "path");
            //         ofileAuthorityPath.push(path);
            //     }
            //     return ofileAuthorityPath;
            // },

            getofileAuthorityPath: function () {
                return ofileAuthorityPath;
            },

            //路径相同, 文件名称相同 //匹配文件 //左栏文件存在, 右栏则checkbox状态为: 选中
            //同时将文件传输权限id 赋值给右栏的文件夹id <----------------------非常重要!非常重要!非常重要!
            matchingFolder: function () {
                var nodes = $("#currentFolders").children();//获取文件夹展示区的filePath (右栏)
                for (key in ofileAuthorityPath) {
                    var _filePath = ofileAuthorityPath[key];
                    for (var j = 0; j < nodes.length; j++) {
                        var filePath = $(nodes[j]).children("div[class='folderDiv']").children("input[type='hidden'][name='filePath']").val();
                        if (filePath == _filePath) {
                            $(nodes[j]).children("div[class='folderDiv']").children("input[type='checkbox']").attr("checked", true);
                            break;
                        }
                    }
                }
            },

            //取消文件传输权限后,匹配并更改右栏checkbox状态
            deselectionAfterMatchingFolder : function(currentPath){
                var nodes = $("#currentFolders").children();//获取文件夹展示区的filePath (右栏)
                for (var j = 0; j < nodes.length; j++) {
                    var filePath = $(nodes[j]).children("div[class='folderDiv']").children("input[type='hidden'][name='filePath']").val();
                    if (filePath == currentPath) {
                        $(nodes[j]).children("div[class='folderDiv']").children("input[type='checkbox']").attr("checked", false);
                        break;
                    }
                }
            },

            //保存文件传输权限配置
            saveAuthoriyConfig: function (fileAuthorityVo,currentCheckbox,filePath) {
                // var authP = DATAX.FileAuthority.presenter;
                $.ajax({
                    type: "post",
                    url: contextPath + "/fileAuthority/user",
                    data: JSON.stringify(fileAuthorityVo),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        if (data.statusCode == 0) {//"提交成功！" 状态 0
                            toastr.success(data.statusText);
                            var gid = "showFileAuthorityList";
                            var userId = fileAuthorityVo.userId;
                            var ftpId = fileAuthorityVo.ftpId;
                            var targetType = fileAuthorityVo.targetType;
                            self.model.reloadUserFileConfig(gid, userId, ftpId, targetType);//重新载入用户的文件配置信息
                            ofileAuthorityPath.push(filePath);//保存成功后,同时更新数据ofileAuthorityPath(增加)
                        }
                        else if(data.statusCode != 0){
                            toastr.warning(data.statusText);
                            currentCheckbox.attr("checked", false); //checkbox状态为: "未选中状态"
                        }
                    },
                    error: function (data) {
                        toastr.warning("提交失败!");
                        currentCheckbox.attr("checked", 'false'); //checkbox状态为: "未选中状态"
                    }
                });
            },

            //重新载入用户信息
            reloadUserInfoList: function () {
                $("#userInfoList").jqGrid(
                    'setGridParam',
                    {url: contextPath + "/userInfo", datatype: 'json'}
                ).trigger('reloadGrid');
            },

            //重新载入用户ftp配置
            reloadUserFtpConfig: function (userId) {
                $("#currentUserIdTable").jqGrid('setGridParam', {
                    url: contextPath + "/fileAuthority/user/fTPAccountVoList/jq",
                    datatype: 'json',
                    postData: {'searchField': 'userId', 'searchString': userId, 'searchOper': "eq"}
                }).trigger('reloadGrid');
            },

            //重新载入用户ftp下的文件配置
            reloadUserFileConfig: function (gid, userId, ftpId, targetType) {
                $("#"+gid).jqGrid('setGridParam', {
                    url: contextPath + "/fileAuthority/ftp/fileAuthority/jq",
                    datatype: "json",
                    postData: {
                        'searchField': 'userId,ftpId,targetType',
                        'searchString': userId + ',' + ftpId + ',' + targetType,
                        'searchOper': "eq"
                    }
                }).trigger('reloadGrid');
            },

            /*========================================= 删除老用户ftp下的某个文件配置 ===================================*/
            //删除老用户ftp下的某个文件配置
            deleteFileConfig: function (fileAuthorityId) {
                $.ajax({
                    url: contextPath + "/fileAuthority/user/file",
                    type: "post",
                    dataType: "json",
                    // async:false, //是否为异步请求
                    data: {"_method": "DELETE", "fileAuthorityId": fileAuthorityId},
                    success: function (data) {
                        if(data.statusText == "删除成功"){
                            toastr.success(data.statusText);
                        }
                    },
                    error: function (data) {
                        toastr.warning(data.statusText);
                    }
                });
            },

            //自定义删除事件( Check.js 引用了该方法)
            customDeleteFileConfig: function (fileAuthorityId) {
                $.ajax({
                    url: contextPath + "/fileAuthority/user/file",
                    type: "post",
                    dataType: "json",
                    data: {"_method": "DELETE", "fileAuthorityId": fileAuthorityId},
                });
            },

            //非结构化参数配置页面, //获取自己的 源/目标的 所有ftp信息
            findFtpAccountList: function (targetType) {
                var AjaxUrl = contextPath + "/fileAuthority/fTPAccountVoList";
                jQuery.ajax({
                    async: false, type: "GET", url: AjaxUrl, data: {"targetType": targetType},
                    success: function (data) {
                        _ftpAccountList = data;
                    },
                    error: function (xhr, status, error) {
                        toastr.warning('当前用户下未配置FTP');
                    },
                });
            },
            getFtpAccountList: function () {
                return _ftpAccountList;
            },

            //右栏 checkbox勾选,获取用户配置的fileId,构建容器,填充根据id查询的文件信息
            getUserFileId: function (prefix, that) {
                var index = prefix.length;
                var currentNodeName = that.attr("name");
                if (currentNodeName.indexOf(prefix) == 0 && currentNodeName.lastIndexOf(prefix) == 0) {
                    fileAuthorityId = currentNodeName.substring(index);
                    folderName = $("#showFileAuthorityList").jqGrid("getCell", fileAuthorityId, "filename");
                    return fileAuthorityId;
                } else {
                    return false;
                }
            },

            //左栏 checkbox勾选,获取用户id,构建容器,填充根据id查询的ftp信息
            getUserId: function () {
                var ids = $("#userInfoList").jqGrid('getGridParam', 'selarrrow');
                if (ids.length != 1) {
                    toastr.warning("选择一个用户!");
                    return false;
                }
                userId = ids[0];
                userName = $("#userInfoList").jqGrid("getCell", userId, "username");
                userNickName = $("#userInfoList").jqGrid("getCell", userId, "nickName");
                return userId;
            },
            getUserName: function () {
                return userName;
            },

            getParams : function(operate){
                var userId = this.getUserId();
                if (!userId) {
                    return false;
                }

                if(operate == "add"){
                    var that = $currentDoConfigAuth;//获取'为用户配置文件'选项的name属性,(name属性value为当前行rowId, 这里是: current ftpId)
                    var ftpId = that.attr("name");
                    var ftpTargetType = (DATAX.FTPAccount.model.getFtpTypeConfig(ftpId)==DATAX.FTP_FROM) ? DATAX.FTP_TARGET_TYPE_FROM : DATAX.FTP_TARGET_TYPE_TO
                    var params = {
                        "ftpId" : ftpId,
                        "userId" : userId,
                        "operation" : operate,
                        "targetType" : ftpTargetType,
                        "ftpNickName" : DATAX.FTPAccount.model.getFtpNickName( ftpId )
                    };
                    return params;
                }
                else if(operate == "append"){
                    var that = $currentAppendFileConfig;
                    var ftpId = that.attr("name");
                    var ftpNickName = that.attr("currentNickName");
                    var ftpTargetType = that.attr("currentTargetType");
                    var params = {
                        "ftpId" : ftpId,
                        "userId" : userId,
                        "operation" : operate,
                        "targetType" : ftpTargetType,
                        "ftpNickName" : ftpNickName
                    };
                    return params;
                }
            },

        }

    })(),

        self.view = (function () {
            return {
                render: function () {
                    var page = "fileAuthority";
                    DATAX.UserInfo.model.customGrid();
                },

                init: function () {

                    var p = DATAX.namespace("DATAX.FileAuthority.presenter"); // 使用对应的模块先引用
                    p.defaultInit();

                    $("#fileAuthorityRefreshBtn").on("click", p.commonRefreshBtn);//按钮:刷新
                    $("#addFtpConfigBtn").on("click", p.showAllFtp);	//按钮:新增FTP配置
                    $(".ftpPd").on("click", ".doConfigAuth",function(){ //点击:"去配置"
                        $currentDoConfigAuth = $(this);
                        p.userFtpFileConfig();
                    });
                    $(".showFileAuthorityAndFile").on("click", ".deselectionFile", p.deselectionFile);  //为用户配置文件弹窗口里:取消选择

                    $("#deleteAllConfigBtn").on("click", p.deleteAllConfig);							//删除用户配置的FTP以及ftp下配置的文件( 左栏 )
                    $("#showUserFtpConfigBtn").on("click", p.showUserFtpConfig);						//按钮'查看',查看用户配置的ftp( 左栏 )
                    $("#userInfoList").on("click", ".showUserInfoDetail", p.showUserInfoDetail);        //用户信息详情( 左栏 )

                    $(".ftpPd").on("click", ".showFtpDetail", p.showFtpDetail);      //新增文件传输权限,弹窗页面的ftp详情
                    $(".ftpPd").on("click", ".appendFileConfig",function(){          //点击"继续添加"
                        $currentAppendFileConfig = $(this);
                        p.appendFileConfig();
                    });
                    $(".ftpPd").on("click", ".deleteUserFtpConfig", p.deleteUserFtpConfig);//删除FTP下所有文件传输权限
                    $(".ftpPd").on("click", ".deleteFileConfig", p.deleteFileConfig); //删除文件传输权限
                },

                //弹出:新增FTP配置窗口
                addFtpConfigFormWindow: function () {
                    $('#addFtpConfigForm').show();
                    $('#addFtpConfigForm').window({
                        title: "FTP列表展示", width: 720, height: 500, modal: true
                    });
                },

                userFtpFileConfigFormWindow: function () {
                    $('#userFtpFileConfigForm').show();
                    $('#userFtpFileConfigForm').window({
                        title: "为用户配置文件权限, 左侧 [ 已选文件夹 ], 右侧 [ 待选文件夹 ]",  maximized: true, modal: true //IE9
                        // title: "为用户配置文件权限, 左侧 [ 已选文件夹 ], 右侧 [ 待选文件夹 ]", width: 1113, height: 518, modal: true //IE9
                    });
                },

                //弹出:用户信息详情窗口***************************************************
                showUserInfoDetailWindow: function (data) {

                    $("#userInfoDetailForm")[0].reset();//表单重置

                    $('#userInfoDetail').show();
                    $('#userInfoDetail').window({
                        title: "用户详细信息", width: 800, height: 250, modal: true
                    });

                    //平台提供的复杂数据填充, 在这里部分input框不适用, 注意html页面input框要设置name属性
                    // PlatformUI.populateForm("userInfoDetailForm", data);

                    // 自定义填充,直接通过 input id 为DOM赋值
                    $("#userInfoName").val(data.username);
                    $("#userInfoNickName").val(data.nickName);
                    if (data.roleList.length > 0) {
                        $("#userInfoRole").val(data.roleList[0].name);
                    }
                    $("#userInfoId").val(data.id);

                    //禁用编辑
                    var $inputs = $("#userInfoDetailForm").find("input[type!='hidden']");
                    $inputs.each(function () {
                        $(this).attr("readOnly", true); //$(this).attr('disabled','disabled');
                    });
                },

                //弹出:FTP详情窗口***********************************************
                showFtpDetailWindow: function (data) {

                    // $("#ftpDetailForm")[0].reset();//表单重置

                    $('#ftpDetail').show();
                    $('#ftpDetail').window({
                        title: "被选中的FTP详细信息",width: 400,height: 250,modal: true
                    });
                    $('#ftpDetailForm th').css("width","25%");

                    //填充复杂字段信息
                    PlatformUI.populateForm("ftpDetailForm", data);

                    //禁用编辑
                    var $inputs = $("#ftpDetailForm").find("input[type!='hidden']");
                    $inputs.each(function () {
                        $(this).attr("readOnly", true);
                    });
                },
            }

        })(),

        self.presenter = (function () {
            return {
                defaultInit: function () {
                    self.view.render();
                },

                commonRefreshBtn: function () {
                    // location.href = location; //绑定刷新事件,这个刷新不能用
                    self.model.reloadUserInfoList();//重新载入用户信息
                    $(".ftpPd").hide();// 隐藏 ftp配置栏
                },

                showAllFtp: function () {
                    var userId = self.model.getUserId();
                    if (!userId) {
                        return false;
                    }
                    var captionUserName = self.model.getUserName();
                    $(".ftpPd").show();
                    $("#pointOutFtpPd").val("点击 [ 去配置 ] 查询展示所选FTP文件夹");
                    var userOrRole = "用户";
                    DATAX.FTPAccount.model.customGrid(captionUserName,userOrRole); //新增FTP配置( 左栏 )
                },

                showUserFtpConfig: function () {
                    var userId = self.model.getUserId();
                    if (!userId) {
                        return false;
                    }
                    $(".ftpPd").show();//中栏
                    $("#pointOutFtpPd").val("请点击 + 号,查看文件传输权限");
                    self.model.showUserFtpConfig(userId, page); // 查看用户配置的ftp
                },

                /*========================================= 选择用户,删除他的所有文件传输权限配置 ===================================*/

                //删除用户配置的FTP以及ftp下配置的文件( 左栏 )
                deleteAllConfig: function () {
                    var userId = self.model.getUserId();
                    if (!userId) {
                        return false;
                    }
                    $.messager.confirm("操作提示", "您确定要删除该用户所有文件传输权限？", function (data) {
                        if (data) {
                            self.model.doDeleteUserAllFileAuthorityConfig(userId);
                            self.model.reloadUserInfoList();//重新载入用户信息
                            $(".ftpPd").hide();//隐藏中间栏
                        }
                    });
                },


                //为用户配置文件夹传输权限********************************************************
                userFtpFileConfig: function () {
                    var operate = "add";//新增
                    var params = self.model.getParams(operate);
                    self.view.userFtpFileConfigFormWindow();
                    self.model.showSelecteFile(params);//构建表格
                    var ofileAuthorityPath = self.model.getofileAuthorityPath();
                    // var ofileAuthorityPath = self.model.setAndGetofileAuthorityPath();

                    //展示选中FTP下的所有文件(右侧)*********************************
                    var page = "fileAuthority";
                    var wrap = $(".showFtpAllFolders"); // 最外层容器
                    $(".showFtpAllFolders").height(document.body.clientHeight-150);
                    DATAX.FileManager.view.init(wrap, params, page);

                    //路径相同, 文件名称相同 //匹配文件 //左栏文件存在, 右栏则checkbox状态为: 选中
                    // if (page == "fileAuthority") {
                        self.model.matchingFolder(ofileAuthorityPath);
                    // }
                },

                //为老用户ftp配置,追加文件( 中栏 )*****************************************************************************************
                appendFileConfig: function () {
                    var operate = "append";//追加
                    var params = self.model.getParams(operate);
                    self.view.userFtpFileConfigFormWindow();
                    self.model.showSelecteFile(params);//构建表格
                    var ofileAuthorityPath = self.model.getofileAuthorityPath();
                    // var ofileAuthorityPath = self.model.setAndGetofileAuthorityPath();

                    //展示选中FTP下的所有文件(右侧)*********************************
                    var page = "fileAuthority";
                    var wrap = $(".showFtpAllFolders"); // 最外层容器
                    $(".showFtpAllFolders").height(document.body.clientHeight-150);
                    DATAX.FileManager.view.init(wrap, params, page);

                    //路径相同, 文件名称相同 //匹配文件 //左栏文件存在, 右栏则checkbox状态为: 选中
                    // if (page == "fileAuthority") {
                        self.model.matchingFolder(ofileAuthorityPath);
                    // }
                },

                //保存文件传输权限配置后,清空,关闭,隐藏...
                saveOrUpdateAfterReload: function () {
                    if (operation == "add") {
                        self.presenter.userFtpFileConfig();//为用户配置文件夹传输权限
                    } else if (operation == "append") {
                        self.presenter.appendFileConfig();//为老用户ftp配置,追加文件. 新增文件传输权限配置后, 重新构建"为用户配置文件"弹窗(相当于刷新)
                    }
                },

                //删除老用户配置的ftp
                deleteUserFtpConfig: function () {
                    var userId = self.model.getUserId();
                    if (!userId) {
                        return false;
                    }
                    var ftpId = $(this).attr("name");
                    var targetType = $(this).attr("currentTargetType");
                    var userName = '<a style="color:red">' + self.model.getUserName() + '</a>';
                    $.messager.confirm("操作提示", "您确定要删除用户:" + userName + "该FTP所有文件传输权限配置？", function (data) {
                        if (data) {
                            self.model.deleteUserFtpConfig(userId, ftpId, targetType);
                        }
                    });
                },

                //删除老用户ftp下的某个文件配置
                deleteFileConfig: function () {
                    var userId = self.model.getUserId();
                    if (!userId) {
                        return false;
                    }
                    var gid = $(this).attr("currentGid");
                    var ftpId = $(this).attr("currentFtpId");
                    var fileAuthorityId = $(this).attr("name");
                    var targetType = $(this).attr("currentTargetType");

                    $.messager.confirm("操作提示", "您确定要删除该文件传输权限配置？", function (data) {
                        if (data) {
                            var bool = self.model.deleteFileConfig(fileAuthorityId);
                            self.model.reloadUserFileConfig(gid, userId, ftpId, targetType);//重新载入用户的文件配置信息
                        }
                    });
                },

                //取消已经配置的文件传输权限(配置页面,操作逻辑: 同上)
                deselectionFile: function () {
                    var userId = self.model.getUserId();
                    if (!userId) {
                        return false;
                    }
                    var gid = $(this).attr("currentGid");
                    var ftpId = $(this).attr("currentFtpId");
                    var fileAuthorityId = $(this).attr("name");
                    var targetType = $(this).attr("currentTargetType");
                    var currentPath = $(this).attr("currentPath");
                    $.messager.confirm("操作提示", "您确定要取消该文件传输权限配置？", function (data) {
                        if (data) {
                            self.model.deleteFileConfig(fileAuthorityId);
                            self.presenter.doSplice(ofileAuthorityPath,currentPath);
                            self.model.deselectionAfterMatchingFolder(currentPath); // 同时取消(右栏)对应的checkbox
                            self.model.reloadUserFileConfig(gid, userId, ftpId, targetType);//重新载入用户的文件配置信息
                        }
                    });
                },

                //动态删除数组指定元素
                doSplice:function(arr,element){
                    var index = arr.indexOf(element);
                    if (index > -1) {
                        arr.splice(index, 1);
                    }
                },

                showUserInfoDetail: function () {
                    var userId = self.model.getUserId();
                    if (!userId) {
                        return false;
                    }
                    var result = DATAX.UserInfo.model.userInfoDetail($(this), userId, self.view);
                },

                showFtpDetail: function () {
                    var fromPageView = DATAX.FileAuthority.view;
                    DATAX.FTPAccount.model.ftpDetail($(this),fromPageView);
                },

                addCfg_showFtpDetail: function () {
                    var fromPageView = DATAX.FileAuthority.view;
                    DATAX.FTPAccount.model.ftpDetail($(this),fromPageView);
                },
            }
        })()
};
