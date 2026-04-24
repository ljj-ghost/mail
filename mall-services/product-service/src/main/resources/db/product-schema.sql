CREATE TABLE IF NOT EXISTS pms_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    parent_id BIGINT NOT NULL DEFAULT 0,
    category_name VARCHAR(64) NOT NULL,
    sort INT NOT NULL DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 1,
    create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_pms_category_category_id (category_id)
);

CREATE TABLE IF NOT EXISTS pms_spu (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    spu_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    spu_name VARCHAR(128) NOT NULL,
    brand_name VARCHAR(64) NOT NULL,
    selling_point VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT NOT NULL,
    status TINYINT NOT NULL DEFAULT 1,
    create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_pms_spu_spu_id (spu_id),
    KEY idx_pms_spu_category_id (category_id)
);

CREATE TABLE IF NOT EXISTS pms_sku (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sku_id BIGINT NOT NULL,
    spu_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    sku_name VARCHAR(128) NOT NULL,
    market_price DECIMAL(16, 2) NOT NULL,
    sale_price DECIMAL(16, 2) NOT NULL,
    main_image_url VARCHAR(255) NOT NULL DEFAULT '',
    selling_point VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT NULL,
    status TINYINT NOT NULL DEFAULT 1,
    recommend_sort INT NOT NULL DEFAULT 0,
    create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_pms_sku_sku_id (sku_id),
    KEY idx_pms_sku_spu_id (spu_id),
    KEY idx_pms_sku_category_id (category_id),
    KEY idx_pms_sku_status_sort (status, recommend_sort)
);

SET @has_pms_sku_selling_point := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'pms_sku'
      AND COLUMN_NAME = 'selling_point'
);

