package org.apel.gaia.infrastructure;

import com.bjhy.cache.toolkit.util.GsonUtil;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.apel.gaia.commons.jqgrid.QueryParams;
import org.apel.gaia.commons.pager.Condition;
import org.apel.gaia.commons.pager.Operation;
import org.apel.gaia.commons.pager.PageBean;
import org.apel.gaia.commons.pager.RelateType;
import org.apel.gaia.infrastructure.consist.ExportConsist;
import org.apel.gaia.infrastructure.domain.ExportParam;
import org.apel.gaia.infrastructure.domain.ExportType;
import org.apel.gaia.infrastructure.domain.FieldColumn;
import org.apel.gaia.infrastructure.domain.RemoteParam;
import org.apel.gaia.util.BeanUtils;
import org.apel.gaia.util.CollectionUtil;
import org.apel.gaia.util.jqgrid.JqGridUtil;
import org.apel.poseidon.security.commons.util.UserDetailsUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.*;

/**
 * 公共导出,
 * 完整模板
 *	//绑定导出excel事件
 *	$("#commonExportBtn").click(function(){
 *		    设置远程导出参数
 *		  domainClass : 当前模块的domain实体类
 *		  fieldColumns : jqgrid列的映射
 *		  fieldName : 实体类对应的属性名
 *		  colModelName : jqgrid的colModel中name的值
 *		  authorityField: 权限字段,sys_orgCode:组织机构权限字段,sys_permCode:数据权限字段
 *		  
 *		  remoteQueryWhere:远程查询条件(该条件主要是处理搜索远程字段是能正常导出)
 *		  remoteSearchField:远程搜索的字段(会与 localSearchField 共用搜索值得字段)
 *		  localSearchField:本地所有的字段(会与 remoteSearchField 共用搜索值得字段)
 *		  localStoreRemoteField:本地存储的远程字段
 *		  remoteInterfaceClass:远程调用的dubbo接口
 *		  remoteInterfaceMethod:远程调用的dubbo接口的方法(该方法的参数只能是 List<Condition> conditions ,返回值只能是  List<String>)
 *		var extraParams ={
 *				"remoteParams":{
 *					"domainClass":"com.bjhy.project.demo.com.bjhy.trademark.watermarker.core.domain.ExampleDemo",
 *					"fieldColumns":[
 *				       {"fieldName":"appClientInfo","colModelName":"appClientInfo.appName"},
 *				       {"fieldName":"criminalBaseInfo","colModelName":"criminalBaseInfo.xm"},
 *				       {"fieldName":"criminalBaseInfo","colModelName":"criminalBaseInfo.zfbh"}
 *		            ]
 *				},
 *				"remoteQueryWhere":{
 *					"remoteSearchField":["o.xm","o.zfbh"],
 *					"localSearchField":["name"],
 *					"localStoreRemoteField":"zfId",
 *					"remoteInterfaceClass":"org.apel.crane.api.CriminalBaseApi",
 *					"remoteInterfaceMethod":"findIdsByConditions"
 *				},
 *				"authorityField":{"sys_orgCode":"sys_orgCode","sys_permCode":"sys_permCode"}
 *		};
 *		var orgCodeWhere = getOrgCodeWhere();//得到组织机构的where语句
 *		var dpermCodeWhere = getDpermCodeWhere();//得到数据权限的dpermCodewhere语句
 *		
 *		extraParams['extraParams'] = JSON.stringify(extraParams['extraParams']);
 *		PlatformUI.exportGrid("commonList", "from example_demo where 1=1 ","",extraParams);
 *	});
 * @author ThinkPad
 *
 */
@Controller
@RequestMapping("/export")
public class ExportController {
	private Logger logger = LoggerFactory.getLogger(ExportController.class);

	@Autowired
	private ExportService exportService;
	
