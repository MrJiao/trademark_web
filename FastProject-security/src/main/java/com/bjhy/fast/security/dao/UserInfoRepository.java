package com.bjhy.fast.security.dao;


import com.bjhy.fast.security.domain.UserInfo;
import org.apel.gaia.persist.dao.CommonRepository;

/**
 * Create by: Jackson
 */
public interface UserInfoRepository extends CommonRepository<UserInfo,String> {


    UserInfo findByUsername(String username);
}
