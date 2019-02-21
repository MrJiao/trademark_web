package com.bjhy.trademark.data.auto_word;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Create by: Jackson
 */
public class WordTrademarkBean {


    String id;//
    Integer page_no;
    String number;//
    String anNum;//
    Date applicationDate;//
    String name;//
    String applicant;//
    String address;//
    String agency;//
    Date yiyiStartDate;//
    Date yiyiEndDate;//
    Date ann_date;//

    String type;//

    String url;//
    String picPath;//
    String dataPicPath;//
    String pastePicPath;//

    String choosedType;//
    String analysType;
    String client;//外国申请人 可能有多个人 逗号分隔
    String representatives;//外国代理所
    String email;//外国邮箱 可能有多个 逗号分隔

    String remark;

    public Date getAnn_date() {
        return ann_date;
    }

    public void setAnn_date(Date ann_date) {
        this.ann_date = ann_date;
    }

    public Integer getPage_no() {
        return page_no;
    }

    public void setPage_no(Integer page_no) {
        this.page_no = page_no;
    }

    public String getPastePicPath() {
        return pastePicPath;
    }

    public void setPastePicPath(String pastePicPath) {
        this.pastePicPath = pastePicPath;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getClient() {
        return client;
    }

    public void setClient(String client) {
        this.client = client;
    }

    public String getRepresentatives() {
        return representatives;
    }

    public void setRepresentatives(String representatives) {
        this.representatives = representatives;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public static String ANALYS_NORMAL = "normal";
    public static String ANALYS_GAO = "gao";


    private Date gmt_create;

    public String getAnalysType() {
        return analysType;
    }

    public void setAnalysType(String analysType) {
        this.analysType = analysType;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Date getGmt_create() {
        return gmt_create;
    }

    public void setGmt_create(Date gmt_create) {
        this.gmt_create = gmt_create;
    }

    public String getChoosedType() {
        return choosedType;
    }

    public void setChoosedType(String choosedType) {
        this.choosedType = choosedType;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getPicPath() {
        return picPath;
    }

    public void setPicPath(String picPath) {
        this.picPath = picPath;
    }

    public String getDataPicPath() {
        return dataPicPath;
    }

    public void setDataPicPath(String dataPicPath) {
        this.dataPicPath = dataPicPath;
    }

    public Date getYiyiStartDate() {
        return yiyiStartDate;
    }

    public void setYiyiStartDate(Date yiyiStartDate) {
        this.yiyiStartDate = yiyiStartDate;
    }

    public Date getYiyiEndDate() {
        return yiyiEndDate;
    }

    public void setYiyiEndDate(Date yiyiEndDate) {
        this.yiyiEndDate = yiyiEndDate;
    }

    public String getAnNum() {
        return anNum;
    }

    public void setAnNum(String anNum) {
        this.anNum = anNum;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public Date getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(Date applicationDate) {
        this.applicationDate = applicationDate;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getApplicant() {
        return applicant;
    }

    public void setApplicant(String applicant) {
        this.applicant = applicant;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getAgency() {
        return agency;
    }

    public void setAgency(String agency) {
        this.agency = agency;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
    private static String rex = "第\\d+类";

    @JsonIgnore
    public List<TrademarkType> getTrademarkType() {
        return convertType(type);
    }

    @JsonIgnore
    public List<TrademarkType> getChoosedTrademarkType() {
        return convertType(choosedType);
    }


    private List<String> removeBank(String[] ss){
        ArrayList<String> arr = new ArrayList<>();
        for (String s : ss) {
            if(StringUtils.isEmpty(s))continue;
            arr.add(s);
        }
        return arr;
    }


    private List<TrademarkType> convertType(String str){
        ArrayList<TrademarkType> list = new ArrayList<>();
        if(StringUtils.isEmpty(str))return list;
        Pattern pattern = Pattern.compile(rex);

        Matcher matcher = pattern.matcher(str);
        ArrayList<String> typeNum = new ArrayList<>();
        while (matcher.find()) {
            typeNum.add(matcher.group());
        }
        String[] split = str.split(rex);
        List<String> strings = removeBank(split);
        for (int i = 0; i < strings.size(); i++) {
            String s = strings.get(i);
            if(StringUtils.isEmpty(s))continue;
            List<String> types = convert(s);
            String num = typeNum.get(i).substring(1, typeNum.get(i).length() - 1);

            TrademarkType trademarkType = new TrademarkType();
            trademarkType.typeNum = Integer.parseInt(num);
            trademarkType.type = types;
            list.add(trademarkType);
        }
        return list;
    }


    private List<String> convert(String types) {
        types = types.replaceAll(":", "");
        String[] split = types.split(";");
        return Arrays.asList(split);
    }


    public static  class TrademarkType {

        int typeNum;
        List<String> type = new ArrayList<>();

        public int getTypeNum() {
            return typeNum;
        }

        public void setTypeNum(int typeNum) {
            this.typeNum = typeNum;
        }

        public List<String> getType() {
            return type;
        }

        public void setType(List<String> type) {
            this.type = type;
        }

    }



}
