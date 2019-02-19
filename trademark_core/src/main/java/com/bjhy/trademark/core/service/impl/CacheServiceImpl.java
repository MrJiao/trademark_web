package com.bjhy.trademark.core.service.impl;

import com.bjhy.trademark.core.controller.TrademarkBeanController;
import com.bjhy.trademark.core.domain.MyQueryParams;
import com.bjhy.trademark.core.domain.TrademarkBean;
import com.bjhy.trademark.core.service.CacheService;
import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.lang3.StringUtils;
import org.apel.gaia.commons.jqgrid.QueryParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.List;

/**
 * Create by: Jackson
 */
@Component
public class CacheServiceImpl implements CacheService {

    @Override
    public void cacheQuery(String annum, String type, QueryParams queryParams) {
        MyQueryParams myQueryParams = new MyQueryParams();
        try {
            BeanUtils.copyProperties(myQueryParams, queryParams);
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        }
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        request.getSession().setAttribute("type",type);
        request.getSession().setAttribute("params",myQueryParams);
        request.getSession().setAttribute("annum",annum);
    }
    @Autowired
    TrademarkBeanController trademarkBeanController;

    @Override
    public List<TrademarkBean> getTrademarkBeanList() {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String type = (String) request.getSession().getAttribute("type");
        QueryParams queryParams = (QueryParams) request.getSession().getAttribute("params");
        String annum = (String) request.getSession().getAttribute("annum");
        queryParams.setRows(100000);
        queryParams.setPage(1);
        if(StringUtils.equals(type,"list")){
            List items = trademarkBeanController.list(queryParams).getItems();
            return items;
        }else if(StringUtils.equals(type,"sameName")){
            List items =trademarkBeanController.sameName(annum,queryParams).getItems();
            return items;
        }
        return new ArrayList<>();
    }
}
