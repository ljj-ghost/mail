CREATE TABLE IF NOT EXISTS auth_account (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    login_type TINYINT NOT NULL,
    login_name VARCHAR(128) NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT '',
    status TINYINT NOT NULL DEFAULT 1,
    role_code VARCHAR(32) NOT NULL DEFAULT 'USER',
    fail_count INT NOT NULL DEFAULT 0,
    last_login_time DATETIME(3) DEFAULT NULL,
    last_login_ip VARCHAR(64) NOT NULL DEFAULT '',
    pwd_modified_time DATETIME(3) DEFAULT NULL,
    remark VARCHAR(255) NOT NULL DEFAULT '',
    created_by BIGINT UNSIGNED NOT NULL DEFAULT 0,
    created_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_by BIGINT UNSIGNED NOT NULL DEFAULT 0,
    updated_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted TINYINT NOT NULL DEFAULT 0,
    version INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_auth_account_login_type_name (login_type, login_name),
    KEY idx_auth_account_user_id (user_id),
    KEY idx_auth_account_status_login_time (status, last_login_time)
);

SET @auth_account_role_code_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'auth_account'
      AND column_name = 'role_code'
);
SET @auth_account_role_code_sql := IF(
    @auth_account_role_code_exists = 0,
    'ALTER TABLE auth_account ADD COLUMN role_code VARCHAR(32) NOT NULL DEFAULT ''USER'' AFTER status',
    'SELECT 1'
);
PREPARE auth_account_role_code_stmt FROM @auth_account_role_code_sql;
EXECUTE auth_account_role_code_stmt;
DEALLOCATE PREPARE auth_account_role_code_stmt;

CREATE TABLE IF NOT EXISTS auth_token_session (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    session_no VARCHAR(64) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    access_jti VARCHAR(64) NOT NULL,
    refresh_jti VARCHAR(64) NOT NULL,
    device_type TINYINT NOT NULL DEFAULT 1,
    device_id VARCHAR(128) NOT NULL DEFAULT '',
    client_ip VARCHAR(64) NOT NULL DEFAULT '',
    user_agent VARCHAR(255) NOT NULL DEFAULT '',
    last_active_time DATETIME(3) NOT NULL,
    expire_time DATETIME(3) NOT NULL,
    status TINYINT NOT NULL DEFAULT 1,
    created_by BIGINT UNSIGNED NOT NULL DEFAULT 0,
    created_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_by BIGINT UNSIGNED NOT NULL DEFAULT 0,
    updated_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted TINYINT NOT NULL DEFAULT 0,
    version INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_auth_token_session_session_no (session_no),
    UNIQUE KEY uk_auth_token_session_access_jti (access_jti),
    UNIQUE KEY uk_auth_token_session_refresh_jti (refresh_jti),
    KEY idx_auth_token_session_user_status (user_id, status),
    KEY idx_auth_token_session_expire_time (expire_time)
);

CREATE TABLE IF NOT EXISTS auth_verify_code (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    biz_no VARCHAR(64) NOT NULL,
    scene VARCHAR(64) NOT NULL,
    mobile VARCHAR(32) NOT NULL,
    code_hash VARCHAR(128) NOT NULL,
    send_channel TINYINT NOT NULL DEFAULT 1,
    request_ip VARCHAR(64) NOT NULL DEFAULT '',
    expire_time DATETIME(3) NOT NULL,
    verified_time DATETIME(3) DEFAULT NULL,
    status TINYINT NOT NULL DEFAULT 1,
    created_by BIGINT UNSIGNED NOT NULL DEFAULT 0,
    created_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_by BIGINT UNSIGNED NOT NULL DEFAULT 0,
    updated_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted TINYINT NOT NULL DEFAULT 0,
    version INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_auth_verify_code_biz_no (biz_no),
    KEY idx_auth_verify_code_mobile_scene (mobile, scene),
    KEY idx_auth_verify_code_expire_time (expire_time)
);

CREATE TABLE IF NOT EXISTS auth_login_log (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
    login_type TINYINT NOT NULL,
    login_name VARCHAR(128) NOT NULL DEFAULT '',
    device_type TINYINT NOT NULL DEFAULT 1,
    client_ip VARCHAR(64) NOT NULL DEFAULT '',
    user_agent VARCHAR(255) NOT NULL DEFAULT '',
    login_result TINYINT NOT NULL,
    fail_reason VARCHAR(255) NOT NULL DEFAULT '',
    trace_id VARCHAR(64) NOT NULL DEFAULT '',
    login_time DATETIME(3) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_auth_login_log_user_time (user_id, login_time),
    KEY idx_auth_login_log_name_time (login_name, login_time)
);
