import type {
  ProductCategory,
  ProductSkuCard,
  ProductSkuDetail,
} from '../api/types'

const detailEntries: ProductSkuDetail[] = [
  {
    skuId: 20001,
    spuId: 10001,
    categoryId: 1101,
    categoryName: '手机',
    spuName: 'Nova X16',
    skuName: 'Nova X16 256G 曜石黑',
    brandName: 'Nova',
    salePrice: 5999,
    marketPrice: 6499,
    status: 1,
    mainImageUrl: 'iphone-16-black',
    sellingPoint: '轻旗舰手感、夜景影像和全天续航三者兼顾。',
    description:
      'Nova X16 面向日常主力机需求，兼顾观感、性能和耐用性，适合作为首页主推款与详情页入口款。',
  },
  {
    skuId: 20005,
    spuId: 10001,
    categoryId: 1101,
    categoryName: '手机',
    spuName: 'Nova X16',
    skuName: 'Nova X16 256G 极地白',
    brandName: 'Nova',
    salePrice: 5999,
    marketPrice: 6499,
    status: 1,
    mainImageUrl: 'iphone-16-white',
    sellingPoint: '同样的旗舰配置，换成更克制的极简配色。',
    description:
      '极地白版本延续标准款的核心性能，适合在详情页展示同系列配色切换与风格差异。',
  },
  {
    skuId: 20006,
    spuId: 10001,
    categoryId: 1101,
    categoryName: '手机',
    spuName: 'Nova X16',
    skuName: 'Nova X16 512G 晴空蓝',
    brandName: 'Nova',
    salePrice: 6799,
    marketPrice: 7299,
    status: 1,
    mainImageUrl: 'iphone-16-blue',
    sellingPoint: '更大存储、更适合影像与内容创作的升级版本。',
    description:
      '晴空蓝 512G 版本为重度拍摄与视频创作场景预留更多空间，适合作为商品详情页的高配选择。',
  },
  {
    skuId: 20002,
    spuId: 10002,
    categoryId: 1102,
    categoryName: '耳机',
    spuName: 'Echo Pods Pro 2',
    skuName: 'Echo Pods Pro 2 雾银版',
    brandName: 'Echo',
    salePrice: 1499,
    marketPrice: 1699,
    status: 1,
    mainImageUrl: 'airpods-pro-2',
    sellingPoint: '通勤降噪、会议收音和多设备切换都很稳。',
    description:
      'Echo Pods Pro 2 负责承接商城里的高频配件消费，也是购物车和结算链路里很自然的搭配品。',
  },
  {
    skuId: 20007,
    spuId: 10002,
    categoryId: 1102,
    categoryName: '耳机',
    spuName: 'Echo Pods Pro 2',
    skuName: 'Echo Pods Pro 2 午夜版',
    brandName: 'Echo',
    salePrice: 1599,
    marketPrice: 1799,
    status: 1,
    mainImageUrl: 'airpods-pro-2-midnight',
    sellingPoint: '更深的外观气质，适合黑色桌面和夜间通勤场景。',
    description:
      '午夜版补足了耳机分类的配色层次，也能让同系列 SKU 切换在前端更有真实感。',
  },
  {
    skuId: 20003,
    spuId: 10003,
    categoryId: 1103,
    categoryName: '笔记本',
    spuName: 'Atelier Air 15',
    skuName: 'Atelier Air 15 银色标准版',
    brandName: 'Atelier',
    salePrice: 8999,
    marketPrice: 9599,
    status: 1,
    mainImageUrl: 'macbook-air-silver',
    sellingPoint: '大屏轻薄和平衡续航，适合日常办公与学习。',
    description:
      'Atelier Air 15 是商城里的高客单价代表，适合承接搜索、推荐与结算场景。',
  },
  {
    skuId: 20008,
    spuId: 10003,
    categoryId: 1103,
    categoryName: '笔记本',
    spuName: 'Atelier Air 15',
    skuName: 'Atelier Air 15 午夜高配版',
    brandName: 'Atelier',
    salePrice: 10499,
    marketPrice: 11299,
    status: 1,
    mainImageUrl: 'macbook-air-midnight',
    sellingPoint: '更高内存与更大容量，适合创作和多任务流程。',
    description:
      '午夜高配版让笔记本分类在详情页具备更清晰的升级路径，也更适合作为高客单推荐位。',
  },
  {
    skuId: 20004,
    spuId: 10004,
    categoryId: 1104,
    categoryName: '穿戴',
    spuName: 'Pulse Watch 10',
    skuName: 'Pulse Watch 10 46mm 午夜款',
    brandName: 'Pulse',
    salePrice: 2999,
    marketPrice: 3299,
    status: 1,
    mainImageUrl: 'watch-series-10-midnight',
    sellingPoint: '睡眠监测、训练追踪和通知提醒一步到位。',
    description:
      'Pulse Watch 10 为商城提供了更轻巧的品类选择，也适合串联账户中心里的订单查看体验。',
  },
  {
    skuId: 20009,
    spuId: 10004,
    categoryId: 1104,
    categoryName: '穿戴',
    spuName: 'Pulse Watch 10',
    skuName: 'Pulse Watch 10 42mm 银色款',
    brandName: 'Pulse',
    salePrice: 2799,
    marketPrice: 3099,
    status: 1,
    mainImageUrl: 'watch-series-10-silver',
    sellingPoint: '更轻盈的表径设计，适合全天候佩戴。',
    description:
      '银色小表径版本让穿戴分类更平衡，也适合展示同系列不同尺寸的购买决策。',
  },
  {
    skuId: 20010,
    spuId: 10005,
    categoryId: 1105,
    categoryName: '家居音响',
    spuName: 'Dome Speaker Duo',
    skuName: 'Dome Speaker Duo 双只装',
    brandName: 'Dome',
    salePrice: 2299,
    marketPrice: 2599,
    status: 1,
    mainImageUrl: 'homepod-mini-duo',
    sellingPoint: '适合桌面和客厅的双声道组合，空间感很强。',
    description:
      'Dome Speaker Duo 补齐了居家声学品类，让整套商城商品结构不只局限在随身数码。',
  },
  {
    skuId: 20011,
    spuId: 10006,
    categoryId: 1101,
    categoryName: '手机',
    spuName: 'Fold One X',
    skuName: 'Fold One X 512G 岩砂金',
    brandName: 'Fold One',
    salePrice: 8299,
    marketPrice: 8999,
    status: 1,
    mainImageUrl: 'fold-x-sand',
    sellingPoint: '大展开屏搭配轻量化机身，兼顾移动办公与阅读体验。',
    description:
      'Fold One X 用来补齐高端手机区间，让商城在首页和后台都能看到更完整的价格带。',
  },
  {
    skuId: 20012,
    spuId: 10006,
    categoryId: 1101,
    categoryName: '手机',
    spuName: 'Fold One X',
    skuName: 'Fold One X 512G 深影灰',
    brandName: 'Fold One',
    salePrice: 8499,
    marketPrice: 9299,
    status: 1,
    mainImageUrl: 'fold-x-shadow',
    sellingPoint: '更沉稳的商务配色，适合演示高端折叠屏系列。',
    description:
      '深影灰版本让折叠旗舰拥有更明显的风格区分，也更适合在后台商品管理页展示。',
  },
  {
    skuId: 20013,
    spuId: 10007,
    categoryId: 1105,
    categoryName: '家居音响',
    spuName: 'Studio Speaker Max',
    skuName: 'Studio Speaker Max 石墨版',
    brandName: 'Studio',
    salePrice: 3999,
    marketPrice: 4399,
    status: 1,
    mainImageUrl: 'studio-speaker-graphite',
    sellingPoint: '更大的箱体与更饱满的低频，适合客厅主声场。',
    description:
      'Studio Speaker Max 让家居音响分类拥有更明确的高阶款，也有利于丰富后台概览的数据。',
  },
  {
    skuId: 20014,
    spuId: 10008,
    categoryId: 1103,
    categoryName: '笔记本',
    spuName: 'Creator Book 14',
    skuName: 'Creator Book 14 星光版',
    brandName: 'Creator',
    salePrice: 12999,
    marketPrice: 13899,
    status: 1,
    mainImageUrl: 'creator-book-starlight',
    sellingPoint: '更强图形性能和更高色域屏幕，适合创作工作流。',
    description:
      'Creator Book 14 负责抬高商城的高端创作本区间，让搜索、推荐和后台价格概览更有层次。',
  },
]

