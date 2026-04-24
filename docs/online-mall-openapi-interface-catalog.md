# 在线商城微服务 OpenAPI 接口清单

## 1. 文档说明

- 文档名称：在线商城微服务 OpenAPI 接口清单
- 目标：用于后端接口设计、前端联调、测试用例编写、Swagger/Knife4j 落地
- OpenAPI 版本建议：`OpenAPI 3.0.3`
- API 版本：`v1`
- 输出形式：按微服务拆分接口目录，区分用户端、后台端、内部接口

## 2. 全局接口规范

### 2.1 网关路由约定

| 入口类型 | 路由前缀 | 说明 |
| --- | --- | --- |
| 用户端 API | `/api/v1` | 面向 PC/H5/App/小程序 |
| 后台管理 API | `/admin-api/v1` | 面向运营后台、管理后台 |
| 内部服务 API | `/internal/v1` | 面向微服务间调用，不对外开放 |

### 2.2 认证方案

| 安全方案 | 说明 | 适用范围 |
| --- | --- | --- |
| `BearerAuth` | 用户 JWT 令牌 | 用户端接口 |
| `AdminBearerAuth` | 后台管理员 JWT 令牌 | 后台接口 |
| `InternalSign` | 内部签名或网关白名单 | 内部接口 |

### 2.3 通用请求头

| Header | 是否必填 | 说明 |
| --- | --- | --- |
| `Authorization` | 否 | Bearer Token |
| `X-Trace-Id` | 否 | 链路追踪 ID |
| `X-Client-Type` | 否 | 客户端类型：web/h5/app/mp |
| `X-Request-Id` | 否 | 请求唯一标识 |
| `Idempotency-Key` | 否 | 幂等键，适用于下单、支付、退款等写接口 |
| `X-Device-Id` | 否 | 设备 ID，用于登录风控、游客购物车 |

### 2.4 通用响应结构

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "traceId": "f13a8d88e2d54d72"
}
```

### 2.5 通用分页结构

```json
{
  "list": [],
  "pageNum": 1,
  "pageSize": 20,
  "total": 128,
  "totalPage": 7
}
```

### 2.6 通用状态码建议

| code | 说明 |
| --- | --- |
| 0 | 成功 |
| 400001 | 参数错误 |
| 400101 | 未登录 |
| 400103 | 无权限 |
| 400429 | 请求过于频繁 |
| 500001 | 系统异常 |
| 600101 | 库存不足 |
| 600102 | 商品已下架 |
| 600201 | 优惠券不可用 |
| 600301 | 订单状态非法 |
| 600401 | 支付失败 |

### 2.7 命名与建模规范

- 查询单个资源：`GET`
- 分页查询列表：`GET`
- 创建资源：`POST`
- 全量更新：`PUT`
- 局部更新：`PATCH`
- 删除资源：`DELETE`
- 状态流转动作：使用 `POST /resource/{id}/action`

### 2.8 通用 Schema 建议

建议在 OpenAPI `components/schemas` 中统一维护以下公共对象：

- `CommonResponse`
- `PageResponse`
- `IdResponse`
- `OptionItem`
- `UploadTokenResponse`
- `UserContext`
- `Money`
- `AddressDTO`
- `OrderAmountDTO`
- `ErrorResponse`

## 3. 接口分组总览

| Tag | 服务 | 说明 |
| --- | --- | --- |
| Auth | auth-service | 登录注册、令牌、验证码 |
| User | user-service | 用户资料、地址、会员等级 |
| Product | product-service | 商品、类目、品牌、属性 |
| Search | search-service | 搜索、联想词、热搜 |
| Cart | cart-service | 购物车、结算预览 |
| Promotion | promotion-service | 优惠券、活动、营销计算 |
| Order | order-service | 提交订单、订单详情、取消、售后 |
| Payment | payment-service | 支付单、支付回调、退款 |
| Inventory | inventory-service | 库存查询、锁库存、释放库存 |
| Logistics | logistics-service | 发货、物流轨迹、签收 |
| Review | review-service | 评价、晒单、回复 |
| Content | content-service | 首页内容、专题页、公告 |
| Notification | notification-service | 站内信、消息发送 |
| File | file-service | 上传、预签名、文件查询 |
| Admin | admin-service | 后台登录、角色权限、菜单 |
| Report | report-service | 交易报表、用户报表、商品报表 |

## 4. auth-service

服务说明：负责注册、登录、会话管理、验证码发送与校验。

### 4.1 用户端接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | 用户注册 | 否 | `mobile` `password` `smsCode` `inviteCode?` | `tokenInfo + userInfo` | 注册成功自动登录 |
| POST | `/api/v1/auth/login/password` | 密码登录 | 否 | `loginName` `password` `deviceId` `captchaCode?` | `tokenInfo` | 支持手机号/邮箱/用户名 |
| POST | `/api/v1/auth/login/mobile` | 短信登录 | 否 | `mobile` `smsCode` `deviceId` | `tokenInfo` | 免密登录 |
| POST | `/api/v1/auth/token/refresh` | 刷新令牌 | 否 | `refreshToken` | `tokenInfo` | 返回新的 access token |
| POST | `/api/v1/auth/logout` | 用户登出 | 是 | 无 | `boolean` | 使当前会话失效 |
| GET | `/api/v1/auth/sessions` | 会话列表 | 是 | 无 | `session[]` | 查看本人登录设备 |
| DELETE | `/api/v1/auth/sessions/{sessionNo}` | 踢出指定会话 | 是 | `sessionNo` | `boolean` | 账号安全管理 |
| POST | `/api/v1/auth/password/reset` | 重置密码 | 否 | `mobile` `smsCode` `newPassword` | `boolean` | 忘记密码 |
| POST | `/api/v1/auth/password/update` | 修改密码 | 是 | `oldPassword` `newPassword` | `boolean` | 登录态修改 |

### 4.2 验证码接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/auth/captcha/send` | 发送短信验证码 | 否 | `mobile` `scene` `captchaToken?` | `sendResult` | `scene` 如 `login/register/reset_pwd` |
| POST | `/api/v1/auth/captcha/verify` | 校验验证码 | 否 | `mobile` `scene` `smsCode` | `boolean` | 可独立校验，也可在业务内校验 |

