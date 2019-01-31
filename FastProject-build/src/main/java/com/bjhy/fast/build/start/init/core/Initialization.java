package com.bjhy.fast.build.start.init.core;

import com.bjhy.fast.build.core.dao.AllVersionRepository;
import com.bjhy.fast.build.core.domain.AllVersion;
import com.bjhy.tlevel.datax.common.utils.L;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Create by: Jackson
 */
@Component
public class Initialization implements CommandLineRunner {


    @Autowired
    AllVersionRepository versionRepository;

    private static final String APP_NAME = "APP_NAME";


    @Override
    public void run(String... strings) throws Exception {
        //获取当前数据库中的初始化数据版本号
        InitRegistrationCenter center = new InitRegistrationCenter();
        AllVersion allVersion = versionRepository.findByName(APP_NAME);
        int preVersion=-1;
        if(allVersion!=null){
            preVersion = allVersion.getVersion();
        }
        //根据数据库中的初始化数据版本号获取对应的升级处理器，进行升级操作
        List<VersionInf> versions = center.getUsefulVersions(preVersion);
        if(versions.isEmpty())return;
        for (VersionInf version : versions) {
            try {
                version.init();
                L.i("初始化数据成功成功","version:",version.getVersion());
            }catch (Exception e){
                L.e("初始化数据成功失败","version:",version.getVersion());
                throw e;
            }
        }
        //把升级完后的版本号存入数据库
        int currentVersion = versions.get(versions.size()-1).getVersion();
        if(allVersion==null){
            allVersion = new AllVersion();
            allVersion.setName(APP_NAME);
        }
        allVersion.setVersion(currentVersion);
        versionRepository.save(allVersion);
    }


}
