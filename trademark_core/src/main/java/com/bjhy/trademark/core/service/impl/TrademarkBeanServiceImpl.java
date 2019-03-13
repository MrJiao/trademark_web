package com.bjhy.trademark.core.service.impl;

import com.bjhy.jackson.fast.generator.annotation.FieldParam;
import com.bjhy.tlevel.datax.common.utils.L;
import com.bjhy.trademark.common.MyEncoding;
import com.bjhy.trademark.common.utils.ChineseUtil;
import com.bjhy.trademark.common.utils.ZipUtil;
import com.bjhy.trademark.core.TrademarkConfig;
import com.bjhy.trademark.core.convert.ConvertUtil;
import com.bjhy.trademark.core.dao.TrademarkBeanRepository;
import com.bjhy.trademark.core.pojo.Count;
import com.bjhy.trademark.core.utils.BeanUtil;
import com.bjhy.trademark.data.auto_word.WordComponent;
import com.bjhy.trademark.data.auto_word.WordTrademarkBean;
import com.bjhy.trademark.data.pic_orc.PicOrc;
import com.bjhy.trademark.data.pic_orc.domain.OrcData;
import org.apache.commons.beanutils.BeanUtils;
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
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@Transactional
public class TrademarkBeanServiceImpl extends AbstractBizCommonService<TrademarkBean, String> implements TrademarkBeanService{

    public TrademarkBeanRepository getRepository(){
        return (TrademarkBeanRepository) super.getRepository();
    }

    @Autowired
    PicOrc picOrc;
    @Autowired
    WordComponent wordComponent;

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