	/**
	 * 得到远程参数对象
	 * @param remoteParams
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public RemoteParam getRemoteParam(String remoteParams){
		if(StringUtils.isBlank(remoteParams)){
			return null;
		}
		RemoteParam remoteParam = new RemoteParam();
		try {
		HashMap<String,Object> returnTypeEntity = GsonUtil.getReturnTypeEntity(remoteParams, HashMap.class);
		//设置domainClass
		String domainClass = (String) returnTypeEntity.get("domainClass");
		
		Object newInstance = Class.forName(domainClass).newInstance();
		remoteParam.setDomainClassEntity(newInstance);
		
		//设置 fieldColumns 的值
		List<Map<String,Object>> mapList = (List<Map<String, Object>>) returnTypeEntity.get("fieldColumns");
		List<FieldColumn> fieldColumns = new ArrayList<>();
		for (Map<String, Object> map : mapList) {
			FieldColumn fieldColumn = new FieldColumn();
			fieldColumn.setFieldName((String)map.get("fieldName"));
			fieldColumn.setColModelName((String)map.get("colModelName"));
			fieldColumns.add(fieldColumn);
		}
		remoteParam.setFieldColumns(fieldColumns);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
		return remoteParam;
	}
	
	/**
	 * @param queryParams 查询参数或者jqgrid的查询参数
	 * @param fileName 文件名
	 * @param sqlTemplate sql模板
	 * @param colNameParam 列参数
	 * @param fieldsParam 字段参数
	 * @param remoteParams 远程参数
	 * @param ids 选中的Ids
	 * @param prefix 条件前缀
	 * @param authorityField 权限字段
	 * @param exportTypes 导出类型
	 * @param remoteQueryWhere 远程查询参数
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/jqgrid", method = RequestMethod.POST)
	public @ResponseBody ResponseEntity<byte[]> 
		exportExcel(QueryParams queryParams, String fileName, String sqlTemplate, 
				String colNameParam, String fieldsParam,String remoteParams, String ids, String prefix,
				String authorityField,String exportTypes,String remoteQueryWhere) throws Exception{
			
		sqlTemplate = sqlTemplate.replaceAll("-", "=");//替换破折号为等于号，自定义http参数转义
		prefix = prefix == null ? "" : prefix + ".";
		PageBean pageBean = JqGridUtil.getPageBean(queryParams);
		
		RemoteParam remoteParam = getRemoteParam(remoteParams);
		setAuthorityField(authorityField, pageBean);
		//得到特殊字段
		Map<String, ExportType> specialFields = getSpecialField(exportTypes);
		pageBean.setPropPrefix(prefix);
		
		//查询本地的远程字段,并请求远程获取条件
		PageBean localAndRemotepageBean = new PageBean();
		setAuthorityField(authorityField, localAndRemotepageBean);
		//queryRemoveParam(pageBean,localAndRemotepageBean, sqlTemplate, ids,prefix,remoteQueryWhere);
		
		ExportParam exportParam =  ExportParam.buildExportParam(sqlTemplate, fileName, ids, colNameParam, fieldsParam, pageBean, prefix,remoteParam,specialFields);
		exportParam.setSpecialFields(specialFields);
		return exportService.exportListExcel(exportParam);
	}

	/**
	 * 得到特殊字段
	 * @param exportTypes
	 * @return
	 * @throws IOException
	 * @throws JsonParseException
	 * @throws JsonMappingException
	 */
	@SuppressWarnings("unchecked")
	private Map<String, ExportType> getSpecialField(String exportTypes) throws IOException, JsonParseException, JsonMappingException {
		//导出类型处理
		Map<String,ExportType> specialFields = new HashMap<String,ExportType>();
		if(StringUtils.isNotBlank(exportTypes)){
			ObjectMapper objectMapper = new ObjectMapper();
			List<Map<String, Object>>  list = objectMapper.readValue(exportTypes, ArrayList.class); 
			for (Map<String, Object> obj : list) {
				ExportType exportType = new ExportType();
				exportType.setField(obj.get("field").toString());
				exportType.setType(obj.get("type").toString());
				exportType.setValue(obj.get("value"));
				
				String field = exportType.getField();
				if(exportType.getField().contains(".")){
					field = field.substring(field.lastIndexOf(".") + 1);
				}
				specialFields.put(field, exportType);
			}
		}
		return specialFields;
	}
	
