import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { mallApi } from '../api/mallApi'
import type {
  AdminInventoryLowStock,
  AdminInventoryStock,
  AdminOrderSummary,
  AdminProductDetail,
  AdminUserListItem,
  OrderDetail,
  ProductCategory,
  ProductSkuCard,
} from '../api/types'
import {
  LoadingScreen,
  MaterialIcon,
  MessageCard,
  StatusPill,
} from '../components/PageBits'
import { useAuth } from '../context/AuthContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
  formatDateTime,
  formatMoney,
  getOrderStatusMeta,
  getRoleLabel,
  getUserStatusLabel,
  sumBy,
  type Tone,
} from '../lib/format'
import { getProductImage } from '../lib/productVisuals'

const tabs = [
  ['overview', '概览', 'dashboard'],
  ['products', '商品', 'inventory_2'],
  ['orders', '订单', 'shopping_cart'],
  ['users', '用户', 'group'],
] as const

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400'
const selectClass = inputClass
const textareaClass = `${inputClass} min-h-[120px] resize-y`
const primaryButtonClass =
  'inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
const iconButtonClass =
  'inline-flex h-10 w-24 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50'
const listSectionClass =
  'rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] md:flex md:h-[calc(100vh-11rem)] md:min-h-0 md:flex-col'
const tableFrameClass = 'mt-6 min-h-0 flex-1 overflow-hidden rounded-3xl border border-slate-200'
const tableScrollClass = 'h-full min-h-0 overflow-x-auto overflow-y-auto'
const tableActionStackClass = 'flex flex-col items-end justify-end gap-2'
const deliveryCompanyOptions = [
  '顺丰速运',
  '京东快递',
  '中通快递',
  '圆通速递',
  '申通快递',
  '韵达速递',
  '极兔速递',
  '邮政EMS',
  '德邦快递',
  '菜鸟速递',
] as const
const customDeliveryCompanyOption = '__CUSTOM__'

type AdminTab = (typeof tabs)[number][0]
type Feedback = { tone: 'success' | 'danger'; text: string } | null
type ProductEditorMode = 'create' | 'edit'
type UserEditorMode = 'create' | 'edit'
type OrderEditorMode = 'create' | 'edit'

interface DashboardData {
  userSummary: Awaited<ReturnType<typeof mallApi.getAdminUserSummary>>
  productSummary: Awaited<ReturnType<typeof mallApi.getAdminProductSummary>>
  users: AdminUserListItem[]
  products: ProductSkuCard[]
  lowStock: AdminInventoryLowStock[]
  orders: AdminOrderSummary[]
  categories: ProductCategory[]
  stockMap: Record<number, AdminInventoryStock>
  orderDetails: Record<string, OrderDetail | null>
}

interface ProductDraft {
  categoryId: string
  spuName: string
  skuName: string
  brandName: string
  marketPrice: string
  salePrice: string
  status: string
  mainImageUrl: string
  sellingPoint: string
  description: string
  recommendSort: string
  availableQty: string
}

interface UserDraft {
  loginName: string
  nickname: string
  mobile: string
  email: string
  userRole: string
  status: string
  password: string
}

interface OrderDraftItem {
  skuId: string
  quantity: string
  skuName?: string
}

interface OrderDraft {
  userId: string
  buyerRemark: string
  statusAction: 'KEEP' | 'PAID' | 'SHIPPED' | 'CANCELLED'
  payChannel: string
  deliveryCompany: string
  deliveryNo: string
  currentOrderStatus: number
  currentPayStatus: number
  items: OrderDraftItem[]
}

function resolveTab(value: string | null): AdminTab {
  return tabs.some(([key]) => key === value) ? (value as AdminTab) : 'overview'
}

function getProductStatusMeta(status: number): { label: string; tone: Tone } {
  if (status === 1) {
    return { label: '已上架', tone: 'success' }
  }

  return { label: '已下架', tone: 'warning' }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '操作失败，请稍后再试'
}

function createEmptyProductDraft(categories: ProductCategory[]): ProductDraft {
  return {
    categoryId: categories[0] ? String(categories[0].categoryId) : '',
    spuName: '',
    skuName: '',
    brandName: '',
    marketPrice: '',
    salePrice: '',
    status: '1',
    mainImageUrl: '',
    sellingPoint: '',
    description: '',
    recommendSort: '0',
    availableQty: '0',
  }
}

function createProductDraft(detail: AdminProductDetail, stock?: AdminInventoryStock): ProductDraft {
  return {
    categoryId: String(detail.categoryId),
    spuName: detail.spuName,
    skuName: detail.skuName,
    brandName: detail.brandName,
    marketPrice: String(detail.marketPrice ?? 0),
    salePrice: String(detail.salePrice ?? 0),
    status: String(detail.status ?? 1),
    mainImageUrl: detail.mainImageUrl ?? '',
    sellingPoint: detail.sellingPoint ?? '',
    description: detail.description ?? '',
    recommendSort: String(detail.recommendSort ?? 0),
    availableQty: String(stock?.availableQty ?? 0),
  }
}

function createEmptyUserDraft(): UserDraft {
  return {
    loginName: '',
    nickname: '',
    mobile: '',
    email: '',
    userRole: 'USER',
    status: '1',
    password: '123456',
  }
}

function createUserDraft(user: AdminUserListItem): UserDraft {
  return {
    loginName: user.loginName,
    nickname: user.nickname,
    mobile: user.mobile,
    email: user.email,
    userRole: user.userRole,
    status: String(user.status),
    password: '',
  }
}

function createEmptyOrderDraft(users: AdminUserListItem[]): OrderDraft {
  return {
    userId: users[0] ? String(users[0].userId) : '',
    buyerRemark: '',
    statusAction: 'KEEP',
    payChannel: '1',
    deliveryCompany: '',
    deliveryNo: '',
    currentOrderStatus: 10,
    currentPayStatus: 0,
    items: [{ skuId: '', quantity: '1' }],
  }
}

function createOrderEditDraft(detail: OrderDetail): OrderDraft {
  return {
    userId: String(detail.userId),
    buyerRemark: detail.buyerRemark ?? '',
    statusAction: 'KEEP',
    payChannel: '1',
    deliveryCompany: detail.deliveryCompany ?? '',
    deliveryNo: detail.deliveryNo ?? '',
    currentOrderStatus: detail.orderStatus,
    currentPayStatus: detail.payStatus,
    items: detail.items.map((item) => ({
      skuId: String(item.skuId),
      quantity: String(item.quantity),
      skuName: item.skuName,
    })),
  }
}

function getEditableOrderActions(orderDraft: OrderDraft) {
  const options: Array<{ value: OrderDraft['statusAction']; label: string }> = [
    { value: 'KEEP', label: '仅保存备注' },
  ]

  if (orderDraft.currentOrderStatus === 10 && orderDraft.currentPayStatus === 0) {
    options.push(
      { value: 'PAID', label: '标记已支付' },
      { value: 'CANCELLED', label: '取消订单' },
    )
  }

  if (
    (orderDraft.currentOrderStatus === 20 || orderDraft.currentOrderStatus === 30) &&
    orderDraft.currentPayStatus === 2
  ) {
    options.push({
      value: 'SHIPPED',
      label: orderDraft.currentOrderStatus === 30 ? '更新物流信息' : '模拟发货',
    })
  }

  return options
}

function getDeliveryCompanySelectValue(deliveryCompany: string) {
  const normalized = deliveryCompany.trim()
  if (!normalized) {
    return ''
  }

  return deliveryCompanyOptions.includes(normalized as (typeof deliveryCompanyOptions)[number])
    ? normalized
    : customDeliveryCompanyOption
}

function ProductStockHint({
  product,
  stock,
}: {
  product: ProductSkuCard
  stock?: AdminInventoryStock
}) {
  const meta = getProductStatusMeta(product.status)
  return (
    <div className="space-y-1">
      <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
      <p className="text-xs text-slate-500">
        可售库存 {stock?.saleableQty ?? 0}，锁定 {stock?.lockedQty ?? 0}
      </p>
    </div>
  )
}

