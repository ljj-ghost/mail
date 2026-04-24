import {
  readStoredSession,
  request,
  withFallback,
  writeStoredSession,
} from './client'
import type {
  Address,
  AddressDraft,
  AdminInventoryLowStock,
  AdminInventoryStock,
  AdminOrderSummary,
  AdminProductDetail,
  AdminProductImageUploadResponse,
  AdminProductSummary,
  AdminUserDetail,
  AdminUserListItem,
  AdminUserSummary,
  CartItem,
  CartLineItem,
  ChangePasswordRequest,
  LoginRequest,
  OrderDetail,
  OrderSubmitPayload,
  OrderSubmitResponse,
  OrderSummary,
  PaymentCreateResponse,
  PaymentDetail,
  PaymentSummary,
  ProductCategory,
  ProductSkuCard,
  ProductSkuDetail,
  RegisterRequest,
  TokenInfo,
  UserProfile,
  UserSession,
} from './types'
import {
  fallbackCatalog,
  fallbackCategories,
  fallbackRecommendations,
  getFallbackProductDetail,
  getFallbackSpuSkus,
} from '../data/fallback'

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      return
    }

    searchParams.set(key, String(value))
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

function filterFallbackCatalog(categoryId?: number, keyword?: string, limit = 12) {
  const normalizedKeyword = keyword?.trim().toLowerCase()

  return fallbackCatalog
    .filter((item) => (categoryId ? item.categoryId === categoryId : true))
    .filter((item) => {
      if (!normalizedKeyword) {
        return true
      }

      const fields = [
        item.spuName,
        item.skuName,
        item.categoryName,
        item.sellingPoint,
      ]
      return fields.some((field) =>
        field.toLowerCase().includes(normalizedKeyword),
      )
    })
    .slice(0, limit)
}

const productDetailCache = new Map<number, ProductSkuDetail>()
const productDetailInFlight = new Map<number, Promise<ProductSkuDetail>>()

function loadProductDetail(skuId: number) {
  const cached = productDetailCache.get(skuId)
  if (cached) {
    return Promise.resolve(cached)
  }

  const inFlight = productDetailInFlight.get(skuId)
  if (inFlight) {
    return inFlight
  }

  const fallback = getFallbackProductDetail(skuId)
  const task = (
    fallback
      ? withFallback(
          () => request<ProductSkuDetail>(`/api/v1/products/sku/${skuId}`),
          fallback,
        )
      : request<ProductSkuDetail>(`/api/v1/products/sku/${skuId}`)
  )
    .then((detail) => {
      productDetailCache.set(skuId, detail)
      productDetailInFlight.delete(skuId)
      return detail
    })
    .catch((error) => {
      productDetailInFlight.delete(skuId)
      throw error
    })

  productDetailInFlight.set(skuId, task)
  return task
}

