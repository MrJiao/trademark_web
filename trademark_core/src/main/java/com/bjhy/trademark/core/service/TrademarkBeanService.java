package com.bjhy.trademark.core.service;

import com.bjhy.trademark.core.domain.TrademarkBean;
import org.apel.gaia.commons.pager.PageBean;
import org.apel.gaia.infrastructure.BizCommonService;

import java.util.List;

public interface TrademarkBeanService extends BizCommonService<TrademarkBean,String>{


    void update(List<TrademarkBean> trademarkBeanList);

    List<TrademarkBean> findByNames(String annm, List<String> arr);

    List<TrademarkBean> filterTrademarkName(List<TrademarkBean> trademarkBeanList);

    List<TrademarkBean> findByAnnm(String annm);

    PageBean findSameName(String annm, PageBean pageBean);
}