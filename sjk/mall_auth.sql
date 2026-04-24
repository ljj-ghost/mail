/*
 Navicat Premium Data Transfer

 Source Server         : ljj
 Source Server Type    : MySQL
 Source Server Version : 80045 (8.0.45)
 Source Host           : 192.168.145.128:3306
 Source Schema         : mall_auth

 Target Server Type    : MySQL
 Target Server Version : 80045 (8.0.45)
 File Encoding         : 65001

 Date: 15/04/2026 16:43:33
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for auth_account
-- ----------------------------
DROP TABLE IF EXISTS `auth_account`;
CREATE TABLE `auth_account`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `login_type` tinyint NOT NULL,
  `login_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `status` tinyint NOT NULL DEFAULT 1,
  `role_code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `fail_count` int NOT NULL DEFAULT 0,
  `last_login_time` datetime(3) NULL DEFAULT NULL,
  `last_login_ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `pwd_modified_time` datetime(3) NULL DEFAULT NULL,
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `created_by` bigint UNSIGNED NOT NULL DEFAULT 0,
  `created_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_by` bigint UNSIGNED NOT NULL DEFAULT 0,
  `updated_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted` tinyint NOT NULL DEFAULT 0,
  `version` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_auth_account_login_type_name`(`login_type` ASC, `login_name` ASC) USING BTREE,
  INDEX `idx_auth_account_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_auth_account_status_login_time`(`status` ASC, `last_login_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 172 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of auth_account
-- ----------------------------
INSERT INTO `auth_account` VALUES (1, 1001001, 1, 'demo', '$2a$10$I/vx70kHKNSSIpbp1GsEh.87436T.39sx0isJPnQLaXCCNqRB8x/y', 1, 'USER', 0, '2026-04-15 15:56:09.189', '0:0:0:0:0:0:0:1', '2026-04-02 16:46:09.731', 'Mall Demo User', 0, '2026-04-02 16:46:09.731', 0, '2026-04-15 15:56:09.189', 0, 0);
INSERT INTO `auth_account` VALUES (2, 1001001, 1, '13800138000', '$2a$10$QgWK8UZ5a84pm1unY6x7gOBeC.NcXeCWf6gZ.TEzzzlnWJw/gkDdy', 1, 'USER', 0, '2026-04-03 11:27:20.755', '0:0:0:0:0:0:0:1', '2026-04-02 16:46:09.863', 'Mall Demo User', 0, '2026-04-02 16:46:09.863', 0, '2026-04-15 15:54:20.425', 0, 0);
INSERT INTO `auth_account` VALUES (3, 1001001, 1, 'demo@mall.com', '$2a$10$fJprno3To7gZG2PktAqUYOsNRO7JJfhCnG5FHnRkns91fek/2t0mC', 1, 'USER', 0, '2026-04-02 16:47:00.329', '0:0:0:0:0:0:0:1', '2026-04-02 16:46:10.011', 'Mall Demo User', 0, '2026-04-02 16:46:10.011', 0, '2026-04-15 15:54:20.516', 0, 0);
INSERT INTO `auth_account` VALUES (7, 1001002, 1, 'admin', '$2a$10$dcmmVM1e7Tg0spmDNqUqVOJaQEcNpFUdY6BvzxUg2lB/vbjid8hyy', 1, 'ADMIN', 0, '2026-04-15 16:15:42.296', '0:0:0:0:0:0:0:1', '2026-04-08 13:27:54.411', 'Mall Admin Console', 0, '2026-04-08 13:27:54.411', 0, '2026-04-15 16:15:42.296', 0, 0);
INSERT INTO `auth_account` VALUES (8, 1001002, 1, '13900139000', '$2a$10$lRZUI14CiIsmTx2igIWq3uA9sO/4Upk.zxZ5Cb9zYc81qYuykar.S', 1, 'ADMIN', 0, NULL, '', '2026-04-08 13:27:54.480', 'Mall Admin Console', 0, '2026-04-08 13:27:54.480', 0, '2026-04-15 15:54:20.692', 0, 0);
INSERT INTO `auth_account` VALUES (9, 1001002, 1, 'admin@mall.com', '$2a$10$wSDbUfnpl.AD6D/S3E11jOKlpnEdfW8QOzH2kDfv4yL/17mjYnp8S', 1, 'ADMIN', 0, NULL, '', '2026-04-08 13:27:54.551', 'Mall Admin Console', 0, '2026-04-08 13:27:54.551', 0, '2026-04-15 15:54:20.790', 0, 0);
INSERT INTO `auth_account` VALUES (58, 1775634592132518, 1, 'directregistercheck', '$2a$10$/JN9/sDKsbtKRwCKiJJDLeRS03micfSoKFbuJUcxcOl67NfaRfeKi', 1, 'USER', 0, '2026-04-08 15:49:52.271', '127.0.0.1', '2026-04-08 15:49:52.096', 'Direct Register', 0, '2026-04-08 15:49:52.096', 0, '2026-04-08 15:49:52.271', 0, 0);
INSERT INTO `auth_account` VALUES (59, 1775634592132518, 1, '13999990001', '$2a$10$/JN9/sDKsbtKRwCKiJJDLeRS03micfSoKFbuJUcxcOl67NfaRfeKi', 1, 'USER', 0, NULL, '', '2026-04-08 15:49:52.099', 'Direct Register', 0, '2026-04-08 15:49:52.099', 0, '2026-04-08 15:49:52.099', 0, 0);
INSERT INTO `auth_account` VALUES (60, 1775634592132518, 1, 'directregistercheck@mall.test', '$2a$10$/JN9/sDKsbtKRwCKiJJDLeRS03micfSoKFbuJUcxcOl67NfaRfeKi', 1, 'USER', 0, NULL, '', '2026-04-08 15:49:52.101', 'Direct Register', 0, '2026-04-08 15:49:52.101', 0, '2026-04-08 15:49:52.101', 0, 0);
INSERT INTO `auth_account` VALUES (61, 1775634746425924, 1, 'architect0408155226', '$2a$10$rUGeWmCEGuadT0cQw/B4cu1SPe5PJitOYnYUV.AJlMm8m9X7NmyDG', 1, 'USER', 0, '2026-04-08 15:52:26.459', '127.0.0.1', '2026-04-08 15:52:26.385', 'Architect 0408155226', 0, '2026-04-08 15:52:26.385', 0, '2026-04-08 15:52:26.459', 0, 0);
INSERT INTO `auth_account` VALUES (62, 1775634746425924, 1, '13904081552', '$2a$10$rUGeWmCEGuadT0cQw/B4cu1SPe5PJitOYnYUV.AJlMm8m9X7NmyDG', 1, 'USER', 0, '2026-04-08 15:52:54.498', '127.0.0.1', '2026-04-08 15:52:26.385', 'Architect 0408155226', 0, '2026-04-08 15:52:26.385', 0, '2026-04-08 15:52:54.498', 0, 0);
INSERT INTO `auth_account` VALUES (63, 1775634746425924, 1, 'architect0408155226@mall.test', '$2a$10$rUGeWmCEGuadT0cQw/B4cu1SPe5PJitOYnYUV.AJlMm8m9X7NmyDG', 1, 'USER', 0, '2026-04-08 15:52:54.598', '127.0.0.1', '2026-04-08 15:52:26.386', 'Architect 0408155226', 0, '2026-04-08 15:52:26.386', 0, '2026-04-08 15:52:54.598', 0, 0);

-- ----------------------------
-- Table structure for auth_login_log
-- ----------------------------
DROP TABLE IF EXISTS `auth_login_log`;
CREATE TABLE `auth_login_log`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL DEFAULT 0,
  `login_type` tinyint NOT NULL,
  `login_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `device_type` tinyint NOT NULL DEFAULT 1,
  `client_ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `user_agent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `login_result` tinyint NOT NULL,
  `fail_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `trace_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `login_time` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_auth_login_log_user_time`(`user_id` ASC, `login_time` ASC) USING BTREE,
  INDEX `idx_auth_login_log_name_time`(`login_name` ASC, `login_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 53 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of auth_login_log
-- ----------------------------
INSERT INTO `auth_login_log` VALUES (1, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-02 16:46:47.205');
INSERT INTO `auth_login_log` VALUES (2, 1001001, 1, 'demo@mall.com', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-02 16:47:00.332');
INSERT INTO `auth_login_log` VALUES (3, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-02 16:51:39.670');
INSERT INTO `auth_login_log` VALUES (4, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-02 19:00:34.550');
INSERT INTO `auth_login_log` VALUES (5, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-02 19:00:49.099');
INSERT INTO `auth_login_log` VALUES (6, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-02 19:10:22.695');
INSERT INTO `auth_login_log` VALUES (7, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-02 19:11:41.967');
INSERT INTO `auth_login_log` VALUES (8, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-02 19:18:29.978');
INSERT INTO `auth_login_log` VALUES (9, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-02 19:19:06.945');
INSERT INTO `auth_login_log` VALUES (10, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-02 19:20:02.722');
INSERT INTO `auth_login_log` VALUES (11, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-02 19:41:20.972');
INSERT INTO `auth_login_log` VALUES (12, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-02 20:07:03.458');
INSERT INTO `auth_login_log` VALUES (13, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-02 20:27:28.308');
INSERT INTO `auth_login_log` VALUES (14, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-02 20:28:25.958');
INSERT INTO `auth_login_log` VALUES (15, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-02 20:29:08.654');
INSERT INTO `auth_login_log` VALUES (16, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-02 20:33:37.195');
INSERT INTO `auth_login_log` VALUES (17, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-02 20:36:25.906');
INSERT INTO `auth_login_log` VALUES (18, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-03 10:25:14.462');
INSERT INTO `auth_login_log` VALUES (19, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-03 10:37:28.895');
INSERT INTO `auth_login_log` VALUES (20, 1001001, 1, '13800138000', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', 1, '', '', '2026-04-03 11:27:20.763');
INSERT INTO `auth_login_log` VALUES (21, 1775634592132518, 1, 'directregistercheck', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 15:49:52.298');
INSERT INTO `auth_login_log` VALUES (22, 1775634746425924, 1, 'architect0408155226', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 15:52:26.462');
INSERT INTO `auth_login_log` VALUES (23, 1775634746425924, 1, '13904081552', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 15:52:54.501');
INSERT INTO `auth_login_log` VALUES (24, 1775634746425924, 1, 'architect0408155226@mall.test', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 15:52:54.604');
INSERT INTO `auth_login_log` VALUES (25, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', 1, '', '', '2026-04-08 15:58:12.325');
INSERT INTO `auth_login_log` VALUES (26, 1001001, 1, 'demo', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 16:49:56.181');
INSERT INTO `auth_login_log` VALUES (27, 1001002, 1, 'admin', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 16:49:56.181');
INSERT INTO `auth_login_log` VALUES (28, 1001002, 1, 'admin', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 18:42:13.595');
INSERT INTO `auth_login_log` VALUES (29, 1001002, 1, 'admin', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 18:46:41.731');
INSERT INTO `auth_login_log` VALUES (30, 1001002, 1, 'admin', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 18:48:40.568');
INSERT INTO `auth_login_log` VALUES (31, 1001002, 1, 'admin', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 18:50:34.529');
INSERT INTO `auth_login_log` VALUES (32, 1001002, 1, 'admin', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', 1, '', '', '2026-04-08 19:39:26.663');
INSERT INTO `auth_login_log` VALUES (33, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', 1, '', '', '2026-04-08 19:40:02.522');
INSERT INTO `auth_login_log` VALUES (34, 1001002, 1, 'admin', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', 1, '', '', '2026-04-08 19:41:05.160');
INSERT INTO `auth_login_log` VALUES (35, 1001002, 1, 'admin', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 20:36:19.150');
INSERT INTO `auth_login_log` VALUES (36, 1001002, 1, 'admin', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 20:36:38.803');
INSERT INTO `auth_login_log` VALUES (37, 1001002, 1, 'admin', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 20:36:54.474');
INSERT INTO `auth_login_log` VALUES (38, 1001002, 1, 'admin', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 21:10:18.512');
INSERT INTO `auth_login_log` VALUES (39, 1001002, 1, 'admin', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 21:10:34.380');
INSERT INTO `auth_login_log` VALUES (40, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 21:10:47.954');
INSERT INTO `auth_login_log` VALUES (41, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', 1, '', '', '2026-04-08 21:18:25.180');
INSERT INTO `auth_login_log` VALUES (42, 1001002, 1, 'admin', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', 1, '', '', '2026-04-08 22:06:23.047');
INSERT INTO `auth_login_log` VALUES (43, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', 1, '', '', '2026-04-08 22:21:48.780');
INSERT INTO `auth_login_log` VALUES (44, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 22:46:43.852');
INSERT INTO `auth_login_log` VALUES (45, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 22:46:59.632');
INSERT INTO `auth_login_log` VALUES (46, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 22:47:11.925');
INSERT INTO `auth_login_log` VALUES (47, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', 1, '', '', '2026-04-08 23:43:34.181');
INSERT INTO `auth_login_log` VALUES (48, 1001002, 1, 'admin', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', 1, '', '', '2026-04-09 17:29:20.854');
INSERT INTO `auth_login_log` VALUES (49, 1001002, 1, 'admin', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', 1, '', '', '2026-04-09 17:30:10.248');
INSERT INTO `auth_login_log` VALUES (50, 1001001, 1, 'demo', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 1, '', '', '2026-04-15 15:56:09.199');
INSERT INTO `auth_login_log` VALUES (51, 1001002, 1, 'admin', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 1, '', '', '2026-04-15 15:56:53.556');
INSERT INTO `auth_login_log` VALUES (52, 1001002, 1, 'admin', 1, '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 1, '', '', '2026-04-15 16:15:42.302');

-- ----------------------------
-- Table structure for auth_token_session
-- ----------------------------
DROP TABLE IF EXISTS `auth_token_session`;
CREATE TABLE `auth_token_session`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_no` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `access_jti` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_jti` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_type` tinyint NOT NULL DEFAULT 1,
  `device_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `client_ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `user_agent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `last_active_time` datetime(3) NOT NULL,
  `expire_time` datetime(3) NOT NULL,
  `status` tinyint NOT NULL DEFAULT 1,
  `created_by` bigint UNSIGNED NOT NULL DEFAULT 0,
  `created_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_by` bigint UNSIGNED NOT NULL DEFAULT 0,
  `updated_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted` tinyint NOT NULL DEFAULT 0,
  `version` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_auth_token_session_session_no`(`session_no` ASC) USING BTREE,
  UNIQUE INDEX `uk_auth_token_session_access_jti`(`access_jti` ASC) USING BTREE,
  UNIQUE INDEX `uk_auth_token_session_refresh_jti`(`refresh_jti` ASC) USING BTREE,
  INDEX `idx_auth_token_session_user_status`(`user_id` ASC, `status` ASC) USING BTREE,
  INDEX `idx_auth_token_session_expire_time`(`expire_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 53 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of auth_token_session
-- ----------------------------
INSERT INTO `auth_token_session` VALUES (1, 'SES-c2c5163540a34ae8', 1001001, 'f5da03ece07d459eade166a9f9458ec7', 'bc99a76c11754ba9acacc295560cc0fb', 1, 'web-001', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-02 16:46:46.885', '2026-04-09 16:46:46.884', 3, 0, '2026-04-02 16:46:47.201', 0, '2026-04-02 16:46:47.643', 0, 0);
INSERT INTO `auth_token_session` VALUES (2, 'SES-44d33c15b2144663', 1001001, 'f413de17540f485897b19a4979a969d3', '97e173e0e3684baf82896541d0b8b1e1', 1, 'web-002', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-02 16:46:59.583', '2026-04-09 16:46:59.583', 1, 0, '2026-04-02 16:47:00.330', 0, '2026-04-02 16:47:00.330', 0, 0);
INSERT INTO `auth_token_session` VALUES (3, 'SES-9bc138c9dd5c4f3d', 1001001, '6069267d2e8f455684d69e7fd8d41582', 'bb1f7434652d42bf8fb035392eb22953', 1, 'web-start', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-02 16:51:38.906', '2026-04-09 16:51:38.829', 1, 0, '2026-04-02 16:51:39.665', 0, '2026-04-02 16:51:39.665', 0, 0);
INSERT INTO `auth_token_session` VALUES (4, 'SES-ef90d0de1d1e46aa', 1001001, '4fbc35c4b76a44aa830977589ef6ba02', 'c3789062f31a4ccaa7da314e36ceda77', 1, 'codex-cart-check', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-02 19:00:34.103', '2026-04-09 19:00:34.095', 1, 0, '2026-04-02 19:00:34.547', 0, '2026-04-02 19:00:34.547', 0, 0);
INSERT INTO `auth_token_session` VALUES (5, 'SES-892466e87718404d', 1001001, '2265f3473cda46adba3e76232ccb3917', 'da20757656db432a9f0d4d1c0647e7ab', 1, 'codex-cart-check', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-02 19:00:48.657', '2026-04-09 19:00:48.655', 1, 0, '2026-04-02 19:00:49.098', 0, '2026-04-02 19:00:49.098', 0, 0);
INSERT INTO `auth_token_session` VALUES (6, 'SES-bba5a4f7bf2e4ffc', 1001001, '237da5f98b374134872cbed69ccfb062', '2388e57f3cda4374b59974fd12f151b8', 1, 'codex-order-cart-check', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-02 19:10:22.307', '2026-04-09 19:10:22.306', 1, 0, '2026-04-02 19:10:22.693', 0, '2026-04-02 19:10:22.693', 0, 0);
INSERT INTO `auth_token_session` VALUES (7, 'SES-abeb88ca48ef459b', 1001001, '0219083b82fe4dbba4e033a1027f4e2f', 'cc30c4fb868b4738b2bf823a3883e157', 1, 'codex-order-cart-check-2', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-02 19:11:41.585', '2026-04-09 19:11:41.584', 1, 0, '2026-04-02 19:11:41.966', 0, '2026-04-02 19:11:41.966', 0, 0);
INSERT INTO `auth_token_session` VALUES (8, 'SES-763b1a27d3974dc1', 1001001, '2d2b22177bbf4fc1a86129f334d4db8d', 'a1dfcc56ab3347bf9619344a343a8149', 1, 'gateway-check', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-02 19:18:29.621', '2026-04-09 19:18:29.619', 1, 0, '2026-04-02 19:18:29.976', 0, '2026-04-02 19:18:29.976', 0, 0);
INSERT INTO `auth_token_session` VALUES (9, 'SES-276ff04e8e164564', 1001001, '81d1f53452b444b281a875b6f3cc2b0b', '208a85bbdeb04bb2980024229f681418', 1, 'gateway-header-check', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-02 19:19:06.592', '2026-04-09 19:19:06.591', 1, 0, '2026-04-02 19:19:06.943', 0, '2026-04-02 19:19:06.943', 0, 0);
INSERT INTO `auth_token_session` VALUES (10, 'SES-1924907bff434df1', 1001001, '922eac14b48b44f1a1c42807b299d890', '067ffb795add4888978553f0dfcf40e0', 1, 'gateway-final-check', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-02 19:20:02.371', '2026-04-09 19:20:02.369', 1, 0, '2026-04-02 19:20:02.719', 0, '2026-04-02 19:20:02.719', 0, 0);
INSERT INTO `auth_token_session` VALUES (11, 'SES-2f2ae5362f8b47c5', 1001001, 'cabf46e12b384980b2b67dd70bedb9e2', 'd4787dea12e04afabd14fb098250d6ad', 1, 'inventory-gateway-check', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-02 19:41:20.686', '2026-04-09 19:41:20.685', 1, 0, '2026-04-02 19:41:20.971', 0, '2026-04-02 19:41:20.971', 0, 0);
INSERT INTO `auth_token_session` VALUES (12, 'SES-dafb5f5b86234d7a', 1001001, '7e481ea37ea243d28535617f8497f587', 'bb5adc8325114096ba1554ad24693bb0', 1, 'mall-web-browser', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-02 20:07:03.193', '2026-04-09 20:07:03.110', 1, 0, '2026-04-02 20:07:03.454', 0, '2026-04-02 20:07:03.454', 0, 0);
INSERT INTO `auth_token_session` VALUES (13, 'SES-3c55ce0da0654607', 1001001, 'cff790bae7264831abd8ed21ad77657b', '94d74691663f4c9186a3528bae1d57a7', 1, 'codex-payment-test', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-02 20:27:28.026', '2026-04-09 20:27:27.941', 1, 0, '2026-04-02 20:27:28.305', 0, '2026-04-02 20:27:28.305', 0, 0);
INSERT INTO `auth_token_session` VALUES (14, 'SES-6a6ffdc4df814ca6', 1001001, '9f69783b836b4207af823d86465ceb28', '1c7f704bbe0749279251f509845cbfee', 1, 'codex-payment-test', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-02 20:28:25.686', '2026-04-09 20:28:25.685', 1, 0, '2026-04-02 20:28:25.956', 0, '2026-04-02 20:28:25.956', 0, 0);
INSERT INTO `auth_token_session` VALUES (15, 'SES-5e3ee65310a24fcb', 1001001, '1ffb32f62a83481183cd352088e2fa65', 'aa6f23d928f64e62a44d7aadfcfa6ead', 1, 'codex-payment-test', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-02 20:29:08.384', '2026-04-09 20:29:08.383', 1, 0, '2026-04-02 20:29:08.653', 0, '2026-04-02 20:29:08.653', 0, 0);
INSERT INTO `auth_token_session` VALUES (16, 'SES-9f5cd712ce4346ae', 1001001, 'ee2d3461b5444c9eae8419dd50f304c4', 'fff1f3606fb54d20ac1c94056d8b86b4', 1, 'codex-payment-smoke', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-02 20:33:36.904', '2026-04-09 20:33:36.840', 1, 0, '2026-04-02 20:33:37.191', 0, '2026-04-02 20:33:37.191', 0, 0);
INSERT INTO `auth_token_session` VALUES (17, 'SES-af129155fc094e8c', 1001001, '4a432a7c1842420da8e9d061dbc9083d', '24878ea9c2044be5994a1607dd140f1e', 1, 'codex-payment-final', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-02 20:36:25.617', '2026-04-09 20:36:25.549', 1, 0, '2026-04-02 20:36:25.903', 0, '2026-04-02 20:36:25.903', 0, 0);
INSERT INTO `auth_token_session` VALUES (18, 'SES-4263678e55d6480c', 1001001, '3fe48a6a9cc640ce9bfce163fc08567e', '6941aa4ac1bd4d0e9874346f12b1262d', 1, 'codex-product-test', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-03 10:25:13.555', '2026-04-10 10:25:13.471', 1, 0, '2026-04-03 10:25:14.458', 0, '2026-04-03 10:25:14.458', 0, 0);
INSERT INTO `auth_token_session` VALUES (19, 'SES-1360b2e119924a79', 1001001, 'efd479dd28ff40b79aa371cbce40a2ed', 'a2c99b915f1f4d08970835b8b4811eb8', 1, 'codex-user-test', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-03 10:37:27.976', '2026-04-10 10:37:27.901', 1, 0, '2026-04-03 10:37:28.893', 0, '2026-04-03 10:37:28.893', 0, 0);
INSERT INTO `auth_token_session` VALUES (20, 'SES-e639c1b07ce74079', 1001001, '7761cd0b77f44a718f8cbe0ba201c7fe', '7ac83990323a4fb7bc44d72128d31fdd', 1, 'mall-web-browser', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-03 11:27:21.409', '2026-04-10 11:27:21.409', 3, 0, '2026-04-03 11:27:20.761', 0, '2026-04-03 11:27:24.717', 0, 0);
INSERT INTO `auth_token_session` VALUES (21, 'SES-d7ad8700cbb8425c', 1775634592132518, '594bb11bc9934528974231228ed60a20', '5c326431e64d4b43a928e7076526473a', 1, 'codex-verification', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 15:49:52.385', '2026-04-15 15:49:52.288', 1, 0, '2026-04-08 15:49:52.275', 0, '2026-04-08 15:49:52.275', 0, 0);
INSERT INTO `auth_token_session` VALUES (22, 'SES-0864adbc0b2e4d39', 1775634746425924, 'd7ecfcc93160499f91a925f72eed0953', 'c8fac8da6c5946739b463e08cd678480', 1, 'codex-verification', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 15:52:26.567', '2026-04-15 15:52:26.566', 1, 0, '2026-04-08 15:52:26.461', 0, '2026-04-08 15:52:26.461', 0, 0);
INSERT INTO `auth_token_session` VALUES (23, 'SES-226f3da302db4ab1', 1775634746425924, '3a09fd78907a43809c6d9dcdb748326b', '0101cd720df4420394b11bff1c40114e', 1, 'codex-mobile-check', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 15:52:54.604', '2026-04-15 15:52:54.603', 1, 0, '2026-04-08 15:52:54.500', 0, '2026-04-08 15:52:54.500', 0, 0);
INSERT INTO `auth_token_session` VALUES (24, 'SES-f7db87aa82234e55', 1775634746425924, '95d6a71f2b5f46c485ca127af42bcd9e', 'c708c5511ee740ac915212ce467e857d', 1, 'codex-email-check', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 15:52:54.702', '2026-04-15 15:52:54.701', 1, 0, '2026-04-08 15:52:54.601', 0, '2026-04-08 15:52:54.601', 0, 0);
INSERT INTO `auth_token_session` VALUES (25, 'SES-fd75e16e931846e7', 1001001, 'f34ef9652ddb4c5b81544221518d2874', 'f8a577559c5b426ba22609b7757204f9', 1, 'mall-web-browser', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-08 15:58:12.416', '2026-04-15 15:58:12.415', 3, 0, '2026-04-08 15:58:12.324', 0, '2026-04-08 15:59:10.622', 0, 0);
INSERT INTO `auth_token_session` VALUES (26, 'SES-a61b29bcb6874066', 1001001, 'a39b210c1d5e4fdf8f92735decbbb02d', '74aa34b2956e400a8d549557523a3852', 1, 'codex-order-check', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 16:49:56.126', '2026-04-15 16:49:55.984', 1, 0, '2026-04-08 16:49:56.177', 0, '2026-04-08 16:49:56.177', 0, 0);
INSERT INTO `auth_token_session` VALUES (27, 'SES-4be5b341b5ae4664', 1001002, '2a07a08c3dda41369d63e122d4f8fcc1', '677bb0d6da334bdba18577b648872bf7', 1, 'codex-admin-check', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 16:49:56.126', '2026-04-15 16:49:55.985', 1, 0, '2026-04-08 16:49:56.177', 0, '2026-04-08 16:49:56.177', 0, 0);
INSERT INTO `auth_token_session` VALUES (28, 'SES-66d7a854470a45b8', 1001002, '54d4bf7995174093990301abe56d50c1', 'd42ce74af98e458681e1161360312571', 1, 'codex-admin-check', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 18:42:13.373', '2026-04-15 18:42:13.258', 1, 0, '2026-04-08 18:42:13.592', 0, '2026-04-08 18:42:13.592', 0, 0);
INSERT INTO `auth_token_session` VALUES (29, 'SES-8b9c7fafbf2a4f23', 1001002, 'f61d2e6fa7414153a4c4198a3b19d604', '767201666cd24e00a7455c6fba574c76', 1, 'codex-admin-check', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 18:46:41.502', '2026-04-15 18:46:41.392', 1, 0, '2026-04-08 18:46:41.728', 0, '2026-04-08 18:46:41.728', 0, 0);
INSERT INTO `auth_token_session` VALUES (30, 'SES-596180e65eeb41db', 1001002, '651f2f7574cb4444b73792e0c4addfd5', '7f209e9f2da640a0acc041512f5b2539', 1, 'codex-admin-check', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 18:48:40.333', '2026-04-15 18:48:40.222', 1, 0, '2026-04-08 18:48:40.564', 0, '2026-04-08 18:48:40.564', 0, 0);
INSERT INTO `auth_token_session` VALUES (31, 'SES-59a12ed5ec12459b', 1001002, '8aecbef8eda1434aaeba923d17753ab7', '9a574d423d984f1f95b3ad0a12a850be', 1, 'codex-admin-check', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 18:50:34.298', '2026-04-15 18:50:34.198', 1, 0, '2026-04-08 18:50:34.527', 0, '2026-04-08 18:50:34.527', 0, 0);
INSERT INTO `auth_token_session` VALUES (32, 'SES-a6bf0696b6804704', 1001002, '85929f30e64a4de4bedf0796b65d7889', '9ebf52b6caae40028a7a2217781bc775', 1, 'mall-web-browser', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-08 19:39:26.958', '2026-04-15 19:39:26.875', 3, 0, '2026-04-08 19:39:26.660', 0, '2026-04-08 19:39:51.870', 0, 0);
INSERT INTO `auth_token_session` VALUES (33, 'SES-00677b06bd4e4cba', 1001001, 'e85ce1b2e02f466faf608992bf73c052', 'a44201f8aeaf4fc5a6c4a6dbcf39852a', 1, 'mall-web-browser', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-08 19:40:02.828', '2026-04-15 19:40:02.827', 3, 0, '2026-04-08 19:40:02.522', 0, '2026-04-08 19:41:02.576', 0, 0);
INSERT INTO `auth_token_session` VALUES (34, 'SES-57cc0eba6f844ec6', 1001002, '62601eccca6a40dd9e5659c9c17afae9', 'a7c006b56a35483cafa3345116c2456a', 1, 'mall-web-browser', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-08 19:41:05.469', '2026-04-15 19:41:05.468', 1, 0, '2026-04-08 19:41:05.159', 0, '2026-04-08 19:41:05.159', 0, 0);
INSERT INTO `auth_token_session` VALUES (35, 'SES-e4d41d043cb742c8', 1001002, '35dab1df332c460bb131ee597616541e', '7f5686a0e4da40478a8d9bbe5cc6bad7', 1, 'codex-check', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 20:36:19.332', '2026-04-15 20:36:19.234', 1, 0, '2026-04-08 20:36:19.148', 0, '2026-04-08 20:36:19.148', 0, 0);
INSERT INTO `auth_token_session` VALUES (36, 'SES-06db9aa8b64b4207', 1001002, 'cb738e0b0b154b22b3a65dc81b96749c', 'dcd879a53b544dfbabdf94a9acd7450b', 1, 'codex-check', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 20:36:38.992', '2026-04-15 20:36:38.991', 1, 0, '2026-04-08 20:36:38.802', 0, '2026-04-08 20:36:38.802', 0, 0);
INSERT INTO `auth_token_session` VALUES (37, 'SES-c06cf222d94f4f18', 1001002, 'da5321297a4f4cddb3a4dd9e64e4a80c', '05453b4f81674f9f870173e2b8a2f2dc', 1, 'codex-check', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 20:36:54.663', '2026-04-15 20:36:54.662', 1, 0, '2026-04-08 20:36:54.473', 0, '2026-04-08 20:36:54.473', 0, 0);
INSERT INTO `auth_token_session` VALUES (38, 'SES-b5531830108c485a', 1001002, 'f11266f141de45ae8702405edf058074', '7a1e1e2615ae4582bbdc5712d0f827c0', 1, 'seed-check', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 21:10:18.633', '2026-04-15 21:10:18.542', 1, 0, '2026-04-08 21:10:18.510', 0, '2026-04-08 21:10:18.510', 0, 0);
INSERT INTO `auth_token_session` VALUES (39, 'SES-dcebd9eb044f46f3', 1001002, '8d30fe30f95742c5b54c83096e9f3f53', 'ce4efc62ac144d028f6e0d42a22972b8', 1, 'seed-check', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 21:10:34.510', '2026-04-15 21:10:34.509', 1, 0, '2026-04-08 21:10:34.379', 0, '2026-04-08 21:10:34.379', 0, 0);
INSERT INTO `auth_token_session` VALUES (40, 'SES-6abaa035ab044198', 1001001, '1eaf5c5c6d424fb08984f993f97c42ff', '039ccb592ddb4a8880d609d8c8cbf13a', 1, 'seed-check', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 21:10:48.083', '2026-04-15 21:10:48.082', 1, 0, '2026-04-08 21:10:47.954', 0, '2026-04-08 21:10:47.954', 0, 0);
INSERT INTO `auth_token_session` VALUES (41, 'SES-8d90ab379d164805', 1001001, '713cbab2101b4b75a385ed1ee772f019', 'b131864fb1f64e0c899f80bd10cf1c90', 1, 'mall-web-browser', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-08 21:18:25.295', '2026-04-15 21:18:25.219', 3, 0, '2026-04-08 21:18:25.178', 0, '2026-04-08 22:06:19.704', 0, 0);
INSERT INTO `auth_token_session` VALUES (42, 'SES-8aad472ed6934d87', 1001002, '08e2db4be38147a791951e5745ad846a', '7566456d746c4a5383e57346f93dbef9', 1, 'mall-web-browser', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-08 22:06:23.102', '2026-04-15 22:06:23.086', 3, 0, '2026-04-08 22:06:23.045', 0, '2026-04-08 22:21:05.450', 0, 0);
INSERT INTO `auth_token_session` VALUES (43, 'SES-d5d1c1f1e47948a0', 1001001, '00adab94abc14500b359c027f81d7fce', 'c7a68267240f40ea81675376c4dc98e2', 1, 'mall-web-browser', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-09 16:38:44.350', '2026-04-16 16:38:44.339', 3, 0, '2026-04-08 22:21:48.779', 0, '2026-04-09 17:29:15.558', 0, 0);
INSERT INTO `auth_token_session` VALUES (44, 'SES-d902c68667d74b80', 1001001, '094cc1599f8a4b18bedc6502b3066524', '3d664912319149b08a16e13c1b8ef1d2', 1, 'codex-check', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 22:46:43.873', '2026-04-15 22:46:43.791', 1, 0, '2026-04-08 22:46:43.850', 0, '2026-04-08 22:46:43.850', 0, 0);
INSERT INTO `auth_token_session` VALUES (45, 'SES-849676269e5e4759', 1001001, 'a2562abc5cb447f7ad488288befff478', '03baa92be0414d10a3e31a9764f62e49', 1, 'codex-check', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 22:46:59.660', '2026-04-15 22:46:59.659', 1, 0, '2026-04-08 22:46:59.632', 0, '2026-04-08 22:46:59.632', 0, 0);
INSERT INTO `auth_token_session` VALUES (46, 'SES-746d6873042048d9', 1001001, '685c1f077bb04df7aaf3cfe76d97325a', '61e64545c53743aa8cc39791386edf9b', 1, 'codex-check', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 22:47:11.952', '2026-04-15 22:47:11.952', 1, 0, '2026-04-08 22:47:11.924', 0, '2026-04-08 22:47:11.924', 0, 0);
INSERT INTO `auth_token_session` VALUES (47, 'SES-081bd5f874104914', 1001001, '13b362f231de4dfbb7d9e23dd8ab5977', '801223b00b564bbd8fcd406295afa737', 1, 'codex-verify', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391', '2026-04-08 23:43:34.145', '2026-04-15 23:43:34.130', 1, 0, '2026-04-08 23:43:34.179', 0, '2026-04-08 23:43:34.179', 0, 0);
INSERT INTO `auth_token_session` VALUES (48, 'SES-d090abeb0b874fc4', 1001002, 'd0ed878a4af3442d82a78887ab7c6291', '748a7823a85540acb01acdfb54b2b9ad', 1, 'mall-web-browser', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-09 17:29:21.976', '2026-04-16 17:29:21.948', 3, 0, '2026-04-09 17:29:20.851', 0, '2026-04-09 17:30:06.193', 0, 0);
INSERT INTO `auth_token_session` VALUES (49, 'SES-441ac317b07e44f1', 1001002, 'a94a813b38eb43b0a0e21515c005a13e', '3b975e9276be453a8f3ea0dc6e292e10', 1, 'mall-web-browser', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-09 17:30:11.383', '2026-04-16 17:30:11.382', 1, 0, '2026-04-09 17:30:10.248', 0, '2026-04-09 17:30:10.248', 0, 0);
INSERT INTO `auth_token_session` VALUES (50, 'SES-68453b35466a491e', 1001001, 'bc9139bdff8c42488ec5ae532264a257', '70d7a59c8eb2441384ddc3a8721adc99', 1, 'mall-web-browser', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-15 15:56:10.279', '2026-04-22 15:56:10.211', 3, 0, '2026-04-15 15:56:09.194', 0, '2026-04-15 15:56:46.178', 0, 0);
INSERT INTO `auth_token_session` VALUES (51, 'SES-eb9b7fe727d54144', 1001002, '6bfdc0d8d5fd47ddad0342b227b3ba71', '8ee8fd312fc049d6a8e3989124641db3', 1, 'mall-web-browser', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-15 15:56:54.646', '2026-04-22 15:56:54.645', 3, 0, '2026-04-15 15:56:53.555', 0, '2026-04-15 16:15:37.304', 0, 0);
INSERT INTO `auth_token_session` VALUES (52, 'SES-af3e0340ced24c37', 1001002, 'a70c75e638894a5e85302b9a93f5ff9b', '04f53b6a4969434fb618b0e09c0428b4', 1, 'mall-web-browser', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-15 16:15:43.374', '2026-04-22 16:15:43.372', 1, 0, '2026-04-15 16:15:42.299', 0, '2026-04-15 16:15:42.299', 0, 0);

-- ----------------------------
-- Table structure for auth_verify_code
-- ----------------------------
DROP TABLE IF EXISTS `auth_verify_code`;
CREATE TABLE `auth_verify_code`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `biz_no` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `scene` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mobile` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code_hash` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `send_channel` tinyint NOT NULL DEFAULT 1,
  `request_ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `expire_time` datetime(3) NOT NULL,
  `verified_time` datetime(3) NULL DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT 1,
  `created_by` bigint UNSIGNED NOT NULL DEFAULT 0,
  `created_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_by` bigint UNSIGNED NOT NULL DEFAULT 0,
  `updated_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted` tinyint NOT NULL DEFAULT 0,
  `version` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_auth_verify_code_biz_no`(`biz_no` ASC) USING BTREE,
  INDEX `idx_auth_verify_code_mobile_scene`(`mobile` ASC, `scene` ASC) USING BTREE,
  INDEX `idx_auth_verify_code_expire_time`(`expire_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of auth_verify_code
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
