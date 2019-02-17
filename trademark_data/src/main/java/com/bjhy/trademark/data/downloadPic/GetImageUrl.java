package com.bjhy.trademark.data.downloadPic;

import com.bjhy.trademark.common.net.RequestAdapter;
import org.apache.http.HttpEntity;

import java.util.HashMap;
import java.util.Map;

/**
 * Create by: Jackson
 */
public class GetImageUrl extends RequestAdapter<GetPicBean> {

    String id;
    String pageNum;

    public GetImageUrl(String id, String pageNum) {
        this.id = id;
        this.pageNum = pageNum;
    }

    @Override
    protected String getUrl() {
        return "http://sbgg.saic.gov.cn:9080/tmann/annInfoView/imageView.html";
    }

    @Override
    protected Map<String, String> getParams() {
        HashMap<String, String> params = new HashMap<>();
        params.put("flag", "1");
        params.put("pageNum", pageNum);
        params.put("id", id);
        return params;
    }

    @Override
    protected Map<String, String> getHeaders() {
        HashMap<String, String> headers = new HashMap<>();
        headers.put("Accept", "application/json, text/javascript, */*; q=0.01");
        headers.put("Accept-Encoding", "gzip, deflate");
        headers.put("Accept-Language", "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2");
        headers.put("Connection", "keep-alive");
        headers.put("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        headers.put("Cookie", "tmas_cookie=51947.7680.15402.0…f3e1653e44f7a6d023b760fde36e5");
        headers.put("Host", "sbgg.saic.gov.cn:9080");
        headers.put("Origin", "http://sbgg.saic.gov.cn:9080");
        headers.put("Referer", "http://sbgg.saic.gov.cn:9080/tmann/annInfoView/annSearch.html");
        headers.put("User-Agent", "Mozilla/5.0 (Macintosh; Intel …) Gecko/20100101 Firefox/62.0");
        headers.put("X-Requested-With", "XMLHttpRequest");
        return headers;
    }

    @Override
    protected GetPicBean parse(HttpEntity entity)throws Exception {
        return getResult(entity, GetPicBean.class);
    }

    @Override
    protected String getType() {
        return "POST";
    }


}
