package com.bjhy.trademark.core.service.impl;

import com.bjhy.tlevel.datax.common.utils.L;
import com.bjhy.trademark.common.utils.ChineseUtil;
import com.bjhy.trademark.core.domain.TrademarkBean;
import com.bjhy.trademark.core.pojo.TrademarkData;
import com.bjhy.trademark.core.service.AnalysService;
import com.bjhy.trademark.core.service.TrademarkBeanService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.nio.charset.Charset;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.ListIterator;

/**
 * Create by: Jackson
 */
@Transactional
@Service
public class AnalysServiceImpl implements AnalysService {


    @Autowired
    TrademarkBeanService trademarkBeanService;

    ObjectMapper mapper = new ObjectMapper();
    @Override
    public void trademarkData(File file) {
        try {
            String content = FileUtils.readFileToString(file, Charset.defaultCharset());
            String[] jsonObjStr = content.split(";");

            for (String str : jsonObjStr) {
                TrademarkData trademarkData = mapper.readValue(str, TrademarkData.class);
                List<TrademarkData.RowsBean> rows = trademarkData.getRows();
                List<Serializable> ids = getIds(rows);
                List<TrademarkBean> trademarkBeanList = trademarkBeanService.findByAllId(ids);
                setValue(trademarkBeanList,rows);
                trademarkBeanService.update(trademarkBeanList);
            }


        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void trademarkName(String annm, File file) {
        try {
            List<String> lines = FileUtils.readLines(file, Charset.defaultCharset());
            List<TrademarkBean> trademarkBeanList = trademarkBeanService.findByAnnm(annm);
            HashMap<String, TrademarkBean> hs = new HashMap<>();
            for (TrademarkBean trademarkBean : trademarkBeanList) {
                hs.put(ChineseUtil.removeChinese(trademarkBean.getName()),trademarkBean);
            }
            for (String line : lines) {
                TrademarkBean trademarkBean = hs.get(line);
                trademarkBean.setRemark("通过粗筛");
            }
            trademarkBeanService.update(trademarkBeanList);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");

    private void setValue(List<TrademarkBean> trademarkBeanList, List<TrademarkData.RowsBean> rows) {
        ArrayList<TrademarkBean> arr = new ArrayList<>();
        arr.addAll(trademarkBeanList);
        for (TrademarkData.RowsBean row : rows) {

            ListIterator<TrademarkBean> trademarkBeanListIterator = arr.listIterator();

            while (trademarkBeanListIterator.hasNext()){
                TrademarkBean next = trademarkBeanListIterator.next();

                if(StringUtils.equals(next.getNumber(),row.getReg_num())){
                    try {
                        next.setAnn_date(formatter.parse(row.getAnn_date()));//公告日期
                    } catch (ParseException e) {
                        L.e("解析公告日期错误 商标号",next.getNumber());
                        L.exception(e);
                    }
                    next.setPage_no(row.getPage_no());//页码
                    next.setApplicant(row.getRegname());//申请人
                    next.setAnNum(row.getAnn_num());//期号
                    next.setName(row.getTmname());//商标名称
                    trademarkBeanListIterator.remove();
                    break;
                }
            }
        }
    }

    private List<Serializable> getIds(List<TrademarkData.RowsBean> rows) {
        ArrayList<Serializable> arr = new ArrayList<>();
        for (TrademarkData.RowsBean row : rows) {
            arr.add(row.getReg_num());
        }
        return arr;
    }


}
