//获取模式的 提供方......js
var usableList;
$(function () {
    //控制消息显示时长**********
    toastr.options = {
        hideDuration: 800,
        positionClass: "toast-top-center",
        timeOut: 1000,
    }
    usableList = $("#commonList").jqGrid({
        url: contextPath + "/usable",
        datatype: "json",
        width: $(".data_grid").width(),
        height: document.body.clientHeight - 230,
        mtype: "GET",
        multiselect: true,
        colNames: ["ID", "名字", "模式", "备注", "创建人", "创建时间", "更新时间", "操作"],
        colModel: [
            {name: "id", index: "id", hidden: true},
            {name: "name", index: "name", align: "center", sortable: true},
            {name: "dataType", index: "dataType", align: "center", sortable: false, formatter: dataTypeFormat},
            {name: "remark", index: "remark", align: "center", sortable: false},
            {name: "userInfo", sortable: false, align: "center", formatter: userInfoFormat},
            {name: "createDate", width: 200, index: "createDate", align: "center", hidden: true},
            {name: "gmtModified", width: 200, index: "gmtModified", align: "center", formatter: gmtModifiedFormat},
            {name: "operation", sortable: false, align: "center", formatter: operationFormat}
        ],
        pager: "#commonPager",
        rowNum: 10,
        rowList: [10, 20, 30],
        sortname: "createDate",
        sortorder: "desc",
        viewrecords: true,
        gridview: true,
        autoencode: true,
        caption: "实时数据-可用接口"
    });

    //优先显示昵称 , 如果昵称为空, 再显示userName
    function userInfoFormat(value, grid, rows, state) {
        return (rows.userInfo.nickName == null) ? rows.userInfo.username : rows.userInfo.nickName;
    }

    function dataTypeFormat(value, grid, rows, state) {
        return (value == DATAX.REALTIME_GET) ? DATAX.REALTIME_PROVIDER : DATAX.REALTIME_PUBLISH;
    }

    function gmtModifiedFormat(value, grid, rows, state) {
        if (!value) {
            return cusomFormatDate(rows.createDate);
        }
        return cusomFormatDate(value);
    }

    function operationFormat(value, grid, rows, state) {

        //gain获取  subscribe 订阅
        var domSpanStr, $domSpan, className1, className2, text1, text2;

        if( rows.dataType == DATAX.REALTIME_GET ){
            className1 = "gainApplyToken",text1 = "获取方申请";
            className2 = "cancelToken",text2 = "取消申请";
        }else{
            className1 = "subscribeApplyToken",text1 = "订阅方申请";
            className2 = "subscribeCancelApply",text2 = "取消申请";
        }

        domSpanStr = ['<span>',
        '<span class=\"'+className1+'\" currentId=\"'+rows.id+'\" currentDataType = \"'+rows.dataType+'\" >'+text1+'</span>',
        '<span class="customLine">|</span>',
        '<span class=\"'+className2+'\" currentId=\"'+rows.id+'\" currentDataType = \"'+rows.dataType+'\" >'+text2+'</span>',
        '</span>'].join("");

        $domSpan = $(domSpanStr);
        return $domSpan[0].outerHTML;
    }

    //绑定刷新事件
    $("#commonRefreshBtn").click(function () {
        location.href = location;
    });

    // 点击申请,生成Token并回显----------------------------------------------
    // 获取方申请,填写并绑定Ip
    $("#commonList").on("click", ".gainApplyToken", bindIp);
    $("#bindIpSaveBtn").click(gainApplyToken);//保存填写的ip
    $("#bindIpResetBtn").click(resetBindIpForm);//重置

    //点击取消申请,删除关联的Token
    $("#commonList").on("click", ".cancelToken", cancelToken);

    // 订阅方申请,填写并绑定接收地址
    $("#commonList").on("click", ".subscribeApplyToken", bindReceivAddress);
    $("#bindReceivAddressSaveBtn").click(subscribeApplyToken);//保存填写的ip
    $("#bindReceivAddressResetBtn").click(resetBindReceivAddressForm);//重置

    //点击取消申请,删除关联的Token
    $("#commonList").on("click", ".subscribeCancelApply", subscribeCancelApply);
    //----------------------------------------------------------------------

    //+号点击事件, 增加一行(事件委托)*************************
    $("#bindIpForm").on("click", "#addLine", addLine);
    //删除一行(事件委托)************************************
    $("#bindIpForm").on("click", ".offLine", deleteLine);

    // 点击查看 :更多IP
    $("#moreIp").on("click", showIP);

    //表单重置操作
    $("#commonResetBtn").click(function () {
        $("#commonDetailForm")[0].reset();
        $("#defaultPushType").prop("checked", true);//恢复默认: 选中post
        PlatformUI.validateForm("commonDetailForm");
    });

    //查看时回显***************************
    $("#commonViewBtn").click(function () {
        var ids = usableList.jqGrid('getGridParam', 'selarrrow');
        if (ids.length != 1) {
            toastr.warning("选择一条要查看的数据!");
            return;
        }
        var id  = ids[0];

        var currentDataType = getCurrentDataType();
        getProviderOrPublish(currentDataType, id);
        if(currentDataType == DATAX.REALTIME_PROVIDER){
            $("#tokenKeyAndValue").show();
            getToken(currentDataType, id);
        }else{
            $("#tokenKeyAndValue").hide();
            getReceivAddressAndPlatformIP(currentDataType, id);
        }
    });

    // 复制 token以及 接口参数信息
    $("#btn_copyAll").click(function () {
        showPreWindow();
        var id = $(this).attr("currentId");
        var currentDataType = $(this).attr("currentdatatype");

        var findAllProviderUrl = contextPath + "/provider/" + id;
        var findAllPublishUrl = contextPath + "/publish/" + id;

        var copyToJson = {};
        var jsonArray = [];
        var strArray = [];

        PlatformUI.ajax({
            url: (currentDataType == DATAX.REALTIME_PROVIDER) ? findAllProviderUrl : findAllPublishUrl,
            afterOperation: function (data, textStatus, jqXHR) {

                var text = "";
                copyToJson.token = data.token;
                copyToJson.broadcastURL = data.broadcastURL;
                copyToJson.requestURL = data.requestURL;

                copyToJson.name = data.name;
                copyToJson.remark = data.remark;
                copyToJson.pushType = data.pushType;
                copyToJson.url = data.url;

                var urlParam = "String broadcastURL = " + "\"" + data.broadcastURL + "\";" + " // 广播地址";
                var urlParam = "String requestURL = " + "\"" + data.requestURL + "\";" + " // 请求地址";

                var urlParam = "String url = " + "\"" + data.url + "\";" + " // " + data.remark;
                var nameParam = "String name = " + "\"" + data.name + "\";" + " // " + data.remark;
                var tokenParam = "String token = " + "\"" + data.token + "\";" + " // 生成的令牌";

                var param = {};
                var arr = data.params;
                for (var i = 0; i < arr.length; i++) {
                    param = {};
                    param.key = arr[i].key;
                    param.value = arr[i].value;
                    param.paramType = arr[i].paramType;
                    param.describe = arr[i].describe;
                    jsonArray.push(param);

                    // String name = "四川"; // 四川的天气数据
                    text = param.paramType + " " + param.key + " = \"" + param.value + "\";" + " // " + param.describe;
                    strArray.push(text);
                }
                copyToJson.params = jsonArray;
                $('#out_pre').text(JSON.stringify(copyToJson, null, 2));

                // var $out_pre = document.getElementById('out_pre');
                // $out_pre.insertAdjacentHTML('beforeend', strArray.join(""));
            }
        });
    });
});

