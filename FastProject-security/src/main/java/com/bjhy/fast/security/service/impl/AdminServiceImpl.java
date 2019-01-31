package com.bjhy.fast.security.service.impl;

import com.bjhy.fast.security.UserDetailsUtil;
import com.bjhy.fast.security.service.AdminService;
import com.bjhy.fast.security.service.SecurityUserInfoService;
import com.bjhy.fast.security.domain.UserInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


/**
 * Create by: Jackson
 */
@Service
@Transactional
public class AdminServiceImpl implements AdminService {


    @Autowired
    SecurityUserInfoService userInfoService;


    @Override
    public boolean isAdmin(String userId) {
        UserInfo userInfo = userInfoService.findById(userId);//TODO 这里可以改成直接通过dao层进行判断
        return UserDetailsUtil.isAdmin(userInfo);
    }

    


}