### 4.3 内部接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/internal/v1/auth/users/{userId}/status` | 查询用户认证状态 | `InternalSign` | `userId` | `userAuthStatus` | 供订单、风控使用 |
| POST | `/internal/v1/auth/tokens/parse` | 解析令牌 | `InternalSign` | `token` | `userContext` | 供网关或内部排查使用 |

### 4.4 关键 Schema

- `LoginByPasswordRequest`
- `LoginByMobileRequest`
- `TokenInfoDTO`
- `UserSessionDTO`
- `SendCaptchaRequest`

## 5. user-service

服务说明：负责用户资料、地址、会员等级、成长值等管理。

### 5.1 用户端接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/users/me` | 获取当前用户信息 | 是 | 无 | `UserProfileDTO` | 个人中心首页 |
| PUT | `/api/v1/users/me/profile` | 更新个人资料 | 是 | `nickname` `gender` `birthday` `avatar` | `boolean` | 个人资料维护 |
| GET | `/api/v1/users/me/security` | 获取账号安全信息 | 是 | 无 | `UserSecurityDTO` | 展示手机号、绑定状态 |
| GET | `/api/v1/users/me/levels` | 获取会员等级权益 | 是 | 无 | `UserLevelDTO[]` | 会员中心 |
| GET | `/api/v1/users/me/growth/logs` | 查询成长值明细 | 是 | `pageNum` `pageSize` | `PageResponse<UserGrowthLogDTO>` | 成长值流水 |

### 5.2 地址接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/users/addresses` | 地址列表 | 是 | 无 | `AddressDTO[]` | 最多返回当前用户全部地址 |
| POST | `/api/v1/users/addresses` | 新增地址 | 是 | `AddressCreateRequest` | `IdResponse` | 新增收货地址 |
| GET | `/api/v1/users/addresses/{id}` | 地址详情 | 是 | `id` | `AddressDTO` | 仅本人可见 |
| PUT | `/api/v1/users/addresses/{id}` | 修改地址 | 是 | `AddressUpdateRequest` | `boolean` | 修改指定地址 |
| DELETE | `/api/v1/users/addresses/{id}` | 删除地址 | 是 | `id` | `boolean` | 逻辑删除 |
| POST | `/api/v1/users/addresses/{id}/default` | 设置默认地址 | 是 | `id` | `boolean` | 同时取消其他默认地址 |

### 5.3 后台接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin-api/v1/users` | 用户分页查询 | `AdminBearerAuth` | `keyword` `status` `pageNum` `pageSize` | `PageResponse<AdminUserPageDTO>` | 用户管理 |
| GET | `/admin-api/v1/users/{userId}` | 用户详情 | `AdminBearerAuth` | `userId` | `AdminUserDetailDTO` | 用户运营查看 |
| POST | `/admin-api/v1/users/{userId}/freeze` | 冻结用户 | `AdminBearerAuth` | `reason` | `boolean` | 风控冻结 |
| POST | `/admin-api/v1/users/{userId}/unfreeze` | 解冻用户 | `AdminBearerAuth` | 无 | `boolean` | 解冻 |
| POST | `/admin-api/v1/users/{userId}/level` | 调整会员等级 | `AdminBearerAuth` | `levelId` `remark` | `boolean` | 手工升级/降级 |

### 5.4 内部接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/internal/v1/users/{userId}` | 按用户 ID 查询基础信息 | `InternalSign` | `userId` | `UserBaseDTO` | 供订单、支付使用 |
| GET | `/internal/v1/users/{userId}/default-address` | 查询默认地址 | `InternalSign` | `userId` | `AddressDTO` | 下单时拉取 |
| POST | `/internal/v1/users/{userId}/growth/increase` | 增加成长值 | `InternalSign` | `bizNo` `value` `scene` | `boolean` | 订单支付、评价奖励 |

## 6. product-service

服务说明：负责类目、品牌、SPU/SKU、商品详情和后台商品管理。

### 6.1 用户端接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/products/categories/tree` | 获取类目树 | 否 | 无 | `CategoryTreeDTO[]` | 首页分类 |
| GET | `/api/v1/products/categories/{categoryId}` | 获取类目详情 | 否 | `categoryId` | `CategoryDTO` | 类目页 |
| GET | `/api/v1/products/spu/{spuId}` | 获取商品详情 | 否 | `spuId` | `ProductDetailDTO` | 聚合 SKU、属性、营销信息 |
| GET | `/api/v1/products/sku/{skuId}` | 获取 SKU 详情 | 否 | `skuId` | `SkuDetailDTO` | SKU 粒度详情 |
| GET | `/api/v1/products/recommend` | 获取推荐商品 | 否 | `scene` `pageNum` `pageSize` | `PageResponse<ProductCardDTO>` | 首页、详情页推荐 |
| GET | `/api/v1/products/brands` | 获取品牌列表 | 否 | `categoryId?` | `BrandDTO[]` | 条件过滤 |

