package com.bjhy.fast.build.start.init;

import com.bjhy.trademark.core.TrademarkConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;

/**
 * Create by: Jackson
 */
@Component
public class Init implements CommandLineRunner {
    @Override
    public void run(String... strings) throws Exception {
        initFolder();
    }
    @Autowired
    TrademarkConfig trademarkConfig;
    private void initFolder() {
        boolean ismkdir = new File(trademarkConfig.getStorePath()).mkdirs();
        boolean ismkdir2 = new File(trademarkConfig.getTempPath()).mkdirs();
    }
}
