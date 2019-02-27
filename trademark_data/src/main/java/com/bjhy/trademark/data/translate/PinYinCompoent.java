package com.bjhy.trademark.data.translate;

import com.bjhy.tlevel.datax.common.utils.L;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.TreeMap;

/**
 * Create by: Jackson
 */
@Component
public class PinYinCompoent {
    File rootDir;
    TreeMap<String, String> tm;
    public PinYinCompoent(){

        rootDir = new File(System.getProperty("user.dir"));
        File source = new File(rootDir,"config" + File.separator + "source" + File.separator + "pinyin.xlsx");
        tm = new TreeMap<>();
        try {
            loadString(source,tm);
        } catch (IOException e) {
            L.e("加载拼音资源失败");
            L.exception(e);
        }
    }


    private void loadString(File file, TreeMap<String, String> treeMap) throws IOException {
        InputStream is = new FileInputStream(file);
        XSSFWorkbook excel = new XSSFWorkbook(is);
        try {
            for (int numSheet = 0; numSheet < excel.getNumberOfSheets(); numSheet++) {
                XSSFSheet sheet = excel.getSheetAt(numSheet);
                int lastRowNum = sheet.getLastRowNum();
                for (int index=0; index<lastRowNum;index++) {
                    XSSFRow row = sheet.getRow(index);
                    if(row==null)continue;
                    XSSFCell chineseCell = row.getCell(0);
                    XSSFCell pinYinCell = row.getCell(1);
                    if(chineseCell==null || pinYinCell==null) continue;
                    String chinese = chineseCell.getStringCellValue();
                    String pinYin = pinYinCell.getStringCellValue();
                    treeMap.put( chinese,pinYin);
                }
            }
        }finally {
            if(is!=null)
                is.close();
        }
    }

    public String getPinYin(String chinese){
        return tm.get(chinese);
    }

}
