CREATE TABLE IF NOT EXISTS oms_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(64) NOT NULL,
    user_id BIGINT NOT NULL,
    order_status INT NOT NULL,
    pay_status INT NOT NULL,
    buyer_remark VARCHAR(255) NOT NULL DEFAULT '',
    reserve_no VARCHAR(32) NULL,
    payment_no VARCHAR(32) NULL,
    pay_channel INT NULL,
    pay_amount DECIMAL(16, 2) NOT NULL,
    pay_time DATETIME(3) NULL,
    create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_oms_order_order_no (order_no),
    KEY idx_oms_order_user_id (user_id),
    KEY idx_oms_order_status (order_status, pay_status)
);

SET @oms_order_deleted_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'oms_order'
      AND COLUMN_NAME = 'deleted'
);
SET @oms_order_deleted_ddl := IF(
    @oms_order_deleted_exists = 0,
    'ALTER TABLE oms_order ADD COLUMN deleted TINYINT(1) NOT NULL DEFAULT 0',
    'SELECT 1'
);
PREPARE oms_order_deleted_stmt FROM @oms_order_deleted_ddl;
EXECUTE oms_order_deleted_stmt;
DEALLOCATE PREPARE oms_order_deleted_stmt;

SET @oms_order_delivery_company_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'oms_order'
      AND COLUMN_NAME = 'delivery_company'
);
SET @oms_order_delivery_company_ddl := IF(
    @oms_order_delivery_company_exists = 0,
    'ALTER TABLE oms_order ADD COLUMN delivery_company VARCHAR(64) NOT NULL DEFAULT '''' AFTER pay_time',
    'SELECT 1'
);
PREPARE oms_order_delivery_company_stmt FROM @oms_order_delivery_company_ddl;
EXECUTE oms_order_delivery_company_stmt;
DEALLOCATE PREPARE oms_order_delivery_company_stmt;

SET @oms_order_delivery_no_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'oms_order'
      AND COLUMN_NAME = 'delivery_no'
);
SET @oms_order_delivery_no_ddl := IF(
    @oms_order_delivery_no_exists = 0,
    'ALTER TABLE oms_order ADD COLUMN delivery_no VARCHAR(64) NOT NULL DEFAULT '''' AFTER delivery_company',
    'SELECT 1'
);
PREPARE oms_order_delivery_no_stmt FROM @oms_order_delivery_no_ddl;
EXECUTE oms_order_delivery_no_stmt;
DEALLOCATE PREPARE oms_order_delivery_no_stmt;

SET @oms_order_delivery_time_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'oms_order'
      AND COLUMN_NAME = 'delivery_time'
);
SET @oms_order_delivery_time_ddl := IF(
    @oms_order_delivery_time_exists = 0,
    'ALTER TABLE oms_order ADD COLUMN delivery_time DATETIME(3) NULL AFTER delivery_no',
    'SELECT 1'
);
PREPARE oms_order_delivery_time_stmt FROM @oms_order_delivery_time_ddl;
EXECUTE oms_order_delivery_time_stmt;
DEALLOCATE PREPARE oms_order_delivery_time_stmt;

SET @oms_order_finish_time_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'oms_order'
      AND COLUMN_NAME = 'finish_time'
);
SET @oms_order_finish_time_ddl := IF(
    @oms_order_finish_time_exists = 0,
    'ALTER TABLE oms_order ADD COLUMN finish_time DATETIME(3) NULL AFTER delivery_time',
    'SELECT 1'
);
PREPARE oms_order_finish_time_stmt FROM @oms_order_finish_time_ddl;
EXECUTE oms_order_finish_time_stmt;
DEALLOCATE PREPARE oms_order_finish_time_stmt;

CREATE TABLE IF NOT EXISTS oms_order_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(64) NOT NULL,
    sku_id BIGINT NOT NULL,
    sku_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    sale_price DECIMAL(16, 2) NOT NULL,
    item_amount DECIMAL(16, 2) NOT NULL,
    create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    KEY idx_oms_order_item_order_no (order_no)
);

