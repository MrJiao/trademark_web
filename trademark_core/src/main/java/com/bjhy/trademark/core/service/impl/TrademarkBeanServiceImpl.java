package com.bjhy.trademark.core.service.impl;

import com.bjhy.jackson.fast.generator.annotation.FieldParam;
import com.bjhy.jackson.fast.generator.core.Pojo;
import com.bjhy.tlevel.datax.common.utils.L;
import com.bjhy.trademark.common.utils.ChineseUtil;
import com.bjhy.trademark.common.utils.ZipUtil;
import com.bjhy.trademark.core.TrademarkConfig;
import com.bjhy.trademark.core.convert.ConvertUtil;
import com.bjhy.trademark.core.dao.TrademarkBeanRepository;
import com.bjhy.trademark.data.pic_orc.PicOrc;
import com.bjhy.trademark.data.pic_orc.domain.OrcData;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apel.gaia.commons.pager.PageBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bjhy.trademark.core.domain.TrademarkBean;
import com.bjhy.trademark.core.service.TrademarkBeanService;
import org.apel.gaia.infrastructure.impl.AbstractBizCommonService;

import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.lang.reflect.Field;
import java.nio.charset.Charset;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@Transactional
public class TrademarkBeanServiceImpl extends AbstractBizCommonService<TrademarkBean, String> implements TrademarkBeanService{

    public TrademarkBeanRepository getRepository(){
        return (TrademarkBeanRepository) super.getRepository();
    }

    @Autowired
    PicOrc picOrc;

    @Override
    public void update(List<TrademarkBean> trademarkBeanList) {
        getRepository().update(trademarkBeanList.toArray());
    }

    @Override
    public List<TrademarkBean> findByNames(String annm, List<String> arr) {
        return  getRepository().findByAnNumAndNameIn(annm,arr);
    }

    @Override
    public List<TrademarkBean> filterTrademarkName(List<TrademarkBean> trademarkBeanList) {

        ArrayList<TrademarkBean> arr = new ArrayList<>();
        for (TrademarkBean bean : trademarkBeanList) {
            //全中文和数字的不要
            if(!ChineseUtil.isMathAndChinese(bean.getName())){
                //字母大于2个
                if(isLengthMore(bean.getName(),3)){
                    //地区不是国外
                    if(!isFremdness(bean.getAddress())){
                        if(!isChaofan(bean.getAgency())){
                            arr.add(bean);
                        }
                    }
                }

            }
        }
        return arr;
    }

    @Override
    public List<TrademarkBean> findByAnnm(String annm) {
        return getRepository().findByAnNum(annm);
    }

    @Override
    public PageBean findSameName(String annm, PageBean pageBean) {
        PageRequest pageable = new PageRequest(pageBean.getCurrentPage()-1,pageBean.getRowsPerPage(), Sort.Direction.DESC,"name");
        Page<TrademarkBean> page;
        if(StringUtils.equals(annm,"all")){
            page = getRepository().findBySameName(pageable);
        }else {
            page = getRepository().findBySameNameByAnnum(annm,pageable);
        }

        pageBean.setTotalRows( (int)page.getTotalElements() );
        pageBean.setItems(page.getContent());
        return pageBean;
    }

    @Override
    public void save(Iterable<TrademarkBean> trademarkList) {
        getRepository().save(trademarkList);
    }

    @Override
    public void update(Iterable<TrademarkBean> trademarkList) {
        getRepository().update(trademarkList);
    }

    @Override
    public void orcGao(List<TrademarkBean> trademarkBeanList) {
        for (TrademarkBean trademarkBean : trademarkBeanList) {
            orcGao(trademarkBean);
        }
    }

    @Override
    public TrademarkBean orcGao(TrademarkBean trademarkBean) {
        if(StringUtils.equals(trademarkBean.getAnalysType(),TrademarkBean.ANALYS_GAO))return trademarkBean;
        OrcData gao = null;
        try {
            gao = picOrc.gao(trademarkBean.getDataPicPath());
        } catch (IOException e) {
            L.e("图片高级识别失败",trademarkBean.getDataPicPath());
            L.exception(e);
        }
        ConvertUtil.convert(gao,trademarkBean);
        trademarkBean.setAnalysType(TrademarkBean.ANALYS_GAO);
        return trademarkBean;
    }

