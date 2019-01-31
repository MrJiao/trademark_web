package org.apel.gaia.infrastructure.impl;

import org.apel.gaia.commons.autocomplete.executor.BeanAutoCompleteExecutor;
import org.apel.gaia.commons.autocomplete.generator.id.IdGenerator;
import org.apel.gaia.commons.pager.Condition;
import org.apel.gaia.commons.pager.Order;
import org.apel.gaia.commons.pager.PageBean;
import org.apel.gaia.infrastructure.BizCommonService;
import org.apel.gaia.persist.dao.CommonRepository;
import org.apel.gaia.util.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.persistence.Id;
import java.io.Serializable;
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 公用业务接口抽象实现类
 * @author lijian
 */
//@Component
@Transactional
public abstract class AbstractBizCommonService<T,PK extends Serializable> implements BizCommonService<T, PK>{
	@SuppressWarnings("unchecked")
	protected Class<T> entityClass = (Class<T>)((ParameterizedType)getClass().getGenericSuperclass()).getActualTypeArguments()[0];
	
	//泛型注入
	@Autowired
	private CommonRepository<T, PK> repository;
	
	@Autowired
	private	IdGenerator idGenerator;
	
	/**
	 * 返回实现repository接口的实例对象
	 */
	protected CommonRepository<T, PK> getRepository(){
		return this.repository;
	}
	
	/**
	 * 返回分页ql语句
	 */
	protected String getPageQl(){
		return "from " + entityClass.getSimpleName() + " where 1=1";
	}
	
	@Override
	public T findById(PK id) {
		return getRepository().findOne(id);
	}
	
	@Override
	public List<T> findAll(Sort sort){
		return getRepository().findAll(sort);
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public List<T> findByCondition(Condition... conditions){
		return (List<T>)getRepository().doList(getPageQl(), Arrays.asList(conditions), new ArrayList<Order>(), false);
	}
	
	private Object complete(T record,boolean isUpdate){
		Object id =  BeanAutoCompleteExecutor.complete(record, idGenerator, isUpdate);
		if(id==null){
			Field idField = getIdField(record);
			idField.setAccessible(true);
			try {
				id = idField.get(record);
			} catch (IllegalArgumentException e) {
				e.printStackTrace();
			} catch (IllegalAccessException e) {
				e.printStackTrace();
			}
		}
		return id;
	}

	@SuppressWarnings("unchecked")
	@Override
	public PK save(T entity) {
		Object id = complete(entity,false);
		try {
			getRepository().store(entity);
		}catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException(e.getMessage());
		}
		return (PK) id;
	}
	
	private Field getIdField(T record){
		Class<?> entityClass = record.getClass();
		Field idField = null;
		try {
			idField = entityClass.getDeclaredField("id");
		} catch (NoSuchFieldException | SecurityException e) {
			e.printStackTrace();
		}
		if(idField!=null){
			return idField;
		}
		Field[] filds = entityClass.getDeclaredFields();
		for(Field field:filds){
			Annotation[] Annotations = field.getAnnotations();
			for(Annotation annotation:Annotations){
				if(annotation instanceof Id){
					idField = field;
					break;
				}
			}
		}
		return idField;
	}

	@SuppressWarnings("unchecked")
	@Override
	public void update(T entity) {
		try {
//			Field field = entity.getClass().getDeclaredField("id");
			Field field = getIdField(entity);
			field.setAccessible(true);
			PK id = (PK)field.get(entity);
			T sourceEntity = getRepository().findOne(id);
			BeanUtils.copyNotNullProperties(entity, sourceEntity);
			complete(sourceEntity,true);
			getRepository().update(sourceEntity);
		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException(e);
		} 
	}

	@SuppressWarnings("unchecked")
	@Override
	public PK saveOrUpdate(T entity) {
		try {
//			Field field = entity.getClass().getDeclaredField("id");
			Field field = getIdField(entity);
			field.setAccessible(true);
			PK id = (PK)field.get(entity);
			if(StringUtils.isEmpty(id)){
				return save(entity);
			}else{
				update(entity);
				return id;
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException(e.getMessage());
		}
	}

	@SuppressWarnings("unchecked")
	@Override
	public void deleteById(PK... ids) {
		for (PK pk : ids) {
			getRepository().delete(pk);
		}
	}

	@Override
	public void pageQuery(PageBean pageBean) {
		getRepository().doPager(pageBean, getPageQl());
	}


}
