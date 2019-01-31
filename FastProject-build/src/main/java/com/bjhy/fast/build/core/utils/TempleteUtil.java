package com.bjhy.fast.build.core.utils;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

/**
 * Create by: Jackson
 */
public class TempleteUtil {

    public static JdbcTemplate getTemplete(String driver, String url, String user, String pwd){
        // JDBC模板依赖于连接池来获得数据的连接，所以必须先要构造连接池
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName(driver);
        dataSource.setUrl(url);
        dataSource.setUsername(user);
        dataSource.setPassword(pwd);
        // 创建JDBC模板
        JdbcTemplate jdbcTemplate = new JdbcTemplate();
        // 这里也可以使用构造方法
        jdbcTemplate.setDataSource(dataSource);
        return jdbcTemplate;
    }

}
