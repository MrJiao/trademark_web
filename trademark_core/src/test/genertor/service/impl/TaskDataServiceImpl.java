package com.bjhy.trademark.core.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bjhy.trademark.core.domain.TaskData;
import com.bjhy.trademark.core.service.TaskDataService;
import com.bjhy.tlevel.datax.fast.dao.TaskDataRepository;
import org.apel.gaia.infrastructure.impl.AbstractBizCommonService;

@Service
@Transactional
public class TaskDataServiceImpl extends AbstractBizCommonService<TaskData, String> implements TaskDataService{

    public TaskDataRepository getRepository(){
        return (TaskDataRepository) super.getRepository();
    }

}
