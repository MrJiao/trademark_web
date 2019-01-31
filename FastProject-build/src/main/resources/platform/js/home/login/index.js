var menuTree;
jQuery(document).ready(function () {
	$("#logoutBtn").click(function(){
            location.href = contextPath + "/logout";        
      });
      //加载菜单
      initMenu();
      
});

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
	
	
      ajax({
            url: "loadMenu",
            afterOperation: function(data, textStatus,jqXHR){
            	
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
      $(treeData).each(function(){
            var menuHtmlTemplate = "<li id='#{id}' ><a href='javascript:void(0);'><i "
                  + " class='#{icon}'></i>#{name}</a></li>";
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
      });
}

//绑定菜单事件
function bindMenuEvent(){
	
      $("#jquery-accordion-menu").jqueryAccordionMenu();
      $("#menuContainer li").click(function(){
            $("#menuContainer li.active").removeClass("active")
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
          onSelect: function(record){
            var node = menuTree.getNodeByParam("id", record.value);
            if(node.url != null && node.url != ""){
                     addNab(node);
                 }
          }
      });
}

function addNab(node){
	
	var title=node.name;
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
      //添加标签栏
      var nab = $("<li>"+title+"</li>");
      var closeImg = $("<span class='img_close'></span>");
      nab.append(closeImg);
      $("#nab").append(nab);
      nab.attr("class","active");
      //添加功能内容区域
      var divWarp =  $("<div></div>");
      var frame = $("<iframe  src='' width='100%' height='100%'frameborder='0' name='page' ></iframe>");
      $("#content").append(divWarp);
      divWarp.append(frame);
      
      frame.attr("src", node.url );
      //设定iframe自适应
      $(window).resize(
            function() {
                  frame.height(document.body.clientHeight - 90);
            }
      );
      frame.height(document.body.clientHeight - 90);
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
      if(targetClassName == "active"){
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
      ele.className = "active";//激活当前点击tab
      $("#content div").css("display","none");
      //如果点击的 首页
      if(divEle == null){
            $("#content div:eq(0)").css("display","block");
            //显示提示消息div_note
            $("#div_note,#div_note div").show();
      }else{
            divEle.css("display","block");
      }
      
}