export const fallbackCategories: ProductCategory[] = [
  { categoryId: 1101, parentId: 0, categoryName: '手机', sort: 10 },
  { categoryId: 1102, parentId: 0, categoryName: '耳机', sort: 20 },
  { categoryId: 1103, parentId: 0, categoryName: '笔记本', sort: 30 },
  { categoryId: 1104, parentId: 0, categoryName: '穿戴', sort: 40 },
  { categoryId: 1105, parentId: 0, categoryName: '家居音响', sort: 50 },
]

function toCard(item: ProductSkuDetail): ProductSkuCard {
  return {
    skuId: item.skuId,
    spuId: item.spuId,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    spuName: item.spuName,
    skuName: item.skuName,
    salePrice: item.salePrice,
    marketPrice: item.marketPrice,
    status: item.status,
    mainImageUrl: item.mainImageUrl,
    sellingPoint: item.sellingPoint,
  }
}

export const fallbackCatalog: ProductSkuCard[] = detailEntries
  .filter((item) => item.status === 1)
  .map(toCard)

const productDetails = Object.fromEntries(
  detailEntries.map((item) => [item.skuId, item]),
) as Record<number, ProductSkuDetail>

export const fallbackRecommendations = fallbackCatalog.slice(0, 6)

export function getFallbackProductDetail(skuId: number) {
  return productDetails[skuId] ?? null
}

export function getFallbackSpuSkus(spuId: number) {
  return detailEntries.filter((item) => item.spuId === spuId).map(toCard)
}

export const gatewayHighlights = [
  {
    eyebrow: '统一网关',
    title: '公开商城、登录注册、下单支付都走同一条联调链路。',
    description:
      '首页和商品页对外开放，购物车、结算、账户中心和后台则继续通过网关做鉴权。',
  },
  {
    eyebrow: '真实数据',
    title: '商品、库存、用户和地址已经能落到 MySQL 里查看。',
    description:
      '这次替换的不只是视觉样式，商品和后台概览也会直接读取数据库里的真实数据。',
  },
  {
    eyebrow: '运营后台',
    title: '管理员账号可以直接进入控制台看用户、商品和库存预警。',
    description:
      '前台与后台复用同一套认证与商品体系，适合本地演示完整的商城闭环。',
  },
]
