package com.bjhy.trademark.core.service.impl;

import com.bjhy.tlevel.datax.common.utils.L;
import com.bjhy.trademark.common.net.WaitStrategy;
import com.bjhy.trademark.common.utils.DownloadUtil;
import com.bjhy.trademark.common.utils.MD5;
import com.bjhy.trademark.core.convert.ConvertUtil;
import com.bjhy.trademark.core.domain.TaskData;
import com.bjhy.trademark.core.domain.TrademarkBean;
import com.bjhy.trademark.core.service.TaskDataService;
import com.bjhy.trademark.core.service.TrademarkBeanService;
import com.bjhy.trademark.data.downloadPic.GetImageSearchId;
import com.bjhy.trademark.data.downloadPic.GetImageUrlTask;
import com.bjhy.trademark.data.pic_orc.PicOrc;
import com.bjhy.trademark.data.pic_orc.domain.OrcData;
import com.bjhy.trademark.watermarker.WaterMarker;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.Set;

/**
 * Create by: Jackson
 */
@Scope("prototype")
@Component
public class GetTrademarkTask implements Runnable {

    TaskData taskData;
    String storePath;
    File folder;
    public GetTrademarkTask(TaskData taskData, String storePath) {
        this.taskData = taskData;
        this.storePath = storePath;
        folder = new File(storePath, "extract");
        folder.mkdirs();
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

    CloseableHttpClient client = HttpClients.createDefault();

    @Override
    public void run() {
        try {
           // String searchId = new GetImageSearchId(taskData.getAnnm()).request(client);
            GetImageUrlTask getImageUrlTask = new GetImageUrlTask(client, new WaitStrategy() {
                @Override
                public long waitTime() {
                    return 1000;
                }
            }, taskData.getStartNum(), taskData.getEndNum(), taskData.getAnnm());
            Set<String> imageUrls = getImageUrlTask.get();

            for (String url : imageUrls) {
                boolean success = true;
                try {
                    TrademarkBean trademarkBean = getTrademarkBean(url);
                    //下载图片
                    downloadPic(url, trademarkBean);
                    //提取图片信息
                    extract(trademarkBean);
                    //图片文字识别
                    OrcData normal = picOrc.normal(trademarkBean.getDataPicPath());
                    trademarkBean.setAnalysType(TrademarkBean.ANALYS_NORMAL);
                    //转义存库
                    if(!ConvertUtil.convert(normal, trademarkBean)){
                        OrcData gao = picOrc.gao(trademarkBean.getDataPicPath());
                        trademarkBean.setAnalysType(TrademarkBean.ANALYS_GAO);
                        if(!ConvertUtil.convert(gao, trademarkBean)){
                            continue;
                        }
                    }
                    trademarkBeanService.save(trademarkBean);
                } catch (Exception e) {
                    L.e("图片处理错误", url);
                    L.exception(e);
                }
            }
        } catch (Exception e) {
            taskData.setExeState(TaskData.STATE_ERROR);
        }
        taskData.setExeState(TaskData.STATE_END);
        taskDataService.saveOrUpdate(taskData);
    }

    private void extract(TrademarkBean trademarkBean) {
        waterMarker.getDataPic(new File(trademarkBean.getPicPath()), new File(trademarkBean.getDataPicPath()));
    }

    private TrademarkBean getTrademarkBean(String url) {
        TrademarkBean trademarkBean = new TrademarkBean();
        trademarkBean.setGmt_create(new Date());
        trademarkBean.setUrl(url);
        String encode = md5.encode(url);
        File file = new File(storePath, encode + ".jpg");
        File extractFile = new File(folder, encode + ".jpg");
        trademarkBean.setPicPath(file.getAbsolutePath());
        trademarkBean.setDataPicPath(extractFile.getAbsolutePath());
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
