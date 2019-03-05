package com.bjhy.trademark.data.pic_orc;

import com.baidu.aip.ocr.AipOcr;
import com.bjhy.trademark.data.pic_orc.domain.OrcData;
import com.bjhy.trademark.data.pic_orc.domain.Temp;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.JSONObject;
import org.springframework.beans.factory.InitializingBean;
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
public class PicOrc implements InitializingBean {

    @Autowired
    AccountConfig accountConfig;

    ObjectMapper mapper = new ObjectMapper();

    public PicOrc() {

    }

    AipOcr client;
    List<Account> accounts;

    private void initClient() {
        accounts = accountConfig.getAccount();
        Account account = accounts.get(clientIndex);
        client = new AipOcr(account.getApp_id(), account.getApi_key(), account.getSecret_key());
        // 可选：设置网络连接参数
        client.setConnectionTimeoutInMillis(5000);
        client.setSocketTimeoutInMillis(60000);
    }

    private AipOcr getNormalClient() {
        return client;
    }

    int clientIndex = 0;
    int gaoTime = 480;

    private AipOcr getGaoClient() {
        gaoTime--;
        if (gaoTime < 0) {
            gaoTime = 480;
            clientIndex++;
            if (clientIndex == accounts.size())
                clientIndex = 0;
            initClient();
        }
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

    @Override
    public void afterPropertiesSet() throws Exception {
        // 初始化一个AipOcr
        initClient();
    }
}
