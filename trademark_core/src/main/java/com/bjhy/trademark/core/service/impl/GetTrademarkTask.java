package com.bjhy.trademark.core.service.impl;

import com.bjhy.tlevel.datax.common.utils.L;
import com.bjhy.trademark.common.MyEncoding;
import com.bjhy.trademark.common.utils.DownloadUtil;
import com.bjhy.trademark.common.utils.MD5;
import com.bjhy.trademark.core.TrademarkConfig;
import com.bjhy.trademark.core.convert.ConvertUtil;
import com.bjhy.trademark.core.domain.TaskData;
import com.bjhy.trademark.core.domain.TrademarkBean;
import com.bjhy.trademark.core.pojo.Remark;
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
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
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
    Remark remarkObj;

    public GetTrademarkTask(File urlFile, File dataFile, Remark remarkObj) {
        this.urlFile = urlFile;
        this.dataFile = dataFile;
        this.remarkObj = remarkObj;
    }

    private File getPasteFolder(String anNum) {
        String storePath = trademarkConfig.getStorePath();
        File file = new File(storePath, anNum + File.separator + "paste");
        file.mkdirs();
        return file;
    }

    private File getExtractFolder(String anNum) {
        String storePath = trademarkConfig.getStorePath();
        File file = new File(storePath, anNum + File.separator + "extract");
        file.mkdirs();
        return file;
    }

    private File getStorePathFolder(String anNum) {
        String storePath = trademarkConfig.getStorePath();
        File file = new File(storePath, anNum);
        file.mkdirs();
        return file;
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
    @Autowired
    TrademarkConfig trademarkConfig;
    TaskData taskData;
    CloseableHttpClient client = HttpClients.createDefault();
    ObjectMapper objectMapper = new ObjectMapper();

    private void initTaskData(ArrayList<TrademarkData.RowsBean> rowsBeans, List<String> urls) {
        taskData = new TaskData();
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
            List<String> imageUrls = getUrls();
            initTaskData(rowsBeans, imageUrls);
            storeData(rowsBeans);
            taskData.setExeState(TaskData.STATE_STARTING_PIC);
            taskDataService.update(taskData);

            //获取期号


            String anNum = getAnNum(imageUrls);
            for (String url : imageUrls) {
                try {
                    List<TrademarkBean> trademarkBeanArr = trademarkBeanService.findByPicEncode(md5.encode(url));
                    TrademarkBean trademarkBean = null;
                    if (trademarkBeanArr != null && trademarkBeanArr.size() == 1) {
                        trademarkBean = trademarkBeanArr.get(0);
                    }
                    TrademarkBean picTrademarkBean = downloadPicAndRemoveWatermarker(trademarkBean, anNum, url);
                    if (picTrademarkBean == null) continue;//信息图片失败,没必要继续解析

                    if (trademarkBean == null ||
                            !(StringUtils.equals(trademarkBean.getAnalysType(), TrademarkBean.ANALYS_NORMAL) ||
                                    StringUtils.equals(trademarkBean.getAnalysType(), TrademarkBean.ANALYS_GAO))) {
                        //图片文字识别
                        picTrademarkBean = orcPic(picTrademarkBean);
                        if (picTrademarkBean == null) continue;//识别的数据失败,不做存储
                        //匹配商标名称
                        if (trademarkBean == null)
                            trademarkBean = trademarkBeanService.findById(picTrademarkBean.getNumber());
                        if (trademarkBean == null) continue;
                        trademarkBean = matchPicData(trademarkBean, picTrademarkBean);
                        boolean fremdness = trademarkBeanService.isFremdness(trademarkBean.getAddress());
                        trademarkBean.setForeign(fremdness ? "是" : "否");
                        setRemark(trademarkBean,remarkObj);
                        trademarkBeanService.update(trademarkBean);
                    }
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
        } finally {
            if (urlFile.exists())
                urlFile.delete();
            if (dataFile.exists())
                dataFile.delete();
        }
    }

    private String getAnNum(List<String> imageUrls) {
        if (imageUrls.size() == 0) return "";
        File folder = new File(trademarkConfig.getTempPath(), System.currentTimeMillis() + "");
        folder.mkdirs();
        if (imageUrls.size() == 1) {
            return getAnNum(folder, imageUrls.get(0));
        } else if (imageUrls.size() == 2) {
            String ann1 = getAnNum(folder, imageUrls.get(0));
            String ann2 = getAnNum(folder, imageUrls.get(1));
            return getEqOrNotEmpty(ann1, ann2);
        } else {
            String ann1 = getAnNum(folder, imageUrls.get(0));
            String ann2 = getAnNum(folder, imageUrls.get(imageUrls.size() - 1));
            return getEqOrNotEmpty(ann1, ann2);
        }
    }

    private String getEqOrNotEmpty(String ann1, String ann2) {
        if (!StringUtils.isEmpty(ann1) && !StringUtils.isEmpty(ann2)) {
            if (StringUtils.equals(ann1, ann2))
                return ann1;
        } else if (StringUtils.isEmpty(ann1)) {
            return ann2;
        } else if (StringUtils.isEmpty(ann2)) {
            return ann1;
        }
        return "";
    }

    private String getAnNum(File folder, String url) {
        String encode = md5.encode(url);
        File pic = new File(folder, encode + ".jpg");
        File dataPic = new File(folder, "data" + encode + ".jpg");
        File pastePic = new File(folder, "paste" + encode + ".jpg");
        TrademarkBean trademarkBean = getTrademarkBean(url, "");
        trademarkBean.setPicPath(pic.getAbsolutePath());
        trademarkBean.setDataPicPath(dataPic.getAbsolutePath());
        trademarkBean.setPastePicPath(pastePic.getAbsolutePath());

        if (!downloadPic(url, trademarkBean.getPicPath(), trademarkBean.getDataPicPath(), trademarkBean.getPastePicPath())) {
            return "";
        }

        trademarkBean = orcPic(trademarkBean);

        return trademarkBean != null ? trademarkBean.getAnNum() : "";
    }


    private boolean downloadPic(String url, String picPath, String dataPicPath, String pastePicPath) {
        if (!new File(picPath).exists()) {
            //下载图片
            try {
                downloadPic(url, picPath);
            } catch (Exception e) {
                L.e("下载图片失败", url);
                return false;
            }
        }
        if (!new File(dataPicPath).exists()) {
            //提取图片信息
            try {
                extract(picPath, dataPicPath);
            } catch (Exception e) {
                L.e("提取信息图片失败", picPath);
                return false;
                //L.exception(e);
            }
        }
        if (!new File(pastePicPath).exists()) {
            //清除水印
            try {
                remoteWatermark(picPath, pastePicPath);
            } catch (Exception e) {
                L.e("提取粘贴图片失败", picPath);
                L.exception(e);
            }
        }
        return true;
    }

    private TrademarkBean downloadPicAndRemoveWatermarker(TrademarkBean trademarkBean, String anNum, String url) {
        TrademarkBean temp = trademarkBean;
        TrademarkBean pic = getTrademarkBean(url, anNum);
        if (trademarkBean == null) {
            if (StringUtils.isEmpty(anNum)) return null;//数据库无信息,且没有期号的,不处理
            temp = pic;
        }
        if (!downloadPic(url, temp.getPicPath(), temp.getDataPicPath(), temp.getPastePicPath()))
            return null;
        return pic;
    }


    private TrademarkBean orcPic(TrademarkBean picTrademarkBean) {

        OrcData normal;
        try {
            normal = picOrc.normal(picTrademarkBean.getDataPicPath());
        } catch (IOException e) {
            L.e("图片普通识别失败", picTrademarkBean.getDataPicPath());
            return null;
        }
        picTrademarkBean.setAnalysType(TrademarkBean.ANALYS_NORMAL);
        //转义
        if (!ConvertUtil.convert(normal, picTrademarkBean)) {
            if (isNotData(picTrademarkBean)) {
                return null;
            } else if (picTrademarkBean.getNumber() == null || picTrademarkBean.getNumber().length() != 8) {
                OrcData gao = null;
                try {
                    gao = picOrc.gao(picTrademarkBean.getDataPicPath());
                } catch (IOException e) {
                    L.e("图片高级识别失败", picTrademarkBean.getDataPicPath());
                }
                picTrademarkBean.setAnalysType(TrademarkBean.ANALYS_GAO);
                if (!ConvertUtil.convert(gao, picTrademarkBean)) {
                    return null;
                } else {
                    if (StringUtils.isEmpty(picTrademarkBean.getNumber())) {
                        return null;
                    } else {
                        return picTrademarkBean;
                    }
                }
            } else {
                return picTrademarkBean;
            }
        } else {
            if (isNotData(picTrademarkBean)) {
                return null;
            } else if (picTrademarkBean.getNumber() == null || picTrademarkBean.getNumber().length() != 8) {
                OrcData gao = null;
                try {
                    gao = picOrc.gao(picTrademarkBean.getDataPicPath());
                } catch (IOException e) {
                    L.e("图片高级识别失败", picTrademarkBean.getDataPicPath());
                }
                picTrademarkBean.setAnalysType(TrademarkBean.ANALYS_GAO);
                if (!ConvertUtil.convert(gao, picTrademarkBean)) {
                    return null;
                } else {
                    if (StringUtils.isEmpty(picTrademarkBean.getNumber())) {
                        return null;
                    } else {
                        return picTrademarkBean;
                    }
                }
            } else {
                return picTrademarkBean;
            }
        }
    }


    private boolean isNotData(TrademarkBean trademarkBean) {
        int size = 0;
        if (trademarkBean.getApplicationDate() != null) {
            size++;
        }
        if (trademarkBean.getYiyiStartDate() != null) {
            size++;
        }
        if (trademarkBean.getYiyiEndDate() != null) {
            size++;
        }
        return size < 2;
    }


    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");

    private TrademarkBean matchPicData(TrademarkBean trademarkBean, TrademarkBean picData) {
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

    private void setRemark(TrademarkBean trademarkBean, Remark remarkObj) {
        String remark1 = remarkObj.getRemark1();
        String remark2 = remarkObj.getRemark2();
        String remark3 = remarkObj.getRemark3();
        if (!StringUtils.isEmpty(remark1))
            trademarkBean.setRemark(remark1);
        if (!StringUtils.isEmpty(remark2))
            trademarkBean.setRemark2(remark2);
        if (!StringUtils.isEmpty(remark3))
            trademarkBean.setRemark3(remark3);
    }


    private void storeData(ArrayList<TrademarkData.RowsBean> rowsBeans) {
        ArrayList<TrademarkBean> trademarkBeanArr = new ArrayList<>();
        HashSet<String> idsSet = new HashSet<>();

        for (TrademarkData.RowsBean row : rowsBeans) {
            if (idsSet.contains(row.getReg_num())) continue;
            TrademarkBean t = trademarkBeanService.findById(row.getReg_num());
            if (t != null) {
                setRemark(t, remarkObj);
                trademarkBeanService.update(t);
                continue;
            }
            //if(trademarkBeanService.isContains(row.getReg_num()))continue;
            TrademarkBean trademarkBean = new TrademarkBean();
            try {
                trademarkBean.setAnn_date(formatter.parse(row.getAnn_date()));//公告日期
            } catch (ParseException e) {
                L.e("解析公告日期错误 商标号", trademarkBean.getNumber());
                L.exception(e);
            }
            trademarkBean.setId(row.getReg_num());
            trademarkBean.setNumber(row.getReg_num());
            trademarkBean.setPage_no(row.getPage_no());//页码
            trademarkBean.setApplicant(row.getRegname());//申请人
            trademarkBean.setAnNum(row.getAnn_num());//期号
            trademarkBean.setName(row.getTmname());//商标名称
            trademarkBean.setAnalysisName(analysisName(row.getTmname()));
            trademarkBean.setAnalysisCount(getAnalysisCount(trademarkBeanArr, trademarkBean.getAnalysisName()));
            trademarkBean.setGmt_create(new Date());
            setRemark(trademarkBean, remarkObj);
            trademarkBeanArr.add(trademarkBean);
            idsSet.add(row.getReg_num());
            if (trademarkBeanArr.size() > 300) {
                trademarkBeanService.save(trademarkBeanArr);
                trademarkBeanArr = new ArrayList<>();
            }
        }
        if (trademarkBeanArr.size() > 0)
            trademarkBeanService.save(trademarkBeanArr);
    }

    private Integer getAnalysisCount(ArrayList<TrademarkBean> trademarkBeanArr, String analysisName) {
        if (StringUtils.isEmpty(analysisName)) return 0;
        List<TrademarkBean> list = trademarkBeanService.findByAnalysisName(analysisName);
        List<TrademarkBean> list2 = findAnalysisName(trademarkBeanArr, analysisName);
        if (list.size() + list2.size() == 0) return 1;
        Integer analysisCount = list.size() + list2.size() + 1;
        for (TrademarkBean trademarkBean : list) {
            trademarkBean.setAnalysisCount(analysisCount);
        }
        for (TrademarkBean trademarkBean : list2) {
            trademarkBean.setAnalysisCount(analysisCount);
        }
        trademarkBeanService.update(list);
        return analysisCount;
    }

    private List<TrademarkBean> findAnalysisName(ArrayList<TrademarkBean> trademarkBeanArr, String analysisName) {
        ArrayList<TrademarkBean> list = new ArrayList<>();
        for (TrademarkBean trademarkBean : trademarkBeanArr) {
            if (StringUtils.equals(trademarkBean.getAnalysisName(), analysisName)) {
                list.add(trademarkBean);
            }
        }
        return list;
    }

    private String analysisName(String name) {
        name = trademarkBeanService.filterName(name);
        if (StringUtils.isEmpty(name)) return null;
        return trademarkBeanService.formatterName(name);
    }

    private ArrayList<TrademarkData.RowsBean> readTrademarkData() throws IOException {
        ArrayList<TrademarkData.RowsBean> dataArrayList = new ArrayList<>();
        if (!dataFile.exists()) return dataArrayList;
        String content = FileUtils.readFileToString(dataFile, MyEncoding.getEncode());
        String[] split = content.split(";");
        for (String s : split) {
            try {
                TrademarkData trademarkData = objectMapper.readValue(s, TrademarkData.class);
                dataArrayList.addAll(trademarkData.getRows());
            } catch (IOException e) {
                L.e("解析商标信息失败", s);
                L.exception(e);
            }
        }
        return dataArrayList;
    }

    private List<String> getUrls() {
        HashSet<String> hs = new HashSet<>();
        ArrayList<String> arr = new ArrayList<>();
        if (!urlFile.exists()) return arr;
        try {
            String urlsStr = FileUtils.readFileToString(urlFile, MyEncoding.getEncode());
            if (StringUtils.isEmpty(urlsStr)) return arr;
            String[] split = urlsStr.split(";");
            for (String s : split) {
                UrlData urlData = objectMapper.readValue(s, UrlData.class);
                for (String ss : urlData.getImaglist()) {
                    if (!StringUtils.isEmpty(ss))
                        hs.add(ss);
                }
            }
        } catch (IOException e) {
            L.e("解析url文件错误");
            L.exception(e);
        }
        arr.addAll(hs);
        return arr;
    }

    private void remoteWatermark(String picPath, String pastePicPath) throws IOException {
        waterMarker.clipPic(new File(picPath), new File(pastePicPath));
    }

    private void extract(String picPath, String dataPicPath) throws IOException {
        waterMarker.getDataPic(new File(picPath), new File(dataPicPath));
    }

    private TrademarkBean getTrademarkBean(String url, String anNum) {
        TrademarkBean trademarkBean = new TrademarkBean();
        trademarkBean.setGmt_create(new Date());
        trademarkBean.setUrl(url);
        String encode = md5.encode(url);
        File file = new File(getStorePathFolder(anNum), encode + ".jpg");
        File extractFile = new File(getExtractFolder(anNum), encode + ".jpg");
        File pasteFile = new File(getPasteFolder(anNum), encode + ".jpg");
        trademarkBean.setPicEncode(encode);
        trademarkBean.setPicPath(file.getAbsolutePath());
        trademarkBean.setDataPicPath(extractFile.getAbsolutePath());
        trademarkBean.setPastePicPath(pasteFile.getAbsolutePath());
        return trademarkBean;
    }

    private long lastTime = 0;

    private void downloadPic(String url, String picPath) throws IOException, InterruptedException {
        long jiange = System.currentTimeMillis() - lastTime;
        if (jiange < 1000 && jiange > 0) {
            Thread.sleep(1000 - jiange);
        }
        lastTime = System.currentTimeMillis();
        //下载图片
        DownloadUtil.download(new File(picPath), url, client);
    }
}
