package com.bjhy.trademark.core.domain;

import com.bjhy.jackson.fast.generator.annotation.FieldParam;
import com.bjhy.jackson.fast.generator.annotation.TableName;
import org.apel.gaia.commons.autocomplete.annotation.AutoCompleteField;
import org.apel.gaia.commons.autocomplete.enums.AutoCompleteFieldType;
import org.springframework.format.annotation.DateTimeFormat;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import java.util.Date;

/**
 * 记录任务详情的
 * Create by: Jackson
 */
@TableName("任务详情")
@Entity
public class TaskData {

    @FieldParam(value = "id",hidden = true)
    @Id
    @Column(length=32)
    @AutoCompleteField(type= AutoCompleteFieldType.ID)
    String id;
    @FieldParam("期号")
    String annm;
    @FieldParam("商标数量")
    Integer trademarkNumber;
    @FieldParam("图片数量")
    Integer picNumber;
    @FieldParam("执行状态")
    String exeState;//
    public static final String STATE_STARTING_DATA = "正在解析商标数据";
    public static final String STATE_STARTING_PIC = "正在解析图片";
    public static final String STATE_END = "执行完成";
    public static final String STATE_ERROR = "执行失败";

    @FieldParam("创建时间")
    @DateTimeFormat(pattern = "yyyy-MM-dd hh:mm:ss")
    @Column(nullable=false)
    @AutoCompleteField(type= AutoCompleteFieldType.DATE)
    private Date gmt_create;


    @FieldParam("完成时间")
    @DateTimeFormat(pattern = "yyyy-MM-dd hh:mm:ss")
    @AutoCompleteField(type= AutoCompleteFieldType.DATE)
    private Date completeTime;

    public Date getCompleteTime() {
        return completeTime;
    }

    public void setCompleteTime(Date completeTime) {
        this.completeTime = completeTime;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAnnm() {
        return annm;
    }

    public void setAnnm(String annm) {
        this.annm = annm;
    }

    public Integer getTrademarkNumber() {
        return trademarkNumber;
    }

    public void setTrademarkNumber(Integer trademarkNumber) {
        this.trademarkNumber = trademarkNumber;
    }

    public Integer getPicNumber() {
        return picNumber;
    }

    public void setPicNumber(Integer picNumber) {
        this.picNumber = picNumber;
    }

    public String getExeState() {
        return exeState;
    }

    public void setExeState(String exeState) {
        this.exeState = exeState;
    }

    public Date getGmt_create() {
        return gmt_create;
    }

    public void setGmt_create(Date gmt_create) {
        this.gmt_create = gmt_create;
    }

}
