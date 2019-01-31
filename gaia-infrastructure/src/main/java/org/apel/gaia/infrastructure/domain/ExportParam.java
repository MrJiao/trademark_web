package org.apel.gaia.infrastructure.domain;

import org.apel.gaia.commons.pager.Condition;
import org.apel.gaia.commons.pager.Order;
import org.apel.gaia.commons.pager.PageBean;
import org.apel.gaia.infrastructure.consist.ExportConsist;
import org.apel.gaia.infrastructure.domain.ComputeField.FieldType;
import org.springframework.util.StringUtils;

import javax.persistence.Column;
import javax.persistence.JoinColumn;
import javax.persistence.Transient;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 
 * 导出参数类，用于封装jqgrid对excel的导出参数封装
 * 
 * @author lijian
 *
 */
public class ExportParam {
	/**
	 * 远程参数本地字段 前缀
	 */
	public final static String REMOTE_PARAM_NATIVE_FIELD_PREFIX = "r_p_n_f_";
	
	// 导出文件名称
	private String exportFileName;

	// 导出的语句模板
	private String hqlTemplate;

	// 导出的查询条件
	private List<Condition> conditions;

	// 导出的排序条件
	private List<Order> orders;

	// 导出的列表头
	private String colNameParam;

	// 用于sql查询的字段信息
	private String fieldsParam;
	
	//计算字段
	private List<ComputeField>  computeFields = new ArrayList<>();

	// 导出的数据id集合
	private String ids;
	
	//字段前缀
	private String prefix;
	
	//需特殊处理字段
	private Map<String, ExportType> specialFields;
	
	//远程参数
	private RemoteParam remoteParam;

	public String getExportFileName() {
		return exportFileName;
	}

	public void setExportFileName(String exportFileName) {
		this.exportFileName = exportFileName;
	}

	public String getHqlTemplate() {
		return hqlTemplate;
	}

	public void setHqlTemplate(String hqlTemplate) {
		this.hqlTemplate = hqlTemplate;
	}

	public List<Condition> getConditions() {
		return conditions;
	}

	public void setConditions(List<Condition> conditions) {
		this.conditions = conditions;
	}

	public List<Order> getOrders() {
		return orders;
	}

	public void setOrders(List<Order> orders) {
		this.orders = orders;
	}

	public String getColNameParam() {
		return colNameParam;
	}

	public void setColNameParam(String colNameParam) {
		this.colNameParam = colNameParam;
	}

	public String getFieldsParam() {
		return fieldsParam;
	}

	public void setFieldsParam(String fieldsParam) {
		this.fieldsParam = fieldsParam;
	}

	public String getIds() {
		return ids;
	}

	public void setIds(String ids) {
		this.ids = ids;
	}
	
	public String getPrefix() {
		return prefix;
	}

	public void setPrefix(String prefix) {
		this.prefix = prefix;
	}

	public List<ComputeField> getComputeFields() {
		return computeFields;
	}

	public void setComputeFields(List<ComputeField> computeFields) {
		this.computeFields = computeFields;
	}

	public static ExportParam buildExportParam(String sqlTemplate, String fileName, String ids, String colNameParam, 
			String fieldsParam, PageBean pageBean, String prefix,RemoteParam remoteParam,Map<String, ExportType> specialFields){
		if(StringUtils.isEmpty(sqlTemplate)){
			throw new RuntimeException("没有导出语句，无法生成excel文件");
		}
		if(StringUtils.isEmpty(fileName)){
			fileName = "无名称.xls";
		}
		if(!sqlTemplate.toLowerCase().contains("where")){
			sqlTemplate = sqlTemplate + " where 1=1";
		}
		ExportParam exportParam = new ExportParam();
		exportParam.setRemoteParam(remoteParam);
		exportParam.setColNameParam(colNameParam);
		exportParam.setFieldsParam(dealSqlFields(fieldsParam,remoteParam,specialFields));
		dealComputeFields(exportParam,fieldsParam,remoteParam);//处理计算字段
		exportParam.setConditions(pageBean.getConditions());
		exportParam.setOrders(pageBean.getOrders());
		exportParam.setHqlTemplate("select " + ExportConsist.FIELDS_TEMPLATE + " " + sqlTemplate);
		exportParam.setIds(ids);
		exportParam.setExportFileName(fileName);
		exportParam.setPrefix(prefix);
		return exportParam;
	}
	
