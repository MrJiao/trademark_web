package org.apel.gaia.infrastructure;

import org.apel.gaia.commons.pager.Condition;
import org.apel.gaia.commons.pager.PageBean;
import org.springframework.data.domain.Sort;

import java.io.Serializable;
import java.util.List;

/**
 * 
 * 公用业务接口
 * @author lijian
 *
 * @param <T> 实体对象
 * @param <PK> 实体对象id
 */
public interface BizCommonService<T,PK extends Serializable> {
	
	/**
	 * 根据对象的ID查询对象信息
	 * @param id
	 * 			对象ID
	 * @return
	 * 			返回查询的对象
	 */
	public T findById(PK id);	
	
	
	/**
	 * 查询所有数据
	 */
	public List<T> findAll(Sort sort);
	
	/**
	 * 根据条件查询数据
	 * @param conditions 条件对象
	 */
	public List<T> findByCondition(Condition... conditions);
	
	/**
	 * 保存一个对象
	 * @param entity
	 * 			保存的对象
	 */
	public PK save(T entity);
	
	/**
	 * 修改一个对象
	 * @param entity
	 * 			修改的对象
	 */
	public void update(T entity);
	
	/**
	 * 保存或者修改一个对象
	 * @param entity
	 * 			保存或者修改的对象
	 * @return
	 * 			返回保存或者修改的对象的ID
	 */
	public PK saveOrUpdate(T entity);
	
	/**
	 * 根据ID删除一个或者多个对象
	 * @param ids
	 * 			删除的对象ID数组
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public void deleteById(PK... ids);
	
	
	/**
	 * 分页查询
	 * @param pageBean 分页对象
	 */
	void pageQuery(PageBean pageBean);


	List<T> findByAllId(List<Serializable> ids);

}
