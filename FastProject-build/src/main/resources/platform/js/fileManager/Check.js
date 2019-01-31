/**
 * 定义对象: CheckBox, 操作文件的checkbox
 * 提供eventListener, 后续扩展...
 */
    DATAX.Check = new function () {

    var self = this;
    var sysPathSign = DATAX.System.getPathSign(); //系统平台是: win  mac linux, 对应文件分隔符是 "/" 还是 "\"
    self.model = (function () {
        var aCheckboxs = [];
        return {}
    })(),

        self.view = (function () {

            return {

                defaultRender: function (inputType, filesListId) {
                    var d = DATAX.Folder.model.getData(); //获取查询到的文件夹数据,展示
                    if (d != undefined && d.length > 0) {
                        self.view.addCheckbox(inputType, filesListId); //向文件夹容器 添加checkbox
                    }
                },
                customRender: function (inputType, inputName, filesListId) {
                    var d = DATAX.Folder.model.getData(); //获取查询到的文件夹数据,展示
                    if (d != undefined && d.length > 0) {
                        self.view.addCheckbox(inputType, inputName, filesListId); //向文件夹容器 添加checkbox
                    }
                },

                init: function () {
                    if (arguments.length == 2) { //构建checkbox
                        var inputType = arguments[0];
                        var filesListId = arguments[1];
                        self.presenter.defaultInit(inputType, filesListId);
                    }
                    else if (arguments.length == 3) { //构建radio
                        var inputType = arguments[0];
                        var inputName = arguments[1];
                        var filesListId = arguments[2];
                        self.presenter.customInit(inputType, inputName, filesListId);
                    }

                },

                createNode: function () {
                    if (arguments.length == 1) { //构建checkbox
                        var newNode = document.createElement("input");
                        newNode.setAttribute("type", arguments[0]); //inputType
                    }
                    else if (arguments.length == 2) { //构建checkbox
                        var newNode = document.createElement("input");
                        newNode.setAttribute("type", arguments[0]); //inputType
                        newNode.setAttribute("name", arguments[1]); //inputName
                    }
                    return newNode;
                },

                //向指定元素内添加checkbox
                addCheckbox: function () {
                    var newNode, inputType, inputName, filesListId;
                    aCheckboxs = []; //清空历史

                    if (arguments.length == 2) {
                        inputType = arguments[0];
                        filesListId = arguments[1];
                        newNode = self.view.createNode(inputType); //构建checkbox
                    }
                    else if (arguments.length == 3) {
                        inputType = arguments[0];
                        inputName = arguments[1];
                        filesListId = arguments[2];
                        newNode = self.view.createNode(inputType, inputName); //构建radio
                    }

                    // $("#" + filesListId).children("#currentFoldersParentPath").prepend(newNode);
                    // aCheckboxs.push(newNode); //暂时先不做全选checkbox

                    var nodes = $("#" + filesListId).children("#currentFolders").children(".selfFolder");
                    var len = nodes.length;
                    for (var i = 0; i < len; i++) {
                        newNode = (inputType == "checkbox") ? self.view.createNode(inputType) : self.view.createNode(inputType, inputName)

                        // IE不支持prepend()方法,报异常: 对象不支持“prepend”属性或方法
                        // nodes[i].childNodes[0].prepend(newNode);

                        // 改为before()方法来添加checkbox
                        $(nodes[i].childNodes[0].firstElementChild).before(newNode);

                        aCheckboxs.push(newNode);
                    }
                    return aCheckboxs;
                },

                // 根据具体业务做调整************************************************************************************
                // 本次业务传参id: fileList 容器内有 span , div : #currentFoldersParentPath ; div : #currentFolders (内含多个div)
                //************************************** div :[  input   input   label ] ; div : [div[input,input,label],...]
                // 参数params { "ftpId" : ftpId, "userId" : userId, "targetType" : targetType ,"operation":operation } 
                bindEvent: function (params, id, page) {
                    var nodes = $("#" + id).children("#currentFolders").children(".selfFolder");
                    for (var i = 0; i <  nodes.length; i++) {
                        var divDom = nodes[i].childNodes[0];
                        $(divDom).children("input[type='checkbox']").on("change", {"params":params, "page": page}, self.presenter.onClickCheckBox);
                    }
                    return this;
                },
            }
        })(),

        self.presenter = (function () {

            return {
                // 监听checkbox事件
                // 当前行checkbox勾选, 获取文件名称, 文件路径
                // 当前行checkbox取消, 获取文件名称, 文件路径
                // 父目录的checkbox勾选, 则取消所有子级目录的checkbox, 获取这些文件名称, 文件路径

                defaultInit: function (inputType, filesListId) {
                    self.view.defaultRender(inputType, filesListId);
                },
                customInit: function (inputType, inputName, filesListId) {
                    self.view.customRender(inputType, inputName, filesListId);
                },

                checkAll: function (e) {
                    // console.isShowlog($(this).attr("id"))
                },

                onClickCheckBox: function (e) {
                    var fileAuthorityList = [];
                    var aParams = e.data.params;
                    var aPage = e.data.page;
                    if(aPage == "fileAuthority"){
                        var auth = DATAX.FileAuthority;
                    }else if(aPage == "fileAuthorityForRole"){
                        var auth = DATAX.FileAuthorityForRole;
                    }
                    var authM = auth.model;
                    var authP = auth.presenter;

                    var userId = aParams.userId;
                    var roleId = aParams.roleId;

                    var filePath = $(this).siblings("input[name='filePath']").attr('value');
                    var ftpId = aParams.ftpId;
                    var targetType = aParams.targetType;
                    var operate = aParams.operation; //operation:add or append

                    //获取fileAuthorityVo对象
                    var fileAuthority = DATAX.fileAuth(filePath, DATAX.FILE_AUTHORITH_READ_WRITE);//管理员配置文件传输权限时,所展示文件的权限:"2",(默认:可写)
                    fileAuthorityList.push(fileAuthority);
                    var obj = {
                        ftpId : ftpId,
                        userId : userId,
                        roleId : roleId,
                        targetType : targetType,
                        fileAuthorityList : fileAuthorityList || undefined
                    };

                    var fileAuthorityVo = DATAX.fileAuthVo(obj);
                    var ofileAuthorityPath = authM.getofileAuthorityPath();

                    // 根据path返回fileAuthorityId
                    var getFileAuthorityId = function (){
                        authM.getIdByPath(currentPath,roleId,userId,targetType);
                        return authM.get_fileAuthorityId();
                    }

                    // 重新载入文件权限配置信息
                    var reloadFileConfig = function () {
                        var gid = "showFileAuthorityList";
                        if(aPage == "fileAuthority"){
                            authM.reloadUserFileConfig(gid, userId, ftpId, targetType);
                        }else if(aPage == "fileAuthorityForRole"){
                            authM.reloadRoleFileConfig(gid, roleId, ftpId, targetType);
                        }
                    }

                    if ($(this).is(":checked")) {

                         // 先获取左栏(文件传输权限配置path集合)
                         // 判断左栏(是否有自己的子目录) 如果有,找到并执行删除, 根据fileAuthorityId删除老用户ftp下的某个文件配置
                         // 再删除ofileAuthorityPath数组中存储的currentPath
                        for(var i = 0;i<ofileAuthorityPath.length;i++){
                            var currentPath = ofileAuthorityPath[i];
                            if(self.presenter.isStartWith(currentPath,filePath)){
                                if(currentPath.charAt(filePath.length) == sysPathSign){
                                    authM.customDeleteFileConfig(getFileAuthorityId());
                                    self.presenter.doSplice(ofileAuthorityPath,currentPath);
                                    i--;
                                    continue;
                                }
                            }
                        }
                        // 没有上述情况,再执行保存( fileAuthorityVo ),刷新,刷新后ofileAuthorityPath 数据也要更新
                        authM.saveAuthoriyConfig(fileAuthorityVo,$(this),filePath);
                    } else {
                        for (key in ofileAuthorityPath) {
                            var currentPath = ofileAuthorityPath[key];
                            if (currentPath == filePath) {
                                authM.deleteFileConfig(getFileAuthorityId());
                                reloadFileConfig();
                                self.presenter.doSplice(ofileAuthorityPath,currentPath);
                                break;
                            }
                        }
                    }
                },

                //动态删除数组指定元素
                doSplice:function(arr,element){
                    var index = arr.indexOf(element);
                    if (index > -1) {
                        arr.splice(index, 1);
                    }
                },

                // isStartWith ,相等或是它的子级文件夹 ,返回true
                isStartWith:function(currentPath,filePath){
                    // 这里重写了String的starWith(),
                    // 这里的变量赋值写法,不要优化精简,
                    // 不然IE浏览器会提示异常:对象不支持“startWith”属性或方法
                    var strA = currentPath;
                    var strB = filePath;
                    var bool = strA.startWith(strB);
                    return bool;
                },
            }
        })()
};

