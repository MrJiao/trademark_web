package com.bjhy.trademark.data.downloadPic;

import com.bjhy.trademark.common.net.RequestAdapter;
import org.apache.http.HttpEntity;
import org.apache.http.util.EntityUtils;

import java.util.HashMap;
import java.util.Map;

/**
 * Create by: Jackson
 */
public class GetImageSearchId extends RequestAdapter<String> {

    String annNum;

    public GetImageSearchId(String annNum) {
        this.annNum = annNum;
    }
    @Override
    protected String getUrl() {
        return "http://sbgg.saic.gov.cn:9080/tmann/annInfoView/selectInfoidBycode.html";
    }

    @Override
    protected Map<String, String> getParams() {
        HashMap<String, String> params = new HashMap<>();
        params.put("annNum", annNum);
        params.put("annTypecode", "TMZCSQ");
        return params;
    }
    @Override
    protected Map<String, String> getHeaders() {
        HashMap<String, String> headers = new HashMap<>();
        headers.put("Accept", "text/plain, */*; q=0.01");
        headers.put("Accept-Encoding", "gzip, deflate");
        headers.put("Accept-Language", "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2");
        headers.put("Connection", "keep-alive");
        headers.put("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        headers.put("Cookie", "tmas_cookie=51947.7680.15402.0…f3e1653e44f7a6d023b760fde36e5");
        headers.put("Host", "sbgg.saic.gov.cn:9080");
        headers.put("Referer", "http://sbgg.saic.gov.cn:9080/t…iew/annSearch.html?annNum=" + annNum);
        headers.put("User-Agent", "Mozilla/5.0 (Macintosh; Intel …) Gecko/20100101 Firefox/62.0");
        headers.put("X-Requested-With", "XMLHttpRequest");
        return headers;
    }

    /**
     * @param entity
     * @return 请求图片列表的id
     */
    @Override
    protected String parse(HttpEntity entity) throws Exception{
        return EntityUtils.toString(entity);
    }

    @Override
    protected String getType() {
        return "POST";
    }


}
