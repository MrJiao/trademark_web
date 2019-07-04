package com.bjhy.trademark.core.service.impl;

import com.bjhy.trademark.core.domain.TrademarkBean;

import java.util.Comparator;
import java.util.List;

/**
 * Create by: Jackson
 */
public class LeiBieAndmOrder implements Comparator<TrademarkBean> {

    @Override
    public int compare(TrademarkBean o1, TrademarkBean o2) {
        if(o1.getmOrder()!=null && o2.getmOrder()!=null){
            return o1.getmOrder()-o2.getmOrder();
        }else if(o1.getmOrder()!=null){
            return -1;
        }else if (o2.getmOrder()!=null){
            return 1;
        }else {
            List<TrademarkBean.TrademarkType> trademarkTypeList1 = o1.getTrademarkType();
            if(trademarkTypeList1.size()>1)return -1;
            List<TrademarkBean.TrademarkType> trademarkTypeList2 = o2.getTrademarkType();
            if(trademarkTypeList2.size()>1)return -1;
            if(trademarkTypeList1.size()==0)return -1;
            if(trademarkTypeList2.size()==0)return 1;
            TrademarkBean.TrademarkType type1 = trademarkTypeList1.get(0);
            TrademarkBean.TrademarkType type2 = trademarkTypeList2.get(0);
            return type1.getTypeNum()-type2.getTypeNum();
        }

    }
}