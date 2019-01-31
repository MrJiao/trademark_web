package com.bjhy.fast.build.start.init.core;

import com.bjhy.tlevel.datax.common.utils.SpringBeanUtil;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * 用来初始化 数据初始化 对象的，会根据version进行按顺序执行
 * Create by: Jackson
 */
public class InitRegistrationCenter {

    /**
     * @param lastVersion 目前数据库中的菜单版本
     * @return 大于当前数据库菜单版本的 数据初始化对象
     */
    List<VersionInf> getUsefulVersions(int lastVersion){
        List<VersionInf> versions = getVersionInfs();
        List<VersionInf> usefulVersions = new ArrayList<>();
        for (VersionInf bean : versions) {
            if(bean.getVersion()>lastVersion)
                usefulVersions.add(bean);
        }
        usefulVersions.sort(new VersionCompare());
        return usefulVersions;
    }

    /**
     * 把 属性isEnable = true 的实现类, 加入到List中;
     */
    private List<VersionInf> getVersionInfs(){
        List<VersionInf> versionInfList = new ArrayList<>();
        Map<String, VersionInf> versionInfMap = SpringBeanUtil.getBeansOfType(VersionInf.class);
        for (VersionInf versionInf : versionInfMap.values()) {
            if(versionInf.isEnable())
                versionInfList.add(versionInf);
        }
        return versionInfList;
    }

    private static class VersionCompare implements Comparator<VersionInf>{

        @Override
        public int compare(VersionInf o1, VersionInf o2) {
            int i = o1.getVersion() - o2.getVersion();
            if(i==0)
                throw new VersionException("版本号一样了,不允许一样:"+o1.getClass().getName()+" "+o2.getClass().getName());
            return i;
        }
    }
}