### 6.2 后台接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/admin-api/v1/products/spu` | 新增 SPU | `AdminBearerAuth` | `ProductSpuCreateRequest` | `IdResponse` | 创建商品草稿 |
| PUT | `/admin-api/v1/products/spu/{spuId}` | 更新 SPU | `AdminBearerAuth` | `ProductSpuUpdateRequest` | `boolean` | 修改商品 |
| GET | `/admin-api/v1/products/spu/{spuId}` | SPU 详情 | `AdminBearerAuth` | `spuId` | `AdminProductSpuDetailDTO` | 编辑页回显 |
| GET | `/admin-api/v1/products/spu` | SPU 分页列表 | `AdminBearerAuth` | `keyword` `categoryId` `saleStatus` `pageNum` `pageSize` | `PageResponse<AdminProductSpuPageDTO>` | 商品列表 |
| POST | `/admin-api/v1/products/spu/{spuId}/publish` | 商品上架 | `AdminBearerAuth` | 无 | `boolean` | 发布商品 |
| POST | `/admin-api/v1/products/spu/{spuId}/unpublish` | 商品下架 | `AdminBearerAuth` | `reason?` | `boolean` | 下架商品 |
| POST | `/admin-api/v1/products/categories` | 新增类目 | `AdminBearerAuth` | `CategoryCreateRequest` | `IdResponse` | 类目管理 |
| PUT | `/admin-api/v1/products/categories/{categoryId}` | 修改类目 | `AdminBearerAuth` | `CategoryUpdateRequest` | `boolean` | 类目管理 |
| POST | `/admin-api/v1/products/brands` | 新增品牌 | `AdminBearerAuth` | `BrandCreateRequest` | `IdResponse` | 品牌管理 |
| PUT | `/admin-api/v1/products/brands/{brandId}` | 修改品牌 | `AdminBearerAuth` | `BrandUpdateRequest` | `boolean` | 品牌管理 |

### 6.3 内部接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/internal/v1/products/skus/{skuId}` | 查询 SKU 基础信息 | `InternalSign` | `skuId` | `SkuBaseDTO` | 购物车、订单、库存 |
| POST | `/internal/v1/products/skus/batch` | 批量查询 SKU 信息 | `InternalSign` | `skuIds[]` | `SkuBaseDTO[]` | 结算批量查询 |
| GET | `/internal/v1/products/spus/{spuId}` | 查询 SPU 基础信息 | `InternalSign` | `spuId` | `SpuBaseDTO` | 搜索建索引 |
| POST | `/internal/v1/products/price/check` | 校验最新价格 | `InternalSign` | `PriceCheckRequest` | `PriceCheckResultDTO` | 下单前二次校验 |

## 7. search-service

服务说明：负责商品搜索、联想词、热搜词、搜索过滤与排序。

### 7.1 用户端接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/search/products` | 商品搜索 | 否 | `keyword?` `categoryId?` `brandIds?` `priceMin?` `priceMax?` `sort?` `pageNum` `pageSize` | `ProductSearchPageDTO` | 支持筛选聚合 |
| GET | `/api/v1/search/suggest` | 搜索联想 | 否 | `keyword` | `SuggestWordDTO[]` | 输入联想 |
| GET | `/api/v1/search/hot-words` | 热搜词列表 | 否 | 无 | `HotWordDTO[]` | 搜索页展示 |
| GET | `/api/v1/search/filter/options` | 获取筛选项 | 否 | `categoryId` `keyword?` | `SearchFilterOptionDTO` | 类目筛选条件 |

### 7.2 后台接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin-api/v1/search/hot-words` | 热搜词分页查询 | `AdminBearerAuth` | `status` `pageNum` `pageSize` | `PageResponse<HotWordDTO>` | 运营管理 |
| POST | `/admin-api/v1/search/hot-words` | 新增热搜词 | `AdminBearerAuth` | `HotWordCreateRequest` | `IdResponse` | 手工维护热搜 |
| PUT | `/admin-api/v1/search/hot-words/{id}` | 修改热搜词 | `AdminBearerAuth` | `HotWordUpdateRequest` | `boolean` | 运营维护 |
| POST | `/admin-api/v1/search/index/rebuild` | 全量重建索引 | `AdminBearerAuth` | `IndexRebuildRequest` | `taskInfo` | 触发异步重建 |

### 7.3 内部接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/internal/v1/search/index/upsert` | 写入或更新索引 | `InternalSign` | `ProductIndexUpsertRequest` | `boolean` | 商品发布后调用 |
| DELETE | `/internal/v1/search/index/{skuId}` | 删除索引 | `InternalSign` | `skuId` | `boolean` | 商品下架后调用 |

## 8. cart-service

服务说明：负责购物车增删改查、选中状态和结算预览。

### 8.1 用户端接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/cart/items` | 查询购物车列表 | 是 | 无 | `CartViewDTO` | 返回有效、失效商品分组 |
| POST | `/api/v1/cart/items` | 加入购物车 | 是 | `skuId` `quantity` | `boolean` | 相同 SKU 自动累加 |
| PUT | `/api/v1/cart/items/{skuId}` | 修改购物车商品数量 | 是 | `quantity` | `boolean` | 购物车编辑 |
| DELETE | `/api/v1/cart/items/{skuId}` | 删除购物车商品 | 是 | `skuId` | `boolean` | 删除指定商品 |
| POST | `/api/v1/cart/items/check` | 批量勾选商品 | 是 | `skuIds[]` `checked` | `boolean` | 批量选中/取消 |
| POST | `/api/v1/cart/items/check-all` | 全选或全不选 | 是 | `checked` | `boolean` | 快捷操作 |
| GET | `/api/v1/cart/count` | 获取购物车商品数 | 是 | 无 | `countInfo` | 角标数量 |
| POST | `/api/v1/cart/settlement/preview` | 结算预览 | 是 | `SettlementPreviewRequest` | `SettlementPreviewDTO` | 返回价格、库存、活动命中结果 |

