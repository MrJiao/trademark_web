package org.apel.gaia.infrastructure.domain;

import java.util.HashMap;
import java.util.Map;

/**
 * 计算字段
 * @author wubo
 *
 */
public class ComputeField {
	/**
	 * 字段类型
	 * @author wubo
	 */
	public enum FieldType{
		REMOTE_FIELD,//远程字段
		NATIVE_FIELD,//本地字段
		REMOTE_PARAM_NATIVE_FIELD;//远程参数本地字段
	}
	//列名称
	private String columnName;
	//jqgrid对应colModel的name的值
	private String colModelName;
	//是远程字段吗
	private FieldType fieldType = FieldType.NATIVE_FIELD;
	//远程调用参数(key:为参数名称,value:为参数值)
	private Map<String,Object> remoteInvokeParams = new HashMap<String,Object>();
	public String getColumnName() {
		return columnName;
	}
	public void setColumnName(String columnName) {
		this.columnName = columnName;
	}
	public String getColModelName() {
		return colModelName;
	}
	public void setColModelName(String colModelName) {
		this.colModelName = colModelName;
	}
	public Map<String, Object> getRemoteInvokeParams() {
		return remoteInvokeParams;
	}
	public void setRemoteInvokeParams(Map<String, Object> remoteInvokeParams) {
		this.remoteInvokeParams = remoteInvokeParams;
	}
	public FieldType getFieldType() {
		return fieldType;
	}
	public void setFieldType(FieldType fieldType) {
		this.fieldType = fieldType;
	}
}
