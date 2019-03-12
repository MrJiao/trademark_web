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
        },
        batchDeleteAllItemDate:function (anNum,callback) {
            PlatformUI.ajax({
                url: contextPath + "/trademarkBean/all",
                type: "post",
                data: {_method:"delete",anNum:anNum},
                afterOperation:callback
            });
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
            var remark = $("#data_remark").val();
            var remark2 = $("#data_remark2").val();
            var remark3 = $("#data_remark3").val();

            upload('data_file', "/upload/upload_trademark_data",
                {
                    'remark': remark,
                    'remark2': remark2,
                    'remark3': remark3
                });
        });

        $("#upload_name").click(function () {
            var remark = $("#name_remark").val();
            var remark2 = $("#name_remark2").val();
            var remark3 = $("#name_remark3").val();

            upload('name_file',"/upload/upload_trademark_name",
                {'remark':remark,
                    'remark2':remark2,
                    'remark3':remark3
            });
        });

        $("#upload_ids").click(function () {
            var remark = $("#id_remark").val();
            var remark2 = $("#id_remark2").val();
            var remark3 = $("#id_remark3").val();

            upload('id_file',"/upload/upload_trademark_ids",
                {'remark':remark,
                    'remark2':remark2,
                    'remark3':remark3
            });
        });

        $("#deleteAllBtn").click(function () {
            var anNum = $("#inputAnnm").val();
            if(anNum==null || anNum==''){
                toastr.warning("输入期号");
                return;
            }
            M.batchDeleteAllItemDate(anNum,function (data) {
                toastr.success("删除成功");
            });
        });

    }

    return {
        init: function () {
            initListener();
        }
    }
})();