            //去除中文数字和_和空格和, 剩下字符长度大于3的
            if(isEnglishLengthMore(bean.getName(),3)){
                //地区不是国外
                if(!isFremdness(bean.getAddress())){
                    if(!isChaofan(bean.getAgency())){
                        arr.add(bean);
                    }
                }
            }
            //全中文和数字的不要
            //if(!ChineseUtil.isMathAndChinese(bean.getName())){}
        }
        return arr;
    }

    @Override
    public String filterName(String name){
        //去除中文数字和_和空格和, 剩下字符长度大于3的
        if(isEnglishLengthMore(name,3)){
           return name;
        }
        return "";
    }


    @Override
    public String formatterName(String name) {
        name = ChineseUtil.removeChinese(name);
        name = ChineseUtil.removeMark(name);
        return name.trim();
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

        List<TrademarkBean> arr = page.getContent();
        pageBean.setItems(arr);
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

        TrademarkBean picDate = new TrademarkBean();
        OrcData gao = null;
        try {
            gao = picOrc.gao(trademarkBean.getDataPicPath());
        } catch (IOException e) {
            L.e("图片高级识别失败",trademarkBean.getDataPicPath());
            L.exception(e);
            return trademarkBean;
        }
        ConvertUtil.convert(gao,picDate);
        BeanUtil.matchPicData2(trademarkBean,picDate);
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
        boolean ismkdir = folder.mkdirs();

        HashMap<String, List<TrademarkBean>> hm = classify(trademarkBeanList);
        for (List<TrademarkBean> value : hm.values()) {
            value.sort(new LeiBieAndmOrder());
            liuShuiNum = generator(folder,value,liuShuiNum);
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

    private HashMap<String, List<TrademarkBean>> classify(List<TrademarkBean> trademarkBeanList) {
        HashMap<String, List<TrademarkBean>> hm = new HashMap<>();
        for (TrademarkBean trademarkBean : trademarkBeanList) {
            if(!StringUtils.isEmpty(trademarkBean.getAnalysisName())){
                List<TrademarkBean> trademarkBeans = hm.get(trademarkBean.getAnalysisName());
                if(trademarkBeans==null){
                    trademarkBeans = new ArrayList<>();
                    hm.put(trademarkBean.getAnalysisName(),trademarkBeans);
                }
                trademarkBeans.add(trademarkBean);
            }else {
                List<TrademarkBean> trademarkBeans = hm.get(trademarkBean.getName());
                if(trademarkBeans==null){
                    trademarkBeans = new ArrayList<>();
                    hm.put(trademarkBean.getName(),trademarkBeans);
                }
                trademarkBeans.add(trademarkBean);
            }

        }
        return hm;
    }


    private int generator(File folder,List<TrademarkBean> trademarkBeanList, int liuShuiNum){
        if (trademarkBeanList.size()==0)return liuShuiNum;
        int preLiushuiNum = liuShuiNum;
        ArrayList<WordTrademarkBean> wordTrademarkBeanList = new ArrayList<>();
        TrademarkBean trademarkBean = trademarkBeanList.get(0);
        File ziFolder = new File(folder,getZipName(trademarkBean,liuShuiNum));
        boolean ismkdir = ziFolder.mkdirs();
        for (int i = 0; i < trademarkBeanList.size(); i++) {
            int index = i+1;
            TrademarkBean bean = trademarkBeanList.get(i);
            new File(folder,getZipName(bean,liuShuiNum)).mkdirs();
            //复制文件
            try {
                copyPic(ziFolder,bean.getPastePicPath(),"paste"+index+".jpg");
                copyPic(ziFolder,bean.getPicPath(),"original"+index+".jpg");
                //处理word
                WordTrademarkBean wordTrademarkBean = new WordTrademarkBean();
                BeanUtils.copyProperties(wordTrademarkBean,bean);
                wordTrademarkBean.setLiushui(liuShuiNum);
                wordTrademarkBeanList.add(wordTrademarkBean);

            } catch (IOException e) {
                L.exception(e);
            } catch (IllegalAccessException e) {
                L.exception(e);
            } catch (InvocationTargetException e) {
                L.exception(e);
            }
            liuShuiNum++;
        }
        wordComponent.autoWord(wordTrademarkBeanList,getTargetWordFile(ziFolder,preLiushuiNum));
        return liuShuiNum;
    }

    private void copyPic(File folder,String picPath,String fileName) throws IOException {
        if(!StringUtils.isEmpty(picPath)){
            File pastePicFile = new File(picPath);
            if(pastePicFile.exists()){
                FileUtils.copyFile(pastePicFile,new File(folder,fileName));
            }
        }
    }

    SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMdd");
    private File getTargetWordFile(File ziFolder, int liuShuiNum) {
        return new File(ziFolder,"AK19"+liuShuiNum+"-"+formatter.format(new Date())+"-TC-Report.docx");
    }


    @Override
    public void deleteByAnnum(String annum) {
        getRepository().deleteByAnNum(annum);
    }

    @Override
    public TrademarkBean findTopByAnNum(String annum) {
        return getRepository().findTopByAnNum(annum);
    }

    @Override
    public List<TrademarkBean> findByPicEncode(String encode) {
        return getRepository().findByPicEncode(encode);
    }

    @Override
    public boolean isContains(String id) {
        List<String> ids = getRepository().findIds(id);
        return ids.size()>0;
    }

    @Override
    public List<String> sortStringCount(List<String> names) {
        HashMap<String, Count> hs = new HashMap<>();
        for (String name : names) {
            Count count = hs.get(name);
            if(count ==null){
                count = new Count(name);
                hs.put(name,count);
            }
            count.add();
        }
        ArrayList<Count> counts = new ArrayList<>();
        counts.addAll(hs.values());

        Collections.sort(counts,new Comparator<Count>(){
            @Override
            public int compare(Count o1, Count o2) {
                return o2.getCount()-o1.getCount();
            }
        });

        ArrayList<String> arr = new ArrayList<>();
        for (Count count : counts) {
            arr.add(count.getValue());
        }

        return arr;
    }

    @Override
    public List<TrademarkBean> findByAnalysisName(String analysisName) {
        if(StringUtils.isEmpty(analysisName))return new ArrayList<>(1);
        return getRepository().findByAnalysisName(analysisName);
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
            FileUtils.writeLines(file, MyEncoding.getEncode(),lines);
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
        return "AK19"+liuShuiNum+"-LCB "+trademarkBean.getName()+leibie+" 潜在异议-xuli";
    }

    //创建要粘贴的图片的图片名称
    private String getPastePicName(TrademarkBean trademarkBean) {
        return new File(trademarkBean.getPastePicPath()).getName();
    }

    private boolean isChaofan(String agency) {
        return StringUtils.equals(agency,"超凡知识产权服务股份有限公司");
    }

    @Override
    public boolean isFremdness(String address) {
        if(StringUtils.isEmpty(address))return false;
        if(StringUtils.contains(address,"香港")||
                StringUtils.contains(address,"澳门")||
                StringUtils.contains(address,"台湾")){
            return false;
        }
        address = ChineseUtil.matchEnglish(address);
        return address.length()>5;
    }

    @Override
    public TrademarkBean orcNormal(TrademarkBean trademarkBean) {
        if(StringUtils.equals(trademarkBean.getAnalysType(),TrademarkBean.ANALYS_NORMAL))return trademarkBean;

        TrademarkBean picDate = new TrademarkBean();
        OrcData normal = null;
        try {
            normal = picOrc.normal(trademarkBean.getDataPicPath());
        } catch (IOException e) {
            L.e("图片普通识别失败",trademarkBean.getDataPicPath());
            L.exception(e);
            return trademarkBean;
        }
        ConvertUtil.convert(normal,picDate);
        BeanUtil.matchPicData2(trademarkBean,picDate);
        trademarkBean.setAnalysType(TrademarkBean.ANALYS_NORMAL);
        return trademarkBean;
    }

    @Override
    public void saveCount(String analysName, int count) {
        getRepository().saveCount(analysName,count);
    }

    private boolean isEnglishLengthMore(String name, int i) {
        if(StringUtils.isEmpty(name))return false;
        String s = ChineseUtil.matchEnglish(name);
        return s.length()>i;
    }

}
