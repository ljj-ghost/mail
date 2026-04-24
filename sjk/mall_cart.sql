/*
 Navicat Premium Data Transfer

 Source Server         : ljj
 Source Server Type    : MySQL
 Source Server Version : 80045 (8.0.45)
 Source Host           : 192.168.145.128:3306
 Source Schema         : mall_cart

 Target Server Type    : MySQL
 Target Server Version : 80045 (8.0.45)
 File Encoding         : 65001

 Date: 15/04/2026 16:43:27
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for oms_cart_item
-- ----------------------------
DROP TABLE IF EXISTS `oms_cart_item`;
CREATE TABLE `oms_cart_item`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `sku_id` bigint NOT NULL,
  `sku_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `sale_price` decimal(16, 2) NOT NULL,
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_oms_cart_item_user_sku`(`user_id` ASC, `sku_id` ASC) USING BTREE,
  INDEX `idx_oms_cart_item_user_update`(`user_id` ASC, `update_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 30 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of oms_cart_item
-- ----------------------------
INSERT INTO `oms_cart_item` VALUES (18, 1001002, 20005, 'Nova X16 256G 极地白', 1, 5999.00, '2026-04-08 22:08:50.013', '2026-04-08 22:08:50.013');
INSERT INTO `oms_cart_item` VALUES (24, 1001001, 20005, 'Nova X16 256G 极地白', 1, 5999.00, '2026-04-09 17:01:30.087', '2026-04-09 17:01:30.087');
INSERT INTO `oms_cart_item` VALUES (25, 1001001, 20006, 'Nova X16 512G 晴空蓝', 1, 6799.00, '2026-04-09 17:01:30.955', '2026-04-09 17:01:30.955');
INSERT INTO `oms_cart_item` VALUES (26, 1001001, 20002, 'Echo Pods Pro 2 雾银版', 1, 1499.00, '2026-04-09 17:01:31.756', '2026-04-09 17:01:31.756');
INSERT INTO `oms_cart_item` VALUES (27, 1001001, 20007, 'Echo Pods Pro 2 午夜版', 1, 1599.00, '2026-04-09 17:01:33.729', '2026-04-09 17:01:33.729');
INSERT INTO `oms_cart_item` VALUES (28, 1001001, 20003, 'Atelier Air 15 银色标准版', 2, 8999.00, '2026-04-09 17:01:34.076', '2026-04-09 17:01:36.330');

SET FOREIGN_KEY_CHECKS = 1;
