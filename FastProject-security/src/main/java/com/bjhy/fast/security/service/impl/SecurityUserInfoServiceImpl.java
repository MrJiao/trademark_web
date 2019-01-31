package com.bjhy.fast.security.service.impl;


import com.bjhy.fast.security.UserDetailsUtil;
import com.bjhy.fast.security.config.Type;
import com.bjhy.fast.security.dao.SystemMenuRepository;
import com.bjhy.fast.security.dao.UserInfoRepository;
import com.bjhy.fast.security.domain.Role;
import com.bjhy.fast.security.domain.SystemMenu;
import com.bjhy.fast.security.domain.UserInfo;
import com.bjhy.fast.security.exception.RegisterException;
import com.bjhy.fast.security.exception.UserExitException;
import com.bjhy.fast.security.service.RoleService;
import com.bjhy.fast.security.service.SecurityUserInfoService;
import org.apache.commons.lang3.StringUtils;
import org.apel.gaia.commons.pager.PageBean;
import org.apel.gaia.infrastructure.impl.AbstractBizCommonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Create by: Jackson
 */
@Service
@Transactional
public class SecurityUserInfoServiceImpl extends AbstractBizCommonService<UserInfo, String> implements UserDetailsService, SecurityUserInfoService {

    @Autowired
    UserInfoRepository userInfoRepository;

    @Autowired
    SystemMenuRepository systemMenuRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    RoleService roleService;


    @Override
    public UserDetails loadUserByUsername(String s) throws UsernameNotFoundException {
        UserInfo user = userInfoRepository.findByUsername(s);
        if(user==null){
            throw new UsernameNotFoundException("用户不存在");
        }
        user.setFunctionMenus(getMenu(user.getRoleList()));
        //user.setFileAuthorityList(getFileAuthority(user)); 在登录后别人修改了自己的权限是无法做到实时更新
        return user;
    }


    @Override
    public void register(UserInfo userInfo) throws UserExitException, RegisterException {
        UserInfo user = userInfoRepository.findByUsername(userInfo.getUsername());
        if(user!=null){
            throw new UserExitException("账号已存在");
        }
        try {
            userInfo.setPassword(passwordEncoder.encode(userInfo.getPassword()));
            userInfo.setCreateDate(new Date());
            Role role = roleService.findByRoleCode(Type.NORMAL_ROLE_CODE);
            userInfo.getRoleList().add(role);
            save(userInfo);
        }catch (Exception e){
            throw new RegisterException("注册失败");
        }
    }

    @Override
    public List<SystemMenu> loadFunctionMenu() {
        return UserDetailsUtil.getCurrentUser().getFunctionMenus();
    }

    @Override
    public UserInfo loadUser() {
        return UserDetailsUtil.getCurrentUser();
    }
    //willdo 研究一下pageQuery这个方法,看上去很厉害...
    @Override
    public void pageQueryExcludeAdmin(PageBean pageBean) {
        pageQuery(pageBean);
        List items = pageBean.getItems();
        exclude(items);
    }

    @Override
    public void updateUserEncodePwd(UserInfo userInfo) {
        UserInfo user = findById(userInfo.getId());
        if(!StringUtils.isEmpty(userInfo.getPassword())){
            user.setPassword(passwordEncoder.encode(userInfo.getPassword()));
        }
        user.setNickName(userInfo.getNickName());
        save(user);
    }

    @Override
    public void updateEncodePwd(String password) {
        UserInfo currentUser = UserDetailsUtil.getCurrentUser();
        currentUser.setPassword(passwordEncoder.encode(password));
        save(currentUser);
    }

    @Override
    public void updateNickName(String nickname) {
        UserInfo currentUser = UserDetailsUtil.getCurrentUser();
        currentUser.setNickName(nickname);
        save(currentUser);
    }

    //排除自己和admin
    private void exclude(List<UserInfo> userInfoVoList) {
        String currentUserId = UserDetailsUtil.getCurrentUserId();
        ListIterator<UserInfo> iterator = userInfoVoList.listIterator();
        while (iterator.hasNext()) {
            UserInfo userInfoVo = iterator.next();
            //排除自己
            if(StringUtils.equals(userInfoVo.getId(),currentUserId)){
                iterator.remove();
            }
            //排除自己和admin
            /*if(StringUtils.equals(userInfoVo.getId(),currentUserId)||
                    StringUtils.equals(userInfoVo.getUsername(),"admin")){
                iterator.remove();
            }*/
        }
    }



    private ArrayList<SystemMenu> getMenu(List<Role> roleList){
        HashSet<SystemMenu> hsSystemMenu = new HashSet<>();
        for(Role r:roleList){
            List<SystemMenu> systemMenuList = systemMenuRepository.findByRoleId(r.getId());
            if(systemMenuList!=null){
                hsSystemMenu.addAll(systemMenuList);
            }
        }
        ArrayList<SystemMenu> arrSystemMenus = new ArrayList<>();
        arrSystemMenus.addAll(hsSystemMenu);
        arrSystemMenus.sort(new Comparator<SystemMenu>() {
            @Override
            public int compare(SystemMenu o1, SystemMenu o2) {
                Integer a = o1.getPxNum();
                Integer b = o2.getPxNum();
                if(a!=null && b!=null){
                    return a-b;
                }else if(a==null && b!=null){
                    return -1;
                }else if(a !=null && b==null){
                    return 1;
                }else {
                    return 0;
                }
            }
        });
        return arrSystemMenus;
    }









}
