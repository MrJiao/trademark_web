package com.bjhy.trademark.core.service.impl;

import com.bjhy.tlevel.datax.common.utils.L;
import com.bjhy.trademark.common.utils.DownloadUtil;
import com.bjhy.trademark.common.utils.MD5;
import com.bjhy.trademark.core.convert.ConvertUtil;
import com.bjhy.trademark.core.domain.TaskData;
import com.bjhy.trademark.core.domain.TrademarkBean;
import com.bjhy.trademark.core.pojo.TrademarkData;
import com.bjhy.trademark.core.pojo.UrlData;
import com.bjhy.trademark.core.service.TaskDataService;
import com.bjhy.trademark.core.service.TrademarkBeanService;
import com.bjhy.trademark.data.pic_orc.PicOrc;
import com.bjhy.trademark.data.pic_orc.domain.OrcData;
import com.bjhy.trademark.watermarker.WaterMarker;
import com.bjhy.trademark.watermarker.core.Task;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Create by: Jackson
 */
@Scope("prototype")
@Component
public class GetTrademarkTask implements Runnable {

    File urlFile;
    File dataFile;
    String storePath;
    String annum;
    File folder;
    File pasteFolder;
    public GetTrademarkTask(File urlFile,File dataFile,String annum, String storePath) {
        this.urlFile = urlFile;
        this.dataFile = dataFile;
        this.storePath = storePath;
        this.annum = annum;
        folder = new File(storePath, "extract");
        folder.mkdirs();
        pasteFolder = new File(storePath, "paste");
        pasteFolder.mkdirs();
    }

    @Autowired
    MD5 md5;
    @Autowired
    WaterMarker waterMarker;
    @Autowired
    PicOrc picOrc;
    @Autowired
    TaskDataService taskDataService;
    @Autowired
    TrademarkBeanService trademarkBeanService;
    TaskData taskData;
    CloseableHttpClient client = HttpClients.createDefault();
    ObjectMapper objectMapper = new ObjectMapper();

    private void initTaskData(ArrayList<TrademarkData.RowsBean> rowsBeans,Set<String> urls){
        taskData = new TaskData();
        taskData.setAnnm(annum);
        taskData.setPicNumber(urls.size());
        taskData.setTrademarkNumber(rowsBeans.size());
        taskData.setGmt_create(new Date());
        taskData.setExeState(TaskData.STATE_STARTING_DATA);
        taskDataService.save(taskData);

    }

    @Override
    public void run() {
        try {
            ArrayList<TrademarkData.RowsBean> rowsBeans = readTrademarkData();
            Set<String> imageUrls = getUrls();
            initTaskData(rowsBeans,imageUrls);
            HashMap<String, TrademarkBean> hm = storeData(rowsBeans);
            taskData.setExeState(TaskData.STATE_STARTING_PIC);
            taskDataService.update(taskData);
            for (String url : imageUrls) {
                try {
                    TrademarkBean trademarkBean = downloadAndAnalysTrademarkBean(url);
                    //匹配商标名称
                    TrademarkBean bean = matchPicData(hm, trademarkBean);
                    if(bean ==null)continue;
                    trademarkBeanService.update(bean);
                } catch (Exception e) {
                    L.e("图片处理错误", url);
                    L.exception(e);
                }
            }
            taskData.setCompleteTime(new Date());
            taskData.setExeState(TaskData.STATE_END);
            taskDataService.update(taskData);
        } catch (Exception e) {
            L.e("解析错误");
            L.exception(e);
        }
    }
    boolean extractSuccess = true;
    private TrademarkBean downloadAndAnalysTrademarkBean(String url) {
        TrademarkBean trademarkBean = getTrademarkBean(url);

        if(!new File(trademarkBean.getPicPath()).exists()){
            //下载图片
            try {
                downloadPic(url, trademarkBean);
            }catch (Exception e){
                L.e("下载图片失败",url);
            }

        }
        if(!new File(trademarkBean.getDataPicPath()).exists()){
            //提取图片信息
            extractSuccess = true;
            try {
                extract(trademarkBean);
            } catch (Exception e) {
                extractSuccess = false;
                L.e("提取图片信息失败",trademarkBean.getDataPicPath());
                L.exception(e);
            }
        }
        if(!new File(trademarkBean.getPastePicPath()).exists()){
            if(extractSuccess){
                //清除水印
                try {
                    remoteWatermark(trademarkBean);
                } catch (Exception e) {
                    L.e("提取粘贴图片失败");
                    L.exception(e);
                }
            }

        }
        //图片文字识别
        OrcData normal = null;
        try {
            normal = picOrc.normal(trademarkBean.getDataPicPath());
        } catch (IOException e) {
            L.e("图片普通识别失败",trademarkBean.getDataPicPath());
        }
        trademarkBean.setAnalysType(TrademarkBean.ANALYS_NORMAL);
        //转义
        if(!ConvertUtil.convert(normal, trademarkBean)){
            if(StringUtils.isEmpty(trademarkBean.getNumber())){
                return null;
            } else if(trademarkBean.getNumber().length()!=8){
                OrcData gao = null;
                try {
                    gao = picOrc.gao(trademarkBean.getDataPicPath());
                } catch (IOException e) {
                    L.e("图片高级识别失败",trademarkBean.getDataPicPath());
                }
                trademarkBean.setAnalysType(TrademarkBean.ANALYS_GAO);
                if(!ConvertUtil.convert(gao, trademarkBean)){
                    return null;
                }
            }
        }
        return trademarkBean;
    }


    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
    private TrademarkBean matchPicData(HashMap<String, TrademarkBean> hm,TrademarkBean picData) {
        if(picData == null)return null;
        TrademarkBean trademarkBean = hm.get(picData.getId());
        if(trademarkBean==null)return null;
        trademarkBean.setPastePicPath(picData.getPastePicPath());
        trademarkBean.setClient(picData.getClient());
        trademarkBean.setRepresentatives(picData.getRepresentatives());
        trademarkBean.setEmail(picData.getEmail());
        trademarkBean.setAnalysType(picData.getAnalysType());
        trademarkBean.setChoosedType(picData.getChoosedType());
        trademarkBean.setUrl(picData.getUrl());
        trademarkBean.setPicPath(picData.getPicPath());
        trademarkBean.setDataPicPath(picData.getDataPicPath());
        trademarkBean.setYiyiStartDate(picData.getYiyiStartDate());
        trademarkBean.setYiyiEndDate(picData.getYiyiEndDate());
        trademarkBean.setApplicationDate(picData.getApplicationDate());
        trademarkBean.setAddress(picData.getAddress());
        trademarkBean.setAgency(picData.getAgency());
        trademarkBean.setType(picData.getType());
        return trademarkBean;
    }