//------------------------- 方法区 ---------------------------//

// 获取所选行数据的ID
function getSelectedId() {
    var ids = usableList.jqGrid('getGridParam', 'selarrrow');
    if (ids.length != 1) {
        toastr.warning("选择一条要查看的数据!");
        return;
    }
    return ids[0];
}

// 获取所选行数据的dataType, 获取模式的dataType: get 发布订阅模式的dataType: radio
function getCurrentDataType() {
    var currentDataType = usableList.jqGrid('getCell', getSelectedId(), "dataType");
    return currentDataType;
}

function getProviderOrPublish(currentDataType, id) {

    var findAllProviderUrl = contextPath + "/usable/provider/" + id;
    var findAllPublishUrl = contextPath + "/publish/" + id;

    PlatformUI.ajax({
        url: (currentDataType == DATAX.REALTIME_PROVIDER) ? findAllProviderUrl : findAllPublishUrl,
        afterOperation: function (data, textStatus, jqXHR) {
            showCommonDetailWindow(data,currentDataType);
            //填充复杂数据
            populateForm(currentDataType, data);
            //表单回显构建完毕,在设置input只读
            changeEditForm(false);
            //验证表单
            PlatformUI.validateForm("commonDetailForm");
        }
    });
}

function getToken(currentDataType, id) {
    PlatformUI.ajax({
        url: contextPath + "/usable/provider/getToken/" + id,
        afterOperation: function (data, textStatus, jqXHR) {
            populateToken(currentDataType, data);
        }
    });
}

