package com.bjhy.trademark.core.convert;

import com.bjhy.tlevel.datax.common.utils.L;
import com.bjhy.trademark.core.domain.TrademarkBean;
import com.bjhy.trademark.data.pic_orc.domain.OrcData;
import org.apache.commons.lang3.StringUtils;

import javax.sql.rowset.serial.SerialBlob;
import java.io.Serializable;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Create by: Jackson
 */
public class ConvertUtil {

    static SimpleDateFormat formatter = new SimpleDateFormat("yy年MM月dd日");

    public static boolean convert(OrcData orcData, TrademarkBean trademarkBean) {
        if(orcData==null || trademarkBean==null)return false;
        try {
            List<OrcData.WordsResultBean> words_result = orcData.getWords_result();
            for (OrcData.WordsResultBean bean : words_result) {
                String words = bean.getWords();
                words = words.replaceAll(" ","");
                if(words.matches("第\\d+期商标公告")){
                    String anNum = getAnNum(words);
                    trademarkBean.setAnNum(anNum);
                    continue;
                }

                if(words.matches("第\\s*(?<value>\\d+)\\s*号")){
                    String num = getNum(words);
                    trademarkBean.setNumber(num);
                    trademarkBean.setId(num);
                    continue;
                }

                if(words.matches("申请日期\\s*\\d+年\\s*\\d+月\\s*\\d+日")){
                    words = words.replaceAll(" ","");
                    words = words.substring(4);
                    trademarkBean.setApplicationDate(formatter.parse(words));
                }

                if(words.contains("异议期限自")){
                    Date start = getYiyiStart(words);
                    Date end = getYiyiEnd(words);
                    trademarkBean.setYiyiStartDate(start);
                    trademarkBean.setYiyiEndDate(end);
                }
            }

            String applicant = getMulMsg(words_result,"申请人","地址");
            trademarkBean.setApplicant(applicant);

            if(hasAgency(words_result)){
                String address = getMulMsg(words_result,"地址","代理机构");
                trademarkBean.setAddress(address);

                String agency = getMulMsg(words_result,"代理机构","核定使用商品/服务项目");
                trademarkBean.setAgency(agency);
            }else {
                String address = getMulMsg(words_result,"地址","核定使用商品/服务项目");
                trademarkBean.setAddress(address);
            }
            String type = getMulMsg(words_result,"核定使用商品/服务项目","&*(^123");
            trademarkBean.setType(type);
        }catch (Exception e){
            L.e("解析失败",e.getMessage());
            return false;
        }
        return true;
    }

    private static boolean hasAgency(List<OrcData.WordsResultBean> words_result) {
        for (OrcData.WordsResultBean wordsResultBean : words_result) {
            if(StringUtils.contains(wordsResultBean.getWords(),"代理机构")){
                return true;
            }
        }
        return false;
    }

    private static Date getYiyiStart(String words) throws ParseException {
        Pattern pattern = Pattern.compile("\\d+年\\d+月\\d+日至");
        Matcher matcher = pattern.matcher(words);
        if(matcher.find()){
            String group = matcher.group();
            String num = group.substring(0,group.length()-1);
            return formatter.parse(num);
        }
        return null;
    }

    private static Date getYiyiEnd(String words) throws ParseException {
        Pattern pattern = Pattern.compile("\\d+年\\d+月\\d+日止");
        Matcher matcher = pattern.matcher(words);
        if(matcher.find()){
            String group = matcher.group();
            String num = group.substring(0,group.length()-1);
            return formatter.parse(num);
        }
        return null;
    }

    private static String getMulMsg(List<OrcData.WordsResultBean> words_result,String start,String end) {
        String words="";
        for (int i = 0; i < words_result.size(); i++) {
            OrcData.WordsResultBean bean = words_result.get(i);
            words = bean.getWords();
            if(StringUtils.contains(words,start)){
                words = words.replaceAll(start, "");

                for (int j = i+1; j < words_result.size(); j++) {
                    String w = words_result.get(j).getWords();
                    if(StringUtils.contains(w,end)){
                        return words;
                    }
                    words = words+w;
                }
                return words.replaceAll(" ","");
            }
        }
        return words.replaceAll(" ","");
    }


    private static String getNum(String words) {
        Pattern pattern = Pattern.compile("第\\s*(?<value>\\d+)\\s*号");
        Matcher matcher = pattern.matcher(words);
        if(matcher.find()){
            String num = matcher.group("value");
            return num;
        }
        return "";
    }

    private static  String getAnNum(String words){
        Pattern pattern = Pattern.compile("第\\d+期");
        Matcher matcher = pattern.matcher(words);
        if(matcher.find()){
            String group = matcher.group();
            String anNum = group.substring(1,group.length()-1);
            return anNum;
        }
        return "";
    }

    public static List<Serializable> convert(List<String> list){
        ArrayList<Serializable> arr = new ArrayList<>();
        for (Serializable s : list) {
            arr.add(s);
        }
        return arr;
    }

}
