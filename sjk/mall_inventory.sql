/*
 Navicat Premium Data Transfer

 Source Server         : ljj
 Source Server Type    : MySQL
 Source Server Version : 80045 (8.0.45)
 Source Host           : 192.168.145.128:3306
 Source Schema         : mall_inventory

 Target Server Type    : MySQL
 Target Server Version : 80045 (8.0.45)
 File Encoding         : 65001

 Date: 15/04/2026 16:43:20
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for inventory_reservation
-- ----------------------------
DROP TABLE IF EXISTS `inventory_reservation`;
CREATE TABLE `inventory_reservation`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `reserve_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_no` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint NOT NULL,
  `expire_time` datetime(3) NULL DEFAULT NULL,
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_inventory_reservation_reserve_no`(`reserve_no` ASC) USING BTREE,
  UNIQUE INDEX `uk_inventory_reservation_order_no`(`order_no` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 23 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inventory_reservation
-- ----------------------------
INSERT INTO `inventory_reservation` VALUES (1, 'RSV-8ee6ab6b7980', 'ORD-a683eb7b69f7', 3, '2026-04-02 16:56:01.111', '2026-04-02 16:26:01.884', '2026-04-02 16:26:02.914');
INSERT INTO `inventory_reservation` VALUES (2, 'RSV-4203d2d9027e', 'ORD-cf70aec10bd5', 2, '2026-04-02 19:40:22.777', '2026-04-02 19:10:23.206', '2026-04-02 19:10:23.313');
INSERT INTO `inventory_reservation` VALUES (3, 'RSV-7ce067e95a9f', 'ORD-0dd09c09121e', 2, '2026-04-02 19:41:41.824', '2026-04-02 19:11:42.219', '2026-04-02 19:11:42.686');
INSERT INTO `inventory_reservation` VALUES (4, 'RSV-0ba9140c3db2', 'INV-EXPIRE-20260402194100100', 2, '2026-04-02 19:36:00.104', '2026-04-02 19:41:00.427', '2026-04-02 19:41:00.459');
INSERT INTO `inventory_reservation` VALUES (5, 'RSV-88c8888f1782', 'ORD-a027edbdf00a', 3, '2026-04-02 20:37:04.818', '2026-04-02 20:07:05.099', '2026-04-02 20:07:06.224');
INSERT INTO `inventory_reservation` VALUES (6, 'RSV-d31d99f57cbd', 'ORD-9ae29eee019e', 3, '2026-04-02 20:57:29.988', '2026-04-02 20:27:30.287', '2026-04-02 20:27:30.933');
INSERT INTO `inventory_reservation` VALUES (7, 'RSV-c699f49d6add', 'ORD-fc7d2722fb22', 2, '2026-04-02 20:57:30.774', '2026-04-02 20:27:31.059', '2026-04-02 20:27:31.158');
INSERT INTO `inventory_reservation` VALUES (8, 'RSV-4ea8cd92275e', 'ORD-59faa9632174', 3, '2026-04-02 20:58:25.791', '2026-04-02 20:28:26.074', '2026-04-02 20:28:26.219');
INSERT INTO `inventory_reservation` VALUES (9, 'RSV-8d93ab46d640', 'ORD-d02c16114760', 2, '2026-04-02 20:58:26.038', '2026-04-02 20:28:26.323', '2026-04-02 20:28:26.399');
INSERT INTO `inventory_reservation` VALUES (10, 'RSV-fe22118fb8b7', 'ORD-4a0e0b2e1452', 3, '2026-04-02 20:59:08.478', '2026-04-02 20:29:08.761', '2026-04-02 20:29:08.899');
INSERT INTO `inventory_reservation` VALUES (11, 'RSV-c4f732689977', 'ORD-34f472ecd059', 2, '2026-04-02 20:59:08.707', '2026-04-02 20:29:08.994', '2026-04-02 20:29:09.068');
INSERT INTO `inventory_reservation` VALUES (12, 'RSV-1d368d5ee1b9', 'ORD-e1284e29f2d5', 2, '2026-04-02 21:03:38.859', '2026-04-02 20:33:39.172', '2026-04-02 20:33:40.181');
INSERT INTO `inventory_reservation` VALUES (13, 'RSV-23f693104f70', 'ORD-631e10fd14eb', 2, '2026-04-02 21:06:27.520', '2026-04-02 20:36:27.827', '2026-04-02 20:36:28.834');
INSERT INTO `inventory_reservation` VALUES (14, 'RSV-10c9081f80bf', 'ORD-f35ee030c0da', 3, '2026-04-08 17:19:59.459', '2026-04-08 16:49:59.536', '2026-04-08 16:50:02.092');
INSERT INTO `inventory_reservation` VALUES (15, 'RSV-c03af0c22adb', 'ORD-69d6c6e340a9', 3, '2026-04-08 20:10:36.748', '2026-04-08 19:40:36.464', '2026-04-08 19:40:42.587');
INSERT INTO `inventory_reservation` VALUES (16, 'RSV-30f3185f8703', 'ORD-ab24b15ac53e', 3, '2026-04-08 22:32:43.317', '2026-04-08 22:02:43.281', '2026-04-08 22:02:47.581');
INSERT INTO `inventory_reservation` VALUES (17, 'RSV-be64c1d2a2cb', 'ORD-fa92541ec59c', 3, '2026-04-08 22:35:59.961', '2026-04-08 22:05:59.923', '2026-04-08 22:06:01.479');
INSERT INTO `inventory_reservation` VALUES (18, 'RSV-baaf0f2a4a9e', 'ORD-194d2b574052', 3, '2026-04-08 23:20:29.533', '2026-04-08 22:50:29.530', '2026-04-08 22:50:32.784');
INSERT INTO `inventory_reservation` VALUES (19, 'RSV-7445eaa327d5', 'ORD-42194a487d65', 3, '2026-04-08 23:20:36.138', '2026-04-08 22:50:36.127', '2026-04-08 22:50:37.540');
INSERT INTO `inventory_reservation` VALUES (20, 'RSV-b86fd14fedd6', 'ORD-787b35401a1a', 2, '2026-04-09 00:13:35.938', '2026-04-08 23:43:35.991', '2026-04-08 23:43:37.297');
INSERT INTO `inventory_reservation` VALUES (21, 'RSV-d80cad8ef532', 'ORD-1c26b36df563', 3, '2026-04-09 14:14:21.757', '2026-04-09 13:44:21.218', '2026-04-09 13:44:27.157');
INSERT INTO `inventory_reservation` VALUES (22, 'RSV-3596cb75e38f', 'ORD-0992a6bb2c0c', 3, '2026-04-09 17:19:34.456', '2026-04-09 16:49:33.316', '2026-04-09 16:49:37.180');

-- ----------------------------
-- Table structure for inventory_reservation_item
-- ----------------------------
DROP TABLE IF EXISTS `inventory_reservation_item`;
CREATE TABLE `inventory_reservation_item`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `reserve_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_no` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_inventory_reservation_item_order_no`(`order_no` ASC) USING BTREE,
  INDEX `idx_inventory_reservation_item_reserve_no`(`reserve_no` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 24 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inventory_reservation_item
-- ----------------------------
INSERT INTO `inventory_reservation_item` VALUES (1, 'RSV-8ee6ab6b7980', 'ORD-a683eb7b69f7', 20001, 1, '2026-04-02 16:26:01.892', '2026-04-02 16:26:01.892');
INSERT INTO `inventory_reservation_item` VALUES (2, 'RSV-8ee6ab6b7980', 'ORD-a683eb7b69f7', 20002, 1, '2026-04-02 16:26:01.894', '2026-04-02 16:26:01.894');
INSERT INTO `inventory_reservation_item` VALUES (3, 'RSV-4203d2d9027e', 'ORD-cf70aec10bd5', 20001, 1, '2026-04-02 19:10:23.215', '2026-04-02 19:10:23.215');
INSERT INTO `inventory_reservation_item` VALUES (4, 'RSV-7ce067e95a9f', 'ORD-0dd09c09121e', 20001, 1, '2026-04-02 19:11:42.221', '2026-04-02 19:11:42.221');
INSERT INTO `inventory_reservation_item` VALUES (5, 'RSV-0ba9140c3db2', 'INV-EXPIRE-20260402194100100', 20002, 2, '2026-04-02 19:41:00.431', '2026-04-02 19:41:00.431');
INSERT INTO `inventory_reservation_item` VALUES (6, 'RSV-88c8888f1782', 'ORD-a027edbdf00a', 20001, 1, '2026-04-02 20:07:05.105', '2026-04-02 20:07:05.105');
INSERT INTO `inventory_reservation_item` VALUES (7, 'RSV-d31d99f57cbd', 'ORD-9ae29eee019e', 20001, 1, '2026-04-02 20:27:30.293', '2026-04-02 20:27:30.293');
INSERT INTO `inventory_reservation_item` VALUES (8, 'RSV-c699f49d6add', 'ORD-fc7d2722fb22', 20001, 1, '2026-04-02 20:27:31.061', '2026-04-02 20:27:31.061');
INSERT INTO `inventory_reservation_item` VALUES (9, 'RSV-4ea8cd92275e', 'ORD-59faa9632174', 20001, 1, '2026-04-02 20:28:26.075', '2026-04-02 20:28:26.075');
INSERT INTO `inventory_reservation_item` VALUES (10, 'RSV-8d93ab46d640', 'ORD-d02c16114760', 20001, 1, '2026-04-02 20:28:26.324', '2026-04-02 20:28:26.324');
INSERT INTO `inventory_reservation_item` VALUES (11, 'RSV-fe22118fb8b7', 'ORD-4a0e0b2e1452', 20001, 1, '2026-04-02 20:29:08.762', '2026-04-02 20:29:08.762');
INSERT INTO `inventory_reservation_item` VALUES (12, 'RSV-c4f732689977', 'ORD-34f472ecd059', 20001, 1, '2026-04-02 20:29:08.996', '2026-04-02 20:29:08.996');
INSERT INTO `inventory_reservation_item` VALUES (13, 'RSV-1d368d5ee1b9', 'ORD-e1284e29f2d5', 20001, 1, '2026-04-02 20:33:39.177', '2026-04-02 20:33:39.177');
INSERT INTO `inventory_reservation_item` VALUES (14, 'RSV-23f693104f70', 'ORD-631e10fd14eb', 20001, 1, '2026-04-02 20:36:27.832', '2026-04-02 20:36:27.832');
INSERT INTO `inventory_reservation_item` VALUES (15, 'RSV-10c9081f80bf', 'ORD-f35ee030c0da', 20003, 1, '2026-04-08 16:49:59.540', '2026-04-08 16:49:59.540');
INSERT INTO `inventory_reservation_item` VALUES (16, 'RSV-c03af0c22adb', 'ORD-69d6c6e340a9', 20001, 3, '2026-04-08 19:40:36.468', '2026-04-08 19:40:36.468');
INSERT INTO `inventory_reservation_item` VALUES (17, 'RSV-30f3185f8703', 'ORD-ab24b15ac53e', 20005, 1, '2026-04-08 22:02:43.285', '2026-04-08 22:02:43.285');
INSERT INTO `inventory_reservation_item` VALUES (18, 'RSV-be64c1d2a2cb', 'ORD-fa92541ec59c', 20001, 3, '2026-04-08 22:05:59.924', '2026-04-08 22:05:59.924');
INSERT INTO `inventory_reservation_item` VALUES (19, 'RSV-baaf0f2a4a9e', 'ORD-194d2b574052', 20005, 2, '2026-04-08 22:50:29.534', '2026-04-08 22:50:29.534');
INSERT INTO `inventory_reservation_item` VALUES (20, 'RSV-7445eaa327d5', 'ORD-42194a487d65', 20005, 2, '2026-04-08 22:50:36.129', '2026-04-08 22:50:36.129');
INSERT INTO `inventory_reservation_item` VALUES (21, 'RSV-b86fd14fedd6', 'ORD-787b35401a1a', 20001, 1, '2026-04-08 23:43:35.996', '2026-04-08 23:43:35.996');
INSERT INTO `inventory_reservation_item` VALUES (22, 'RSV-d80cad8ef532', 'ORD-1c26b36df563', 20005, 1, '2026-04-09 13:44:21.222', '2026-04-09 13:44:21.222');
INSERT INTO `inventory_reservation_item` VALUES (23, 'RSV-3596cb75e38f', 'ORD-0992a6bb2c0c', 20005, 3, '2026-04-09 16:49:33.319', '2026-04-09 16:49:33.319');

-- ----------------------------
-- Table structure for inventory_stock
-- ----------------------------
DROP TABLE IF EXISTS `inventory_stock`;
CREATE TABLE `inventory_stock`  (
  `sku_id` bigint NOT NULL,
  `available_qty` int NOT NULL,
  `locked_qty` int NOT NULL DEFAULT 0,
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`sku_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inventory_stock
-- ----------------------------
INSERT INTO `inventory_stock` VALUES (20001, 88, 0, '2026-04-02 16:25:20.454', '2026-04-08 23:43:37.295');
INSERT INTO `inventory_stock` VALUES (20002, 54, 0, '2026-04-02 16:25:20.454', '2026-04-08 20:34:45.104');
INSERT INTO `inventory_stock` VALUES (20003, 36, 0, '2026-04-08 16:48:25.942', '2026-04-08 20:34:45.104');
INSERT INTO `inventory_stock` VALUES (20004, 26, 0, '2026-04-08 16:48:25.942', '2026-04-08 20:34:45.104');
INSERT INTO `inventory_stock` VALUES (20005, 64, 0, '2026-04-08 16:48:25.942', '2026-04-09 23:48:34.300');
INSERT INTO `inventory_stock` VALUES (20006, 9, 0, '2026-04-08 16:48:25.942', '2026-04-08 18:41:19.889');
INSERT INTO `inventory_stock` VALUES (20007, 22, 0, '2026-04-08 16:48:25.942', '2026-04-08 18:41:19.889');
INSERT INTO `inventory_stock` VALUES (20008, 7, 0, '2026-04-08 16:48:25.942', '2026-04-08 18:41:19.889');
INSERT INTO `inventory_stock` VALUES (20009, 14, 0, '2026-04-08 16:48:25.942', '2026-04-08 20:34:45.104');
INSERT INTO `inventory_stock` VALUES (20010, 5, 0, '2026-04-08 16:48:25.942', '2026-04-08 18:41:19.889');
INSERT INTO `inventory_stock` VALUES (20011, 18, 0, '2026-04-08 20:34:45.104', '2026-04-08 20:34:45.104');
INSERT INTO `inventory_stock` VALUES (20012, 4, 0, '2026-04-08 20:34:45.104', '2026-04-08 20:34:45.104');
INSERT INTO `inventory_stock` VALUES (20013, 12, 0, '2026-04-08 20:34:45.104', '2026-04-08 20:34:45.104');
INSERT INTO `inventory_stock` VALUES (20014, 3, 0, '2026-04-08 20:34:45.104', '2026-04-08 20:34:45.104');

SET FOREIGN_KEY_CHECKS = 1;