### 8.2 内部接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/internal/v1/cart/settlement/snapshot` | 生成结算快照 | `InternalSign` | `userId` `skuIds[]` | `SettlementSnapshotDTO` | 下单前创建快照 |
| DELETE | `/internal/v1/cart/items/clear-checked` | 清空已下单商品 | `InternalSign` | `userId` `skuIds[]` | `boolean` | 订单创建后调用 |

## 9. promotion-service

服务说明：负责优惠券、营销活动、秒杀、结算优惠计算。

### 9.1 用户端接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/promotions/products/{skuId}` | 查询商品营销信息 | 否 | `skuId` | `ProductPromotionDTO` | 商品详情页展示 |
| GET | `/api/v1/promotions/coupons/available` | 查询可领取优惠券 | 是 | `pageNum` `pageSize` | `PageResponse<CouponTemplateDTO>` | 领券中心 |
| POST | `/api/v1/promotions/coupons/receive` | 领取优惠券 | 是 | `templateId` | `boolean` | 领取资格校验 |
| GET | `/api/v1/promotions/coupons/my` | 我的优惠券 | 是 | `status` `pageNum` `pageSize` | `PageResponse<UserCouponDTO>` | 用户券包 |
| POST | `/api/v1/promotions/settlement/calculate` | 计算营销优惠 | 是 | `PromotionCalculateRequest` | `PromotionCalculateDTO` | 结算页营销明细 |
| GET | `/api/v1/promotions/flash-sale/current` | 当前秒杀场次 | 否 | 无 | `FlashSaleSessionDTO` | 秒杀频道 |

### 9.2 后台接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin-api/v1/promotions/activities` | 营销活动分页 | `AdminBearerAuth` | `activityType` `status` `pageNum` `pageSize` | `PageResponse<PromotionActivityDTO>` | 活动管理 |
| POST | `/admin-api/v1/promotions/activities` | 新增营销活动 | `AdminBearerAuth` | `PromotionActivityCreateRequest` | `IdResponse` | 创建满减/折扣活动 |
| PUT | `/admin-api/v1/promotions/activities/{id}` | 更新营销活动 | `AdminBearerAuth` | `PromotionActivityUpdateRequest` | `boolean` | 修改活动 |
| POST | `/admin-api/v1/promotions/coupons/templates` | 创建优惠券模板 | `AdminBearerAuth` | `CouponTemplateCreateRequest` | `IdResponse` | 优惠券模板管理 |
| GET | `/admin-api/v1/promotions/coupons/templates` | 模板分页列表 | `AdminBearerAuth` | `status` `couponType` `pageNum` `pageSize` | `PageResponse<CouponTemplateDTO>` | 模板管理 |
| POST | `/admin-api/v1/promotions/flash-sale/sessions` | 创建秒杀场次 | `AdminBearerAuth` | `FlashSaleSessionCreateRequest` | `IdResponse` | 秒杀管理 |

### 9.3 内部接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/internal/v1/promotions/coupons/lock` | 锁定优惠券 | `InternalSign` | `CouponLockRequest` | `CouponLockResultDTO` | 提交订单前调用 |
| POST | `/internal/v1/promotions/coupons/release` | 释放优惠券 | `InternalSign` | `CouponReleaseRequest` | `boolean` | 订单取消调用 |
| POST | `/internal/v1/promotions/coupons/use` | 核销优惠券 | `InternalSign` | `CouponUseRequest` | `boolean` | 支付成功调用 |
| POST | `/internal/v1/promotions/settlement/calculate` | 内部优惠计算 | `InternalSign` | `PromotionCalculateRequest` | `PromotionCalculateDTO` | 订单结算核心接口 |

## 10. order-service

服务说明：负责提交订单、订单详情、取消、确认收货、售后申请等交易主流程。

### 10.1 用户端接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/orders/submit` | 提交订单 | 是 | `OrderSubmitRequest` | `OrderSubmitResultDTO` | 创建订单并返回订单号 |
| GET | `/api/v1/orders` | 订单分页列表 | 是 | `status?` `pageNum` `pageSize` | `PageResponse<OrderPageDTO>` | 我的订单 |
| GET | `/api/v1/orders/{orderNo}` | 订单详情 | 是 | `orderNo` | `OrderDetailDTO` | 订单详情页 |
| POST | `/api/v1/orders/{orderNo}/cancel` | 取消订单 | 是 | `cancelReason` | `boolean` | 仅待支付等可取消状态允许 |
| POST | `/api/v1/orders/{orderNo}/confirm-receipt` | 确认收货 | 是 | 无 | `boolean` | 待收货状态 |
| GET | `/api/v1/orders/{orderNo}/status` | 查询订单状态 | 是 | `orderNo` | `OrderStatusDTO` | 支付结果页轮询 |
| POST | `/api/v1/orders/{orderNo}/after-sale/apply` | 申请售后 | 是 | `AfterSaleApplyRequest` | `IdResponse` | 退款/退货退款 |
| GET | `/api/v1/orders/after-sale/{afterSaleNo}` | 售后详情 | 是 | `afterSaleNo` | `AfterSaleDetailDTO` | 售后详情页 |
| GET | `/api/v1/orders/confirm` | 订单确认页信息 | 是 | `settlementToken` | `OrderConfirmDTO` | 返回地址、券、金额信息 |

