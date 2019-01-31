
//把收到的时间戳, 格式化成"日期+时间"的格式
//格式前: Mon Sep 17 2018 17:54:38 GMT+0800 (中国标准时间)
//格式后: 2018-09-17 17:54:38

function cusomFormatDate(long){

    // number-->String, 把1-9变成01-09
    var _numToString = function (num) {
        return (num >= 1 && num <= 9) ? ("0" + num) : ("" + num);
    }

    var date = new Date(long);
    var year = date.getFullYear();

    // 得到月份的索引0-11,所以需要相应的+1,变成1-12
    var month = _numToString(date.getMonth()+1);
    var day = _numToString(date.getDate());
    var hour = _numToString(date.getHours());
    var min = _numToString(date.getMinutes());
    var sec = _numToString(date.getSeconds());

    // 年-月-日 时:分:秒
    return year + "-" + month + "-" + day+" "+ hour + ":" + min + ":" + sec;
}