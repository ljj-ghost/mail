package com.mall.payment;

import com.mall.common.core.jdbc.MysqlSchemaInitializerSupport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

@Component
/**
 * 创建支付表结构和本地初始化数据。
 */
public class PaymentSchemaInitializer implements ApplicationRunner {

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
        MysqlSchemaInitializerSupport.initialize(host, port, username, password, databaseName, "db/payment-schema.sql");
        upgradeLegacySchema();
    }

    private void upgradeLegacySchema() {
        String databaseUrl = "jdbc:mysql://" + host + ":" + port + "/" + databaseName
            + "?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai"
            + "&useSSL=false&allowPublicKeyRetrieval=true";
        try (Connection connection = DriverManager.getConnection(databaseUrl, username, password)) {
            ensureColumn(connection, "user_id", "ALTER TABLE pay_payment ADD COLUMN user_id BIGINT NOT NULL DEFAULT 0 AFTER order_no");
            ensureColumn(connection, "pay_time", "ALTER TABLE pay_payment ADD COLUMN pay_time DATETIME(3) NULL AFTER third_trade_no");
            ensureColumn(connection, "close_time", "ALTER TABLE pay_payment ADD COLUMN close_time DATETIME(3) NULL AFTER pay_time");
            ensureColumn(connection, "close_reason", "ALTER TABLE pay_payment ADD COLUMN close_reason VARCHAR(64) NOT NULL DEFAULT '' AFTER close_time");
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to upgrade payment schema", ex);
        }
    }

    private void ensureColumn(Connection connection, String columnName, String alterSql) throws SQLException {
        if (hasColumn(connection, columnName)) {
            return;
        }
        try (Statement statement = connection.createStatement()) {
            statement.execute(alterSql);
        }
    }

    private boolean hasColumn(Connection connection, String columnName) throws SQLException {
        DatabaseMetaData metaData = connection.getMetaData();
        try (ResultSet resultSet = metaData.getColumns(connection.getCatalog(), null, "pay_payment", columnName)) {
            return resultSet.next();
        }
    }
}

