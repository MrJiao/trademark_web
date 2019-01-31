//获取模式的 提供方......js
var publishList;

$(function(){
    //控制消息显示时长
    toastr.options={
        hideDuration:800,
        positionClass:"toast-top-center",
        timeOut:1000,
    }

    publishList = $("#commonList").jqGrid({
        url: contextPath + "/publish",
        datatype: "json",
        width:$(".data_grid").width(),
        height:document.body.clientHeight-230,
        mtype: "GET",
        multiselect: true,
        colNames: ["ID", "名字","备注","推送方式","创建人","创建时间", "更新时间","操作","状态"],
        colModel: [
            { name: "id", index:"id",hidden: true},
            { name: "name", index:"name", align:"center", sortable: true},
            { name: "remark", index:"remark", align:"center", sortable: false},
            { name: "pushType", index:"pushType", align:"center", sortable: false},
            { name: "userInfo",index: "userInfo",align: "center",sortable:false,formatter: userInfoFormat},
            { name: "createDate",index:"createDate",align:"center", hidden: true},
            { name: "gmtModified",index:"gmtModified",align:"center", width:200,formatter: gmtModifiedFormat},
            { name: "operation",index: "operation",align: "center",sortable:false,width:200, formatter: operationFormat},
            { name: "state",index: "state",sortable:false,align: "center", formatter: stateFormat}
        ],
        pager: "#commonPager",
        rowNum: 10,
        rowList: [10, 20, 30],
        sortname:"createDate",
        sortorder:"desc",
        viewrecords: true,
        gridview: true,
        autoencode: true,
        caption: "实时数据-发布订阅模式"
    });


    //优先显示昵称 , 如果昵称为空, 再显示userName
    function userInfoFormat (value, grid, rows, state) {
        return (value.nickName == null) ? value.username : value.nickName;
    }

    function gmtModifiedFormat (value, grid, rows, state) {
        if(!value) {
            return cusomFormatDate(rows.createDate);
        }
        return cusomFormatDate(value);
    }

    function operationFormat(value, grid, rows, state) {

        var domSpanStr,$domSpan;
        var className1 = "applyToken",text1 = "发布者申请";
        var className2 = "cancelToken",text2 = "取消申请";

        domSpanStr = ['<span>',
        '<span class=\"'+className1+'\" currentId=\"'+rows.id+'\" currentDataType = \"'+rows.dataType+'\" >'+text1+'</span>',
        '<span class="customLine">|</span>',
        '<span class=\"'+className2+'\" currentId=\"'+rows.id+'\" currentDataType = \"'+rows.dataType+'\" >'+text2+'</span>',
        '</span>'].join("");

        $domSpan = $(domSpanStr);
        return $domSpan[0].outerHTML;
    }

    function stateFormat(value, grid, rows, state) {

        var text = rows.token ? "已申请" : "未申请";
        var color = rows.token ? "#3EB65E" : "#ff0000";// 红色, 绿色
        return '<span style=\"color:'+ color +'\" >'+ text +'</span>';
    }

    //绑定刷新事件
    $("#commonRefreshBtn").click(function(){
        location.href = location;
    });

    //绑定新增事件
    $("#commonShowAddBtn").click(function(){
        operation = "add";
        changeEditForm(true);
        showCommonDetailWindow();
    });

    //表单保存操作           (新增和更新)
    $("#commonSaveBtn").click(function(){
        if(operation == "add"){
            addPublish();
        }else{
            updatePublish();
        }
    });

    //+号点击事件, 增加一行(事件委托)
    $("#commonDetailForm").on("click","#addLine",addLine);
    $("#commonDetailForm").on("click",".offLine",deleteLine);

    //点击申请,生成Token并回显   //点击取消申请,删除关联的Token
    $("#commonList").on("click",".applyToken",applyToken);
    $("#commonList").on("click",".cancelToken",cancelToken);

    //表单重置操作
    $("#commonResetBtn").click(function(){
        $("#commonDetailForm")[0].reset();
        $("#defaultPushType").prop("checked",true);//恢复默认: 选中post
        PlatformUI.validateForm("commonDetailForm");
    });

    // $("input[name='pushDataType']").on("click",selectPushDataType); //选择传输数据的类型
$("#select_pushDataType").on("change",selectPushDataType); //选择需要传输数据的类型
    // $("#pushFormData").on("click",selectPushDataType);
    // $("#pushJsonData").on("click",selectPushDataType);
    // $("#pushXmlData").on("click",selectPushDataType);


    //编辑时回显
    $("#commonShowEditBtn").click(function(){

        operation = "edit";
        changeEditForm(true);
        currentEditId = getSelectedId();		//这是一个全局变量
        if(currentEditId){
            PlatformUI.ajax({
                url: contextPath + "/publish/" + currentEditId,
                afterOperation: function(data, textStatus,jqXHR){
                    showCommonDetailWindow();
                    populateForm( data,"edit");
                    PlatformUI.validateForm("commonDetailForm");
                }
            });
        }
    });

    //查看时回显
    $("#commonViewBtn").click(function(){
        operation = "view";
        var id = getSelectedId();
        if(id){
            getPublish(id);
            // getToken(id);
        }
    });

    //批量删除事件
    $("#commonDelBtn").click(function(){
        var ids = publishList.jqGrid ('getGridParam', 'selarrrow');
        if(ids.length == 0){
            toastr.warning("请至少选择一条要删除的数据!");
            return;
        }
        //批量删除ajax
        $.messager.confirm('操作','请确认删除数据',function(r){
            if (r){
                PlatformUI.ajax({
                    url: contextPath + "/publish",
                    type: "post",
                    data: {_method:"delete",ids:ids},
                    afterOperation: function(){
                        PlatformUI.refreshGrid(publishList, {sortname:"createDate",sortorder:"desc"});
                    }
                });
            }
        });
    });

    //查看已订阅此数据的用户
    $("#alreadySubscribeDataUser").click(function () {
        var id = getSelectedId();
        if (id){
            showAlreadySubscribeDataUserWindow();
            populateShowUserForm(id);
        }
    });

});

