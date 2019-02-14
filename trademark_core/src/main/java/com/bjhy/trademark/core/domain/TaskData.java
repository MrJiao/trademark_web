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
    @FieldParam("开始位置")
    Integer startNum;
    @FieldParam("结束位置")
    Integer endNum;
    //@FieldParam("执行状态")
    String exeState;//
    public static String STATE_STARTING = "正在执行";
    public static String STATE_END = "执行完成";
    public static String STATE_ERROR = "执行失败";

    @FieldParam("创建时间")
    @DateTimeFormat(pattern = "yyyy-MM-dd hh:mm:ss")
    @Column(nullable=false)
    @AutoCompleteField(type= AutoCompleteFieldType.DATE)
    private Date gmt_create;

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

    public Integer getStartNum() {
        return startNum;
    }

    public void setStartNum(Integer startNum) {
        this.startNum = startNum;
    }

    public Integer getEndNum() {
        return endNum;
    }

    public void setEndNum(Integer endNum) {
        this.endNum = endNum;
    }

    public String getExeState() {
        return exeState;
    }

    public void setExeState(String exeState) {
        this.exeState = exeState;
    }

    public static String getStateStarting() {
        return STATE_STARTING;
    }

    public static void setStateStarting(String stateStarting) {
        STATE_STARTING = stateStarting;
    }

    public static String getStateEnd() {
        return STATE_END;
    }

    public static void setStateEnd(String stateEnd) {
        STATE_END = stateEnd;
    }

    public static String getStateError() {
        return STATE_ERROR;
    }

    public static void setStateError(String stateError) {
        STATE_ERROR = stateError;
    }

    public Date getGmt_create() {
        return gmt_create;
    }

    public void setGmt_create(Date gmt_create) {
        this.gmt_create = gmt_create;
    }

}
