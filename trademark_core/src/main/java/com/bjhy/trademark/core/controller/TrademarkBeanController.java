package com.bjhy.trademark.core.controller;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.bjhy.trademark.core.TrademarkConfig;
import com.bjhy.trademark.core.service.DownloadService;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.bjhy.trademark.core.domain.TrademarkBean;
import com.bjhy.trademark.core.service.TrademarkBeanService;
import org.apel.gaia.commons.i18n.Message;
import org.apel.gaia.commons.i18n.MessageUtil;
import org.apel.gaia.commons.jqgrid.QueryParams;
import org.apel.gaia.commons.pager.PageBean;
import org.apel.gaia.commons.pager.Condition;
import org.apel.gaia.commons.pager.Operation;
import org.apel.gaia.commons.pager.RelateType;
import org.apel.gaia.util.jqgrid.JqGridUtil;


@Controller
@RequestMapping("/trademarkBean")
public class TrademarkBeanController {
	
	private final static String INDEX_URL = "trademarkBean_index";
	
	@Autowired
	private TrademarkBeanService trademarkBeanService;

	@Autowired
	private TrademarkConfig trademarkConfig;

	//首页
	@RequestMapping(value = "index", method = RequestMethod.GET)
	public String index(){
		return INDEX_URL;
	}
	
	//列表查询
	@RequestMapping
	public @ResponseBody PageBean list(QueryParams queryParams){
		PageBean pageBean = JqGridUtil.getPageBean(queryParams);
		trademarkBeanService.pageQuery(pageBean);
		return pageBean;
	}
	
	//新增
	@RequestMapping(method = RequestMethod.POST)
	public @ResponseBody Message create(TrademarkBean trademarkBean){
		trademarkBeanService.save(trademarkBean);
		return MessageUtil.message("common.create.success");
	}
	
	//查看
	@RequestMapping(value = "/{id}", method = RequestMethod.GET)
	public @ResponseBody TrademarkBean view(@PathVariable String id){
		return trademarkBeanService.findById(id);
	}
	
	//删除
	@RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
	public @ResponseBody Message delete(@PathVariable String id){

		trademarkBeanService.deleteById(id);
		return MessageUtil.message("common.delete.success");
	}
	
	//批量删除
	@RequestMapping(method = RequestMethod.DELETE)
	public @ResponseBody Message batchDelete(@RequestParam("ids[]") String[] ids){
		List<TrademarkBean> allByIds = findAllByIds(ids);
		trademarkBeanService.deleteById(ids);

		return MessageUtil.message("common.delete.success");
	}


	private List<TrademarkBean> findAllByIds(String[] ids){
		List<TrademarkBean> beans =  trademarkBeanService.findByAllId(Arrays.asList(ids));
		return beans;
	}
	
	//查询全部数据
	@RequestMapping(value = "/all", method = RequestMethod.GET)
	public @ResponseBody List<TrademarkBean> getAll(){
		return trademarkBeanService.findAll(new Sort(Direction.DESC, "gmt_create"));
	}
	
	//根据标识字段查询数据
	@RequestMapping(value = "/specifiedFieldQuery", method = RequestMethod.GET)
	public @ResponseBody List<TrademarkBean> specifiedFieldQuery(String id){
		Condition condition = new Condition();
		condition.setRelateType(RelateType.AND);
		condition.setOperation(Operation.CN);
		condition.setPropertyName("id");
		condition.setPropertyValue(id);
		return trademarkBeanService.findByCondition(condition);
	}

	DownloadService downloadService;
	@GetMapping("/trademark_name")
	public ResponseEntity<InputStreamResource> download(@RequestParam("ids[]") String[] ids) throws Exception {
		String tempPath = trademarkConfig.getTempPath();
		File trademarkNameFile = new File(tempPath, "trademarkName.txt");
		List<TrademarkBean> trademarkBeanList = findAllByIds(ids);
		ArrayList<String> names = new ArrayList<>();
		for (TrademarkBean trademarkBean : trademarkBeanList) {
			names.add(trademarkBean.getName());
		}
		FileUtils.writeLines(trademarkNameFile,"gbk",names);
		return downloadService.downloadFile(trademarkNameFile,trademarkNameFile.getName());
	}


	//更新
	@RequestMapping(value = "/{id}", method = RequestMethod.PUT)
	public @ResponseBody
	Message create(@PathVariable String id, TrademarkBean trademarkBean) {
		trademarkBean.setId(id);
		trademarkBeanService.update(trademarkBean);
		return MessageUtil.message("criminalInfo.update.success");
	}
}