//------------------------方法区-----------------------//


//弹出表单框体
function showCommonDetailWindow(){

    // 不展示Token
    if(operation != "view"){
        $("#tokenForm").hide();
    }

    // 重置Token表单
    $("#tokenForm")[0].reset();

    //表单重置, 把jQuery对象改成dom对象, reset()是dom的方法..
    $("#commonDetailForm")[0].reset();
    $("#commonDetailForm #id").val("");

    // 恢复默认请求方式
    $("#defaultPushType").prop("checked",true);

    //验证表单
    PlatformUI.validateForm("commonDetailForm");
    $('#commonDetail').show();
    $('#commonDetail').window({
        title:"发布订阅模式-数据提供方", modal:true, maximized: true,//面板最大化
    });

    destroyAndRecreate(); // remove动态创建的容器
}

//弹出表单框体__查看
function showCommonDetailWindow_View(data){

    if (data.token) {
        $(".noTokenTable").hide();
        $(".hasTokenTable").show();
        // $("#btn_copyAll").attr("currentId", getSelectedId());
    }else{
        $(".noTokenTable").show();
        $(".hasTokenTable").hide();
    }

    //重置Token表单和参数表单, 把jQuery对象改成dom对象, reset()是dom的方法..
    $("#tokenForm")[0].reset();
    $("#commonDetailForm")[0].reset();
    $("#commonDetailForm #id").val("");

    // 恢复默认请求方式
    $("#defaultPushType").prop("checked",true);

    //验证表单
    PlatformUI.validateForm("commonDetailForm");
    $("#tokenForm").show();
    $('#commonDetail').show();
    $('#commonDetail').window({
        title:"发布订阅模式-数据提供方", modal:true, maximized: true,//面板最大化
    });

    destroyAndRecreate(); // remove动态创建的容器
}


//弹出表单框体**************************************
function showAlreadySubscribeDataUserWindow(){
    $(".showUser").show();
    $(".showUser").window({
        title:"已订阅此数据的用户", modal:true, maximized: true,//面板最大化
    });
}

