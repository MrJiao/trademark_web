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

    File wordTemplateFile;

    public WordComponent() {
        //获取模板路径
        File rootDir = new File(System.getProperty("user.dir"));
        wordTemplateFile = new File(rootDir, "config" + File.separator + "source" + File.separator + "template.docx");
    }

    // File rootDir = new File(System.getProperty(USER_DIR));
    //File platformFile = new File(rootDir,CONFIG + File.separator + PLATFORM_PROPERTIES);

    public boolean autoWord(WordTrademarkBean wordTrademarkBean, File target, int liushui) {
        try {
            //选择模板
            HashMap<String, String> hs = formatterValues(wordTrademarkBean, liushui);
            //导出
            WordUtils.replaceAndGenerateWord(wordTemplateFile.getAbsolutePath(), target.getAbsolutePath(), hs);
        } catch (Exception e) {
            return false;
        }
        return true;
    }

    private HashMap<String, String> formatterValues(WordTrademarkBean wordTrademarkBean, int liushui) {
        //设置值
        HashMap<String, String> values = new HashMap<>();
        values.put("$(publish_date)", formatterDate(wordTrademarkBean.getAnn_date()));//初审日期
        values.put("$(deadline)", formatterDate(wordTrademarkBean.getYiyiEndDate()));// 截止期限
        values.put("$(application_date)", formatterDate(wordTrademarkBean.getApplicationDate()));// 申请时间

        values.put("$(mark)", wordTrademarkBean.getName());//商标名称


        List<WordTrademarkBean.TrademarkType> trademarkTypeList = wordTrademarkBean.getTrademarkType();

        if (trademarkTypeList.size() != 0) {
            if (trademarkTypeList.size() == 1) {
                WordTrademarkBean.TrademarkType trademarkType = trademarkTypeList.get(0);
                values.put("$(clazz)", trademarkType.getTypeNum() + "");// 类别
                List<String> type = trademarkType.getType();
                String s = "";
                for (String t : type) {
                    s += t + ";";
                }
                values.put("$(goods)", s);//商品
            } else {
                values.put("$(goods)", wordTrademarkBean.getType());//商品
            }
        }
        values.put("$(no)", wordTrademarkBean.getNumber());//商标号
        values.put("$(ref)", "AK19" + liushui);//卷号
        values.put("$(applicant)", wordTrademarkBean.getApplicant());//申请人
        values.put("$(application_address)", wordTrademarkBean.getAddress());//申请地址
        return values;
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