function getReceivAddressAndPlatformIP(currentDataType, id) {
    PlatformUI.ajax({
        url: contextPath + "/usable/subscribe/view/" + id,
        type:"post",
        afterOperation: function (data, textStatus, jqXHR) {
            populateToken(currentDataType, data);
        }
    });
}

// 清空所有的 ".benchmark",".customTextbox" , 再重新构建....
function destroyAndRecreate () {

    $(".benchmark").remove();
    $(".customTextbox").remove();
}

//弹出表单框体**************************************
function showCommonDetailWindow(data,currentDataType) {

    var _title = (currentDataType == DATAX.REALTIME_PROVIDER) ? "实时数据-获取方查看" : "实时数据-订阅方查看";

    //重置Token表单和参数表单, 把jQuery对象改成dom对象, reset()是dom的方法..
    $("#commonDetailForm")[0].reset();
    $("#commonDetailForm #id").val("");

    // 恢复默认请求方式
    $("#defaultPushType").prop("checked",true);

    //验证表单
    PlatformUI.validateForm("commonDetailForm");
    $('#commonDetail').show();
    $('#commonDetail').window({
        title: _title, modal: true, maximized: true,//面板最大化
    });

    // //清空所有的 ".benchmark" , 重新构建....
    // $(".benchmark").remove();

    destroyAndRecreate(); // remove动态创建的容器
}

//弹出<pre>框体, 展示表单中的数据
function showPreWindow() {
    $('pre').show();
    $('pre').window({
        title: " Ctrl + A 复制以下文本", modal: true, maximized: true//面板最大化
    });
}

//弹出框体, 新增IP, 绑定此条记录, 发起申请
function bindIpWindow() {
    $('#bindIp').show();
    $('#bindIp').window({
        title: "绑定可访问此数据的IP地址", modal: true, width: 460, height: 310
    });
    // 清空所有的 ".ipTable" , 重新构建....
    $(".ipTable").remove();
    addFirstLine();
}

//弹出框体, 展示IP
function showIpWindow() {
    $('#showIP').show();
    $('#showIP').window({
        title: "IP地址展示", modal: true, width: 400, height: 250
    });
}

// 验证IP: 这里只判断是否重复/是否为空, 后台做IP格式的校验
var bindIpvalidate = function () {
    // 简单粗暴的验证... 只要不为空就行...
    var allInput = $("#table_new_bindIp .required");

    var flag = true;
    for (var i = 0; i < allInput.length; i++) {
        var temp = $(allInput[i]).val().trim();
        if ((temp == null) || (temp == "")) {
            flag = false;
            break;	//增加效率
        }
    }
    return flag;
}

// 验证重复元素，有重复返回true；否则返回false
function isRepeat(a) {
    return /(\x0f[^\x0f]+)\x0f[\s\S]*\1/.test("\x0f"+a.join("\x0f\x0f") +"\x0f");
}

//请勿输入127.0.0.0和127.255.255.255 ( 保留地址 )
function isReservedAddress(arr){

    var flag = false, j = "127.0.0.1", k = "127.255.255.255";

    for(var i = 0; i < arr.length; i++){
        if ( arr[i] == j || arr[i] == k ) {
            flag = true;
            break;
        }
    }
    return flag;
}

//弹出框体, 新增IP, 绑定此条记录, 发起申请
function bindReceivAddressWindow() {

    $("#bindReceivAddressForm")[0].reset();

    $('#bindReceivAddress').show();
    $('#bindReceivAddress').window({
        title: "绑定可接收此数据的URL地址", modal: true, width: 460, height: 310
    });
}


