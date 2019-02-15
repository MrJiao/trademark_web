/**
 * Create by: Jackson
 */
$.namespace("jackson.config");
jackson.config ={
    isShowlog:true
}

toastr.options={positionClass:"toast-top-center",timeOut:1000,extendedTimeOut:50,hideDuration:1000};

$.namespace("jackson.log");
jackson.log.LogMan = function (tag, isShow) {
    this.tag = tag;
    this.isShow = isShow;
    jackson.log.LogMan.prototype.i = function () {
        var that = this;
        if (!that.isShow) return;
        console.log(that.getMsg("info", arguments));
    }
    jackson.log.LogMan.prototype.e = function () {
        var that = this;
        if (!that.isShow) return;
        console.log(that.getMsg("error", arguments));
    }

    jackson.log.LogMan.prototype.getMsg = function () {
        var that = this;
        var myDate = new Date();
        var time = myDate.getHours()+"点"+myDate.getMinutes()+"分"+myDate.getSeconds()+"."+myDate.getMilliseconds()+"秒";
        var level = arguments[0];
        var params = arguments[1], msg = '';
        for (var j = 0; j < params.length; j = j + 1) {
            msg = msg + params[j]+" ";
        }
        return that.tag+" "+time +" "+ level+" " + msg;
    }
};


(function ($) {
    String.prototype.replaceAll  = function(str,replaceStr){
        regExp = new RegExp(str,"gm");
        return this.replace(regExp,replaceStr);
    };
    /**
     * 通过id查找html里的子标签，
     * @param id
     * @param mapping
     */
    $.fn.appendLabel = function (id,mapping) {
        var html = $(id).html();
        if(mapping !=null && mapping != undefined){
            Object.getOwnPropertyNames(mapping).forEach(function(key){
                html = html.replaceAll("@{"+key+"}",mapping[key]);
            });
        }
       this.append(html);
    };
})(jQuery);

(function(window){
    window.JacksonUtil = new JacksonUtil();
    function JacksonUtil(){
        var p = JacksonUtil.prototype;
        //忽略异常的方法执行策略
        p.safeExecute = function (func,callback){
            if(func){
                try{
                    func();
                }catch(e){
                    if(callback!=undefined)
                        callback(e);
                }
            }
        }

    }
})(window);