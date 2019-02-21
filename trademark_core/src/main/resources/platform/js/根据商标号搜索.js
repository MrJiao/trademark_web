// ==UserScript==
// @name         通过商标id获取商标信息和图片信息
// @namespace    http://tampermonkey.net/
// @version      2019.2.20
// @description
// @author       Jackson
// @match        http://sbgg.saic.gov.cn:9080/tmann/annInfoView/annSearch.html
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    var paramDiv = [
        // '<div id="jackson_paramDiv" style="position: fixed;top: 50px;right:-350px;border: 0px solid;">',
        '<div id="jackson_paramDiv" style="position: fixed;top: 10px;left:15px;border: 0 solid;">',
        '    <div style="">',
        '        <p style="background-color:yellow;">图片url数据</p>',
        '       <textarea id="picText" style="height: 20px;width: 330px" placeholder="图片url" ></textarea>',
        '    </div>',
        '    <div style="">',
        '        <p style="background-color:yellow;">商标信息</p>',
        '     <textarea id="trademarkText" style="height: 20px;width: 330px" placeholder="商标数据" ></textarea>',
        '    </div>',
        '        <p style="background-color:yellow;">获取到图片url数量：<b id="id_current_image_url_count"></b></p>',
        '        <p style="background-color:yellow;">获取到商标数据数量：<b id="id_current_data_count"></b></p>',
        '        <p style="background-color:yellow;">执行状态：<b id="id_current_state"></b></p>',
        '        <p style="background-color:yellow;">停止时间：<b id="id_stop_time"></b></p>',
        '    <div style="">',
        '        <p style="background-color:yellow;">输入注册号</p>',
        '     <textarea id="trademarkNumText" style="height: 20px;width: 330px" placeholder="商标号" ></textarea>',
        '    </div>',
        '    <input type="button" id="btn_search_start"  style="top:150px" value="开始获取数据">',
        '    <input type="button" id="btn_search_stop"  style="top:150px" value="停止获取数据">',
        '    <input type="button" id="btn_search_continue"  style="top:150px" value="继续获取数据">',
        '</div>'
    ].join("");
    $("body").append(paramDiv);
    $("#btn_search_start").on("click", autoSearch);
    $("#btn_search_stop").on("click", stopAll);
    $("#btn_search_continue").on("click", searchStart);

    var lastData = '';
    var lastImageUrls = '';
    var currentIndex;//当前位置
    var taskId;
    var timeOutTaskId;
    var yunxingState = 'stop';
    var regNumArr;
    var imageSize;
    var dataSize;
    var lastImageSize;//用来控制自动停止的
    var stopTime = 1000 * 60 * 30;

    function autoSearch() {
        init();
        searchStart();
    }

    function init() {
        currentIndex = -1;
        lastImageSize = 0;
        imageSize = 0;
        dataSize = 0;
        $("#picText").text("");
        $("#trademarkText").text("");
        lastData = '';
        lastImageUrls = '';
        var regNumStr = $("#trademarkNumText").val();
        regNumArr = regNumStr.split("\n");
    }

    function searchStart() {
        if (yunxingState == 'start') return;
        yunxingState = 'start';
        $("#id_current_state").text("正在执行");

        taskId = setInterval(autoTimeSearch, 3000);

    }

    function autoTimeSearch() {
        if (autoStop()) {
            $("#id_current_state").text("已停止");
            $("#id_stop_time").text((new Date()).Format("yyyy-MM-dd hh:mm:ss"));
            return;
        }
        currentIndex++;
        var mregNum = regNumArr[currentIndex];
        if (mregNum == undefined || mregNum == '') return;
        searchTrademarkData(mregNum, function (json) {
            var anNum = json.rows[0].ann_num;
            var page = json.rows[0].page_no;
            searchId(anNum, function (id) {
                searchImageUrl(id, page, function (imageUrljson) {
                    lastData = lastData + JSON.stringify(json) + ";";
                    $("#trademarkText").text(lastData);
                    $("#id_current_data_count").text(++dataSize);
                    var image = new Array(1);
                    image.push(getCurrentImage(imageUrljson.imaglist, page, imageUrljson.listsize));
                    imageUrljson.imaglist = image;
                    lastImageUrls = lastImageUrls + JSON.stringify(imageUrljson) + ";";
                    $("#picText").text(lastImageUrls);
                    $("#id_current_image_url_count").text(++imageSize);

                    if (yunxingState == 'stop') {
                        $("#id_current_state").text("已停止");
                        $("#id_stop_time").text((new Date()).Format("yyyy-MM-dd hh:mm:ss"));
                    }
                }, function (jqXHR, textStatus, errorThrown) {
                    errorChuli(jqXHR, textStatus, errorThrown);
                });
            }, function (jqXHR, textStatus, errorThrown) {
                errorChuli(jqXHR, textStatus, errorThrown);
            });


        }, function (jqXHR, textStatus, errorThrown) {
            errorChuli(jqXHR, textStatus, errorThrown);

        });

    }

    function getCurrentImage(list, curPage, listsize) {
        if (curPage <= 4) {
            return list[curPage - 1];
        } else if (listsize < 20) {
            if (listsize < 4 && listsize > 0) {
                return list[listsize - 1];
            } else {
                return list[3];
            }
        } else {
            return list[3];
        }

    }


    function stopAll() {
        clearInterval(taskId);
        clearTimeout(timeOutTaskId);
        yunxingState = 'stop';
    }

    function autoStop() {
        if (regNumArr.length <= currentIndex) {
            stopAll();
            return true;
        }
        if (imageSize > lastImageSize + 2000) {
            imageSize = lastImageSize;
            stopAll();
            timeOutTaskId = setTimeout(searchStart, stopTime);
            return true;
        }
    }

    function errorChuli(jqXHR, textStatus, errorThrown) {
        currentIndex--;
        console.log(jqXHR.statusText);
        console.log(jqXHR.responseText);
        console.log(jqXHR.status);
        $("#id_current_state").text("已停止");
        $("#id_stop_time").text((new Date()).Format("yyyy-MM-dd hh:mm:ss"));
        stopAll();
        if (jqXHR.status == 521 || jqXHR.status == '521') {
            console.log("错误后执行脚本");
            var js = jqXHR.responseText.substring(8, jqXHR.responseText.length - 9);
            eval(js);
        }
        timeOutTaskId = setTimeout(searchStart, stopTime);
    }

    function searchId(annNum, successCallBack, errorCallBack) {
        $.ajax({
            type: 'POST',
            url: "annInfoView/selectInfoidBycode.html",
            data: {annNum: annNum, annTypecode: "TMZCSQ"},
            dataType: 'text',
            success: function (data) {
                successCallBack(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorCallBack(jqXHR, textStatus, errorThrown);
            }
        });
    }

    function searchImageUrl(id, pageNum, successCallBack, errorCallBack) {
        $.ajax({
            type: 'POST',
            async: true,
            url: "annInfoView/imageView.html",
            data: {id: id, pageNum: pageNum, flag: 1},
            dataType: 'json',
            success: function (json) {
                successCallBack(json);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorCallBack(jqXHR, textStatus, errorThrown);
            }
        });
    }

    function searchTrademarkData(regNum, successCallBack, errorCallBack) {
        $.ajax({
            type: 'POST',
            async: true,
            url: "annInfoView/annSearchDG.html",
            data: {
                page: 1,
                rows: 20,
                annNum: '',
                totalYOrN: true,
                annType: 'TMZCSQ',
                tmType: '',
                coowner: '',
                recUserName: '',
                allowUserName: '',
                byAllowUserName: '',
                appId: '',
                appIdZhiquan: '',
                bfchangedAgengedName: '',
                changeLastName: '',
                transferUserName: '',
                acceptUserName: '',
                regNum: regNum,
                regName: '',
                tmName: '',
                intCls: '',
                fileType: '',
                appDateBegin: '',
                appDateEnd: '',
                agentName: ''
            },
            dataType: 'json',
            success: function (json) {
                successCallBack(json);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorCallBack(jqXHR, textStatus, errorThrown);
            }
        });
    }

    Date.prototype.Format = function (fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1,                 //月份
            "d+": this.getDate(),                    //日
            "h+": this.getHours(),                   //小时
            "m+": this.getMinutes(),                 //分
            "s+": this.getSeconds(),                 //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

})();