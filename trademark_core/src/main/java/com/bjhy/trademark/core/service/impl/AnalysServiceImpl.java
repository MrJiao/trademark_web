package com.bjhy.trademark.core.service.impl;

import com.bjhy.tlevel.datax.common.utils.L;
import com.bjhy.trademark.common.MyEncoding;
import com.bjhy.trademark.common.utils.ChineseUtil;
import com.bjhy.trademark.core.domain.TrademarkBean;
import com.bjhy.trademark.core.pojo.Remark;
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
            String content = FileUtils.readFileToString(file, MyEncoding.getEncode());
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

/*    @Override
    public void trademarkName(String annm,String remark, File file) {
        try {
            List<String> lines = FileUtils.readLines(file, MyEncoding.getEncode());
            List<TrademarkBean> trademarkBeanList = trademarkBeanService.findByAnnm(annm);
            ArrayList<TrademarkBean> updateArr = new ArrayList<>();
            HashMap<String, List<TrademarkBean>> hs = formatterArr(trademarkBeanList);
            for (String line : lines) {
                if(StringUtils.isEmpty(line))continue;
                List<TrademarkBean> trademarkBeanArr = hs.get(line);
                if(trademarkBeanArr==null)continue;
                for (TrademarkBean trademarkBean : trademarkBeanArr) {
                    if(trademarkBean!=null){
                        trademarkBean.setRemark(remark);
                        updateArr.add(trademarkBean);
                    }
                }
            }
            trademarkBeanService.update(updateArr);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }*/

    @Override
    public void trademarkName(Remark remarkObj, File file) {
        try {
            List<String> names = FileUtils.readLines(file, MyEncoding.getEncode());
            for (String name : names) {
                List<TrademarkBean> list = trademarkBeanService.findByAnalysisName(name);
                for (TrademarkBean trademarkBean : list) {

                    setRemark(trademarkBean,remarkObj);
                }
                trademarkBeanService.update(list);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void setRemark(TrademarkBean trademarkBean, Remark remarkObj) {
        String remark1 = remarkObj.getRemark1();
        String remark2 = remarkObj.getRemark2();
        String remark3 = remarkObj.getRemark3();
        if(!StringUtils.isEmpty(remark1))
             trademarkBean.setRemark(remark1);
        if(!StringUtils.isEmpty(remark2))
            trademarkBean.setRemark2(remark2);
        if(!StringUtils.isEmpty(remark3))
            trademarkBean.setRemark3(remark3);
    }

    private HashMap<String, List<TrademarkBean>> formatterArr(List<TrademarkBean> trademarkBeanList) {
        HashMap<String, List<TrademarkBean>> hs = new HashMap<>();
        for (TrademarkBean trademarkBean : trademarkBeanList) {
            String name = trademarkBeanService.formatterName(trademarkBean.getName());
            List<TrademarkBean> trademarkBeans = hs.get(name);
            if(trademarkBeans==null){
                trademarkBeans = new ArrayList<>();
                hs.put(name,trademarkBeans);
            }
            trademarkBeans.add(trademarkBean);
        }
        return hs;
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
