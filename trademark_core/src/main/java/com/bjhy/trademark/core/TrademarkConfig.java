package com.bjhy.trademark.core;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Create by: Jackson
 */
@Component
@ConfigurationProperties(prefix="trademark")
public class TrademarkConfig {
    String storePath;

    String tempPath;//临时文件的文件夹

    public String getTempPath() {
        return tempPath;
    }

    public void setTempPath(String tempPath) {
        this.tempPath = tempPath;
    }

    public String getStorePath() {
        return storePath;
    }

    public void setStorePath(String storePath) {
        this.storePath = storePath;
    }
}