//构建第一行... 尾巴为+号***********
var addFirstLine = function () {
    var trDom = [
        '<table  class = "t2 ipTable">',
        '    <tr>',
        '        <td><input class="required" type="text" placeholder="请输入IP地址" /></td>',
        '        <th rowspan="2" ><label id=\'addLine\' title=\'添加一行\'><a href=\'javascript:;\' >✚</a></label></th>',
        '    </tr>',
        '</table>'].join("");
    $("#table_new_bindIp").append(trDom);
}

//构建其他行, 尾巴为x号************
var addLine = function () {
    var trDom = [
        '<table  class = "t2 ipTable">',
        '    <tr>',
        '        <td><input class="required" type="text" placeholder="请输入IP地址" /></td>',
        '        <th rowspan="2" ><label class=\'offLine\' title=\'删除此行\'><a href=\'javascript:;\' >✖</a></label></th>',
        '    </tr>',
        '</table>'].join("");
    $("#table_new_bindIp").append(trDom);
}

//删除一行**********************************
var deleteLine = function () {
    var trDom = $(this).parent().parent().parent().parent();
    trDom.remove();
}

//获取参数数组****************************
// var getParams = function () {
//     var key, value, type, describe;
//     var jsonArray = new Array();
//
//     var len = $(".benchmark").length;
//     for (var i = 0; i < len; i++) { 			//遍历数组
//         //jquery对象加上脚标后, 又变成dom对象...
//         var row = {
//             "key": $($($(".benchmark")[i]).find("input")[0]).val().trim(),
//             "value": $($($(".benchmark")[i]).find("input")[1]).val().trim(),
//             "paramType": $($($(".benchmark")[i]).find("input")[2]).val().trim(),
//             "describe": $($($(".benchmark")[i]).find("input")[3]).val().trim(),
//         };
//         jsonArray.push(row);
//     }
//     return jsonArray;
// }

/**
 * @param selectId select的id值
 * @param checkValue 选中option的值
 */
function setSelectChecked(selectId, checkValue){
    var select = document.getElementById(selectId);
    for(var i=0; i<select.options.length; i++){
        if(select.options[i].innerHTML == checkValue){
            select.options[i].selected = true;
            break;
        }
    }
};


//回显表单
var populateForm = function (currentDataType, data) {

    var table = $("#table");
    $("#name").val(data.name);
    $("#remark").val(data.remark);

    if (currentDataType == DATAX.REALTIME_PROVIDER) {

        $("#currentPublishInterfacePushType").hide();
        $("#th_pushType").hide();
        $("#th_pushDataType").hide();
        $("#th_dataName").css("width","15%");
        $("#th_dataRemark").css("width","15%");
    }
    else if (currentDataType == DATAX.REALTIME_PUBLISH) {

        $("#currentPublishInterfacePushType").show();
        setSelectChecked( "select_pushType", data.pushType );

        $("#th_pushType").show();
        $("#th_pushDataType").show();
        $("#th_dataName").css("width","7.5%");
        $("#th_dataRemark").css("width","5%");

        // jQuery取得select选中的值, 以何种方式提交请求 post put ...
        // var currentPushType = $("#select_pushType option:selected").val();

        // $("input[name='pushType']").each(function () {
        //     if ($(this).val() == data.pushType) {
        //         $(this).prop("checked", true);
        //         return false;//each里面:return false 相当于break
        //     }
        // });
    }

    // 解释: 表单数据, 用于装json 或xml, 数据类型"json"或"xml"
    // 后台返回结果,其默认值 params:[], content:null, type:null
    // 如果formData没有值, 则说明该数据查询结果为json-data 或 xml-data

    var formData,content,type;

    formData = data.params;
    var len = formData.length;
    if( len > 0 ){
        setSelectChecked( "select_pushDataType", "form" );
        populateFormData( type, formData, len  );
    }
    else{
        content = data.content.content;
        type = data.content.type;

        if( type == "json" ){
            setSelectChecked( "select_pushDataType", "json" );
            populateJsonData( content );
        }
        else if( type == "xml" ){
            setSelectChecked( "select_pushDataType", "xml" );
            populateXmlData( content );
        }
    }


    //
    // // 后台返回值,三种数据中只有一种时,其他数据默认值 params:[], jsonStr:null, xmlData:null
    // var formData = data.params;
    // var jsonStr = data.jsonStr;
    // var xmlData = data.xmlData;
    // var len = formData.length;
    // if( len > 0 ){
    //
    //     // // 推送数据格式操作选项
    //     // // 新增时显示:radio form-data, json-data, xml-data, 查看时隐藏
    //     // // 查看时只显示:span 说明文
    //     // $(".pushDataType").hide().siblings().text("form-data");
    //     populateFormData( currentDataType,formData, len  );
    // }
    // else if( jsonStr != null ){
    //
    //     // $(".pushDataType").hide().siblings().text("json-data");
    //     populateJsonData( jsonStr );
    // }
    // else if( xmlData != null ){
    //
    //     // $(".pushDataType").hide().siblings().text("xml-data");
    //     populateXmlData();
    // }
}

