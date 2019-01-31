package com.bjhy.fast.security.service.impl;


import com.bjhy.fast.security.dao.RoleRepository;
import com.bjhy.fast.security.domain.Role;
import com.bjhy.fast.security.exception.RoleExitException;
import com.bjhy.fast.security.service.RoleService;
import org.apel.gaia.commons.pager.PageBean;
import org.apel.gaia.infrastructure.impl.AbstractBizCommonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

/**
 * Create by: Jackson
 */
@Service
@Transactional
public class RoleServiceImpl extends AbstractBizCommonService<Role, String> implements RoleService {

    @Autowired
	RoleRepository roleRepository;

    @Override
    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    @Override
    public Role findOne(String id) {
        return roleRepository.findOne(id);
    }

    @Override
    public List<Role> findIn(String[] ids) {
        return  roleRepository.findByIdIn(ids);
    }

    @Override
    public PageBean queryNotIn(List<String> roleIds, PageBean pageBean) {
        PageRequest pageable = new PageRequest(pageBean.getCurrentPage()-1,pageBean.getRowsPerPage());
        Page<Role> page ;
        if(roleIds==null || roleIds.size()==0){
            page = roleRepository.findAll(pageable);
        }else {
            page = roleRepository.findAllByIdNotIn(roleIds, pageable);
        }
        
        pageBean.setTotalRows((int) page.getTotalElements());
        pageBean.setItems(page.getContent());
        return pageBean;
    }

    /**
     * @author welldo
     */
	@Override
	public void addOne(Role role) throws RoleExitException {
		Role roleByName = roleRepository.findByName(role.getName());
		Role roleByCode = roleRepository.findByRoleCode(role.getRoleCode());
		if(roleByName != null) {
			throw new RoleExitException("角色名称已存在");
		}
		if(roleByCode != null) {
			throw new RoleExitException("角色代码已存在");
		}
		role.setCreateDate(new Date());
		roleRepository.save(role);
	}

	/**
	 * 查看某个机构下的全部角色,如果该机构有这个角色,role.belongToOrg= true  
     * @author welldo
     */
	@Override
	public List<Role> findAllRoleByOrg(String orgId) {
		//找到所有的角色
		RoleRepository roleRepository =(RoleRepository) getRepository();
		List<Role> allRole = roleRepository.findAll();

		for (Role role : allRole) {
			role.setBelongToOrg(true);
		}

		return allRole;
	}

	@Override
	public Role findByRoleCode(String roleCode) {
		return roleRepository.findByRoleCode(roleCode);
	}
	
	@Override
	public Role findByName(String name) {
		return roleRepository.findByName(name);
	}

	@Override
	public boolean isExist(String roleCode, String name) {
		Role byRoleCode = roleRepository.findByRoleCode(roleCode);
		Role findByName = roleRepository.findByName(name);
		if((byRoleCode != null) || (findByName != null) ) {
			return true;
		}
		return false;
	}


}
