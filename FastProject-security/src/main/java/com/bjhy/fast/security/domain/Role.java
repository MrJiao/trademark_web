package com.bjhy.fast.security.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apel.gaia.commons.autocomplete.annotation.AutoCompleteEntity;
import org.apel.gaia.commons.autocomplete.annotation.AutoCompleteField;
import org.apel.gaia.commons.autocomplete.enums.AutoCompleteFieldType;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Create by: Jackson
 */
@AutoCompleteEntity
@Entity
public class Role implements Serializable {

    @Id
    @GenericGenerator(name = "jpa-uuid", strategy = "uuid")
    @GeneratedValue(generator = "jpa-uuid")
    String id;

    String name;

    //角色代码  唯一标识
    String roleCode;

    // 创建时间
    @AutoCompleteField(type=AutoCompleteFieldType.DATE)
    @Column(name = "gmtCreate")
    private Date createDate;

    @AutoCompleteField(type=AutoCompleteFieldType.DATE,always=true)
    private Date gmtModified;

    @ManyToMany(targetEntity = SystemMenu.class,fetch=FetchType.EAGER)
    @JsonIgnore
    List<SystemMenu> systemMenuList = new ArrayList<>();
    
    //此角色是否属于某个机构, 属于为true, 不属于为false;
    @Transient
    private boolean belongToOrg;
    
    //标记当前对象是否为系统初始化时创建, isInit= true时,此对象不可删除
    @Column(nullable = false,columnDefinition="number(1,0) default 0")
    private boolean isInit;
    
    public boolean isBelongToOrg() {
		return belongToOrg;
	}

	public void setBelongToOrg(boolean belongToOrg) {
		this.belongToOrg = belongToOrg;
	}

	public String getRoleCode() {
        return roleCode;
    }

    public void setRoleCode(String roleCode) {
        this.roleCode = roleCode;
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

    public List<SystemMenu> getSystemMenuList() {
        return systemMenuList;
    }

    public void setSystemMenuList(List<SystemMenu> systemMenuList) {
        this.systemMenuList = systemMenuList;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

	public boolean isInit() {
		return isInit;
	}

	public void setInit(boolean isInit) {
		this.isInit = isInit;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((roleCode == null) ? 0 : roleCode.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Role other = (Role) obj;
		if (roleCode == null) {
			if (other.roleCode != null)
				return false;
		} else if (!roleCode.equals(other.roleCode))
			return false;
		return true;
	}
    
}
