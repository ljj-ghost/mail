package com.mall.cart;

import com.mall.common.core.jdbc.MysqlSchemaInitializerSupport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Order(1)
@Component
/**
 * 创建本地购物车服务所需的表结构。
 */
public class CartSchemaInitializer implements ApplicationRunner {

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
        MysqlSchemaInitializerSupport.initialize(host, port, username, password, databaseName, "db/cart-schema.sql");
    }
}