### 10.2 后台接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin-api/v1/orders` | 后台订单分页查询 | `AdminBearerAuth` | `keyword` `status` `pageNum` `pageSize` | `PageResponse<AdminOrderPageDTO>` | 订单管理 |
| GET | `/admin-api/v1/orders/{orderNo}` | 后台订单详情 | `AdminBearerAuth` | `orderNo` | `AdminOrderDetailDTO` | 展示支付、物流、售后信息 |
| POST | `/admin-api/v1/orders/{orderNo}/remark` | 添加订单备注 | `AdminBearerAuth` | `remark` | `boolean` | 客服备注 |
| POST | `/admin-api/v1/orders/{orderNo}/close` | 后台关闭订单 | `AdminBearerAuth` | `reason` | `boolean` | 风险关闭 |
| GET | `/admin-api/v1/orders/after-sale` | 售后单分页查询 | `AdminBearerAuth` | `status` `type` `pageNum` `pageSize` | `PageResponse<AfterSalePageDTO>` | 售后管理 |
| POST | `/admin-api/v1/orders/after-sale/{afterSaleNo}/audit` | 售后审核 | `AdminBearerAuth` | `approve` `approvedAmount` `remark` | `boolean` | 售后审核 |

### 10.3 内部接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/internal/v1/orders/{orderNo}` | 查询订单基础信息 | `InternalSign` | `orderNo` | `OrderBaseDTO` | 支付、物流服务调用 |
| POST | `/internal/v1/orders/{orderNo}/paid` | 标记订单已支付 | `InternalSign` | `OrderPaidRequest` | `boolean` | 由支付服务回调驱动 |
| POST | `/internal/v1/orders/{orderNo}/cancel-timeout` | 超时取消订单 | `InternalSign` | `reason` | `boolean` | 延迟任务调用 |
| POST | `/internal/v1/orders/{orderNo}/delivery-status` | 更新履约状态 | `InternalSign` | `deliveryStatus` `shipmentNo?` | `boolean` | 物流服务回写 |

## 11. payment-service

服务说明：负责支付单创建、支付回调、退款申请与对账管理。

### 11.1 用户端接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/payments/create` | 创建支付单 | 是 | `PaymentCreateRequest` | `PaymentCreateDTO` | 返回支付参数 |
| GET | `/api/v1/payments/{paymentNo}` | 查询支付单详情 | 是 | `paymentNo` | `PaymentDetailDTO` | 支付状态查询 |
| GET | `/api/v1/payments/order/{orderNo}` | 按订单查询支付信息 | 是 | `orderNo` | `PaymentDetailDTO` | 支付结果页 |
| POST | `/api/v1/payments/refund/apply` | 申请退款 | 是 | `RefundApplyRequest` | `IdResponse` | 通常由售后流程触发 |

### 11.2 第三方回调接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/payments/notify/alipay` | 支付宝回调 | 否 | 三方回调报文 | `string` | 需验签、幂等处理 |
| POST | `/api/v1/payments/notify/wechat` | 微信支付回调 | 否 | 三方回调报文 | `string/json` | 需验签、幂等处理 |
| POST | `/api/v1/payments/refund/notify/alipay` | 支付宝退款回调 | 否 | 三方回调报文 | `string` | 退款结果通知 |
| POST | `/api/v1/payments/refund/notify/wechat` | 微信退款回调 | 否 | 三方回调报文 | `string/json` | 退款结果通知 |

### 11.3 后台接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin-api/v1/payments` | 支付单分页查询 | `AdminBearerAuth` | `orderNo` `payStatus` `pageNum` `pageSize` | `PageResponse<PaymentPageDTO>` | 财务对账 |
| GET | `/admin-api/v1/payments/refunds` | 退款单分页查询 | `AdminBearerAuth` | `refundStatus` `pageNum` `pageSize` | `PageResponse<RefundPageDTO>` | 退款管理 |
| GET | `/admin-api/v1/payments/reconcile` | 对账单列表 | `AdminBearerAuth` | `billDate` `channel` `pageNum` `pageSize` | `PageResponse<ReconcileBillDTO>` | 对账管理 |
| POST | `/admin-api/v1/payments/reconcile/download` | 下载并生成对账单 | `AdminBearerAuth` | `billDate` `channel` | `taskInfo` | 异步对账任务 |

### 11.4 内部接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/internal/v1/payments/orders` | 内部创建支付单 | `InternalSign` | `PaymentCreateRequest` | `PaymentCreateDTO` | 订单服务调用 |
| GET | `/internal/v1/payments/orders/{paymentNo}` | 查询支付状态 | `InternalSign` | `paymentNo` | `PaymentStatusDTO` | 订单状态轮询 |
| POST | `/internal/v1/payments/refunds` | 创建退款单 | `InternalSign` | `RefundCreateRequest` | `RefundCreateDTO` | 售后审核通过后调用 |

## 12. inventory-service

服务说明：负责库存查询、锁定、释放、扣减、调整。

### 12.1 用户端接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/inventory/stock/{skuId}` | 查询 SKU 库存 | 否 | `skuId` | `StockDTO` | 商品详情页库存提示 |

