package com.bjhy.fast.build.start.init.core;

/**
 * Create by: Jackson
 */
public interface VersionInf {

    /**
     * 该版本的版本号必须大于上一个版本的版本号，必须为正整数
     * @return 返回该版本处理器的版本号
     */
    int getVersion();

    /**
     * 根据当前版本特点做数据初始化操作，只考虑和上一版本的差异
     */
    void init();


    /**
     * 是否可用
     * @return true：可用被执行  false：不会被执行
     */
    boolean isEnable();

}
