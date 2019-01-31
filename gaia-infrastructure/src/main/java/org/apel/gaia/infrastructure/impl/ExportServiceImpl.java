package org.apel.gaia.infrastructure.impl;

import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.apel.gaia.commons.pager.Condition;
import org.apel.gaia.commons.pager.Operation;
import org.apel.gaia.commons.pager.Order;
import org.apel.gaia.commons.pager.RelateType;
import org.apel.gaia.infrastructure.ExportService;
import org.apel.gaia.infrastructure.domain.ComputeField;
import org.apel.gaia.infrastructure.domain.ComputeField.FieldType;
import org.apel.gaia.infrastructure.domain.ExportParam;
import org.apel.gaia.infrastructure.domain.ExportType;
import org.apel.gaia.infrastructure.domain.RemoteParam;
import org.apel.gaia.persist.util.IGeneralDao;
import org.apel.gaia.util.DateUtil;
import org.apel.gaia.util.ExportUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.persistence.Transient;
import java.io.ByteArrayOutputStream;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

@Service
public class ExportServiceImpl implements ExportService {
	
	private static Logger LOG = LoggerFactory.getLogger(ExportServiceImpl.class);

	@Autowired
	private IGeneralDao generalDao;
	
	@SuppressWarnings("unchecked")
	@Override
	public List<String> localAndRemoteCommonField(ExportParam exportParam) {
		String ids = exportParam.getIds();
		List<Condition> conditions = exportParam.getConditions();
		List<Order> orders = exportParam.getOrders();
		
		//设置  用户勾选了列表的checkbox 条件
		setCheckboxCondition(exportParam, ids, conditions);
		String sql = exportParam.getHqlTemplate().replaceAll("\\{fields\\}", exportParam.getFieldsParam());
		//根据条件从数据库查询要导出的数据
		List<String> resultList = (List<String>) generalDao.doList(sql, conditions, orders, true);
		return resultList;
	}

	@SuppressWarnings("unchecked")
	@Override
	public ResponseEntity<byte[]> exportListExcel(ExportParam exportParam) {
		String[] cols = new String[0];
		if(!StringUtils.isEmpty(exportParam.getColNameParam())){
			cols = exportParam.getColNameParam().split(",");
		}
		String ids = exportParam.getIds();
		List<Condition> conditions = exportParam.getConditions();
		List<Order> orders = exportParam.getOrders();

		//设置  用户勾选了列表的checkbox 条件
		setCheckboxCondition(exportParam, ids, conditions);
		String sql = exportParam.getHqlTemplate().replaceAll("\\{fields\\}", exportParam.getFieldsParam());
		//根据条件从数据库查询要导出的数据
		List<?> resultList = generalDao.doList(sql, conditions, orders, true);
		byte[] bytes = null;
		try(Workbook wb = new HSSFWorkbook();ByteArrayOutputStream bos = new ByteArrayOutputStream();){
			Sheet sheet = wb.createSheet(exportParam.getExportFileName());
			//填充excel表头
			CellStyle colTopCellStyle = wb.createCellStyle();
			colTopCellStyle.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
			colTopCellStyle.setFillPattern(CellStyle.SOLID_FOREGROUND);
			colTopCellStyle.setBorderBottom(HSSFCellStyle.BORDER_MEDIUM);
			colTopCellStyle.setBorderTop(HSSFCellStyle.BORDER_MEDIUM);
			colTopCellStyle.setBorderRight(HSSFCellStyle.BORDER_MEDIUM);
			colTopCellStyle.setBorderLeft(HSSFCellStyle.BORDER_MEDIUM);
			Row colRow = sheet.createRow(0);
			for (int i = 0; i < cols.length; i++) {
//				sheet.autoSizeColumn(i);
				sheet.setColumnWidth(i, 6000);
				String colName = cols[i];
				Cell cell = colRow.createCell(i);
				cell.setCellValue(colName);
				cell.setCellStyle(colTopCellStyle);
			}
			
			//填充excel数据
			Map<String, ExportType> specialFields = exportParam.getSpecialFields();
			for (int i = 0; i < resultList.size(); i++) {
				Object obj = resultList.get(i);
				Row row = sheet.createRow(i + 1);
				Class<?> clazz = obj.getClass();
				int k = 0;//
				List<ComputeField> computeFields = exportParam.getComputeFields();
				for (int j = 0; j < computeFields.size(); j++) {
					int m = j-k;
					ComputeField computeField = computeFields.get(j);
					String field = computeField.getColumnName();
					
					Cell cell = null;
					RemoteParam remoteParam = exportParam.getRemoteParam();
					if(remoteParam != null){
						//若是远程参数本地字段,则不进行处理
						if(computeField.getFieldType() == FieldType.REMOTE_PARAM_NATIVE_FIELD){
							k++;
							continue;
						}
						
						sheet.setColumnWidth(m, 6000);
						cell = row.createCell(m);
						//判断该字段是否是远程字段
						if(computeField.getFieldType() == FieldType.REMOTE_FIELD){
							//远程逻辑处理
							//remoteDealWithLogic(cell, computeField, remoteParam,obj);
							continue;
						}
					}else{
						sheet.setColumnWidth(m, 6000);
						cell = row.createCell(m);
					}
					
					String methodName = "get" + String.valueOf(field.charAt(0)).toUpperCase() + field.substring(1, field.length());
					Method classMehtod = clazz.getMethod(methodName);
					if(classMehtod != null){
						classMehtod.setAccessible(true);
						if(classMehtod.invoke(obj) instanceof Date){
							String DateType="yyyy-MM-dd";
							if(specialFields.containsKey(field)&&"date".equals(specialFields.get(field).getType())){
								DateType=specialFields.get(field).getValue().toString();
							}
							String dateValue = DateUtil.dateToStr(((Date)classMehtod.invoke(obj)),DateType );
							cell.setCellValue(dateValue);
						}else{
							if(classMehtod.invoke(obj) != null){
								if(specialFields.containsKey(field)){
									Object special = specialFields.get(field).getValue();
									String specialType = specialFields.get(field).getType();
									if("boolean".equals(specialType)){
										Map<String,String> map = (Map<String,String>)special;
										String val = map.get(classMehtod.invoke(obj).toString());
										cell.setCellValue(val);
									}
								}else{
									cell.setCellValue(classMehtod.invoke(obj).toString());
								}
							}
						}
					}
				}
			}
			wb.write(bos);
			bytes = bos.toByteArray();
		} catch (Exception e) {
			e.printStackTrace();
			LOG.info("填充excel数据异常");
			throw new RuntimeException(e);
		}
		return ExportUtil.getResponseEntityByFile(bytes, exportParam.getExportFileName());
	}
	

