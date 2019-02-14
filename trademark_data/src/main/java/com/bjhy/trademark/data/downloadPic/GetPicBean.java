package com.bjhy.trademark.data.downloadPic;

import java.util.ArrayList;

/**
 * Create by: Jackson
 */
public class GetPicBean {

    int pageSize;
    int totalPage;
    int total;
    ArrayList<String> imaglist;

    int listsize;

    public int getListsize() {
        return listsize;
    }

    public void setListsize(int listsize) {
        this.listsize = listsize;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public int getTotalPage() {
        return totalPage;
    }

    public void setTotalPage(int totalPage) {
        this.totalPage = totalPage;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public ArrayList<String> getImaglist() {
        return imaglist;
    }

    public void setImaglist(ArrayList<String> imaglist) {
        this.imaglist = imaglist;
    }

    @Override
    public String toString() {
        return "GetPicBean{" +
                "pageSize='" + pageSize + '\'' +
                ", listsize='" + listsize + '\'' +
                ", totalPage='" + totalPage + '\'' +
                ", total='" + total + '\'' +
                ", imaglist=" + imaglist +

                '}';
    }
}
