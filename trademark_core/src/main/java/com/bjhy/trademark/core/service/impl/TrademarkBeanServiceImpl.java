package com.bjhy.trademark.core.service.impl;

import com.bjhy.trademark.common.utils.ChineseUtil;
import com.bjhy.trademark.core.dao.TrademarkBeanRepository;
import org.apache.commons.lang3.StringUtils;
import org.apel.gaia.commons.pager.PageBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bjhy.trademark.core.domain.TrademarkBean;
import com.bjhy.trademark.core.service.TrademarkBeanService;
import org.apel.gaia.infrastructure.impl.AbstractBizCommonService;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class TrademarkBeanServiceImpl extends AbstractBizCommonService<TrademarkBean, String> implements TrademarkBeanService{

    public TrademarkBeanRepository getRepository(){
        return (TrademarkBeanRepository) super.getRepository();
    }

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
            //全中文的不要
            if(!isAllChinese(bean.getName())){
                //字母大于3个
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
        Page<TrademarkBean> page = getRepository().findBySameName(annm,pageable);
        pageBean.setTotalRows( (int)page.getTotalElements() );
        pageBean.setItems(page.getContent());
        return pageBean;
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


    private boolean isAllChinese(String name){
        return ChineseUtil.isChinese(name);
    }




}
