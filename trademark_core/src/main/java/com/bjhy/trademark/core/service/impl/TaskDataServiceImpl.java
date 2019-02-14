package com.bjhy.trademark.core.service.impl;

import com.bjhy.trademark.core.dao.TaskDataRepository;
import org.apel.gaia.infrastructure.impl.AbstractBizCommonService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bjhy.trademark.core.domain.TaskData;
import com.bjhy.trademark.core.service.TaskDataService;

@Service
@Transactional
public class TaskDataServiceImpl extends AbstractBizCommonService<TaskData, String> implements TaskDataService{

    public TaskDataRepository getRepository(){
        return (TaskDataRepository) super.getRepository();
    }

}
