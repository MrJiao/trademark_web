package com.bjhy.fast.security.web.security;

import com.bjhy.fast.security.config.Type;
import com.bjhy.fast.security.domain.Role;
import com.bjhy.fast.security.domain.UserInfo;
import com.bjhy.fast.security.exception.RoleExitException;
import com.bjhy.fast.security.service.RoleService;
import com.bjhy.fast.security.service.SecurityUserInfoService;
import com.bjhy.tlevel.datax.common.utils.BeanUtil;
import org.apache.commons.lang3.StringUtils;
import org.apel.gaia.commons.i18n.Message;
import org.apel.gaia.commons.i18n.MessageUtil;
import org.apel.gaia.commons.jqgrid.QueryParams;
import org.apel.gaia.commons.pager.PageBean;
import org.apel.gaia.util.jqgrid.JqGridUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Create by: Jackson
 */
@Controller
@RequestMapping("/role")
public class RoleController {

    private final static String INDEX_URL = "userManager/roles_index";

    @Autowired
    RoleService roleService;

    @Autowired
    private SecurityUserInfoService userInfoService;

    //进入角色管理页面

    @RequestMapping(value = "/index", method = RequestMethod.GET)
    public String index() {
        return INDEX_URL;
    }

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public PageBean findAllRoles(QueryParams queryParams) {
    	PageBean pageBean = JqGridUtil.getPageBean(queryParams);
    	roleService.pageQuery(pageBean);
    	return pageBean;
    }

    /**
     * 查看某个机构下的全部角色,如果该机构有这个角色,role.belongToOrg= true
     * @author welldo
     */
    //willdo 分页效果
    @RequestMapping(value = "/findAllByOrg/{orgId}", method = RequestMethod.GET)
    @ResponseBody
    public List<Role> findAllRoleByOrg(@PathVariable String orgId) {
        List<Role> roleByOrg = roleService.findAllRoleByOrg(orgId);
        return roleByOrg;
    }


    //新增角色 write by welldo
    @ResponseBody
    @RequestMapping(method = RequestMethod.POST)
    public Message addRole(String name, String roleCode, HttpServletResponse response) {
        Role role = new Role();
        role.setName(name);
        role.setRoleCode(roleCode);
        try {
            roleService.addOne(role);
        } catch (RoleExitException e) {
            return MessageUtil.message(405, "role.exit.error");
        }
        return MessageUtil.message("role.create.success");
    }

    //批量删除(可删除一个或者多个) write by welldo
    @RequestMapping(method = RequestMethod.DELETE)
    @ResponseBody
    public Message batchDelete(@RequestParam("ids[]") String[] ids) {
    	//先判断对象是否为系统初始化创建的, 如果是, 则无法删除
    	for (String id : ids) {
    		Role role = roleService.findById(id);
    		if(role.isInit()) {
    			return MessageUtil.message(405,"role.delete.init.error");
    		}
		}
        roleService.deleteById(ids);
        return MessageUtil.message("common.delete.success");
    }

    /**
     * 修改一个角色 (只能修改name/roleCode)
     * @param id (注意: 前端传过来的role,只有name和roleCode两个属性)
     * @author welldo
     */
    @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
    @ResponseBody
    public Message updateRole(@PathVariable String id, Role tempRole) {
    	//先找到要修改的对象(4种情况)
    	Role oldRole = roleService.findById(id);
    	
    	//1.roleCode没有修改
    	if( oldRole.getRoleCode().equals(tempRole.getRoleCode()) ) {
    		//1.1 name也没有修改
    		if( oldRole.getName().equals(tempRole.getName()) ) {
    			return MessageUtil.message(405,"role.update.nothing");
    		}
    		//1.2 name修改, 需是否已经存在
    		Role role = roleService.findByName(tempRole.getName());
    		if(role != null) {
        		return MessageUtil.message(405,"role.exit.error");
        	}
    		//说明name不存在,保存即可
    		oldRole.setName(tempRole.getName());
    		oldRole.setGmtModified(new Date());
    		roleService.save(oldRole);
            return MessageUtil.message("common.update.success");
    	}
    	
		//2.roleCode修改过了
		if( oldRole.getName().equals(tempRole.getName()) ) {
			//2.1 name没有修改 ,只需判断roleCode是否已经存在
			
			//(admin/normal的ROLE_CODE不能更改)//原因见 removeRole()方法;
			String roleCode = oldRole.getRoleCode();
			if(StringUtils.equals(roleCode, Type.ADMIN_ROLE_CODE) ||
					StringUtils.equals(roleCode, Type.NORMAL_ROLE_CODE)	) {
				return MessageUtil.message(405,"role.update.error.adminNormal");
			}
			
			Role role = roleService.findByRoleCode(tempRole.getRoleCode());
			if(role != null) {
        		return MessageUtil.message(405,"role.exit.error");
        	}
			oldRole.setRoleCode(tempRole.getRoleCode());
			oldRole.setGmtModified(new Date());
    		roleService.save(oldRole);
            return MessageUtil.message("common.update.success");
		}else {
			//2.2 name修改过了, 两个都需要判断
			
			String roleCode = oldRole.getRoleCode();
			if(StringUtils.equals(roleCode, Type.ADMIN_ROLE_CODE) ||
					StringUtils.equals(roleCode, Type.NORMAL_ROLE_CODE)	) {
				return MessageUtil.message(405,"role.update.error.adminNormal");
			}
			
			boolean exist = roleService.isExist(tempRole.getRoleCode(), tempRole.getName());
			if(exist) {
				return MessageUtil.message(405,"role.exit.error");
			}
			oldRole.setName(tempRole.getName());
			oldRole.setRoleCode(tempRole.getRoleCode());
			oldRole.setGmtModified(new Date());
			roleService.save(oldRole);
			return MessageUtil.message("common.update.success");
		}
    }

