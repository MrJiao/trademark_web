/**
 * 定义对象: 文件管理
 */

DATAX.FileManager = new function () {

    var self = this;
	
	var fileManagerId = "fileManager";  // 最外层容器 id
	var filesPathId = "filesPath";	    // 地址栏容器 id
	var filesListId = "filesList";	    // 文件夹容器 id
	
	var wrap;       	// 外层包裹DOM节点 (选择性使用),例如传参jQuery对象: $("#userFtpFileConfigForm div.pd")
	var params;			// 参数params用来查询ftp下的文件夹 { "ftpId" : ftpId, "userId" : userId, "targetType" : targetType}
	var aCheckboxs = [];// 获取当前文件夹, 对应的checkbox

	var page; //在哪个页面引用	
	
    self.model = (function () {

            var currentPageCheckboxArray = []; //初始化空数组，用来存放checkbox对象。
			
            return {

                //获取checkbox数组
                getCheckboxArray: function () {
                    return checkboxArray;
                },

                // TODO其他文件类型的展示

                //获取所有checkbox
                getCurrentPageCheckbox: function () {
                    var inputs = document.getElementsByTagName("input"); //获取所有的input标签对象
                    for (var i = 0; i < inputs.length; i++) {
                        var obj = inputs[i];
                        if (obj.type == 'checkbox') {
                            currentPageCheckboxArray.push(obj);
                        }
                    }
                    return currentPageCheckboxArray;
                },
            }

        })(),

        self.view = (function () {
			
			//创建DOM节点------------------------------------------目前只用来创建外层div标签
			var createNode = function () { //可传参 父节点id, 当前需要创建的节点id; 也可以只添加当前需要创建的节点id
					var innerId;// var outerId, innerId;
					if (arguments.length == 1) {  //默认添加到body标签内
							
							innerId = arguments[0];
							var oDiv = document.createElement("div");
							oDiv.id = innerId;
							document.body.appendChild(oDiv);
							return oDiv;
					}
					else if ( arguments.length == 2 ) { // 向指定容器内添加节点 //向指定id 标签内添加节点(暂时未做)
					
							innerId = arguments[1]; //fileManager
							var oDiv = document.createElement("div");
							oDiv.id = innerId;
							if ( wrap.length > 0 ) { //如果传入的容器存在
								wrap.append(oDiv);
								return oDiv;
							}
							return false;
					}
			};
			
			var addChildNode = function () { // 追加子节点
					if (arguments.length == 0) { // 传入的实参个数为0
							return false;
					}
					for(var i = 1; i < arguments.length; i++) {
							var oDiv = document.createElement("div");
							oDiv.id = arguments[i];
							arguments[0].appendChild(oDiv);
					}
			};
				
			// 创建容器, 执行一次后, 赋值为空函数: onceCreate = function(){}*******************************
			var onceCreate = function () {
				var prentNode = (arguments.length == 1) ? createNode( wrap, fileManagerId ) : createNode( fileManagerId )
				prentNode != false ? 
				(addChildNode( prentNode, filesPathId, filesListId ), onceCreate = function(){}) : toastr.warning("创建失败, 传入参数有误!")
			};
			
            return {

                render: function () {
					arguments.length == 1 ? onceCreate(wrap) : onceCreate() //onceCreate(wrap)添加到指定容器; onceCreate()添加在body
				},
                customRender: function () {//非机构参数配置页面,需要两次初始化最外层容器
						onceCreate(wrap);
				},

                init: function () {

                    if (arguments.length == 3) {
                        wrap = arguments[0];
                        params = arguments[1];
						page = arguments[2]; 
						self.presenter.defaultInit();
                    }
					
                    DATAX.Folder.view.init(params, filesPathId, filesListId, page);
					self.presenter.addCheck();
                },
            }

        })(),

        self.presenter = (function () {
			
			return {
				
				addCheck : function () {
					if (wrap.attr("name") == undefined) {
						var inputType = "checkbox";
						DATAX.Check.view.init(inputType, filesListId);
						DATAX.Check.view.bindEvent(params, filesListId, page);//为添加的checkbox绑定事件
					}else{
						var inputType = "radio";
						var inputName = wrap.attr("name");
						DATAX.Check.view.init(inputType, inputName, filesListId);
					}
				},
				
				defaultInit : function () {
					self.view.render(wrap);
				},
				
				customInit : function () {
					self.view.customRender(wrap);
				},
				
			}
		})()

};
