package com.bjhy.trademark.core.controller;

import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.nio.charset.Charset;
import java.text.SimpleDateFormat;
import java.util.*;

import com.bjhy.trademark.common.MyEncoding;
import com.bjhy.trademark.common.RootPath;
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
		boolean ismkdir = tempFolder.mkdirs();
		return MessageUtil.message("common.delete.success");
	}
	
	//批量删除
	@RequestMapping(method = RequestMethod.DELETE)
	public @ResponseBody Message batchDelete(@RequestParam("ids[]") String[] ids){
		List<TrademarkBean> trademarkBeanList = findAllByIds(ids);
		for (TrademarkBean trademarkBean : trademarkBeanList) {
			deleteFile(trademarkBean.getDataPicPath());
			deleteFile(trademarkBean.getPicPath());
			deleteFile(trademarkBean.getPastePicPath());
		}
		trademarkBeanService.deleteById(ids);
		return MessageUtil.message("common.delete.success");
	}

	private void deleteFile(String path){
		if(StringUtils.isEmpty(path))return;
		File file = new File(path);
		if(file.exists()){
			boolean isDelete =  file.delete();
		}
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
		File trademarkNameFile = new File(tempPath, "商标名称"+dateFormat.format(new Date())+".txt");
		List<TrademarkBean> trademarkBeanList = findAllByIds(ids);
		trademarkBeanList = trademarkBeanService.filterTrademarkName(trademarkBeanList);
		HashSet<String> names = new HashSet<>();
		for (TrademarkBean trademarkBean : trademarkBeanList) {
			names.add(trademarkBean.getAnalysisName());
		}
		ArrayList<String> arr = new ArrayList<>();
		arr.addAll(names);
		sortStrName(arr);
		FileUtils.writeLines(trademarkNameFile, MyEncoding.getEncode(),arr);
		return downloadService.downloadFile(trademarkNameFile,trademarkNameFile.getName());
	}

	@RequestMapping(value = "/trademark_all_name",method = RequestMethod.GET)
	public ResponseEntity<InputStreamResource> downloadNames() throws Exception {
		String tempPath = trademarkConfig.getTempPath();

		List<TrademarkBean> trademarkBeanList = cacheService.getTrademarkBeanList();
		trademarkBeanList = trademarkBeanService.filterTrademarkName(trademarkBeanList);
		HashSet<String> names = new HashSet<>();
		for (TrademarkBean trademarkBean : trademarkBeanList) {
			names.add(trademarkBean.getAnalysisName());
		}
		ArrayList<String> arr = new ArrayList<>();
		arr.addAll(names);
		sortStrName(arr);
		File trademarkNameFile = new File(tempPath, "商标名称"+dateFormat.format(new Date())+".txt");
		FileUtils.writeLines(trademarkNameFile, MyEncoding.getEncode(),arr);
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

	SimpleDateFormat dateFormat =  new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss");

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

	private void sortStrName(List<String> list) {
		Collections.sort(list, new Comparator<String>() {
			@Override
			public int compare(String o1, String o2) {
				if(StringUtils.isEmpty(o1)||StringUtils.isEmpty(o2))return -1;
				return o1.compareTo(o2);
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
		trademarkBean.setAnalysisCount(bean.getAnalysisCount());
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

	@GetMapping("/image/{id}")
	public ResponseEntity<InputStreamResource> getImage(@PathVariable String id) throws Exception {
		TrademarkBean trademarkBean = trademarkBeanService.findById(id);
		if(StringUtils.isEmpty(trademarkBean.getPastePicPath())){
			return downloadService.downloadFile(new File(RootPath.getSourcePath(),"notfound.jpg"),"notfound.jpg");
		}
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


	@RequestMapping(value = "/normal/{id}",method = RequestMethod.PUT)
	public @ResponseBody TrademarkBean normal(@PathVariable String id) {
		TrademarkBean trademarkBean = trademarkBeanService.findById(id);
		TrademarkBean bean = trademarkBeanService.orcNormal(trademarkBean);
		return bean;
	}


	@RequestMapping(value = "/test",method = RequestMethod.GET)
	public @ResponseBody String test() {
		boolean b = trademarkBeanService.isContains("322");
		return b+"";
	}


	Thread b;
	@RequestMapping(value = "/temp", method = RequestMethod.GET)
	public @ResponseBody String temp(QueryParams queryParams){
		b = new Thread(){
			@Override
			public void run() {
				PageBean pageBean = JqGridUtil.getPageBean(queryParams);
				pageBean.setRowsPerPage(1000);
				trademarkBeanService.pageQuery(pageBean);
				int totalPages = pageBean.getTotalPages();
				List<Object> items = pageBean.getItems();
				ArrayList<TrademarkBean> arr = new ArrayList<>();
				for (Object item : items) {
					TrademarkBean trademarkBean = (TrademarkBean) item;
					if(!StringUtils.isEmpty(trademarkBean.getAnalysisName()))continue;
					String name = trademarkBean.getName();
					name = trademarkBeanService.filterName(name);
					if(StringUtils.isEmpty(name))
						continue;
					name =  trademarkBeanService.formatterName(name);
					trademarkBean.setAnalysisName(name);
					arr.add(trademarkBean);
				}
				trademarkBeanService.update(arr);
				for (int currentPage = 2; currentPage < totalPages; currentPage++) {
					ArrayList<TrademarkBean> arr2 = new ArrayList<>();
					pageBean.setCurrentPage(currentPage);
					trademarkBeanService.pageQuery(pageBean);
					List<Object> items2 = pageBean.getItems();
					for (Object item : items2) {
						TrademarkBean trademarkBean = (TrademarkBean) item;
						if(!StringUtils.isEmpty(trademarkBean.getAnalysisName()))continue;
						String name = trademarkBean.getName();
						name = trademarkBeanService.filterName(name);
						if(StringUtils.isEmpty(name))
							continue;
						name =  trademarkBeanService.formatterName(name);
						trademarkBean.setAnalysisName(name);
						arr2.add(trademarkBean);
					}
					trademarkBeanService.update(arr2);
				}
			}
		};
		b.start();
		return "ok";
	}
	Thread c;
	@RequestMapping(value = "/temp2", method = RequestMethod.GET)
	public @ResponseBody String show(QueryParams queryParams){
		c = new Thread(){
			@Override
			public void run() {
				PageBean pageBean = JqGridUtil.getPageBean(queryParams);
				pageBean.setRowsPerPage(50000);
				Condition condi = new Condition("number", Operation.EQ);
				condi.setPropertyValue("1636");
				pageBean.setConditions(Arrays.asList(condi));
				trademarkBeanService.pageQuery(pageBean);
				int totalPages = pageBean.getTotalPages();
				List<Object> items = pageBean.getItems();
				HashMap<String, List<TrademarkBean>> hm = new HashMap<>();
				for (Object item : items) {
					TrademarkBean trademarkBean = (TrademarkBean) item;
					if(StringUtils.isEmpty(trademarkBean.getAnalysisName()))continue;
					List<TrademarkBean> trademarkBeanList = hm.get(trademarkBean.getAnalysisName());
					if(trademarkBeanList==null){
						trademarkBeanList = new ArrayList<>();
						hm.put(trademarkBean.getAnalysisName(),trademarkBeanList);
					}
					trademarkBeanList.add(trademarkBean);
				}
				List<TrademarkBean> arr = new ArrayList<>();
				for (Map.Entry<String, List<TrademarkBean>> entry : hm.entrySet()) {
					List<TrademarkBean> value = entry.getValue();

					for (TrademarkBean trademarkBean : value) {
						trademarkBean.setAnalysisCount(value.size());
						if(value.size()<=5){
							arr.add(trademarkBean);
						}
					}
					if (value.size() > 5) {
						trademarkBeanService.update(value);
					}

				}
				trademarkBeanService.update(arr);
			}
		};
		c.start();
		return "ok";
	}

	Thread a;
	@RequestMapping(value = "/temp3", method = RequestMethod.GET)
	public @ResponseBody String temp3(QueryParams queryParams){
		a=new Thread(){
			@Override
			public void run() {
				PageBean pageBean = JqGridUtil.getPageBean(queryParams);
				pageBean.setRowsPerPage(1000);
				Condition condi = new Condition("number", Operation.EQ);
				condi.setPropertyValue("1636");
				pageBean.setConditions(Arrays.asList(condi));
				trademarkBeanService.pageQuery(pageBean);
				int totalPages = pageBean.getTotalPages();
				List<Object> items = pageBean.getItems();
				ArrayList<TrademarkBean> arr = new ArrayList<>();
				for (Object item : items) {
					TrademarkBean trademarkBean = (TrademarkBean) item;
					if(!StringUtils.isEmpty(trademarkBean.getForeign()))continue;
					String address = trademarkBean.getAddress();
					if(trademarkBeanService.isFremdness(address)){
						trademarkBean.setForeign("是");
						arr.add(trademarkBean);
					}else {
						trademarkBean.setForeign("否");
						arr.add(trademarkBean);
					}
				}
				trademarkBeanService.update(arr);
				for (int currentPage = 2; currentPage < totalPages; currentPage++) {
					pageBean.setCurrentPage(currentPage);
					trademarkBeanService.pageQuery(pageBean);
					List<Object> items2 = pageBean.getItems();
					ArrayList<TrademarkBean> arr2 = new ArrayList<>();
					for (Object item : items2) {
						TrademarkBean trademarkBean = (TrademarkBean) item;
						if(!StringUtils.isEmpty(trademarkBean.getForeign()))continue;
						String address = trademarkBean.getAddress();
						if(trademarkBeanService.isFremdness(address)){
							trademarkBean.setForeign("是");
							arr2.add(trademarkBean);
						}else {
							trademarkBean.setForeign("否");
							arr2.add(trademarkBean);
						}
					}
					trademarkBeanService.update(arr2);
				}
			}
		};
		a.start();
		return "ok";
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


}
