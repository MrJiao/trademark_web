/**
 * 给role配置非结构化文件传输权限
 */

DATAX.FileAuthorityForRole = new function () {

    var self = this;
    var pageRowNum = 10;
    var pageRowList = [10,20,30];

    var sysPathSign = DATAX.System.getPathSign(); //系统平台是: win  mac linux, 对应文件分隔符是 "/" 还是 "\"
    var page = "fileAuthorityForRole"; //这里指xx方法在当前js文件内被引用(作用:坐标/标记)
    var ofileAuthorityPath = []; // 存储左栏已经配置的文件路径 [ path1, path2... ]

    self.model = (function () {
        return {
            //默认表格
            defaultGrid: function () {},

            //自定义表格 customGrid

            //左栏 checkbox勾选,获取用户id,构建容器,填充根据id查询的ftp信息
            getRoleId: function () {
                var ids = $("#rolesList").jqGrid('getGridParam', 'selarrrow');
                if (ids.length != 1) {
                    toastr.warning("选择一个用户!");
                    return false;
                }
                var roleId = ids[0];
                return roleId;
            },
            getRoleName:function () {
                var roleId = self.model.getRoleId();
                if (!roleId) {
                    return false;
                }
                var roleName = $("#rolesList").jqGrid("getCell", roleId, "name");
                return roleName;
            },

            getParams : function(operate){
                var roleId = this.getRoleId();
                if (!roleId) {
                    return false;
                }

                if(operate == "add"){
                    var that = $currentDoConfigAuth;//获取'为用户配置文件'选项的name属性,(name属性value为当前行rowId, 这里是: current ftpId)
                    var ftpId = that.attr("name");
                    var ftpTargetType = (DATAX.FTPAccount.model.getFtpTypeConfig(ftpId)==DATAX.FTP_FROM) ? DATAX.FTP_TARGET_TYPE_FROM : DATAX.FTP_TARGET_TYPE_TO
                    var params = {
                        "ftpId" : ftpId,
                        "roleId" : roleId,
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
                        "roleId" : roleId,
                        "operation" : operate,
                        "targetType" : ftpTargetType,
                        "ftpNickName" : ftpNickName
                    };
                    return params;
                }
            },

            /*======================================= 点击'去配置',左侧区域初始化  =====================================*/

            //构建表格展示此角色所有已经配置的所有文件传输权限,右栏展示所选ftp文件夹
            showSelecteFile: function (params) {
                var customCaptionHTML = function () { //自定义表格 标题
                    var captionHTML = " ";
                    var ftpNickName = params.ftpNickName;
                    var targetType = (params.targetType == DATAX.FTP_TARGET_TYPE_FROM) ? DATAX.FTP_FROM : DATAX.FTP_TO

                    var caption = $('<a> &nbsp;&nbsp;角色 : </a><a>'+ self.model.getRoleName() + '</a>'
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

                $("#showFileAuthorityList").jqGrid({
                    width:$(".showFileAuthorityAndFile").width()-30,
                    height:document.body.clientHeight-205,
                    multiselect: false,
                    colNames: ["ID", customIcon, "路径", "操作"],
                    colModel: [
                        {name: "id", index: "id", hidden: true},
                        {name: "filename", index: "filename", align: "center", sortable: false,formatter: filenameFormat},
                        {name: "path", index: "path", align: "center", sortable: false},
                        {name: "deselectionFile", index: "deselectionFile", align: "center", sortable: false,formatter: deselectionFileFormat}
                    ],
                    pager: "#showFileAuthorityListPage",
                    rowNum: pageRowNum,
                    rowList: pageRowList,
                    sortname:"username",
                    sortorder:"desc",
                    viewrecords: true,
                    gridview: true,
                    autoencode: true,
                    caption: customCaptionHTML()
                });

                $.ajax({
                    url:contextPath + "/roleFileAuth/getAuth",
                    type:"GET",
                    data: {"roleId":params.roleId ,"ftpId":params.ftpId ,"targetType":params.targetType },
                    async:false, //是否为异步请求
                    dataType:"json",
                    success : function(data){
                        for(var i=0;i<=data.length;i++){
                            $("#showFileAuthorityList").jqGrid('addRowData',i+1,data[i]);
                        }
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

            // 左栏初始化时, 存储左栏已经配置的文件路径,后续会用到该数组**********************************
            setAndGetofileAuthorityPath: function () {
                ofileAuthorityPath = [];// 清空重新填充
                var that = $("#showFileAuthorityList");
                var rowNum = that.jqGrid('getGridParam', 'records');//先判断有多少行数据, 并获取id数组
                var arrays = that.jqGrid('getDataIDs');
                for (var i = 0; i < rowNum; i++) { //获取路径, 截取路径, 给文件名称列赋值
                    var path = that.jqGrid("getCell", arrays[i], "path");
                    ofileAuthorityPath.push(path);
                }
                return ofileAuthorityPath;
            },
            getofileAuthorityPath: function () {
                return ofileAuthorityPath;
            },
            // 路径相同, 文件名称相同 (匹配)
            // 左栏已配置文件,右栏文件所在行checkbox状态: 选中
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

            //保存文件传输权限配置*******************************************************************************
            saveAuthoriyConfig: function (fileAuthorityVo,currentCheckbox,filePath) {
                $.ajax({
                    type: "post",
                    url: contextPath + "/roleFileAuth/add",
                    data: JSON.stringify(fileAuthorityVo),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        if (data.statusCode == 0) {//"提交成功！" 状态 0
                            toastr.success(data.statusText);
                            var gid = "showFileAuthorityList";
                            var roleId = fileAuthorityVo.roleId;
                            var ftpId = fileAuthorityVo.ftpId;
                            var targetType = fileAuthorityVo.targetType;
                            self.model.reloadRoleFileConfig(gid, roleId, ftpId, targetType);//重新载入用户的文件配置信息
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

            //重新载入角色信息
            reloadRolesList: function () {
                $("#userInfoList").jqGrid(
                    'setGridParam',
                    {url: contextPath + "/role", datatype: 'json'}
                ).trigger('reloadGrid');
            },

            //重新载入角色ftp配置
            reloadRoleFtpConfig: function (roleId) {
                $("#currentRoleIdTable").jqGrid('setGridParam', {
                    url: contextPath + "/roleFileAuth/getAuthByRole/" + roleId,
                    datatype: 'json', postData: {"roleId":roleId }
                }).trigger('reloadGrid');
            },

            //重新载入该角色ftp下的文件权限配置
            reloadRoleFileConfig: function (gid, roleId, ftpId, targetType) {
                $("#"+gid).jqGrid('setGridParam', {
                    url: contextPath + "/roleFileAuth/getAuth",
                    datatype: "json", postData: {"roleId":roleId ,"ftpId":ftpId ,"targetType":targetType}
                }).trigger('reloadGrid');
            },

            //执行删除 (删除角色所有文件传输权限配置)
            doDeleteUserAllFileAuthorityConfig: function (roleId) {
                $.ajax({
                    url: contextPath + "/roleFileAuth/delete/all",
                    type: "post",
                    dataType: "json",
                    data: {"_method": "DELETE", "roleId": roleId},
                    success: function (data) {
                        toastr.success(data.statusText);
                    },
                    error: function (data) {
                        toastr.warning(data.statusText);
                    }
                });
            },

            //执行删除 (删除角色某个ftp下的文件配置)
            deleteRoleFtpConfig: function (roleId, ftpId, targetType) {
                $.ajax({
                    url: contextPath + "/roleFileAuth/delete/ftp",
                    type: "post",
                    dataType: "json",
                    data: {"_method": "DELETE", "roleId": roleId, "ftpId": ftpId, "targetType": targetType},
                    success: function (data) {
                        toastr.success(data.statusText);
                        self.model.reloadRoleFtpConfig(roleId);//重新载入ftp配置
                    },
                    error: function (data) {
                        toastr.warning(data.statusText);
                    }
                });
            },

            //删除角色某个文件权限配置
            deleteFileConfig: function (fileAuthorityId) {
                $.ajax({
                    url: contextPath + "/roleFileAuth/delete/file",
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
                    url: contextPath + "/roleFileAuth/delete/file",
                    type: "post",
                    dataType: "json",
                    data: {"_method": "DELETE", "fileAuthorityId": fileAuthorityId},
                });
            },

            // 根据role查询它的所拥有的FTP
            showRoleFtpConfig: function (roleId, page) {

                var flag = "false";
                if ( page == "roles" ) {
                    var customCaption = "所选用户的所有文件传输权限";
                } else if ( page == "fileAuthorityForRole" ) {
                    var customCaption = "角色 <a style='color: red'>" + this.getRoleName() + " </a>" +" 的FTP配置信息";
                }

                $(".container").remove();//移除上一个用户的FTP容器
                $(".allFtpContainer").remove();//移除上一个展示所用allFTP的容器,在ftpAccount页面
                $(".fileContainer").remove();//还要移除用户的FTP下的文件夹容器

                //构建一个属于当前用户的专属容器
                $(".ftpPd").append("<div class='data_grid clear container'> <table id='currentRoleIdTable'></table> </div>");

                //给某个用户的专属容器添加数据
                ftpListTable = $("#currentRoleIdTable").jqGrid({
                    width: 700,
                    // height: 351,
                    height: (document.body.clientHeight-($(".btn_center").height()+$(".ui-jqgrid-caption").height()+$(".pg_rolesPager").height()+150)),
                    colNames: ["uniqueId", "FTP类型","FTP别名", "FTP账号", "FTP详情", "操作", "操作"],
                    colModel: [
                        // uniqueId 的值为:ftpId + targetType
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
                        var rowData = $("#currentRoleIdTable").getRowData(row_id);
                        var uniqueId = rowData.uniqueId;
                        var targetType = rowData.targetType;
                        targetType = (targetType == DATAX.FTP_FROM) ? DATAX.FTP_TARGET_TYPE_FROM : DATAX.FTP_TARGET_TYPE_TO
                        var ftpId = uniqueId.substring( 0, uniqueId.indexOf(targetType) );

                        // 自定义表头字段:文件夹名称
                        var customIcon = '<label id="customIcon">文件夹名称</label>';

                        var subgrid_table_id = subgrid_id + "_t";

                        $("#" + subgrid_id).html("<table id='" + subgrid_table_id + "' class='scroll'></table>");
                        jQuery("#" + subgrid_table_id).jqGrid({
                            url: contextPath + "/roleFileAuth/getAuth",
                            datatype: "json",
                            postData: { "roleId":roleId ,"ftpId":ftpId ,"targetType":targetType },
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
                            $(this).setGridParam().hideCol(["ftpDetail","appendFileConfig","deleteUserFtpConfig"]);
                            $(this).setGridWidth(880,true);
                        }
                    }
                });

                $.ajax({
                    url: contextPath + "/roleFileAuth/getAuthByRole/" + roleId,
                    type:"GET",
                    data: {'searchField': 'roleId', 'searchString': roleId, 'searchOper': "eq"},
                    async:true, //是否为异步请求
                    dataType:"json",
                    success : function(data){
                        for(var i=0;i<=data.length;i++){
                            $("#currentRoleIdTable").jqGrid('addRowData',i+1,data[i]);
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
                    dataType: "text",
                    data: { "path": currentPath, "roleId":roleId, "userId": userId, "targetType": targetType },
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
        }
    })(),

    self.view = (function () {
        return {
            render: function () {
                var page = "fileAuthorityForRole";
                DATAX.Role.model.customGrid();
            },

            init: function () {
                var p = DATAX.namespace("DATAX.FileAuthorityForRole.presenter"); // 使用对应的模块先引用
                p.defaultInit();

                $("#addFtpConfigBtn").on("click",p.showAllFtp);//按钮:新增权限
                $("#showRoleFtpConfigBtn").on("click",p.showRoleFtpConfig);//按钮:查看权限
                $("#deleteAllConfigBtn").on("click",p.deleteAllConfig);//按钮:删除权限(删除该角色所有FTP下所有文件传输权限)
                $("#refreshBtn").on("click",p.refresh);//按钮:刷新

                $(".ftpPd").on("click", ".showFtpDetail", p.showFtpDetail);//新增文件传输权限,弹窗页面的ftp详情
                $(".ftpPd").on("click", ".doConfigAuth",function(){//点击:"去配置"
                    $currentDoConfigAuth = $(this);
                    p.roleFtpFileConfig();
                });

                $(".ftpPd").on("click", ".appendFileConfig",function(){//点击"继续添加"
                    $currentAppendFileConfig = $(this);
                    p.appendFileConfig();
                });

                $(".ftpPd").on("click", ".deleteUserFtpConfig", p.deleteUserFtpConfig);//删除FTP下所有文件传输权限
                $(".ftpPd").on("click", ".deleteFileConfig", p.deleteFileConfig); //删除文件传输权限

                $(".showFileAuthorityAndFile").on("click", ".deselectionFile", p.deselectionFile);  //为角色配置文件权限弹窗口里:取消选择
            },

            //弹出:FTP详情窗口***********************************************
            showFtpDetailWindow: function (data) {
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

            roleFtpFileConfigFormWindow: function () {
                $('#roleFtpFileConfigForm').show();
                $('#roleFtpFileConfigForm').window({
                    title: "为角色配置文件权限, 左侧 [ 已选文件夹 ], 右侧 [ 待选文件夹 ]", maximized: true, modal: true
                    // title: "为角色配置文件权限, 左侧 [ 已选文件夹 ], 右侧 [ 待选文件夹 ]", width: 1113, height: 518, modal: true
                });
            },
        }
    })(),

    self.presenter = (function () {
        return {
            defaultInit: function () {
                self.view.render();
            },
            refresh:function () {
                var _URL = location.href;
                var lastElement = _URL.charAt(_URL.length-1)
                if(lastElement == "#"){
                    _URL = _URL.substr(0,_URL.length-1);
                }
                location.href = _URL;
            },

            //展示所有FTP账号信息,提供连接查询展示文件夹
            showAllFtp: function () {
                var roleId = self.model.getRoleId();
                if (!roleId) {
                    return false;
                }
                var captionRoleName = self.model.getRoleName();
                $(".ftpPd").show();
                $("#pointOutFtpPd").val("点击 [ 去配置 ] 查询展示所选FTP文件夹");
                var userOrRole = "角色";
                DATAX.FTPAccount.model.customGrid(captionRoleName,userOrRole); //新增FTP配置( 左栏 )
            },

            // 根据role查询它的所拥有的FTP
            showRoleFtpConfig:function(){
                var roleId = self.model.getRoleId();
                if (!roleId) {
                    return false;
                }
                $(".ftpPd").show();//中栏
                $("#pointOutFtpPd").val("请点击 + 号,查看文件传输权限");
                self.model.showRoleFtpConfig(roleId, page); // 查看角色配置的ftp
            },

            //选中角色,删除该角色所有文件权限
            deleteAllConfig:function () {
                var roleId = self.model.getRoleId();
                if (!roleId) {
                    return false;
                }
                $.messager.confirm("操作提示", "您确定要删除该用户所有文件传输权限？", function (data) {
                    if (data) {
                        self.model.doDeleteUserAllFileAuthorityConfig(roleId);
                        self.model.reloadRolesList();//重新载入角色信息
                        $(".ftpPd").hide();//隐藏中间栏
                    }
                });
            },

            //删除角色配置的ftp
            deleteUserFtpConfig: function () {
                var roleId = self.model.getRoleId();
                if (!roleId) {
                    return false;
                }
                var ftpId = $(this).attr("name");
                var targetType = $(this).attr("currentTargetType");
                var roleName = '<a style="color:red">' + self.model.getRoleName() + '</a>';
                $.messager.confirm("操作提示", "您确定要删除用户:" + roleName + "该FTP所有文件传输权限配置？", function (data) {
                    if (data) {
                        self.model.deleteRoleFtpConfig(roleId, ftpId, targetType);
                    }
                });
            },

            //删除某个文件权限配置
            deleteFileConfig: function () {
                var roleId = self.model.getRoleId();
                if (!roleId) {
                    return false;
                }
                var gid = $(this).attr("currentGid");
                var ftpId = $(this).attr("currentFtpId");
                var fileAuthorityId = $(this).attr("name");
                var targetType = $(this).attr("currentTargetType");

                $.messager.confirm("操作提示", "您确定要删除该文件传输权限配置？", function (data) {
                    if (data) {
                        var bool = self.model.deleteFileConfig(fileAuthorityId);
                        self.model.reloadRoleFileConfig(gid, roleId, ftpId, targetType);//重新载入用户的文件配置信息
                    }
                });
            },

            //取消已经配置的文件传输权限(配置页面,操作逻辑: 同上)
            deselectionFile: function () {
                var roleId = self.model.getRoleId();
                if (!roleId) {
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
                        self.model.reloadRoleFileConfig(gid, roleId, ftpId, targetType);//重新载入用户的文件配置信息
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

            //**********************************************************************
            //新增文件传输权限,弹窗页面的ftp详情
            showFtpDetail: function () {
                var fromPageView = DATAX.FileAuthorityForRole.view;
                DATAX.FTPAccount.model.ftpDetail($(this),fromPageView);
            },

            //点击:"去配置",弹窗:左栏显示已经配置文件权限,右栏显示所选ftp文件夹
            roleFtpFileConfig :function () {
                var operate = "add";//新增
                var params = self.model.getParams(operate);
                self.view.roleFtpFileConfigFormWindow();
                self.model.showSelecteFile(params);//构建表格
                var ofileAuthorityPath = self.model.setAndGetofileAuthorityPath();

                // 展示选中FTP下的所有文件(右侧)
                var page = "fileAuthorityForRole";
                var wrap = $(".showFtpAllFolders"); // 最外层容器
                $(".showFtpAllFolders").height(document.body.clientHeight-150);
                DATAX.FileManager.view.init(wrap, params, page);

                // 路径相同, 文件名称相同 (匹配)
                // 左栏已配置文件,右栏文件所在行checkbox状态: 选中
                // if (page == "fileAuthority") {
                    self.model.matchingFolder(ofileAuthorityPath);
                // }
            },

            //为所选角色的ftp配置,追加文件权限
            appendFileConfig: function () {
                var operate = "append";//追加
                var params = self.model.getParams(operate);
                self.view.roleFtpFileConfigFormWindow();
                self.model.showSelecteFile(params);//构建表格
                var ofileAuthorityPath = self.model.setAndGetofileAuthorityPath();

                //展示选中FTP下的所有文件(右侧)*********************************
                var page = "fileAuthorityForRole";
                var wrap = $(".showFtpAllFolders"); // 最外层容器
                $(".showFtpAllFolders").height(document.body.clientHeight-150);
                DATAX.FileManager.view.init(wrap, params, page);

                //路径相同, 文件名称相同 //匹配文件 //左栏文件存在, 右栏则checkbox状态为: 选中
                // if (page == "fileAuthority") {
                    self.model.matchingFolder(ofileAuthorityPath);
                // }
            },
        }
    })()
};
