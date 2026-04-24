CREATE TABLE IF NOT EXISTS inventory_stock (
    sku_id BIGINT PRIMARY KEY,
    available_qty INT NOT NULL,
    locked_qty INT NOT NULL DEFAULT 0,
    create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS inventory_reservation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reserve_no VARCHAR(32) NOT NULL,
    order_no VARCHAR(64) NOT NULL,
    status TINYINT NOT NULL,
    expire_time DATETIME(3) NULL,
    create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_inventory_reservation_reserve_no (reserve_no),
    UNIQUE KEY uk_inventory_reservation_order_no (order_no)
);

CREATE TABLE IF NOT EXISTS inventory_reservation_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reserve_no VARCHAR(32) NOT NULL,
    order_no VARCHAR(64) NOT NULL,
    sku_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    KEY idx_inventory_reservation_item_order_no (order_no),
    KEY idx_inventory_reservation_item_reserve_no (reserve_no)
);

INSERT INTO inventory_stock (sku_id, available_qty, locked_qty)
VALUES
    (20001, 88, 0),
    (20002, 54, 0),
    (20003, 36, 0),
    (20004, 26, 0),
    (20005, 64, 0),
    (20006, 9, 0),
    (20007, 22, 0),
    (20008, 7, 0),
    (20009, 14, 0),
    (20010, 5, 0),
    (20011, 18, 0),
    (20012, 4, 0),
    (20013, 12, 0),
    (20014, 3, 0)
ON DUPLICATE KEY UPDATE
    available_qty = VALUES(available_qty),
    locked_qty = VALUES(locked_qty);
