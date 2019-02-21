package com.bjhy.trademark.data.auto_word;

import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.usermodel.Range;
import org.apache.poi.ooxml.POIXMLDocument;
import org.apache.poi.xwpf.usermodel.*;
import org.apache.xmlbeans.impl.values.XmlValueDisconnectedException;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Create by: Jackson
 */
public class WordUtils {

    private static void replaceXWPFParagraph(XWPFParagraph paragraph, Map<String, String> map){
        List<XWPFRun> runs = paragraph.getRuns();
        try {
            for (int i = 0; i < runs.size(); i++) {
                String oneparaString = runs.get(i).getText(runs.get(i).getTextPosition());
                if(oneparaString==null)continue;
                for (Map.Entry<String, String> entry : map.entrySet()) {
                    oneparaString = oneparaString.replace(entry.getKey(), entry.getValue());
                }
                runs.get(i).setText(oneparaString, 0);
            }
        }catch (XmlValueDisconnectedException e){

        }
    }

    //读取数据 docx
    public static boolean replaceAndGenerateWord(String srcPath,
                                                 String destPath, Map<String, String> map) {
        String[] sp = srcPath.split("\\.");
        String[] dp = destPath.split("\\.");
        if ((sp.length > 0) && (dp.length > 0)) {// 判断文件有无扩展名
            // 比较文件扩展名
            if (sp[sp.length - 1].equalsIgnoreCase("docx")) {
                try {
                    XWPFDocument document = new XWPFDocument(
                            POIXMLDocument.openPackage(srcPath));
                    List<IBodyElement> bodyElements = document.getBodyElements();
                    for (int i = 0; i < bodyElements.size(); i++) {
                        IBodyElement iBodyElement = bodyElements.get(i);
                        BodyElementType elementType = iBodyElement.getElementType();
                        if(elementType == BodyElementType.PARAGRAPH){
                            XWPFParagraph paragraph = (XWPFParagraph) iBodyElement;
                            replaceXWPFParagraph(paragraph,map);
                        }else if (elementType == BodyElementType.TABLE){
                            XWPFTable table = (XWPFTable) iBodyElement;
                            int rcount = table.getNumberOfRows();
                            for (int j = 0; j < rcount; j++) {
                                XWPFTableRow row = table.getRow(j);
                                List<XWPFTableCell> cells = row.getTableCells();
                                for (XWPFTableCell cell : cells) {
                                    String cellTextString = cell.getText();
                                    for (Map.Entry<String, String> e : map.entrySet()) {
                                        if (cellTextString.contains(e.getKey()))
                                            cellTextString = cellTextString
                                                    .replace(e.getKey(),
                                                            e.getValue());
                                    }
                                    List<XWPFParagraph> paragraphs = cell.getParagraphs();
                                    for (XWPFParagraph paragraph : paragraphs) {
                                        replaceXWPFParagraph(paragraph,map);
                                    }

                                    // cell.removeParagraph(0);
                                    //cell.setText(cellTextString);

                                }
                            }
                        }
                    }
                    FileOutputStream outStream = null;
                    outStream = new FileOutputStream(destPath);
                    document.write(outStream);
                    outStream.close();
                    return true;
                } catch (Exception e) {
                    e.printStackTrace();
                    return false;
                }

            } else
                // doc只能生成doc，如果生成docx会出错
                if ((sp[sp.length - 1].equalsIgnoreCase("doc"))
                        && (dp[dp.length - 1].equalsIgnoreCase("doc"))) {
                    HWPFDocument document = null;
                    try {
                        document = new HWPFDocument(new FileInputStream(srcPath));
                        Range range = document.getRange();
                        for (Map.Entry<String, String> entry : map.entrySet()) {
                            range.replaceText(entry.getKey(), entry.getValue());
                        }
                        FileOutputStream outStream = null;
                        outStream = new FileOutputStream(destPath);
                        document.write(outStream);
                        outStream.close();
                        return true;
                    } catch (FileNotFoundException e) {
                        e.printStackTrace();
                        return false;
                    } catch (IOException e) {
                        e.printStackTrace();
                        return false;
                    }
                } else {
                    return false;
                }
        } else {
            return false;
        }
    }




}
