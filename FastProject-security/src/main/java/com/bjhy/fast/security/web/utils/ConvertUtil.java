package com.bjhy.fast.security.web.utils;



import com.bjhy.fast.security.domain.UserInfo;
import com.bjhy.fast.security.vo.UserInfoVo;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * Create by: Jackson
 */
public class ConvertUtil {




    private static String getPathName(String path){
        return new File(path).getName();
    }






  	/**
  	 * 把DatabaseConfig vo对象 转换为DBConfig
  	 * @author welldo
  	 */


    public static List<UserInfoVo> convertUserInfoList(List<UserInfo> userInfoList){
        ArrayList<UserInfoVo> userInfoVoList = new ArrayList<>();
        for(UserInfo userInfo : userInfoList){
            UserInfoVo userInfoVo = new UserInfoVo(userInfo);
            userInfoVoList.add(userInfoVo);
        }
        return userInfoVoList;
    }


}
