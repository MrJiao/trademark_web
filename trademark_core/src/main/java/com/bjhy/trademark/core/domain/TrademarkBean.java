package com.bjhy.trademark.core.domain;

import com.bjhy.jackson.fast.generator.annotation.FieldParam;
import com.bjhy.jackson.fast.generator.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.lang3.StringUtils;
import org.apel.gaia.commons.autocomplete.annotation.AutoCompleteField;
import org.apel.gaia.commons.autocomplete.enums.AutoCompleteFieldType;
import org.springframework.format.annotation.DateTimeFormat;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Create by: Jackson
 */
@TableName("商标数据")
@Entity
public class TrademarkBean {

    @FieldParam(value = "id",hidden = true)
    @Id
    @Column(name = "ID",length=32)
    String id;//
    @FieldParam(value="页码编号")
    Integer page_no;
    @FieldParam("商标号")
    @Column(name = "mNumber",length=32)
    String number="";//
    @FieldParam("期号")
    String anNum="";//
    @FieldParam("申请日期")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    Date applicationDate;//
    @FieldParam("商标名")
    String name="";//
    @FieldParam("申请人")
    String applicant="";//
    @FieldParam("地址")
    String address="";//
    @FieldParam("代理机构")
    String agency="";//
    @FieldParam("异议期限-开始")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    Date yiyiStartDate;//
    @FieldParam("异议期限-截止")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    Date yiyiEndDate;//
    @FieldParam("公告日期")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    Date ann_date;//

    @FieldParam(value="类型",hidden = true)
    @Column(name = "mType",length = 400)
    String type="";//

    //@FieldParam(value="图片url",hidden = true)
    @Column(name = "mUrl")
    String url="";//
    //@FieldParam(value="图片地址",hidden = true)
    @JsonIgnore
    String picPath="";//
    //@FieldParam(value="数据图片地址",hidden = true)
    @JsonIgnore
    String dataPicPath="";//
    //@FieldParam(value="粘贴图片地址",hidden = true)
    @JsonIgnore
    String pastePicPath="";//



    @FieldParam(value="被选择的类型",hidden = true)
    String choosedType="";//

    String analysType;
    @FieldParam(value="外国申请人")
    String client;//外国申请人 可能有多个人 逗号分隔
    @FieldParam(value="外国代理所")
    String representatives;//外国代理所
    @FieldParam(value="外国邮箱")
    String email;//外国邮箱 可能有多个 逗号分隔

    @FieldParam(value="级别")
    @Column(name = "mRemark")
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


    @FieldParam(value = "创建时间",hidden = true)
    @DateTimeFormat(pattern = "yyyy-MM-dd hh:mm:ss")
    @Column(nullable=false)
    @AutoCompleteField(type= AutoCompleteFieldType.DATE)
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
