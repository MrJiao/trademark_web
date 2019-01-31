package com.bjhy.fast.security;

import com.bjhy.fast.security.domain.UserInfo;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;


/**
 * Create by: Jackson
 */
public class UserDetailsUtil {

    /**
     * 当前登陆用户名
     */
    public static String getCurrentUserName() {
        if(getCurrentUser() != null){
            return getCurrentUser().getUsername();
        }
        return null;
    }

    /**
     * 当前登陆用户Id
     */
    public static String getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * 当前登陆用户
     */
    public static UserInfo getCurrentUser() {
        SecurityContext context = SecurityContextHolder.getContext();
        Authentication authentication = context.getAuthentication();
        if (authentication == null) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            return (UserInfo)principal;
        }else{
            return null;
        }
    }

/*  不能保证数据最新，如果有人修改了，那只能退出登录后才能获取到最新的数据
    private FTPAccount getFtpAccount(String ftpId){
        List<FileAuthority> fileAuthorityList = getCurrentUser().getFileAuthorityList();
        if(CollectionUtil.isEmpty(fileAuthorityList))return null;

        for (FileAuthority fileAuthority : fileAuthorityList) {
            if(StringUtils.equals(fileAuthority.getFtpAccount().getId(),ftpId)){
                return fileAuthority.getFtpAccount();
            }
        }
        return null;
    }

    public static List<FTPAccount> getFtpAccountList(String type) {
        List<FileAuthority> fileAuthorityList = getCurrentUser().getFileAuthorityList();
        ArrayList<FTPAccount> arr = new ArrayList<>();
        for(FileAuthority f:fileAuthorityList){
            if(StringUtils.equals(f.getTargetType(),type)){
                arr.add(f.getFtpAccount());
            }
        }
        return arr;
    }

    public static List<FTPAccount> getFtpAccountList() {
        List<FileAuthority> fileAuthorityList = getCurrentUser().getFileAuthorityList();
        ArrayList<FTPAccount> arr = new ArrayList<>();
        for(FileAuthority f:fileAuthorityList){
            arr.add(f.getFtpAccount());
        }
        return arr;
    }*/

    /**
     * 判断此用户是不是admin, 
     * 一定要在临时变量中累加roles! 别在rolesOfUser中累加!
     * @author welldo
     */
    public static boolean isAdmin(UserInfo userInfo){
    	
    	return true;
    }

}