// 创建table DOM
function createTableDom( dataType, len ){

    for (var i = 0; i < len; i++) {
        var trDom = [
            '<table  class = "t2 benchmark">',
            '	<tr>',
            '		<th id="th_paramName"></th>',
            '		<td><input class="required"	type="text"  /></td>',
            '		<th id="th_example"></th>',
            '		<td><input class="required"	type="text"  /></td>',
            '	</tr>',
            '	<tr>',
            '		<th id="th_paramType"></th>',
            '		<td><input class="required"	type="text"  /></td>',
            '		<th id="th_remarks"></th>',
            '		<td><input class="required"	type="text"  /></td>',
            '	</tr>',
            '</table>'
        ].join("");

        $("#table_new").append(trDom);

        // 获取模式 - 获取方看到的文案
        if(dataType == DATAX.REALTIME_PROVIDER){
            $("#th_paramName").text("参数名:");
            $("#th_example").text("示例值:");
            $("#th_paramType").text("参数类型:");
            $("#th_remarks").text("描述:");
        }
        // 发布订阅模式 - 订阅方看到的文案
        else if(dataType == DATAX.REALTIME_PUBLISH){
            $("#th_paramName").text("字段名称:");
            $("#th_example").text("字段示例值:");
            $("#th_paramType").text("字段类型:");
            $("#th_remarks").text("字段描述:");
        }
    }
}

// 创建table DOM 并填充
var populateFormData = function ( currentDataType, formData, len ) {

    // 先清空所有.benchmark, 再构建.....
    // $(".benchmark").remove();

    createTableDom( currentDataType, len );

    for (var i = 0; i < len; i++) {
        $($($(".benchmark")[i]).find("input")[0]).val(formData[i].key);
        $($($(".benchmark")[i]).find("input")[1]).val(formData[i].value);
        $($($(".benchmark")[i]).find("input")[2]).val(formData[i].paramType);
        $($($(".benchmark")[i]).find("input")[3]).val(formData[i].describe);
    }
}

//构建填充json的textarea
function addJsonTextbox(){

    var spanDomStr = [
        '<span class="customTextbox" id="jsonDataSpan">',
            '<div>',
                '<a> >> JSON数据展示</a>',
                '<textarea class="dataTextbox" id="jsonDataTextbox" ></textarea>',
            '</div>',
        '</span>'
    ].join("");

    var $spanDom = $(spanDomStr);
    $("#json_textarea_new").append($spanDom[0].outerHTML);
}

// 创建textarea DOM, 格式化jsonStr, 并填充
var populateJsonData = function ( jsonStr ) {

    addJsonTextbox();
    var jsonStr2JsonObj = $.parseJSON(jsonStr);
    var jsonStrFormat = JSON.stringify(jsonStr2JsonObj, null, 4);
    $("#jsonDataTextbox").text(jsonStrFormat);
}

//构建填充xml的textarea
function addXmlTextbox(){

    var spanDomStr = [
        '<span class="customTextbox" id="xmlDataSpan">',
            '<div>',
                '<a> >> XML数据展示</a>',
                '<textarea class="dataTextbox" id="xmlDataTextbox" ></textarea>',
            '</div>',
        '</span>'
    ].join("");

    var $spanDom = $(spanDomStr);
    $("#xml_textarea_new").append($spanDom[0].outerHTML);
}

