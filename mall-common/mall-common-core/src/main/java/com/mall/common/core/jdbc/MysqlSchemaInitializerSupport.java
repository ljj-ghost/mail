package com.mall.common.core.jdbc;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * 用于创建 MySQL 数据库并在启动时执行建表脚本的共享工具。
 */
public final class MysqlSchemaInitializerSupport {

    private static final String MYSQL_IDENTIFIER_PATTERN = "[A-Za-z0-9_]+";
    private static final String JDBC_PARAMS = "?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai"
        + "&useSSL=false&allowPublicKeyRetrieval=true";

    private MysqlSchemaInitializerSupport() {
    }

    public static void initialize(String host, int port, String username, String password, String databaseName, String classpathResource) {
        validateDatabaseName(databaseName);
        createDatabase(host, port, username, password, databaseName);
        executeSchema(host, port, username, password, databaseName, classpathResource);
    }

    private static void validateDatabaseName(String databaseName) {
        if (databaseName == null || !databaseName.matches(MYSQL_IDENTIFIER_PATTERN)) {
            throw new IllegalArgumentException("Invalid MySQL database name: " + databaseName);
        }
    }

    private static void createDatabase(String host, int port, String username, String password, String databaseName) {
        String rootUrl = "jdbc:mysql://" + host + ":" + port + "/" + JDBC_PARAMS;
        String sql = "CREATE DATABASE IF NOT EXISTS `" + databaseName + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
        try (Connection connection = DriverManager.getConnection(rootUrl, username, password);
             Statement statement = connection.createStatement()) {
            statement.execute(sql);
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to create database " + databaseName, ex);
        }
    }

    private static void executeSchema(String host, int port, String username, String password, String databaseName, String classpathResource) {
        String databaseUrl = "jdbc:mysql://" + host + ":" + port + "/" + databaseName + JDBC_PARAMS;
        try (Connection connection = DriverManager.getConnection(databaseUrl, username, password);
             Statement statement = connection.createStatement()) {
            for (String sql : loadStatements(classpathResource)) {
                statement.execute(sql);
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to initialize schema for database " + databaseName, ex);
        }
    }

    private static List<String> loadStatements(String classpathResource) {
        try (InputStream inputStream = Thread.currentThread().getContextClassLoader().getResourceAsStream(classpathResource)) {
            if (inputStream == null) {
                throw new IllegalStateException("Schema resource not found: " + classpathResource);
            }
            String script = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            return splitStatements(script);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read schema resource: " + classpathResource, ex);
        }
    }

    private static List<String> splitStatements(String script) {
        List<String> statements = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        for (String line : script.split("\\R")) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.startsWith("--")) {
                continue;
            }
            current.append(line).append('\n');
            if (trimmed.endsWith(";")) {
                String statement = current.toString().trim();
                statements.add(statement.substring(0, statement.length() - 1));
                current.setLength(0);
            }
        }
        if (!current.isEmpty()) {
            statements.add(current.toString().trim());
        }
        return statements;
    }
}

