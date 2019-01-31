package com.bjhy.fast.security.dao;



import com.bjhy.fast.security.domain.Role;
import org.apel.gaia.persist.dao.CommonRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Create by: Jackson
 */
public interface RoleRepository extends CommonRepository<Role,String> {

    List<Role> findByIdIn(String[] id);


    Page<Role> findAllByIdNotIn(List<String> roleIds, Pageable pageable);
    

    Page<Role> findAll(Pageable pageable);


	Role findByName(String name);


	Role findByRoleCode(String roleCode);
}
