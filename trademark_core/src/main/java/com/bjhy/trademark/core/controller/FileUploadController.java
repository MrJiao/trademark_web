package com.bjhy.trademark.core.controller;

import com.bjhy.trademark.core.TrademarkConfig;
import com.bjhy.trademark.core.service.AnalysService;
import org.apel.gaia.commons.i18n.Message;
import org.apel.gaia.commons.i18n.MessageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * Create by: Jackson
 */
@Controller
@RequestMapping("/upload")
public class FileUploadController {


    @Autowired
    TrademarkConfig trademarkConfig;

    @Autowired
    AnalysService analysService;

    //首页
    @RequestMapping(value = "index", method = RequestMethod.GET)
    public String index(){
        return "upload_index";
    }

    //处理文件上传
    @RequestMapping(value="/upload_trademark_data", method = RequestMethod.POST)
    public @ResponseBody Message uploadData(@RequestParam("file") MultipartFile file) throws IOException {
        String contentType = file.getContentType();   //图片文件类型
        String fileName = file.getOriginalFilename();  //图片名字
        //文件存放路径
        String tempPath = trademarkConfig.getTempPath();
        //调用文件处理类FileUtil，处理文件，将文件写入指定位置
        File storeFile = new File(tempPath, System.currentTimeMillis() + ".txt");
        storeFile(file.getBytes(), tempPath,storeFile.getName());
        analysService.trademarkData(storeFile);
        storeFile.delete();
        return MessageUtil.message("common.update.success");
    }

    @RequestMapping(value="/upload_trademark_name", method = RequestMethod.POST)
    public @ResponseBody Message uploadNum(@RequestParam("file") MultipartFile file,@RequestParam("annm")String annm) throws IOException {
        String contentType = file.getContentType();   //图片文件类型
        String fileName = file.getOriginalFilename();  //文件
        //文件存放路径
        String tempPath = trademarkConfig.getTempPath();
        //调用文件处理类FileUtil，处理文件，将文件写入指定位置
        File storeFile = new File(tempPath, System.currentTimeMillis() + ".txt");
        storeFile(file.getBytes(), tempPath,storeFile.getName());
        analysService.trademarkName(annm,storeFile);
        storeFile.delete();
        return MessageUtil.message("common.update.success");
    }


    private static void storeFile(byte[] file, String filePath, String fileName) throws IOException {
        File targetFile = new File(filePath);
        if(!targetFile.exists()){
            targetFile.mkdirs();
        }
        FileOutputStream out = new FileOutputStream(filePath+File.separator+fileName);
        out.write(file);
        out.flush();
        out.close();
    }
}