	//对字段前缀名进行处理，变成sql可以查询的字段信息
	private static String dealSqlFields(String fields,RemoteParam remoteParam,Map<String, ExportType> specialFields){
		if(!StringUtils.isEmpty(fields)){
			StringBuffer sb = new StringBuffer();
			String[] fieldsStrArray = fields.split(",");
			int i=0;
			for (String singleFieldStr : fieldsStrArray) {
				String[] fieldPair = singleFieldStr.split("=");
				if(fieldPair[0].contains(".")){
					String newSingleFieldStr = "";
					
					//得到字段列的名称,并为其添加后缀
					String fieldColumnName;
					if(fieldPair[1].contains(".")){
						fieldColumnName = fieldPair[1].split("\\.")[1]+"_"+i+"_";
						//修改特殊字段的字段名称
						setSpecialField(fieldPair[1].split("\\.")[1], fieldColumnName, specialFields);
					}else{
						fieldColumnName = fieldPair[1]+"_"+i+"_";
						//修改特殊字段的字段名称
						setSpecialField(fieldPair[1], fieldColumnName, specialFields);
					}
					
					
					//得到远程字段属性列
					FieldColumn fieldColumn = null;
					if(remoteParam !=null){
						fieldColumn = remoteParam.getFieldColumn(fieldPair[1]);
					}
							
					if(fieldColumn != null){
						//设置远程参数本地字段
						//setRemoteParamNativeField(remoteParam, sb, fieldColumn.getFieldName());
						newSingleFieldStr = "''"+" as "+fieldColumnName;//远程字段的初始值为空字符串
					}else{
						newSingleFieldStr = fieldPair[0] + " as " + fieldColumnName;
					}
					sb.append(newSingleFieldStr + ",");
				}else{
					String fieldColumnName = fieldPair[0]+"_"+i+"_";
					sb.append(fieldPair[0]+" as "+ fieldColumnName+ ",");
					//修改特殊字段的字段名称
					setSpecialField(fieldPair[0], fieldColumnName, specialFields);
				}
				i++;
			}
			fields = sb.substring(0, sb.length() - 1);
		}
		return fields;
	}

	/**
	 * 得到sql的真列名
	 * @param field
	 * @return
	 */
	private static String getSqlColumn(Field field){
		String name = field.getName();
		
		Column column = field.getAnnotation(Column.class);
		if(column != null){
			String columnName = column.name();
			if(!StringUtils.isEmpty(columnName)){
				name = columnName;
			}
		}
		
		JoinColumn joinColumn = field.getAnnotation(JoinColumn.class);
		if(joinColumn != null){
			String joinColumnName = joinColumn.name();
			if(!StringUtils.isEmpty(joinColumnName)){
				name = joinColumnName;
			}
		}
		return name;
	}
	
	//对字段前缀名进行处理，变成可以计算的字段信息
	private static String dealComputeFields(ExportParam exportParam,String fields,RemoteParam remoteParam){
		if(!StringUtils.isEmpty(fields)){
			String[] fieldsStrArray = fields.split(",");
			int i=0;
			for (String singleFieldStr : fieldsStrArray) {
				String[] singleFieldStrPair = singleFieldStr.split("=");
				ComputeField computeField = new ComputeField();//计算字段
				computeField.setColModelName(singleFieldStrPair[1]);
				if(remoteParam != null){
					FieldColumn fieldColumn = remoteParam.getFieldColumn(singleFieldStrPair[1]);
					if(fieldColumn != null){
						computeField.setFieldType(FieldType.REMOTE_FIELD);
						//设置远程参数本地字段
						//setRemoteParamNativeField(exportParam, remoteParam, computeField, fieldColumn);
					}
				}
				
				if(singleFieldStrPair[0].contains(".")){
					String newSingleFieldStr = singleFieldStrPair[0].substring(singleFieldStrPair[0].lastIndexOf(".") + 1);
					computeField.setColumnName(newSingleFieldStr+"_"+i+"_");
				}else{
					computeField.setColumnName(singleFieldStrPair[0]+"_"+i+"_");
				}
				exportParam.getComputeFields().add(computeField);
				i++;
			}
		}
		return fields;
	}
	
