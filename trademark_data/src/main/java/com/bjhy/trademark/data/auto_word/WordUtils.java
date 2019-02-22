package com.bjhy.trademark.data.auto_word;

import org.apache.commons.io.FileUtils;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.usermodel.Range;
import org.apache.poi.ooxml.POIXMLDocument;
import org.apache.poi.xwpf.usermodel.*;
import org.apache.xmlbeans.impl.values.XmlValueDisconnectedException;

import java.io.*;
import java.util.List;
import java.util.Map;

/**
 * Create by: Jackson
 */
public class WordUtils {

    private static void replaceXWPFParagraph(XWPFParagraph paragraph, Map<String, String> map) {
        List<XWPFRun> runs = paragraph.getRuns();
        try {
            for (int i = 0; i < runs.size(); i++) {
                String oneparaString = runs.get(i).getText(runs.get(i).getTextPosition());
                if (oneparaString == null) continue;
                for (Map.Entry<String, String> entry : map.entrySet()) {
                    oneparaString = oneparaString.replace(entry.getKey(), entry.getValue());
                }
                runs.get(i).setText(oneparaString, 0);
            }
        } catch (XmlValueDisconnectedException e) {

        }
    }

    //读取数据 docx
    public static void replaceAndGenerateWord(String srcPath,
                                              String destPath, Map<String, String> map) throws IOException {
        File src = new File(srcPath);
        File src2 = new File(src.getParent(), System.currentTimeMillis() + "");
        FileUtils.copyFile(src, src2);
        srcPath = src2.getAbsolutePath();
        String[] sp = srcPath.split("\\.");
        String[] dp = destPath.split("\\.");
        if ((sp.length > 0) && (dp.length > 0)) {// 判断文件有无扩展名
            // 比较文件扩展名
            if (sp[sp.length - 1].equalsIgnoreCase("docx")) {
                generateDocx(srcPath, map);

            } else if
            ((sp[sp.length - 1].equalsIgnoreCase("doc"))
                            && (dp[dp.length - 1].equalsIgnoreCase("doc"))) {
                generateDoc(srcPath, map);
            }
        }
        src2.renameTo(new File(destPath));
    }

    private static void generateDoc(String srcPath, Map<String, String> map) throws IOException {
        // doc只能生成doc，如果生成docx会出错
        HWPFDocument document = null;
        try {
            document = new HWPFDocument(new FileInputStream(srcPath));
            Range range = document.getRange();
            for (Map.Entry<String, String> entry : map.entrySet()) {
                range.replaceText(entry.getKey(), entry.getValue());
            }
        } finally {
            try {
                if (document != null)
                    document.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private static void generateDocx(String srcPath, Map<String, String> map) throws IOException {
        XWPFDocument document = null;
        try {
            document = new XWPFDocument(
                    POIXMLDocument.openPackage(srcPath));
            List<IBodyElement> bodyElements = document.getBodyElements();

            for (int i = 0; i < bodyElements.size(); i++) {
                IBodyElement iBodyElement = bodyElements.get(i);
                BodyElementType elementType = iBodyElement.getElementType();
                if (elementType == BodyElementType.PARAGRAPH) {
                    XWPFParagraph paragraph = (XWPFParagraph) iBodyElement;
                    replaceXWPFParagraph(paragraph, map);
                } else if (elementType == BodyElementType.TABLE) {
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
                                replaceXWPFParagraph(paragraph, map);
                            }
                        }
                    }
                }
            }

        } finally {
            try {
                if (document != null)
                    document.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

    }


}
