package com.mall.inventory.init;

import com.mall.common.core.jdbc.MysqlSchemaInitializerSupport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
/**
 * 为本地开发环境创建库存表结构和初始化数据。
 */
public class InventorySchemaInitializer implements ApplicationRunner {

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
        MysqlSchemaInitializerSupport.initialize(host, port, username, password, databaseName, "db/inventory-schema.sql");
    }
}

