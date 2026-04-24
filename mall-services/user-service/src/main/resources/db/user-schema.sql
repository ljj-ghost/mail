CREATE TABLE IF NOT EXISTS ums_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    nickname VARCHAR(32) NOT NULL,
    mobile VARCHAR(16) NOT NULL,
    email VARCHAR(64) NOT NULL DEFAULT '',
    status TINYINT NOT NULL DEFAULT 1,
    role_code VARCHAR(32) NOT NULL DEFAULT 'USER',
    create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_ums_user_user_id (user_id)
);

SET @ums_user_role_code_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'ums_user'
      AND column_name = 'role_code'
);
SET @ums_user_role_code_sql := IF(
    @ums_user_role_code_exists = 0,
    'ALTER TABLE ums_user ADD COLUMN role_code VARCHAR(32) NOT NULL DEFAULT ''USER'' AFTER status',
    'SELECT 1'
);
PREPARE ums_user_role_code_stmt FROM @ums_user_role_code_sql;
EXECUTE ums_user_role_code_stmt;
DEALLOCATE PREPARE ums_user_role_code_stmt;

CREATE TABLE IF NOT EXISTS ums_user_address (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    consignee_name VARCHAR(32) NOT NULL,
    consignee_mobile VARCHAR(16) NOT NULL,
    detail_address VARCHAR(255) NOT NULL,
    is_default TINYINT NOT NULL DEFAULT 0,
    deleted TINYINT NOT NULL DEFAULT 0,
    create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    KEY idx_ums_user_address_user_id (user_id, deleted, is_default)
);

INSERT INTO ums_user (user_id, nickname, mobile, email, status, role_code)
VALUES
    (1001001, 'Mall Demo User', '13800138000', 'demo@mall.com', 1, 'USER'),
    (1001002, 'Mall Admin Console', '13900139000', 'admin@mall.com', 1, 'ADMIN'),
    (1001003, '周沐', '13700137001', 'zhoumu@mall.com', 1, 'USER'),
    (1001004, '林序', '13700137002', 'linxu@mall.com', 1, 'USER'),
    (1001005, '赵青', '13700137003', 'zhaoqing@mall.com', 1, 'USER'),
    (1001006, '苏砚', '13700137004', 'suyan@mall.com', 1, 'USER')
ON DUPLICATE KEY UPDATE
    nickname = VALUES(nickname),
    mobile = VALUES(mobile),
    email = VALUES(email),
    status = VALUES(status),
    role_code = VALUES(role_code);

INSERT INTO ums_user_address (id, user_id, consignee_name, consignee_mobile, detail_address, is_default, deleted)
VALUES
    (1, 1001001, '张三', '13800138000', '上海市浦东新区世纪大道 100 号', 1, 0),
    (2, 1001001, '李四', '13900139000', '上海市静安区南京西路 88 号', 0, 0),
    (3, 1001002, '运营管理部', '13900139000', '上海市浦东新区世纪大道 300 号', 1, 0),
    (4, 1001003, '周沐', '13700137001', '杭州市滨江区江南大道 66 号', 1, 0),
    (5, 1001004, '林序', '13700137002', '深圳市南山区科技园南路 18 号', 1, 0),
    (6, 1001005, '赵青', '13700137003', '北京市朝阳区望京阜通东大街 20 号', 1, 0),
    (7, 1001006, '苏砚', '13700137004', '成都市高新区天府大道北段 88 号', 1, 0)
ON DUPLICATE KEY UPDATE
    user_id = VALUES(user_id),
    consignee_name = VALUES(consignee_name),
    consignee_mobile = VALUES(consignee_mobile),
    detail_address = VALUES(detail_address),
    is_default = VALUES(is_default),
    deleted = VALUES(deleted);
