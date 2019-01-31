var menuTree;
var count =0;
var Firstlogin=false;
var isSubmit = true;
jQuery(document).ready(function () {
	
	$("#logoutBtn").click(function(){
            location.href = contextPath + "/logout";        
      });
      //加载菜单
      initMenu();
      
      //加载待办信息
//	  $.ajax({
//			url: contextPath + "/yzProcess/getUnDoneList",
//			dataType: "json",
//			success: function(datas){
//				$(datas).each(function(){
//					var html = "<li  class='link'><a  href=\"javascript:openTab('" + this.id + "', '" + this.name + "',  '" + this.url + "')\">"
//									+ "<img src='"+contextPath+"/images/icon/" + this.iconName + "'/>"
//										+  this.name+
//									   "<span class='label label-primary'>" + this.unDoneCount + "</span></a></li>";
//					$("#contentS").append(html);
//				});
//			}
//		});

	  //加载通知信息 目前只有狱政可以加载
	  //通过轮询的方式进行请求后台 观察是否有新数据诞生，一旦有则高亮展示
//	    $(function () {
//        window.setInterval(function () {
//      	  //记录上一次的总数 如果总数发生改变则提示代表有新的数据产生则需要提示
//      	  $.ajax({
//			    url: contextPath + "/notificationMessage/getNotificationMessageList",
//				dataType: "json",
//				success: function(datas){
//				  count =datas.length;
//				  //获取上次的size
//				  var upCount = $.cookie("count");
//					 $("#two li").remove();
//				    for(var i in datas){
//				    	var  str ="";  
//				    	if(datas[i].processtitle=="外来人员申请"
//				    		||datas[i].processtitle=="外来车辆申请"){
//				    		str +=datas[i].zfname+",";
//				    	}else{
//				    		str +="罪犯:"+datas[i].zfname+",编号:"+datas[i].zfbh+",";
//				    	}
//				    	 str+= datas[i].processtitle+","+datas[i].fqrname+"已批复。<br>"+
//				    	 ExtendDate.getSmpFormatDateByLong(datas[i].createDate,false);
//				    	 var html = "<li><a href='#' >"+str+"<span class='label ts' onclick='tishi("+'"'+datas[i].id+'"'+")' >不再提示</span></a></li>";
//				    	 $("#two").append(html);
//				    	 //代表有新数据
//				    	 if(datas.length!=upCount){
//				    		$("#tongzhi").attr("class", "news");
//				    	 }else{
//				    		 $("#tongzhi").removeAttr("class");
//				    	 }
//				    	 
//				    	 
//				    }
//				}
//			});
//        }, 80000);
//  	  $("#yuzheng").click(function(){
//  		  $.ajax({
//			    url: contextPath + "/notificationMessage/getNotificationMessageList",
//				dataType: "json",
//				success: function(datas){
//				  count =datas.length;
//				  //获取上次的size
//				  var upCount = $.cookie("count");
//				 //存储本次的size
//				  var date = new Date();  
//				  date.setTime(date.getTime() + (1 * 60 * 60 * 1000)); //一个小时后的这个时候过期  
//	     	      $.cookie("count",count, { path: '/', expires: date });
//				}
//			});
//  	  });
//        
//    });

//        if(!Firstlogin){
//			  $.ajax({
//				    url: contextPath + "/notificationMessage/getNotificationMessageList",
//					dataType: "json",
//					success: function(datas){
//						 $("#two li").remove();
//					    for(var i in datas){
//					    	var  str ="";  
//					    	if(datas[i].processtitle=="外来人员申请"
//					    		||datas[i].processtitle=="外来车辆申请"){
//					    		str +=datas[i].zfname+",";
//					    	}else{
//					    		str +="罪犯:"+datas[i].zfname+",编号:"+datas[i].zfbh+",";
//					    	}
//					    	 str+= datas[i].processtitle+","+datas[i].fqrname+"已批复。<br>"+
//					    	 ExtendDate.getSmpFormatDateByLong(datas[i].createDate,false);
//					    	 var html = "<li><a href='#' >"+str+"<span class='label ts' onclick='tishi("+'"'+datas[i].id+'"'+")' >不再提示</span></a></li>";
//					    	 $("#two").append(html);
//					    }
//					}
//				});
//                }
        
        $("#setTitle").blur(function(){
        	if(isSubmit){
        		saveTitle(); 
        	}else{
        		isSubmit = true;
        	}
        	
        });
        $("#setTitle").keydown(function(event){
        	if(event.keyCode == 13){  
        		if(isSubmit){
        			isSubmit = false;
            		saveTitle();
            	}
            }
        });
        
});


function changeName(){
	var rel = / /gi;
	$('#setTitle').css('display', 'block');
	$('#title').css('display', 'none');
}

