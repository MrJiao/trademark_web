package org.apel.gaia.infrastructure.domain;
/**
 * 属性列类
 * @author ThinkPad
 *
 */
public class FieldColumn{
	//属性名
	private String fieldName;
	//jqgrid对应colModel的name的值
	private String colModelName;
	public String getFieldName() {
		return fieldName;
	}
	public void setFieldName(String fieldName) {
		this.fieldName = fieldName;
	}
	public String getColModelName() {
		return colModelName;
	}
	public void setColModelName(String colModelName) {
		this.colModelName = colModelName;
	}
}