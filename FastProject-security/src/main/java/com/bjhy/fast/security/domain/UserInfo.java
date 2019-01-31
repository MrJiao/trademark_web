package com.bjhy.fast.security.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apel.gaia.commons.autocomplete.annotation.AutoCompleteEntity;
import org.apel.gaia.commons.autocomplete.annotation.AutoCompleteField;
import org.apel.gaia.commons.autocomplete.enums.AutoCompleteFieldType;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

/**
 * Create by: Jackson
 */
@AutoCompleteEntity
@Entity
public class UserInfo implements UserDetails , Serializable {

    @Id
    @GenericGenerator(name = "jpa-uuid", strategy = "uuid")
    @GeneratedValue(generator = "jpa-uuid")
    private String id;

    private String username;
    @JsonIgnore
    private String password;

    private String nickName;

    @Transient
    @JsonIgnore
    List<SystemMenu> functionMenus = new ArrayList<>();

    @Transient
    @JsonIgnore
    List<SystemMenu> linkableMenus = new ArrayList<>();

    @ManyToMany(targetEntity = Role.class,fetch = FetchType.LAZY,cascade = CascadeType.DETACH)
    List<Role> roleList = new ArrayList<>();


    // 创建时间
    @AutoCompleteField(type=AutoCompleteFieldType.DATE)
    @Column(name = "gmtCreate")
    private Date createDate;

    //修改时间
    @AutoCompleteField(type=AutoCompleteFieldType.DATE,always=true)
    private Date gmtModified;
    
    //标记当前对象是否为系统初始化时创建, isInit= true时,此对象不可删除
    @Column(nullable = false,columnDefinition="number(1,0) default 0")
    private boolean isInit = false;


    public String getNickName() {
        return nickName;
    }

    public void setNickName(String nickName) {
        this.nickName = nickName;
    }

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public Date getGmtModified() {
        return gmtModified;
    }

    public void setGmtModified(Date gmtModified) {
        this.gmtModified = gmtModified;
    }

    public List<Role> getRoleList() {
        return roleList;
    }

    public void setRoleList(List<Role> roleList) {
        this.roleList = roleList;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<SystemMenu> getFunctionMenus() {
        return functionMenus;
    }

    public void setFunctionMenus(List<SystemMenu> functionMenus) {
        this.functionMenus = functionMenus;
    }

    public List<SystemMenu> getLinkableMenus() {
        return linkableMenus;
    }

    public void setLinkableMenus(List<SystemMenu> linkableMenus) {
        this.linkableMenus = linkableMenus;
    }


    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return new ArrayList<>();
    }

	public boolean isInit() {
		return isInit;
	}

	public void setInit(boolean isInit) {
		this.isInit = isInit;
	}

}
