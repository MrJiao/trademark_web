package com.bjhy.trademark.data.auto_word;

import org.apache.commons.lang3.StringUtils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Create by: Jackson
 */
public class AddressUtil {

    private static final String CONTENT_CITY = "[省]*.+[市]";
    private static final Pattern CITY_PATTERN = Pattern.compile(CONTENT_CITY);

    public static String getCity(String address)throws NotFoundPinYin {
        int shengIndex = address.indexOf("省");
        int cityIndex = address.indexOf("市");
        if(cityIndex<0){
            return "";
        }
        return address.substring(shengIndex+1,cityIndex+1);
    }

    public static String getQuCounty(String address)throws NotFoundPinYin {
        int shengIndex = address.indexOf("市");
        int cityIndex = address.indexOf("县");
        if(cityIndex<0){
            return "";
        }
        return address.substring(shengIndex+1,cityIndex+1);
    }

    public static String getShiCounty(String address)throws NotFoundPinYin {
        int shengIndex = address.indexOf("省");
        int cityIndex = address.indexOf("县");
        if(cityIndex<0){
            return "";
        }
        return address.substring(shengIndex+1,cityIndex+1);
    }

    public static String getDistrcist(String address)throws NotFoundPinYin {
        int shengIndex = address.indexOf("市");
        int cityIndex = address.indexOf("区");
        if(cityIndex<0){
            return "";
        }
        return address.substring(shengIndex+1,cityIndex+1);
    }

    public static String getProvince(String address)throws NotFoundPinYin {
        int shengIndex = address.indexOf("国");
        int cityIndex = address.indexOf("省");
        if(cityIndex<0){
            return "";
        }
        return address.substring(shengIndex+1,cityIndex+1);
    }
}