    private HashMap<String, TrademarkBean> storeData(ArrayList<TrademarkData.RowsBean> rowsBeans){

        ArrayList<TrademarkBean> trademarkBeanArr = new ArrayList<>();
        HashMap<String, TrademarkBean> hm = new HashMap<>();
        for (TrademarkData.RowsBean row : rowsBeans) {
            TrademarkBean trademarkBean = new TrademarkBean();
            try {
                trademarkBean.setAnn_date(formatter.parse(row.getAnn_date()));//公告日期
            } catch (ParseException e) {
                L.e("解析公告日期错误 商标号",trademarkBean.getNumber());
                L.exception(e);
            }
            trademarkBean.setId(row.getReg_num());
            trademarkBean.setNumber(row.getReg_num());
            trademarkBean.setPage_no(row.getPage_no());//页码
            trademarkBean.setApplicant(row.getRegname());//申请人
            trademarkBean.setAnNum(row.getAnn_num());//期号
            trademarkBean.setName(row.getTmname());//商标名称
            trademarkBean.setGmt_create(new Date());
            trademarkBeanArr.add(trademarkBean);
            hm.put(trademarkBean.getId(),trademarkBean);
        }
        trademarkBeanService.save(trademarkBeanArr);
        return hm;
    }






    private ArrayList<TrademarkData.RowsBean> readTrademarkData() throws IOException {
        ArrayList<TrademarkData.RowsBean> dataArrayList = new ArrayList<>();
            String content = FileUtils.readFileToString(dataFile, Charset.defaultCharset());
            String[] split = content.split(";");
            for (String s : split) {
                try {
                    TrademarkData trademarkData = objectMapper.readValue(s, TrademarkData.class);
                    dataArrayList.addAll(trademarkData.getRows());
                } catch (IOException e) {
                    L.e("解析商标信息失败");
                    L.exception(e);
                }

            }



        return dataArrayList;
    }

    private Set<String> getUrls() {
        HashSet<String> hs = new HashSet<>();
        try {
            String urlsStr = FileUtils.readFileToString(urlFile, Charset.defaultCharset());
            if(StringUtils.isEmpty(urlsStr))return hs;
            String[] split = urlsStr.split(";");
            for (String s : split) {
                UrlData urlData = objectMapper.readValue(s, UrlData.class);
                hs.addAll(urlData.getImaglist());
            }
        } catch (IOException e) {
            L.e("解析url文件错误");
            L.exception(e);
        }
        return hs;
    }

    private void remoteWatermark(TrademarkBean trademarkBean) throws IOException {
        waterMarker.clipPic(new File(trademarkBean.getPicPath()), new File(trademarkBean.getPastePicPath()));
    }

    private void extract(TrademarkBean trademarkBean) throws IOException {
        waterMarker.getDataPic(new File(trademarkBean.getPicPath()), new File(trademarkBean.getDataPicPath()));
    }

    private TrademarkBean getTrademarkBean(String url) {
        TrademarkBean trademarkBean = new TrademarkBean();
        trademarkBean.setGmt_create(new Date());
        trademarkBean.setUrl(url);
        String encode = md5.encode(url);
        File file = new File(storePath, encode + ".jpg");
        File extractFile = new File(folder, encode + ".jpg");
        File pasteFile = new File(pasteFolder, encode + ".jpg");


        trademarkBean.setPicPath(file.getAbsolutePath());
        trademarkBean.setDataPicPath(extractFile.getAbsolutePath());
        trademarkBean.setPastePicPath(pasteFile.getAbsolutePath());
        return trademarkBean;
    }

    private long lastTime=0;
    private void downloadPic(String url, TrademarkBean trademarkBean) throws IOException, InterruptedException {
        long jiange = System.currentTimeMillis()-lastTime;
        if(jiange<1000&&jiange>0){
            Thread.sleep(1000-jiange);
        }
        lastTime = System.currentTimeMillis();
        //下载图片
        DownloadUtil.download(new File(trademarkBean.getPicPath()), url, client);
    }
}