var populateXmlData = function ( xmlData ) {

    addXmlTextbox();
    $("#xmlDataTextbox").text(xmlData);
}

//回显Token
var ipList;
var populateToken = function (currentDataType, data) {

    // 重置并显示
    $("#tokenForm")[0].reset();
    $("#tokenForm").show();

    // 如果已经申请,生成token, 查询展示token;
    // 如果未申请,则此处 data.token = undefined


    if (data.token || data.ip && data.url) {

        $(".noTokenTable").hide();
        $(".hasTokenTable").show(showHasTokenDom(currentDataType));

        if(data.token){
            ipList = data.ipList;
            $("#tokenValue").val(data.token.token);
            // $("#applyTokenStatus").text("已申请").css("color","#3EB65E");
            $("#tokenCreateDate").text(cusomFormatDate(data.token.createDate) + " 申请");
            $("#tokenExpireDate").text(cusomFormatDate(data.token.expireDate) + " 过期");//token过期时间
            // $("#requestURL").val(data.prefix + data.ipAndPort + data.contextPath + data.suffix);
            $("#requestURL").val(data.url);
            $("#allowCallInterfaceIp").text(ipList[0].ip);
        }

        if(data.ip && data.url) {
            $("#subscribeURL").val(data.url);//订阅地址
            $("#platformIP").text(data.ip);//两级IP
        }
    }
    else{
        $(".noTokenTable").show(showNoTokenDom(currentDataType));
        $(".hasTokenTable").hide();
    }
}

function showNoTokenDom(currentDataType) {
    if (currentDataType == DATAX.REALTIME_PROVIDER) {
        $("#noTokenTable_tr01").show();
        $("#noTokenTable_tr02").hide();
        $("#noTokenTable_tr03").show();
        $("#noTokenTable_tr04").show();
    }
    else if (currentDataType == DATAX.REALTIME_PUBLISH) {
        $("#noTokenTable_tr01").hide();
        $("#noTokenTable_tr02").show();
        $("#noTokenTable_tr03").hide();
        $("#noTokenTable_tr04").hide();
    }
}
function showHasTokenDom(currentDataType) {
    if (currentDataType == DATAX.REALTIME_PROVIDER) {
        $("#hasTokenTable_tr01").show();
        $("#hasTokenTable_tr02").hide();
        $("#hasTokenTable_tr03").show();
        $("#hasTokenTable_tr04").show();
        $("#hasTokenTable_tr05").hide();
    }
    else if (currentDataType == DATAX.REALTIME_PUBLISH) {
        $("#hasTokenTable_tr01").hide();
        $("#hasTokenTable_tr02").show();
        $("#hasTokenTable_tr03").hide();
        $("#hasTokenTable_tr04").hide();
        $("#hasTokenTable_tr05").show();
    }
    $("#tokenForm input").each(function () {
        $(this).prop("readOnly", true);
    });
}

// 点击申请,绑定 一个或多个IP
var bindIp = function () {

    // 获取'点击申请' 的属性
    var id = $(this).attr("currentId");
    var dataType = $(this).attr("currentDataType");

    $("#bindIpSaveBtn").attr("currentId", "");
    $("#bindIpSaveBtn").attr("currentDataType", "");

    bindIpWindow();

    // 按钮 :'保存' 添加的IP ,设置属性
    $("#bindIpSaveBtn").attr("currentId", id);
    $("#bindIpSaveBtn").attr("currentDataType", dataType);
}

// 重置bindIpForm表单
var resetBindIpForm = function () {
    $("#bindIpForm")[0].reset();
    PlatformUI.validateForm("commonDetailForm");
}

var getIps = function () {
    var jsonArray = new Array();
    var len = $(".ipTable").length;
    for (var i = 0; i < len; i++) {
        //jquery对象加上脚标后, 又变成dom对象...
        var ip = $($($(".ipTable")[i]).find("input")[0]).val().trim();
        jsonArray.push(ip);
    }
    return jsonArray;
}

