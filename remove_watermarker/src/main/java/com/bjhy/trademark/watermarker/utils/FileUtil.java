package com.bjhy.trademark.watermarker.utils;

import java.io.File;

/**
 * Create by: Jackson
 */
public class FileUtil {


    public static File formatFile(File file){
        return new File(file.toURI().getPath());
    }
}
