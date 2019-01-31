package org.apel.gaia.infrastructure;

import org.apel.gaia.infrastructure.domain.ExportParam;
import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * 导出excel业务接口
 * @author lijian
 *
 */
public interface ExportService {

	/**
	 * @param hql 查询的语句
	 * @param conditions 查询条件
	 * @param orders 排序的条件
	 * @param colNameParam 列表头的名称
	 * @param fieldsParam 字段名称
	 * @return
	 */
	public ResponseEntity<byte[]> exportListExcel(ExportParam exportParam);
	
	/**
	 * 本地数据库与远程公共的字段,该字段有且只有一个
	 * @return
	 */
	public List<String> localAndRemoteCommonField(ExportParam exportParam);

}
