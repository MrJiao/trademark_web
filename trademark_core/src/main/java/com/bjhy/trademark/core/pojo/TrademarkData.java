package com.bjhy.trademark.core.pojo;

import java.util.List;

/**
 *  {
 * 		"page_no": 9995,
 * 		"tm_name": "TETS",
 * 		"ann_type_code": "TMZCSQ",
 * 		"tmname": "TETS",
 * 		"reg_name": "谭选敏",
 * 		"ann_type": "商标初步审定公告",
 * 		"ann_num": "1632",
 * 		"reg_num": "29009507",
 * 		"id": "e48b92f268374d8601684f87964b29db",
 * 		"rn": 9923,
 * 		"ann_date": "2019-01-20",
 * 		"regname": "谭选敏"
 *        }
 * Create by: Jackson
 */
public class TrademarkData {


    private int total;
    private List<RowsBean> rows;

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public List<RowsBean> getRows() {
        return rows;
    }

    public void setRows(List<RowsBean> rows) {
        this.rows = rows;
    }

    public static class RowsBean {
        /**
         * page_no : 9993
         * tm_name : 果乐轩
         * ann_type_code : TMZCSQ
         * tmname : 果乐轩
         * reg_name : 尹斌
         * ann_type : 商标初步审定公告
         * ann_num : 1632
         * reg_num : 29009449
         * id : e48b92f268374d8601684f8794e729d7
         * rn : 9921
         * ann_date : 2019-01-20
         * regname : 尹斌
         */

        private int page_no;
        private String tm_name;
        private String ann_type_code;
        private String tmname;
        private String reg_name;
        private String ann_type;
        private String ann_num;
        private String reg_num;
        private String id;
        private int rn;
        private String ann_date;
        private String regname;

        public int getPage_no() {
            return page_no;
        }

        public void setPage_no(int page_no) {
            this.page_no = page_no;
        }

        public String getTm_name() {
            return tm_name;
        }

        public void setTm_name(String tm_name) {
            this.tm_name = tm_name;
        }

        public String getAnn_type_code() {
            return ann_type_code;
        }

        public void setAnn_type_code(String ann_type_code) {
            this.ann_type_code = ann_type_code;
        }

        public String getTmname() {
            return tmname;
        }

        public void setTmname(String tmname) {
            this.tmname = tmname;
        }

        public String getReg_name() {
            return reg_name;
        }

        public void setReg_name(String reg_name) {
            this.reg_name = reg_name;
        }

        public String getAnn_type() {
            return ann_type;
        }

        public void setAnn_type(String ann_type) {
            this.ann_type = ann_type;
        }

        public String getAnn_num() {
            return ann_num;
        }

        public void setAnn_num(String ann_num) {
            this.ann_num = ann_num;
        }

        public String getReg_num() {
            return reg_num;
        }

        public void setReg_num(String reg_num) {
            this.reg_num = reg_num;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public int getRn() {
            return rn;
        }

        public void setRn(int rn) {
            this.rn = rn;
        }

        public String getAnn_date() {
            return ann_date;
        }

        public void setAnn_date(String ann_date) {
            this.ann_date = ann_date;
        }

        public String getRegname() {
            return regname;
        }

        public void setRegname(String regname) {
            this.regname = regname;
        }
    }
}
