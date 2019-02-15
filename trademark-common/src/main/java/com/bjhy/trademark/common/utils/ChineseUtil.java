package com.bjhy.trademark.common.utils;

import org.apache.commons.lang3.StringUtils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Create by: Jackson
 */
public class ChineseUtil {


    /**
     * 类*.java的实现描述：数字工具类
     *
     * @author fangcheng.xiaofc 2009-4-23,下午09:43:57
     */

    /**
     * 全中文判断
     */
    private static final String CONTENT_CHINESE_REGEX = "^[\u4e00-\u9fa5]+$";
    private static final String MATCH_CONTENT_CHINESE_REGEX = "[\u4e00-\u9fa5]";

    private static final String MATCH_CONTENT_MATH_REGEX = "\\d";

    private static final String MATCH_CONTENT_MATH_CHINESE_REGEX = "[\\u4e00-\\u9fa5_0-9,]+";

    private static final Pattern CONTENT_CHINESE_PATTERN = Pattern.compile(CONTENT_CHINESE_REGEX);
    private static final Pattern MATCH_CONTENT_CHINESE__PATTERN = Pattern.compile(MATCH_CONTENT_CHINESE_REGEX);
    private static final Pattern MATCH_CONTENT_MATH__PATTERN = Pattern.compile(MATCH_CONTENT_MATH_REGEX);
    private static final Pattern MATCH_CONTENT_MATH_CHINESE__PATTERN = Pattern.compile(MATCH_CONTENT_MATH_CHINESE_REGEX);


    /**
     * 判断所有的字符是否都是中文
     *
     * @param str
     * @return
     */
    public static boolean isChinese(String str) {
        if (StringUtils.isBlank(str)) {
            return false;
        }
        Matcher matcher = CONTENT_CHINESE_PATTERN.matcher(str.trim());
        return matcher.matches();
    }

    public static String removeChinese(String str){
        if(StringUtils.isEmpty(str))return "";
        Matcher mat=MATCH_CONTENT_CHINESE__PATTERN.matcher(str);
        return mat.replaceAll("").trim();
    }

    //删除数字
    public static String removeMath(String str){
        if(StringUtils.isEmpty(str))return "";
        Matcher mat=MATCH_CONTENT_MATH__PATTERN.matcher(str);
        return mat.replaceAll("").trim();
    }

    //删除数字和中文,下划线和逗号
    public static String removeMathAndChinese(String str){
        if(StringUtils.isEmpty(str))return "";
        Matcher mat=MATCH_CONTENT_MATH_CHINESE__PATTERN.matcher(str);
        return mat.replaceAll("").trim();
    }


}