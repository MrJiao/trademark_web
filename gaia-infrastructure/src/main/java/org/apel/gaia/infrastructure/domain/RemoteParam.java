package org.apel.gaia.infrastructure.domain;

import java.util.ArrayList;
import java.util.List;

/**
 * 远程参数
 * @author wubo
 */
public class RemoteParam{
	//导出对应的domain实体类
	private Object domainClassEntity;
	//属性列
	private List<FieldColumn> fieldColumns = new ArrayList<>();
	public Object getDomainClassEntity() {
		return domainClassEntity;
	}
	public void setDomainClassEntity(Object domainClassEntity) {
		this.domainClassEntity = domainClassEntity;
	}
	public List<FieldColumn> getFieldColumns() {
		return fieldColumns;
	}
	public void setFieldColumns(List<FieldColumn> fieldColumns) {
		this.fieldColumns = fieldColumns;
	}
	/**
	 * 是否包含  colModelName
	 * @param colModelName
	 * @return
	 */
	public Boolean contains(String colModelName){
		for (FieldColumn fieldColumn : fieldColumns) {
			String colModelName2 = fieldColumn.getColModelName();
			if(colModelName2.equals(colModelName)){
				return true;
			}
		}
		return false;
	}
	
	/**
	 * 通过 colModelName 得到 FieldColumn
	 * @param colModelName
	 * @return
	 */
	public FieldColumn getFieldColumn(String colModelName){
		for (FieldColumn fieldColumn : fieldColumns) {
			String colModelName2 = fieldColumn.getColModelName();
			if(colModelName2.equals(colModelName)){
				return fieldColumn;
			}
		}
		return null;
	}
}