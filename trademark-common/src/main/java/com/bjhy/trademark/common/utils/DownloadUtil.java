package com.bjhy.trademark.common.utils;

import com.bjhy.tlevel.datax.common.utils.L;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Create by: Jackson
 */
public class DownloadUtil {


    public static void download(File storeFile, String url, CloseableHttpClient client) throws IOException {
        FileOutputStream output = null;
        InputStream inputStream = null;
        try {
            HttpGet httpGet = new HttpGet(url);
            addHeader(httpGet);
            CloseableHttpResponse response = client.execute(httpGet);
            HttpEntity entity = response.getEntity();

            if (entity != null) {
                output = new FileOutputStream(storeFile);
                inputStream = entity.getContent();
                byte b[] = new byte[1024*10];
                int j;
                while ((j = inputStream.read(b)) != -1) {
                    output.write(b, 0, j);
                    output.flush();
                }
            }
        } catch (Exception e) {
            L.exception(e);
            throw e;
        } finally {
            try {
                if (output != null) {
                    output.close();
                }
            } catch (Exception e) {
            }
            try {
                if (inputStream != null)
                    inputStream.close();
            } catch (Exception e) {
            }
        }
    }


    private static void addHeader(HttpGet httpGet) {
        httpGet.addHeader("Accept", "*/*");
        httpGet.addHeader("Accept-Encoding", "gzip, deflate");
        httpGet.addHeader("Accept-Language", "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2");
        httpGet.addHeader("Connection", "keep-alive");
        httpGet.addHeader("Cookie", "__jsluid=25af3487f626911b227ae1898406033e");
        httpGet.addHeader("Host", "sbggwj.saic.gov.cn:8000");
        httpGet.addHeader("Referer", "http://sbgg.saic.gov.cn:9080/");
        httpGet.addHeader("User-Agent", "Mozilla/5.0 (Macintosh; Intel …) Gecko/20100101 Firefox/62.0");
    }
}
