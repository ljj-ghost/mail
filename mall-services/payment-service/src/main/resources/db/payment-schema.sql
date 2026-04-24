CREATE TABLE IF NOT EXISTS pay_payment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    payment_no VARCHAR(32) NOT NULL,
    order_no VARCHAR(64) NOT NULL,
    user_id BIGINT NOT NULL,
    pay_channel INT NOT NULL,
    pay_status INT NOT NULL,
    pay_amount DECIMAL(16, 2) NOT NULL,
    third_trade_no VARCHAR(64) NOT NULL DEFAULT '',
    pay_time DATETIME(3) NULL,
    close_time DATETIME(3) NULL,
    close_reason VARCHAR(64) NOT NULL DEFAULT '',
    create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_pay_payment_payment_no (payment_no),
    UNIQUE KEY uk_pay_payment_order_no (order_no),
    KEY idx_pay_payment_user_id (user_id, create_time),
    KEY idx_pay_payment_status (pay_status)
);

INSERT INTO pay_payment (
    payment_no,
    order_no,
    user_id,
    pay_channel,
    pay_status,
    pay_amount,
    third_trade_no,
    pay_time,
    close_time,
    close_reason,
    create_time
)
VALUES
    ('PAYDEMO0001', 'ORD-DEMO-20260401-001', 1001001, 1, 2, 7498.00, 'MOCK-TRADE-0001', '2026-04-01 10:16:00.000', NULL, '', '2026-04-01 10:05:00.000'),
    ('PAYDEMO0002', 'ORD-DEMO-20260403-002', 1001001, 2, 0, 2299.00, '', NULL, NULL, '', '2026-04-03 15:41:00.000'),
    ('PAYADMIN0003', 'ORD-ADMIN-20260405-003', 1001002, 1, 2, 12999.00, 'MOCK-TRADE-0003', '2026-04-05 13:30:00.000', NULL, '', '2026-04-05 13:00:00.000'),
    ('PAYADMIN0004', 'ORD-ADMIN-20260406-004', 1001002, 1, 4, 1599.00, '', NULL, '2026-04-06 19:00:00.000', 'Cancelled by admin', '2026-04-06 18:25:00.000')
ON DUPLICATE KEY UPDATE
    user_id = VALUES(user_id),
    pay_channel = VALUES(pay_channel),
    pay_status = VALUES(pay_status),
    pay_amount = VALUES(pay_amount),
    third_trade_no = VALUES(third_trade_no),
    pay_time = VALUES(pay_time),
    close_time = VALUES(close_time),
    close_reason = VALUES(close_reason),
    create_time = VALUES(create_time);
