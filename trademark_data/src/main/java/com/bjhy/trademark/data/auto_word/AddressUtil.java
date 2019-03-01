package com.bjhy.trademark.data.auto_word;


/**
 * Create by: Jackson
 */
public class AddressUtil {

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
