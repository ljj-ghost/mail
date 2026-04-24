/*
 Navicat Premium Data Transfer

 Source Server         : ljj
 Source Server Type    : MySQL
 Source Server Version : 80045 (8.0.45)
 Source Host           : 192.168.145.128:3306
 Source Schema         : mall_product

 Target Server Type    : MySQL
 Target Server Version : 80045 (8.0.45)
 File Encoding         : 65001

 Date: 15/04/2026 16:42:55
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for pms_category
-- ----------------------------
DROP TABLE IF EXISTS `pms_category`;
CREATE TABLE `pms_category`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint NOT NULL,
  `parent_id` bigint NOT NULL DEFAULT 0,
  `category_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort` int NOT NULL DEFAULT 0,
  `status` tinyint NOT NULL DEFAULT 1,
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_pms_category_category_id`(`category_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 90 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of pms_category
-- ----------------------------
INSERT INTO `pms_category` VALUES (1, 1101, 0, '手机', 10, 1, '2026-04-03 10:24:45.764', '2026-04-08 19:36:06.407');
INSERT INTO `pms_category` VALUES (2, 1102, 0, '耳机', 20, 1, '2026-04-03 10:24:45.764', '2026-04-08 20:34:40.757');
INSERT INTO `pms_category` VALUES (20, 1103, 0, '笔记本', 30, 1, '2026-04-08 16:48:21.830', '2026-04-08 20:34:40.757');
INSERT INTO `pms_category` VALUES (21, 1104, 0, '穿戴', 40, 1, '2026-04-08 16:48:21.830', '2026-04-08 19:36:06.407');
INSERT INTO `pms_category` VALUES (22, 1105, 0, '家居音响', 50, 1, '2026-04-08 16:48:21.830', '2026-04-08 19:36:06.407');

-- ----------------------------
-- Table structure for pms_sku
-- ----------------------------
DROP TABLE IF EXISTS `pms_sku`;
CREATE TABLE `pms_sku`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sku_id` bigint NOT NULL,
  `spu_id` bigint NOT NULL,
  `category_id` bigint NOT NULL,
  `sku_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `market_price` decimal(16, 2) NOT NULL,
  `sale_price` decimal(16, 2) NOT NULL,
  `main_image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `status` tinyint NOT NULL DEFAULT 1,
  `recommend_sort` int NOT NULL DEFAULT 0,
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_pms_sku_sku_id`(`sku_id` ASC) USING BTREE,
  INDEX `idx_pms_sku_spu_id`(`spu_id` ASC) USING BTREE,
  INDEX `idx_pms_sku_category_id`(`category_id` ASC) USING BTREE,
  INDEX `idx_pms_sku_status_sort`(`status` ASC, `recommend_sort` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 196 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of pms_sku
-- ----------------------------
INSERT INTO `pms_sku` VALUES (1, 20001, 10001, 1101, 'Nova X16 256G 曜石黑', 6499.00, 5999.00, 'iphone-16-black', 1, 10, '2026-04-03 10:24:45.833', '2026-04-08 20:34:40.762');
INSERT INTO `pms_sku` VALUES (2, 20005, 10001, 1101, 'Nova X16 256G 极地白', 6499.00, 5999.00, 'iphone-16-white', 1, 20, '2026-04-03 10:24:45.833', '2026-04-08 20:34:40.762');
INSERT INTO `pms_sku` VALUES (3, 20002, 10002, 1102, 'Echo Pods Pro 2 雾银版', 1699.00, 1499.00, 'airpods-pro-2', 1, 40, '2026-04-03 10:24:45.833', '2026-04-08 20:34:40.762');
INSERT INTO `pms_sku` VALUES (29, 20006, 10001, 1101, 'Nova X16 512G 晴空蓝', 7299.00, 6799.00, 'iphone-16-blue', 1, 30, '2026-04-08 16:48:21.838', '2026-04-08 20:34:40.762');
INSERT INTO `pms_sku` VALUES (30, 20007, 10002, 1102, 'Echo Pods Pro 2 午夜版', 1799.00, 1599.00, 'airpods-pro-2-midnight', 1, 50, '2026-04-08 16:48:21.838', '2026-04-08 20:34:40.762');
INSERT INTO `pms_sku` VALUES (31, 20003, 10003, 1103, 'Atelier Air 15 银色标准版', 9599.00, 8999.00, 'macbook-air-silver', 1, 60, '2026-04-08 16:48:21.838', '2026-04-08 20:34:40.762');
INSERT INTO `pms_sku` VALUES (32, 20008, 10003, 1103, 'Atelier Air 15 午夜高配版', 11299.00, 10499.00, 'macbook-air-midnight', 1, 70, '2026-04-08 16:48:21.838', '2026-04-08 20:34:40.762');
INSERT INTO `pms_sku` VALUES (33, 20004, 10004, 1104, 'Pulse Watch 10 46mm 午夜款', 3299.00, 2999.00, 'watch-series-10-midnight', 1, 80, '2026-04-08 16:48:21.838', '2026-04-08 20:34:40.762');
INSERT INTO `pms_sku` VALUES (34, 20009, 10004, 1104, 'Pulse Watch 10 42mm 银色款', 3099.00, 2799.00, 'watch-series-10-silver', 1, 90, '2026-04-08 16:48:21.838', '2026-04-08 20:34:40.762');
INSERT INTO `pms_sku` VALUES (35, 20010, 10005, 1105, 'Dome Speaker Duo 双只装', 2599.00, 2299.00, 'homepod-mini-duo', 1, 100, '2026-04-08 16:48:21.838', '2026-04-08 20:34:40.762');
INSERT INTO `pms_sku` VALUES (80, 20011, 10006, 1101, 'Fold One X 512G 岩砂金', 8999.00, 8299.00, 'fold-x-sand', 1, 110, '2026-04-08 20:34:40.762', '2026-04-08 20:34:40.762');
INSERT INTO `pms_sku` VALUES (81, 20012, 10006, 1101, 'Fold One X 512G 深影灰', 9299.00, 8499.00, 'fold-x-shadow', 1, 120, '2026-04-08 20:34:40.762', '2026-04-08 20:34:40.762');
INSERT INTO `pms_sku` VALUES (82, 20013, 10007, 1105, 'Studio Speaker Max 石墨版', 4399.00, 3999.00, 'studio-speaker-graphite', 1, 130, '2026-04-08 20:34:40.762', '2026-04-08 20:34:40.762');
INSERT INTO `pms_sku` VALUES (83, 20014, 10008, 1103, 'Creator Book 14 星光版', 13899.00, 12999.00, 'creator-book-starlight', 1, 140, '2026-04-08 20:34:40.762', '2026-04-08 20:34:40.762');

-- ----------------------------
-- Table structure for pms_spu
-- ----------------------------
DROP TABLE IF EXISTS `pms_spu`;
CREATE TABLE `pms_spu`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `spu_id` bigint NOT NULL,
  `category_id` bigint NOT NULL,
  `spu_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `selling_point` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint NOT NULL DEFAULT 1,
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_pms_spu_spu_id`(`spu_id` ASC) USING BTREE,
  INDEX `idx_pms_spu_category_id`(`category_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 114 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of pms_spu
-- ----------------------------
INSERT INTO `pms_spu` VALUES (1, 10001, 1101, 'Nova X16', 'Nova', '主力旗舰手机，兼顾影像、性能和全天续航。', 'Nova X16 是商城首页的标准主推款，负责承接首页推荐、详情页浏览和购物车链路。', 1, '2026-04-03 10:24:45.815', '2026-04-08 20:34:40.760');
INSERT INTO `pms_spu` VALUES (2, 10002, 1102, 'Echo Pods Pro 2', 'Echo', '通勤降噪、会议收音和多设备切换都很稳。', 'Echo Pods Pro 2 负责承担高频配件消费场景，也是购物车和结算页里非常自然的搭配商品。', 1, '2026-04-03 10:24:45.815', '2026-04-08 20:34:40.760');
INSERT INTO `pms_spu` VALUES (20, 10003, 1103, 'Atelier Air 15', 'Atelier', '大屏轻薄和稳定续航兼顾，适合办公与学习。', 'Atelier Air 15 为商城提供高客单价商品，方便演示搜索、推荐和订单链路。', 1, '2026-04-08 16:48:21.835', '2026-04-08 20:34:40.760');
INSERT INTO `pms_spu` VALUES (21, 10004, 1104, 'Pulse Watch 10', 'Pulse', '睡眠监测、训练追踪和通知提醒一步到位。', 'Pulse Watch 10 让穿戴分类更完整，也适合串联账户中心里的下单与查看体验。', 1, '2026-04-08 16:48:21.835', '2026-04-08 20:34:40.760');
INSERT INTO `pms_spu` VALUES (22, 10005, 1105, 'Dome Speaker Duo', 'Dome', '适合桌面和客厅的双声道组合，空间感很强。', 'Dome Speaker Duo 补齐了居家声学品类，让商城商品结构不只局限于随身数码。', 1, '2026-04-08 16:48:21.835', '2026-04-08 20:34:40.760');
INSERT INTO `pms_spu` VALUES (46, 10006, 1101, 'Fold One X', 'Fold One', '高端折叠屏系列，适合移动办公与深度阅读。', 'Fold One X 用来补齐高端手机价格带，让后台商品概览与首页推荐都更完整。', 1, '2026-04-08 20:34:40.760', '2026-04-08 20:34:40.760');
INSERT INTO `pms_spu` VALUES (47, 10007, 1105, 'Studio Speaker Max', 'Studio', '更大的箱体和更饱满的低频，适合客厅主声场。', 'Studio Speaker Max 为家居音响分类补上高阶款，方便在后台看到更完整的价格分布。', 1, '2026-04-08 20:34:40.760', '2026-04-08 20:34:40.760');
INSERT INTO `pms_spu` VALUES (48, 10008, 1103, 'Creator Book 14', 'Creator', '面向创作工作流的高性能轻薄本。', 'Creator Book 14 用于抬高商城的创作本区间，也让商品列表在视觉和价格上更有层次。', 1, '2026-04-08 20:34:40.760', '2026-04-08 20:34:40.760');

SET FOREIGN_KEY_CHECKS = 1;