export const mallApi = {
  loginByPassword(payload: LoginRequest) {
    return request<TokenInfo>('/api/v1/auth/login/password', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  registerByPassword(payload: RegisterRequest) {
    return request<TokenInfo>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  changeCurrentUserPassword(payload: ChangePasswordRequest) {
    return request<boolean>(
      '/api/v1/auth/password',
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      { auth: true },
    )
  },

  async logout() {
    try {
      await request<boolean>(
        '/api/v1/auth/logout',
        {
          method: 'POST',
        },
        {
          auth: true,
          retryOnAuthFailure: false,
        },
      )
    } finally {
      writeStoredSession(null)
    }
  },

  getSessions() {
    return request<UserSession[]>('/api/v1/auth/sessions', undefined, {
      auth: true,
    })
  },

  kickoutSession(sessionNo: string) {
    return request<boolean>(
      `/api/v1/auth/sessions/${sessionNo}`,
      {
        method: 'DELETE',
      },
      { auth: true },
    )
  },

  getCurrentUser() {
    return request<UserProfile>('/api/v1/users/me', undefined, { auth: true })
  },

  getAdminUserSummary() {
    return request<AdminUserSummary>('/api/v1/admin/users/summary', undefined, {
      auth: true,
    })
  },

  getAdminProductSummary() {
    return request<AdminProductSummary>(
      '/api/v1/admin/products/summary',
      undefined,
      {
        auth: true,
      },
    )
  },

  getAdminUsers(limit = 8) {
    return request<AdminUserListItem[]>(
      `/api/v1/admin/users${buildQuery({ limit })}`,
      undefined,
      { auth: true },
    )
  },

  getAdminUser(userId: number) {
    return request<AdminUserDetail>(`/api/v1/admin/users/${userId}`, undefined, {
      auth: true,
    })
  },

  createAdminUser(payload: {
    loginName: string
    nickname: string
    mobile: string
    email: string
    password: string
    userRole: string
    status: number
  }) {
    return request<AdminUserDetail>(
      '/api/v1/admin/users',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      { auth: true },
    )
  },

  updateAdminUser(
    userId: number,
    payload: {
      loginName: string
      nickname: string
      mobile: string
      email: string
      userRole: string
      status: number
    },
  ) {
    return request<AdminUserDetail>(
      `/api/v1/admin/users/${userId}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      { auth: true },
    )
  },

  resetAdminUserPassword(userId: number, password: string) {
    return request<boolean>(
      `/api/v1/admin/users/${userId}/password`,
      {
        method: 'POST',
        body: JSON.stringify({ password }),
      },
      { auth: true },
    )
  },

  deleteAdminUser(userId: number) {
    return request<boolean>(
      `/api/v1/admin/users/${userId}`,
      {
        method: 'DELETE',
      },
      { auth: true },
    )
  },

  getAdminLowStock(threshold = 10) {
    return request<AdminInventoryLowStock[]>(
      `/api/v1/admin/inventory/low-stock${buildQuery({ threshold })}`,
      undefined,
      { auth: true },
    )
  },

  getAdminStock(skuId: number) {
    return request<AdminInventoryStock>(
      `/api/v1/admin/inventory/stock/${skuId}`,
      undefined,
      { auth: true },
    )
  },

  updateAdminStock(skuId: number, availableQty: number) {
    return request<AdminInventoryStock>(
      `/api/v1/admin/inventory/stock/${skuId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ availableQty }),
      },
      { auth: true },
    )
  },

  getAdminProducts(options: { keyword?: string; status?: number; limit?: number } = {}) {
    return request<ProductSkuCard[]>(
      `/api/v1/admin/products${buildQuery({
        keyword: options.keyword,
        status: options.status,
        limit: options.limit ?? 20,
      })}`,
      undefined,
      { auth: true },
    )
  },

  getAdminProduct(skuId: number) {
    return request<AdminProductDetail>(`/api/v1/admin/products/${skuId}`, undefined, {
      auth: true,
    })
  },

  createAdminProduct(payload: {
    categoryId: number
    spuName: string
    skuName: string
    brandName: string
    marketPrice: number
    salePrice: number
    status: number
    mainImageUrl: string
    sellingPoint: string
    description: string
    recommendSort: number
  }) {
    return request<AdminProductDetail>(
      '/api/v1/admin/products',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      { auth: true },
    )
  },

  uploadAdminProductImage(file: File) {
    const body = new FormData()
    body.set('file', file)
    return request<AdminProductImageUploadResponse>(
      '/api/v1/admin/products/image',
      {
        method: 'POST',
        body,
      },
      { auth: true },
    )
  },

  updateAdminProduct(
    skuId: number,
    payload: {
      categoryId: number
      spuName: string
      skuName: string
      brandName: string
      marketPrice: number
      salePrice: number
      status: number
      mainImageUrl: string
      sellingPoint: string
      description: string
      recommendSort: number
    },
  ) {
    return request<AdminProductDetail>(
      `/api/v1/admin/products/${skuId}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      { auth: true },
    )
  },

  deleteAdminProduct(skuId: number) {
    return request<boolean>(
      `/api/v1/admin/products/${skuId}`,
      {
        method: 'DELETE',
      },
      { auth: true },
    )
  },

  updateProfile(payload: Pick<UserProfile, 'nickname' | 'mobile' | 'email'>) {
    return request<UserProfile>(
      '/api/v1/users/profile',
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      { auth: true },
    )
  },

  getAddresses() {
    return request<Address[]>('/api/v1/users/addresses', undefined, {
      auth: true,
    })
  },

  createAddress(payload: AddressDraft) {
    return request<Address>(
      '/api/v1/users/addresses',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      { auth: true },
    )
  },

  updateAddress(addressId: number, payload: AddressDraft) {
    return request<Address>(
      `/api/v1/users/addresses/${addressId}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      { auth: true },
    )
  },

  setDefaultAddress(addressId: number) {
    return request<boolean>(
      `/api/v1/users/addresses/${addressId}/default`,
      {
        method: 'POST',
      },
      { auth: true },
    )
  },

  deleteAddress(addressId: number) {
    return request<boolean>(
      `/api/v1/users/addresses/${addressId}`,
      {
        method: 'DELETE',
      },
      { auth: true },
    )
  },

  getCategories() {
    return withFallback(
      () => request<ProductCategory[]>('/api/v1/products/categories'),
      fallbackCategories,
    )
  },

  getRecommendations(limit = 4) {
    return withFallback(
      () =>
        request<ProductSkuCard[]>(
          `/api/v1/products/recommend${buildQuery({ limit })}`,
        ),
      fallbackRecommendations.slice(0, limit),
    )
  },

  getCatalog(options: {
    categoryId?: number
    keyword?: string
    limit?: number
  }) {
    const limit = options.limit ?? 12
    return withFallback(
      () =>
        request<ProductSkuCard[]>(
          `/api/v1/products${buildQuery({
            categoryId: options.categoryId,
            keyword: options.keyword,
            limit,
          })}`,
        ),
      filterFallbackCatalog(options.categoryId, options.keyword, limit),
    )
  },

  getProductDetail(skuId: number) {
    return loadProductDetail(skuId)
  },

  getSpuSkus(spuId: number) {
    return withFallback(
      () => request<ProductSkuCard[]>(`/api/v1/products/spu/${spuId}/skus`),
      getFallbackSpuSkus(spuId),
    )
  },

  getCartItems() {
    return request<CartItem[]>('/api/v1/cart/items', undefined, { auth: true })
  },

  async getCartItemsDetailed() {
    const items = await mallApi.getCartItems()
    const details = await Promise.all(
      items.map(
        async (item) =>
          [item.skuId, await mallApi.getProductDetail(item.skuId)] as const,
      ),
    )
    const detailMap = new Map(details)

    return items.map<CartLineItem>((item) => {
      const detail = detailMap.get(item.skuId) ?? null
      const subtotal = item.quantity * Number(item.salePrice)
      const marketSubtotal =
        item.quantity * Number(detail?.marketPrice ?? item.salePrice)

      return {
        ...item,
        detail,
        subtotal,
        marketSubtotal,
      }
    })
  },

  addCartItem(skuId: number, quantity: number) {
    return request<boolean>(
      '/api/v1/cart/items',
      {
        method: 'POST',
        body: JSON.stringify({ skuId, quantity }),
      },
      { auth: true },
    )
  },

  deleteCartItem(skuId: number) {
    return request<boolean>(
      `/api/v1/cart/items/${skuId}`,
      {
        method: 'DELETE',
      },
      { auth: true },
    )
  },

  submitOrder(payload: OrderSubmitPayload) {
    return request<OrderSubmitResponse>(
      '/api/v1/orders/submit',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      { auth: true },
    )
  },

  getOrders(status?: number, limit = 10) {
    return request<OrderSummary[]>(
      `/api/v1/orders${buildQuery({ status, limit })}`,
      undefined,
      { auth: true },
    )
  },

  getAdminOrders(options: {
    keyword?: string
    orderStatus?: number
    payStatus?: number
    userId?: number
    limit?: number
  } = {}) {
    return request<AdminOrderSummary[]>(
      `/api/v1/admin/orders${buildQuery({
        keyword: options.keyword,
        orderStatus: options.orderStatus,
        payStatus: options.payStatus,
        userId: options.userId,
        limit: options.limit ?? 20,
      })}`,
      undefined,
      { auth: true },
    )
  },

  getOrderDetail(orderNo: string) {
    return request<OrderDetail>(`/api/v1/orders/${orderNo}`, undefined, {
      auth: true,
    })
  },

  getAdminOrderDetail(orderNo: string) {
    return request<OrderDetail>(`/api/v1/admin/orders/${orderNo}`, undefined, {
      auth: true,
    })
  },

  createAdminOrder(payload: {
    userId: number
    buyerRemark: string
    items: Array<{ skuId: number; quantity: number }>
  }) {
    return request<OrderDetail>(
      '/api/v1/admin/orders',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      { auth: true },
    )
  },

  updateAdminOrder(
    orderNo: string,
    payload: {
      buyerRemark?: string
      orderStatus?: number
      payStatus?: number
      payChannel?: number
      deliveryCompany?: string
      deliveryNo?: string
    },
  ) {
    return request<OrderDetail>(
      `/api/v1/admin/orders/${orderNo}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      { auth: true },
    )
  },

  deleteAdminOrder(orderNo: string) {
    return request<boolean>(
      `/api/v1/admin/orders/${orderNo}`,
      {
        method: 'DELETE',
      },
      { auth: true },
    )
  },

  cancelOrder(orderNo: string) {
    return request<boolean>(
      `/api/v1/orders/${orderNo}/cancel`,
      {
        method: 'POST',
      },
      { auth: true },
    )
  },

  deleteOrder(orderNo: string) {
    return request<boolean>(
      `/api/v1/orders/${orderNo}`,
      {
        method: 'DELETE',
      },
      { auth: true },
    )
  },

  confirmOrderReceipt(orderNo: string) {
    return request<boolean>(
      `/api/v1/orders/${orderNo}/confirm-receipt`,
      {
        method: 'POST',
      },
      { auth: true },
    )
  },

  createPayment(orderNo: string, payChannel: number) {
    return request<PaymentCreateResponse>(
      '/api/v1/payments/create',
      {
        method: 'POST',
        body: JSON.stringify({ orderNo, payChannel }),
      },
      { auth: true },
    )
  },

  getPayments(status?: number, limit = 10) {
    return request<PaymentSummary[]>(
      `/api/v1/payments${buildQuery({ status, limit })}`,
      undefined,
      { auth: true },
    )
  },

  getPaymentDetail(paymentNo: string) {
    return request<PaymentDetail>(`/api/v1/payments/${paymentNo}`, undefined, {
      auth: true,
    })
  },

  mockPaymentSuccess(paymentNo: string) {
    return request<PaymentDetail>(
      `/api/v1/payments/mock/success/${paymentNo}`,
      {
        method: 'POST',
        body: JSON.stringify({ thirdTradeNo: '' }),
      },
      { auth: true },
    )
  },

  getViewerNickname() {
    return readStoredSession()?.nickname ?? '访客'
  },
}
