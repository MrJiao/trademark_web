package com.bjhy.trademark.core.controller;

import com.bjhy.tlevel.datax.common.utils.SpringBeanUtil;
import com.bjhy.trademark.common.utils.ZipUtil;
import com.bjhy.trademark.core.TrademarkConfig;
import com.bjhy.trademark.core.pojo.Remark;
import com.bjhy.trademark.core.service.AnalysService;
import com.bjhy.trademark.core.service.impl.GetTrademarkTask;
import com.bjhy.trademark.data.auto_word.WordComponent;
import org.apache.commons.lang3.StringUtils;
import org.apel.gaia.commons.i18n.Message;
import org.apel.gaia.commons.i18n.MessageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

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
    public String index() {
        return "upload_index";
    }

    SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss");

    //处理文件上传
    @RequestMapping(value = "/upload_trademark_data", method = RequestMethod.POST)
    public @ResponseBody
    Message uploadData(@RequestParam("file") MultipartFile file, @RequestParam("remark") String remark, @RequestParam("remark2") String remark2, @RequestParam("remark3") String remark3) throws IOException {
        Remark remarkObj = new Remark(remark, remark2, remark3);
        String contentType = file.getContentType();   //文件类型
        String fileName = file.getOriginalFilename();  //名字
        File data = null;
        File url = null;
        //文件存放路径
        String tempPath = trademarkConfig.getTempPath();
        if (StringUtils.equals(fileName, "data.txt")) {
            data = new File(tempPath, "data" + sf.format(new Date()) + ".txt");
            url = new File(tempPath, "url" + sf.format(new Date()) + ".txt");
            storeFile(file.getBytes(),data.getParent(),data.getName());
        } else if (StringUtils.equals(fileName, "url.txt")) {
            data = new File(tempPath, "data" + sf.format(new Date()) + ".txt");
            url = new File(tempPath, "url" + sf.format(new Date()) + ".txt");
            storeFile(file.getBytes(),url.getParent(),url.getName());
        } else if (StringUtils.endsWith(fileName, "zip")) {
            fileName = fileName.replaceAll(".zip", "");

            //调用文件处理类FileUtil，处理文件，将文件写入指定位置
            File storeFolder = new File(tempPath, sf.format(new Date()));
            File zipFile = new File(storeFolder, fileName + ".zip");
            storeFile(file.getBytes(), zipFile.getParent(), zipFile.getName());
            ZipUtil.unZip(zipFile, storeFolder.getAbsolutePath(), 1024);
            data = new File(storeFolder, fileName + File.separator + "data.txt");
            url = new File(storeFolder, fileName + File.separator + "url.txt");
        }


        GetTrademarkTask bean = SpringBeanUtil.getBean(GetTrademarkTask.class, url, data, remarkObj);
        new Thread(bean).start();
        return MessageUtil.message("upload.create.success");
    }

    @RequestMapping(value = "/upload_trademark_name", method = RequestMethod.POST)
    public @ResponseBody
    Message uploadNum(@RequestParam("file") MultipartFile file, @RequestParam("remark") String remark, @RequestParam("remark2") String remark2, @RequestParam("remark3") String remark3) throws IOException {
        Remark remarkObj = new Remark(remark, remark2, remark3);
        String contentType = file.getContentType();   //图片文件类型
        String fileName = file.getOriginalFilename();  //文件
        //文件存放路径
        String tempPath = trademarkConfig.getTempPath();
        //调用文件处理类FileUtil，处理文件，将文件写入指定位置
        File storeFile = new File(tempPath, System.currentTimeMillis() + ".txt");
        storeFile(file.getBytes(), tempPath, storeFile.getName());
        analysService.trademarkName(remarkObj, storeFile);
        return MessageUtil.message("common.update.success");
    }

    @RequestMapping(value = "/upload_trademark_ids", method = RequestMethod.POST)
    public @ResponseBody
    Message uploadIds(@RequestParam("file") MultipartFile file, @RequestParam("remark") String remark, @RequestParam("remark2") String remark2, @RequestParam("remark3") String remark3) throws IOException {
        Remark remarkObj = new Remark(remark, remark2, remark3);
        //文件存放路径
        String tempPath = trademarkConfig.getTempPath();
        //调用文件处理类FileUtil，处理文件，将文件写入指定位置
        File storeFile = new File(tempPath, System.currentTimeMillis() + ".txt");
        storeFile(file.getBytes(), tempPath, storeFile.getName());
        analysService.trademarkIds(remarkObj, storeFile);
        return MessageUtil.message("common.update.success");
    }

    private static void storeFile(byte[] file, String filePath, String fileName) throws IOException {
        File targetFile = new File(filePath);
        if (!targetFile.exists()) {
            boolean ismkdir = targetFile.mkdirs();
        }
        FileOutputStream out=null;
        try {
             out = new FileOutputStream(filePath + File.separator + fileName);
            out.write(file);
            out.flush();
        }finally {
            if(out!=null)
                out.close();
        }


    }


    @Autowired
    WordComponent wordComponent;
    @GetMapping("temp")
    public @ResponseBody String temp(String address){
        return wordComponent.formatterAddress(address);
    }


}
