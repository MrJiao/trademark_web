package com.bjhy.trademark.common.net;

import com.bjhy.tlevel.datax.common.utils.L;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Create by: Jackson
 */
public abstract class RequestAdapter<T> {

    protected abstract String getUrl();

    protected abstract Map<String, String> getParams();

    protected abstract Map<String, String> getHeaders();

    protected abstract T parse(HttpEntity entity)throws Exception;

    /**
     * GET POST PUT等
     */
    protected abstract String getType();

    private ObjectMapper mapper = new ObjectMapper();

    protected ObjectMapper getMapper() {
        return mapper;
    }

    private HttpPost post(String url, Map<String, String> params, Map<String, String> headers) throws UnsupportedEncodingException {
        HttpPost httpPost = new HttpPost(url);
        for (Map.Entry<String, String> entry : headers.entrySet()) {
            httpPost.addHeader(entry.getKey(), entry.getValue());
        }

        List<NameValuePair> list = new ArrayList<>();
        if(params!=null){
            for (Map.Entry<String, String> entry : params.entrySet()) {
                list.add(new BasicNameValuePair(entry.getKey(), entry.getValue()));
            }
        }

        if (list.size() > 0) {
            UrlEncodedFormEntity entity = new UrlEncodedFormEntity(list, "UTF-8");
            httpPost.setEntity(entity);
        }

        return httpPost;
    }

    private HttpGet get(String url, Map<String, String> params, Map<String, String> headers){
        StringBuilder sb = new StringBuilder();
        sb.append(url);
        if(params != null){
            boolean isFirst = true;
            for (Map.Entry<String, String> entry : params.entrySet()) {
                if(isFirst){
                    isFirst = false;
                    sb.append("?").append(entry.getKey()).append("=").append(entry.getValue());
                }else {
                    sb.append("&").append(entry.getKey()).append("=").append(entry.getValue());
                }
            }
        }

        HttpGet httpGet = new HttpGet(sb.toString());
        if(headers!=null){
            for (Map.Entry<String, String> entry : headers.entrySet()) {
                httpGet.addHeader(entry.getKey(), entry.getValue());
            }
        }
        return httpGet;
    }

    public T request(CloseableHttpClient httpClient) {
        return MyRetryTemplate.retryTemplate(getRetryTime(),getRetryPerTime(),new MyRetryCallBack(httpClient));
    }

    protected long getRetryPerTime(){
        return 5000;
    }

    protected int getRetryTime(){
        return -1;
    }

    private class MyRetryCallBack implements MyRetryTemplate.RetryCallback<T> {
        CloseableHttpClient httpClient;

        public MyRetryCallBack(CloseableHttpClient httpClient) {
            this.httpClient = httpClient;
        }

        @Override
        public T doFunction() throws Exception{
            L.d("发送请求");
            CloseableHttpResponse execute = null;
            if(StringUtils.equalsIgnoreCase(getType(),"post")){
                execute = httpClient.execute(post(getUrl(), getParams(), getHeaders()));
            }else if (StringUtils.equalsIgnoreCase(getType(),"get")){
                execute = httpClient.execute(get(getUrl(), getParams(), getHeaders()));
            }
            HttpEntity entity = execute.getEntity();
            T parse = parse(entity);
            L.d("拿到结果");
            return parse;
        }
    }

    protected String getResult(HttpEntity entity) throws IOException {
        return EntityUtils.toString(entity);
    }

    protected T getResult(HttpEntity entity, Class<T> tClass) throws IOException {
        String s = EntityUtils.toString(entity);
        return mapper.readValue(s, tClass);
    }


}