var populateShowUserForm  =function (id) {

    $(".userContainer").remove();// 移除上一个用户信息容器 // 构建一个专属容器
    var $dom = [
        "<div class='clear userContainer'> ",
        "<table id='showUserList'></table>",
        "<div id='showUserPager'></div>",
        "</div>"].join("");
    $(".showUser").append($dom);

    $("#showUserList").jqGrid({
        url: contextPath + "/publish/follower/" + id,
        datatype: "json",
        width:$(".data_grid").width(),
        height:document.body.clientHeight-185,
        mtype: "POST",
        multiselect: false,
        colNames: ["ID", "姓名","备注","上一次申请时间"],
        colModel: [
            { name: "id", index:"id",hidden: true},
            { name: "userName",sortable:false,align: "center"},
            { name: "nickName", index:"nickName", align:"center", sortable: false,formatter:nickNameFormat},
            { name: "createDate",width:200, index:"createDate",align:"center",formatter:createDateFormat }
        ],
        pager: "#showUserPager",
        rowNum: 10,
        rowList: [10, 20, 30],
        sortname:"createDate",
        sortorder:"desc",
        viewrecords: true,
        gridview: true,
        autoencode: true,
        caption: currentDataDescription()
    });

    function currentDataDescription(){
        var currentDataName = publishList.jqGrid("getCell",getSelectedId(),"name");
        var currentDataRemark = publishList.jqGrid("getCell",getSelectedId(),"remark");
        return "数据名称: " + currentDataName + "备注: " + currentDataRemark;
    }

    //优先显示昵称 , 如果昵称为空, 再显示userName
    function nickNameFormat (value, grid, rows, state) {
        return (rows.nickName == null) ? rows.userName : rows.nickName;
    }

    function createDateFormat (value, grid, rows, state) {
        if(!value) {
            return "获取失败";
        }
        return cusomFormatDate(value);
    }
}


// 获取所选行数据的ID
function getSelectedId() {
    var ids = publishList.jqGrid ('getGridParam', 'selarrrow');
    if(ids.length != 1){
        toastr.warning("选择一条要查看的数据!");
        return;
    }
    return ids[0];
}

// 查询回显此数已经生成的 token
function getToken(id) {
    PlatformUI.ajax({
        url: contextPath + "/usable/publish/getToken/" + id,
        afterOperation: function (data, textStatus, jqXHR) {
            populateToken(data);
        }
    });
}

// 还没有动态创建dom
function domIsNotCreated(dom) {
    return (dom.length == 0)? true : false;
}

function isAddFormData(str) {
    return (str == 'form') ? true : false;
}
function isAddJsonData(str) {
    return (str == 'json') ? true : false;
}
function isAddXmlData(str) {
    return (str == 'xml') ? true : false;
}

// 选择传输数据的类型
// form则展示form 表单,json,xml则展示textarea
function selectPushDataType(){

    // destroyAndRecreate();// 体验不好

    var pushDataType = $(this).val();
    var $formDataDom = $(".benchmark");
    var $jsonDataDom = $("#jsonDataTextbox");
    var $xmlDataDom = $("#xmlDataTextbox");

    if(isAddFormData(pushDataType)){

        if(domIsNotCreated($formDataDom)){
            customShowHide("form",2);
            return addFirstLine();//构建第一行(表单填充)
        }
        customShowHide("form",3);
    }
    else if(isAddJsonData(pushDataType)){

        if(domIsNotCreated($jsonDataDom)){
            customShowHide("json",2);
            return addJsonTextbox();//构建填充json的textarea
        }
        customShowHide("json",3);
    }
    else if(isAddXmlData(pushDataType)){

        if(domIsNotCreated($xmlDataDom)){
            customShowHide("xml",2);
            return addXmlTextbox();//构建填充xml的textarea
        }
        customShowHide("xml",3);
    }
}

// 方式一
// 点击'form-data' 'json-data' 'xml-data' 摧毁容器,再重建
// 如选择form-data并填写数据,切换到'json-data',再切回'form-data'时,填写的数据已丢失
function destroyAndRecreate () {

    // 清空所有的 ".benchmark",".customTextbox" , 再重新构建....
    $(".benchmark").remove();
    $(".customTextbox").remove();
}