SET @alter_pms_sku_selling_point := IF(
    @has_pms_sku_selling_point = 0,
    'ALTER TABLE pms_sku ADD COLUMN selling_point VARCHAR(255) NOT NULL DEFAULT '''' AFTER main_image_url',
    'SELECT 1'
);

PREPARE stmt FROM @alter_pms_sku_selling_point;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_pms_sku_description := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'pms_sku'
      AND COLUMN_NAME = 'description'
);

SET @alter_pms_sku_description := IF(
    @has_pms_sku_description = 0,
    'ALTER TABLE pms_sku ADD COLUMN description TEXT NULL AFTER selling_point',
    'SELECT 1'
);

PREPARE stmt FROM @alter_pms_sku_description;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT INTO pms_category (category_id, parent_id, category_name, sort, status)
VALUES
    (1101, 0, '手机', 10, 1),
    (1102, 0, '耳机', 20, 1),
    (1103, 0, '笔记本', 30, 1),
    (1104, 0, '穿戴', 40, 1),
    (1105, 0, '家居音响', 50, 1)
ON DUPLICATE KEY UPDATE
    parent_id = VALUES(parent_id),
    category_name = VALUES(category_name),
    sort = VALUES(sort),
    status = VALUES(status);

INSERT INTO pms_spu (spu_id, category_id, spu_name, brand_name, selling_point, description, status)
VALUES
    (10001, 1101, 'Nova X16', 'Nova', '旗舰影像与全天续航兼顾的直板手机系列。', 'Nova X16 系列覆盖标准、轻亮与高配版本，适合承接首页推荐、商品详情和购物车浏览。', 1),
    (10002, 1102, 'Echo Pods Pro 2', 'Echo', '通勤降噪、会议收音和多设备切换都很稳。', 'Echo Pods Pro 2 负责承接商城里的高频配件消费，也是购物车和结算链路中很自然的搭配商品。', 1),
    (10003, 1103, 'Atelier Air 15', 'Atelier', '大屏轻薄与稳定续航兼顾，适合办公与学习。', 'Atelier Air 15 是商城里的高客单价笔记本系列，适合演示搜索、推荐和订单链路。', 1),
    (10004, 1104, 'Pulse Watch 10', 'Pulse', '睡眠监测、训练追踪和通知提醒一步到位。', 'Pulse Watch 10 让穿戴分类更加完整，也适合演示账号中心里的订单查看体验。', 1),
    (10005, 1105, 'Dome Speaker Duo', 'Dome', '桌面和客厅都适用的双声道音响组合。', 'Dome Speaker Duo 补齐了家居音响品类，让整个商城的商品结构不只局限于随身数码。', 1),
    (10006, 1101, 'Fold One X', 'Fold One', '面向高端用户的折叠屏旗舰系列。', 'Fold One X 用来补齐高端手机价格带，让首页推荐和后台概览都能看到更完整的档位。', 1),
    (10007, 1105, 'Studio Speaker Max', 'Studio', '更大箱体与更饱满低频，适合客厅主声场。', 'Studio Speaker Max 为家居音响补上高阶款，方便在后台看到更完整的价格分布。', 1),
    (10008, 1103, 'Creator Book 14', 'Creator', '面向创作工作流的高性能轻薄本。', 'Creator Book 14 负责抬高商城的创作本区间，让搜索、推荐和后台价格概览更有层次。', 1)
ON DUPLICATE KEY UPDATE
    category_id = VALUES(category_id),
    spu_name = VALUES(spu_name),
    brand_name = VALUES(brand_name),
    selling_point = VALUES(selling_point),
    description = VALUES(description),
    status = VALUES(status);

UPDATE pms_sku s
JOIN pms_spu p ON p.spu_id = s.spu_id
SET s.selling_point = COALESCE(NULLIF(s.selling_point, ''), p.selling_point),
    s.description = COALESCE(NULLIF(s.description, ''), p.description)
WHERE s.selling_point IS NULL
   OR s.selling_point = ''
   OR s.description IS NULL
   OR s.description = '';

INSERT INTO pms_sku (
    sku_id, spu_id, category_id, sku_name, market_price, sale_price,
    main_image_url, selling_point, description, status, recommend_sort
)
VALUES
    (20001, 10001, 1101, 'Nova X16 256G 曜石黑', 6499.00, 5999.00, 'iphone-16-black', '轻旗舰手感、夜景影像和全天续航三者兼顾。', 'Nova X16 面向日常主力机需求，兼顾观感、性能和耐用性，适合作为首页主推款与详情页入口款。', 1, 10),
    (20005, 10001, 1101, 'Nova X16 256G 极地白', 6499.00, 5999.00, 'iphone-16-white', '同样的旗舰配置，换成更克制的极简配色。', '极地白版本延续标准款的核心性能，适合在详情页展示同系列配色切换与风格差异。', 1, 20),
    (20006, 10001, 1101, 'Nova X16 512G 晴空蓝', 7299.00, 6799.00, 'iphone-16-blue', '更大存储，更适合影像与内容创作的升级版本。', '晴空蓝 512G 版本为重度拍摄与视频创作场景预留更多空间，适合作为商品详情页里的高配选择。', 1, 30),
    (20002, 10002, 1102, 'Echo Pods Pro 2 雾银版', 1699.00, 1499.00, 'airpods-pro-2', '通勤降噪、会议收音和多设备切换都很稳。', 'Echo Pods Pro 2 负责承接商城里的高频配件消费，也是购物车和结算链路中很自然的搭配商品。', 1, 40),
    (20007, 10002, 1102, 'Echo Pods Pro 2 午夜版', 1799.00, 1599.00, 'airpods-pro-2-midnight', '更深的外观气质，适合黑色桌面和夜间通勤场景。', '午夜版补齐了耳机分类的配色层次，也能让同系列 SKU 切换在前端更有真实感。', 1, 50),
    (20003, 10003, 1103, 'Atelier Air 15 银色标准版', 9599.00, 8999.00, 'macbook-air-silver', '大屏轻薄和平衡续航，适合日常办公与学习。', 'Atelier Air 15 是商城里的高客单价代表，适合承接搜索、推荐与结算场景。', 1, 60),
    (20008, 10003, 1103, 'Atelier Air 15 午夜高配版', 11299.00, 10499.00, 'macbook-air-midnight', '更高内存与更大容量，适合创作和多任务流程。', '午夜高配版让笔记本分类在详情页具备更清晰的升级路径，也更适合作为高客单推荐位。', 1, 70),
    (20004, 10004, 1104, 'Pulse Watch 10 46mm 午夜款', 3299.00, 2999.00, 'watch-series-10-midnight', '睡眠监测、训练追踪和通知提醒一步到位。', 'Pulse Watch 10 为商城提供了更轻巧的品类选择，也适合串联账号中心里的订单查看体验。', 1, 80),
    (20009, 10004, 1104, 'Pulse Watch 10 42mm 银色款', 3099.00, 2799.00, 'watch-series-10-silver', '更轻盈的表径设计，适合全天候佩戴。', '银色小表径版本让穿戴分类更平衡，也适合展示同系列不同尺寸下的购买决策。', 1, 90),
    (20010, 10005, 1105, 'Dome Speaker Duo 双只装', 2599.00, 2299.00, 'homepod-mini-duo', '适合桌面和客厅的双声道组合，空间感很强。', 'Dome Speaker Duo 补齐了家居音响品类，让整套商城商品结构不只局限于随身数码。', 1, 100),
    (20011, 10006, 1101, 'Fold One X 512G 岩砂金', 8999.00, 8299.00, 'fold-x-sand', '大展开屏搭配轻量化机身，兼顾移动办公与阅读体验。', 'Fold One X 用来补齐高端手机区间，让商城在首页和后台都能看到更完整的价格带。', 1, 110),
    (20012, 10006, 1101, 'Fold One X 512G 深影灰', 9299.00, 8499.00, 'fold-x-shadow', '更沉稳的商务配色，适合演示高端折叠屏系列。', '深影灰版本让折叠旗舰拥有更明显的风格区分，也更适合在后台商品管理页展示。', 1, 120),
    (20013, 10007, 1105, 'Studio Speaker Max 石墨版', 4399.00, 3999.00, 'studio-speaker-graphite', '更大的箱体与更饱满的低频，适合客厅主声场。', 'Studio Speaker Max 让家居音响分类拥有更明确的高阶款，也有利于丰富后台概览里的商品结构。', 1, 130),
    (20014, 10008, 1103, 'Creator Book 14 星光版', 13899.00, 12999.00, 'creator-book-starlight', '更强图形性能和更高色域屏幕，适合创作工作流。', 'Creator Book 14 负责抬高商城的高端创作本区间，让搜索、推荐和后台价格概览更有层次。', 1, 140)
ON DUPLICATE KEY UPDATE
    spu_id = VALUES(spu_id),
    category_id = VALUES(category_id),
    sku_name = VALUES(sku_name),
    market_price = VALUES(market_price),
    sale_price = VALUES(sale_price),
    main_image_url = VALUES(main_image_url),
    selling_point = VALUES(selling_point),
    description = VALUES(description),
    status = VALUES(status),
    recommend_sort = VALUES(recommend_sort);
