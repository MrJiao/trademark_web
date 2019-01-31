package com.bjhy.trademark.watermarker.utils;


import java.util.Scanner;

/**
 * Create by: Jackson
 */
public class HappyInputUtil {

    public static String getInput() {
        Scanner scan = new Scanner(System.in);
        String read = null;
        while (true) {
            read = scan.nextLine();
            if (StringUtils.isEmpty(read))
                continue;
            break;
        }
        return read;
    }

}
