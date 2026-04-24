export interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
  traceId: string
}

export interface TokenInfo {
  accessToken: string
  refreshToken: string
  userId: number
  nickname: string
  userRole: string
  sessionNo: string
  accessTokenExpireTime: string
  refreshTokenExpireTime: string
}

export interface LoginRequest {
  loginName: string
  password: string
  deviceId?: string
  deviceType?: number
}

export interface RegisterRequest {
  loginName: string
  nickname: string
  mobile: string
  email: string
  password: string
  deviceId?: string
  deviceType?: number
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UserSession {
  sessionNo: string
  deviceType: number
  deviceId: string
  clientIp: string
  userAgent: string
  lastActiveTime: string
  expireTime: string
  status: number
  current: boolean
}

export interface ProductCategory {
  categoryId: number
  parentId: number
  categoryName: string
  sort: number
}

export interface ProductSkuCard {
  skuId: number
  spuId: number
  categoryId: number
  categoryName: string
  spuName: string
  skuName: string
  salePrice: number
  marketPrice: number
  status: number
  mainImageUrl: string
  sellingPoint: string
}

export interface ProductSkuDetail extends ProductSkuCard {
  brandName: string
  description: string
}

export interface CartItem {
  skuId: number
  skuName: string
  quantity: number
  salePrice: number
}

export interface CartLineItem extends CartItem {
  detail: ProductSkuDetail | null
  subtotal: number
  marketSubtotal: number
}

export interface Address {
  id: number
  userId: number
  consigneeName: string
  consigneeMobile: string
  detailAddress: string
  defaultAddress: boolean
}

export interface AddressDraft {
  consigneeName: string
  consigneeMobile: string
  detailAddress: string
  defaultAddress: boolean
}

export interface UserProfile {
  userId: number
  nickname: string
  mobile: string
  email: string
  status: number
  userRole: string
}

export interface AdminUserSummary {
  totalUsers: number
  adminUsers: number
  memberUsers: number
  activeUsers: number
  totalAddresses: number
}

export interface AdminProductSummary {
  totalCategories: number
  totalSpus: number
  totalSkus: number
  activeSkus: number
  featuredSkus: number
  priceFloor: number
  priceCeiling: number
}

export interface AdminUserListItem {
  userId: number
  loginName: string
  nickname: string
  mobile: string
  email: string
  status: number
  userRole: string
  addressCount: number
}

export type AdminUserDetail = AdminUserListItem

export interface AdminInventoryLowStock {
  skuId: number
  availableQty: number
  lockedQty: number
  saleableQty: number
}

export interface AdminInventoryStock {
  skuId: number
  availableQty: number
  lockedQty: number
  saleableQty: number
}

export interface AdminProductDetail {
  skuId: number
  spuId: number
  categoryId: number
  categoryName: string
  spuName: string
  skuName: string
  brandName: string
  salePrice: number
  marketPrice: number
  status: number
  mainImageUrl: string
  sellingPoint: string
  description: string
  recommendSort: number
}

export interface AdminProductImageUploadResponse {
  fileName: string
  url: string
}

export interface AdminOrderSummary {
  orderNo: string
  userId: number
  orderStatus: number
  payStatus: number
  payAmount: number
  buyerRemark: string
  createTime: string
  itemCount: number
}

export interface OrderItem {
  skuId: number
  skuName: string
  quantity: number
  salePrice: number
  itemAmount: number
}

export interface OrderSummary {
  orderNo: string
  orderStatus: number
  payStatus: number
  payAmount: number
  buyerRemark: string
  createTime: string
  itemCount: number
}

export interface OrderDetail extends Omit<OrderSummary, 'itemCount'> {
  userId: number
  deliveryCompany: string
  deliveryNo: string
  deliveryTime: string | null
  finishTime: string | null
  items: OrderItem[]
}

export interface OrderSubmitItem {
  skuId: number
  quantity: number
}

export interface OrderSubmitPayload {
  idempotencyKey: string
  submitToken: string
  addressId: number
  buyerRemark: string
  items: OrderSubmitItem[]
}

export interface OrderSubmitResponse {
  orderNo: string
  orderStatus: number
  payStatus: number
}

export interface PaymentCreateResponse {
  paymentNo: string
  orderNo: string
  payStatus: number
  payAmount: number
  payUrl: string
}

export interface PaymentSummary {
  paymentNo: string
  orderNo: string
  payChannel: number
  payStatus: number
  payAmount: number
  createTime: string
  payTime: string | null
  closeTime: string | null
}

export interface PaymentDetail extends PaymentSummary {
  userId: number
  thirdTradeNo: string
  closeReason: string
}

export interface CheckoutResult {
  order: OrderSubmitResponse
  payment: PaymentCreateResponse
  paymentDetail: PaymentDetail | null
}