    //通过id查找角色 TODO (这个方法好像没用,后面删掉)
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public @ResponseBody Role findAllRole(@PathVariable String id) {
        return roleService.findOne(id);
    }

    @RequestMapping(value = "/assignRole", method = RequestMethod.POST)
    public @ResponseBody  Message associationRole(String userId, @RequestParam("roleIds[]") String[] roleIds) {
        UserInfo userInfo = userInfoService.findById(userId);
        List<Role> roleList = roleService.findIn(roleIds);
        if (roleList != null)
            userInfo.getRoleList().addAll(roleList);
        userInfoService.save(userInfo);
        return MessageUtil.message("userInfo.add.role.success");
    }

    /**
     * 为user移除角色	(至少绑定normal和admin中的一个)
     * @author welldo
     */
    @RequestMapping(value = "/removeRole", method = RequestMethod.POST)
    public @ResponseBody    Message removeRole(String userId, @RequestParam("roleIds[]") String[] roleIds) {
        UserInfo userInfo = userInfoService.findById(userId);
        List<Role> userRoles = userInfo.getRoleList();
        
        Role admin = roleService.findByRoleCode(Type.ADMIN_ROLE_CODE);
        Role normal = roleService.findByRoleCode(Type.NORMAL_ROLE_CODE);
        
        List<Role> roleForDelete = roleService.findIn(roleIds);
        List<Role> tempList = new ArrayList<>();
        
        if (roleForDelete != null) {
        	tempList.addAll(userRoles);
        	tempList.removeAll(roleForDelete);
        	//剩下的角色中, normal和admin至少有一个
        	if( !(tempList.contains(admin) || tempList.contains(normal)) ) {
        		return MessageUtil.message(405,"userInfo.add.role.error.both");
        	}
        }
        userRoles.removeAll(roleForDelete);
        userInfoService.save(userInfo);
        return MessageUtil.message("userInfo.add.role.success");
    }

    @RequestMapping(value = "/user", method = RequestMethod.GET)
    public @ResponseBody PageBean findUserRole(QueryParams queryParams) {
        UserInfo userInfo = userInfoService.findById(queryParams.getSearchString());
        PageBean pageBean = new PageBean();
        List<Role> roleList = userInfo.getRoleList();
        pageBean.setTotalRows(roleList.size());
        pageBean.setCurrentPage(queryParams.getPage());
        pageBean.setRowsPerPage(queryParams.getRows());
        int start = (pageBean.getCurrentPage() - 1) * pageBean.getRowsPerPage();
        int end = pageBean.getCurrentPage() * pageBean.getRowsPerPage();
        if (end > roleList.size())
            end = roleList.size();
        List<Role> roles = roleList.subList(start, end);
        pageBean.setItems(roles);
        return pageBean;
    }

    @RequestMapping(value = "/other", method = RequestMethod.GET)
    public @ResponseBody PageBean findUserOtherRole(QueryParams queryParams) {
        UserInfo userInfo = userInfoService.findById(queryParams.getSearchString());
        PageBean pageBean = new PageBean();
        
        List roleIds = BeanUtil.getFieldList(userInfo.getRoleList(), "id");
        pageBean.setCurrentPage(queryParams.getPage());
        pageBean.setRowsPerPage(queryParams.getRows());
        roleService.queryNotIn(roleIds, pageBean);
        return pageBean;
    }

}
