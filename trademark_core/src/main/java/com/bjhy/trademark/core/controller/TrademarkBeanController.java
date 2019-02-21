package com.bjhy.trademark.core.controller;

import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.nio.charset.Charset;
import java.text.SimpleDateFormat;
import java.util.*;

import com.bjhy.trademark.common.MyEncoding;
import com.bjhy.trademark.common.utils.ChineseUtil;
import com.bjhy.trademark.core.TrademarkConfig;
import com.bjhy.trademark.core.service.CacheService;
import com.bjhy.trademark.core.service.DownloadService;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
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


	@Autowired
	CacheService cacheService;

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
		cacheService.cacheQuery("", "list",queryParams);
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

	//删除
	@RequestMapping(value = "all", method = RequestMethod.DELETE)
	public @ResponseBody Message deleteAll(@RequestParam("anNum") String anNum){
		File annumFolder = new File(trademarkConfig.getStorePath(),anNum);
		try {
			if(annumFolder.exists()){
				FileUtils.deleteDirectory(annumFolder);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		trademarkBeanService.deleteByAnnum(anNum);

		File tempFolder = new File(trademarkConfig.getTempPath());
		if(tempFolder.exists()){
			try {
				FileUtils.deleteDirectory(tempFolder);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		tempFolder.mkdirs();
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
		List<TrademarkBean> list = trademarkBeanService.findByCondition(condition);
		return list;
	}

	//TODO 不能多人同时使用,文件会被覆盖
	@Autowired
	DownloadService downloadService;
	@RequestMapping(value = "/trademark_name",method = RequestMethod.GET)
	public ResponseEntity<InputStreamResource> download(@RequestParam("ids[]") String[] ids) throws Exception {
		String tempPath = trademarkConfig.getTempPath();
		File trademarkNameFile = new File(tempPath, "trademarkName.txt");
		List<TrademarkBean> trademarkBeanList = findAllByIds(ids);
		trademarkBeanList = trademarkBeanService.filterTrademarkName(trademarkBeanList);
		HashSet<String> names = new HashSet<>();
		for (TrademarkBean trademarkBean : trademarkBeanList) {
			String name = trademarkBeanService.formatterName(trademarkBean.getName());
			names.add(name);
		}
		FileUtils.writeLines(trademarkNameFile, MyEncoding.getEncode(),names);
		return downloadService.downloadFile(trademarkNameFile,trademarkNameFile.getName());
	}


	@RequestMapping(value = "/trademark_all_name",method = RequestMethod.GET)
	public ResponseEntity<InputStreamResource> downloadNames() throws Exception {
		String tempPath = trademarkConfig.getTempPath();

		List<TrademarkBean> trademarkBeanList = cacheService.getTrademarkBeanList();
		trademarkBeanList = trademarkBeanService.filterTrademarkName(trademarkBeanList);
		List<String> names = new ArrayList<>();
		for (TrademarkBean trademarkBean : trademarkBeanList) {
			String name = trademarkBeanService.formatterName(trademarkBean.getName());
			names.add(name);
		}
		names = trademarkBeanService.sortStringCount(names);
		File trademarkNameFile = new File(tempPath, "商标名称"+dateFormat.format(new Date())+".txt");
		FileUtils.writeLines(trademarkNameFile, MyEncoding.getEncode(),names);
		return downloadService.downloadFile(trademarkNameFile,trademarkNameFile.getName());
	}

	//TODO 不能多人同时使用,文件会被覆盖
	@GetMapping("/trademark_zip")
	public ResponseEntity<InputStreamResource> downloadZip(@RequestParam("ids[]") String[] ids,String liushui) throws Exception {
		List<TrademarkBean> list = trademarkBeanService.findByAllId(Arrays.asList(ids));
		sortName(list);
		File zipFile = trademarkBeanService.zipTrademarkBean(list,liushui);
		return downloadService.downloadFile(zipFile,zipFile.getName());
	}

	@GetMapping("/trademark_all_zip")
	public ResponseEntity<InputStreamResource> downloadAllZip(String liushui) throws Exception {
		List<TrademarkBean> list = cacheService.getTrademarkBeanList();
		sortName(list);
		File zipFile = trademarkBeanService.zipTrademarkBean(list,liushui);
		return downloadService.downloadFile(zipFile,zipFile.getName());
	}

	SimpleDateFormat dateFormat =  new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

	@GetMapping("/trademark_all_number")
	public ResponseEntity<InputStreamResource> downloadAllNumber() throws Exception {
		List<TrademarkBean> list = cacheService.getTrademarkBeanList();
		ArrayList<String> arr = new ArrayList<>();
		for (TrademarkBean trademarkBean : list) {
			arr.add(trademarkBean.getNumber());
		}
		String tempPath = trademarkConfig.getTempPath();
		File file = new File(tempPath, "商标号"+dateFormat.format(new Date())+".txt");
		FileUtils.writeLines(file,MyEncoding.getEncode(),arr);
		return downloadService.downloadFile(file,file.getName());
	}


	private void sortName(List<TrademarkBean> list) {
		Collections.sort(list, new Comparator<TrademarkBean>() {
			@Override
			public int compare(TrademarkBean o1, TrademarkBean o2) {
				if(StringUtils.isEmpty(o1.getName())||StringUtils.isEmpty(o2.getName()))return -1;
				return o1.getName().compareTo(o2.getName());
			}
		});
	}


	//更新
	@RequestMapping(value = "/{id}", method = RequestMethod.PUT)
	public @ResponseBody
	Message create(@PathVariable String id, TrademarkBean trademarkBean) {
		trademarkBean.setId(id);
		TrademarkBean bean = trademarkBeanService.findById(id);
		trademarkBean.setPicPath(bean.getPicPath());
		trademarkBean.setPastePicPath(bean.getPastePicPath());
		trademarkBean.setDataPicPath(bean.getPastePicPath());
		trademarkBean.setAnalysType(bean.getAnalysType());
		trademarkBeanService.update(trademarkBean);
		return MessageUtil.message("common.update.success");
	}

	@RequestMapping(value = "/sameName/{annm}", method = RequestMethod.GET)
	public @ResponseBody PageBean sameName(@PathVariable String annm,QueryParams queryParams){
		PageBean pageBean = JqGridUtil.getPageBean(queryParams);
		trademarkBeanService.findSameName(annm,pageBean);
		List<Object> items = pageBean.getItems();
		//removeTuxingAndChinese(items);
		cacheService.cacheQuery(annm,"sameName",queryParams);
		return pageBean;
	}

	private void removeTuxingAndChinese(List<Object> items) {
		ListIterator<Object> iterator = items.listIterator();
		while (iterator.hasNext()){
			TrademarkBean bean = (TrademarkBean) iterator.next();
			if(ChineseUtil.isChinese(bean.getName())){
				iterator.remove();
			}
		}
	}


	@GetMapping("/image/{id}")
	public ResponseEntity<InputStreamResource> getImage(@PathVariable String id) throws Exception {
		TrademarkBean trademarkBean = trademarkBeanService.findById(id);
		return downloadService.downloadFile(new File(trademarkBean.getPastePicPath()),trademarkBean.getName());
	}

	@RequestMapping(value = "/gao",method = RequestMethod.PUT)
	public @ResponseBody Message gao(@RequestParam("ids[]") String[] ids) throws Exception {
		List<Serializable> strings = Arrays.asList(ids);
		List<TrademarkBean> trademarkBeanList = trademarkBeanService.findByAllId(strings);
		trademarkBeanService.orcGao(trademarkBeanList);
		return MessageUtil.message("common.update.success");
	}

	@RequestMapping(value = "/gao/{id}",method = RequestMethod.PUT)
	public @ResponseBody TrademarkBean gao(@PathVariable String id) {
		TrademarkBean trademarkBean = trademarkBeanService.findById(id);
		TrademarkBean bean = trademarkBeanService.orcGao(trademarkBean);
		return bean;
	}

	@RequestMapping(value = "/test",method = RequestMethod.GET)
	public @ResponseBody String test() {
		boolean b = trademarkBeanService.isContains("322");
		return b+"";
	}


}