export function AdminPage() {
  useDocumentTitle('馆长后台管理系统')

  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = resolveTab(searchParams.get('tab'))
  const { isAuthenticated, profile, session } = useAuth()
  const role = profile?.userRole ?? session?.userRole

  const [feedback, setFeedback] = useState<Feedback>(null)

  const [productKeyword, setProductKeyword] = useState('')
  const [productStatusFilter, setProductStatusFilter] = useState('all')
  const [productEditorMode, setProductEditorMode] = useState<ProductEditorMode>('create')
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [productEditorOpen, setProductEditorOpen] = useState(false)
  const [productDraft, setProductDraft] = useState<ProductDraft>(createEmptyProductDraft([]))
  const [productSaving, setProductSaving] = useState(false)
  const [productImageUploading, setProductImageUploading] = useState(false)

  const [userKeyword, setUserKeyword] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userStatusFilter, setUserStatusFilter] = useState('all')
  const [userEditorMode, setUserEditorMode] = useState<UserEditorMode>('create')
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [userEditorOpen, setUserEditorOpen] = useState(false)
  const [userDraft, setUserDraft] = useState<UserDraft>(createEmptyUserDraft())
  const [userSaving, setUserSaving] = useState(false)

  const [orderKeyword, setOrderKeyword] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [orderPayFilter, setOrderPayFilter] = useState('all')
  const [orderEditorMode, setOrderEditorMode] = useState<OrderEditorMode>('create')
  const [editingOrderNo, setEditingOrderNo] = useState<string | null>(null)
  const [orderEditorOpen, setOrderEditorOpen] = useState(false)
  const [orderDraft, setOrderDraft] = useState<OrderDraft>(createEmptyOrderDraft([]))
  const [orderSaving, setOrderSaving] = useState(false)
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false)

  const state = useAsyncData<DashboardData>(
    async () => {
      const [userSummary, productSummary, users, products, lowStock, orders, categories] =
        await Promise.all([
          mallApi.getAdminUserSummary(),
          mallApi.getAdminProductSummary(),
          mallApi.getAdminUsers(50),
          mallApi.getAdminProducts({ limit: 50 }),
          mallApi.getAdminLowStock(12),
          mallApi.getAdminOrders({ limit: 40 }),
          mallApi.getCategories(),
        ])

      const [stockEntries, detailEntries] = await Promise.all([
        Promise.all(
          products.map(async (product) => {
            try {
              return [product.skuId, await mallApi.getAdminStock(product.skuId)] as const
            } catch {
              return [
                product.skuId,
                {
                  skuId: product.skuId,
                  availableQty: 0,
                  lockedQty: 0,
                  saleableQty: 0,
                } satisfies AdminInventoryStock,
              ] as const
            }
          }),
        ),
        Promise.all(
          orders.map(async (order) => {
            try {
              return [order.orderNo, await mallApi.getAdminOrderDetail(order.orderNo)] as const
            } catch {
              return [order.orderNo, null] as const
            }
          }),
        ),
      ])

      return {
        userSummary,
        productSummary,
        users,
        products,
        lowStock,
        orders,
        categories,
        stockMap: Object.fromEntries(stockEntries),
        orderDetails: Object.fromEntries(detailEntries),
      }
    },
    [session?.userId ?? 0],
    { enabled: isAuthenticated && role === 'ADMIN' },
  )

  if (!isAuthenticated) {
    return (
      <MessageCard
        title="需要管理员登录"
        description="后台管理页仅对管理员账号开放，请先使用管理员账号登录。"
        actionLabel="去登录"
        actionHref="/auth?portal=admin&mode=login&redirect=%2Fadmin"
      />
    )
  }

  if (role !== 'ADMIN') {
    return (
      <MessageCard
        title="当前账号没有后台权限"
        description="请切换为管理员账号后再进入后台，普通会员账号仅可访问个人中心。"
        actionLabel="返回个人中心"
        actionHref="/account/profile"
      />
    )
  }

  if (!state.data && state.loading) {
    return <LoadingScreen label="正在加载后台管理数据" />
  }

  if (!state.data) {
    return (
      <MessageCard
        title="后台数据暂时不可用"
        description="用户、商品、库存或订单服务没有成功返回数据，请确认后端服务已经启动。"
        actionLabel="返回首页"
        actionHref="/"
      />
    )
  }

  const data = state.data
  const lowStockSet = new Set(data.products.map((item) => item.skuId))
  const validLowStockCount = data.lowStock.filter((item) => lowStockSet.has(item.skuId)).length
  const revenue = sumBy(
    data.orders.filter((item) => item.payStatus === 2),
    (item) => Number(item.payAmount),
  )

  const productStatusValue = productStatusFilter === 'all' ? null : Number(productStatusFilter)
  const visibleProducts = data.products.filter((product) => {
    const matchesKeyword =
      !productKeyword.trim() ||
      [product.skuName, product.spuName, product.categoryName]
        .join(' ')
        .toLowerCase()
        .includes(productKeyword.trim().toLowerCase())
    const matchesStatus = productStatusValue === null || product.status === productStatusValue
    return matchesKeyword && matchesStatus
  })

  const visibleUsers = data.users.filter((user) => {
    const matchesKeyword =
      !userKeyword.trim() ||
      [user.loginName, user.nickname, user.mobile, user.email]
        .join(' ')
        .toLowerCase()
        .includes(userKeyword.trim().toLowerCase())
    const matchesRole = userRoleFilter === 'all' || user.userRole === userRoleFilter
    const matchesStatus =
      userStatusFilter === 'all' || String(user.status) === userStatusFilter
    return matchesKeyword && matchesRole && matchesStatus
  })

  const visibleOrders = data.orders.filter((order) => {
    const detail = data.orderDetails[order.orderNo]
    const firstItem = detail?.items[0]?.skuName ?? ''
    const matchesKeyword =
      !orderKeyword.trim() ||
      [order.orderNo, order.userId, order.buyerRemark, firstItem]
        .join(' ')
        .toLowerCase()
        .includes(orderKeyword.trim().toLowerCase())
    const matchesStatus =
      orderStatusFilter === 'all' || String(order.orderStatus) === orderStatusFilter
    const matchesPay = orderPayFilter === 'all' || String(order.payStatus) === orderPayFilter
    return matchesKeyword && matchesStatus && matchesPay
  })

  const topCards = [
    ['实收金额', formatMoney(revenue), 'payments'],
    ['订单总数', `${data.orders.length}`, 'shopping_bag'],
    ['用户数', `${data.userSummary.totalUsers}`, 'group'],
    ['库存预警', `${validLowStockCount}`, 'warning'],
  ] as const

  const switchTab = (tab: AdminTab) => setSearchParams(new URLSearchParams({ tab }))

  const resetProductEditor = () => {
    setEditingProductId(null)
    setProductEditorMode('create')
    setProductDraft(createEmptyProductDraft(data.categories))
    setProductEditorOpen(false)
  }

  const resetUserEditor = () => {
    setEditingUserId(null)
    setUserEditorMode('create')
    setUserDraft(createEmptyUserDraft())
    setUserEditorOpen(false)
  }

  const resetOrderEditor = () => {
    setEditingOrderNo(null)
    setOrderEditorMode('create')
    setOrderDraft(createEmptyOrderDraft(data.users))
    setOrderEditorOpen(false)
    setShippingDialogOpen(false)
  }

  const openCreateProduct = () => {
    setProductEditorMode('create')
    setEditingProductId(null)
    setProductDraft(createEmptyProductDraft(data.categories))
    setProductEditorOpen(true)
    setFeedback(null)
  }

  const openEditProduct = async (skuId: number) => {
    try {
      const [detail, stock] = await Promise.all([
        mallApi.getAdminProduct(skuId),
        mallApi.getAdminStock(skuId),
      ])
      setProductEditorMode('edit')
      setEditingProductId(skuId)
      setProductDraft(createProductDraft(detail, stock))
      setProductEditorOpen(true)
      setFeedback(null)
    } catch (error) {
      setFeedback({ tone: 'danger', text: getErrorMessage(error) })
    }
  }

  const handleProductImageUpload = async (file: File | null) => {
    if (!file) {
      return
    }

    try {
      setProductImageUploading(true)
      const uploaded = await mallApi.uploadAdminProductImage(file)
      setProductDraft((current) => ({
        ...current,
        mainImageUrl: uploaded.url,
      }))
      setFeedback({ tone: 'success', text: '商品图片已上传，可直接保存商品。' })
    } catch (error) {
      setFeedback({ tone: 'danger', text: getErrorMessage(error) })
    } finally {
      setProductImageUploading(false)
    }
  }

  const saveProduct = async () => {
    const categoryId = Number(productDraft.categoryId)
    const marketPrice = Number(productDraft.marketPrice)
    const salePrice = Number(productDraft.salePrice)
    const status = Number(productDraft.status)
    const recommendSort = Number(productDraft.recommendSort || 0)
    const availableQty = Number(productDraft.availableQty || 0)

    if (!categoryId || !productDraft.spuName.trim() || !productDraft.skuName.trim()) {
      setFeedback({ tone: 'danger', text: '请先补全商品分类、SPU 名称和 SKU 名称。' })
      return
    }

    if (Number.isNaN(marketPrice) || Number.isNaN(salePrice) || marketPrice < 0 || salePrice < 0) {
      setFeedback({ tone: 'danger', text: '商品价格必须是大于等于 0 的数字。' })
      return
    }

    if (Number.isNaN(availableQty) || availableQty < 0) {
      setFeedback({ tone: 'danger', text: '库存必须是大于等于 0 的整数。' })
      return
    }

    setProductSaving(true)
    try {
      const payload = {
        categoryId,
        spuName: productDraft.spuName.trim(),
        skuName: productDraft.skuName.trim(),
        brandName: productDraft.brandName.trim(),
        marketPrice,
        salePrice,
        status,
        mainImageUrl: productDraft.mainImageUrl.trim(),
        sellingPoint: productDraft.sellingPoint.trim(),
        description: productDraft.description.trim(),
        recommendSort,
      }

      const saved =
        productEditorMode === 'edit' && editingProductId
          ? await mallApi.updateAdminProduct(editingProductId, payload)
          : await mallApi.createAdminProduct(payload)

      try {
        await mallApi.updateAdminStock(saved.skuId, availableQty)
        setFeedback({
          tone: 'success',
          text: productEditorMode === 'edit' ? '商品信息已更新。' : '商品已创建并写入库存。',
        })
      } catch (stockError) {
        setFeedback({
          tone: 'danger',
          text: `商品信息已保存，但库存更新失败：${getErrorMessage(stockError)}`,
        })
      }

      resetProductEditor()
      state.reload()
    } catch (error) {
      setFeedback({ tone: 'danger', text: getErrorMessage(error) })
    } finally {
      setProductSaving(false)
    }
  }

  const toggleProductStatus = async (skuId: number) => {
    try {
      const detail = await mallApi.getAdminProduct(skuId)
      await mallApi.updateAdminProduct(skuId, {
        categoryId: detail.categoryId,
        spuName: detail.spuName,
        skuName: detail.skuName,
        brandName: detail.brandName,
        marketPrice: Number(detail.marketPrice),
        salePrice: Number(detail.salePrice),
        status: detail.status === 1 ? 0 : 1,
        mainImageUrl: detail.mainImageUrl,
        sellingPoint: detail.sellingPoint,
        description: detail.description,
        recommendSort: detail.recommendSort,
      })
      setFeedback({
        tone: 'success',
        text: detail.status === 1 ? '商品已下架。' : '商品已重新上架。',
      })
      state.reload()
    } catch (error) {
      setFeedback({ tone: 'danger', text: getErrorMessage(error) })
    }
  }

  const deleteProduct = async (skuId: number, skuName: string) => {
    if (!window.confirm(`确认删除商品“${skuName}”？删除后商品会从商城端隐藏。`)) {
      return
    }
    try {
      await mallApi.deleteAdminProduct(skuId)
      setFeedback({ tone: 'success', text: '商品已删除。' })
      if (editingProductId === skuId) {
        resetProductEditor()
      }
      state.reload()
    } catch (error) {
      setFeedback({ tone: 'danger', text: getErrorMessage(error) })
    }
  }

  const openCreateUser = () => {
    setUserEditorMode('create')
    setEditingUserId(null)
    setUserDraft(createEmptyUserDraft())
    setUserEditorOpen(true)
    setFeedback(null)
  }

  const openEditUser = (user: AdminUserListItem) => {
    setUserEditorMode('edit')
    setEditingUserId(user.userId)
    setUserDraft(createUserDraft(user))
    setUserEditorOpen(true)
    setFeedback(null)
  }

  const saveUser = async () => {
    if (!userDraft.loginName.trim() || !userDraft.nickname.trim()) {
      setFeedback({ tone: 'danger', text: '请先补全登录账号和用户昵称。' })
      return
    }

    setUserSaving(true)
    try {
      if (userEditorMode === 'edit' && editingUserId) {
        await mallApi.updateAdminUser(editingUserId, {
          loginName: userDraft.loginName.trim(),
          nickname: userDraft.nickname.trim(),
          mobile: userDraft.mobile.trim(),
          email: userDraft.email.trim(),
          userRole: userDraft.userRole,
          status: Number(userDraft.status),
        })
        setFeedback({ tone: 'success', text: '用户账号已更新。' })
      } else {
        await mallApi.createAdminUser({
          loginName: userDraft.loginName.trim(),
          nickname: userDraft.nickname.trim(),
          mobile: userDraft.mobile.trim(),
          email: userDraft.email.trim(),
          password: userDraft.password.trim(),
          userRole: userDraft.userRole,
          status: Number(userDraft.status),
        })
        setFeedback({ tone: 'success', text: '新用户账号已创建。' })
      }
      resetUserEditor()
      state.reload()
    } catch (error) {
      setFeedback({ tone: 'danger', text: getErrorMessage(error) })
    } finally {
      setUserSaving(false)
    }
  }

  const toggleUserStatus = async (user: AdminUserListItem) => {
    try {
      await mallApi.updateAdminUser(user.userId, {
        loginName: user.loginName,
        nickname: user.nickname,
        mobile: user.mobile,
        email: user.email,
        userRole: user.userRole,
        status: user.status === 1 ? 0 : 1,
      })
      setFeedback({
        tone: 'success',
        text: user.status === 1 ? '用户已停用。' : '用户已重新启用。',
      })
      state.reload()
    } catch (error) {
      setFeedback({ tone: 'danger', text: getErrorMessage(error) })
    }
  }

  const resetPassword = async (user: AdminUserListItem) => {
    const password = window.prompt(`为账号 ${user.loginName} 设置新的登录密码`, '123456')
    if (!password) {
      return
    }
    try {
      await mallApi.resetAdminUserPassword(user.userId, password)
      setFeedback({ tone: 'success', text: `账号 ${user.loginName} 的密码已重置。` })
    } catch (error) {
      setFeedback({ tone: 'danger', text: getErrorMessage(error) })
    }
  }

  const deleteUser = async (user: AdminUserListItem) => {
    if (!window.confirm(`确认删除账号 ${user.loginName}？删除后该账号将无法继续登录。`)) {
      return
    }
    try {
      await mallApi.deleteAdminUser(user.userId)
      setFeedback({ tone: 'success', text: '用户账号已删除。' })
      if (editingUserId === user.userId) {
        resetUserEditor()
      }
      state.reload()
    } catch (error) {
      setFeedback({ tone: 'danger', text: getErrorMessage(error) })
    }
  }

  const openCreateOrder = () => {
    setOrderEditorMode('create')
    setEditingOrderNo(null)
    setOrderDraft(createEmptyOrderDraft(data.users))
    setOrderEditorOpen(true)
    setShippingDialogOpen(false)
    setFeedback(null)
  }

  const openEditOrder = async (orderNo: string) => {
    try {
      const detail = await mallApi.getAdminOrderDetail(orderNo)
      setOrderEditorMode('edit')
      setEditingOrderNo(orderNo)
      setOrderDraft(createOrderEditDraft(detail))
      setOrderEditorOpen(true)
      setShippingDialogOpen(false)
      setFeedback(null)
    } catch (error) {
      setFeedback({ tone: 'danger', text: getErrorMessage(error) })
    }
  }

  const openShipOrder = async (orderNo: string) => {
    try {
      const detail = await mallApi.getAdminOrderDetail(orderNo)
      setOrderEditorMode('edit')
      setEditingOrderNo(orderNo)
      setOrderDraft({
        ...createOrderEditDraft(detail),
        statusAction: 'SHIPPED',
      })
      setOrderEditorOpen(true)
      setShippingDialogOpen(true)
      setFeedback(null)
    } catch (error) {
      setFeedback({ tone: 'danger', text: getErrorMessage(error) })
    }
  }

  const confirmShippingDraft = () => {
    if (!orderDraft.deliveryCompany.trim() || !orderDraft.deliveryNo.trim()) {
      setFeedback({ tone: 'danger', text: '请先填写物流公司和运单号。' })
      return
    }

    setShippingDialogOpen(false)
  }

  const saveOrder = async () => {
    setOrderSaving(true)
    try {
      if (orderEditorMode === 'edit' && editingOrderNo) {
        const payload: {
          buyerRemark?: string
          orderStatus?: number
          payStatus?: number
          payChannel?: number
          deliveryCompany?: string
          deliveryNo?: string
        } = {
          buyerRemark: orderDraft.buyerRemark.trim(),
        }
        if (orderDraft.statusAction === 'PAID') {
          payload.orderStatus = 20
          payload.payStatus = 2
          payload.payChannel = Number(orderDraft.payChannel || 1)
        }
        if (orderDraft.statusAction === 'SHIPPED') {
          if (!orderDraft.deliveryCompany.trim() || !orderDraft.deliveryNo.trim()) {
            setFeedback({ tone: 'danger', text: '请先填写物流公司和运单号。' })
            setShippingDialogOpen(true)
            return
          }
          payload.orderStatus = 30
          payload.deliveryCompany = orderDraft.deliveryCompany.trim()
          payload.deliveryNo = orderDraft.deliveryNo.trim()
        }
        if (orderDraft.statusAction === 'CANCELLED') {
          payload.orderStatus = 50
        }
        await mallApi.updateAdminOrder(editingOrderNo, payload)
        setFeedback({
          tone: 'success',
          text:
            orderDraft.statusAction === 'SHIPPED'
              ? '订单已发货，物流信息已保存。'
              : '订单信息已更新。',
        })
      } else {
        const userId = Number(orderDraft.userId)
        const itemMap = new Map<number, number>()
        for (const item of orderDraft.items) {
          const skuId = Number(item.skuId)
          const quantity = Number(item.quantity)
          if (!skuId || !quantity || quantity < 1) {
            continue
          }
          itemMap.set(skuId, (itemMap.get(skuId) ?? 0) + quantity)
        }
        const items = Array.from(itemMap.entries()).map(([skuId, quantity]) => ({
          skuId,
          quantity,
        }))
        if (!userId || !items.length) {
          setFeedback({ tone: 'danger', text: '请先选择用户并至少添加一个有效商品。' })
          return
        }
        await mallApi.createAdminOrder({
          userId,
          buyerRemark: orderDraft.buyerRemark.trim(),
          items,
        })
        setFeedback({ tone: 'success', text: '订单已补录。' })
      }
      resetOrderEditor()
      state.reload()
    } catch (error) {
      setFeedback({ tone: 'danger', text: getErrorMessage(error) })
    } finally {
      setOrderSaving(false)
    }
  }

  const deleteOrder = async (orderNo: string) => {
    if (!window.confirm(`确认删除订单 ${orderNo}？删除后该订单不会再出现在后台列表。`)) {
      return
    }
    try {
      await mallApi.deleteAdminOrder(orderNo)
      setFeedback({ tone: 'success', text: '订单已删除。' })
      if (editingOrderNo === orderNo) {
        resetOrderEditor()
      }
      state.reload()
    } catch (error) {
      setFeedback({ tone: 'danger', text: getErrorMessage(error) })
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f7f4] text-slate-900">
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-white/10 bg-[#121212] px-7 py-8">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#cbe7f5] text-[#29434e]">
            <MaterialIcon className="text-lg" fill name="museum" />
          </div>
          <div>
            <h1 className="font-['Manrope'] text-xl font-extrabold tracking-tight text-white">
              馆长后台
            </h1>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
              Admin Console
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map(([key, label, icon]) => (
            <button
              key={key}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                activeTab === key
                  ? 'bg-white text-slate-900'
                  : 'text-slate-300 hover:bg-white/8 hover:text-white'
              }`}
              type="button"
              onClick={() => switchTab(key)}
            >
              <MaterialIcon className="text-base" fill={activeTab === key} name={icon} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 text-slate-300">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">当前账号</p>
          <p className="mt-3 text-sm font-semibold text-white">
            {profile?.nickname ?? session?.nickname}
          </p>
          <p className="mt-1 text-sm text-slate-400">{getRoleLabel(role)}</p>
          <Link
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:opacity-90"
            to="/"
          >
            返回商城
          </Link>
        </div>
      </aside>

      <main className="ml-72 min-h-screen">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-[#f6f7f4]/90 px-10 py-6 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Management Suite
            </p>
            <h2 className="mt-2 font-['Manrope'] text-3xl font-extrabold tracking-tight text-slate-900">
              {activeTab === 'overview'
                ? '运营概览'
                : activeTab === 'products'
                  ? '商品管理'
                  : activeTab === 'orders'
                    ? '订单管理'
                    : '用户管理'}
            </h2>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
            <MaterialIcon className="text-slate-400" name="verified_user" />
            <span>管理员控制台</span>
          </div>
        </header>

        <div className="space-y-8 px-10 pb-10 pt-8">
          {feedback ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                feedback.tone === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {feedback.text}
            </div>
          ) : null}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {topCards.map(([label, value, icon]) => (
              <div
                key={label}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <MaterialIcon className="text-lg" fill name={icon} />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">实时</span>
                </div>
                <p className="mt-5 text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
                <h3 className="mt-2 font-['Manrope'] text-3xl font-extrabold tracking-tight text-slate-900">
                  {value}
                </h3>
              </div>
            ))}
          </section>

          {activeTab === 'overview' ? (
            <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
              <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-['Manrope'] text-xl font-extrabold text-slate-900">
                      最近订单
                    </h3>
                  </div>
                  <button
                    className={secondaryButtonClass}
                    type="button"
                    onClick={() => switchTab('orders')}
                  >
                    查看订单
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  {data.orders.slice(0, 5).map((order) => {
                    const status = getOrderStatusMeta(order.orderStatus, order.payStatus)
                    const firstItem = data.orderDetails[order.orderNo]?.items[0]?.skuName ?? '待补充商品信息'
                    return (
                      <button
                        key={order.orderNo}
                        className="flex w-full items-center justify-between rounded-3xl border border-slate-200 px-5 py-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                        type="button"
                        onClick={() => {
                          switchTab('orders')
                          void openEditOrder(order.orderNo)
                        }}
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{order.orderNo}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            用户 #{order.userId} · {firstItem}
                          </p>
                        </div>
                        <div className="text-right">
                          <StatusPill tone={status.tone}>{status.label}</StatusPill>
                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {formatMoney(order.payAmount)}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="space-y-6">
                <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                  <h3 className="font-['Manrope'] text-xl font-extrabold text-slate-900">
                    快捷操作
                  </h3>
                  <div className="mt-6 grid gap-3">
                    {[
                      {
                        icon: 'add_circle',
                        label: '新增商品',
                        handler: () => {
                          switchTab('products')
                          openCreateProduct()
                        },
                      },
                      {
                        icon: 'shopping_cart',
                        label: '补录订单',
                        handler: () => {
                          switchTab('orders')
                          openCreateOrder()
                        },
                      },
                      {
                        icon: 'group',
                        label: '新增账号',
                        handler: () => {
                          switchTab('users')
                          openCreateUser()
                        },
                      },
                    ].map(({ icon, label, handler }) => (
                      <button
                        key={label}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        type="button"
                        onClick={handler}
                      >
                        <span className="flex items-center gap-3">
                          <MaterialIcon className="text-base text-slate-500" name={icon} />
                          {label}
                        </span>
                        <MaterialIcon className="text-sm text-slate-400" name="arrow_forward" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                  <h3 className="font-['Manrope'] text-xl font-extrabold text-slate-900">
                    库存预警
                  </h3>
                  <div className="mt-6 space-y-3">
                    {data.lowStock.filter((item) => lowStockSet.has(item.skuId)).slice(0, 4).map((item) => (
                      <div
                        key={item.skuId}
                        className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-slate-900">SKU #{item.skuId}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          可售 {item.saleableQty}，可用 {item.availableQty}，锁定 {item.lockedQty}
                        </p>
                      </div>
                    ))}
                    {!data.lowStock.filter((item) => lowStockSet.has(item.skuId)).length ? (
                      <p className="text-sm text-slate-500">当前没有命中的库存预警商品。</p>
                    ) : null}
                  </div>
                </div>
              </section>
            </div>
          ) : null}

          {activeTab === 'products' ? (
            <div className="grid gap-8 xl:grid-cols-[1.5fr_0.9fr] xl:items-start">
              <section className={listSectionClass}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="font-['Manrope'] text-xl font-extrabold text-slate-900">
                      商品列表
                    </h3>
                  </div>
                  <button className={primaryButtonClass} type="button" onClick={openCreateProduct}>
                    新增商品
                  </button>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-[1fr_180px]">
                  <input
                    className={inputClass}
                    placeholder="搜索商品名称、分类或 SPU"
                    value={productKeyword}
                    onChange={(event) => setProductKeyword(event.target.value)}
                  />
                  <select
                    className={selectClass}
                    value={productStatusFilter}
                    onChange={(event) => setProductStatusFilter(event.target.value)}
                  >
                    <option value="all">全部状态</option>
                    <option value="1">已上架</option>
                    <option value="0">已下架</option>
                  </select>
                </div>

                <div className={tableFrameClass}>
                  <div className={tableScrollClass}>
                    <table className="min-w-full text-left text-sm">
                      <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
                        <tr>
                          <th className="px-5 py-4">商品</th>
                          <th className="px-5 py-4">价格</th>
                          <th className="px-5 py-4">库存</th>
                          <th className="px-5 py-4">状态</th>
                          <th className="px-5 py-4 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {visibleProducts.map((product, index) => (
                          <tr key={product.skuId} className="align-top">
                            <td className="px-5 py-5">
                              <div className="flex items-center gap-4">
                                <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
                                  <img
                                    className="h-full w-full object-cover"
                                    src={getProductImage(product.mainImageUrl, index)}
                                    alt={product.skuName}
                                  />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">{product.skuName}</p>
                                  <p className="mt-1 text-sm text-slate-500">
                                    {product.spuName} · #{product.skuId}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-500">{product.categoryName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-5">
                              <p className="font-semibold text-slate-900">
                                {formatMoney(product.salePrice)}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                划线价 {formatMoney(product.marketPrice)}
                              </p>
                            </td>
                            <td className="px-5 py-5 text-slate-600">
                              可用 {data.stockMap[product.skuId]?.availableQty ?? 0}
                            </td>
                            <td className="px-5 py-5">
                              <ProductStockHint
                                product={product}
                                stock={data.stockMap[product.skuId]}
                              />
                            </td>
                            <td className="px-5 py-5 align-bottom">
                              <div className={tableActionStackClass}>
                                <button
                                  className={iconButtonClass}
                                  type="button"
                                  onClick={() => void openEditProduct(product.skuId)}
                                >
                                  编辑
                                </button>
                                <button
                                  className={iconButtonClass}
                                  type="button"
                                  onClick={() => void toggleProductStatus(product.skuId)}
                                >
                                  {product.status === 1 ? '下架' : '上架'}
                                </button>
                                <button
                                  className={`${iconButtonClass} border-rose-200 text-rose-600 hover:bg-rose-50`}
                                  type="button"
                                  onClick={() => void deleteProduct(product.skuId, product.skuName)}
                                >
                                  删除
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {!visibleProducts.length ? (
                          <tr>
                            <td className="px-5 py-10 text-center text-sm text-slate-500" colSpan={5}>
                              当前筛选条件下没有商品。
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] xl:sticky xl:top-28">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-['Manrope'] text-xl font-extrabold text-slate-900">
                      {productEditorMode === 'edit' ? '编辑商品' : '新增商品'}
                    </h3>
                  </div>
                  {productEditorOpen ? (
                    <button className={secondaryButtonClass} type="button" onClick={resetProductEditor}>
                      取消
                    </button>
                  ) : null}
                </div>

                {productEditorOpen ? (
                  <div className="mt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">商品分类</span>
                        <select
                          className={selectClass}
                          value={productDraft.categoryId}
                          onChange={(event) =>
                            setProductDraft((current) => ({
                              ...current,
                              categoryId: event.target.value,
                            }))
                          }
                        >
                          {data.categories.map((category) => (
                            <option key={category.categoryId} value={category.categoryId}>
                              {category.categoryName}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">上下架状态</span>
                        <select
                          className={selectClass}
                          value={productDraft.status}
                          onChange={(event) =>
                            setProductDraft((current) => ({
                              ...current,
                              status: event.target.value,
                            }))
                          }
                        >
                          <option value="1">已上架</option>
                          <option value="0">已下架</option>
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">SPU 名称</span>
                        <input
                          className={inputClass}
                          value={productDraft.spuName}
                          onChange={(event) =>
                            setProductDraft((current) => ({
                              ...current,
                              spuName: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">SKU 名称</span>
                        <input
                          className={inputClass}
                          value={productDraft.skuName}
                          onChange={(event) =>
                            setProductDraft((current) => ({
                              ...current,
                              skuName: event.target.value,
                            }))
                          }
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">品牌</span>
                        <input
                          className={inputClass}
                          value={productDraft.brandName}
                          onChange={(event) =>
                            setProductDraft((current) => ({
                              ...current,
                              brandName: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">商品主图</span>
                        <input
                          className={inputClass}
                          placeholder="支持图片地址，或上传后自动填充"
                          value={productDraft.mainImageUrl}
                          onChange={(event) =>
                            setProductDraft((current) => ({
                              ...current,
                              mainImageUrl: event.target.value,
                            }))
                          }
                        />
                        <div className="flex flex-wrap items-center gap-3">
                          <label
                            className={`${secondaryButtonClass} cursor-pointer ${productImageUploading ? 'pointer-events-none opacity-60' : ''}`}
                          >
                            <input
                              className="hidden"
                              type="file"
                              accept="image/*"
                              onChange={(event) => {
                                const file = event.target.files?.[0] ?? null
                                event.target.value = ''
                                void handleProductImageUpload(file)
                              }}
                            />
                            {productImageUploading ? '上传中...' : '上传图片'}
                          </label>
                          {productDraft.mainImageUrl ? (
                            <button
                              className={secondaryButtonClass}
                              type="button"
                              onClick={() =>
                                setProductDraft((current) => ({
                                  ...current,
                                  mainImageUrl: '',
                                }))
                              }
                            >
                              清空图片
                            </button>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-500">
                          兼容历史图片标识，也支持后台上传后的本地图片地址。
                        </p>
                        {productDraft.mainImageUrl ? (
                          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                            <img
                              className="h-48 w-full object-cover"
                              src={getProductImage(productDraft.mainImageUrl)}
                              alt={productDraft.skuName || '商品主图'}
                            />
                          </div>
                        ) : null}
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">销售价</span>
                        <input
                          className={inputClass}
                          inputMode="decimal"
                          value={productDraft.salePrice}
                          onChange={(event) =>
                            setProductDraft((current) => ({
                              ...current,
                              salePrice: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">划线价</span>
                        <input
                          className={inputClass}
                          inputMode="decimal"
                          value={productDraft.marketPrice}
                          onChange={(event) =>
                            setProductDraft((current) => ({
                              ...current,
                              marketPrice: event.target.value,
                            }))
                          }
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">可用库存</span>
                        <input
                          className={inputClass}
                          inputMode="numeric"
                          value={productDraft.availableQty}
                          onChange={(event) =>
                            setProductDraft((current) => ({
                              ...current,
                              availableQty: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">推荐排序</span>
                        <input
                          className={inputClass}
                          inputMode="numeric"
                          value={productDraft.recommendSort}
                          onChange={(event) =>
                            setProductDraft((current) => ({
                              ...current,
                              recommendSort: event.target.value,
                            }))
                          }
                        />
                      </label>
                    </div>

                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-700">卖点</span>
                      <input
                        className={inputClass}
                        value={productDraft.sellingPoint}
                        onChange={(event) =>
                          setProductDraft((current) => ({
                            ...current,
                            sellingPoint: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-700">商品描述</span>
                      <textarea
                        className={textareaClass}
                        value={productDraft.description}
                        onChange={(event) =>
                          setProductDraft((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <div className="flex gap-3">
                      <button
                        className={primaryButtonClass}
                        disabled={productSaving}
                        type="button"
                        onClick={() => void saveProduct()}
                      >
                        {productSaving ? '保存中...' : productEditorMode === 'edit' ? '保存修改' : '创建商品'}
                      </button>
                      <button
                        className={secondaryButtonClass}
                        disabled={productSaving}
                        type="button"
                        onClick={resetProductEditor}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-10 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                    选择一件商品开始编辑，或点击“新增商品”创建。
                  </div>
                )}
              </section>
            </div>
          ) : null}
          {activeTab === 'orders' ? (
            <div className="grid gap-8 xl:grid-cols-[1.5fr_0.9fr] xl:items-start">
              <section className={listSectionClass}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="font-['Manrope'] text-xl font-extrabold text-slate-900">
                      订单列表
                    </h3>
                  </div>
                  <button className={primaryButtonClass} type="button" onClick={openCreateOrder}>
                    补录订单
                  </button>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-[1fr_170px_170px]">
                  <input
                    className={inputClass}
                    placeholder="搜索订单号、用户、商品或备注"
                    value={orderKeyword}
                    onChange={(event) => setOrderKeyword(event.target.value)}
                  />
                  <select
                    className={selectClass}
                    value={orderStatusFilter}
                    onChange={(event) => setOrderStatusFilter(event.target.value)}
                  >
                    <option value="all">全部订单状态</option>
                    <option value="10">待支付</option>
                    <option value="20">待发货</option>
                    <option value="30">待收货</option>
                    <option value="40">已完成</option>
                    <option value="50">已取消</option>
                  </select>
                  <select
                    className={selectClass}
                    value={orderPayFilter}
                    onChange={(event) => setOrderPayFilter(event.target.value)}
                  >
                    <option value="all">全部支付状态</option>
                    <option value="0">待支付</option>
                    <option value="2">已支付</option>
                    <option value="4">已关闭</option>
                  </select>
                </div>

                <div className={tableFrameClass}>
                  <div className={tableScrollClass}>
                    <table className="min-w-full text-left text-sm">
                      <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
                        <tr>
                          <th className="px-5 py-4">订单</th>
                          <th className="px-5 py-4">商品</th>
                          <th className="px-5 py-4">状态</th>
                          <th className="px-5 py-4">金额</th>
                          <th className="px-5 py-4 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {visibleOrders.map((order) => {
                          const detail = data.orderDetails[order.orderNo]
                          const status = getOrderStatusMeta(order.orderStatus, order.payStatus)
                          const canPay = order.orderStatus === 10 && order.payStatus === 0
                          const canShip = order.orderStatus === 20 && order.payStatus === 2
                          const canEditShipment = order.orderStatus === 30 && order.payStatus === 2

                          return (
                            <tr key={order.orderNo} className="align-top">
                              <td className="px-5 py-5">
                                <p className="font-semibold text-slate-900">{order.orderNo}</p>
                                <p className="mt-1 text-sm text-slate-500">用户 #{order.userId}</p>
                                <p className="mt-1 text-sm text-slate-500">
                                  {formatDateTime(order.createTime)}
                                </p>
                              </td>
                              <td className="px-5 py-5 text-slate-600">
                                {detail?.items[0]?.skuName ?? '待补充商品信息'}
                                <p className="mt-1 text-sm text-slate-400">共 {order.itemCount} 件商品</p>
                              </td>
                              <td className="px-5 py-5">
                                <StatusPill tone={status.tone}>{status.label}</StatusPill>
                                <p className="mt-2 text-sm text-slate-500">
                                  备注：{order.buyerRemark || '无'}
                                </p>
                                {detail?.deliveryCompany && detail?.deliveryNo ? (
                                  <p className="mt-1 text-sm text-slate-500">
                                    物流：{detail.deliveryCompany} / {detail.deliveryNo}
                                  </p>
                                ) : null}
                              </td>
                              <td className="px-5 py-5 font-semibold text-slate-900">
                                {formatMoney(order.payAmount)}
                              </td>
                              <td className="px-5 py-5 align-bottom">
                                <div className={tableActionStackClass}>
                                  <button
                                    className={iconButtonClass}
                                    type="button"
                                    onClick={() => void openEditOrder(order.orderNo)}
                                  >
                                    编辑
                                  </button>
                                  {canPay ? (
                                    <button
                                      className={iconButtonClass}
                                      type="button"
                                      onClick={() =>
                                        void mallApi
                                          .updateAdminOrder(order.orderNo, {
                                            orderStatus: 20,
                                            payStatus: 2,
                                            payChannel: 1,
                                          })
                                          .then(() => {
                                            setFeedback({
                                              tone: 'success',
                                              text: '订单已标记为已支付，状态切换为待发货。',
                                            })
                                            state.reload()
                                          })
                                          .catch((error: unknown) =>
                                            setFeedback({
                                              tone: 'danger',
                                              text: getErrorMessage(error),
                                            }),
                                          )
                                      }
                                    >
                                      标记支付
                                    </button>
                                  ) : null}
                                  {canShip || canEditShipment ? (
                                    <button
                                      className={iconButtonClass}
                                      type="button"
                                      onClick={() => void openShipOrder(order.orderNo)}
                                    >
                                      {canShip ? '模拟发货' : '修改物流'}
                                    </button>
                                  ) : null}
                                  {canPay ? (
                                    <button
                                      className={iconButtonClass}
                                      type="button"
                                      onClick={() =>
                                        void mallApi
                                          .updateAdminOrder(order.orderNo, { orderStatus: 50 })
                                          .then(() => {
                                            setFeedback({ tone: 'success', text: '订单已取消。' })
                                            state.reload()
                                          })
                                          .catch((error: unknown) =>
                                            setFeedback({
                                              tone: 'danger',
                                              text: getErrorMessage(error),
                                            }),
                                          )
                                      }
                                    >
                                      取消
                                    </button>
                                  ) : null}
                                  <button
                                    className={`${iconButtonClass} border-rose-200 text-rose-600 hover:bg-rose-50`}
                                    type="button"
                                    onClick={() => void deleteOrder(order.orderNo)}
                                  >
                                    删除
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                        {!visibleOrders.length ? (
                          <tr>
                            <td className="px-5 py-10 text-center text-sm text-slate-500" colSpan={5}>
                              当前筛选条件下没有订单。
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] xl:sticky xl:top-28">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-['Manrope'] text-xl font-extrabold text-slate-900">
                      {orderEditorMode === 'edit' ? '编辑订单' : '补录订单'}
                    </h3>
                  </div>
                  {orderEditorOpen ? (
                    <button className={secondaryButtonClass} type="button" onClick={resetOrderEditor}>
                      取消
                    </button>
                  ) : null}
                </div>

                {orderEditorOpen ? (
                  <div className="mt-6 space-y-4">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-700">用户账号</span>
                      <select
                        className={selectClass}
                        disabled={orderEditorMode === 'edit'}
                        value={orderDraft.userId}
                        onChange={(event) =>
                          setOrderDraft((current) => ({ ...current, userId: event.target.value }))
                        }
                      >
                        {data.users.map((user) => (
                          <option key={user.userId} value={user.userId}>
                            #{user.userId} · {user.loginName} · {user.nickname}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-700">买家备注</span>
                      <textarea
                        className={textareaClass}
                        value={orderDraft.buyerRemark}
                        onChange={(event) =>
                          setOrderDraft((current) => ({
                            ...current,
                            buyerRemark: event.target.value,
                          }))
                        }
                      />
                    </label>

                    {orderEditorMode === 'create' ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-700">订单商品</span>
                          <button
                            className={secondaryButtonClass}
                            type="button"
                            onClick={() =>
                              setOrderDraft((current) => ({
                                ...current,
                                items: [...current.items, { skuId: '', quantity: '1' }],
                              }))
                            }
                          >
                            添加商品
                          </button>
                        </div>
                        {orderDraft.items.map((item, index) => (
                          <div
                            key={`${item.skuId}-${index}`}
                            className="grid gap-3 rounded-3xl border border-slate-200 p-4 md:grid-cols-[1fr_120px_auto]"
                          >
                            <select
                              className={selectClass}
                              value={item.skuId}
                              onChange={(event) =>
                                setOrderDraft((current) => ({
                                  ...current,
                                  items: current.items.map((entry, itemIndex) =>
                                    itemIndex === index
                                      ? { ...entry, skuId: event.target.value }
                                      : entry,
                                  ),
                                }))
                              }
                            >
                              <option value="">请选择商品</option>
                              {data.products
                                .filter((product) => product.status === 1)
                                .map((product) => (
                                  <option key={product.skuId} value={product.skuId}>
                                    #{product.skuId} · {product.skuName}
                                  </option>
                                ))}
                            </select>
                            <input
                              className={inputClass}
                              inputMode="numeric"
                              value={item.quantity}
                              onChange={(event) =>
                                setOrderDraft((current) => ({
                                  ...current,
                                  items: current.items.map((entry, itemIndex) =>
                                    itemIndex === index
                                      ? { ...entry, quantity: event.target.value }
                                      : entry,
                                  ),
                                }))
                              }
                            />
                            <button
                              className={`${secondaryButtonClass} ${orderDraft.items.length === 1 ? 'opacity-50' : ''}`}
                              disabled={orderDraft.items.length === 1}
                              type="button"
                              onClick={() =>
                                setOrderDraft((current) => ({
                                  ...current,
                                  items:
                                    current.items.length === 1
                                      ? current.items
                                      : current.items.filter((_, itemIndex) => itemIndex !== index),
                                }))
                              }
                            >
                              删除
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                          当前状态：{getOrderStatusMeta(orderDraft.currentOrderStatus, orderDraft.currentPayStatus).label}
                          {orderDraft.deliveryCompany && orderDraft.deliveryNo ? (
                            <p className="mt-2 text-slate-500">
                              当前物流：{orderDraft.deliveryCompany} / {orderDraft.deliveryNo}
                            </p>
                          ) : null}
                        </div>
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-slate-700">订单处理动作</span>
                          <select
                            className={selectClass}
                            value={orderDraft.statusAction}
                            onChange={(event) => {
                              const nextAction = event.target.value as OrderDraft['statusAction']
                              setOrderDraft((current) => ({
                                ...current,
                                statusAction: nextAction,
                              }))
                              setShippingDialogOpen(nextAction === 'SHIPPED')
                            }}
                          >
                            {getEditableOrderActions(orderDraft).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        {orderDraft.statusAction === 'PAID' ? (
                          <label className="space-y-2">
                            <span className="text-sm font-semibold text-slate-700">支付渠道</span>
                            <select
                              className={selectClass}
                              value={orderDraft.payChannel}
                              onChange={(event) =>
                                setOrderDraft((current) => ({
                                  ...current,
                                  payChannel: event.target.value,
                                }))
                              }
                            >
                              <option value="1">在线支付</option>
                              <option value="2">电子钱包</option>
                              <option value="3">银行转账</option>
                            </select>
                          </label>
                        ) : null}
                        {orderDraft.statusAction === 'SHIPPED' ? (
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div className="space-y-1 text-sm text-slate-600">
                                <p className="font-semibold text-slate-700">物流信息</p>
                                <p>
                                  {orderDraft.deliveryCompany.trim() && orderDraft.deliveryNo.trim()
                                    ? `${orderDraft.deliveryCompany.trim()} / ${orderDraft.deliveryNo.trim()}`
                                    : '尚未填写物流公司和运单号'}
                                </p>
                              </div>
                              <button
                                className={secondaryButtonClass}
                                type="button"
                                onClick={() => setShippingDialogOpen(true)}
                              >
                                {orderDraft.deliveryCompany.trim() && orderDraft.deliveryNo.trim()
                                  ? '修改物流信息'
                                  : '填写物流信息'}
                              </button>
                            </div>
                          </div>
                        ) : null}
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-700">订单商品</p>
                          <div className="mt-3 space-y-2">
                            {orderDraft.items.map((item, index) => (
                              <div
                                key={`${item.skuId}-${index}`}
                                className="flex items-center justify-between text-sm text-slate-600"
                              >
                                <span>{item.skuName ?? `SKU #${item.skuId}`}</span>
                                <span>x {item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        className={primaryButtonClass}
                        disabled={orderSaving}
                        type="button"
                        onClick={() => void saveOrder()}
                      >
                        {orderSaving ? '保存中...' : orderEditorMode === 'edit' ? '保存订单' : '创建订单'}
                      </button>
                      <button
                        className={secondaryButtonClass}
                        disabled={orderSaving}
                        type="button"
                        onClick={resetOrderEditor}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-10 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                    选择一笔订单开始编辑，或点击“补录订单”创建。
                  </div>
                )}
              </section>
            </div>
          ) : null}
          {activeTab === 'users' ? (
            <div className="grid gap-8 xl:grid-cols-[1.5fr_0.9fr]">
              <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="font-['Manrope'] text-xl font-extrabold text-slate-900">
                      用户账号
                    </h3>
                  </div>
                  <button className={primaryButtonClass} type="button" onClick={openCreateUser}>
                    新增账号
                  </button>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-[1fr_170px_170px]">
                  <input
                    className={inputClass}
                    placeholder="搜索账号、昵称、手机号或邮箱"
                    value={userKeyword}
                    onChange={(event) => setUserKeyword(event.target.value)}
                  />
                  <select
                    className={selectClass}
                    value={userRoleFilter}
                    onChange={(event) => setUserRoleFilter(event.target.value)}
                  >
                    <option value="all">全部角色</option>
                    <option value="ADMIN">管理员</option>
                    <option value="USER">会员</option>
                  </select>
                  <select
                    className={selectClass}
                    value={userStatusFilter}
                    onChange={(event) => setUserStatusFilter(event.target.value)}
                  >
                    <option value="all">全部状态</option>
                    <option value="1">活跃</option>
                    <option value="0">停用</option>
                  </select>
                </div>

                <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
                        <tr>
                          <th className="px-5 py-4">账号</th>
                          <th className="px-5 py-4">状态</th>
                          <th className="px-5 py-4">角色</th>
                          <th className="px-5 py-4">联系方式</th>
                          <th className="px-5 py-4 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {visibleUsers.map((user) => {
                          const status = getUserStatusLabel(user.status)
                          return (
                            <tr key={user.userId} className="align-top">
                              <td className="px-5 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-700">
                                    {user.nickname.slice(0, 1).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900">{user.loginName}</p>
                                    <p className="mt-1 text-sm text-slate-500">
                                      {user.nickname} · #{user.userId}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-5">
                                <StatusPill tone={status.tone}>{status.label}</StatusPill>
                              </td>
                              <td className="px-5 py-5 text-slate-600">
                                {getRoleLabel(user.userRole)}
                                <p className="mt-1 text-sm text-slate-400">地址数 {user.addressCount}</p>
                              </td>
                              <td className="px-5 py-5 text-slate-600">
                                <p>{user.mobile}</p>
                                <p className="mt-1">{user.email}</p>
                              </td>
                              <td className="px-5 py-5 align-bottom">
                                <div className={tableActionStackClass}>
                                  <button
                                    className={iconButtonClass}
                                    type="button"
                                    onClick={() => openEditUser(user)}
                                  >
                                    编辑
                                  </button>
                                  <button
                                    className={iconButtonClass}
                                    type="button"
                                    onClick={() => void toggleUserStatus(user)}
                                  >
                                    {user.status === 1 ? '停用' : '启用'}
                                  </button>
                                  <button
                                    className={iconButtonClass}
                                    type="button"
                                    onClick={() => void resetPassword(user)}
                                  >
                                    重置密码
                                  </button>
                                  <button
                                    className={`${iconButtonClass} border-rose-200 text-rose-600 hover:bg-rose-50`}
                                    type="button"
                                    onClick={() => void deleteUser(user)}
                                  >
                                    删除
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                        {!visibleUsers.length ? (
                          <tr>
                            <td className="px-5 py-10 text-center text-sm text-slate-500" colSpan={5}>
                              当前筛选条件下没有账号。
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-['Manrope'] text-xl font-extrabold text-slate-900">
                      {userEditorMode === 'edit' ? '编辑账号' : '新增账号'}
                    </h3>
                  </div>
                  {userEditorOpen ? (
                    <button className={secondaryButtonClass} type="button" onClick={resetUserEditor}>
                      取消
                    </button>
                  ) : null}
                </div>

                {userEditorOpen ? (
                  <div className="mt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">登录账号</span>
                        <input
                          className={inputClass}
                          value={userDraft.loginName}
                          onChange={(event) =>
                            setUserDraft((current) => ({
                              ...current,
                              loginName: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">昵称</span>
                        <input
                          className={inputClass}
                          value={userDraft.nickname}
                          onChange={(event) =>
                            setUserDraft((current) => ({
                              ...current,
                              nickname: event.target.value,
                            }))
                          }
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">手机号</span>
                        <input
                          className={inputClass}
                          value={userDraft.mobile}
                          onChange={(event) =>
                            setUserDraft((current) => ({
                              ...current,
                              mobile: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">邮箱</span>
                        <input
                          className={inputClass}
                          value={userDraft.email}
                          onChange={(event) =>
                            setUserDraft((current) => ({
                              ...current,
                              email: event.target.value,
                            }))
                          }
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">角色</span>
                        <select
                          className={selectClass}
                          value={userDraft.userRole}
                          onChange={(event) =>
                            setUserDraft((current) => ({
                              ...current,
                              userRole: event.target.value,
                            }))
                          }
                        >
                          <option value="USER">会员</option>
                          <option value="ADMIN">管理员</option>
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">账号状态</span>
                        <select
                          className={selectClass}
                          value={userDraft.status}
                          onChange={(event) =>
                            setUserDraft((current) => ({
                              ...current,
                              status: event.target.value,
                            }))
                          }
                        >
                          <option value="1">活跃</option>
                          <option value="0">停用</option>
                        </select>
                      </label>
                    </div>

                    {userEditorMode === 'create' ? (
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">初始密码</span>
                        <input
                          className={inputClass}
                          value={userDraft.password}
                          onChange={(event) =>
                            setUserDraft((current) => ({
                              ...current,
                              password: event.target.value,
                            }))
                          }
                        />
                      </label>
                    ) : null}

                    <div className="flex gap-3">
                      <button
                        className={primaryButtonClass}
                        disabled={userSaving}
                        type="button"
                        onClick={() => void saveUser()}
                      >
                        {userSaving ? '保存中...' : userEditorMode === 'edit' ? '保存账号' : '创建账号'}
                      </button>
                      <button
                        className={secondaryButtonClass}
                        disabled={userSaving}
                        type="button"
                        onClick={resetUserEditor}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-10 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                    选择一个账号开始编辑，或点击“新增账号”创建。
                  </div>
                )}
              </section>
            </div>
          ) : null}
        </div>
      </main>

      {orderEditorOpen && orderEditorMode === 'edit' && orderDraft.statusAction === 'SHIPPED' && shippingDialogOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Shipment
                </p>
                <h3 className="mt-2 font-['Manrope'] text-2xl font-extrabold text-slate-900">
                  填写物流信息
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  请输入物流公司和运单号，保存订单后会同步更新为已发货。
                </p>
              </div>
              <button
                className={secondaryButtonClass}
                type="button"
                onClick={() => setShippingDialogOpen(false)}
              >
                取消
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">物流公司</span>
                <select
                  className={selectClass}
                  value={getDeliveryCompanySelectValue(orderDraft.deliveryCompany)}
                  onChange={(event) =>
                    setOrderDraft((current) => {
                      const nextValue = event.target.value
                      if (nextValue === customDeliveryCompanyOption) {
                        return {
                          ...current,
                          deliveryCompany: deliveryCompanyOptions.includes(
                            current.deliveryCompany.trim() as (typeof deliveryCompanyOptions)[number],
                          )
                            ? ''
                            : current.deliveryCompany,
                        }
                      }

                      return {
                        ...current,
                        deliveryCompany: nextValue,
                      }
                    })
                  }
                >
                  <option value="">请选择物流公司</option>
                  {deliveryCompanyOptions.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                  <option value={customDeliveryCompanyOption}>其他物流公司</option>
                </select>
              </label>

              {getDeliveryCompanySelectValue(orderDraft.deliveryCompany) === customDeliveryCompanyOption ? (
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">自定义物流公司</span>
                  <input
                    className={inputClass}
                    placeholder="请输入物流公司名称"
                    value={orderDraft.deliveryCompany}
                    onChange={(event) =>
                      setOrderDraft((current) => ({
                        ...current,
                        deliveryCompany: event.target.value,
                      }))
                    }
                  />
                </label>
              ) : null}

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">运单号</span>
                <input
                  className={inputClass}
                  placeholder="填写物流单号"
                  value={orderDraft.deliveryNo}
                  onChange={(event) =>
                    setOrderDraft((current) => ({
                      ...current,
                      deliveryNo: event.target.value,
                    }))
                  }
                />
              </label>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-700">当前订单</p>
                <p className="mt-2">{editingOrderNo ?? '未选择订单'}</p>
                {orderDraft.deliveryCompany.trim() && orderDraft.deliveryNo.trim() ? (
                  <p className="mt-2 text-slate-500">
                    将保存为：{orderDraft.deliveryCompany.trim()} / {orderDraft.deliveryNo.trim()}
                  </p>
                ) : null}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  className={secondaryButtonClass}
                  type="button"
                  onClick={() => setShippingDialogOpen(false)}
                >
                  返回编辑
                </button>
                <button
                  className={primaryButtonClass}
                  type="button"
                  onClick={confirmShippingDraft}
                >
                  确认物流信息
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
