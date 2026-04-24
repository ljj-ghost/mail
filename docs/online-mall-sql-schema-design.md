# 基于微服务架构的在线商城 SQL 表结构设计文档

## 1. 文档说明

- 文档名称：在线商城微服务数据库详细设计文档
- 适用阶段：一期核心交易链路 + 二期支撑能力扩展
- 数据库类型：MySQL 8.0
- 字符集：`utf8mb4`
- 排序规则：`utf8mb4_unicode_ci`
- 设计原则：按服务分库、按领域拆表、逻辑关联优先于物理外键、读写性能优先

## 2. 总体设计规范

### 2.1 分库清单

| 服务 | 数据库 |
| --- | --- |
| auth-service | `mall_auth` |
| user-service | `mall_user` |
| product-service | `mall_product` |
| inventory-service | `mall_inventory` |
| search-service | `mall_search` |
| cart-service | `mall_cart` |
| promotion-service | `mall_promotion` |
| order-service | `mall_order` |
| payment-service | `mall_payment` |
| logistics-service | `mall_logistics` |
| review-service | `mall_review` |
| content-service | `mall_content` |
| notification-service | `mall_notification` |
| file-service | `mall_file` |
| admin-service | `mall_admin` |
| report-service | `mall_report` |

### 2.2 建库语句