// 方式二
// 点击'form-data' 'json-data' 'xml-data' 隐藏和显示
function customShowHide(str,num){

    var $formDataDom = $(".benchmark");
    var $jsonDataDom = $("#jsonDataSpan");
    var $xmlDataDom = $("#xmlDataSpan");

    switch (str) {
        case "form":
            (num == 2) ?
                ( $jsonDataDom.hide(),$xmlDataDom.hide() ):
                ( $formDataDom.show(),$jsonDataDom.hide(),$xmlDataDom.hide() );
            break;
        case "json":
            (num == 2) ?
                ( $formDataDom.hide(),$xmlDataDom.hide() ):
                ( $formDataDom.hide(),$jsonDataDom.show(),$xmlDataDom.hide() );
            break;
        case "xml":
            (num == 2) ?
                ( $formDataDom.hide(),$jsonDataDom.hide() ):
                ( $formDataDom.hide(),$jsonDataDom.hide(),$xmlDataDom.show() );
            break;
    }
}

// 保存添加数据时三个都有数据, 提示: 只能三选一传送
// 判断当前所选推送数据类型, 校验是否为空, 输入格式是否正确
function validate3Choose1 ( dataType, flag ) {
    switch (dataType) {
        case "form":
            return validateFormData(flag);
        case "json":
            return validateJsonData(flag);
        case "xml":
            return validateXmlData(flag);
    }
}

// 验证表单是否填写完整
var validate = function(dataType){

    var flag = true;
    flag = validateParamsHead(flag);

    return ( flag == true ) ? validate3Choose1(dataType,flag) : flag;
}

// 获取推送数据
function getPushData ( dataType ) {

    // 解释: 表单数据, 用于装json 或xml, 数据类型"json"或"xml"
    var formData,content,type;

    switch (dataType) {
        case "form":
            formData = getFormData();
            break;
        case "json":
            content = getJsonStr();
            type = "json";
            break;
        case "xml":
            content = getXmlData();
            type = "xml";
            break;
    }

    // jQuery取得select选中的值, 以何种方式提交请求 post put ...
    var currentPushType = $("#select_pushType option:selected").val();

    var publishVO = {
        "name":	$("#name").val().trim(),
        "remark": $("#remark").val().trim(),
        "pushType":	currentPushType,
        "paramList":formData,
        "content":content,
        "type":type
    };
    return publishVO;
}

// 新增,更新抽取: 获取数据并校验表单
var customBeforeSend = function () {

    // 获取传输数据的数据类型 form json xml ...
    var currentPushDataType = $("#select_pushDataType option:selected").val();

    if(currentPushDataType == "noChoice"){
        toastr.warning("请选择您要传输的数据");
        return;
    }

    var flag = validate(currentPushDataType);
    if(!flag){ return false; }

    var publishVO = getPushData(currentPushDataType);
    return publishVO;
}

// 新增,更新抽取: ajax请求结束的时候执行的函数
var customAjaxStop = function ( returnData ) {
    if(returnData.statusCode <= 200){
        toastr.success(returnData.statusText);

        $('#commonDetail').window('close');
        PlatformUI.refreshGrid(publishList, {sortname: "createDate", sortorder: "desc"});

        // location.href = location;
    }else if((returnData.statusCode >=400) && (returnData.statusCode <500) ){
        toastr.warning(returnData.statusText);
    }else if(returnData == "" || returnData.statusCode >= 500){
        toastr.error("服务器异常");
    }
}


//新增
var addPublish = function(){

    // publishVO : 校验不通过返回 false, 通过返回 填写的数据
    var publishVO = customBeforeSend();
    if(!publishVO){
        return;
    }

    $.ajax({
        type: "POST",
        url:contextPath + "/publish",
        data: JSON.stringify(publishVO),
        contentType:"application/json; charset=utf-8",
        success: function(returnData) {
            customAjaxStop (returnData);
        },
        error: function(xhr,status,error) {
            toastr.warning("创建失败, 请联系管理员");
        },
    })
}

//更新
var updatePublish = function(){

    var publishVO = customBeforeSend();
    if(!publishVO){
        return;
    }

    $.ajax({
        type: "PUT",
        url: contextPath + "/publish/" + currentEditId,
        data: JSON.stringify(publishVO),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(returnData) {
            customAjaxStop (returnData);
        },
        error: function(xhr,status,error) {
            toastr.warning("创建失败, 请联系管理员");
        },
    })

}

//查看
function getPublish(id){
    PlatformUI.ajax({
        url: contextPath + "/publish/" + id,
        afterOperation: function(data, textStatus,jqXHR){
            showCommonDetailWindow_View(data);
            populateForm( data,"view");
            changeEditForm(false); // input只读
            PlatformUI.validateForm("commonDetailForm");
        }
    });
}

