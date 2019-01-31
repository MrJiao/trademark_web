package com.bjhy.trademark.common;

import java.io.File;

/**
 * Create by: Jackson
 */
public class RootPath {
    private String  getRootPath() {
        String runtimePath;
        if(false){
            String path = RootPath.class.getProtectionDomain().getCodeSource().getLocation().getPath();
            runtimePath = new File(path).getParent();
        }else {
            runtimePath = System.getProperty("user.dir");
        }
        return runtimePath;
    }
}
