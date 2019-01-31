package com.bjhy.fast.security.domain;

import org.apache.commons.lang3.StringUtils;
import org.apel.gaia.commons.autocomplete.annotation.AutoCompleteEntity;
import org.apel.gaia.commons.autocomplete.annotation.AutoCompleteField;
import org.apel.gaia.commons.autocomplete.enums.AutoCompleteFieldType;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;

/**
 * Create by: Jackson
 */
@AutoCompleteEntity
@Entity
public class SystemMenu implements Serializable {
    @Transient
    public static final String MENU_TYPE_DIRECTORY = "directory";
    @Transient
    public static final String MENU_TYPE_CLASS = "class";
    @Transient
    public static final String MENU_TYPE_URL = "url";
    @Transient
    public static final String MENU_TYPE_PERM = "perm";
    @Transient
    public static final String MENU_TYPE_AJAX = "ajax";

    @Id
    @GenericGenerator(name = "jpa-uuid", strategy = "uuid")
    @GeneratedValue(generator = "jpa-uuid")
    private String id;

    //唯一标识....
    private String menuName;

    private String menuType;

    private String menuValue;

    private Integer pxNum;

    private String icon;

    private String memo;

    //一个当前对象, 只有一个parent
    @OneToOne
    private SystemMenu parent;

    // 创建时间
    @AutoCompleteField(type=AutoCompleteFieldType.DATE)
    @Column(name = "gmtCreate")
    private Date createDate;

    @AutoCompleteField(type=AutoCompleteFieldType.DATE,always=true)
    private Date gmtModified;

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

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMenuName() {
        return menuName;
    }

    public void setMenuName(String menuName) {
        this.menuName = menuName;
    }

    public String getMenuType() {
        return menuType;
    }

    public void setMenuType(String menuType) {
        this.menuType = menuType;
    }

    public String getMenuValue() {
        return menuValue;
    }

    public void setMenuValue(String menuValue) {
        this.menuValue = menuValue;
    }

    public Integer getPxNum() {
        return pxNum;
    }

    public void setPxNum(Integer pxNum) {
        this.pxNum = pxNum;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getMemo() {
        return memo;
    }

    public void setMemo(String memo) {
        this.memo = memo;
    }

	public SystemMenu getParent() {
        return parent;
    }

    public void setParent(SystemMenu parent) {
        this.parent = parent;
    }

    @Override
    public boolean equals(Object obj) {
        if(obj instanceof SystemMenu){
            SystemMenu s = (SystemMenu) obj;
            return StringUtils.equals(id,s.getId());
        }
        return false;
    }
}
