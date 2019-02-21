// ==UserScript==
// @name         获取商标信息和图片信息
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
        '<div id="jackson_paramDiv" style="position: fixed;top: 10px;right:15px;border: 0px solid;">',
        '    <div style="">',
        '        <p style="background-color:yellow;">图片url数据</p>',
        '       <textarea id="picText" style="height: 20px;width: 330px",placeholder="图片url" ></textarea>',
        '    </div>',
        '    <div style="">',
        '        <p style="background-color:yellow;">商标信息</p>',
        '     <textarea id="trademarkText" style="height: 20px;width: 330px",placeholder="商标数据" ></textarea>',
        '    </div>',
        '        <p style="background-color:yellow;">获取到图片url数量：<b id="id_current_image_url_count"></b></p>',
        '        <p style="background-color:yellow;">获取到商标数据数量：<b id="id_current_data_count"></b></p>',
        '        <p style="background-color:yellow;">获取图片执行状态：<b id="id_current_pic_state"></b></p>',
        '        <p style="background-color:yellow;">获取商标信息执行状态：<b id="id_current_data_state"></b></p>',
        '        <p style="background-color:yellow;">停止时间：<b id="id_stop_time"></b></p>',
        '        <p style="background-color:yellow;">期号：<input id="id_annum" type="text" ></input></p>',
        '        <p style="background-color:yellow;">开始位置：<input id="id_start_page" type="text" ></input></p>',
        '        <p style="background-color:yellow;">结束位置：<input id="id_end_page" type="text" ></input></p>',
        '    <input type="button" id="btn_search_image_url"  style="top:150px" value="开始获取数据">',
        '    <input type="button" id="btn_search_stop"  style="top:150px" value="停止获取数据">',
        '    <input type="button" id="btn_search_continue"  style="top:150px" value="继续获取数据">',
        '</div>'
    ].join("");
    $("body").append(paramDiv);
    $("#btn_search_image_url").on("click", autoSearch);
    $("#btn_search_stop").on("click", stopAll);
    $("#btn_search_continue").on("click", continueStart);

    var lastData = '';
    var lastImageUrls = '';
    var imageCurrentPage;
    var dataCurrentPage;
    var lastPage;//上一次停止时的页码
    var id;
    var imageTaskId;
    var dataTaskId;
    var timeOutTaskId;
    var annum;
    var endPageNum;
    var startPageNum;
    var yunxingState = 'stop';
    var stopTime = 1000*60*30;
    function init() {
        $("#id_stop_time").text("");
        $("#picText").text("");
        $("#trademarkText").text("");
        lastData = '';
        lastImageUrls = '';
        lastPage = 0;
        var startNum = $("#id_start_page").val();
        var endNum = $("#id_end_page").val();
        annum = $("#id_annum").val();
        startPageNum = Math.ceil(startNum / 20);
        endPageNum = Math.ceil(endNum / 20);
        imageCurrentPage = startPageNum;
        dataCurrentPage = startPageNum;
    }

    function stopAll() {
        clearInterval(dataTaskId);
        clearInterval(imageTaskId);
        clearTimeout(timeOutTaskId);
        yunxingState = 'stop';
    }

    function autoSearch() {
        init();
        searchStart();
    };

    function continueStart() {
        searchStart();
    };

    function autoStop() {
        if (imageCurrentPage > lastPage + 5000) {
            stopAll();
            timeOutTaskId = setTimeout(continueStart, stopTime);
            lastPage = imageCurrentPage;
            return true;
        }
        return false;
    };

    function searchStart() {
        if (yunxingState == 'start') return;
        yunxingState = 'start';
        $("#id_current_pic_state").text("正在执行");
        $("#id_current_data_state").text("正在执行");
        searchId(annum, function (data) {
            id = data;
            imageTaskId = setInterval(searchImageUrl, 3000);
        });

        dataTaskId = setInterval(searchTrademarkData, 3000);
    }

    function searchId(annNum, callback) {
        $.ajax({
            type: 'POST',
            url: "annInfoView/selectInfoidBycode.html",
            data: {annNum: annNum, annTypecode: "TMZCSQ"},
            dataType: 'text',
            success: function (data) {
                callback(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorChuli(jqXHR, textStatus, errorThrown);
            }

        });
    }

    function searchImageUrl() {
        if (autoStop()) return;
        $.ajax({
            type: 'POST',
            async: true,
            url: "annInfoView/imageView.html",
            data: {id: id, pageNum: (imageCurrentPage - 1) * 20 + 1, flag: 1},
            dataType: 'json',
            success: function (json) {

                $("#id_current_image_url_count").text((imageCurrentPage - startPageNum) * 20 + "");
                lastImageUrls = lastImageUrls + JSON.stringify(json) + ";"
                $("#picText").text(lastImageUrls)
                if (imageCurrentPage > endPageNum) {
                    clearInterval(imageTaskId);
                    $("#id_current_pic_state").text("已停止");
                    $("#id_stop_time").text((new Date()).Format("yyyy-MM-dd hh:mm:ss"));
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorChuli(jqXHR, textStatus, errorThrown);
                imageCurrentPage--;
            }
        });
        imageCurrentPage++;
    };

    function errorChuli(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.statusText);
        console.log(jqXHR.responseText);
        console.log(jqXHR.status);
        stopAll();
        if (jqXHR.status == 521 || jqXHR.status == '521') {
            console.log("错误后执行脚本");
            $("#id_current_pic_state").text("已停止");
            $("#id_current_data_state").text("已停止");
            $("#id_stop_time").text((new Date()).Format("yyyy-MM-dd hh:mm:ss"));
            var js = jqXHR.responseText.substring(8, jqXHR.responseText.length - 9)
            eval(js);
        }
        timeOutTaskId = setTimeout(continueStart, stopTime);
    }

    function searchTrademarkData() {
        if (autoStop()) return;
        $.ajax({
            type: 'POST',
            async: true,
            url: "annInfoView/annSearchDG.html",
            data: {
                page: dataCurrentPage,
                rows: 20,
                annNum: annum,
                totalYOrN: true,
                annType: '',
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

                $("#id_current_data_count").text((dataCurrentPage - startPageNum) * 20 + "");
                lastData = lastData + JSON.stringify(json) + ";"
                $("#trademarkText").text(lastData);
                if (dataCurrentPage > endPageNum) {
                    clearInterval(dataTaskId);
                    $("#id_current_data_state").text("已停止");
                    $("#id_stop_time").text((new Date()).Format("yyyy-MM-dd hh:mm:ss"));
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorChuli(jqXHR, textStatus, errorThrown);
                dataCurrentPage--;
            }

        });
        dataCurrentPage++;
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