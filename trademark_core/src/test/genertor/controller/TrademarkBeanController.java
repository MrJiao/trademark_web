package com.bjhy.trademark.core.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

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
	
	//更新
	@RequestMapping(value = "/{id}", method = RequestMethod.PUT)
	public @ResponseBody Message create(@PathVariable String id, TrademarkBean trademarkBean){
		trademarkBean.setId(id);
		trademarkBeanService.update(trademarkBean);
		return MessageUtil.message("common.update.success");
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
		trademarkBeanService.deleteById(ids);
		return MessageUtil.message("common.delete.success");
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
	
}
