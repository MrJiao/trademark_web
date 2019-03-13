package com.bjhy.trademark.core.service;

import com.bjhy.trademark.core.domain.TrademarkBean;
import org.apel.gaia.commons.pager.PageBean;
import org.apel.gaia.infrastructure.BizCommonService;

import java.io.File;
import java.io.Serializable;
import java.util.List;

public interface TrademarkBeanService extends BizCommonService<TrademarkBean,String>{


    void update(List<TrademarkBean> trademarkBeanList);

    List<TrademarkBean> findByNames(String annm, List<String> arr);

    List<TrademarkBean> filterTrademarkName(List<TrademarkBean> trademarkBeanList);

    List<TrademarkBean> findByAnnm(String annm);

    PageBean findSameName(String annm, PageBean pageBean);

    void save(Iterable<TrademarkBean> trademarkList);

    void update(Iterable<TrademarkBean> trademarkList);

    void orcGao(List<TrademarkBean> trademarkBeanList);

    TrademarkBean orcGao(TrademarkBean trademarkBean);

    File zipTrademarkBean(List<TrademarkBean> trademarkBeanList, String liushui);

    String filterName(String name);

    String formatterName(String name);

    void deleteByAnnum(String annum);

    TrademarkBean findTopByAnNum(String annum);

    List<TrademarkBean> findByPicEncode(String encode);

    boolean isContains(String id);

    List<String> sortStringCount(List<String> names);

    List<TrademarkBean> findByAnalysisName(String analysisName);

    boolean isFremdness(String address);

    TrademarkBean orcNormal(TrademarkBean trademarkBean);

    void saveCount(String analysName, int size);
}