//--------------------------------------------------------------------------------------form-data start

//构建第一行... 尾巴为+号
var addFirstLine = function (){
    barStr = "add";
    createTableDom( barStr );
}

//构建其他行, 尾巴为x号
var addLine = function (){
    barStr = "del";
    createTableDom( barStr );
}

//删除一行
var deleteLine = function(){
    var trDom = $(this).parent().parent().parent().parent();
    trDom.remove();
}


// 创建table DOM
function createTableDom( barStr ){

    var barAdd = '<th rowspan="2"><a id=\'addLine\' href=\'javascript:;\'  title=\'添加一行\'>✚</a></th>';
    var barDel = '<th rowspan="2"><a class=\'offLine\' href=\'javascript:;\'  title=\'删除此行\'>✖</a></th>';

    var domArr = [
        '<table  class = "t2 benchmark" >',
        '	<tr>',
        '		<th>参数名:</th>',
        '		<td><input class="required" type="text" placeholder="示例: user_id" /></td>',
        '		<th>示例值:</th>',
        '		<td><input class="required" type="text" placeholder="示例: 1313sdaf132" /></td>',
        // 在此动态添加操作符 '<th rowspan="2"><a id=\'addLine\' href=\'javascript:;\'  title=\'操作\'> 操作符: ✚  ✖ </a></th>',
        '	</tr>',
        '	<tr>',
        '		<th>参数类型:</th>',
        '		<td><input class="required" type="text" placeholder="示例: String" /></td>',
        '		<th>描述:</th>',
        '		<td><input class="required" type="text" placeholder="示例: 用户id" /></td>',
        '	</tr>',
        '</table>'
    ];

    // add : 添加 ✚;
    // del : 添加 ✖;
    // view : 不添加任何操作符, 并置空placeholder;
    // js方法 splice(), 删除0个元素, 并在索引6 的位置添加一个或多个元素, 注意:该方法会改变原始数组
    switch (barStr) {
        case "add":
            domArr.splice(6,0,barAdd); break;
        case "del":
            domArr.splice(6,0,barDel); break;
    }

    //js原生方法, 数组合并转字符串的方法
    //var str = arr.join( "-" );// str就等于了"1-2-3-4-5-6-7";即数组转换字符串并用-做分割；
    var trDom = domArr.join("");

    $("#table_new").append(trDom);

    if(barStr == "view"){
        $("#table_new").find(".required").prop("placeholder","");
    } else{
        $('.required').validatebox({required:true}); // 必填项
    }
}

// 获取参数数组
var getFormData = function (){

    var jsonArray = new Array();
    var len = $(".benchmark").length;

    for(var i = 0; i < len; i++) { 			//遍历数组
        //jquery对象加上脚标后, 又变成dom对象...
        var row ={
            "key"		: $( $( $(".benchmark")[i] ).find("input")[0] ).val().trim(),
            "value"		: $( $( $(".benchmark")[i] ).find("input")[1] ).val().trim(),
            "paramType"	: $( $( $(".benchmark")[i] ).find("input")[2] ).val().trim(),
            "describe"	: $( $( $(".benchmark")[i] ).find("input")[3] ).val().trim(),
        };
        jsonArray.push(row);
    }
    return jsonArray;
}

// 创建table DOM 并填充
// 如果是查看回显, 尾巴上不需要有 +号x号; 如果是编辑回显, 需要有;
var populateFormData = function ( type, formData, len ) {

    if(type == "edit"){
        for(var i = 0; i < len; i++) {
            i == 0 ? createTableDom("add") : createTableDom("del");
        }
    }
    else if(type == "view"){
        for(var i = 0; i < len; i++) {
            createTableDom("view");
        }
    }

    for(var i = 0; i < len; i++) {
        $( $( $(".benchmark")[i] ).find("input")[0] ).val(formData[i].key);
        $( $( $(".benchmark")[i] ).find("input")[1] ).val(formData[i].value);
        $( $( $(".benchmark")[i] ).find("input")[2] ).val(formData[i].paramType);
        $( $( $(".benchmark")[i] ).find("input")[3] ).val(formData[i].describe);
    }
}

