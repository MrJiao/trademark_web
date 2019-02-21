package com.bjhy.trademark.data.pic_orc;

import com.baidu.aip.ocr.AipOcr;
import com.bjhy.trademark.data.pic_orc.domain.OrcData;
import com.bjhy.trademark.data.pic_orc.domain.Temp;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Create by: Jackson
 */
@Component
public class PicOrc {
    //设置APPID/AK/SK
    /*public static final String app_id = "15502232";
    public static final String api_key = "DG2ACLY9GL3PUtCgTcINIRwG";
    public static final String secret_key = "RIppKjEVGU6FvTuUnb6MrS9WQSx1i229";*/


//    public static final String APP_ID = "15567265";
//    public static final String API_KEY = "LYjYRF3PBIjUZ14arDjQWuLk";
//    public static final String SECRET_KEY = "bUsyuffSfe3P7hc48AqXoTOajb067eFw";

    @Autowired
    AccountConfig accountConfig;

    ObjectMapper mapper = new ObjectMapper();
    public PicOrc(){
        // 初始化一个AipOcr
        initClient();
    }

    private List<AipOcr> clients = new ArrayList<>();
    private void initClient(){
        List<Account> account = accountConfig.getAccount();
        for (Account a : account) {
            AipOcr client = new AipOcr(a.getApp_id(), a.getApi_key(), a.getSecret_key());
            // 可选：设置网络连接参数
            client.setConnectionTimeoutInMillis(5000);
            client.setSocketTimeoutInMillis(60000);
            clients.add(client);
        }
    }

    int normalCurrentClient=0;
    private AipOcr getNormalClient(){
        AipOcr client = clients.get(normalCurrentClient);
        normalCurrentClient++;
        if(normalCurrentClient==clients.size())
            normalCurrentClient =0;
        return client;
    }

    int gaoCurrentClient=0;
    private AipOcr getGaoClient(){
        AipOcr client = clients.get(gaoCurrentClient);
        gaoCurrentClient++;
        if(gaoCurrentClient==clients.size())
            gaoCurrentClient =0;
        return client;
    }

    public OrcData gao(String filePath) throws IOException {
        // 传入可选参数调用接口
        HashMap<String, String> options = new HashMap<String, String>();
        options.put("probability", "true");
        JSONObject res = getGaoClient().basicAccurateGeneral(filePath, options);
        return mapper.readValue(res.toString(), OrcData.class);
    }

    public OrcData normal(String filePath) throws IOException {
        // 传入可选参数调用接口
        HashMap<String, String> options = new HashMap<String, String>();
        options.put("language_type", "CHN_ENG");
        options.put("detect_language", "true");
        options.put("probability", "true");
        // 参数为本地路径
        JSONObject res = getNormalClient().basicGeneral(filePath, options);
        return mapper.readValue(res.toString(), OrcData.class);
    }
}
