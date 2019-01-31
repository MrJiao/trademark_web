package com.bjhy.fast.security.web;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * Create by: Jackson
 */
@Controller
@RequestMapping("/test")
public class MyController {

    @Autowired
    Temp temp;


    @RequestMapping(value="page1",method = RequestMethod.GET)
    public String home()throws Exception{
        temp.show();
        return "/test/page1";
    }
}
