package com.bjhy.trademark.core.utils;

import com.bjhy.trademark.core.domain.TrademarkBean;
import org.apache.commons.lang3.StringUtils;

import java.io.File;
import java.util.Date;

/**
 * Create by: Jackson
 */
public class BeanUtil {


    public static TrademarkBean matchPicData(TrademarkBean trademarkBean, TrademarkBean picData) {
        if(!StringUtils.equals(trademarkBean.getNumber(),picData.getNumber())){//如果不相等就清空图片数据
            picData = new TrademarkBean();
        }
        trademarkBean.setClient(picData.getClient());
        trademarkBean.setRepresentatives(picData.getRepresentatives());
        trademarkBean.setEmail(picData.getEmail());
        trademarkBean.setAnalysType(picData.getAnalysType());
        trademarkBean.setChoosedType(picData.getChoosedType());
        trademarkBean.setYiyiStartDate(picData.getYiyiStartDate());
        trademarkBean.setYiyiEndDate(picData.getYiyiEndDate());
        trademarkBean.setApplicationDate(picData.getApplicationDate());
        trademarkBean.setAddress(picData.getAddress());
        trademarkBean.setAgency(picData.getAgency());
        trademarkBean.setType(picData.getType());
        trademarkBean.setPicEncode(picData.getPicEncode());

        trademarkBean.setPastePicPath(picData.getPastePicPath());
        trademarkBean.setUrl(picData.getUrl());
        trademarkBean.setPicPath(picData.getPicPath());
        trademarkBean.setDataPicPath(picData.getDataPicPath());
        return trademarkBean;
    }


    public static TrademarkBean matchPicData2(TrademarkBean trademarkBean, TrademarkBean picData) {
        if(!StringUtils.equals(trademarkBean.getNumber(),picData.getNumber())){//如果不相等就清空图片数据
            picData = new TrademarkBean();
        }
        trademarkBean.setClient(picData.getClient());
        trademarkBean.setRepresentatives(picData.getRepresentatives());
        trademarkBean.setEmail(picData.getEmail());
        trademarkBean.setAnalysType(picData.getAnalysType());
        trademarkBean.setChoosedType(picData.getChoosedType());
        trademarkBean.setYiyiStartDate(picData.getYiyiStartDate());
        trademarkBean.setYiyiEndDate(picData.getYiyiEndDate());
        trademarkBean.setApplicationDate(picData.getApplicationDate());
        trademarkBean.setAddress(picData.getAddress());
        trademarkBean.setAgency(picData.getAgency());
        trademarkBean.setType(picData.getType());
        trademarkBean.setPicEncode(picData.getPicEncode());
        return trademarkBean;
    }

}
