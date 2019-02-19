package com.bjhy.trademark.core.service;

import com.bjhy.trademark.core.domain.TrademarkBean;
import org.apel.gaia.commons.jqgrid.QueryParams;

import java.util.List;

/**
 * Create by: Jackson
 */
public interface CacheService {
    void cacheQuery(String annm, String sameName, QueryParams queryParams);

    List<TrademarkBean> getTrademarkBeanList();
}
