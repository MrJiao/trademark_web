package com.bjhy.trademark.core.service;

import java.io.File;

/**
 * Create by: Jackson
 */
public interface AnalysService {
    void trademarkData(File storeFile);

    void trademarkName(String annm, File storeFile);
}
