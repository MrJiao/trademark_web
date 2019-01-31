/**
 * 定义对象: 角色信息
 */
DATAX.Role = new function () {

    var self = this;
    var rolesList;//定义初始化值
    var pageRowNum = 10;
    var pageRowList = [10,20,30];

    //匿名函数, 立即执行, 用self.model接收*************
    self.model = (function () {

		var operation, currentEditId;
		var leftRolesList, rightRolesList;

		var orgId; //组织机构页面,调用新增角色时, 传递过来的值, 定义变量接收一下
		var findRolesByOrgIdList; //组织机构页面,根据组织结构 id 查询展示角色列表
		
		//return返回一个匿名对象*******************
		return {
			defaultGrid: function () {
				//查找出全部角色*************************
				rolesList = $("#rolesList").jqGrid({
					url: contextPath + "/role",
					datatype: "json",
					autowidth: true,
                    height:document.body.clientHeight-230,
					mtype: "GET",
					multiselect: true,
					colNames: ["ID", "角色名称", "角色代码", "创建时间"],
					colModel: [{name: "id",index: "id",hidden: true},
						{name: "name",index: "name",align: "center",sortable: false},
						{name: "roleCode",index: "roleCode",align: "center",sortable: false},
						{name: "createDate",index: "createDate",align: "center",sortable: false,formatter: "date",formatoptions: {srcformat: "U",newformat: "Y-m-d H:i:s"},}
					],
					pager: "#rolesPager",
                    rowNum: pageRowNum,
                    rowList: pageRowList,
					sortname: "createDate",
					sortorder: "desc",
					viewrecords: true,
					gridview: true,
					autoencode: true,
					caption: "角色列表"
				});
			},

			// fileAuthority_forRole_index页面引用
			customGrid: function () {
               $("#rolesList").jqGrid({
                    url: contextPath + "/role",
                    datatype: "json",
                    autowidth: true,
                    height:document.body.clientHeight-230,
                    mtype: "GET",
                    multiselect: true,
                    colNames: ["ID", "角色名称", "角色代码"],
                    colModel: [{name: "id",index: "id",hidden: true},
                        {name: "name",index: "name",align: "center",sortable: false},
                        {name: "roleCode",index: "roleCode",align: "center",sortable: false}
                    ],
                    pager: "#rolesPager",
                    rowNum: pageRowNum,
                    rowList: pageRowList,
                    sortname: "id",
                    sortorder: "desc",
                    viewrecords: true,
                    gridview: true,
                    autoencode: true,
                    caption: "角色列表",
                    gridComplete: function () {
                       $("#rolesPager_left").hide();//隐藏这个td, fileAuthority页面的'用户列表'页脚即可显示完整
                    }
                });
			},

			add: function () {
				operation = "add";
			},

			edit: function (view) {
				var ids = rolesList.jqGrid('getGridParam', 'selarrrow');
				if (ids.length != 1) {
					toastr.warning("选择一条要编辑的数据!");
					return;
				}
				//这两个全局变量, 后面会用到
				currentEditId = ids[0];
				operation = "edit";

				PlatformUI.ajax({
					//通过id查找角色*****************
					url: contextPath + "/role/" + ids[0],
					afterOperation: function (data, textStatus, jqXHR) {
						view.showCommonDetailWindow(data);
						//回显数据
						PlatformUI.populateForm("commonDetailForm", data);
						//验证表单
						PlatformUI.validateForm("commonDetailForm");
					}
				});
			},

			save: function () {
				var that = this; //Role.Model{...}
				(operation == "add") ? (that.addRole()) : (that.updateRole());
			},

			reset: function () {
				$("#commonDetailForm")[0].reset();
				PlatformUI.validateForm("commonDetailForm");
			},

			del: function () {
				var that = this; //Role.Model{...}
				var ids = rolesList.jqGrid('getGridParam', 'selarrrow');
				if (ids.length == 0) {
					toastr.warning("请至少选择一条要删除的数据!");
					return;
				}
				//批量删除ajax
				$.messager.confirm('操作', '请确认删除数据', function (r) {
					if (r) {
						PlatformUI.ajax({
							url: contextPath + "/role",
							type: "post",
							data: {_method: "delete",ids: ids},
							afterOperation: function () {
								PlatformUI.refreshGrid(rolesList, {sortname: "gmtCreate",sortorder: "desc"});
							}
						});
					}
				});
			},

			//新增角色
			addRole: function () {
				var that = this; //Role.Model{...}
				if (PlatformUI.formIsValid("commonDetailForm")) { //验证
					var name = $("#name").val();
					var roleCode = $("#roleCode").val();
					$.ajax({
						type: "POST",
						url: contextPath + "/role",
						data: {"name": name,"roleCode": roleCode},
						success: function (returnData) {
							if (returnData.statusCode <= 200) {
								toastr.success(returnData.statusText);
							} else if ((returnData.statusCode >= 400) && (returnData.statusCode <
									500)) {
								toastr.warning(returnData.statusText);
							} else if (returnData.statusCode >= 500) {
								toastr.warning(returnData.statusText);
							}
							//刷新并关闭新增窗口
							PlatformUI.refreshGrid(rolesList, {sortname: "createDate",sortorder: "desc"});
							$("#commonDetailForm")[0].reset();
							$('#commonDetail').window('close');
						},
						error: function (returnData) {
							var code = returnData.responseJSON.statusCode;
							var text = returnData.responseJSON.statusText;
							if ((code >= 400) && (code < 500)) {
								toastr.warning(text);
							} else if (code >= 500) {
								toastr.error(text);
							}
						}
					});
				} else {
					toastr.warning("表单验证失败");
				}
			},

			//更新角色信息
			updateRole: function () {
				var that = this; //Role.Model{...}
				if (PlatformUI.formIsValid("commonDetailForm")) {
					//ajax更新
					var params = $("#commonDetailForm").serialize();
					// console.isShowlog("params:"+params);
					PlatformUI.ajax({
						url: contextPath + "/role/" + currentEditId,
						type: "post",
						data: params + "&_method=put",
						afterOperation: function () {
							PlatformUI.refreshGrid(rolesList, {sortname: "createDate",sortorder: "desc"});
							$("#commonDetailForm")[0].reset();
							$('#commonDetail').window('close');
						}
					});
				} else {
					toastr.warning("表单验证失败");
				}
			},

			//点击'查看' 按钮, 弹窗中隐藏 '保存' '重置' , 角色信息列表,暂时没有'查看按钮'
			changeEditForm: function (flag) {
				flag ? $("#commonDetailBtnKit").show() : $("#commonDetailBtnKit").hide()
				$("#commonDetailForm input").each(function () {
					$(this).attr("readOnly", !flag);
				});
			},

			//角色权限页面展示********************************************************************
			populateComplexForm: function ( userInfoList, $warpDom, id ) {
				var userId = id;
				var leftParams = {
                    "operation" : "unassign",//未分配
                    "gridId" : "leftRolesList",
                    "pageId" : "leftRolesPager",
                    "url" : contextPath + "/role/other",
                    "caption" : "可用角色列表------(单击关联)"
				};
				var rightParams = {
                    "operation" : "assign", //已分配
                    "gridId" : "rightRolesList",
                    "pageId" : "rightRolesPager",
                    "url" : contextPath + "/role/user",
                    "caption" : "已关联角色列表------(单击取关)"
				};

				leftRolesList = _commonGetRolesList(leftParams, userId);
				rightRolesList = _commonGetRolesList(rightParams, userId);

				function _commonGetRolesList(aParams, userId) {

					return $("#" + aParams.gridId).jqGrid({
						url: aParams.url,
						datatype: "json",
						postData: {'searchField': 'userId','searchString': userId,'searchOper': "eq"},
                        width:($warpDom.width()/2)-50,
                        // height:document.body.clientHeight-250,
                        height:300,
						mtype: "GET",
						multiselect: false,
						colNames: ["ID","角色名称","操作"],
						colModel: [
							{name: "id",index: "id",hidden: true},
							{name: "name",index: "name",align: "center",sortable: false},
                            {name: "operation",index: "operation",hidden: true,
                                formatter: function (value, grid, rows, state) {
                                    return aParams.operation;
                                }}
						],
						pager: "#" + aParams.pageId,
                        rowNum: pageRowNum,
                        rowList: pageRowList,
						sortname: "id",
						sortorder: "desc",
						viewrecords: true,
						gridview: true,
						autoencode: true,
						caption: aParams.caption,

                        //隐藏这个td,页脚即可显示完整
                        gridComplete: function () {
                            $("#" + aParams.pageId + "_left").hide();
                        },

                        // 单击操作, 角色关联 或 取消关联
                        onSelectRow: function (rowid) {
                            var operationUrl;
                            var roleIds = [rowid];
                            var rowData = $(this).getRowData(rowid);

                            if(rowData.operation == "unassign"){
                                operationUrl = contextPath + "/role/assignRole";
                            } else if(rowData.operation == "assign"){
                                operationUrl = contextPath + "/role/removeRole";
                            }
                            PlatformUI.ajax({
                                url: operationUrl,
                                type: "post",
                                data: { "userId" : userId, "roleIds" : roleIds },
                                afterOperation: function () {
                                    self.model.reloadRolesList(leftParams.gridId, leftParams.url, userId);
                                    self.model.reloadRolesList(rightParams.gridId, rightParams.url, userId);
                                    PlatformUI.refreshGrid(userInfoList,
                                        {sortname: "gmtCreate", sortorder: "desc", page: userInfoList.jqGrid("getGridParam").page});
                                }
                            });
                        },
					});
				}
			},

			//重新载入左右两边的角色列表
			reloadRolesList: function (gridId, url, userId) {
				$("#" + gridId).jqGrid('setGridParam', {
					url: url,
					datatype: 'json',
					postData: {'searchField': 'userId','searchString': userId,'searchOper': "eq"}
				}).trigger('reloadGrid'); //重新载入
			},

			//根据组织结构 id 查询展示角色列表 *************************************************************
			findRolesByOrgId : function ( id ) {
				
				orgId = id;
				
				//获取全部的角色列表,并且当前组织下已有的角色, 打上checked
				 $("#findRolesByOrgIdList").jqGrid({
					
					url: contextPath + "/role/findAllByOrg/" + orgId,
					datatype: "json",
					width: 750,
					mtype: "GET",
					multiselect: true,
					colNames: ["ID","角色名称","角色代码","已属于该组织"],
					colModel: [
							{ name: "id", index:"id",hidden: true},
							{ name: "name", index:"name", align:"center", sortable: false },
							{ name: "roleCode", index:"roleCode", align:"center", sortable: false },
							{ name: "belongToOrg", index:"belongToOrg", align:"center", sortable: false }
					],
					gridComplete: function() {
						
						var rowNum = $(this).jqGrid('getGridParam','records');//先判断有多少行数据(固定写法)
						var ids = $('#findRolesByOrgIdList').getDataIDs();//获取id数组(传入表格的id) 
						
						for( var i=0 ; i<rowNum ; i++ ){
							var rowData = $("#findRolesByOrgIdList").getRowData(ids[i]);//获取某一行的数据(传入表格的id,和某一行的id)
							if( rowData.belongToOrg == "true" ) {
								$("#findRolesByOrgIdList").jqGrid('setSelection',''+ids[i]+'');//通过id, 设置某一行被选中,
							}
						}
					},
					pager: "#findRolesByOrgIdPager",
				    rowNum: pageRowNum,
				    rowList: pageRowList,
					sortname:"id",
					sortorder:"desc",
					viewrecords: true,
					gridview: true,
					autoencode: true,
				});
			},
			
			//根据组织结构 id 查询展示角色列表 *****************************************************************
			reloadFindRolesByOrgId : function ( id ) {
				
				orgId = id;
				
			    findRolesByOrgIdList = $("#findRolesByOrgIdList").jqGrid('setGridParam',{
					url: contextPath + "/role/findAllByOrg/" + orgId,
					datatype : 'json'
				}).trigger('reloadGrid');
			},

			// 组织结构页面调用
			getFindRolesByOrgIdList: function () {
				return findRolesByOrgIdList;
			}

		}

	})(),

	self.view = (function () {

		return {
			render: function () {
                self.model.defaultGrid();
			},

			init: function () {

				var p = DATAX.namespace("DATAX.Role.presenter"); // 使用对应的模块先引用
				p.defaultInit();

				$("#roleAdd").click(p.commonAdd); 
				$("#roleSaveBtn").click(p.commonSaveBtn); 
				$("#roleResetBtn").click(p.commonResetBtn); 
				$("#roleUpdate").click(p.commonUpdate); 
				$("#roleDelete").click(p.commonDelete);
			},

			//弹出表单框体(分为新增弹出/更新弹出)************************************************************
			showCommonDetailWindow: function (data) {
				$("#commonDetailForm")[0].reset();
				$("#commonDetailForm #id").val("");
				//验证表单
				PlatformUI.validateForm("commonDetailForm");
				$('#commonDetail').show();

				var myTitle;
				(data == null || data == undefined) ?
				(myTitle = "添加", $("#addOrUpdate").html("新增角色")) : (myTitle = "修改", $("#addOrUpdate").html(
					"修改角色"));

				$('#commonDetail').window({
					title: myTitle,width: 300,height: 250,
					modal: true,
					collapsible: false,minimizable: false,maximizable: false,resizable: false /*禁用 :折叠 最小化 最大化 */
				});
			}
		}

	})(),

	self.presenter = (function () {

		return {

			defaultInit: function () {
				self.view.render(); //初始化角色信息表格
			},

			commonAdd: function () {
				self.model.add();          
				self.view.showCommonDetailWindow();
			},

			commonUpdate: function () {
				self.model.edit(self.view); 
			},

			commonSaveBtn: function () {
				self.model.save(); 
			},

			commonResetBtn: function () {
				self.model.reset(); 
			},

			commonDelete: function () {
				self.model.del(); 
			}
		}
	})()
};
