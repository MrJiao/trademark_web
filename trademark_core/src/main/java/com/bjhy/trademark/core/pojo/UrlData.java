package com.bjhy.trademark.core.pojo;

import java.util.List;

/**
 * Create by: Jackson
 */
public class UrlData {

    /**
     * pageSize : 20
     * totalPage : 4395
     * total : 87890
     * imaglist : ["http://sbggwj.saic.gov.cn:8000/tmann/group1/M00/4E/E7/yBQCH1xK2eiAK_uTAAJxUzyVxYY917.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group1/M00/4E/E7/yBQCH1xK2emAI15dAAH2hUzjYxw325.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group2/M00/45/81/yBQCIFxK1EaAcd2JAAHRdVROBQg765.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group2/M00/46/45/yBQCIFxK3LqAALBPAAJoGyxO4rE182.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group2/M00/46/45/yBQCIFxK3LqAAuSZAAHa-PWPBRw271.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group2/M00/46/AD/yBQCIFxK4QmAPWekAALoNeiSNLM734.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group2/M00/46/AB/yBQCIFxK4QOAR5YQAAHq8yBdD5Y352.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group2/M00/46/06/yBQCIFxK2gqATBElAAHZwhsx8Uw905.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group1/M00/51/00/yBQCH1xLE0mAbxjhAAHDOBUv6T8728.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group1/M00/4E/C7/yBQCH1xK2JOAWQ9tAAHhdVB4_Ew317.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group2/M00/46/44/yBQCIFxK3LWAQEtzAAHe8x-JVYc527.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group2/M00/45/81/yBQCIFxK1EaAdRIUAAHtqAMeaGM929.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group1/M00/51/00/yBQCH1xLE0qAebNWAAITX0S5jXI018.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group2/M00/46/AB/yBQCIFxK4QSAS4__AAHmv4a_MUE277.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group2/M00/48/2C/yBQCIFxLGlaAPiBnAAHlAldSh5k915.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group1/M00/51/24/yBQCH1xLIEuAN5wpAAHTy9WDtVU140.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group1/M00/4E/C7/yBQCH1xK2JOATKehAAHw25vKn78809.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group2/M00/46/44/yBQCIFxK3LWAUmltAAITZinG_Tc732.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group2/M00/45/FA/yBQCIFxK2YOABhteAAH8IIMIPSY501.jpg","http://sbggwj.saic.gov.cn:8000/tmann/group2/M00/45/E4/yBQCIFxK2ICAR_NWAAHKiTsgMnA814.jpg"]
     * listsize : 20
     */

    private int pageSize;
    private int totalPage;
    private int total;
    private int listsize;
    private List<String> imaglist;

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

    public int getListsize() {
        return listsize;
    }

    public void setListsize(int listsize) {
        this.listsize = listsize;
    }

    public List<String> getImaglist() {
        return imaglist;
    }

    public void setImaglist(List<String> imaglist) {
        this.imaglist = imaglist;
    }
}