    @Autowired
    TrademarkConfig trademarkConfig;

    @Override
    public File zipTrademarkBean(List<TrademarkBean> trademarkBeanList, String liushui) {
        int liuShuiNum = Integer.parseInt(liushui);

        String tempPath = trademarkConfig.getTempPath();
        //创建文件夹
        File folder = new File(tempPath, System.currentTimeMillis() + "");
        folder.mkdirs();

        for (TrademarkBean trademarkBean : trademarkBeanList) {
            //创建子文件夹

            File ziFolder = new File(folder,getZipName(trademarkBean,liuShuiNum));
            ziFolder.mkdirs();
            liuShuiNum++;
            //复制文件
            try {
                String pastePicPath = trademarkBean.getPastePicPath();
                if(!StringUtils.isEmpty(pastePicPath)){
                    File file = new File(pastePicPath);
                    if(file.exists()){
                        FileUtils.copyFile(file,new File(ziFolder,getPastePicName(trademarkBean)));
                    }
                }
                //生成文件
                generateDataFile(new File(ziFolder,"商标数据"+trademarkBean.getNumber()+".txt"),trademarkBean);
                //处理word

            } catch (IOException e) {
                L.exception(e);
            } catch (IllegalAccessException e) {
                L.exception(e);
            }
        }
        //打包
        try {
            ZipUtil.directory2Zip(folder.getAbsolutePath(),tempPath,folder.getName()+".zip");
        } catch (IOException e) {
            e.printStackTrace();
        }
        //删除文件夹
        try {
            FileUtils.deleteDirectory(folder);
        } catch (IOException e) {
            e.printStackTrace();
        }
        //返回zip包文件地址
        return new File(tempPath,folder.getName()+".zip");
    }

    @Override
    public String formatterName(String name) {
        name = ChineseUtil.removeChinese(name);
        name = name.replaceAll("·"," ");
        return name.trim();
    }

    Field[] declaredFields = TrademarkBean.class.getDeclaredFields();
    private void generateDataFile(File file, TrademarkBean trademarkBean) throws IllegalAccessException {

        ArrayList<String> lines = new ArrayList<>();
        for (Field declaredField : declaredFields) {
            declaredField.setAccessible(true);
            FieldParam fieldAnnotationield = (FieldParam) declaredField.getAnnotation(FieldParam.class);
            if(fieldAnnotationield==null)continue;
            Object value = declaredField.get(trademarkBean);
            if(value==null){
                value = "";
            }
            else if(value instanceof Date){
                Date s = (Date) value;
                value = s.toString();
            }
            else if(!(value instanceof String)){
                value = String.valueOf(value);
            }
            lines.add(fieldAnnotationield.value()+":"+value);
        }
        try {
            FileUtils.writeLines(file, Charset.defaultCharset().name(),lines);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    //创建子文件夹名称
    private String getZipName(TrademarkBean trademarkBean, int liuShuiNum) {
        List<TrademarkBean.TrademarkType> trademarkTypeList;
        if(!StringUtils.isEmpty(trademarkBean.getChoosedType())){
            trademarkTypeList = trademarkBean.getChoosedTrademarkType();
        }else {
            trademarkTypeList = trademarkBean.getTrademarkType();
        }
        String leibie ="";
        for (TrademarkBean.TrademarkType trademarkType : trademarkTypeList) {
            leibie = leibie+" "+trademarkType.getTypeNum();
        }
        return "AK19+"+liuShuiNum+"-LCB "+trademarkBean.getName()+leibie+" 潜在异议-xuli";
    }

    //创建要粘贴的图片的图片名称
    private String getPastePicName(TrademarkBean trademarkBean) {
        return new File(trademarkBean.getPastePicPath()).getName();
    }

    private boolean isChaofan(String agency) {
        return StringUtils.equals(agency,"超凡知识产权服务股份有限公司");
    }


    private boolean isFremdness(String address) {
        if(StringUtils.contains(address,"香港")||
                StringUtils.contains(address,"澳门")||
                StringUtils.contains(address,"台湾")){
            return false;
        }
        address = ChineseUtil.removeMathAndChinese(address);
        return address.length()>5;
    }

    private boolean isLengthMore(String name, int i) {
        if(StringUtils.isEmpty(name))return false;
        String s = ChineseUtil.removeChinese(name);
        return s.length()>i;
    }






}
