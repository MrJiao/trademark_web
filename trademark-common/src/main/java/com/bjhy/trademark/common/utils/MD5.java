package com.bjhy.trademark.common.utils;

/**
 * Create by: Jackson
 */
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Component
public class MD5 {

    MessageDigest digest ;

    public MD5() throws NoSuchAlgorithmException {
        digest = MessageDigest.getInstance("md5");
    }

    /**
     * 可以把一段文字转换为MD
     * Can convert a file to MD5
     * @param text
     * @return md5
     */
    public String encode(String text){
        byte[] buffer = digest.digest(text.getBytes());
        // byte -128 ---- 127
        StringBuffer sb = new StringBuffer();
        for (byte b : buffer) {
            int a = b & 0xff;
            // Log.d(TAG, "" + a);
            String hex = Integer.toHexString(a);

            if (hex.length() == 1) {
                hex = 0 + hex;
            }
            sb.append(hex);
        }
        return sb.toString();
    }

}
