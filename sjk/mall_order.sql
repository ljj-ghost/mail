/*
 Navicat Premium Data Transfer

 Source Server         : ljj
 Source Server Type    : MySQL
 Source Server Version : 80045 (8.0.45)
 Source Host           : 192.168.145.128:3306
 Source Schema         : mall_order

 Target Server Type    : MySQL
 Target Server Version : 80045 (8.0.45)
 File Encoding         : 65001

 Date: 15/04/2026 16:43:12
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for oms_order
-- ----------------------------
DROP TABLE IF EXISTS `oms_order`;
CREATE TABLE `oms_order`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_no` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint NOT NULL,
  `order_status` int NOT NULL,
  `pay_status` int NOT NULL,
  `buyer_remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `reserve_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `payment_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `pay_channel` int NULL DEFAULT NULL,
  `pay_amount` decimal(16, 2) NOT NULL,
  `pay_time` datetime(3) NULL DEFAULT NULL,
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_oms_order_order_no`(`order_no` ASC) USING BTREE,
  INDEX `idx_oms_order_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_oms_order_status`(`order_status` ASC, `pay_status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 59 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of oms_order
-- ----------------------------
INSERT INTO `oms_order` VALUES (1, 'ORD-a683eb7b69f7', 1001001, 20, 2, 'db persist verify', 'RSV-8ee6ab6b7980', 'PAY-b30304fa1946', 1, 398.00, '2026-04-02 16:26:02.147', '2026-04-02 16:26:02.191', '2026-04-02 16:26:02.926', 0);
INSERT INTO `oms_order` VALUES (2, 'ORD-cf70aec10bd5', 1001001, 50, 4, 'clear cart verification', 'RSV-4203d2d9027e', NULL, NULL, 269.00, NULL, '2026-04-02 19:10:23.240', '2026-04-08 23:44:51.059', 1);
INSERT INTO `oms_order` VALUES (3, 'ORD-0dd09c09121e', 1001001, 50, 4, 'clear cart verification', 'RSV-7ce067e95a9f', NULL, NULL, 269.00, NULL, '2026-04-02 19:11:42.225', '2026-04-02 19:11:42.693', 0);
INSERT INTO `oms_order` VALUES (4, 'ORD-a027edbdf00a', 1001001, 20, 2, 'Order module verification', 'RSV-88c8888f1782', 'PAY-a235c127bbeb', 1, 269.00, '2026-04-02 20:07:05.925', '2026-04-02 20:07:05.415', '2026-04-02 20:07:06.234', 0);
INSERT INTO `oms_order` VALUES (5, 'ORD-9ae29eee019e', 1001001, 20, 2, 'Payment module success verification', 'RSV-d31d99f57cbd', 'PAY-3409258b2efc', 1, 269.00, '2026-04-02 20:27:30.615', '2026-04-02 20:27:30.584', '2026-04-02 20:27:30.949', 0);
INSERT INTO `oms_order` VALUES (6, 'ORD-fc7d2722fb22', 1001001, 50, 4, 'Payment module close verification', 'RSV-c699f49d6add', NULL, NULL, 269.00, NULL, '2026-04-02 20:27:31.067', '2026-04-02 20:27:31.167', 0);
INSERT INTO `oms_order` VALUES (7, 'ORD-59faa9632174', 1001001, 20, 2, 'Payment module success verification', 'RSV-4ea8cd92275e', 'PAY-f07b59e04455', 1, 269.00, '2026-04-02 20:28:25.913', '2026-04-02 20:28:26.080', '2026-04-02 20:28:26.228', 0);
INSERT INTO `oms_order` VALUES (8, 'ORD-d02c16114760', 1001001, 50, 4, 'Payment module close verification', 'RSV-8d93ab46d640', NULL, NULL, 269.00, NULL, '2026-04-02 20:28:26.329', '2026-04-02 20:28:26.404', 0);
INSERT INTO `oms_order` VALUES (9, 'ORD-4a0e0b2e1452', 1001001, 20, 2, 'Payment module success verification', 'RSV-fe22118fb8b7', 'PAY-59ffd1fd68aa', 1, 269.00, '2026-04-02 20:29:08.595', '2026-04-02 20:29:08.770', '2026-04-02 20:29:08.904', 0);
INSERT INTO `oms_order` VALUES (10, 'ORD-34f472ecd059', 1001001, 50, 4, 'Payment module close verification', 'RSV-c4f732689977', NULL, NULL, 269.00, NULL, '2026-04-02 20:29:09.004', '2026-04-02 20:29:09.074', 0);
INSERT INTO `oms_order` VALUES (11, 'ORD-e1284e29f2d5', 1001001, 50, 4, 'Payment smoke verification', 'RSV-1d368d5ee1b9', NULL, NULL, 269.00, NULL, '2026-04-02 20:33:39.477', '2026-04-02 20:33:40.188', 0);
INSERT INTO `oms_order` VALUES (12, 'ORD-631e10fd14eb', 1001001, 50, 4, 'Payment final verification', 'RSV-23f693104f70', NULL, NULL, 269.00, NULL, '2026-04-02 20:36:28.122', '2026-04-02 20:36:28.840', 0);
INSERT INTO `oms_order` VALUES (13, 'ORD-f35ee030c0da', 1001001, 20, 2, 'verify new sku path', 'RSV-10c9081f80bf', 'PAY-c9d9fc48fd96', 1, 999.00, '2026-04-08 16:50:02.018', '2026-04-08 16:49:59.924', '2026-04-08 16:50:02.101', 0);
INSERT INTO `oms_order` VALUES (14, 'ORD-69d6c6e340a9', 1001001, 20, 2, '', 'RSV-c03af0c22adb', 'PAY-3abf8b6ea086', 1, 807.00, '2026-04-08 19:40:42.859', '2026-04-08 19:40:36.758', '2026-04-08 19:40:42.594', 0);
INSERT INTO `oms_order` VALUES (15, 'ORD-DEMO-20260401-001', 1001001, 20, 2, 'Please call before delivery', 'RSV-DEMO-001', 'PAYDEMO0001', 1, 7498.00, '2026-04-01 10:16:00.000', '2026-04-01 09:58:00.000', '2026-04-08 23:44:48.427', 1);
INSERT INTO `oms_order` VALUES (16, 'ORD-DEMO-20260403-002', 1001001, 10, 0, 'Leave at reception desk', 'RSV-DEMO-002', 'PAYDEMO0002', 2, 2299.00, NULL, '2026-04-03 15:40:00.000', '2026-04-08 21:09:30.411', 0);
INSERT INTO `oms_order` VALUES (17, 'ORD-ADMIN-20260405-003', 1001002, 20, 2, 'For showroom use', 'RSV-ADMIN-003', 'PAYADMIN0003', 1, 12999.00, '2026-04-05 13:30:00.000', '2026-04-05 12:48:00.000', '2026-04-08 21:09:30.411', 0);
INSERT INTO `oms_order` VALUES (18, 'ORD-ADMIN-20260406-004', 1001002, 50, 4, 'Cancel before shipping', 'RSV-ADMIN-004', 'PAYADMIN0004', 1, 1599.00, NULL, '2026-04-06 18:20:00.000', '2026-04-08 21:09:30.411', 0);
INSERT INTO `oms_order` VALUES (27, 'ORD-ab24b15ac53e', 1001001, 20, 2, '', 'RSV-30f3185f8703', 'PAY-d288597ad3ed', 2, 5999.00, '2026-04-08 22:02:47.612', '2026-04-08 22:02:43.610', '2026-04-08 22:02:47.589', 0);
INSERT INTO `oms_order` VALUES (28, 'ORD-fa92541ec59c', 1001001, 20, 2, '', 'RSV-be64c1d2a2cb', 'PAY-2f94c17f9863', 1, 17997.00, '2026-04-08 22:06:01.518', '2026-04-08 22:05:59.931', '2026-04-08 22:06:01.484', 0);
INSERT INTO `oms_order` VALUES (33, 'ORD-194d2b574052', 1001001, 20, 2, '', 'RSV-baaf0f2a4a9e', 'PAY-a7956d3c4b4f', 1, 11998.00, '2026-04-08 22:50:32.762', '2026-04-08 22:50:29.805', '2026-04-08 22:50:32.794', 0);
INSERT INTO `oms_order` VALUES (34, 'ORD-42194a487d65', 1001001, 20, 2, '', 'RSV-7445eaa327d5', 'PAY-e44a132cfb06', 1, 11998.00, '2026-04-08 22:50:37.523', '2026-04-08 22:50:36.134', '2026-04-08 22:50:37.545', 0);
INSERT INTO `oms_order` VALUES (39, 'ORD-787b35401a1a', 1001001, 50, 4, 'codex-delete-check', 'RSV-b86fd14fedd6', NULL, NULL, 5999.00, NULL, '2026-04-08 23:43:36.319', '2026-04-08 23:43:37.902', 1);
INSERT INTO `oms_order` VALUES (44, 'ORD-1c26b36df563', 1001001, 20, 2, '', 'RSV-d80cad8ef532', 'PAY-d631bf238542', 3, 5999.00, '2026-04-09 13:44:27.681', '2026-04-09 13:44:21.533', '2026-04-09 13:44:27.166', 0);
INSERT INTO `oms_order` VALUES (53, 'ORD-0992a6bb2c0c', 1001001, 20, 2, '', 'RSV-3596cb75e38f', 'PAY-b7303c5100c5', 3, 17997.00, '2026-04-09 16:49:38.303', '2026-04-09 16:49:33.361', '2026-04-09 16:49:37.187', 0);

-- ----------------------------
-- Table structure for oms_order_item
-- ----------------------------
DROP TABLE IF EXISTS `oms_order_item`;
CREATE TABLE `oms_order_item`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_no` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku_id` bigint NOT NULL,
  `sku_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `sale_price` decimal(16, 2) NOT NULL,
  `item_amount` decimal(16, 2) NOT NULL,
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_oms_order_item_order_no`(`order_no` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 73 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of oms_order_item
-- ----------------------------
INSERT INTO `oms_order_item` VALUES (1, 'ORD-a683eb7b69f7', 20001, 'iPhone 16 256G Black', 1, 269.00, 269.00, '2026-04-02 16:26:02.196', '2026-04-02 16:26:02.196');
INSERT INTO `oms_order_item` VALUES (2, 'ORD-a683eb7b69f7', 20002, 'AirPods Pro 2', 1, 129.00, 129.00, '2026-04-02 16:26:02.199', '2026-04-02 16:26:02.199');
INSERT INTO `oms_order_item` VALUES (3, 'ORD-cf70aec10bd5', 20001, 'iPhone 16 256G Black', 1, 269.00, 269.00, '2026-04-02 19:10:23.243', '2026-04-02 19:10:23.243');
INSERT INTO `oms_order_item` VALUES (4, 'ORD-0dd09c09121e', 20001, 'iPhone 16 256G Black', 1, 269.00, 269.00, '2026-04-02 19:11:42.226', '2026-04-02 19:11:42.226');
INSERT INTO `oms_order_item` VALUES (5, 'ORD-a027edbdf00a', 20001, 'iPhone 16 256G Black', 1, 269.00, 269.00, '2026-04-02 20:07:05.418', '2026-04-02 20:07:05.418');
INSERT INTO `oms_order_item` VALUES (6, 'ORD-9ae29eee019e', 20001, 'iPhone 16 256G Black', 1, 269.00, 269.00, '2026-04-02 20:27:30.593', '2026-04-02 20:27:30.593');
INSERT INTO `oms_order_item` VALUES (7, 'ORD-fc7d2722fb22', 20001, 'iPhone 16 256G Black', 1, 269.00, 269.00, '2026-04-02 20:27:31.069', '2026-04-02 20:27:31.069');
INSERT INTO `oms_order_item` VALUES (8, 'ORD-59faa9632174', 20001, 'iPhone 16 256G Black', 1, 269.00, 269.00, '2026-04-02 20:28:26.081', '2026-04-02 20:28:26.081');
INSERT INTO `oms_order_item` VALUES (9, 'ORD-d02c16114760', 20001, 'iPhone 16 256G Black', 1, 269.00, 269.00, '2026-04-02 20:28:26.330', '2026-04-02 20:28:26.330');
INSERT INTO `oms_order_item` VALUES (10, 'ORD-4a0e0b2e1452', 20001, 'iPhone 16 256G Black', 1, 269.00, 269.00, '2026-04-02 20:29:08.772', '2026-04-02 20:29:08.772');
INSERT INTO `oms_order_item` VALUES (11, 'ORD-34f472ecd059', 20001, 'iPhone 16 256G Black', 1, 269.00, 269.00, '2026-04-02 20:29:09.005', '2026-04-02 20:29:09.005');
INSERT INTO `oms_order_item` VALUES (12, 'ORD-e1284e29f2d5', 20001, 'iPhone 16 256G Black', 1, 269.00, 269.00, '2026-04-02 20:33:39.481', '2026-04-02 20:33:39.481');
INSERT INTO `oms_order_item` VALUES (13, 'ORD-631e10fd14eb', 20001, 'iPhone 16 256G Black', 1, 269.00, 269.00, '2026-04-02 20:36:28.126', '2026-04-02 20:36:28.126');
INSERT INTO `oms_order_item` VALUES (14, 'ORD-f35ee030c0da', 20003, 'MacBook Air 15 16G 512G Silver', 1, 999.00, 999.00, '2026-04-08 16:49:59.928', '2026-04-08 16:49:59.928');
INSERT INTO `oms_order_item` VALUES (15, 'ORD-69d6c6e340a9', 20001, '苹果手机 16 256 存储 曜石黑', 3, 269.00, 807.00, '2026-04-08 19:40:36.760', '2026-04-08 19:40:36.760');
INSERT INTO `oms_order_item` VALUES (31, 'ORD-ab24b15ac53e', 20005, 'Nova X16 256G 极地白', 1, 5999.00, 5999.00, '2026-04-08 22:02:43.612', '2026-04-08 22:02:43.612');
INSERT INTO `oms_order_item` VALUES (32, 'ORD-fa92541ec59c', 20001, 'Nova X16 256G 曜石黑', 3, 5999.00, 17997.00, '2026-04-08 22:05:59.933', '2026-04-08 22:05:59.933');
INSERT INTO `oms_order_item` VALUES (38, 'ORD-194d2b574052', 20005, 'Nova X16 256G 极地白', 2, 5999.00, 11998.00, '2026-04-08 22:50:29.808', '2026-04-08 22:50:29.808');
INSERT INTO `oms_order_item` VALUES (39, 'ORD-42194a487d65', 20005, 'Nova X16 256G 极地白', 2, 5999.00, 11998.00, '2026-04-08 22:50:36.135', '2026-04-08 22:50:36.135');
INSERT INTO `oms_order_item` VALUES (45, 'ORD-787b35401a1a', 20001, 'Nova X16 256G 曜石黑', 1, 5999.00, 5999.00, '2026-04-08 23:43:36.321', '2026-04-08 23:43:36.321');
INSERT INTO `oms_order_item` VALUES (51, 'ORD-1c26b36df563', 20005, 'Nova X16 256G 极地白', 1, 5999.00, 5999.00, '2026-04-09 13:44:21.535', '2026-04-09 13:44:21.535');
INSERT INTO `oms_order_item` VALUES (62, 'ORD-0992a6bb2c0c', 20005, 'Nova X16 256G 极地白', 3, 5999.00, 17997.00, '2026-04-09 16:49:33.364', '2026-04-09 16:49:33.364');
INSERT INTO `oms_order_item` VALUES (68, 'ORD-DEMO-20260401-001', 20001, 'Nova X16 256G Black', 1, 5999.00, 5999.00, '2026-04-01 09:58:00.000', '2026-04-15 15:54:34.440');
INSERT INTO `oms_order_item` VALUES (69, 'ORD-DEMO-20260401-001', 20002, 'Echo Pods Pro 2 Silver', 1, 1499.00, 1499.00, '2026-04-01 09:58:00.000', '2026-04-15 15:54:34.440');
INSERT INTO `oms_order_item` VALUES (70, 'ORD-DEMO-20260403-002', 20010, 'Dome Speaker Duo', 1, 2299.00, 2299.00, '2026-04-03 15:40:00.000', '2026-04-15 15:54:34.440');
INSERT INTO `oms_order_item` VALUES (71, 'ORD-ADMIN-20260405-003', 20014, 'Creator Book 14 Starlight', 1, 12999.00, 12999.00, '2026-04-05 12:48:00.000', '2026-04-15 15:54:34.440');
INSERT INTO `oms_order_item` VALUES (72, 'ORD-ADMIN-20260406-004', 20007, 'Echo Pods Pro 2 Midnight', 1, 1599.00, 1599.00, '2026-04-06 18:20:00.000', '2026-04-15 15:54:34.440');

-- ----------------------------
-- Table structure for oms_order_submit_log
-- ----------------------------
DROP TABLE IF EXISTS `oms_order_submit_log`;
CREATE TABLE `oms_order_submit_log`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `idempotency_key` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_no` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_oms_order_submit_log_user_key`(`user_id` ASC, `idempotency_key` ASC) USING BTREE,
  UNIQUE INDEX `uk_oms_order_submit_log_order_no`(`order_no` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 59 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of oms_order_submit_log
-- ----------------------------
INSERT INTO `oms_order_submit_log` VALUES (1, 1001001, 'idem-db-001', 'ORD-a683eb7b69f7', '2026-04-02 16:26:02.199');
INSERT INTO `oms_order_submit_log` VALUES (2, 1001001, 'codex-clear-cart-20260402191022528', 'ORD-cf70aec10bd5', '2026-04-02 19:10:23.244');
INSERT INTO `oms_order_submit_log` VALUES (3, 1001001, 'codex-clear-cart-20260402191141808', 'ORD-0dd09c09121e', '2026-04-02 19:11:42.227');
INSERT INTO `oms_order_submit_log` VALUES (4, 1001001, 'order-module-test-1775131624287', 'ORD-a027edbdf00a', '2026-04-02 20:07:05.420');
INSERT INTO `oms_order_submit_log` VALUES (5, 1001001, 'payment-module-test-1775132849067-0271', 'ORD-9ae29eee019e', '2026-04-02 20:27:30.594');
INSERT INTO `oms_order_submit_log` VALUES (6, 1001001, 'payment-module-test-1775132850740-74c8', 'ORD-fc7d2722fb22', '2026-04-02 20:27:31.070');
INSERT INTO `oms_order_submit_log` VALUES (7, 1001001, 'payment-module-test-1775132905755-856a', 'ORD-59faa9632174', '2026-04-02 20:28:26.082');
INSERT INTO `oms_order_submit_log` VALUES (8, 1001001, 'payment-module-test-1775132906014-e1da', 'ORD-d02c16114760', '2026-04-02 20:28:26.330');
INSERT INTO `oms_order_submit_log` VALUES (9, 1001001, 'payment-module-test-1775132948443-48ba', 'ORD-4a0e0b2e1452', '2026-04-02 20:29:08.773');
INSERT INTO `oms_order_submit_log` VALUES (10, 1001001, 'payment-module-test-1775132948681-aea9', 'ORD-34f472ecd059', '2026-04-02 20:29:09.006');
INSERT INTO `oms_order_submit_log` VALUES (11, 1001001, 'payment-smoke-1775133217951', 'ORD-e1284e29f2d5', '2026-04-02 20:33:39.482');
INSERT INTO `oms_order_submit_log` VALUES (12, 1001001, 'payment-final-1775133386634', 'ORD-631e10fd14eb', '2026-04-02 20:36:28.127');
INSERT INTO `oms_order_submit_log` VALUES (13, 1001001, 'de5b8106-eb38-485d-b8a6-3c5e391e2345', 'ORD-f35ee030c0da', '2026-04-08 16:49:59.929');
INSERT INTO `oms_order_submit_log` VALUES (14, 1001001, 'cd24ed63-6ed4-4fa0-9ad1-42b0f129cc7d', 'ORD-69d6c6e340a9', '2026-04-08 19:40:36.761');
INSERT INTO `oms_order_submit_log` VALUES (15, 1001001, 'seed-demo-order-001', 'ORD-DEMO-20260401-001', '2026-04-01 09:58:00.000');
INSERT INTO `oms_order_submit_log` VALUES (16, 1001001, 'seed-demo-order-002', 'ORD-DEMO-20260403-002', '2026-04-03 15:40:00.000');
INSERT INTO `oms_order_submit_log` VALUES (17, 1001002, 'seed-admin-order-003', 'ORD-ADMIN-20260405-003', '2026-04-05 12:48:00.000');
INSERT INTO `oms_order_submit_log` VALUES (18, 1001002, 'seed-admin-order-004', 'ORD-ADMIN-20260406-004', '2026-04-06 18:20:00.000');
INSERT INTO `oms_order_submit_log` VALUES (27, 1001001, '880b7387-021b-4aac-8c98-2257da84c4a9', 'ORD-ab24b15ac53e', '2026-04-08 22:02:43.612');
INSERT INTO `oms_order_submit_log` VALUES (28, 1001001, '44fbaf30-1aca-479b-8e29-221b67974939', 'ORD-fa92541ec59c', '2026-04-08 22:05:59.933');
INSERT INTO `oms_order_submit_log` VALUES (33, 1001001, 'f57b8f25-3793-4a40-819f-cf41c3c43c20', 'ORD-194d2b574052', '2026-04-08 22:50:29.808');
INSERT INTO `oms_order_submit_log` VALUES (34, 1001001, '17b35d75-4a6a-4507-800a-7ceb6bfb49d8', 'ORD-42194a487d65', '2026-04-08 22:50:36.136');
INSERT INTO `oms_order_submit_log` VALUES (39, 1001001, '5098932d-640e-416a-92b9-6bbcd6195d5b', 'ORD-787b35401a1a', '2026-04-08 23:43:36.322');
INSERT INTO `oms_order_submit_log` VALUES (44, 1001001, 'a7f24e25-5663-435b-9fe2-70db3ab3f614', 'ORD-1c26b36df563', '2026-04-09 13:44:21.536');
INSERT INTO `oms_order_submit_log` VALUES (53, 1001001, '4af6e1f1-07cd-475d-a4c7-eb1dbda066fb', 'ORD-0992a6bb2c0c', '2026-04-09 16:49:33.364');

SET FOREIGN_KEY_CHECKS = 1;
