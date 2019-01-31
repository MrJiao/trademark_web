package org.apel.gaia.infrastructure.domain;
/**
 * 导出字段类型
 * @author wzk
 *
 */
public class ExportType {
	/**
	 * 对应字段
	 */
	private String field;
	/**
	 * 导出类型
	 */
	private String type;
	/**
	 * 类型对应值
	 */
	private Object value;
	
	public String getField() {
		return field;
	}
	public void setField(String field) {
		this.field = field;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public Object getValue() {
		return value;
	}
	public void setValue(Object value) {
		this.value = value;
	}
	
}