function saveTitle(){
	var v =$("#setTitle").val();
	if("" == v){
		$('#setTitle').css('display', 'none');
		$('#title').css('display', 'block');
    	return;
	}
	PlatformUI.ajax({
		url: contextPath+'/saveSysTitle',
		type:'post',
		data:{"title":v},
		afterOperation: function(data, textStatus,jqXHR){
			$('#title').val(v);
			$('#setTitle').css('display', 'none');
			$('#title').css('display', 'block');
			$('#title').html(v);
		}
	});
}

function tishi(id) {
	var  params = null;
	PlatformUI.ajax({
		url : contextPath + "/notificationMessage/" + id,
		type : "post",
		data : params + "&_method=put",
		afterOperation : function(data) {
			$.ajax({
				url : contextPath + "/notificationMessage/getNotificationMessageList",
				dataType : "json",
				success : function(datas) {
					$("#two li").remove();
					for (var i in datas) {
						var str = "罪犯:" + datas[i].zfname + ",编号:" + datas[i].id
								+ "," + datas[i].processtitle + "," + "已批复。<br>"
								+ ExtendDate.getSmpFormatDateByLong(datas[i].createDate, false);
						var html = "<li><a href='#' >" + str + "<span class='label ts' onclick='tishi("
								+ '"' + datas[i].id + '"' + ")' >不再提示</span></a></li>";
						$("#two").append(html);
					}
				}
			});
		}
	});

}
var status = 1;
function switchSysBar(){
      var switchPoint=document.getElementById("switchPoint");
      var frmTitle=document.getElementById("frmTitle");
     if (1 == window.status){
              window.status = 0;
          switchPoint.style.backgroundImage = 'url(images/icon_up.png)';
          frmTitle.style.display="none"   
              var mainRight = document.getElementById("mainRright");
              mainRight.style.marginLeft = "0";
     }
     else{
              window.status = 1;
          switchPoint.style.backgroundImage = 'url(images/icon_hidden.png)'; 
          frmTitle.style.display=""
               var mainRight = document.getElementById("mainRright");
              mainRight.style.marginLeft = "260px";
     }
}

function urlJump (url){
      window.open(url)
}





//初始化菜单
function initMenu(){
	
//	PlatformUI.ajax({
//		url: contextPath+'/getSysTitle',
//		type:'post',
//		dataType : "json",
//		afterOperation: function(data){
//			$('#title').html(data.title);
//		}
//	});
	
	PlatformUI.ajax({
            url: "loadMenu",
            afterOperation: function(data, textStatus,jqXHR){
            	dataFilter(data);
                  $("#menuContainer").empty();
                  var treeData = buildTreeData(data)[0];
                  menuTree = buildTreeData(data)[1];
                  recursiveRenderTree("menuContainer", treeData);
                  bindMenuEvent();
                  buildMenuSearchData(data);
            }
      });
}

//构造treeData
function buildTreeData(data){
      var treeData = [];
      $(data).each(function(){
            var nodeData = {};
            nodeData.id = this.id;
            nodeData.name = this.menuName;
            nodeData.url = this.menuValue;
            nodeData.icon = this.icon;
            nodeData.menuType=this.menuType;
            if(this.parent){
                  nodeData.pId = this.parent.id;
            }else{
                  nodeData.pId = null;
            }
            treeData.push(nodeData);
      });
      var utilZtree = buildUtilZtree(treeData);
      return [formatEasyUITreeData(treeData), utilZtree];
}