//校验是否填写:推送方式, 数据名称, 备注
function validateParamsHead(flag) {
    var msg = "请填写完整";
    var allInput = $("#table .required");
    return doValidateFormData ( allInput, flag, msg );
}

function validateFormData (flag) {
    var msg = "请将表单填写完整";
    var allInput = $("#table_new .required");
    return doValidateFormData ( allInput, flag, msg );
}

function doValidateFormData ( arr, flag, msg ) {
    for(var i = 0; i < arr.length; i++) {
        var temp = $(arr[i]).val().trim();
        if((temp == null) || (temp == "") ){
            flag = false;
            break;
        }
    }
    if(!flag){
        toastr.warning(msg);
        return;
    }
    return flag;
}

//--------------------------------------------------------------------------------------form-data end

//--------------------------------------------------------------------------------------json-data start
//构建填充json的textarea
function addJsonTextbox(){

    var spanDomStr, $spanDom, $divDom, $jsonSample, jsonObjSample;

    spanDomStr = [
        '<span class="customTextbox" id="jsonDataSpan">',
            '<div>',
                '<a> >> 请在下方填写正确的JSON数据</a>',
                '<textarea class="dataTextbox" id="jsonDataTextbox" ></textarea>',
            '</div>',
            '<div>',
                '<a> >> 这是一个JSON数据示例</a>',
                '<textarea id="jsonSample" ></textarea>',
            '</div>',
        '</span>'
    ].join("");

    $spanDom = $(spanDomStr);
    $divDom = $spanDom.children("div");
    $jsonSample = $divDom.children("#jsonSample");

    // 缩进4个空格, 格式化填充到textarea, 作为示例, 禁用
    jsonObjSample = {"url":"https://baidu.com","name":"百度", "array":{"BaiduEntry":"百度词条","BaiduEncyclopedia":"百度百科"}};
    $jsonSample.text(JSON.stringify(jsonObjSample, null, 4)).attr("disabled",true);

    $("#json_textarea_new").append($spanDom[0].outerHTML);
}

// 获取json-data参数
var getJsonStr = function (){

    // JSON.parse() js方法解析一个JSON字符串; $.parseJSON() JQuery方法兼容性好
    // JSON.stringify() 方法将JavaScript值转换为JSON字符串

    var jsonData = $("#jsonDataTextbox").val();
    return JSON.stringify( $.parseJSON(jsonData) );
}

// 创建textarea DOM, 格式化jsonStr, 并填充
var populateJsonData = function ( jsonStr ) {

    addJsonTextbox();
    var
        $currentTextarea = $("#jsonDataTextbox").parent();
        $currentTextarea.siblings().remove(); //移除示例
        $currentTextarea.css("width","100%").children("a").text(" >> JSON数据展示");

    var jsonStr2JsonObj = $.parseJSON(jsonStr);
    var jsonStrFormat = JSON.stringify(jsonStr2JsonObj, null, 4);
    $("#jsonDataTextbox").text(jsonStrFormat);
}

// 校验
function validateJsonData (flag) {

    var content = $("#jsonDataTextbox").val();

    // 校验textarea是否为空
    if( content == "" ){
        toastr.warning("请填写JSON数据");
        return false;
    }

    // 校验字符串是否是JSON标准格式
    return isJsonFormat(content);
}

function isJsonFormat(str) {
    var flag = true;
    try {
        $.parseJSON(str);
    } catch (e) {
        toastr.warning("输入的JSON格式有误");
        flag = false;
        return flag;
    }
    return flag;
}

//--------------------------------------------------------------------------------------json-data end

//--------------------------------------------------------------------------------------xml-data start

