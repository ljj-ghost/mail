package com.mall.product.init;

import com.mall.common.core.jdbc.MysqlSchemaInitializerSupport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import com.mall.product.support.ProductCacheEvictor;


@Component
/**
 * 为本地开发环境创建商品表结构和初始化目录数据。
 */
public class ProductSchemaInitializer implements ApplicationRunner {

    private final ProductCacheEvictor productCacheEvictor;

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

    public ProductSchemaInitializer(ProductCacheEvictor productCacheEvictor) {
        this.productCacheEvictor = productCacheEvictor;
    }

    @Override
    public void run(ApplicationArguments args) {
        MysqlSchemaInitializerSupport.initialize(host, port, username, password, databaseName, "db/product-schema.sql");
        productCacheEvictor.evictAll();
    }
}

