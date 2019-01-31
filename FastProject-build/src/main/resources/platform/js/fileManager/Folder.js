/**
 * 定义对象: 文件夹
 */

DATAX.Folder = new function () {

    var self = this;
    var sys = DATAX.System.getPathSign(); //系统平台是: win  mac linux, 对应文件分隔符是 "/" 还是 "\"

    var filesPathId, filesListId;

    var params; // 参数params用来查询ftp下的文件夹 { "ftpId" : ftpId, "userId" : userId, "targetType" : targetType}
    var isRootDir;

    var newParams = {};
	var page; //在哪个页面引用

    //配置前fileAuthorityId, 后台查询到的初始值为null
    //fileSwitchConfig页面, 进入子级文件夹,非admin用户需要携带父目录的FileAuthorityId,才能够查询自己的子级
    self.cacheCurrentFileAuthorityId,

        self.model = (function () {

            var _data, _ajaxUrl;

            //ftp连接错误,ftp服务登录异常,连接决绝(FTP账号或端口有误)
            var isFtpConnectError;
            var isFtpLoginException;
            var isConnectionRefused;

            var aFolder = []; //存储添加的文件夹
            var aParentPath;
            var aParentName;

            return {

                //根目录展示
                rootDir: function (params) {

                    isFtpConnectError = "";
                    isFtpLoginException = "";
                    isConnectionRefused = "";

                    _ajaxUrl = contextPath + "/fileInfo";
                    $.ajax({
                        async: false, //更改为同步 
                        type: "get", url: _ajaxUrl, data: params, dataType: "json",
                        success: function (data) {
                            if( data.statusCode == 405 ){
                                isFtpConnectError = "true";
                                toastr.warning(data.statusText);//FTP连接错误
                            }else if(data.statusCode == 500){
                                isFtpLoginException = "true";
                                toastr.warning("登录FTP服务异常...");//登录异常
                            } else{
                                _data = data;
                            }
                        },
                        error: function (data) {
                            isConnectionRefused = "true";
                            toastr.warning("连接拒绝,请检查FTP账号信息!");
                        }
                    });

                },
                ftpConnectError : function(){
                    return isFtpConnectError;
                },
                ftpLoginException : function(){
                    return isFtpLoginException;
                },
                connectionRefused : function(){
                    return isConnectionRefused;
                },

                //去子级文件夹
                subFolder: function ( path , chacheCurrentFileAuthorityId ) {
                    newParams.path = path;
                    newParams.ftpId = params.ftpId;
                    newParams.targetType = params.targetType;
					newParams.fileAuthorityId = ( chacheCurrentFileAuthorityId != undefined || chacheCurrentFileAuthorityId != null ) ? chacheCurrentFileAuthorityId : null
                    self.model.commonShowFile(newParams);
                },

                //去上级文件夹
                upLeavelFolder: function (path) {
                    newParams.path = path;
                    newParams.ftpId = params.ftpId;
                    newParams.targetType = params.targetType;
                    self.model.commonShowFile(newParams);
                },

                //获取数据
                getData: function () {
                    return _data;
                },

                commonShowFile: function (newParams) {
                    _ajaxUrl = contextPath + "/fileInfo/path";
                    $.ajax({
                        async: false, 
                        type: "get", url: _ajaxUrl, data: newParams, dataType: "json",
                        success: function (data) {
                            if(data.length > 0){
                                _data = (data[0].children.length == 0) ? data[0] : data[0].children;
                            }
                        },
                        error: function (data) {
                            toastr.warning("读取文件失败!");
                        }
                    });
                },

                addFolder: function () {
                    if (arguments.length == 0) {  // 实参长度: arguments.length  length = 0, 没有传入实参   形参长度: arguments.callee.length 
                        return false;
                    }
                    var n = arguments[0];
                    if (Array.isArray(n) && n.length > 0) {
                        // 是Object, 获取属性集: Object.getOwnPropertyNames(aParam[i]);//["name", "fileType", "path", "authority", "parentName", "parentPath", "fileAuthorityId", "children"]
                        if (n[0] instanceof Object && n[0].hasOwnProperty("path") && n[0].hasOwnProperty("children") && n[0].path == sys && Array.isArray(n[0].children)) {
                            isRootDir = true;
                            aFolder = n[0].children;//根目录的子文件夹
                        } else {
                            isRootDir = false;
                            aFolder = n;//当前文件夹
                        }
                        if (aFolder.length > 0) {
                            self.model.setaParentPath();
                            self.model.setaParentName();
                        }
                    }
                    return this;
                },
                //获取数据
                getaFolder: function () {
                    return aFolder;
                },
                setaParentPath: function () {

                    aParentPath = aFolder[0]["parentPath"];
                    var sysPathSign = DATAX.System.getPathSign();

                    // 暂时没有做虚拟根目录, 解决/null问题
                    // 非管理员账户, parentPath : "\null"
                    // 使用"/"或"\"(mac linux) 替代显示
                    // 要明确这里 替换后所显示的 "/" 并不是真正的根目录,而是为非管理员账户设置的'虚拟根目录'

                    if(aParentPath == sysPathSign + "null"){
                        aParentPath = sysPathSign;
                    }
                    return aParentPath;
                },
                setaParentName: function () {
                    aParentName = aFolder[0]["parentName"];
                    var sysPathSign = DATAX.System.getPathSign();
                    if(aParentName == null){
                        aParentName = sysPathSign;
                    }
                    return aParentName;
                },
                getaParentPath: function () {
                    return aParentPath;
                },
                getaParentName: function () {
                    return aParentName;
                },

                //新建文件夹 create folder //根据提供的文件路径和文件名称,在指定位置创建文件夹
                creFolder: function (name) {
                    //地址栏路径
                    var fpath = $("#filesPath").children("a").text();
                    newParams.path = fpath;
                    newParams.ftpId = params.ftpId;
                    newParams.targetType = params.targetType;
                    var AjaxUrl = contextPath + "/fileInfo";
                    $.ajax({
                        type: "post",
                        url: AjaxUrl,
                        data: {"ftpId":params.ftpId, "folderPath":fpath, "folderName":name},
                        success: function (data) {
                            if (data.statusText == "创建失败") {
                                toastr.warning(data.statusText + " : 文件同名或含有特殊字符");//FTP连接错误
                                return false;
                            }
                            toastr.success(data.statusText);
                            self.model.commonShowFile(newParams);//刷新当前目录
                            self.presenter.commonShowAndSetting();
                        },
                        error: function (data) {
                            toastr.warning(data.statusText);
                        }
                    });
                },

                //删除文件夹 delete folder 
                delFolder: function (parentPath, folderName) {

                    //地址栏路径
                    var fpath = $("#filesPath").children("a").text();
                    newParams.path = fpath;
                    newParams.ftpId = params.ftpId;
                    newParams.targetType = params.targetType;

                    $.ajax({
                        type: "post",
                        url: contextPath + "/fileInfo",
                        data: {
                            "_method": "DELETE",
                            "ftpId": params.ftpId, "folderPath": parentPath, "folderName": folderName
                        },
                        success: function (data) {
                            if(data.statusText == "删除失败"){
                                toastr.warning("删除失败, 不是空文件夹");
                            }else if(data.statusText == "删除成功"){
                                toastr.success(data.statusText);
                            }
                            self.model.commonShowFile(newParams);//刷新当前目录
                            self.presenter.commonShowAndSetting();
                        },
                        error: function (data) {
                            toastr.warning(data.statusText);
                        }
                    });
                },

                //文件夹重命名, 点击保存新名称, ,暂时屏蔽该功能
                saveChangeName : function (folderName, changeName) {
                    var ftpId = params.ftpId;
                    var fileAddressBar = $("#"+filesPathId).find("a").text();	//获取文件地址栏
                    $.ajax({
                        type: "post",
                        url: contextPath + "/fileInfo",
                        data: {
                            "_method":"PUT",
                            "ftpId":ftpId,"folderPath":fileAddressBar,"folderName":folderName,"changeName":changeName
                        },
                        success: function (data) {
                            toastr.success(data.statusText);
                            $(".messager-input").val("");//清空历史输入
                            self.model.commonShowFile(newParams);//刷新当前目录
                            self.presenter.commonShowAndSetting();
                        },
                        error: function (data) {
                            toastr.warning(data.statusText);
                        }
                    });
                },
            }
        })(),

        self.view = (function () {
            return {
                render: function () {
                    var data = self.model.getData(); //获取查询到的文件夹数据,展示
                    self.model.addFolder(data);
                    if ( data != undefined && data.length > 0 ) {
                        self.presenter.isNotEmptyFolder();
                    } else if ( typeof data == "object" ) {
                        var flag = self.presenter.isEmptyFolder(); //TODO 无子文件夹(但是有可能有文件)
                        return flag;
                    }
                },

                init: function () {
                    var p = DATAX.namespace("DATAX.Folder.presenter"); // 使用对应的模块先引用
                    if (arguments.length == 4) {
                        params = arguments[0];
                        filesPathId = arguments[1];
                        filesListId = arguments[2];
                        page = arguments[3]; //"fileSwitchConfig" or "fileAuthority" or "fileAuthorityForRole"
                        p.rootDir();
                    }
                },

                //展示文件
                showFilesList: function () {
                    var aFolder = self.model.getaFolder();
                    $("#" + filesListId).html(" "); // 展示前, 先清空容器
					
                    self.view.HTMLupLeaveFolderAndCreateFolder();
                    self.view.HTMLcurrentFoldersParentPath();
                    if (aFolder.length != 0) {
                        self.view.HTMLcurrentFolders();
                    }
                    self.view.setBg().bindEvent();
                },

                //展示文件路径
                showFilesPath: function () {
                    var parentPath = self.model.getaParentPath(); // 地址栏展示当前文件夹 父路径
                    $("#" + filesPathId).html("文件位置: " + "<a>" + parentPath + "</a>");
                },

                // 外层upLeaveFolderAndCreateFolder包裹: 两个div共同组成 [上级目录] [新建文件夹]
                HTMLupLeaveFolderAndCreateFolder: function () {
                    var $dom = ['<div class="upLeaveFolderAndCreateFolder">',
                                    '<div id="upLeaveFolderDiv" style="float:left;width:76%;height: auto;">',
                                        '<span id = "upLeaveFolder" >[ 上级目录 ]</span>',
                                    '</div>',
                                    '<div id="createFolderDiv" style="float:left;width:24%;height: auto;">',
                                        '<span id="createFolder" >[ 新建文件夹 ]</span>',
                                    '</div>',
                                '</div>'].join("");
                    $("#" + filesListId).append($dom);

                    if ( page == "fileSwitchConfig" ) { // fileSwitchConfig_index页面
                        $("#createFolderDiv").hide();
                        $("#upLeaveFolderDiv").css("width","100%");
                    }
                },

                /**
                 *   构建Div : 文件夹展示的第一行 
                 *	 input value设置为: 当前所有文件的父路径, 隐藏
                 *   label text设置为:当前所有文件的父目录名称, 添加 checkbox, 绑定checkAll事件
                 */
                HTMLcurrentFoldersParentPath: function () {
                    var aParentPath = self.model.getaParentPath();
                    var aParentName = self.model.getaParentName();

                    var $textParentDir = $( "<div id = 'currentFoldersParentPath' ><input type='hidden' name='filePath' value='' /><label></label></div>" );
                    var $inputDom = $textParentDir.find("input");
                    var $labelDom = $textParentDir.find("label");
                    (isRootDir) ?
                    ($inputDom.val("rootDir"), $labelDom.text(" .." + sys)) : ($inputDom.val(aParentPath), $labelDom.text(" .." + aParentName))
                    $labelDom.addClass("icon-folder");

                    var text = $textParentDir.prop("outerHTML"); //prop() 方法设置或返回被选元素的属性和值。
                    $("#" + filesListId).append(text);
                },


                /**
                 *   循环构建 div, 每行展示文件夹
                 *   结构 <div>
                 *          <div float:left ></div>
                 *          <div float:right></div>
                 *       </div>
                 *   input value设置为: 当前文件所属路径, 隐藏
                 *   label text设置为:当前文件名称,
                 */
                HTMLcurrentFolders: function () {

                    var $currentFolders = $("<div id = 'currentFolders' ></div>");
                    var $warpDiv = $("<div class='selfFolder'></div>");

                    // 展示文件夹的名称
                    var $folderDiv = $("<div class='folderDiv' style=''><input type='hidden' name='filePath' value=''/><label></label></div>");
                    $warpDiv.append($folderDiv);

                    // 添加文件夹的操作项
                    if( page == "fileAuthority" || page == "fileAuthorityForRole") {

                        // 重命名文件夹, 暂时屏蔽
                        // var $rename = "<a class='renameFolder'> 重命名 </a>";

                        var $delete = "<a class='deleteFolder'> 删除 </a>";
                        var $operationFolder = $("<div class='operationFolder' style='float: right;width:20%;'></div>");
                        $operationFolder.append($delete);

                        // 重命名文件夹, 暂时屏蔽
                        // $operationFolder.append($rename);

                        $warpDiv.append($operationFolder);
                        $operationFolder.show();
                    }

                    var $inputDom = $warpDiv.find("input");
                    var $labelDom = $warpDiv.find("label");

                    var text = " ";
                    var aFolder = self.model.getaFolder();
                    for (var i = 0; i < aFolder.length; i++) {
                        var path = aFolder[i]["path"];
                        var name = aFolder[i]["name"];
                        var fileType = aFolder[i]["fileType"];
                        var currentFileAuthorityId = aFolder[i]["fileAuthorityId"];
                        currentFileAuthorityId = ( page == "fileSwitchConfig" && currentFileAuthorityId == null ) ? self.cacheCurrentFileAuthorityId : currentFileAuthorityId
                        var fileName = (name == "") ? (sys) : (name);

                        $inputDom.val(path);
                        $labelDom.text(fileName);
                        if( page == "fileSwitchConfig" ){
                            $labelDom.attr("id", currentFileAuthorityId); // fileSwitchConfig_index页面, 设置获取到的文件传输权限id
                        }

                        var $temp = $warpDiv;
                        if (fileType == DATAX.FILE_TYPE_DIRECTORY) {
                            $labelDom.addClass("icon-folder");
                            text += $temp.prop("outerHTML");
                        }
                    }
                    $("#" + filesListId).append($currentFolders.append(text));
                    return this;
                },

                /**
                 * TODO 对象名改为 Folder --> File
                 * File.prototype.getFileList.cFilesList = function ( id )
                 * 非文件夹类型, 展示 ( txt, mp3, mov, rar, zip ... )
                 */

                // 给展示的文件夹添加样式, 鼠标进过变色	
                setBg: function () {

                    var childNodes = $("#" + filesListId).children("div");
                    var _doSetBg = function (_node) {
                        var that = this;
                        $(_node).mouseover(function () {
                            that.oldColor = this.className;
                            this.className = 'active';
                        });
                        $(_node).mouseout(function () {
                            this.className = that.oldColor;
                        });
                    };

                    // 根据具体业务做调整************************************************************************************
                    // 本次业务传参id: fileList 容器内有 span , div : #currentFoldersParentPath ; div : #currentFolders (内含多个div)
                    var len = childNodes.length;
                    for (var i = 0; i < len; i++) {
                        var ccNode = $(childNodes[i]).children("div");
                        var len2 = ccNode.length;
                        if ( len2 == 0 ) {
                            _doSetBg(childNodes[i]);
                        } else if ( len2 > 0 ) {
                            for (var j = 0; j < len2; j++) {
                                _doSetBg(ccNode[j]);
                            }
                        }
                    }
                    return this;
                },

                // 根据具体业务做调整************************************************************************************
                // 本次业务传参id: fileList 容器内有 span , div : #currentFoldersParentPath ; div : #currentFolders (内含多个div)
                //-------------------------------------- div :[  input   input   label ] ; div : [div[input,input,label],...]
                bindEvent: function () {

                    var $labelDom,$deleteFolder,$renameFolder;
                    var selfFolders = $("#" + filesListId).children("#currentFolders").children(".selfFolder");

                    $("#upLeaveFolder").click(self.presenter.upLeavelFolder);//去上级目录
                    $("#createFolder").click(self.presenter.saveNewFolder);//新建文件夹

                    for(var i = 0; i < selfFolders.length; i++){

                        //点击去子目录
                        $labelDom = $(selfFolders[i]).children("div.folderDiv").children("label");
                        $labelDom.on("click",self.presenter.subFolder);

                        // 删除文件夹
                        $deleteFolder = $(selfFolders[i]).children("div.operationFolder").children(".deleteFolder");
                        $deleteFolder.on("click",self.presenter.delFolder);

                        // 重命名文件夹, 暂时屏蔽
                        // $renameFolder = $(selfFolders[i]).children("div.operationFolder").children(".renameFolder");
                        // $renameFolder.on("click",self.presenter.renameFolder);
                    }
                    return this;
                },
            }
        })(),
        self.level = 0, //fileSwitchConfig页面, 记录文件夹进入的层级, 点击确定源或确定目标后,将level置零
        self.presenter = (function () {
            return {

                rootDir: function () {
                    var m = self.model;
                    m.rootDir(params);
                    if(m.ftpConnectError() == "true" || m.ftpLoginException() == "true" || m.connectionRefused() == "true"){
                        $('#userFtpFileConfigForm').window('close'); //配置文件的窗口关闭
                        $('#roleFtpFileConfigForm').window('close'); //配置文件的窗口关闭
                        return false;
                    }
                    self.view.render();
                },

                subFolder: function () {

                    //当前被点击的文件夹名称
					var isChecked = $(this).siblings("input[type='checkbox']").is(":checked");
					if (isChecked) {
						toastr.warning("选择子级目录,请先取消当前勾选!");
						return false;
					}

                    var currentFileAuthorityId = $(this).attr('id'); //fileSwitchConfig页面, label 的id设置为父目录的文件传输权限id
                    self.cacheCurrentFileAuthorityId = currentFileAuthorityId;
                    var path = $(this).siblings("input[name='filePath']").attr('value');
                    self.model.subFolder( path, self.cacheCurrentFileAuthorityId );

                    var flag = self.presenter.commonShowAndSetting();
                    if (flag == "false") {
                        return; //无子文件夹(终止)
                    } else {
                        if ( page == "fileSwitchConfig" ) {
                            if ( self.level < 255 ) {
                                self.level ++;
                            }else if( self.level == 255 ){
                                toastr.success("建议文件件层级不要太深!");
                                return;
                            }
                        }
                    }
                },
				
                upLeavelFolder: function () {

                    //地址栏路径
                    var fpath = $("#filesPath").children("a").text();
                    var firstIndex = fpath.indexOf(sys);
                    var lastIndex = fpath.lastIndexOf(sys);
                    var path = (lastIndex == 0) ? sys : fpath.substring(firstIndex, lastIndex);

                    if ( page == "fileSwitchConfig" ) { // fileSwitchConfig_index页面
                        if ( self.level == 0 ) {
                            toastr.success("已经是根目录了!");
                            return;
                        }
                        if ( self.level == 1 ) { //第一层子级返回上级目录,虚拟根目录问题暂未解决,这里采用:重新发请求
                            self.presenter.rootDir();
                            DATAX.FileManager.presenter.addCheck();
                            self.level --;
                            return;
                        }
                    }
                    if ( page == "fileAuthority" || page == "fileAuthorityForRole" || self.level > 0 ){
                        self.model.upLeavelFolder(path);
                        self.presenter.commonShowAndSetting();
                        self.level --;
                    }
                },
				
				commonShowAndSetting: function () {
					var flag = self.view.render();
					if (flag == "false") {
                        return flag;
                    }
                    DATAX.FileManager.presenter.addCheck();

                    //路径相同, 文件名称相同 //匹配文件 //左栏文件存在, 右栏则checkbox状态为: 选中
                    if ( page == "fileAuthority" ) {
                        DATAX.FileAuthority.model.matchingFolder();
                    }else if ( page == "fileAuthorityForRole" ) {
                        DATAX.FileAuthorityForRole.model.matchingFolder();
                    }
				},
				
                isNotEmptyFolder: function () {
                    self.view.showFilesPath();
                    self.view.showFilesList();
                },

                isEmptyFolder: function () {
                    var flag = "false";
                    toastr.warning("该文件没有子文件夹!");
                    return flag;
                },

                //新建文件夹 //点击保存新建文件夹的名称
                saveNewFolder : function () {
                    $.messager.prompt("创建空文件夹", "请输入将要创建的文件名", function (data) {
                        if(data == undefined){
                            return;
                        } else if (data == "") {
                            toastr.warning("请输入名字!");
                            return;
                        } else {
                            var folderName = data;
                            self.model.creFolder(folderName);
                        }
                    });
                },

                delFolder: function () {
                    var parentPath,folderName;
                    parentPath=  $(this).parent().siblings("div.folderDiv").children("input[name='filePath']").attr('value');
                    var index = parentPath.lastIndexOf(sys);
                    parentPath = (index === 0) ? (sys) : (parentPath.substring(0, index))
                    folderName = $(this).parent().siblings("div").find("label").text();

                    $.messager.confirm("需要确认", "确实要从服务器上删除该文件夹吗？", function (data) {
                        if (data) {
                            self.model.delFolder(parentPath, folderName);
                        }
                    });
                },

                renameFolder : function () {
                    var folderName = $(this).parent().siblings("div").find("label").text();
                    $.messager.prompt("文件夹重命名", "请输入新的文件名", function (data) {
                        if(data == undefined){
                            return;
                        } else if (data == "") {
                            toastr.warning("请输入名字!");
                            return;
                        } else {
                            var changeName = data;
                            self.model.saveChangeName(folderName, changeName);
                        }
                    });
                    $(".messager-input").val(folderName);
                },
            }
        })()
};
