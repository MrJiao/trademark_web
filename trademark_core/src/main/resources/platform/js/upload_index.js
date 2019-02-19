$.namespace("upload_index.P");
$.namespace("upload_index.M");
$.namespace("upload_index.V");
$(function () {
    upload_index.P.init();
});

upload_index.V = (function (){
    var uploadList;

    return{
        showWarning: function (msg) {
            toastr.warning(msg);
        }
    };
})();

upload_index.M = (function (){
    var V = upload_index.V;
    return{
        //获取选中的ids
        getJQSelectIds: function () {
            return V.getJqGrid().jqGrid('getGridParam', 'selarrrow');
        }
    };
})();

upload_index.P = (function (){
    var M = upload_index.M;
    var V = upload_index.V;
    function upload(id,url,param,successCallback) {
        var files = $('#'+id).prop('files');
        var data = new FormData();
        data.append('file', files[0]);

        if(param!=null){
            for(var s in param){
                data.append(s, param[s]);
            }
        }
        $.ajax({
            type: 'POST',
            url: contextPath + url,
            data: data,
            cache: false,
            async: false,
            processData: false,
            contentType: false,
            success:function(returnData){
                toastr.success(returnData.statusText);
            }
        });
    }




    function initListener() {
        //上传
        $("#upload_data").click(function () {
            upload('data_file',"/upload/upload_trademark_data");
        });

        $("#upload_name").click(function () {
            var annm = $("#annm").val();
            upload('name_file',"/upload/upload_trademark_name",{'annm':annm});
        });
    }

    return {
        init: function () {
            initListener();
        }
    }
})();