CREATE TABLE IF NOT EXISTS oms_order_submit_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    idempotency_key VARCHAR(128) NOT NULL,
    order_no VARCHAR(64) NOT NULL,
    create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_oms_order_submit_log_user_key (user_id, idempotency_key),
    UNIQUE KEY uk_oms_order_submit_log_order_no (order_no)
);

INSERT INTO oms_order (
    order_no,
    user_id,
    order_status,
    pay_status,
    buyer_remark,
    reserve_no,
    payment_no,
    pay_channel,
    pay_amount,
    pay_time,
    create_time
)
VALUES
    ('ORD-DEMO-20260401-001', 1001001, 20, 2, 'Please call before delivery', 'RSV-DEMO-001', 'PAYDEMO0001', 1, 7498.00, '2026-04-01 10:16:00.000', '2026-04-01 09:58:00.000'),
    ('ORD-DEMO-20260403-002', 1001001, 10, 0, 'Leave at reception desk', 'RSV-DEMO-002', 'PAYDEMO0002', 2, 2299.00, NULL, '2026-04-03 15:40:00.000'),
    ('ORD-ADMIN-20260405-003', 1001002, 20, 2, 'For showroom use', 'RSV-ADMIN-003', 'PAYADMIN0003', 1, 12999.00, '2026-04-05 13:30:00.000', '2026-04-05 12:48:00.000'),
    ('ORD-ADMIN-20260406-004', 1001002, 50, 4, 'Cancel before shipping', 'RSV-ADMIN-004', 'PAYADMIN0004', 1, 1599.00, NULL, '2026-04-06 18:20:00.000')
ON DUPLICATE KEY UPDATE
    user_id = VALUES(user_id),
    order_status = VALUES(order_status),
    pay_status = VALUES(pay_status),
    buyer_remark = VALUES(buyer_remark),
    reserve_no = VALUES(reserve_no),
    payment_no = VALUES(payment_no),
    pay_channel = VALUES(pay_channel),
    pay_amount = VALUES(pay_amount),
    pay_time = VALUES(pay_time),
    create_time = VALUES(create_time);

DELETE FROM oms_order_item
WHERE order_no IN (
    'ORD-DEMO-20260401-001',
    'ORD-DEMO-20260403-002',
    'ORD-ADMIN-20260405-003',
    'ORD-ADMIN-20260406-004'
);

INSERT INTO oms_order_item (
    order_no,
    sku_id,
    sku_name,
    quantity,
    sale_price,
    item_amount,
    create_time
)
VALUES
    ('ORD-DEMO-20260401-001', 20001, 'Nova X16 256G Black', 1, 5999.00, 5999.00, '2026-04-01 09:58:00.000'),
    ('ORD-DEMO-20260401-001', 20002, 'Echo Pods Pro 2 Silver', 1, 1499.00, 1499.00, '2026-04-01 09:58:00.000'),
    ('ORD-DEMO-20260403-002', 20010, 'Dome Speaker Duo', 1, 2299.00, 2299.00, '2026-04-03 15:40:00.000'),
    ('ORD-ADMIN-20260405-003', 20014, 'Creator Book 14 Starlight', 1, 12999.00, 12999.00, '2026-04-05 12:48:00.000'),
    ('ORD-ADMIN-20260406-004', 20007, 'Echo Pods Pro 2 Midnight', 1, 1599.00, 1599.00, '2026-04-06 18:20:00.000');

INSERT INTO oms_order_submit_log (
    user_id,
    idempotency_key,
    order_no,
    create_time
)
VALUES
    (1001001, 'seed-demo-order-001', 'ORD-DEMO-20260401-001', '2026-04-01 09:58:00.000'),
    (1001001, 'seed-demo-order-002', 'ORD-DEMO-20260403-002', '2026-04-03 15:40:00.000'),
    (1001002, 'seed-admin-order-003', 'ORD-ADMIN-20260405-003', '2026-04-05 12:48:00.000'),
    (1001002, 'seed-admin-order-004', 'ORD-ADMIN-20260406-004', '2026-04-06 18:20:00.000')
ON DUPLICATE KEY UPDATE
    user_id = VALUES(user_id),
    create_time = VALUES(create_time);
