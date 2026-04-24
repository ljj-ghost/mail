/*
 Navicat Premium Data Transfer

 Source Server         : ljj
 Source Server Type    : MySQL
 Source Server Version : 80045 (8.0.45)
 Source Host           : 192.168.145.128:3306
 Source Schema         : mall_user

 Target Server Type    : MySQL
 Target Server Version : 80045 (8.0.45)
 File Encoding         : 65001

 Date: 15/04/2026 16:42:45
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ums_user
-- ----------------------------
DROP TABLE IF EXISTS `ums_user`;
CREATE TABLE `ums_user`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `nickname` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mobile` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `status` tinyint NOT NULL DEFAULT 1,
  `role_code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_ums_user_user_id`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 85 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ums_user
-- ----------------------------
INSERT INTO `ums_user` VALUES (1, 1001001, 'Mall Demo User', '13800138000', 'demo@mall.com', 1, 'USER', '2026-04-03 10:36:49.678', '2026-04-08 19:40:56.921');
INSERT INTO `ums_user` VALUES (4, 1001002, 'Mall Admin Console', '13900139000', 'admin@mall.com', 1, 'ADMIN', '2026-04-08 13:29:33.356', '2026-04-08 13:29:33.356');
INSERT INTO `ums_user` VALUES (20, 1775634592132518, 'Direct Register', '13999990001', 'directregistercheck@mall.test', 1, 'USER', '2026-04-08 15:49:52.091', '2026-04-08 15:49:52.091');
INSERT INTO `ums_user` VALUES (21, 1775634746425924, 'Architect 0408155226', '13904081552', 'architect0408155226@mall.test', 1, 'USER', '2026-04-08 15:52:26.384', '2026-04-08 15:52:26.384');
INSERT INTO `ums_user` VALUES (33, 1001003, '周沐', '13700137001', 'zhoumu@mall.com', 1, 'USER', '2026-04-08 20:34:36.796', '2026-04-08 20:34:36.796');
INSERT INTO `ums_user` VALUES (34, 1001004, '林序', '13700137002', 'linxu@mall.com', 1, 'USER', '2026-04-08 20:34:36.796', '2026-04-08 20:34:36.796');
INSERT INTO `ums_user` VALUES (35, 1001005, '赵青', '13700137003', 'zhaoqing@mall.com', 1, 'USER', '2026-04-08 20:34:36.796', '2026-04-08 20:34:36.796');
INSERT INTO `ums_user` VALUES (36, 1001006, '苏砚', '13700137004', 'suyan@mall.com', 1, 'USER', '2026-04-08 20:34:36.796', '2026-04-08 20:34:36.796');

-- ----------------------------
-- Table structure for ums_user_address
-- ----------------------------
DROP TABLE IF EXISTS `ums_user_address`;
CREATE TABLE `ums_user_address`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `consignee_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `consignee_mobile` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint NOT NULL DEFAULT 0,
  `deleted` tinyint NOT NULL DEFAULT 0,
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ums_user_address_user_id`(`user_id` ASC, `deleted` ASC, `is_default` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ums_user_address
-- ----------------------------
INSERT INTO `ums_user_address` VALUES (1, 1001001, '张三', '13800138000', '上海市浦东新区世纪大道 100 号', 1, 0, '2026-04-03 10:36:49.699', '2026-04-08 20:34:36.798');
INSERT INTO `ums_user_address` VALUES (2, 1001001, '李四', '13900139000', '上海市静安区南京西路 88 号', 0, 0, '2026-04-03 10:36:49.699', '2026-04-08 20:34:36.798');
INSERT INTO `ums_user_address` VALUES (3, 1001002, '运营管理部', '13900139000', '上海市浦东新区世纪大道 300 号', 1, 0, '2026-04-03 10:37:30.110', '2026-04-08 20:34:36.798');
INSERT INTO `ums_user_address` VALUES (4, 1001003, '周沐', '13700137001', '杭州市滨江区江南大道 66 号', 1, 0, '2026-04-08 20:34:36.798', '2026-04-08 20:34:36.798');
INSERT INTO `ums_user_address` VALUES (5, 1001004, '林序', '13700137002', '深圳市南山区科技园南路 18 号', 1, 0, '2026-04-08 20:34:36.798', '2026-04-08 20:34:36.798');
INSERT INTO `ums_user_address` VALUES (6, 1001005, '赵青', '13700137003', '北京市朝阳区望京阜通东大街 20 号', 1, 0, '2026-04-08 20:34:36.798', '2026-04-08 20:34:36.798');
INSERT INTO `ums_user_address` VALUES (7, 1001006, '苏砚', '13700137004', '成都市高新区天府大道北段 88 号', 1, 0, '2026-04-08 20:34:36.798', '2026-04-08 20:34:36.798');
INSERT INTO `ums_user_address` VALUES (8, 1001001, '????', '13800138000', 'Codex????-20260408224645', 0, 1, '2026-04-08 22:46:45.194', '2026-04-08 23:44:25.647');
INSERT INTO `ums_user_address` VALUES (9, 1001001, '????', '13800138000', 'Codex????-20260408224659', 0, 1, '2026-04-08 22:46:59.692', '2026-04-08 22:47:11.965');
INSERT INTO `ums_user_address` VALUES (10, 1001001, '666', '13900139000', '打赏v的', 0, 1, '2026-04-08 22:51:02.981', '2026-04-08 23:44:28.175');
INSERT INTO `ums_user_address` VALUES (11, 1001001, '???????', '13800138001', '???????-20260408234334', 0, 1, '2026-04-08 23:43:34.318', '2026-04-08 23:43:34.360');

SET FOREIGN_KEY_CHECKS = 1;
