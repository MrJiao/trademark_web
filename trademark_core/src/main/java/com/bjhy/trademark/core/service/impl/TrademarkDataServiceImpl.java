package com.bjhy.trademark.core.service.impl;

import com.bjhy.tlevel.datax.common.utils.SpringBeanUtil;
import com.bjhy.trademark.common.net.WaitStrategy;
import com.bjhy.trademark.common.utils.DownloadUtil;
import com.bjhy.trademark.core.TrademarkConfig;
import com.bjhy.trademark.core.domain.TaskData;
import com.bjhy.trademark.core.service.TaskDataService;
import com.bjhy.trademark.core.service.TrademarkDataService;
import com.bjhy.trademark.data.downloadPic.GetImageSearchId;
import com.bjhy.trademark.data.downloadPic.GetImageUrlTask;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.util.HashSet;
import java.util.Set;

/**
 * Create by: Jackson
 */
@Service
@Transactional
public class TrademarkDataServiceImpl implements TrademarkDataService {


    @Override
    public void getTrademark(TaskData taskData) {

        GetTrademarkTask bean = SpringBeanUtil.getBean(GetTrademarkTask.class, taskData);
        new Thread(bean).start();
    }




}
