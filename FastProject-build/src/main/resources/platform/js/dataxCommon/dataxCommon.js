/**
 *
 *  统一定义名称空间为: DATAX  ( 缩写:Data eXchange )
 *
 */

var DATAX = DATAX || {};

// 将命名空间传入并进行检查，没有就新建，有了就沿用

DATAX.namespace = function (str) {
    var parts = str.split(".");
    var parent = DATAX;


    if (parts[0] == "DATAX") {
        parts = parts.slice(1); //作用:删除第一个元素返回一个新的数组
    }

    for (var i = 0; i < parts.length; i++) {
        if (parent[parts[i]] == undefined) {
            parent[parts[i]] = {}; //没有就新建
        }
        parent = parent[parts[i]]; //更新父节点
    }
    return parent;
}
// **************************************************
//文件类型 : 文件 / 文件夹
DATAX.FILE_TYPE_FILE = 0;
DATAX.FILE_TYPE_DIRECTORY = 1;


//文件传输权限业务 fileAuthority_index.js
//FTP类型设置 : 源、目标
DATAX.FTP_TARGET_TYPE_FROM = "FROM";
DATAX.FTP_TARGET_TYPE_TO = "TO";

// 自定义FTP类型:显示文案
// 引用页面: fileAuthority_index,fileAuthority_forRole_index,ftPAccount_index

// 9.6 以前
// DATAX.FTP_FROM = "可读FTP";
// DATAX.FTP_TO = "可读写FTP";

//9.6 发包以后
DATAX.FTP_FROM = "源FTP";
DATAX.FTP_TO = "目标FTP";


//文件权限  2 : 可写(包括读权限)  / 1: 可读
DATAX.FILE_AUTHORITH_READ_WRITE = 2;
DATAX.FILE_AUTHORITH_READ = 1;

// 自定义文件权限:显示文案
// 引用页面: fileAuthority_index,fileAuthority_forRole_index,ftPAccount_index
// 9.6 发包以后
DATAX.FILE_READ = "可读";
DATAX.FILE_WRITE = "可写";

//传输状态(结构化以及非结构化数据传输状态) TransmitState类
DATAX.WAITING = 0;//排队中

DATAX.FILE_WAITING = 4;//等待中


DATAX.CREATE_TABLE_SUCCESS = 1;
DATAX.CREATE_TABLE_ERROR = 10;


DATAX.START =2;//正在传输
DATAX.ERROR =20;//传输失败
DATAX.COMPLETE=3;//传输完成

//实时数据-可用接口(接口信息汇总显示, dataType=get 即:获取模式, dataType=radio 即:发布订阅模式
DATAX.REALTIME_GET = "get";
DATAX.REALTIME_RADIO = "radio";
DATAX.REALTIME_PROVIDER = "获取模式";
DATAX.REALTIME_PUBLISH = "发布订阅模式";


/**
 * 判断操作系统 win  mac  linux
 */
DATAX.System = new function () {

    var sys;
    var isWin = false;
    var isMac = false;
    var isXll = false;// XLL
    var slash = "//";    //mac linux路径分割符号用:'/' , 转义字符:'//'(正斜杠)
    var backslash = "\\";//windows路径分割符号使用: '\', 转义字符:'\\'(反斜杠)

    return {

        getPathSign: function () { //在此显示检测出平台种类的路径符号

            var p = navigator.platform; //"Win32"、"Win64“、"MacPPC"、 "Maclntel"、"X11"和"Linux i686" ...
            isWin = p.indexOf("Win") == 0;
            isMac = p.indexOf("Mac") == 0;
            isXll = (p.indexOf("X11") == 0) || (p.indexOf("Linux") == 0);

            if (isWin) {
                sys = backslash;// 路径割符号 '\\'(反斜杠)
            }

            else if (isMac || isXll) {
                sys = slash;// 路径割符号 '//'(正斜杠)
            }

            else if (typeof(sys) == "undefined") {
                sys = -1; //没有检测到平台系统环境?
            }

            return sys;
        },
    }
};

/**
 * 文件传输权限设置,js对象定义
 */
DATAX.fileAuth = function (path, authority) {
    return {
        "path": path,
        "authority": authority
    }
};

DATAX.fileAuthVo = function (obj) {
    return {
        "userId": obj.userId,
        "roleId": obj.roleId,
        "ftpId": obj.ftpId,
        "targetType": obj.targetType,
        "fileAuthorityList": obj.fileAuthorityList
    }
};


//    用法
//-----------------------------------------------------------------------------------

// 		DATAX.UserInfo = { // UserInfo对象
// 			
// 			 Model : ( function () { // 闭包
// 				 
// 				return {
// 					sayHello : function () { return "hello"; }
// 				}
// 				
// 			})()
// 		}
// 		
// 		DATAX.test = { // 测试
// 			init: function(){
// 				
// 				var Umodel = DATAX.namespace("DATAX.UserInfo.Model"); // 使用对应的模块先引用
// 				console.isShowlog("判断是否为数组：" + Umodel.sayHello()); 	// hello
// 			}
// 		}
// 
// 		DATAX.test.init();
// 		DATAX.namespace("DATAX.UserInfo.Presenter");	
// 		console.isShowlog(DATAX);

// function mLog(msg){
// 	console.isShowlog(msg);
// }
//