### 12.2 后台接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin-api/v1/inventory/stocks` | 库存分页查询 | `AdminBearerAuth` | `skuId` `warehouseId` `pageNum` `pageSize` | `PageResponse<StockPageDTO>` | 库存列表 |
| POST | `/admin-api/v1/inventory/stocks/adjust` | 手工调整库存 | `AdminBearerAuth` | `StockAdjustRequest` | `boolean` | 盘点或异常修正 |
| GET | `/admin-api/v1/inventory/records` | 库存流水查询 | `AdminBearerAuth` | `skuId` `bizType` `pageNum` `pageSize` | `PageResponse<InventoryRecordDTO>` | 审计库存变更 |
| POST | `/admin-api/v1/inventory/warehouses` | 新增仓库 | `AdminBearerAuth` | `WarehouseCreateRequest` | `IdResponse` | 仓库管理 |

### 12.3 内部接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/internal/v1/inventory/reserve` | 锁库存 | `InternalSign` | `StockReserveRequest` | `StockReserveResultDTO` | 提交订单前调用 |
| POST | `/internal/v1/inventory/release` | 释放库存 | `InternalSign` | `StockReleaseRequest` | `boolean` | 订单取消调用 |
| POST | `/internal/v1/inventory/confirm-deduct` | 确认扣减库存 | `InternalSign` | `StockDeductRequest` | `boolean` | 支付成功调用 |
| POST | `/internal/v1/inventory/check` | 批量校验库存 | `InternalSign` | `StockCheckRequest` | `StockCheckResultDTO` | 结算页预校验 |

## 13. logistics-service

服务说明：负责发货单、物流轨迹、签收状态与履约回写。

### 13.1 用户端接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/logistics/orders/{orderNo}/shipments` | 查询订单物流信息 | 是 | `orderNo` | `ShipmentDetailDTO[]` | 订单详情物流模块 |
| GET | `/api/v1/logistics/shipments/{shipmentNo}/tracks` | 查询物流轨迹 | 是 | `shipmentNo` | `ShipmentTrackDTO[]` | 物流详情 |

### 13.2 后台接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/admin-api/v1/logistics/shipments/create` | 创建发货单 | `AdminBearerAuth` | `ShipmentCreateRequest` | `IdResponse` | 拣货完成后创建 |
| POST | `/admin-api/v1/logistics/shipments/{shipmentNo}/deliver` | 确认发货 | `AdminBearerAuth` | `ShipmentDeliverRequest` | `boolean` | 填写快递公司和运单号 |
| GET | `/admin-api/v1/logistics/shipments` | 发货单分页 | `AdminBearerAuth` | `orderNo` `shipmentStatus` `pageNum` `pageSize` | `PageResponse<ShipmentPageDTO>` | 履约管理 |
| POST | `/admin-api/v1/logistics/tracks/sync` | 同步物流轨迹 | `AdminBearerAuth` | `shipmentNo?` | `taskInfo` | 手工触发同步 |

### 13.3 内部接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/internal/v1/logistics/orders/{orderNo}/shipments` | 按订单查询发货信息 | `InternalSign` | `orderNo` | `ShipmentDetailDTO[]` | 订单服务调用 |
| POST | `/internal/v1/logistics/shipments/{shipmentNo}/signed` | 回写签收状态 | `InternalSign` | `signTime` | `boolean` | 第三方轨迹回写 |

## 14. review-service

服务说明：负责用户评价、晒单图片、追加评价、商家回复。

### 14.1 用户端接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/reviews` | 提交评价 | 是 | `ReviewCreateRequest` | `IdResponse` | 订单完成后评价 |
| POST | `/api/v1/reviews/{reviewId}/append` | 追加评价 | 是 | `ReviewAppendRequest` | `boolean` | 支持追评 |
| GET | `/api/v1/reviews/products/{skuId}` | 商品评价列表 | 否 | `scoreType?` `hasImage?` `pageNum` `pageSize` | `PageResponse<ReviewDTO>` | 商品详情页 |
| GET | `/api/v1/reviews/orders/{orderNo}/pending` | 待评价商品列表 | 是 | `orderNo` | `PendingReviewDTO[]` | 评价页初始化 |

### 14.2 后台接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin-api/v1/reviews` | 评价分页查询 | `AdminBearerAuth` | `status` `skuId?` `pageNum` `pageSize` | `PageResponse<AdminReviewPageDTO>` | 评价审核 |
| POST | `/admin-api/v1/reviews/{reviewId}/audit` | 审核评价 | `AdminBearerAuth` | `approve` `remark` | `boolean` | 内容审核 |
| POST | `/admin-api/v1/reviews/{reviewId}/reply` | 回复评价 | `AdminBearerAuth` | `content` | `boolean` | 商家回复 |

### 14.3 内部接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/internal/v1/reviews/orders/{orderItemId}/eligibility` | 查询评价资格 | `InternalSign` | `orderItemId` | `ReviewEligibilityDTO` | 订单完成时使用 |
| POST | `/internal/v1/reviews/orders/{orderItemId}/mark-reviewed` | 标记已评价 | `InternalSign` | `reviewId` | `boolean` | 更新订单项评价状态 |

## 15. content-service

服务说明：负责首页装修、专题页、公告、帮助中心等内容分发。

