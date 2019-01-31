package com.bjhy.fast.security.web.utils;

import org.apache.commons.lang3.StringUtils;
import org.apel.gaia.commons.jqgrid.QueryParams;

import java.util.HashMap;
import java.util.Map;

/**
 * Create by: Jackson
 */
public class JQGridUtil {


    //对多参数进行获取
    public static Map<String,String> getParams(QueryParams queryParams){
        String searchString = queryParams.getSearchString();
        HashMap<String, String> hm = new HashMap<>();
        if(StringUtils.isEmpty(searchString))return hm;
        String[] searchStrings = searchString.split(",");
        String  searchField= queryParams.getSearchField();
        String[] searchFields = searchField.split(",");
        if(searchStrings.length != searchFields.length){
            throw new RuntimeException("jqgread 传递的参数异常");
        }
        for (int i = 0; i < searchFields.length; i++) {
            String fieldName = searchFields[i];
            String fieldValue = searchStrings[i];
            hm.put(fieldName,fieldValue);
        }
        return hm;

    }

}
