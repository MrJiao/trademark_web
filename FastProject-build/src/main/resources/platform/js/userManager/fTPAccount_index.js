/**
 * 定义对象: Ftp账户
 */

DATAX.FTPAccount = new function () {

        var self = this;
		var pageRowNum = 10;
		var pageRowList = [10,20,30];

        self.model = (function () {
			
			//定义初始化值
			var fTPAccountList;
			var operation, currentEditId;

			return {

				defaultGrid: function () {

					fTPAccountList = $("#commonList").jqGrid({
						url: contextPath + "/fTPAccount",
						datatype: "json",
						autowidth: true,
                        height:document.body.clientHeight-230,
						mtype: "GET",
						multiselect: true,
						// colNames: ["ID", "ftp服务器IP", "ftp服务器端口", "用户名", "密码", "昵称", "创建时间"],
						colNames: ["ID", "ftp服务器IP", "ftp服务器端口", "用户名", "昵称", "创建时间"],
						colModel: [{name: "id",index: "id",hidden: true},
							{name: "ip",index: "ip",align: "center",sortable: true},
							{name: "port",index: "port",align: "center",sortable: true},
							{name: "username",index: "username",align: "center",sortable: true},
							// {name: "password",index: "password",align: "center",sortable: true},
							{name: "nickName",index: "nickName",align: "center",sortable: true},

							{name: "createDate",width: 200,index: "createDate",align: "center",searchoptions: {dataInit: PlatformUI.defaultJqueryUIDatePick},sortable: true,formatter: "date",formatoptions: {srcformat: "U",newformat: "Y-m-d H:i:s"}}
						],
						pager: "#commonPager",
                        rowNum: pageRowNum,
                        rowList: pageRowList,
						sortname: "createDate",
						sortorder: "desc",
						viewrecords: true,
						gridview: true,
						autoencode: true,
						caption: "FTP账号管理列表"
					});
				},

				// 自定义表格
				// 展示系统所有ftp //点击左栏"为用户配置文件"后, 弹出所有FTP列表
				customGrid: function (captionUserName,userOrRole) {

                    $(".container").remove();//移除上一个用户的FTP容器
                    $(".allFtpContainer").remove();//移除上一个用户的FTP容器
                    $(".fileContainer").remove();//还要移除用户的FTP下的文件夹容器

                    //构建一个属于当前用户的专属容器
                    $(".ftpPd").append("<div class='data_grid clear allFtpContainer'> <table id='allftplist'></table><div id='allftpPager'> </div>");

                    //构建一个属于当前用户的专属容器
					var text = '<a style="color: red">'+captionUserName+'</a>'
					var customCaption = "为"+userOrRole+": "+ text +" 配置文件传输权限";
						allftplist =  $("#allftplist").jqGrid({
							url: contextPath + "/fTPAccount",
							datatype: "json",
							// autowidth: true,
                            // width: 700,
                            width: $(".ftpPd").width()-30,
                            height:document.body.clientHeight-230,
							mtype: "GET",
							multiselect: false, //不显示checkbox
							colNames: ["ID","FTP账号","FTP别名","设置FTP为","操作","FTP详情"],
							colModel: [
								{ name: "id", index:"id",hidden: true},
								{ name: "username", index:"username", align:"center", sortable: true},
                                { name: "nickName", index:"nickName", align:"center", sortable: false},
                                { name: "typeConfig", index:"typeConfig", align:"center", sortable: false,width:180,
                                    formatter: function (value, grid, rows, state) {
                                	 var $dom = '<label>' +
													'<input type="radio"  value=\"'+ DATAX.FTP_TARGET_TYPE_FROM +'\" name=\"'+ rows.id +'\" checked="checked"/>'+
													'<a style="color: #47a8ea;">' + DATAX.FTP_FROM + '</a>' +
												'</label>'+
												'<a style="margin: 0px 8px 0px 8px;color:#e4e4e4">|</a>'+
												'<label>' +
													'<input type="radio"  value=\"'+ DATAX.FTP_TARGET_TYPE_TO +'\" name=\"'+ rows.id +'\" />'+
													'<a style="color: #47a8ea;">' + DATAX.FTP_TO + '</a>' +
												'</label>';
                                	 return $dom;
                                }},

								{ name: "configAuth", index: "configAuth",align:"center",sortable: false,title: false,width:100,
								  formatter: function (value, grid, rows, state) {
									 return '<a href="javascript:void(0)" style="color:#47a8ea" class="doConfigAuth" name=\"'+rows.id+'\" >去配置</a>'}},

                                { name: "ftpDetail", index: "ftpDetail",align:"center",sortable: false,title: false,width:100,
                                    formatter: function (value, grid, rows, state) {
                                        return '<a href="javascript:void(0)" style="color:#47a8ea" class="showFtpDetail" title="点击查看详情" name=\"'+rows.id+'\" >详情</a>'}}
							],
							pager: "#allftpPager",
                            rowNum: pageRowNum,
                            rowList: pageRowList,
							sortname:"id",
							sortorder:"desc",
							viewrecords: true,
							gridview: true,
							autoencode: true,
                            caption: customCaption
						});
				},
				
				getFtpId : function (){ // 弹窗查询展示所有ftp, checkbox勾选,获取用户配置的ftpId,构建容器,填充根据id查询的文件信息
					var ids = $("#allftplist").jqGrid('getGridParam', 'selarrrow');
					if( ids.length != 1) {
						toastr.warning("选择一个ftp!");
						return false;
					}
					ftpId = ids[0];
					ftpNickName = $("#allftplist").jqGrid("getCell",ftpId,"nickName");//获取当前用户名字, 用于展示到FTP栏中
					return ftpId;
				},

				getFtpTypeConfig : function (currentFtpId){ // 获取用户设置的FTP类型 (返回'FROM'或者'TO')
                    var ftpType = $("#allftplist input[type='radio'][name=\'"+currentFtpId+"\']:checked").val();
                    ftpType = ( ftpType == DATAX.FTP_TARGET_TYPE_FROM ) ? DATAX.FTP_FROM : DATAX.FTP_TO
					return  ftpType;
				},
				getFtpNickName : function (currentFtpId){ // 获取用户设置的FTP类型 (返回'FROM'或者'TO')
					return $("#allftplist").jqGrid("getCell",currentFtpId,"nickName");//获取当前用户名字, 用于展示到FTP栏中
				},

				//点击"详情"触发该方法, thisFont : "详情"
                //位置 : 文件传输权限设置页面, 添加配置, 弹窗里面的ftp详情

				ftpDetail : function ( thisFont, fromPageView ){

                    //获取详情选项的name属性,(name属性value为当前行rowId, 这里是: currentFtpId)
					var currentFtpId = thisFont.attr("name");
					PlatformUI.ajax({
						url: contextPath + "/fTPAccount/" + currentFtpId,
						afterOperation: function(data, textStatus,jqXHR){
                            fromPageView.showFtpDetailWindow(data);
						}
					});
				},

				add: function () {
					this.changeEditForm(true);
					operation = "add";
				},

				edit: function (view) {
					this.changeEditForm(true);
					var ids = fTPAccountList.jqGrid('getGridParam', 'selarrrow');
					if (ids.length != 1) {
						toastr.warning("选择一条要编辑的数据!");
						return;
					}

					currentEditId = ids[0];
					operation = "edit";

					PlatformUI.ajax({
						url: contextPath + "/fTPAccount/" + ids[0],
						afterOperation: function (data, textStatus, jqXHR) {
							view.showCommonDetailWindow(data);
							PlatformUI.populateForm("commonDetailForm", data);
							PlatformUI.validateForm("commonDetailForm");
						}
					});
				},

				save: function () {
					(operation == "add") ? (this.addFTPAccount()) : (this.updateFTPAccount());
				},

				reset: function () {
					$("#commonDetailForm")[0].reset();
					PlatformUI.validateForm("commonDetailForm");
				},

				del: function () {
					var ids = fTPAccountList.jqGrid('getGridParam', 'selarrrow');
					if (ids.length == 0) {
						toastr.warning("请至少选择一条要删除的数据!");
						return;
					}
					//批量删除ajax
					$.messager.confirm('操作', '请确认删除数据', function (r) {
						if (r) {
							PlatformUI.ajax({
								url: contextPath + "/fTPAccount",
								type: "post",
								data: {_method: "delete",ids: ids},
								afterOperation: function () {
                                    self.model.wrapRefresh();
								}
							});
						}
					});
				},

				//新增FTP账号
				addFTPAccount: function () {
					// var that = this;
					if (PlatformUI.formIsValid("commonDetailForm")) {
						//ajax保存
						var params = $("#commonDetailForm").serialize();
						PlatformUI.ajax({
							url: contextPath + "/fTPAccount",
							type: "post",
							data: params,
							afterOperation: function () {
								self.model.wrapRefresh();
								$("#commonDetailForm")[0].reset();
								$('#commonDetail').window('close');
							}
						});
					} else {
						toastr.warning("表单(新增)验证失败!");
					}
				},

				//更新FTP账号信息
				updateFTPAccount : function () {
					// var that = this;
					if (PlatformUI.formIsValid("commonDetailForm")) {
						//ajax更新
						var params = $("#commonDetailForm").serialize();
						PlatformUI.ajax({
							url: contextPath + "/fTPAccount/" + currentEditId,
							type: "post",
							data: params + "&_method=put",
							afterOperation: function () {
								PlatformUI.refreshGrid(fTPAccountList, {sortname: "createDate",sortorder: "desc",page: fTPAccountList.jqGrid("getGridParam").page});
								$("#commonDetailForm")[0].reset();
								$('#commonDetail').window('close');
							}
						});
					} else {
						toastr.warning("表单(更新)验证失败");
					}
				},

				//查看/编辑form切换函数
				changeEditForm: function (flag) {
					flag ? $("#commonDetailBtnKit").show() : $("#commonDetailBtnKit").hide()
					$("#commonDetailForm input").each(function () {
						$(this).attr("readOnly", !flag);
					});
				},

				// 包装平台提供的刷新表格, 适用于jqGrid表格
				wrapRefresh : function () {
					PlatformUI.refreshGrid( fTPAccountList, {sortname: "gmtCreate",sortorder: "desc"} );
				},
            }
        })(),

    self.view = (function () {
        return {
            render : function (model) {
                model.defaultGrid();
            },
            init : function () {
                var p = DATAX.namespace("DATAX.FTPAccount.presenter");  // 使用对应的模块先引用
                p.defaultInit();
				
                $("#FTPAccountAddBtn").click(p.commonAdd); 				// 绑定新增事件
                $("#FTPAccountEditBtn").click(p.commonUpdate); 			// 编辑按钮 的单击事件
                $("#FTPAccountSaveBtn").click(p.commonSaveBtn); 		// 表单保存操作
                $("#FTPAccountResetBtn").click(p.commonResetBtn); 		// 表单重置操作
                
                $("#FTPAccountDelBtn").click(p.commonDelete);           // 批量删除事件
                $("#FTPAccountRefreshBtn").click(p.commonRefreshBtn);   // 绑定刷新事件
            },

            //弹出表单框体(分为新增弹出/更新弹出)************************************************************
            showCommonDetailWindow : function (data) {
                $("#commonDetailForm")[0].reset();
                $("#commonDetailForm #id").val("");
                PlatformUI.validateForm("commonDetailForm"); // 验证表单
                $('#commonDetail').show();

                var _title = (data == null || undefined) ? ("新增FTP账号") : ("编辑FTP账号");
                $('#commonDetail').window({
                    // title: _title,width: 800,height: 400,modal: true
                    title: _title,width: 400,height: 400,modal: true
                });
                $('#commonDetail th').css("width","25%");
            },
        }

    })(),

    self.presenter = (function () {

        return {

            defaultInit: function () {
                self.view.render(self.model); //初始化角色信息表格
            },

            commonAdd: function () {
                self.model.add(); // 绑定刷新事件           
                self.view.showCommonDetailWindow();
            },

            commonUpdate: function () {
                self.model.edit(self.view); //编辑按钮 的单击事件
            },

            commonSaveBtn: function () {
                self.model.save(); //表单保存操作
            },

            commonResetBtn: function () {
                self.model.reset(); //表单重置操作
            },

            commonDelete: function () {
                self.model.del(); //批量删除事件
            },

            commonRefreshBtn: function () {
                location.href = location; //绑定刷新事件
            }
        }
    })()
};


//这里是easyUI扩展的表单验证器****************************************************************
$.extend($.fn.validatebox.defaults.rules, {
    port: {
        validator: function (value, param) {
            if (/^[1-9]\d*$/.test(value)) {
                return value >= 0 && value <= 65536
            } else {
                return false;
            }
        },
        message: '输入的数字在{1}到{65536}之间'
    },
    ip: { // 验证IP地址
        validator: function (value) {
            var reg = /^((1?\d?\d|(2([0-4]\d|5[0-5])))\.){3}(1?\d?\d|(2([0-4]\d|5[0-5])))$/;
            return reg.test(value);
        },
        message: 'IP地址格式不正确'
    },
});