	/**
	 * 通过权限字段设置查询权限
	 * @param authorityField
	 * @param pageBean
	 */
	@SuppressWarnings("unchecked")
	private void setAuthorityField(String authorityField, PageBean pageBean) {
		//导出数据权限
		if(StringUtils.isNotBlank(authorityField)){
			HashMap<String,Object> returnTypeEntity = GsonUtil.getReturnTypeEntity(authorityField, HashMap.class);
			
			List<String> allOrgCode = UserDetailsUtil.getAllOrgCode();
			List<String> allDpermCode = UserDetailsUtil.getAllDpermCode();
			
			String sysOrgCode = (String) returnTypeEntity.get("sys_orgCode");
			String sysPermCode = (String) returnTypeEntity.get("sys_permCode");
			
			if(StringUtils.isNoneBlank(sysOrgCode) && allOrgCode.size()>0){
				pageBean.addCondition(new Condition(sysOrgCode,allOrgCode,Operation.IN));	
			}
			
			if(StringUtils.isNoneBlank(sysPermCode) && allDpermCode.size()>0){
				pageBean.addCondition(new Condition(sysPermCode,allDpermCode,Operation.IN));	
			}
		}
	}
		
	/**
	 * 构建 本地和远程参数公共的查询参数和查询字段
	 * @param sqlTemplate
	 * @param pageBean
	 * @param ids
	 * @return
	 */
    private ExportParam buildLocalAndRemoteExportParam(String sqlTemplate,PageBean pageBean,String ids,String prefix,String localStoreRemoteField){
		if(StringUtils.isEmpty(sqlTemplate)){
			throw new RuntimeException("没有导出语句，无法生成excel文件");
		}
		if(!sqlTemplate.toLowerCase().contains("where")){
			sqlTemplate = sqlTemplate + " where 1=1";
		}
		ExportParam exportParam = new ExportParam();
		exportParam.setFieldsParam(localStoreRemoteField);
		exportParam.setConditions(pageBean.getConditions());
		exportParam.setOrders(pageBean.getOrders());
		exportParam.setHqlTemplate("select " + ExportConsist.FIELDS_TEMPLATE + " " + sqlTemplate);
		exportParam.setIds(ids);
		exportParam.setPrefix(prefix);
		return exportParam;
    }
		
