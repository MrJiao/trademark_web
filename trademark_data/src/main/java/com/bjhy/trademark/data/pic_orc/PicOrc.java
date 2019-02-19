package com.bjhy.trademark.data.pic_orc;

import com.baidu.aip.ocr.AipOcr;
import com.bjhy.trademark.data.pic_orc.domain.OrcData;
import com.bjhy.trademark.data.pic_orc.domain.Temp;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.JSONObject;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;

/**
 * Create by: Jackson
 */
@Component
public class PicOrc {


    //设置APPID/AK/SK
    /*public static final String APP_ID = "15502232";
    public static final String API_KEY = "DG2ACLY9GL3PUtCgTcINIRwG";
    public static final String SECRET_KEY = "RIppKjEVGU6FvTuUnb6MrS9WQSx1i229";*/


    public static final String APP_ID = "15567265";
    public static final String API_KEY = "LYjYRF3PBIjUZ14arDjQWuLk";
    public static final String SECRET_KEY = "bUsyuffSfe3P7hc48AqXoTOajb067eFw";



    ObjectMapper mapper = new ObjectMapper();
    AipOcr client;
    public PicOrc(){
        // 初始化一个AipOcr
        client = new AipOcr(APP_ID, API_KEY, SECRET_KEY);

        // 可选：设置网络连接参数
        client.setConnectionTimeoutInMillis(2000);
        client.setSocketTimeoutInMillis(60000);
    }

    public OrcData gao(String filePath) throws IOException {
        // 传入可选参数调用接口
        HashMap<String, String> options = new HashMap<String, String>();
        options.put("probability", "true");
        JSONObject res = client.basicAccurateGeneral(filePath, options);
        return mapper.readValue(res.toString(), OrcData.class);
    }

    public OrcData normal(String filePath) throws IOException {

        // 传入可选参数调用接口
        HashMap<String, String> options = new HashMap<String, String>();
        options.put("language_type", "CHN_ENG");
        options.put("detect_language", "true");
        options.put("probability", "true");
        // 参数为本地路径
        JSONObject res = client.basicGeneral(filePath, options);
        return mapper.readValue(res.toString(), OrcData.class);
    }


    public Temp text(String filePath){
        HashMap<String, String> options = new HashMap<String, String>();
      /*  options.put("language_type", "CHN_ENG");
        options.put("detect_language", "true");
        options.put("probability", "true");*/

        JSONObject res = client.handwriting(filePath, options);

        System.out.println(res.toString());


        try {
            return mapper.readValue(res.toString(), Temp.class);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;


    }





}