### 15.1 用户端接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/contents/home` | 获取首页装修数据 | 否 | `clientType` | `HomeContentDTO` | 首页聚合 |
| GET | `/api/v1/contents/banners` | 获取轮播图 | 否 | `positionCode` | `BannerDTO[]` | 首页或频道页 Banner |
| GET | `/api/v1/contents/topics/{topicId}` | 获取专题页详情 | 否 | `topicId` | `TopicDetailDTO` | 专题页 |
| GET | `/api/v1/contents/notices` | 获取公告列表 | 否 | `pageNum` `pageSize` | `PageResponse<NoticeDTO>` | 公告列表 |

### 15.2 后台接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin-api/v1/contents/banners` | Banner 分页查询 | `AdminBearerAuth` | `status` `pageNum` `pageSize` | `PageResponse<BannerDTO>` | 内容管理 |
| POST | `/admin-api/v1/contents/banners` | 新增 Banner | `AdminBearerAuth` | `BannerCreateRequest` | `IdResponse` | 运营配置 |
| PUT | `/admin-api/v1/contents/banners/{id}` | 修改 Banner | `AdminBearerAuth` | `BannerUpdateRequest` | `boolean` | 运营配置 |
| POST | `/admin-api/v1/contents/topics` | 新增专题页 | `AdminBearerAuth` | `TopicCreateRequest` | `IdResponse` | 内容配置 |
| PUT | `/admin-api/v1/contents/topics/{id}` | 修改专题页 | `AdminBearerAuth` | `TopicUpdateRequest` | `boolean` | 内容配置 |

## 16. notification-service

服务说明：负责短信、邮件、站内信、App Push 模板和发送记录。

### 16.1 用户端接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/notifications/inbox` | 站内信列表 | 是 | `readStatus?` `pageNum` `pageSize` | `PageResponse<InboxMessageDTO>` | 消息中心 |
| GET | `/api/v1/notifications/inbox/{id}` | 站内信详情 | 是 | `id` | `InboxMessageDTO` | 消息详情 |
| POST | `/api/v1/notifications/inbox/{id}/read` | 标记已读 | 是 | 无 | `boolean` | 单条已读 |
| POST | `/api/v1/notifications/inbox/read-all` | 全部已读 | 是 | 无 | `boolean` | 批量已读 |

### 16.2 后台接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin-api/v1/notifications/templates` | 模板分页查询 | `AdminBearerAuth` | `channelType` `pageNum` `pageSize` | `PageResponse<NotifyTemplateDTO>` | 模板管理 |
| POST | `/admin-api/v1/notifications/templates` | 新增消息模板 | `AdminBearerAuth` | `NotifyTemplateCreateRequest` | `IdResponse` | 模板管理 |
| PUT | `/admin-api/v1/notifications/templates/{id}` | 更新消息模板 | `AdminBearerAuth` | `NotifyTemplateUpdateRequest` | `boolean` | 模板管理 |
| GET | `/admin-api/v1/notifications/messages` | 发送记录分页 | `AdminBearerAuth` | `channelType` `sendStatus` `pageNum` `pageSize` | `PageResponse<NotifyMessagePageDTO>` | 发送记录 |

### 16.3 内部接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/internal/v1/notifications/send` | 发送消息 | `InternalSign` | `NotifySendRequest` | `boolean` | 订单、支付、物流事件触发 |
| POST | `/internal/v1/notifications/inbox/create` | 创建站内信 | `InternalSign` | `InboxCreateRequest` | `IdResponse` | 站内消息落库 |

## 17. file-service

服务说明：负责文件上传、预签名、文件元数据查询。

### 17.1 用户端接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/files/upload/presign` | 获取上传预签名 | 是 | `FilePresignRequest` | `UploadTokenResponse` | 前端直传 OSS/MinIO |
| POST | `/api/v1/files/upload/callback` | 上传成功回调 | 是 | `FileUploadCallbackRequest` | `FileObjectDTO` | 记录文件元数据 |
| GET | `/api/v1/files/{id}` | 查询文件详情 | 是 | `id` | `FileObjectDTO` | 文件预览信息 |

### 17.2 后台接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin-api/v1/files` | 文件分页查询 | `AdminBearerAuth` | `bizType` `pageNum` `pageSize` | `PageResponse<FileObjectDTO>` | 素材管理 |
| DELETE | `/admin-api/v1/files/{id}` | 删除文件 | `AdminBearerAuth` | `id` | `boolean` | 逻辑删除 |

## 18. admin-service

服务说明：负责后台管理员登录、RBAC 权限、菜单、字典和操作日志。

### 18.1 后台认证接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/admin-api/v1/auth/login` | 后台登录 | 否 | `username` `password` `captcha?` | `AdminTokenDTO` | 管理员登录 |
| POST | `/admin-api/v1/auth/logout` | 后台登出 | `AdminBearerAuth` | 无 | `boolean` | 清理后台会话 |
| GET | `/admin-api/v1/auth/me` | 获取当前管理员信息 | `AdminBearerAuth` | 无 | `AdminProfileDTO` | 后台首页 |

