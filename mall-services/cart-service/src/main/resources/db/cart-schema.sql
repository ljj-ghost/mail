CREATE TABLE IF NOT EXISTS oms_cart_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    sku_id BIGINT NOT NULL,
    sku_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    sale_price DECIMAL(16, 2) NOT NULL,
    create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_oms_cart_item_user_sku (user_id, sku_id),
    KEY idx_oms_cart_item_user_update (user_id, update_time)
);
