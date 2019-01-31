package com.bjhy.fast.security.vo;

import com.bjhy.fast.security.domain.Role;
import com.bjhy.fast.security.domain.UserInfo;
import com.bjhy.tlevel.datax.common.utils.BeanUtil;
import com.bjhy.tlevel.datax.common.utils.CollectionUtil;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.*;

/**
 * Create by: Jackson
 */
public class UserInfoVo {


    public UserInfoVo() {

    }

    public UserInfoVo(UserInfo userInfo) {
        setId(userInfo.getId());
        setNickName(userInfo.getNickName());
        setUsername(userInfo.getUsername());
        setGmtCreate(userInfo.getCreateDate());
        
        //用户所属的组织机构,此机构如果有role, 用户将继承...
        List<Role> roleList= new ArrayList<>();
        

        roleList.addAll(userInfo.getRoleList());
        //去重
        List<Role> newList = removeDuplicate(roleList);
        String roles = BeanUtil.getFieldStr(newList, "name");
        setRoles(roles);
        

    }



    String id;

    String username;

    String nickName;

    //字符串的形式....
    String roles;

    String organizations;

    Date gmtCreate;

    @JsonIgnore
    String password;

    public String getOrganizations() {
        return organizations;
    }

    public void setOrganizations(String organizations) {
        this.organizations = organizations;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getNickName() {
        return nickName;
    }

    public void setNickName(String nickName) {
        this.nickName = nickName;
    }

    public String getRoles() {
        return roles;
    }

    public void setRoles(String roles) {
        this.roles = roles;
    }

    public Date getGmtCreate() {
        return gmtCreate;
    }

    public void setGmtCreate(Date gmtCreate) {
        this.gmtCreate = gmtCreate;
    }


    public static List<UserInfoVo> convert(List<UserInfo> userInfoList){
        ArrayList<UserInfoVo> arr = new ArrayList<>();
        if(CollectionUtil.isEmpty(userInfoList))return arr;
        for(UserInfo u:userInfoList){
            arr.add(new UserInfoVo(u));
        }
        return arr;
    }
    
    // 	去重操作...记得要重写要比较的实体哦 !@author welldo
 	public static List<Role> removeDuplicate(List<Role> list) {
 		Set<Role> hashSet = new HashSet();
 		List<Role> tempList = new ArrayList<>();
 		
 		for (Role role : list) {
 			if(hashSet.add(role)) {
 				tempList.add(role);
 			}
 		}
 		return tempList;
 	}

}
