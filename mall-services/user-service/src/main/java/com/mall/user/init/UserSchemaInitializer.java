package com.mall.user.init;

import com.mall.common.core.jdbc.MysqlSchemaInitializerSupport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
/**
 * 为本地环境创建用户表结构和初始化数据。
 */
public class UserSchemaInitializer implements ApplicationRunner {

    @Value("${mall.infra.vm-host}")
    private String host;

    @Value("${mall.infra.mysql-port}")
    private int port;

    @Value("${mall.infra.mysql-username}")
    private String username;

    @Value("${mall.infra.mysql-password}")
    private String password;

    @Value("${mall.infra.mysql-database}")
    private String databaseName;

    @Override
    public void run(ApplicationArguments args) {
        MysqlSchemaInitializerSupport.initialize(host, port, username, password, databaseName, "db/user-schema.sql");
    }
}

