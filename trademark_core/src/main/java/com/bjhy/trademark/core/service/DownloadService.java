package com.bjhy.trademark.core.service;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.UnsupportedEncodingException;

/**
 * Create by: Jackson
 */
public interface DownloadService {
    ResponseEntity<InputStreamResource> downloadFile(File file, String fileName) throws FileNotFoundException, UnsupportedEncodingException;
}