//获取方申请, 按钮 :'保存' 添加的IP
var gainApplyToken = function () {

    var bool = bindIpvalidate();
    if(!bool){
        toastr.warning("IP为空");
        return;
    }

    var ips = getIps();

    var bool2 = isRepeat(ips);
    if(bool2){
        toastr.warning("IP重复");
        return;
    }

    //请勿输入127.0.0.0和127.255.255.255 ( 保留地址 )
    var bool3 = isReservedAddress(ips);
    if(bool3){
        toastr.warning("输入了IPv4的保留地址");
        return;
    }

    var id = $(this).attr("currentId");
    // var currentDataType = $(this).attr("currentDataType");

    PlatformUI.ajax({
        url: contextPath + "/usable/provider/applyToken",
        type: "post",
        data: {providerId: id, ips: ips},
        afterOperation: function (data, textStatus, jqXHR) {

            if(data.statusCode == 405){
                // toastr.warning(data.statusText);
                return;
            }

            // toastr.success(data.statusText); // PlatformUI.ajax已经设置了消息展示

            $('#bindIp').window('close');
            PlatformUI.refreshGrid(usableList, {sortname: "gmtCreate", sortorder: "desc"});
            // 什么一不做
        }
    });
}

// 点击申请,绑定可接收此数据的URL地址
var bindReceivAddress = function () {

    // 获取'点击申请' 的属性
    var id = $(this).attr("currentId");
    var dataType = $(this).attr("currentDataType");

    $("#bindReceivAddressSaveBtn").attr("currentId", "");
    $("#bindReceivAddressSaveBtn").attr("currentDataType", "");

    bindReceivAddressWindow();

    // 按钮 :'保存' 添加的IP ,设置属性
    $("#bindReceivAddressSaveBtn").attr("currentId", id);
    $("#bindReceivAddressSaveBtn").attr("currentDataType", dataType);
}

// 重置bindReceivAddressForm表单
var resetBindReceivAddressForm = function () {
    $("#bindReceivAddressForm")[0].reset();
    PlatformUI.validateForm("commonDetailForm");
}

var getReceivAddress = function () {
    return $("#receivAddress").val();
}

//订阅方申请, 按钮 :'保存' 添加的IP
var subscribeApplyToken = function () {

    var receivAddress = getReceivAddress();
    var id = $(this).attr("currentId");

    PlatformUI.ajax({
        url: contextPath + "/usable/subscribe/apply/" + id,
        type: "post",
        data: {url: receivAddress},
        afterOperation: function (data, textStatus, jqXHR) {
            if(data.statusCode == 405){
                // toastr.warning(data.statusText);
                return;
            }
            $('#bindReceivAddress').window('close');
            PlatformUI.refreshGrid(usableList, {sortname: "gmtCreate", sortorder: "desc"});
            // 什么一不做
        }
    });
}

//实时数据-发布----取消申请
var cancelToken = function () {
    var id = $(this).attr("currentId");
    PlatformUI.ajax({
        url: contextPath + "/usable/provider/cancelToken",
        type: "post",
        data: {providerId: id},
        afterOperation: function (data, textStatus, jqXHR) {
            // toastr.success(data.statusText);
            PlatformUI.refreshGrid(usableList, {sortname: "gmtCreate", sortorder: "desc"});
            // 什么一不做
        }
    });
}

//实时数据-订阅----取消申请
var subscribeCancelApply = function () {
    var id = $(this).attr("currentId");
    PlatformUI.ajax({
        url: contextPath + "/usable/subscribe/cancelApply/" + id,
        type: "post",
        // data: {providerId: id},
        afterOperation: function (data, textStatus, jqXHR) {
            // toastr.success(data.statusText);
            PlatformUI.refreshGrid(usableList, {sortname: "gmtCreate", sortorder: "desc"});
            // 什么一不做
        }
    });
}

//展示IP
var showIP = function () {
    $("#showIP").html("");
    showIpWindow();
    var $dom = ipList ? ("") : ("还未绑定任何IP");
    if (ipList) {
        for (var i = 0; i < ipList.length; i++) { //数组循环第一种写法
            $dom += ipList[i].ip + "<br>";
        }
    }
    $("#showIP").html($dom);
}


//查看/编辑form切换函数
function changeEditForm(flag) {
    if (flag) {
        $("#commonDetailBtnKit").show();
    } else {
        $("#commonDetailBtnKit").hide();
    }
    $("#commonDetailForm input[name!='pushType']").each(function () {
        $(this).attr("readOnly", !flag);
    });
}
