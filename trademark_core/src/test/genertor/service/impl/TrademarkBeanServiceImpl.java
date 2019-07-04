package com.bjhy.trademark.core.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bjhy.trademark.core.domain.TrademarkBean;
import com.bjhy.trademark.core.service.TrademarkBeanService;
import com.bjhy.tlevel.datax.fast.dao.TrademarkBeanRepository;
import org.apel.gaia.infrastructure.impl.AbstractBizCommonService;

@Service
@Transactional
public class TrademarkBeanServiceImpl extends AbstractBizCommonService<TrademarkBean, String> implements TrademarkBeanService{

    public TrademarkBeanRepository getRepository(){
        return (TrademarkBeanRepository) super.getRepository();
    }

}
