package com.bjhy.fast.security.web.security;



import com.bjhy.fast.security.service.SecurityUserInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * Create by: Jackson
 */
@Controller
public class ValidateController {

    @Autowired
    SecurityUserInfoService securityUserInfoService;


    @RequestMapping(value = "/login/page",method = RequestMethod.GET)
    public String login() {
        return "login";
    }


    @RequestMapping(value = "/loginFailure",method = RequestMethod.GET)
    public String loginFailure() {
        return "loginFailure";
    }


    @RequestMapping(value = "/register/page",method = RequestMethod.GET)
    public String registerPage() {
        return "register";
    }

}
