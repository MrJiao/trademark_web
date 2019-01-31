
/**
 * 定义对象: 组织机构
 */
 
 DATAX.Organization = new function () {
	
	var self = this;	
	//**********************************************************************
	var zTreeObj;
	var zNodes = [];		// zTree 的数据属性
	var hasParent;			// 这个属性, 用来判断组织数据是否为空
	self.model = ( function () { 
		
		var userId;//调用用户关联组织机构时, 传递过来的值, 定义变量接收一下
		//**********************************************************************
		var currentId;
		var currentName;
		
		return {
				
			// 在Tree的参数配置
			setting : { 
				callback : { 
					//获取当前选中的节点的name属性或者id属性, 并自动赋值给页面上的更新输入框
					onClick : function (event, treeId, treeNode) {
						currentId = treeNode.id;
						currentName = treeNode.name;
						self.model.ableInput(); // 取消禁用
						
						$("#nameUpdate").val(currentName);
						$("#orgCodeUpdate").val(treeNode.orgCode);
						$("#pxNumUpdate").val(treeNode.pxNum);
						$("#remarkUpdate").val(treeNode.remark);
						//角色有可能为空
						if( (treeNode.roles == null) || (treeNode.roles.length ==0)){
							$("#roleUpdate").val("");
						}else{
							//有一个或者多个角色的时候,进行字符串拼接
							var len = treeNode.roles.length;
							var roleValue = "";
							for( var i=0 ; i<len ; i++ ){
								roleValue += (treeNode.roles[i].name+" ");
							}
							$("#roleUpdate").val(roleValue);
						}
						
						$(".add").hide();
						$(".update").show();
					}
				} 
			}, 
			
			
			//请求所有的组织结构*****************************************************
			defaultGrid : function () {
				$.ajax({
					type: "get",
					url: contextPath + "/organization/",
					dataType: "json",
					success: function(returnData) {
						hasParent = true; // 说明数据库中有组织结构了, 就不能再添加父节点
						zNodes[0] = returnData;
						
						zNodes[0].open = true; // 此节点设置展开属性
						zTreeObj = $.fn.zTree.init( $("#treeDemo"), self.model.setting, zNodes );//$.fn.abc是在$.fn命名空间下定义一个abc的方法，给jQuery对象添加方法。
					},
					error:function(){
						//console.isShowlog("空组织机构");
						hasParent= false;
					}
				});
			},
			
			// 自定义列表
			customGrid : function () {},
			
			//更新表单的class=updateInput的input的禁用与取消禁用******************************
			ableInput : function () {
				$(".updateInput").removeAttr("disabled");
			},
			
			disableInput : function () {
				$(".updateInput").attr("disabled",true);
			},
			
			//"确定新增组织机构" 按钮的单击事件***************************************************
			add : function(){
				
				var that = this; // Organization.Model {...}
				//组织机构还没有任何数据的时候 , 可以添加一个父节点(通过)
				if( hasParent){
					if((currentId ==null) ||(currentId =="")){
						toastr.warning('请先选中一个节点, 作为父节点');
						return ;
					}
				}
				//先获取输入框中的数据
				var name = $("#nameAdd").val().trim();
				var orgCode = $("#orgCodeAdd").val().trim();
				var pxNum = $("#pxNumAdd").val().trim();
				var remark = $("#remarkAdd").val().trim();
				
				if( isNaN(pxNum) || (pxNum<1) || (pxNum>100) ){
					toastr.warning('排序框中请输入1-100的数字');
					return ;
				}
				//console.isShowlog("页面输入内容为:"+name+"---"+orgCode+"---"+pxNum+"---"+remark);
				if(name=="" || orgCode=="" || pxNum==""){
					toastr.warning('页面内容请填写完整');
					return ;
				}
				//这里执行插入操作
				jQuery.ajax({
					type: "POST",
					url: contextPath + "/organization/",
					data: {
						"name": name,
						"orgCode": orgCode,
						"pxNum":pxNum ,
						"remark": remark,
						"parentOrgId": currentId
					},
					success: function(returnData) {
						if(returnData.statusCode <= 200){
							toastr.success(returnData.statusText);
							//新增完后, 清空新增表单并隐藏, 清空更新表单并显示, 还要禁用
							$(".add table :input").val("");
							hasParent = true;
							
							$(".updateInput").val("");
							self.model.disableInput();
							
							$(".add").hide();
							$(".update").show();
							currentId = "";
							self.model.reFresh();
						}else if((returnData.statusCode >=400) && (returnData.statusCode <500) ){
							toastr.warning(returnData.statusText);
						}else if(returnData.statusCode >= 500){
							toastr.error(returnData.statusText);
						}
					},
					error: function(xhr,status,error) {
						toastr.warning('保存失败, 请重试或者联系管理员');
					},
					traditional: true
				});
			},
			
			
			//新增子节点按钮的单击事件*******************************************************
			addChild : function(){
				if( hasParent){
					if((currentId ==null) ||(currentId =="")){
						toastr.warning('请先选中一个节点, 作为父节点');
						return ;
					}
				}
				$(".add").show();
				$(".update").hide();
				//把选中的父节点, 自动填入input中
                // $("#nameUpdate").val(" ");
                // $("#orgCodeUpdate").val(" ");
                // $("#pxNumUpdate").val(" ");
                // $("#remarkUpdate").val(" ");
				$("#parentOrgId").val(currentName);
			},
		
			
			//更新按钮的单击事件**************************************************
			commitUpdate : function(){
				
				var that = this; // Organization.Model {...}
				
				if((currentId ==null) ||(currentId =="") ){
					toastr.warning('请先选中你要更新的节点');
					return ;
				}
				//先获取输入框中的数据
				var name = $("#nameUpdate").val().trim();
				var orgCode = $("#orgCodeUpdate").val().trim();
				var pxNum = $("#pxNumUpdate").val().trim();
				var remark = $("#remarkUpdate").val().trim();
				
				if( isNaN(pxNum) || (pxNum<1) || (pxNum>100) ){
					toastr.warning('排序框中请输入1-100的数字');
					return ;
				}
				//console.isShowlog("页面输入内容为:"+name+"---"+orgCode+"---"+pxNum+"---"+remark);
				if(name=="" || orgCode=="" || pxNum==""){
					toastr.warning('页面内容请填写完整');
					return ;
				}
				
				var method = "PUT"
				//这里执行更新操作
				jQuery.ajax({
					type: "POST",
					url: contextPath + "/organization/"+currentId,
					data: {
						"_method":method,
						"name": name,
						"orgCode": orgCode,
						"pxNum":pxNum ,
						"remark": remark,
					},
					success: function(returnData) {
						if(returnData.statusCode <= 200){
							toastr.success(returnData.statusText);
							$(".update").show();
							self.model.disableInput();
							$(".updateInput").val("");
							$(".add").hide();
							
							currentId="";
							self.model.reFresh();
						}else if((returnData.statusCode >=400) && (returnData.statusCode <500) ){
							toastr.warning(returnData.statusText);
						}else if(returnData.statusCode >= 500){
							toastr.warning(returnData.statusText);
						}
					},
					error: function(xhr,status,error) {
						toastr.warning('更新失败, 请重试或者联系管理员');
					},
					traditional: true
				});
			},
			
			
			//删除按钮的单击事件**************************************************
			del : function(){
				
				var that = this; // Organization.Model {...}
				
				if(currentId ==null){
					toastr.warning('请先选中一个你要删除的节点');
					return ;
				}
				
				$.messager.confirm("操作提示", "确定要删除此节点？", function (data) {  
					if( data ) {
						//把表单中隐藏域的value设置成delete, 以支持restful
						var method = "delete";
						//这里执行删除操作
						jQuery.ajax({
							type: "POST",
							url: contextPath + "/organization/"+currentId,
							data: {
								"_method":method
							},
							success: function(returnData) {
								if(returnData.statusCode <= 200){
									toastr.success(returnData.statusText);
									//因为删除前需要先选中, 选中后更新表格中就有内容, 删除成功后需要清空,并禁用
									self.model.disableInput();
									$(".updateInput").val("");
									self.model.reFresh();
								}else if((returnData.statusCode >=400) && (returnData.statusCode <500) ){
									toastr.warning(returnData.statusText);
								}else if(returnData.statusCode >= 500){
									toastr.warning(returnData.statusText);
								}
							},
							error: function(xhr,status,error) {
								toastr.warning('删除失败, 请重试或者联系管理员');
							},
							traditional: true
						});
						//console.isShowlog("执行删除操作");
					}else{
						//console.isShowlog("没有执行删除操作");
					}
				});
			},
			
			
			//刷新按钮的单击事件*********************************************************
			//这种刷新, 是不会有提示了
			reFresh : function(){
 				location.href = location;
 			},
			
			//把请求所有数据的ajax封装成一个"刷新"的方法************************************
			//使用这个刷新, 是为了避免把前一个方法的提示消息掩盖了
//			reFresh : function () {
//				$.ajax({
//					type: "get",
//					url: contextPath + "/organization/",
//					dataType: "json",
//					success: function(returnData) {
//						zNodes[0]=returnData;
//						//此节点设置展开属性
//						zNodes[0].open = true;
//						zTreeObj = $.fn.zTree.init( $("#treeDemo"), self.model.setting, zNodes );
//					},
//					error:function(){
//						toastr.warning('出现异常');
//					}
//				});
//			},
			
			
			
			
		  /**
			*  当前页面, 按钮'新增角色'的操作逻辑( 即, 把选中的角色, 挂到组织机构下 )
			* 
			*  orgAddRole : 入口方法
			*  self.view.showRoleDetailWindow()
			*  getOrgTree : 加载"组织机构"的zTree, 这个Tree有checkbox选项
			*  roleModel.findRolesByOrgId( currentId ) : 展示角色列表
			*  addRoleToOrg  : 把选中的角色, 挂到组织机构下
			*/
			
			//"新增角色" 按钮的单击事件***************************************************
			orgAddRole : function(){
				if((currentId ==null) ||(currentId =="")){
						toastr.warning('请先选中一个节点');
						return false;
				}
				return currentId;
			},
			
			//把选中的角色, 挂到组织机构下************************************************
			addRoleToOrg : function( rolesList ){
				var roleIds = rolesList.jqGrid ('getGridParam', 'selarrrow');
				if( roleIds.length == 0 ) {
						roleIds=[""];
				}
				// console.isShowlog("选中的角色ids:"+roleIds);
				// console.isShowlog("当前机构id:"+currentId);
				jQuery.ajax({
					type: "POST",
					url: contextPath + "/organization/addRoles",
					data: {
						"orgId": currentId,
						"roleIds[]": roleIds,
					},
					success: function(returnData) {
						if(returnData.statusCode <= 200){
							toastr.success(returnData.statusText);
						}else if((returnData.statusCode >=400) && (returnData.statusCode <500) ){
							toastr.warning(returnData.statusText);
						}else if(returnData.statusCode >= 500){
							toastr.error(returnData.statusText);
						}
					},
					error: function(xhr,status,error) {
						toastr.warning('保存失败, 请重试或者联系管理员');
					},
					traditional: true  //防止深度序列化
				});
			},
		 
		 
			
			
			//加载"组织机构"的zTree*************************************************
			getOrgTree : function ( id ) {
				
				userId = id;
				
				var zTreeObj;
				var setting = {
					callback: {
						onClick: function (event, treeId, treeNode) {
											orgId = treeNode.id;
											orgName = treeNode.name;
										}
					},
					check: {
						enable: true,
						chkboxType :{ "Y" : "", "N" : "" }
					}
				};
				var zNodes =[] ;
				//获取全部的组织机构
				$.ajax({
					type: "get",
					url: contextPath + "/organization/user",
					dataType: "json",
					data:{
						"userId" : userId
					},
					success: function(returnData) {
						//console.isShowlog(returnData);
						zNodes[0]=returnData;
						//此节点设置展开属性
						zNodes[0].open = true;
						zTreeObj = $.fn.zTree.init($("#treeDemo"), setting, zNodes);
					},
					error:function(){
						toastr.warning('数据库中暂无"组织结构"的数据!');
					}
				});
				
			},
			
			//保存用户到选中的"组织机构"下**********************************************
			assignOrg : function () {
				
				//这里使用zTree的方法,使用标签的id获取树(直接传id, 不用#id),再拿到所有选中的组织的id
				var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
				var nodes = treeObj.getCheckedNodes(true);
				
				//如果一个组织也不勾选, 也让通过, 这样就把用户之前关联的机构, 全部取消
				//此数组用来保存被勾选的机构id
				
				var nameList = "";
				var orgIdArray=[];
				
				for(var i = 0; i < nodes.length; i++ ){
					nameList +=( nodes[i].name+"  ");//选中的组织name 
					orgIdArray.push( nodes[i].id );//选中的组织id
				}
				
				//console.isShowlog("组织的id数组:"+orgIdArray);
				if((orgIdArray==null) || (orgIdArray.length ==0) ){
					orgIdArray =[""];
				}
				
				$.ajax({
					type: "POST",
					url: contextPath + "/organization/user",
					data: {
						"_method":"PUT",
						"userId": userId,
						"ids[]": orgIdArray,
					},
					success: function(returnData) {
						var c = returnData.statusCode;
						var t = returnData.statusText;
						if( c <= 200 ){
							toastr.success( t );
						}else if( c >=400 && c <500 ){
							toastr.warning( t );
						}else if( c >= 500 ){
							toastr.warning( t );
						}
					},
					error:function(){
						toastr.warning('出现异常, 请联系管理员');
					}
				});
			},
		
		}
		
	})(),
	
	self.view = ( function () { 
	
		return {
			
			render : function (model) {
				model.defaultGrid();
			},
			
			init : function () {
				var p = DATAX.namespace("DATAX.Organization.presenter");       // 使用对应的模块先引用				
				p.defaultInit();
				
				$("#organizationDel").click( p.organizationDel );			   // 删除按钮的单击事件
				$("#organizationRefresh").click( p.organizationRefresh );      // 刷新按钮的单击事件 //这种刷新, 是不会有提示了
				
				$("#organizationAddChild").click( p.organizationAddChild );    // 新增子节点按钮的单击事件
				$("#organizationAdd").click( p.organizationAdd );			   // "确定新增组织机构" 按钮的单击事件
				
				$("#commitUpdate").click( p.commitUpdate );		// 更新按钮的单击事件
				
				
				$("#orgAddRole").click( p.orgAddRole );			// "新增角色" 按钮的单击事件
				$("#addRoleToOrg").click( p.addRoleToOrg );		// 把选中的角色, 挂到组织机构下
			},
			
			//弹出用来"展示角色"的框子*************************************************
			showRoleDetailWindow : function () {
				$('#roleDetail').show();
				$('#roleDetail').window( { title : "角色列表(已拥有的角色为选中状态)", width : 800, height : 500, modal : true } );
			}
			
			//尝试TODO 字面量方式,处理页面
			// showRoleDetailWindow : {
// 				show : $('#roleDetail').show(),
// 				close : $('#roleDetail').window('close'),
// 				reset : 举例 $("#commonDetailForm")[0].reset(),
// 				createWindow : $('#roleDetail').window( { title : "角色列表(已拥有的角色为选中状态)", width : 800, height : 500, modal : true } )
			// }
				
		}
		
	})(),
	
	self.presenter = ( function () { 
		
		return {
			
			defaultInit : function () { //初始化用户信息表格
				self.view.render(self.model); 
			},
			
			organizationDel : function(){
				self.model.del(); // 删除按钮的单击事件
			},
			
			organizationRefresh : function(){
				location.href = location; // 刷新按钮的单击事件 //这种刷新, 是不会有提示了
			},
			
			organizationAddChild : function(){
				self.model.addChild(); // 新增子节点按钮的单击事件
			},
			
			organizationAdd : function(){
				self.model.add(); // "确定新增组织机构" 按钮的单击事件
			},
			
			commitUpdate : function(){
				self.model.commitUpdate(); // 更新按钮的单击事件
			},
			
			
			
			
			// "新增角色" 按钮的单击事件*********************************************************************************************
			orgAddRole : function(){
				var roleModel = DATAX.Role.model;	// 获取角色对象的model
				var orgId = self.model.orgAddRole(); //"新增角色" 按钮的单击事件, 组织机构关联角色, 方法返回当前所选组织机构的id
				if (orgId == false) {
						return false; // 仅支持同时为一个组织结构配置角色信息, 错误操作, 给出提示, 结束程序
				} else {
						roleModel.reloadFindRolesByOrgId( orgId ); // 每次点击, 都重新请求jqGrid
						self.view.showRoleDetailWindow(); // 弹窗
						roleModel.findRolesByOrgId( orgId ); // 展示角色列表
				}
			},
			
			addRoleToOrg : function(){
				var rolesList = DATAX.Role.model.getFindRolesByOrgIdList();
				self.model.addRoleToOrg( rolesList ); // 把选中的角色, 挂到组织机构下
				$('#roleDetail').window('close');
				organizationRefresh();
			},
			
			
		}
		
	})()
	
}	