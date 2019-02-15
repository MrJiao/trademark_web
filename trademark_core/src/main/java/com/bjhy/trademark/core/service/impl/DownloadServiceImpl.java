package com.bjhy.trademark.core.service.impl;

import com.bjhy.trademark.core.service.DownloadService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.io.*;

/**
 * Create by: Jackson
 */
@Component
public class DownloadServiceImpl implements DownloadService {
    @Override
    public ResponseEntity<InputStreamResource> downloadFile(File file, String fileName) throws FileNotFoundException, UnsupportedEncodingException {
        InputStream inputStream = new FileInputStream(file);
        InputStreamResource inputStreamResource = new InputStreamResource(inputStream);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.add("Content-Disposition",
                "attachment; filename=\"" + new String((fileName).getBytes("gb2312"),"ISO-8859-1") + "\"");
        headers.add("Pragma", "no-cache");
        headers.add("Expires", "0");
        return ResponseEntity
                .ok()
                .headers(headers)
                .contentLength(file.length())
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(inputStreamResource);
    }
}