	/**
	 * 修改特殊字段的字段名称
	 * @param oldFieldName 老字段名称
	 * @param newFieldName 新字段名称
	 * @param specialFields 要修改的特殊字段集合
	 */
	private static void setSpecialField(String oldFieldName,String newFieldName,Map<String, ExportType> specialFields){
		if(StringUtils.isEmpty(oldFieldName) || StringUtils.isEmpty(newFieldName)){
			return;
		}
		if(oldFieldName.equals(newFieldName)){
			return;
		}
		
		if(specialFields!= null && !specialFields.isEmpty()){
			//将字段属性名修改为新的字段属性名
			ExportType exportType = specialFields.get(oldFieldName);
			if(exportType == null)return;
			exportType.setField(newFieldName);
			specialFields.put(newFieldName, exportType);
			//删除老字段属性名对应的值
			specialFields.remove(oldFieldName);
		}
	}
	
	/**
	 *  设置远程参数本地字段
	 * @param remoteParam 远程参数
	 * @param sb
	 * @param fieldName
	 */
	/*private static void setRemoteParamNativeField(RemoteParam remoteParam, StringBuffer sb, String fieldName) {
		Object domainClassEntity = remoteParam.getDomainClassEntity();
		try {
			ReferenceInvoke referenceInvoke = domainClassEntity.getClass().getDeclaredField(fieldName).getAnnotation(ReferenceInvoke.class);
			if(referenceInvoke != null){
				String[] invokeParams = referenceInvoke.invokeParams();
				for (String paramKey : invokeParams) {
					Field field = domainClassEntity.getClass().getDeclaredField(paramKey);
					Transient transientAnnotation = field.getAnnotation(Transient.class);
					if(transientAnnotation != null){
						continue;
					}
					String sqlColumn = getSqlColumn(field);
					sqlColumn = sqlColumn +" as "+REMOTE_PARAM_NATIVE_FIELD_PREFIX+sqlColumn;
					if(!sb.toString().contains(sqlColumn)){
						sb.append(sqlColumn + ",");
					}
				}
			}
		} catch (NoSuchFieldException | SecurityException e) {
			e.printStackTrace();
		}
	}
*/
/*	*//**
	 * 设置远程参数本地字段
	 * @param exportParam 导出参数
	 * @param remoteParam 远程参数
	 * @param computeField 计算字段
	 * @param fieldColumn 属性列
	 *//*
	private static void setRemoteParamNativeField(ExportParam exportParam, RemoteParam remoteParam,
			ComputeField computeField, FieldColumn fieldColumn) {
		Object domainClassEntity = remoteParam.getDomainClassEntity();
		String fieldName = fieldColumn.getFieldName();
		try {
			ReferenceInvoke referenceInvoke = domainClassEntity.getClass().getDeclaredField(fieldName).getAnnotation(ReferenceInvoke.class);
			if(referenceInvoke != null){
				String[] invokeParams = referenceInvoke.invokeParams();
				for (String paramKey : invokeParams) {
					Field field = domainClassEntity.getClass().getDeclaredField(paramKey);
					
					Transient transientAnnotation = field.getAnnotation(Transient.class);
					if(transientAnnotation != null){
						computeField.getRemoteInvokeParams().put(paramKey, null);
						continue;
					}
					
					if(!exportParam.containComputeFields(paramKey)){
						ComputeField remoteParamNativeField = new ComputeField();//远程参数本地字段
						//远程参数本地字段(remoteParamNativeField)本地字段的缩写
						remoteParamNativeField.setColumnName(REMOTE_PARAM_NATIVE_FIELD_PREFIX+paramKey);
						remoteParamNativeField.setColModelName(REMOTE_PARAM_NATIVE_FIELD_PREFIX+paramKey);
						remoteParamNativeField.setFieldType(FieldType.REMOTE_PARAM_NATIVE_FIELD);
						exportParam.getComputeFields().add(remoteParamNativeField);
					}
					computeField.getRemoteInvokeParams().put(paramKey, null);
				}
			}
		} catch (NoSuchFieldException | SecurityException e) {
			e.printStackTrace();
		}
	}*/
	public Map<String, ExportType> getSpecialFields() {
		return specialFields;
	}

	public void setSpecialFields(Map<String, ExportType> specialFields) {
		this.specialFields = specialFields;
	}

	public RemoteParam getRemoteParam() {
		return remoteParam;
	}

	public void setRemoteParam(RemoteParam remoteParam) {
		this.remoteParam = remoteParam;
	}
	
	/**
	 * 根据列名称查询是否包含 该列
	 * @param columnName 列名称
	 * @return
	 */
	public Boolean containComputeFields(String columnName){
		for (ComputeField computeField : computeFields) {
			if(computeField.getColumnName().equals(columnName)){
				return true;
			}
		}
		return false;
	}

}
