package com.bjhy.fast.build.core.domain;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.io.Serializable;

/** 
* @author welldo
* @version 2018年7月24日 下午5:08:28
*/
@Entity
public class AllVersion implements Serializable {
	
	@Id
	@GenericGenerator(name = "jpa-uuid", strategy = "uuid")
	@GeneratedValue(generator = "jpa-uuid")
	String id;
	
	//目前有FilterSuffix, SystemMenu, Role(admin,normal), UserInfo(admin)
	String name;
	
	Integer version;

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

	public Integer getVersion() {
		return version;
	}

	public void setVersion(Integer version) {
		this.version = version;
	}

}