	/**
	 * 查询远程参数
	 * @param pageBean
	 */
	@SuppressWarnings("unchecked")
	/*private void queryRemoveParam(PageBean pageBean,PageBean localAndRemotepageBean,String sqlTemplate,String ids,String prefix,String remoteQueryWhere) {
		
		if(StringUtils.isBlank(remoteQueryWhere)){
			return;
		}
		//远程查询条件(该条件主要是处理搜索远程字段是能正常导出)
		HashMap<String,Object> remoteQuery = GsonUtil.getReturnTypeEntity(remoteQueryWhere, HashMap.class);
		//远程搜索的字段(会与 localSearchField 共用搜索值得字段)
		List<String> remoteSearchField = (List<String>) remoteQuery.get("remoteSearchField");
		//本地所有的字段(会与 remoteSearchField 共用搜索值得字段)
		List<String> localSearchField = (List<String>) remoteQuery.get("localSearchField");
		//本地存储的远程字段
		String localStoreRemoteField = (String) remoteQuery.get("localStoreRemoteField");
		//远程调用的dubbo接口
		String remoteInterfaceClassStr = (String) remoteQuery.get("remoteInterfaceClass");
		//远程调用的dubbo接口的方法(该方法的参数只能是 List<Condition> conditions ,返回值只能是  List<String>)
		String remoteInterfaceMethod = (String) remoteQuery.get("remoteInterfaceMethod");
		
		if(StringUtils.isBlank(remoteInterfaceClassStr)){
			throw new NullPointerException("远程调用的接口类不能为空");
		}
		//远程调用的dubbo接口
		Class<?> remoteInterfaceClass;
		try {
			remoteInterfaceClass = Class.forName(remoteInterfaceClassStr);
		} catch (ClassNotFoundException e) {
			throw new NullPointerException("远程调用的接口类不存在"+e.getMessage());
		}
		
		//远程条件
		List<String> remoteCondition = new ArrayList<>(remoteSearchField);
		//将本地的远程条件删除
		List<Condition> removeCondition = new ArrayList<>();
		//过滤出可以被远程条用的属性
		List<String> filterProperties = new ArrayList<>(remoteSearchField);
		filterProperties.addAll(localSearchField);
		
		List<Condition> conditions = pageBean.getConditions();
		Iterator<Condition> iterator = conditions.iterator();
		
		//远程过滤条件
		List<Condition> remoteInvokeConditions = new ArrayList<>();
		if(conditions != null && !conditions.isEmpty()){
			while(iterator.hasNext()){
				Condition condition = iterator.next();
				if(!filterProperties.contains(condition.getPropertyName())){
					continue;
				}
				//设置远程查询条件
				for (String remoteField : remoteCondition) {
					Condition remoteTempCondition = new Condition();
					BeanUtils.copyNotNullProperties(condition, remoteTempCondition);
					remoteTempCondition.setPropertyName(remoteField);
					remoteTempCondition.setRelateType(RelateType.OR);
					remoteInvokeConditions.add(remoteTempCondition);
				}
				
				//将远程属性的condition删除
				if(remoteCondition.contains(condition.getPropertyName())){
					removeCondition.add(condition);
				}
			}
			//删除远程条件
			for (Condition condition : removeCondition) {
				conditions.remove(condition);
			}
			//远程调用
			if(remoteInvokeConditions != null && !remoteInvokeConditions.isEmpty()){
				//获取要调用的 dobbo reference 代理对象
				Object reference = DubboReferenceConfig.reference(remoteInterfaceClass);
				
				if(reference == null){
					logger.error("不能注入 "+remoteInterfaceClass+" 的dubbo的对象");
					return;
				}
				List<String> zfIds = null;
				try {
					Method method = reference.getClass().getMethod(remoteInterfaceMethod, List.class);
					zfIds = (List<String>) method.invoke(reference, remoteInvokeConditions);
				} catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
					e.printStackTrace();
				}
				ExportParam localRemoteExportParam = buildLocalAndRemoteExportParam(sqlTemplate, localAndRemotepageBean, ids,prefix,localStoreRemoteField);
				List<String> localAndRemoteCommonField = exportService.localAndRemoteCommonField(localRemoteExportParam);
				
				//巧妙地获取 远程拉取的罪犯Id 和本地罪犯id的交集
				Collection<String> collectionIntersection = CollectionUtil.getCollectionIntersection(localAndRemoteCommonField, zfIds);
				zfIds = new ArrayList<>(collectionIntersection);
				
				if(zfIds != null && !zfIds.isEmpty()){
					//当前参数的的操作符 为 IN 的处理
					setPageBeanInCondition(pageBean, RelateType.AND, localStoreRemoteField, zfIds);
					//使用前后括号将当前条件括起来
					bracketCurrentConditions(pageBean);
				}
			}
		}
	}
	*/
	/**
	 * 使用前后括号将当前条件括起来
	 * @param pageBean
	 */
	private void bracketCurrentConditions(PageBean pageBean){
		//为现有添加添加前括号和后括号
		Condition firstCondition = pageBean.getConditions().get(0);
		firstCondition.setPrefixBrackets(true);
		firstCondition.setPreffixBracketsValue(firstCondition.getPreffixBracketsValue()+"(");
		
		Condition lastCondition = pageBean.getConditions().get(pageBean.getConditions().size()-1);
		lastCondition.setSuffixBrackets(true);
		lastCondition.setSuffixBracketsValue(lastCondition.getSuffixBracketsValue()+")");
	}
	
	/**
	 * 当前参数的的操作符 为 IN 的处理
	 * @param pageBean 
	 * @param relateType 条件的关联类型
	 * @param propertyName 条件属性名称
	 * @param propertyValue 条件属性值
	 */
	private void setPageBeanInCondition(PageBean pageBean,RelateType relateType,String propertyName,List<String> propertyValue){
		if(propertyValue == null || propertyValue.size()==0){
			return;
		}
		int count = 100;
		String[] arr = propertyValue.toArray(new String[propertyValue.size()]);
		if(propertyValue.size()< count){
			pageBean.getConditions().add(new Condition(relateType,propertyName, propertyValue, Operation.IN));
		}else{
			for (int i = 0; i < arr.length; i=i+count) {
				if(i == 0){
					pageBean.getConditions().add(new Condition(relateType, propertyName, Arrays.copyOfRange(arr, i, i+count), Operation.IN));
				}else if(propertyValue.size() - i < count){
					pageBean.getConditions().add(new Condition( RelateType.OR, propertyName, Arrays.copyOfRange(arr, i, i+count), Operation.IN,true));
				}else{
					pageBean.getConditions().add(new Condition( RelateType.OR, propertyName, Arrays.copyOfRange(arr, i, i+count), Operation.IN));
				}
			}
		}
	}
}