package com.bjhy.trademark.core.controller;

import com.bjhy.trademark.core.TrademarkConfig;
import org.apel.gaia.commons.i18n.Message;
import org.apel.gaia.commons.i18n.MessageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.FileOutputStream;

/**
 * Create by: Jackson
 */
@Controller
@RequestMapping("/upload")
public class FileUploadController {


    @Autowired
    TrademarkConfig trademarkConfig;


    //首页
    @RequestMapping(value = "index", method = RequestMethod.GET)
    public String index(){
        return "upload_index";
    }

    //处理文件上传
    @RequestMapping(value="/upload_trademark_data", method = RequestMethod.POST)
    public @ResponseBody Message uploadImg(@RequestParam("file") MultipartFile file,
                      HttpServletRequest request) {

        String contentType = file.getContentType();   //图片文件类型
        String fileName = file.getOriginalFilename();  //图片名字

        //文件存放路径
        String storePath = trademarkConfig.getStorePath();
        //调用文件处理类FileUtil，处理文件，将文件写入指定位置
        try {
            storeFile(file.getBytes(), storePath, System.currentTimeMillis()+"");
        } catch (Exception e) {
            // TODO: handle exception
        }

        // 返回图片的存放路径
        return MessageUtil.message("common.create.success");
    }


    private static void storeFile(byte[] file, String filePath, String fileName) throws Exception{
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