//递归渲染树
function recursiveRenderTree(eId, treeData){
	if(eId != "menuContainer"){
        $("#" + eId).append("<ul class='submenu'></ul>");
    }
    var i = 0;
    $(treeData).each(function(){
    	var menuHtmlTemplate = "";
    	if(treeData[i].pId == null){
    		menuHtmlTemplate = "<li id='#{id}' class='list_1'><a href='javascript:void(0);' class='sp_list'><i "
            + " class='#{icon}'></i>#{name}</a></li>";
    	}
    	if(treeData[i].pId != null && treeData[i].children != null && treeData[i].children.length > 0){
    		menuHtmlTemplate = "<li id='#{id}' ><a href='javascript:void(0);' class='sp_active'><i "
                + " class='icon_folder-alt'></i>#{name}</a></li>";
    	}
    	if(treeData[i].pId != null && (treeData[i].children == null || treeData[i].children.length == 0)){
    		menuHtmlTemplate = "<li id='#{id}'><a href='javascript:void(0);' class='sp_active'><i "
                + " class='icon_document_alt'></i>#{name}</a></li>";
    	}
        menuHtmlTemplate = menuHtmlTemplate.replace(/#{id}/g, this.id).replace(/#{icon}/g, this.icon).replace(/#{name}/g, this.name);
        if(eId == "menuContainer"){
            $("#" + eId).append(menuHtmlTemplate);
        }else{
            $("#" + eId + " > ul").append(menuHtmlTemplate);
        }
        if(this.children){
            if(this.children.length != 0){
                recursiveRenderTree(this.id, this.children);
            }
        }
        i++;
    });
}

//绑定菜单事件
function bindMenuEvent(){
	
      $("#jquery-accordion-menu").jqueryAccordionMenu();
      $("#menuContainer li").click(function(){
            $("#menuContainer li").removeClass("active");
            $(this).addClass("active");
            //iframe跳转
            var node = menuTree.getNodeByParam("id", this.id);
            if(node.url != null && node.url != ""){
            	addNab(node);
            }
      })
}

//绑定菜单搜索数据
function buildMenuSearchData(data){
      var searchData = [];
      $(data).each(function(){
            if(this.menuValue !="" ){
                  searchData.push({label:this.menuName,value:this.id})
            }
      });
      $('#menuSearchInput').combobox({
          data: searchData,
          valueField:'value',
          textField:'label',
          filter: function(q, row){  
              var opts = $(this).combobox('options');  
              return __pinyin.getFirstLetter(row[opts.textField]).indexOf(q.toLowerCase()) != -1||row[opts.textField].indexOf(q)!=-1
             // return row[opts.textField].indexOf(q) >= 0;//这里改成>=即可在任意地方匹配  
          },
          onSelect: function(record){
            var node = menuTree.getNodeByParam("id", record.value);
            if(node.url != null && node.url != ""){
                     addNab(node);
                 }
          }
      });
}
function openTab(name, url){
	var json={"name":name,"url":url};
	addNab(json);
}
function trim(str){
	if(str)return str.trim();
	return str;
}
function addNab(node){
	var title=trim(node.name);
	var url = node.url;
	
      $("#content div").css("display","none");
      var es = document.getElementById("nab").getElementsByTagName("li");
      var ishave = false;
      var targetEle;
      for(var i=0;i<es.length;i++){
            //判断是否已存在需要的标签
            if(title == es[i].innerText){
                  ishave = true;
                  targetEle = es[i];
            }else{
                  es[i].className = "";//设置所有tab为默认样式
            }
      }
      //如果已经存在目标标签
      if(ishave&&targetEle){
            targetEle.click();
            return false;
      }
      //限制标签栏最多5个（首页除外）
      if($("#nab li").length == 6){
            $("#nab li:eq(1)").remove();
            $("#content div:eq(1)").remove();
      }
//      if($("#content div").length == 5){
//          $("#div_note div:eq(1)").remove();
//      }
      //添加标签栏
      var nab = $("<li>"+title+"</li>");
      var closeImg = $("<span class='img_close'></span>");
      nab.append(closeImg);
      $("#nab").append(nab);
      nab.attr("class","act");
      //添加功能内容区域
      var divWarp =  $("<div></div>");
      var frame = $("<iframe  src='' width='100%' frameborder='0' name='page' ></iframe>");
      $("#content").append(divWarp);
      divWarp.append(frame);
      
      frame.attr("src", node.url );
      //设定iframe自适应
      $(window).resize(
            function() {
                  frame.height(document.body.clientHeight - 120);
            }
      );
      frame.height(document.body.clientHeight - 120);
      //添加标签栏点击事件
      nab.on("click",function(){
            ad(this,divWarp);
      });
      closeImg.on("click",function(){
            closeNab(this.parentElement,divWarp);
      });
}
function closeNab(nab,divFrame){
      var targetClassName = nab.className;
      //移除需要关闭的标签页
      $(nab).remove();
      divFrame.remove();
      
      //如果关闭的是当前查看的标签页
      if(targetClassName == "act"){
            //打开标签页的最后一个
            $("#nab li:last").click();
      }
}

/**
 * 标签栏切换
 * @param ele 点击事件元素本身
 * @param divEle 功能内容外部DIV（乃jquery对象）
 */
function ad(ele,divEle){
    var es = document.getElementById("nab").getElementsByTagName("li");
    for(var i=0;i<es.length;i++){
        es[i].className = "";//设置所有tab为默认样式
    }
    ele.className = "act";//激活当前点击tab
    $("#content div").css("display","none");
    //如果点击的 首页
    if(divEle == null){
        $("#content div:eq(0),#content div:eq(0) div").css("display","block");
        //显示提示消息div_note
        //$("#div_note,#div_note div").show();
    }else{
        divEle.css("display","block");
    }
}

function dataFilter(datas){
	if(!datas)return;
	for(var i=0;i<datas.length;i++){
		var data = datas[i];
		if(!data.menuName){
			data.menuName = "";
		}else{
			data.menuName = data.menuName.trim();
		}
		if(!data.menuValue){
			data.menuValue = "";
		}else{
			data.menuValue = data.menuValue.trim();
		}
	}
}
