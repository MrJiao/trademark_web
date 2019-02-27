package com.bjhy.trademark.core.service;

import com.bjhy.trademark.core.pojo.Remark;

import java.io.File;

/**
 * Create by: Jackson
 */
public interface AnalysService {
    void trademarkData(File storeFile);

    void trademarkName(Remark remarkObj, File storeFile);

}
