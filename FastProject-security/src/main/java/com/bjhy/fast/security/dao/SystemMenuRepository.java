package com.bjhy.fast.security.dao;

import com.bjhy.fast.security.domain.SystemMenu;
import org.apel.gaia.persist.dao.CommonRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Create by: Jackson
 */
public interface SystemMenuRepository extends CommonRepository<SystemMenu,String> {

    @Query("SELECT s FROM Role r join r.systemMenuList s where r.id = :id ")
    List<SystemMenu> findByRoleId(@Param("id") String roleId);

	SystemMenu findByMenuName(String menuName);

	
	@Modifying
	@Transactional
	void deleteByMenuName(String menuName);

	/**
	 * 使用原生sql查询
	 * welldo
	 */
	@Query(nativeQuery=true, value="select * from SystemMenu s where s.PARENT_ID= ?1")
	List<SystemMenu> findByParent(String parentId);


}
