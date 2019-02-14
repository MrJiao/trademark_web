package com.bjhy.fast.build.start.init.version;

import com.bjhy.fast.build.start.init.core.VersionInf;
import com.bjhy.fast.security.config.Type;
import com.bjhy.fast.security.dao.RoleRepository;
import com.bjhy.fast.security.dao.SystemMenuRepository;
import com.bjhy.fast.security.dao.UserInfoRepository;
import com.bjhy.fast.security.domain.Role;
import com.bjhy.fast.security.domain.SystemMenu;
import com.bjhy.fast.security.domain.UserInfo;
import com.bjhy.trademark.core.TrademarkConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Create by: Jackson
 */
@Component
public class Version1 implements VersionInf {

    @Override
    public int getVersion() {
        return 1;
    }

    @Override
    public void init() {
        new InitData().init();

    }





    @Override
    public boolean isEnable() {
        return true;
    }




    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    SystemMenuRepository systemMenuRepository;
    @Autowired
    RoleRepository roleRepository;
    @Autowired
    UserInfoRepository userInfoRepository;
    public class InitData{

        Logger logger = LoggerFactory.getLogger(getClass());

        List<SystemMenu> userMenu = new ArrayList<>();
        List<SystemMenu> adminMenu = new ArrayList<>();
        List<Role> roles;

        Role normalRole;
        Role adminRole;
        void init(){
            systemMenu();
            roles = role();
            userinfo("xuli");
        }

        private UserInfo userinfo(String username) {
            UserInfo userInfo = new UserInfo();
            userInfo.setUsername(username);
            userInfo.getRoleList().add(adminRole);
            userInfo.setPassword(passwordEncoder.encode("123"));
            userInfo.setCreateDate(new Date());
            userInfo.setInit(true);
            userInfoRepository.save(userInfo);
            return userInfo;
        }

        private List<Role> role() {
            List<Role> roles = new ArrayList<>();

            adminRole = new Role();
            adminRole.setName("admin");
            adminRole.setRoleCode(Type.ADMIN_ROLE_CODE);
            adminRole.setCreateDate(new Date());
            adminRole.getSystemMenuList().addAll(userMenu);
            adminRole.getSystemMenuList().addAll(adminMenu);
            adminRole.setInit(true);
            roleRepository.save(adminRole);

            normalRole = new Role();
            normalRole.setName("normal");
            normalRole.setRoleCode(Type.NORMAL_ROLE_CODE);
            normalRole.setCreateDate(new Date());
            normalRole.getSystemMenuList().addAll(userMenu);
            normalRole.setInit(true);
            roleRepository.save(normalRole);
            
            roles.add(adminRole);
            roles.add(normalRole);
            return roles;
        }

        public void systemMenu(){
            userMenu();
            //adminMenu();
        }

        private void userMenu() {

            //1.参数设置-------------------------------------------------------
            SystemMenu paramSetting = new SystemMenu();
            paramSetting.setMenuName("任务");
            paramSetting.setPxNum(1);
            paramSetting.setMenuType(SystemMenu.MENU_TYPE_URL);
            paramSetting.setMenuValue("taskData/index");
            systemMenuRepository.save(paramSetting);
            userMenu.add(paramSetting);

            SystemMenu paramSetting2 = new SystemMenu();
            paramSetting2.setMenuName("商标信息");
            paramSetting2.setPxNum(2);
            paramSetting2.setMenuType(SystemMenu.MENU_TYPE_URL);
            paramSetting2.setMenuValue("trademarkBean/index");
            systemMenuRepository.save(paramSetting2);
            userMenu.add(paramSetting2);

            SystemMenu paramSetting3 = new SystemMenu();
            paramSetting3.setMenuName("数据上传");
            paramSetting3.setPxNum(3);
            paramSetting3.setMenuType(SystemMenu.MENU_TYPE_URL);
            paramSetting3.setMenuValue("upload/index");
            systemMenuRepository.save(paramSetting3);
            userMenu.add(paramSetting3);

            SystemMenu paramSetting4 = new SystemMenu();
            paramSetting4.setMenuName("翻译管理");
            paramSetting4.setPxNum(4);
            paramSetting4.setMenuType(SystemMenu.MENU_TYPE_URL);
            paramSetting4.setMenuValue("trademarkBean/index");
            systemMenuRepository.save(paramSetting4);
            userMenu.add(paramSetting4);

        }



    }
}