### 18.2 权限与菜单接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin-api/v1/menus/tree` | 菜单树 | `AdminBearerAuth` | 无 | `AdminMenuTreeDTO[]` | 当前用户菜单 |
| GET | `/admin-api/v1/roles` | 角色分页 | `AdminBearerAuth` | `keyword?` `pageNum` `pageSize` | `PageResponse<AdminRoleDTO>` | 角色管理 |
| POST | `/admin-api/v1/roles` | 新增角色 | `AdminBearerAuth` | `RoleCreateRequest` | `IdResponse` | 角色管理 |
| PUT | `/admin-api/v1/roles/{roleId}` | 修改角色 | `AdminBearerAuth` | `RoleUpdateRequest` | `boolean` | 角色管理 |
| POST | `/admin-api/v1/roles/{roleId}/permissions` | 分配角色权限 | `AdminBearerAuth` | `menuIds[]` | `boolean` | 菜单与按钮权限 |
| GET | `/admin-api/v1/admin-users` | 管理员分页 | `AdminBearerAuth` | `keyword?` `status?` `pageNum` `pageSize` | `PageResponse<AdminUserDTO>` | 管理员管理 |
| POST | `/admin-api/v1/admin-users` | 新增管理员 | `AdminBearerAuth` | `AdminUserCreateRequest` | `IdResponse` | 管理员管理 |
| PUT | `/admin-api/v1/admin-users/{id}` | 修改管理员 | `AdminBearerAuth` | `AdminUserUpdateRequest` | `boolean` | 管理员管理 |

### 18.3 审计接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin-api/v1/operate-logs` | 操作日志分页 | `AdminBearerAuth` | `operatorId?` `moduleName?` `pageNum` `pageSize` | `PageResponse<OperateLogDTO>` | 审计日志 |

## 19. report-service

服务说明：负责交易报表、用户报表、商品分析报表与大屏数据输出。

### 19.1 后台接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin-api/v1/reports/trade/overview` | 交易总览 | `AdminBearerAuth` | `startDate` `endDate` | `TradeOverviewDTO` | GMV、订单量、支付率 |
| GET | `/admin-api/v1/reports/trade/trend` | 交易趋势 | `AdminBearerAuth` | `startDate` `endDate` `granularity` | `TradeTrendDTO` | 日/周趋势 |
| GET | `/admin-api/v1/reports/users/overview` | 用户总览 | `AdminBearerAuth` | `startDate` `endDate` | `UserOverviewDTO` | 新增、活跃、支付用户 |
| GET | `/admin-api/v1/reports/products/top-sales` | 商品销量排行 | `AdminBearerAuth` | `startDate` `endDate` `pageNum` `pageSize` | `PageResponse<ProductSalesRankDTO>` | 销售排行 |
| GET | `/admin-api/v1/reports/dashboard` | 运营大屏数据 | `AdminBearerAuth` | 无 | `DashboardDTO` | 首页大屏 |

### 19.2 内部接口

| 方法 | 路径 | 接口名称 | 鉴权 | 请求参数 | 返回对象 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/internal/v1/reports/events/trade` | 上报交易事件 | `InternalSign` | `TradeEventReportRequest` | `boolean` | 订单、支付事件同步 |
| POST | `/internal/v1/reports/events/user` | 上报用户事件 | `InternalSign` | `UserEventReportRequest` | `boolean` | 注册、活跃、升级事件同步 |

## 20. 关键请求对象清单

建议优先在 OpenAPI `components/schemas` 中维护以下请求对象：

- `AddressCreateRequest`
- `AddressUpdateRequest`
- `ProductSpuCreateRequest`
- `ProductSpuUpdateRequest`
- `SettlementPreviewRequest`
- `PromotionCalculateRequest`
- `OrderSubmitRequest`
- `PaymentCreateRequest`
- `RefundApplyRequest`
- `StockReserveRequest`
- `ShipmentCreateRequest`
- `ReviewCreateRequest`
- `BannerCreateRequest`
- `NotifySendRequest`
- `RoleCreateRequest`

## 21. 关键响应对象清单

建议优先维护以下响应对象：

- `TokenInfoDTO`
- `UserProfileDTO`
- `AddressDTO`
- `ProductDetailDTO`
- `ProductSearchPageDTO`
- `CartViewDTO`
- `SettlementPreviewDTO`
- `PromotionCalculateDTO`
- `OrderDetailDTO`
- `PaymentDetailDTO`
- `StockCheckResultDTO`
- `ShipmentDetailDTO`
- `ReviewDTO`
- `HomeContentDTO`
- `InboxMessageDTO`
- `AdminMenuTreeDTO`
- `TradeOverviewDTO`

## 22. Swagger/Knife4j 落地建议

### 22.1 分组建议

- 用户端：`mall-user-api`
- 后台端：`mall-admin-api`
- 内部接口：`mall-internal-api`

### 22.2 文档分组建议

- `auth-user`
- `user-center`
- `product-search`
- `cart-promotion`
- `order-payment`
- `inventory-logistics`
- `review-content`
- `notification-file`
- `admin-rbac`
- `report-dashboard`

### 22.3 注解建议

- Controller 层使用 `@Tag`
- 接口使用 `@Operation(summary = "...")`
- 参数使用 `@Parameter(description = "...")`
- 对象字段使用 `@Schema(description = "...")`
- 统一响应对象使用 `@Schema(name = "CommonResponse")`

## 23. 接口优先级建议

### 23.1 P0 必须先落地

1. 登录注册
2. 商品列表与详情
3. 搜索
4. 购物车
5. 结算预览
6. 提交订单
7. 创建支付单
8. 支付回调
9. 订单查询

### 23.2 P1 第二阶段落地

1. 优惠券领取和结算计算
2. 物流轨迹
3. 评价
4. 首页装修
5. 通知中心
6. 后台商品管理
7. 报表接口

## 24. 下一步建议

这份接口清单已经足够作为 OpenAPI 设计初稿。继续往下深化时，建议按下面顺序推进：

1. 把本清单拆成可直接导入 Swagger 的 `openapi.yaml`
2. 先输出 `auth/user/product/cart/order/payment` 六个服务的详细请求与响应 JSON Schema
3. 为每个接口补齐示例请求报文、示例响应报文、错误码说明
