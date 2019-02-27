package com.bjhy.trademark.data.auto_word;

import org.springframework.stereotype.Component;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Create by: Jackson
 */
@Component
public class WordComponent {

    File rootDir;
    public WordComponent() {
        //获取模板路径
        rootDir = new File(System.getProperty("user.dir"));

    }

    private File getTimplateFile(int index){
        return  new File(rootDir, "config" + File.separator + "source" + File.separator + "template"+index+".docx");
    }

    // File rootDir = new File(System.getProperty(USER_DIR));
    //File platformFile = new File(rootDir,CONFIG + File.separator + PLATFORM_PROPERTIES);

    public boolean autoWord(ArrayList<WordTrademarkBean> wordTrademarkBeanList, File target) {
        try {
            //选择模板
            HashMap<String, String> hs = formatterValues(wordTrademarkBeanList);
            //导出
            WordUtils.replaceAndGenerateWord(getTimplateFile(wordTrademarkBeanList.size()).getAbsolutePath(), target.getAbsolutePath(), hs);
        } catch (Exception e) {
            return false;
        }
        return true;
    }

    private HashMap<String, String> formatterValues(ArrayList<WordTrademarkBean> wordTrademarkBeanList) {
        //设置值
        HashMap<String, String> values = new HashMap<>();
        WordTrademarkBean tt = wordTrademarkBeanList.get(0);
        values.put("$(mark)", tt.getName());//商标名称
        values.put("$(ref)", getRef(wordTrademarkBeanList));//商标名称
        getRef(wordTrademarkBeanList);
        for (int i = 0; i < wordTrademarkBeanList.size(); i++) {
            int index = i+1;
            WordTrademarkBean wordTrademarkBean = wordTrademarkBeanList.get(i);
            values.put("$(publish_date"+index+")", formatterDate(wordTrademarkBean.getAnn_date()));//初审日期
            values.put("$(deadline"+index+")", formatterDate(wordTrademarkBean.getYiyiEndDate()));// 截止期限
            values.put("$(application_date"+index+")", formatterDate(wordTrademarkBean.getApplicationDate()));// 申请时间

            List<WordTrademarkBean.TrademarkType> trademarkTypeList = wordTrademarkBean.getTrademarkType();
            if (trademarkTypeList.size() != 0) {
                values.put("$(clazz"+index+")", getClazz(wordTrademarkBean));// 类别
                values.put("$(goods"+index+")", getGoods(wordTrademarkBean));//商品
            }
            values.put("$(no"+index+")", wordTrademarkBean.getNumber());//商标号

            values.put("$(applicant"+index+")", wordTrademarkBean.getApplicant());//申请人
            values.put("$(application_address"+index+")", wordTrademarkBean.getAddress());//申请地址
        }
        return values;
    }

    private String getGoods(WordTrademarkBean bean) {
        return bean.getType();
    }

    private String getClazz(WordTrademarkBean bean) {
        List<WordTrademarkBean.TrademarkType> trademarkTypeList = bean.getTrademarkType();
        if(trademarkTypeList.size()==0){
            return "没有找到类别";
        }else {
            String s = "";
            for (WordTrademarkBean.TrademarkType trademarkType : trademarkTypeList) {
                s += trademarkType.getTypeNum()+",";
            }
            s = s.substring(0,s.length()-1);
            return s;
        }
    }

    private String getRef(ArrayList<WordTrademarkBean> wordTrademarkBeanList) {
        WordTrademarkBean start = wordTrademarkBeanList.get(0);
        if(wordTrademarkBeanList.size()==1){
            return "AK19" + start.getLiushui();//卷号
        }else {
            WordTrademarkBean end = wordTrademarkBeanList.get(wordTrademarkBeanList.size()-1);
            return "AK19"+ start.getLiushui()+"-"+end.getLiushui();
        }
    }

    Calendar cal = Calendar.getInstance();
    SimpleDateFormat formatter = new SimpleDateFormat("d, yyyy");
    String[] months = {"January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"};

    public String formatterDate(Date date) {

        cal.setTime(date);
        int month = cal.get(Calendar.MONTH);
        String m = months[month];
        String format = formatter.format(date);
        return m + " " + format;

    }


}
