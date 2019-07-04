// ==UserScript==
// @name         工作创建,删除没用的责任人
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://192.168.0.2:82/redmine/projects/xfzx/issues/new*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    $("#issue_custom_field_values_25").empty();
    $("#issue_custom_field_values_25").append('<option value=\"焦      钰斌\">焦      钰斌</option>');

    $("#issue_status_id").change(clear);
    $("#issue_tracker_id").change(clear);

    function clear(){
        setTimeout(aaa,1000);
    }

    function aaa(){
        $("#issue_custom_field_values_25").empty();
        $("#issue_custom_field_values_25").append('<option value=\"焦      钰斌\">焦      钰斌</option>');
    }


    function sleep(delay) {
        var start = (new Date()).getTime();
        while ((new Date()).getTime() - start < delay) {
            continue;
        }
    }
    // Your code here...
})();