	/**
	 * 设置  用户勾选了列表的checkbox 条件
	 * @param exportParam
	 * @param ids
	 * @param conditions
	 */
	private void setCheckboxCondition(ExportParam exportParam, String ids, List<Condition> conditions) {
		//如果jqgrid传递了数据id集合，则需要对条件进行过滤（应用场景通常为用户勾选了列表的checkbox后进行导出）
 		if(!StringUtils.isEmpty(ids)){
			String[] idsArray = ids.split(",");
			Condition condition = new Condition();
			condition.setOperation(Operation.IN);
			condition.setPropertyName(exportParam.getPrefix() + "id");
			condition.setRelateType(RelateType.AND);
			condition.setPropertyValue(idsArray);
			conditions.add(condition);
		}
	}
	
	/**
	 * 远程字段的处理逻辑
	 * @param cell 
	 * @param computeField 计算字段
	 * @param remoteParam 远程参数
	 */
	/*private void remoteDealWithLogic(Cell cell,ComputeField computeField,RemoteParam remoteParam,Object rowData){
		try {
			String colModelName = computeField.getColModelName();
			Object domainClassEntity = remoteParam.getDomainClassEntity();
			Map<String, Object> remoteInvokeParams = computeField.getRemoteInvokeParams();
			Set<Entry<String, Object>> entrySet = remoteInvokeParams.entrySet();
			for (Entry<String, Object> entry : entrySet) {
				String key = entry.getKey();
				Field field = domainClassEntity.getClass().getDeclaredField(key);
				Transient transientAnnotation = field.getAnnotation(Transient.class);
				if(transientAnnotation != null){
					continue;
				}
				
				if (!field.isAccessible()) {
	                field.setAccessible(true);
	            }
				
				String rowMethodName = ExportParam.REMOTE_PARAM_NATIVE_FIELD_PREFIX+key;
				rowMethodName = "get"+String.valueOf(rowMethodName.charAt(0)).toUpperCase() + rowMethodName.substring(1);
				Method classMehtod = rowData.getClass().getMethod(rowMethodName);
				if(classMehtod != null){
					classMehtod.setAccessible(true);
				}
				//行数据方法的值
				Object rowDataMethodValue = classMehtod.invoke(rowData);
				
				String targetEntityMethodName = "set"+String.valueOf(key.charAt(0)).toUpperCase() + key.substring(1);
				Method targetEntityMethod = domainClassEntity.getClass().getMethod(targetEntityMethodName, field.getType());
				
				if(targetEntityMethod != null){
					targetEntityMethod.setAccessible(true);
				}
				
				targetEntityMethod.invoke(domainClassEntity, rowDataMethodValue);
			}
			ReferenceInvokeUtil.referenceInvokeObject(domainClassEntity,true,remoteParam.getFieldColumn(colModelName).getFieldName());
			
			//得到真正的值
			String[] split = colModelName.split("\\.");
			Object currentObject = domainClassEntity;//当前取值的对象
			for (String fieldName : split) {
				String targetEntityMethodName = "get"+String.valueOf(fieldName.charAt(0)).toUpperCase() + fieldName.substring(1);
				Method targetEntityMethod = currentObject.getClass().getMethod(targetEntityMethodName);
				currentObject = targetEntityMethod.invoke(currentObject);
			}
			
			//设置值
			if(currentObject instanceof Date){
				String DateType="yyyy-MM-dd";
				String dateValue = DateUtil.dateToStr(((Date)currentObject),DateType );
				cell.setCellValue(dateValue);
			}else{
				cell.setCellValue(currentObject.toString());
			}
		} catch (NoSuchFieldException | SecurityException | NoSuchMethodException | IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
			e.printStackTrace();
		}
		
	}
	
*/
}
