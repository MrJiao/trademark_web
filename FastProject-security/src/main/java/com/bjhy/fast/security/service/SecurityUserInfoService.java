package com.bjhy.fast.security.service;


import com.bjhy.fast.security.domain.SystemMenu;
import com.bjhy.fast.security.domain.UserInfo;
import com.bjhy.fast.security.exception.RegisterException;
import com.bjhy.fast.security.exception.UserExitException;
import org.apel.gaia.commons.pager.PageBean;
import org.apel.gaia.infrastructure.BizCommonService;

import java.util.List;

/**
 * Create by: Jackson
 */
public interface SecurityUserInfoService extends BizCommonService<UserInfo,String> {

    void register(UserInfo userInfo) throws UserExitException, RegisterException;

    List<SystemMenu> loadFunctionMenu();

    UserInfo loadUser();

    //目前只排除了自己
    void pageQueryExcludeAdmin(PageBean pageBean);

    void updateUserEncodePwd(UserInfo userInfo);

    void updateEncodePwd(String password);

    void updateNickName(String nickname);
}