```sql
CREATE DATABASE IF NOT EXISTS mall_auth DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mall_user DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mall_product DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mall_inventory DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mall_search DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mall_cart DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mall_promotion DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mall_order DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mall_payment DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mall_logistics DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mall_review DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mall_content DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mall_notification DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mall_file DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mall_admin DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mall_report DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.3 命名规范

- 数据库名：`mall_业务域`
- 表名：`业务域_实体名`
- 主键：统一使用 `id`
- 业务单号：使用 `xxx_no`，如 `order_no`、`payment_no`
- 状态字段：统一使用 `status` 或 `xxx_status`
- 金额字段：统一使用 `DECIMAL(12,2)`，报表汇总可用 `DECIMAL(18,2)`
- 时间字段：统一使用 `DATETIME(3)`
- JSON 扩展字段：统一使用 `xxx_json`

### 2.4 通用字段模板

除纯关系中间表外，核心业务表建议统一包含以下字段：

```sql
`created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
`created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
`updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
`updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
`deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除:0否1是',
`version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号'
```

### 2.5 设计约束

- 微服务之间不使用物理外键，避免跨表锁和部署耦合
- 唯一性由唯一索引保障
- 高频查询必须显式设计二级索引
- 大表优先按时间维度预留归档或分表能力
- 枚举值在代码中维护，数据库字段保存数值

## 3. 一期核心服务详细 SQL 设计

## 3.1 auth-service

数据库：`mall_auth`

核心表：

- `auth_account`：认证账号表
- `auth_token_session`：登录会话表
- `auth_verify_code`：验证码记录表
- `auth_login_log`：登录日志表

### 3.1.1 `auth_account`

```sql
CREATE TABLE `auth_account` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `login_type` TINYINT NOT NULL COMMENT '登录类型:1密码2短信3微信4Apple',
  `login_name` VARCHAR(128) NOT NULL COMMENT '登录名',
  `password_hash` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '密码摘要',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1正常2冻结3注销',
  `fail_count` INT NOT NULL DEFAULT 0 COMMENT '连续失败次数',
  `last_login_time` DATETIME(3) DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '最后登录IP',
  `pwd_modified_time` DATETIME(3) DEFAULT NULL COMMENT '密码修改时间',
  `remark` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '备注',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_login_type_name` (`login_type`,`login_name`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status_login_time` (`status`,`last_login_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='认证账号表';
```

### 3.1.2 `auth_token_session`

```sql
CREATE TABLE `auth_token_session` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `session_no` VARCHAR(64) NOT NULL COMMENT '会话编号',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `access_jti` VARCHAR(64) NOT NULL COMMENT '访问令牌JTI',
  `refresh_jti` VARCHAR(64) NOT NULL COMMENT '刷新令牌JTI',
  `device_type` TINYINT NOT NULL DEFAULT 1 COMMENT '设备类型:1Web2H53App4MiniProgram',
  `device_id` VARCHAR(128) NOT NULL DEFAULT '' COMMENT '设备标识',
  `client_ip` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '登录IP',
  `user_agent` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '客户端标识',
  `last_active_time` DATETIME(3) NOT NULL COMMENT '最后活跃时间',
  `expire_time` DATETIME(3) NOT NULL COMMENT '会话过期时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1有效2失效3登出',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_session_no` (`session_no`),
  UNIQUE KEY `uk_access_jti` (`access_jti`),
  UNIQUE KEY `uk_refresh_jti` (`refresh_jti`),
  KEY `idx_user_status` (`user_id`,`status`),
  KEY `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录会话表';
```

### 3.1.3 `auth_verify_code`

```sql
CREATE TABLE `auth_verify_code` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `biz_no` VARCHAR(64) NOT NULL COMMENT '业务流水号',
  `scene` VARCHAR(64) NOT NULL COMMENT '场景:login register reset_pwd',
  `mobile` VARCHAR(32) NOT NULL COMMENT '手机号',
  `code_hash` VARCHAR(128) NOT NULL COMMENT '验证码摘要',
  `send_channel` TINYINT NOT NULL DEFAULT 1 COMMENT '发送渠道:1短信2邮件',
  `request_ip` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '请求IP',
  `expire_time` DATETIME(3) NOT NULL COMMENT '过期时间',
  `verified_time` DATETIME(3) DEFAULT NULL COMMENT '核销时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1待验证2已验证3已过期4已作废',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_biz_no` (`biz_no`),
  KEY `idx_mobile_scene` (`mobile`,`scene`),
  KEY `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='验证码记录表';
```

### 3.1.4 `auth_login_log`

```sql
CREATE TABLE `auth_login_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户ID',
  `login_type` TINYINT NOT NULL COMMENT '登录类型',
  `login_name` VARCHAR(128) NOT NULL DEFAULT '' COMMENT '登录名',
  `device_type` TINYINT NOT NULL DEFAULT 1 COMMENT '设备类型',
  `client_ip` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '客户端IP',
  `user_agent` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '客户端标识',
  `login_result` TINYINT NOT NULL COMMENT '结果:1成功2失败',
  `fail_reason` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '失败原因',
  `trace_id` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '链路追踪ID',
  `login_time` DATETIME(3) NOT NULL COMMENT '登录时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_time` (`user_id`,`login_time`),
  KEY `idx_login_name_time` (`login_name`,`login_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';
```

## 3.2 user-service

数据库：`mall_user`

核心表：

- `user_info`
- `user_address`
- `user_level`
- `user_growth_log`

### 3.2.1 `user_info`

```sql
CREATE TABLE `user_info` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_no` VARCHAR(32) NOT NULL COMMENT '用户编号',
  `nickname` VARCHAR(64) NOT NULL COMMENT '昵称',
  `mobile` VARCHAR(32) NOT NULL DEFAULT '' COMMENT '手机号',
  `email` VARCHAR(128) NOT NULL DEFAULT '' COMMENT '邮箱',
  `avatar` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '头像',
  `gender` TINYINT NOT NULL DEFAULT 0 COMMENT '性别:0未知1男2女',
  `birthday` DATE DEFAULT NULL COMMENT '生日',
  `level_id` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '会员等级ID',
  `growth_value` INT NOT NULL DEFAULT 0 COMMENT '成长值',
  `point_balance` INT NOT NULL DEFAULT 0 COMMENT '积分余额',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1正常2冻结3注销中4已注销',
  `register_source` TINYINT NOT NULL DEFAULT 1 COMMENT '注册来源',
  `register_time` DATETIME(3) NOT NULL COMMENT '注册时间',
  `last_active_time` DATETIME(3) DEFAULT NULL COMMENT '最后活跃时间',
  `remark` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '备注',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_no` (`user_no`),
  UNIQUE KEY `uk_mobile` (`mobile`),
  KEY `idx_level_status` (`level_id`,`status`),
  KEY `idx_register_time` (`register_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户主表';
```

### 3.2.2 `user_address`

```sql
CREATE TABLE `user_address` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `consignee_name` VARCHAR(64) NOT NULL COMMENT '收货人',
  `consignee_mobile` VARCHAR(32) NOT NULL COMMENT '收货手机号',
  `province_code` VARCHAR(16) NOT NULL DEFAULT '' COMMENT '省编码',
  `province_name` VARCHAR(32) NOT NULL DEFAULT '' COMMENT '省名称',
  `city_code` VARCHAR(16) NOT NULL DEFAULT '' COMMENT '市编码',
  `city_name` VARCHAR(32) NOT NULL DEFAULT '' COMMENT '市名称',
  `district_code` VARCHAR(16) NOT NULL DEFAULT '' COMMENT '区编码',
  `district_name` VARCHAR(32) NOT NULL DEFAULT '' COMMENT '区名称',
  `street_code` VARCHAR(16) NOT NULL DEFAULT '' COMMENT '街道编码',
  `street_name` VARCHAR(32) NOT NULL DEFAULT '' COMMENT '街道名称',
  `detail_address` VARCHAR(255) NOT NULL COMMENT '详细地址',
  `postal_code` VARCHAR(16) NOT NULL DEFAULT '' COMMENT '邮编',
  `tag_name` VARCHAR(32) NOT NULL DEFAULT '' COMMENT '标签:家/公司',
  `is_default` TINYINT NOT NULL DEFAULT 0 COMMENT '是否默认地址',
  `longitude` DECIMAL(12,6) NOT NULL DEFAULT 0.000000 COMMENT '经度',
  `latitude` DECIMAL(12,6) NOT NULL DEFAULT 0.000000 COMMENT '纬度',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1有效2失效',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_default` (`user_id`,`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收货地址表';
```

### 3.2.3 `user_level`

```sql
CREATE TABLE `user_level` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `level_code` VARCHAR(32) NOT NULL COMMENT '等级编码',
  `level_name` VARCHAR(64) NOT NULL COMMENT '等级名称',
  `min_growth` INT NOT NULL DEFAULT 0 COMMENT '最低成长值',
  `icon_url` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '等级图标',
  `discount_rate` DECIMAL(5,2) NOT NULL DEFAULT 100.00 COMMENT '折扣率，如95.00表示95折',
  `free_shipping` TINYINT NOT NULL DEFAULT 0 COMMENT '是否免邮',
  `priority` INT NOT NULL DEFAULT 0 COMMENT '优先级，越大越高',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1启用2停用',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_level_code` (`level_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员等级表';
```

### 3.2.4 `user_growth_log`

```sql
CREATE TABLE `user_growth_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `change_type` TINYINT NOT NULL COMMENT '变更类型:1下单2评价3活动4后台调整',
  `change_value` INT NOT NULL COMMENT '变更值，可正可负',
  `biz_no` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '业务单号',
  `biz_scene` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '业务场景',
  `after_growth` INT NOT NULL DEFAULT 0 COMMENT '变更后成长值',
  `remark` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '备注',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_time` (`user_id`,`created_time`),
  KEY `idx_biz_no` (`biz_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成长值流水表';
```

## 3.3 product-service

数据库：`mall_product`

核心表：

- `product_category`
- `product_brand`
- `product_attr`
- `product_spu`
- `product_spu_detail`
- `product_sku`

### 3.3.1 `product_category`

```sql
CREATE TABLE `product_category` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `parent_id` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '父级ID',
  `category_name` VARCHAR(64) NOT NULL COMMENT '类目名称',
  `category_level` TINYINT NOT NULL COMMENT '层级',
  `category_path` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '路径，如1/12/120',
  `icon_url` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '图标',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `is_leaf` TINYINT NOT NULL DEFAULT 1 COMMENT '是否叶子节点',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1启用2停用',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  KEY `idx_parent_sort` (`parent_id`,`sort`),
  KEY `idx_path` (`category_path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品类目表';
```

### 3.3.2 `product_brand`

```sql
CREATE TABLE `product_brand` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `brand_no` VARCHAR(32) NOT NULL COMMENT '品牌编号',
  `brand_name` VARCHAR(64) NOT NULL COMMENT '品牌名称',
  `logo_url` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '品牌Logo',
  `first_letter` CHAR(1) NOT NULL DEFAULT '' COMMENT '首字母',
  `description` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '品牌描述',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_brand_no` (`brand_no`),
  UNIQUE KEY `uk_brand_name` (`brand_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='品牌表';
```

### 3.3.3 `product_attr`

```sql
CREATE TABLE `product_attr` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '类目ID',
  `attr_name` VARCHAR(64) NOT NULL COMMENT '属性名称',
  `attr_code` VARCHAR(64) NOT NULL COMMENT '属性编码',
  `attr_type` TINYINT NOT NULL COMMENT '属性类型:1销售属性2基础属性',
  `input_type` TINYINT NOT NULL DEFAULT 1 COMMENT '录入类型:1手输2单选3多选',
  `is_required` TINYINT NOT NULL DEFAULT 0 COMMENT '是否必填',
  `is_searchable` TINYINT NOT NULL DEFAULT 0 COMMENT '是否可搜索',
  `attr_values_json` JSON DEFAULT NULL COMMENT '可选值列表',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_attr_code` (`category_id`,`attr_code`),
  KEY `idx_category_type` (`category_id`,`attr_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品属性表';
```

### 3.3.4 `product_spu`

```sql
CREATE TABLE `product_spu` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `spu_no` VARCHAR(32) NOT NULL COMMENT 'SPU编号',
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '类目ID',
  `brand_id` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '品牌ID',
  `title` VARCHAR(255) NOT NULL COMMENT '商品标题',
  `sub_title` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '副标题',
  `main_image` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '主图',
  `album_images_json` JSON DEFAULT NULL COMMENT '图集',
  `sale_status` TINYINT NOT NULL DEFAULT 1 COMMENT '销售状态:1草稿2待审核3已上架4已下架',
  `audit_status` TINYINT NOT NULL DEFAULT 0 COMMENT '审核状态:0未提审1待审2通过3拒绝',
  `audit_remark` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '审核备注',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `publish_time` DATETIME(3) DEFAULT NULL COMMENT '上架时间',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_spu_no` (`spu_no`),
  KEY `idx_category_brand` (`category_id`,`brand_id`),
  KEY `idx_sale_status` (`sale_status`,`publish_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SPU主表';
```

### 3.3.5 `product_spu_detail`

```sql
CREATE TABLE `product_spu_detail` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `spu_id` BIGINT UNSIGNED NOT NULL COMMENT 'SPUID',
  `detail_pc` LONGTEXT COMMENT 'PC详情HTML',
  `detail_mobile` LONGTEXT COMMENT '移动端详情HTML',
  `service_note` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '服务说明',
  `packing_list` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '包装清单',
  `after_sale_note` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '售后说明',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_spu_id` (`spu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SPU详情表';
```

### 3.3.6 `product_sku`

```sql
CREATE TABLE `product_sku` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `sku_no` VARCHAR(32) NOT NULL COMMENT 'SKU编号',
  `spu_id` BIGINT UNSIGNED NOT NULL COMMENT 'SPUID',
  `sku_name` VARCHAR(255) NOT NULL COMMENT 'SKU名称',
  `sku_specs_json` JSON DEFAULT NULL COMMENT '销售属性快照',
  `bar_code` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '条码',
  `main_image` VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'SKU主图',
  `sale_price` DECIMAL(12,2) NOT NULL COMMENT '销售价',
  `market_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '市场价',
  `cost_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '成本价',
  `weight` DECIMAL(10,3) NOT NULL DEFAULT 0.000 COMMENT '重量kg',
  `volume` DECIMAL(10,3) NOT NULL DEFAULT 0.000 COMMENT '体积',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1启用2停用',
  `sale_count` INT NOT NULL DEFAULT 0 COMMENT '销量',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sku_no` (`sku_no`),
  KEY `idx_spu_id` (`spu_id`),
  KEY `idx_sale_price` (`sale_price`),
  KEY `idx_status_sale_count` (`status`,`sale_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SKU表';
```

## 3.4 inventory-service

数据库：`mall_inventory`

核心表：

- `inventory_warehouse`
- `inventory_stock`
- `inventory_reservation`
- `inventory_record`

### 3.4.1 `inventory_warehouse`

```sql
CREATE TABLE `inventory_warehouse` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `warehouse_code` VARCHAR(32) NOT NULL COMMENT '仓库编码',
  `warehouse_name` VARCHAR(64) NOT NULL COMMENT '仓库名称',
  `contact_name` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '联系人',
  `contact_mobile` VARCHAR(32) NOT NULL DEFAULT '' COMMENT '联系电话',
  `province_code` VARCHAR(16) NOT NULL DEFAULT '' COMMENT '省编码',
  `city_code` VARCHAR(16) NOT NULL DEFAULT '' COMMENT '市编码',
  `district_code` VARCHAR(16) NOT NULL DEFAULT '' COMMENT '区编码',
  `detail_address` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '详细地址',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_warehouse_code` (`warehouse_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='仓库表';
```

### 3.4.2 `inventory_stock`

```sql
CREATE TABLE `inventory_stock` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `sku_id` BIGINT UNSIGNED NOT NULL COMMENT 'SKU ID',
  `warehouse_id` BIGINT UNSIGNED NOT NULL COMMENT '仓库ID',
  `available_qty` INT NOT NULL DEFAULT 0 COMMENT '可用库存',
  `locked_qty` INT NOT NULL DEFAULT 0 COMMENT '锁定库存',
  `saleable_qty` INT NOT NULL DEFAULT 0 COMMENT '可售库存',
  `warning_qty` INT NOT NULL DEFAULT 0 COMMENT '预警库存',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sku_warehouse` (`sku_id`,`warehouse_id`),
  KEY `idx_warning` (`warning_qty`,`saleable_qty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存表';
```

### 3.4.3 `inventory_reservation`

```sql
CREATE TABLE `inventory_reservation` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `reserve_no` VARCHAR(64) NOT NULL COMMENT '预占单号',
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
  `sku_id` BIGINT UNSIGNED NOT NULL COMMENT 'SKU ID',
  `warehouse_id` BIGINT UNSIGNED NOT NULL COMMENT '仓库ID',
  `reserve_qty` INT NOT NULL COMMENT '预占数量',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1已预占2已释放3已扣减',
  `expire_time` DATETIME(3) NOT NULL COMMENT '过期时间',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reserve_no` (`reserve_no`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_expire_time_status` (`expire_time`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存预占表';
```

### 3.4.4 `inventory_record`

```sql
CREATE TABLE `inventory_record` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `biz_type` VARCHAR(32) NOT NULL COMMENT '业务类型:reserve release deduct adjust',
  `biz_no` VARCHAR(64) NOT NULL COMMENT '业务单号',
  `sku_id` BIGINT UNSIGNED NOT NULL COMMENT 'SKU ID',
  `warehouse_id` BIGINT UNSIGNED NOT NULL COMMENT '仓库ID',
  `change_qty` INT NOT NULL COMMENT '变更数量',
  `before_qty` INT NOT NULL COMMENT '变更前可售库存',
  `after_qty` INT NOT NULL COMMENT '变更后可售库存',
  `remark` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '备注',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_biz_no` (`biz_no`),
  KEY `idx_sku_time` (`sku_id`,`created_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存流水表';
```

## 3.5 cart-service

数据库：`mall_cart`

核心表：

- `cart_item`
- `cart_settlement_snapshot`

### 3.5.1 `cart_item`

```sql
CREATE TABLE `cart_item` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `sku_id` BIGINT UNSIGNED NOT NULL COMMENT 'SKU ID',
  `spu_id` BIGINT UNSIGNED NOT NULL COMMENT 'SPU ID',
  `sku_name` VARCHAR(255) NOT NULL COMMENT 'SKU名称快照',
  `sku_image` VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'SKU图片快照',
  `sale_price_snapshot` DECIMAL(12,2) NOT NULL COMMENT '价格快照',
  `quantity` INT NOT NULL DEFAULT 1 COMMENT '购买数量',
  `checked` TINYINT NOT NULL DEFAULT 1 COMMENT '是否选中',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1有效2失效3下架',
  `source_type` TINYINT NOT NULL DEFAULT 1 COMMENT '来源:1普通2秒杀3活动',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_sku` (`user_id`,`sku_id`),
  KEY `idx_user_checked` (`user_id`,`checked`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车条目表';
```

### 3.5.2 `cart_settlement_snapshot`

```sql
CREATE TABLE `cart_settlement_snapshot` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `settlement_token` VARCHAR(64) NOT NULL COMMENT '结算令牌',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `item_snapshot_json` JSON NOT NULL COMMENT '结算商品快照',
  `amount_snapshot_json` JSON NOT NULL COMMENT '金额快照',
  `expire_time` DATETIME(3) NOT NULL COMMENT '过期时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1有效2已提交3已失效',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_settlement_token` (`settlement_token`),
  KEY `idx_user_status` (`user_id`,`status`),
  KEY `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='结算快照表';
```

## 3.6 promotion-service

数据库：`mall_promotion`

核心表：

- `promotion_activity`
- `coupon_template`
- `coupon_user`
- `flash_sale_activity`
- `flash_sale_sku`

### 3.6.1 `promotion_activity`

```sql
CREATE TABLE `promotion_activity` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `activity_no` VARCHAR(32) NOT NULL COMMENT '活动编号',
  `activity_type` TINYINT NOT NULL COMMENT '类型:1满减2满折3单品折扣4会员价',
  `activity_name` VARCHAR(128) NOT NULL COMMENT '活动名称',
  `start_time` DATETIME(3) NOT NULL COMMENT '开始时间',
  `end_time` DATETIME(3) NOT NULL COMMENT '结束时间',
  `priority` INT NOT NULL DEFAULT 0 COMMENT '优先级',
  `stackable` TINYINT NOT NULL DEFAULT 0 COMMENT '是否可叠加',
  `rule_json` JSON NOT NULL COMMENT '规则JSON',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1待开始2进行中3已结束4停用',
  `remark` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '备注',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_activity_no` (`activity_no`),
  KEY `idx_type_status_time` (`activity_type`,`status`,`start_time`,`end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='营销活动表';
```

### 3.6.2 `coupon_template`

```sql
CREATE TABLE `coupon_template` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `template_no` VARCHAR(32) NOT NULL COMMENT '模板编号',
  `coupon_name` VARCHAR(128) NOT NULL COMMENT '优惠券名称',
  `coupon_type` TINYINT NOT NULL COMMENT '券类型:1满减券2折扣券3运费券',
  `threshold_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '门槛金额',
  `discount_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '优惠金额',
  `discount_rate` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '折扣率',
  `max_discount_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '最大优惠金额',
  `total_count` INT NOT NULL DEFAULT 0 COMMENT '发行总量',
  `issued_count` INT NOT NULL DEFAULT 0 COMMENT '已发行数量',
  `per_limit` INT NOT NULL DEFAULT 1 COMMENT '每人限领',
  `receive_start_time` DATETIME(3) NOT NULL COMMENT '领券开始时间',
  `receive_end_time` DATETIME(3) NOT NULL COMMENT '领券结束时间',
  `valid_type` TINYINT NOT NULL DEFAULT 1 COMMENT '有效期类型:1固定时间2领后N天',
  `valid_days` INT NOT NULL DEFAULT 0 COMMENT '领后有效天数',
  `valid_start_time` DATETIME(3) DEFAULT NULL COMMENT '固定有效期开始',
  `valid_end_time` DATETIME(3) DEFAULT NULL COMMENT '固定有效期结束',
  `scope_type` TINYINT NOT NULL DEFAULT 1 COMMENT '适用范围:1全场2类目3商品',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_template_no` (`template_no`),
  KEY `idx_receive_time` (`receive_start_time`,`receive_end_time`),
  KEY `idx_status_type` (`status`,`coupon_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券模板表';
```

### 3.6.3 `coupon_user`

```sql
CREATE TABLE `coupon_user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `template_id` BIGINT UNSIGNED NOT NULL COMMENT '模板ID',
  `coupon_code` VARCHAR(64) NOT NULL COMMENT '券码',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1未使用2已锁定3已使用4已过期5已作废',
  `source_type` TINYINT NOT NULL DEFAULT 1 COMMENT '来源:1主动领取2后台发放3活动赠送',
  `receive_time` DATETIME(3) NOT NULL COMMENT '领取时间',
  `lock_order_no` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '锁定订单号',
  `used_order_no` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '使用订单号',
  `used_time` DATETIME(3) DEFAULT NULL COMMENT '使用时间',
  `expire_time` DATETIME(3) NOT NULL COMMENT '过期时间',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_coupon_code` (`coupon_code`),
  KEY `idx_user_status` (`user_id`,`status`),
  KEY `idx_expire_time_status` (`expire_time`,`status`),
  KEY `idx_lock_order_no` (`lock_order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户优惠券表';
```

### 3.6.4 `flash_sale_activity`

```sql
CREATE TABLE `flash_sale_activity` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `session_no` VARCHAR(32) NOT NULL COMMENT '场次编号',
  `activity_name` VARCHAR(128) NOT NULL COMMENT '秒杀活动名称',
  `start_time` DATETIME(3) NOT NULL COMMENT '开始时间',
  `end_time` DATETIME(3) NOT NULL COMMENT '结束时间',
  `limit_per_user` INT NOT NULL DEFAULT 1 COMMENT '每人限购',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_session_no` (`session_no`),
  KEY `idx_start_end` (`start_time`,`end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='秒杀活动表';
```

### 3.6.5 `flash_sale_sku`

```sql
CREATE TABLE `flash_sale_sku` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `activity_id` BIGINT UNSIGNED NOT NULL COMMENT '秒杀活动ID',
  `sku_id` BIGINT UNSIGNED NOT NULL COMMENT 'SKU ID',
  `flash_price` DECIMAL(12,2) NOT NULL COMMENT '秒杀价',
  `stock_quota` INT NOT NULL DEFAULT 0 COMMENT '活动库存',
  `sold_quota` INT NOT NULL DEFAULT 0 COMMENT '已售数量',
  `limit_per_user` INT NOT NULL DEFAULT 1 COMMENT '单人限购',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_activity_sku` (`activity_id`,`sku_id`),
  KEY `idx_status_sort` (`status`,`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='秒杀商品表';
```

## 3.7 order-service

数据库：`mall_order`

核心表：

- `order_info`
- `order_item`
- `order_address`
- `order_operate_log`
- `order_after_sale`

### 3.7.1 `order_info`

```sql
CREATE TABLE `order_info` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `order_type` TINYINT NOT NULL DEFAULT 1 COMMENT '订单类型:1普通2秒杀3活动',
  `order_status` TINYINT NOT NULL COMMENT '订单状态',
  `pay_status` TINYINT NOT NULL DEFAULT 0 COMMENT '支付状态',
  `delivery_status` TINYINT NOT NULL DEFAULT 0 COMMENT '履约状态',
  `after_sale_status` TINYINT NOT NULL DEFAULT 0 COMMENT '售后状态',
  `product_amount` DECIMAL(12,2) NOT NULL COMMENT '商品总额',
  `discount_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '优惠总额',
  `coupon_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '优惠券金额',
  `promotion_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '活动优惠金额',
  `freight_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '运费',
  `pay_amount` DECIMAL(12,2) NOT NULL COMMENT '实付金额',
  `pay_channel` TINYINT NOT NULL DEFAULT 0 COMMENT '支付渠道',
  `source_type` TINYINT NOT NULL DEFAULT 1 COMMENT '来源',
  `buyer_remark` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '买家备注',
  `settlement_token` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '结算令牌',
  `submit_ip` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '下单IP',
  `submit_time` DATETIME(3) NOT NULL COMMENT '提交时间',
  `pay_time` DATETIME(3) DEFAULT NULL COMMENT '支付时间',
  `cancel_time` DATETIME(3) DEFAULT NULL COMMENT '取消时间',
  `finish_time` DATETIME(3) DEFAULT NULL COMMENT '完成时间',
  `cancel_reason` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '取消原因',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_status_time` (`user_id`,`order_status`,`created_time`),
  KEY `idx_pay_status_time` (`pay_status`,`submit_time`),
  KEY `idx_submit_time` (`submit_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单主表';
```

### 3.7.2 `order_item`

```sql
CREATE TABLE `order_item` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `order_item_no` VARCHAR(64) NOT NULL COMMENT '订单项编号',
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
  `spu_id` BIGINT UNSIGNED NOT NULL COMMENT 'SPU ID',
  `sku_id` BIGINT UNSIGNED NOT NULL COMMENT 'SKU ID',
  `sku_name` VARCHAR(255) NOT NULL COMMENT 'SKU名称',
  `sku_image` VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'SKU图片',
  `sku_specs_json` JSON DEFAULT NULL COMMENT 'SKU规格快照',
  `buy_price` DECIMAL(12,2) NOT NULL COMMENT '成交单价',
  `market_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '市场价快照',
  `buy_quantity` INT NOT NULL COMMENT '购买数量',
  `item_amount` DECIMAL(12,2) NOT NULL COMMENT '订单项总额',
  `discount_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '分摊优惠金额',
  `pay_amount` DECIMAL(12,2) NOT NULL COMMENT '分摊实付金额',
  `comment_status` TINYINT NOT NULL DEFAULT 0 COMMENT '评价状态:0未评价1已评价',
  `after_sale_status` TINYINT NOT NULL DEFAULT 0 COMMENT '售后状态',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_item_no` (`order_item_no`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_sku_id` (`sku_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单项表';
```

### 3.7.3 `order_address`

```sql
CREATE TABLE `order_address` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
  `consignee_name` VARCHAR(64) NOT NULL COMMENT '收货人',
  `consignee_mobile` VARCHAR(32) NOT NULL COMMENT '收货手机号',
  `province_code` VARCHAR(16) NOT NULL DEFAULT '' COMMENT '省编码',
  `province_name` VARCHAR(32) NOT NULL DEFAULT '' COMMENT '省名称',
  `city_code` VARCHAR(16) NOT NULL DEFAULT '' COMMENT '市编码',
  `city_name` VARCHAR(32) NOT NULL DEFAULT '' COMMENT '市名称',
  `district_code` VARCHAR(16) NOT NULL DEFAULT '' COMMENT '区编码',
  `district_name` VARCHAR(32) NOT NULL DEFAULT '' COMMENT '区名称',
  `detail_address` VARCHAR(255) NOT NULL COMMENT '详细地址',
  `postal_code` VARCHAR(16) NOT NULL DEFAULT '' COMMENT '邮编',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单地址表';
```

### 3.7.4 `order_operate_log`

```sql
CREATE TABLE `order_operate_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
  `before_status` TINYINT NOT NULL DEFAULT 0 COMMENT '变更前状态',
  `after_status` TINYINT NOT NULL DEFAULT 0 COMMENT '变更后状态',
  `operate_type` VARCHAR(32) NOT NULL COMMENT '操作类型',
  `operator_id` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '操作人ID',
  `operator_name` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '操作人名称',
  `operator_role` VARCHAR(32) NOT NULL DEFAULT '' COMMENT '操作人角色',
  `operate_remark` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '备注',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_time` (`order_no`,`created_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单操作日志表';
```

### 3.7.5 `order_after_sale`

```sql
CREATE TABLE `order_after_sale` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `after_sale_no` VARCHAR(64) NOT NULL COMMENT '售后单号',
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
  `order_item_id` BIGINT UNSIGNED NOT NULL COMMENT '订单项ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `after_sale_type` TINYINT NOT NULL COMMENT '售后类型:1退款2退货退款3换货',
  `reason_code` VARCHAR(32) NOT NULL DEFAULT '' COMMENT '原因编码',
  `reason_desc` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '原因描述',
  `apply_amount` DECIMAL(12,2) NOT NULL COMMENT '申请金额',
  `approved_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '审批金额',
  `status` TINYINT NOT NULL COMMENT '售后状态',
  `refund_status` TINYINT NOT NULL DEFAULT 0 COMMENT '退款状态',
  `audit_remark` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '审核备注',
  `apply_time` DATETIME(3) NOT NULL COMMENT '申请时间',
  `audit_time` DATETIME(3) DEFAULT NULL COMMENT '审核时间',
  `refund_time` DATETIME(3) DEFAULT NULL COMMENT '退款时间',
  `close_time` DATETIME(3) DEFAULT NULL COMMENT '关闭时间',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_after_sale_no` (`after_sale_no`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_user_status` (`user_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='售后单表';
```

## 3.8 payment-service

数据库：`mall_payment`

核心表：

- `payment_order`
- `payment_notify_log`
- `refund_order`
- `payment_reconcile_bill`

### 3.8.1 `payment_order`

```sql
CREATE TABLE `payment_order` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `payment_no` VARCHAR(64) NOT NULL COMMENT '支付单号',
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `biz_type` TINYINT NOT NULL DEFAULT 1 COMMENT '业务类型:1订单支付2补差价',
  `pay_channel` TINYINT NOT NULL COMMENT '支付渠道',
  `pay_amount` DECIMAL(12,2) NOT NULL COMMENT '支付金额',
  `currency` VARCHAR(8) NOT NULL DEFAULT 'CNY' COMMENT '币种',
  `pay_subject` VARCHAR(128) NOT NULL DEFAULT '' COMMENT '支付标题',
  `pay_status` TINYINT NOT NULL DEFAULT 0 COMMENT '支付状态:0待支付1支付中2成功3失败4关闭',
  `third_trade_no` VARCHAR(128) NOT NULL DEFAULT '' COMMENT '第三方交易号',
  `expire_time` DATETIME(3) DEFAULT NULL COMMENT '过期时间',
  `success_time` DATETIME(3) DEFAULT NULL COMMENT '成功时间',
  `close_time` DATETIME(3) DEFAULT NULL COMMENT '关闭时间',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payment_no` (`payment_no`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_user_status` (`user_id`,`pay_status`),
  KEY `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付单表';
```

### 3.8.2 `payment_notify_log`

```sql
CREATE TABLE `payment_notify_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `payment_no` VARCHAR(64) NOT NULL COMMENT '支付单号',
  `notify_type` TINYINT NOT NULL COMMENT '通知类型:1支付成功2支付失败3退款成功4退款失败',
  `third_trade_no` VARCHAR(128) NOT NULL DEFAULT '' COMMENT '第三方交易号',
  `notify_content` JSON NOT NULL COMMENT '回调原文',
  `process_status` TINYINT NOT NULL DEFAULT 0 COMMENT '处理状态:0待处理1成功2失败',
  `process_msg` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '处理信息',
  `notify_time` DATETIME(3) NOT NULL COMMENT '通知时间',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_payment_no_time` (`payment_no`,`notify_time`),
  KEY `idx_process_status` (`process_status`,`notify_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付回调日志表';
```

### 3.8.3 `refund_order`

```sql
CREATE TABLE `refund_order` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `refund_no` VARCHAR(64) NOT NULL COMMENT '退款单号',
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
  `payment_no` VARCHAR(64) NOT NULL COMMENT '支付单号',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `refund_amount` DECIMAL(12,2) NOT NULL COMMENT '退款金额',
  `refund_reason` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '退款原因',
  `refund_status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态:0待退款1退款中2成功3失败',
  `third_refund_no` VARCHAR(128) NOT NULL DEFAULT '' COMMENT '第三方退款号',
  `success_time` DATETIME(3) DEFAULT NULL COMMENT '退款成功时间',
  `created_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_by` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_refund_no` (`refund_no`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_payment_no` (`payment_no`),
  KEY `idx_user_status` (`user_id`,`refund_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='退款单表';
```

### 3.8.4 `payment_reconcile_bill`

```sql
CREATE TABLE `payment_reconcile_bill` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `bill_date` DATE NOT NULL COMMENT '账单日期',
  `pay_channel` TINYINT NOT NULL COMMENT '支付渠道',
  `file_url` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '账单文件地址',
  `download_status` TINYINT NOT NULL DEFAULT 0 COMMENT '下载状态',
  `reconcile_status` TINYINT NOT NULL DEFAULT 0 COMMENT '对账状态',
  `diff_count` INT NOT NULL DEFAULT 0 COMMENT '差异笔数',
  `diff_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '差异金额',
  `handle_status` TINYINT NOT NULL DEFAULT 0 COMMENT '处理状态',
  `remark` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '备注',
  `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bill_date_channel` (`bill_date`,`pay_channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付对账单表';
```

## 4. 支撑服务表结构建议

这一部分不再展开全部 DDL，但已经细化到字段级别，可直接继续拆成执行 SQL。

## 4.1 search-service

数据库：`mall_search`

### 4.1.1 `search_hot_word`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| word | VARCHAR(64) | 热搜词 |
| source_type | TINYINT | 来源:运营/自动统计 |
| sort | INT | 排序 |
| status | TINYINT | 状态 |
| start_time | DATETIME(3) | 生效开始时间 |
| end_time | DATETIME(3) | 生效结束时间 |
| created_time | DATETIME(3) | 创建时间 |

索引建议：

- 唯一索引：`word`
- 普通索引：`status, sort`

### 4.1.2 `search_word_stat`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| stat_date | DATE | 统计日期 |
| keyword | VARCHAR(128) | 搜索词 |
| search_count | INT | 搜索次数 |
| click_count | INT | 点击次数 |
| order_count | INT | 下单次数 |
| pay_count | INT | 支付次数 |

索引建议：

- 唯一索引：`stat_date, keyword`

### 4.1.3 `search_index_task`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| biz_type | VARCHAR(32) | 业务类型 |
| biz_id | BIGINT UNSIGNED | 业务ID |
| action_type | TINYINT | 动作:新增/更新/删除 |
| retry_count | INT | 重试次数 |
| next_retry_time | DATETIME(3) | 下次重试时间 |
| status | TINYINT | 处理状态 |
| message | VARCHAR(255) | 处理消息 |

## 4.2 logistics-service

数据库：`mall_logistics`

### 4.2.1 `shipment_order`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| shipment_no | VARCHAR(64) | 发货单号 |
| order_no | VARCHAR(64) | 订单号 |
| warehouse_id | BIGINT UNSIGNED | 仓库ID |
| express_company_code | VARCHAR(32) | 快递公司编码 |
| express_no | VARCHAR(64) | 运单号 |
| shipment_status | TINYINT | 发货状态 |
| deliver_time | DATETIME(3) | 发货时间 |
| sign_time | DATETIME(3) | 签收时间 |

### 4.2.2 `shipment_item`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| shipment_no | VARCHAR(64) | 发货单号 |
| order_item_id | BIGINT UNSIGNED | 订单项ID |
| sku_id | BIGINT UNSIGNED | SKU ID |
| quantity | INT | 发货数量 |

### 4.2.3 `shipment_track`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| shipment_no | VARCHAR(64) | 发货单号 |
| track_time | DATETIME(3) | 轨迹时间 |
| track_status | VARCHAR(32) | 轨迹状态 |
| track_content | VARCHAR(255) | 轨迹内容 |

## 4.3 review-service

数据库：`mall_review`

### 4.3.1 `review_info`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| order_no | VARCHAR(64) | 订单号 |
| order_item_id | BIGINT UNSIGNED | 订单项ID |
| user_id | BIGINT UNSIGNED | 用户ID |
| sku_id | BIGINT UNSIGNED | SKU ID |
| score | TINYINT | 评分 |
| content | VARCHAR(1000) | 评价内容 |
| status | TINYINT | 状态:待审/通过/驳回 |
| anonymous_flag | TINYINT | 是否匿名 |
| created_time | DATETIME(3) | 创建时间 |

### 4.3.2 `review_image`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| review_id | BIGINT UNSIGNED | 评价ID |
| image_url | VARCHAR(255) | 图片地址 |
| sort | INT | 排序 |

### 4.3.3 `review_reply`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| review_id | BIGINT UNSIGNED | 评价ID |
| reply_type | TINYINT | 回复类型:商家/系统/追评 |
| content | VARCHAR(1000) | 回复内容 |
| created_time | DATETIME(3) | 创建时间 |

## 4.4 content-service

数据库：`mall_content`

### 4.4.1 `content_banner`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| title | VARCHAR(128) | 标题 |
| image_url | VARCHAR(255) | 图片 |
| jump_type | TINYINT | 跳转类型 |
| jump_target | VARCHAR(255) | 跳转目标 |
| sort | INT | 排序 |
| status | TINYINT | 状态 |

### 4.4.2 `content_topic`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| topic_name | VARCHAR(128) | 专题名称 |
| cover_image | VARCHAR(255) | 封面图 |
| content_json | JSON | 页面内容配置 |
| status | TINYINT | 状态 |

### 4.4.3 `content_notice`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| title | VARCHAR(128) | 公告标题 |
| content | TEXT | 公告内容 |
| publish_time | DATETIME(3) | 发布时间 |
| status | TINYINT | 状态 |

## 4.5 notification-service

数据库：`mall_notification`

### 4.5.1 `notify_template`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| template_code | VARCHAR(64) | 模板编码 |
| channel_type | TINYINT | 渠道类型 |
| biz_type | VARCHAR(32) | 业务类型 |
| template_title | VARCHAR(128) | 模板标题 |
| template_content | TEXT | 模板内容 |
| provider_template_code | VARCHAR(64) | 三方模板编码 |
| status | TINYINT | 状态 |

### 4.5.2 `notify_message`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| message_no | VARCHAR(64) | 消息单号 |
| biz_type | VARCHAR(32) | 业务类型 |
| biz_no | VARCHAR(64) | 业务单号 |
| user_id | BIGINT UNSIGNED | 用户ID |
| receiver | VARCHAR(128) | 接收者 |
| channel_type | TINYINT | 渠道类型 |
| title | VARCHAR(128) | 标题 |
| content | TEXT | 内容 |
| send_status | TINYINT | 发送状态 |
| scheduled_time | DATETIME(3) | 计划发送时间 |
| send_time | DATETIME(3) | 实际发送时间 |
| fail_reason | VARCHAR(255) | 失败原因 |

### 4.5.3 `notify_inbox`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| user_id | BIGINT UNSIGNED | 用户ID |
| title | VARCHAR(128) | 标题 |
| content | TEXT | 内容 |
| biz_type | VARCHAR(32) | 业务类型 |
| biz_no | VARCHAR(64) | 业务单号 |
| read_status | TINYINT | 已读状态 |
| read_time | DATETIME(3) | 已读时间 |

## 4.6 file-service

数据库：`mall_file`

### 4.6.1 `file_bucket`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| bucket_name | VARCHAR(64) | 存储桶 |
| bucket_region | VARCHAR(64) | 区域 |
| access_domain | VARCHAR(255) | 访问域名 |
| is_public | TINYINT | 是否公开 |
| status | TINYINT | 状态 |

### 4.6.2 `file_object`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| bucket_id | BIGINT UNSIGNED | 桶ID |
| biz_type | VARCHAR(32) | 业务类型 |
| biz_id | VARCHAR(64) | 业务标识 |
| object_name | VARCHAR(255) | 对象名 |
| original_name | VARCHAR(255) | 原文件名 |
| storage_path | VARCHAR(255) | 存储路径 |
| content_type | VARCHAR(128) | MIME类型 |
| file_ext | VARCHAR(32) | 扩展名 |
| file_size | BIGINT | 文件大小 |
| etag | VARCHAR(128) | 文件摘要 |
| url | VARCHAR(255) | 访问地址 |
| uploader_id | BIGINT UNSIGNED | 上传者ID |

## 4.7 admin-service

数据库：`mall_admin`

### 4.7.1 `admin_user`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| username | VARCHAR(64) | 登录名 |
| password_hash | VARCHAR(255) | 密码摘要 |
| real_name | VARCHAR(64) | 真实姓名 |
| mobile | VARCHAR(32) | 手机号 |
| status | TINYINT | 状态 |
| last_login_time | DATETIME(3) | 最后登录时间 |

### 4.7.2 `admin_role`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| role_code | VARCHAR(64) | 角色编码 |
| role_name | VARCHAR(64) | 角色名称 |
| status | TINYINT | 状态 |
| sort | INT | 排序 |

### 4.7.3 `admin_menu`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| parent_id | BIGINT UNSIGNED | 父菜单ID |
| menu_name | VARCHAR(64) | 菜单名 |
| menu_type | TINYINT | 菜单类型 |
| path | VARCHAR(128) | 路由 |
| component | VARCHAR(128) | 组件 |
| permission_code | VARCHAR(128) | 权限编码 |
| sort | INT | 排序 |
| status | TINYINT | 状态 |

### 4.7.4 `admin_user_role`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| user_id | BIGINT UNSIGNED | 用户ID |
| role_id | BIGINT UNSIGNED | 角色ID |

### 4.7.5 `admin_role_menu`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| role_id | BIGINT UNSIGNED | 角色ID |
| menu_id | BIGINT UNSIGNED | 菜单ID |

### 4.7.6 `admin_operate_log`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| operator_id | BIGINT UNSIGNED | 操作人ID |
| module_name | VARCHAR(64) | 模块名称 |
| request_uri | VARCHAR(255) | 请求地址 |
| request_method | VARCHAR(16) | 请求方法 |
| request_params | JSON | 请求参数 |
| result_code | INT | 结果码 |
| ip | VARCHAR(64) | 操作IP |
| created_time | DATETIME(3) | 操作时间 |

## 4.8 report-service

数据库：`mall_report`

### 4.8.1 `report_trade_daily`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| stat_date | DATE | 统计日期 |
| order_count | INT | 下单数 |
| paid_order_count | INT | 支付订单数 |
| gmv_amount | DECIMAL(18,2) | GMV |
| refund_amount | DECIMAL(18,2) | 退款额 |
| pay_user_count | INT | 支付用户数 |

### 4.8.2 `report_user_daily`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| stat_date | DATE | 统计日期 |
| new_user_count | INT | 新增用户 |
| active_user_count | INT | 活跃用户 |
| pay_user_count | INT | 支付用户 |
| member_up_count | INT | 升级会员数 |

### 4.8.3 `report_product_daily`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED | 主键 |
| stat_date | DATE | 统计日期 |
| sku_id | BIGINT UNSIGNED | SKU ID |
| view_count | INT | 浏览量 |
| cart_count | INT | 加购量 |
| order_count | INT | 下单量 |
| pay_count | INT | 支付量 |
| pay_amount | DECIMAL(18,2) | 支付金额 |

## 5. 索引设计补充建议

### 5.1 高频唯一索引

- `auth_account(login_type, login_name)`
- `user_info(user_no)`、`user_info(mobile)`
- `product_spu(spu_no)`、`product_sku(sku_no)`
- `inventory_reservation(reserve_no)`
- `coupon_user(coupon_code)`
- `order_info(order_no)`、`order_item(order_item_no)`
- `payment_order(payment_no)`、`refund_order(refund_no)`

### 5.2 高频查询索引

- 订单查询：`user_id + order_status + created_time`
- 支付补偿：`pay_status + expire_time`
- 库存释放：`expire_time + status`
- 用户券过期任务：`expire_time + status`
- 热门商品查询：`status + sale_count`

### 5.3 不建议的索引设计

- 不要给低区分度字段单独建索引，如单独 `status`
- 不要在 `TEXT/LONGTEXT` 字段上盲目建索引
- 不要把每个字段都建单列索引，优先组合索引

## 6. 分表与归档建议

### 6.1 建议预留分表的核心大表

- `order_info`
- `order_item`
- `order_operate_log`
- `payment_notify_log`
- `notify_message`
- `inventory_record`

### 6.2 分表策略建议

- 订单类：按月份分表，或按 `user_id` / `order_no` hash 分片
- 日志类：按月份分表，保留 6 到 12 个月热数据
- 报表类：按 `stat_date` 做月分区

### 6.3 归档策略建议

- 已完成订单 12 个月后转冷数据
- 登录日志 6 个月后归档
- 支付回调原文 12 个月后转对象存储
- 搜索统计原始明细保留 3 个月，长期保留日汇总

## 7. 状态字段枚举建议

为避免数据库语义不清，建议在代码中维护统一枚举，并在接口文档中同步以下状态定义：

- `order_status`：待支付、待发货、待收货、已完成、已取消、售后中
- `pay_status`：待支付、支付中、成功、失败、关闭
- `coupon_status`：未使用、已锁定、已使用、已过期、已作废
- `inventory_reservation.status`：已预占、已释放、已扣减
- `review.status`：待审核、已通过、已驳回

## 8. 落地顺序建议

如果要实际开始建库，建议按下面顺序推进：

1. 先落 `mall_auth`、`mall_user`、`mall_product`、`mall_inventory`
2. 再落 `mall_cart`、`mall_promotion`、`mall_order`、`mall_payment`
3. 最后补 `mall_logistics`、`mall_review`、`mall_content`、`mall_notification`、`mall_admin`、`mall_report`

## 9. 下一步可继续深化的内容

这份文档已经能作为数据库设计评审的基础版本。后续如果继续细化，建议再补三份文档：

1. 每张表的字段字典文档，补齐“是否为空、默认值、枚举值说明”
2. 可直接执行的建库 SQL 文件，按数据库拆成多个 `.sql`
3. 与接口文档对应的 DTO 和查询索引说明，明确每张表服务于哪些接口
