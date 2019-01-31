package com.bjhy.fast.security.web.security;

import com.bjhy.tlevel.datax.common.utils.L;


import com.bjhy.fast.security.domain.SystemMenu;
import com.bjhy.fast.security.domain.UserInfo;
import com.bjhy.fast.security.service.SecurityUserInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;


/**
 * Create by: Jackson
 */

@Controller
@RequestMapping("/")
public class IndexController {

    @Value("${index_scaffold:defaultIndexScaffold}")
    private String indexScaffold;

    @Value("${index_title:工程脚手架标题}")
    private String indexTitle;

    @Value("${index_name:工程脚手架}")
    private String indexName;

    //	@Autowired
////	@Qualifier(value="defaultIndexScaffold")
//	@Qualifier("${index_scaffold}")
//	private IndexScaffold indexScaffold;
    @Autowired
    SecurityUserInfoService securityUserInfoService;


    @RequestMapping(method = RequestMethod.GET)
    public String index(Model model) {
        model.addAttribute("indexTitle", indexTitle);
        model.addAttribute("indexName", indexName);
        UserInfo userInfo = securityUserInfoService.loadUser();
        model.addAttribute("username", userInfo.getUsername());

        String nickName = userInfo.getNickName();
        if ((nickName == null) || (nickName == "")) {
            nickName = userInfo.getUsername();
        }
        model.addAttribute("nickName", nickName);

        return "/home/index";
    }



    @RequestMapping(value = "home", method = RequestMethod.GET)
    public String home() throws Exception {
        return "/home/home_index";
    }


    @RequestMapping(value = "loadMenu", method = RequestMethod.GET)
    public @ResponseBody
    List<SystemMenu> loadFunctionMenu() {
        L.i("aaaaa");
        return securityUserInfoService.loadFunctionMenu();
    }
}