//构建填充json的textarea
function addXmlTextbox(){
    var spanDomStr, $spanDom, $divDom, $xmlSample, xmlObjSample;

    spanDomStr = [
        '<span class="customTextbox" id="xmlDataSpan">',
            '<div>',
                '<a> >> 请在下方填写正确的XML数据</a>',
                '<textarea class="dataTextbox" id="xmlDataTextbox" ></textarea>',
            '</div>',
            '<div>',
                '<a> >> 这是一个XML数据示例</a>',
                '<textarea id="xmlSample" ></textarea>',
            '</div>',
        '</span>'
    ].join("");

    $spanDom = $(spanDomStr);
    $divDom = $spanDom.children("div");
    $xmlSample = $divDom.children("#xmlSample");

    // 缩进4个空格, 格式化填充到textarea, 作为示例, 禁用
    xmlObjSample = [
        '<?xml version=\'1.0\' encoding=\'UTF-8\'?> \n',
        '<note> \n',
        '   <to>Tove</to> \n',
        '   <from>Jani</from> \n',
        '   <heading>Reminder</heading> \n',
        '   <body>Don\'t forget me this weekend!</body> \n',
        '</note>'
    ].join("");

    $xmlSample.text(xmlObjSample).attr("disabled",true);

    $("#json_textarea_new").append($spanDom[0].outerHTML);
}

// 获取xml-data参数
var getXmlData = function (){
    var xmlData = $("#xmlDataTextbox").val();
    return xmlData;
}

var populateXmlData = function ( xmlData ) {

    addXmlTextbox();
    var
        $currentTextarea = $("#xmlDataTextbox").parent();
    $currentTextarea.siblings().remove(); //移除示例
    $currentTextarea.css("width","100%").children("a").text(" >> XML数据展示");
    $("#xmlDataTextbox").text(xmlData);
}

// 校验
function validateXmlData (flag) {
    return flag;
}

//--------------------------------------------------------------------------------------xml-data end

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


//填充参数
var populateForm = function(data,type){

    // 如果已经申请,生成token, 查询展示token;
    // 如果未申请,则此处 data.token = undefined

    if (data.token) {
        $("#tokenValue").text(data.token.token);
        $("#tokenCreateDate").text(cusomFormatDate(data.token.createDate) + " 申请");
        $("#tokenExpireDate").text(cusomFormatDate(data.token.expireDate) + " 过期");//token过期时间
        $("#requestURL").val(data.destinationUrl);
    }

    var table = $("#table");
    $("#name").val(data.name);
    $("#remark").val(data.remark);
    setSelectChecked( "select_pushType", data.pushType );

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

}


//填充token
var populateToken = function (data) {

    // 重置Token表单
    $("#tokenForm")[0].reset();

    // 如果已经申请,生成token, 查询展示token;
    // 如果未申请,则此处 data.token = undefined

    if (!data.token) {
        $(".noTokenTable").show();
        $(".hasTokenTable").hide();
        return;
    }
    $(".noTokenTable").hide();
    $(".hasTokenTable").show();
    // $("#btn_copyAll").attr("currentId", getSelectedId());

    $("#tokenValue").text(data.token);
    $("#tokenCreateDate").text(cusomFormatDate(data.token.createDate) + " 申请");
    $("#tokenExpireDate").text(cusomFormatDate(data.token.expireDate) + " 过期");//token过期时间
    // $("#requestURL").val(data.destinationUrl);
    // $("#requestURL").val("data.destinationUrl");
}


//实时数据-发布----申请
var applyToken = function () {
    var id = $(this).attr("currentId");
    PlatformUI.ajax({
        url: contextPath + "/publish/publish/applyToken",
        type: "post",
        data: {publishId:id},
        afterOperation: function(data, textStatus,jqXHR){
            // if(data.statusText == 'token 申请成功') setStateCellValue();
            PlatformUI.refreshGrid(publishList, {sortname: "createDate", sortorder: "desc"});
            // 什么一不做

        }
    });
}

//实时数据-发布----取消申请
var cancelToken = function () {
    var id = $(this).attr("currentId");
    PlatformUI.ajax({
        url: contextPath + "/publish/publish/cancelToken",
        type: "post",
        data: {publishId:id},
        afterOperation: function(data, textStatus,jqXHR){
            // console.isShowlog(data)
            $("#tokenValue").text("申请后自动生成"); // 恢复tokenValue提示
            PlatformUI.refreshGrid(publishList, {sortname: "createDate", sortorder: "desc"});
            // 什么一不做
        }
    });
}













//查看/编辑form切换函数
function changeEditForm(flag){
    if(flag){
        $("#commonDetailBtnKit").show();
    }else{
        $("#commonDetailBtnKit").hide();
    }
    $("#commonDetailForm input[name!='pushType']").each(function(){
        $(this).attr("readOnly", !flag);
    });
}


