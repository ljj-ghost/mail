import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { OrderSummary } from '../api/types'
import { mallApi } from '../api/mallApi'
import { AccountShell } from '../components/AccountShell'
import { LoadingScreen, MaterialIcon, MessageCard, StatusPill } from '../components/PageBits'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatMoney, formatShortDate, getOrderStatusMeta } from '../lib/format'

const orderFilters = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待支付' },
  { key: 'delivery', label: '待发货' },
  { key: 'shipped', label: '待收货' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
] as const

type OrderFilterKey = (typeof orderFilters)[number]['key']

interface OrderNavigationOptions {
  startPayment?: boolean
}

interface AccountOrderDetailLocationState {
  orderSummary?: OrderSummary
  startPayment?: boolean
}

function matchesOrderFilter(order: OrderSummary, filter: OrderFilterKey) {
  if (filter === 'pending') {
    return order.orderStatus === 10
  }

  if (filter === 'delivery') {
    return order.orderStatus === 20 && order.payStatus === 2
  }

  if (filter === 'shipped') {
    return order.orderStatus === 30 && order.payStatus === 2
  }

  if (filter === 'completed') {
    return order.orderStatus === 40
  }

  if (filter === 'cancelled') {
    return order.orderStatus === 50
  }

  return true
}

function canPayOrder(order: OrderSummary) {
  return order.orderStatus === 10 && order.payStatus === 0
}

function canConfirmReceipt(order: OrderSummary) {
  return order.orderStatus === 30 && order.payStatus === 2
}

export function AccountOrdersPage() {
  useDocumentTitle('我的订单 | Executive Store')

  const navigate = useNavigate()
  const { isAuthenticated, session } = useAuth()
  const { pushToast } = useToast()
  const [orderFilter, setOrderFilter] = useState<OrderFilterKey>('all')
  const [busyOrderNo, setBusyOrderNo] = useState<string | null>(null)
  const [confirmingOrderNo, setConfirmingOrderNo] = useState<string | null>(null)

  const ordersState = useAsyncData(
    () => mallApi.getOrders(undefined, 20),
    [session?.userId ?? 0],
    { enabled: isAuthenticated },
  )

  const goToOrderDetail = (order: OrderSummary, options: OrderNavigationOptions = {}) => {
    const search = options.startPayment ? '?pay=1' : ''
    const state: AccountOrderDetailLocationState = {
      orderSummary: order,
      startPayment: options.startPayment,
    }

    navigate(`/account/orders/${order.orderNo}${search}`, { state })
  }

  const removeOrder = async (orderNo: string) => {
    try {
      setBusyOrderNo(orderNo)
      await mallApi.deleteOrder(orderNo)
      ordersState.reload()
      pushToast('订单已删除。', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '删除订单失败', 'error')
    } finally {
      setBusyOrderNo(null)
    }
  }

  const confirmReceiving = async (orderNo: string) => {
    try {
      setConfirmingOrderNo(orderNo)
      await mallApi.confirmOrderReceipt(orderNo)
      ordersState.reload()
      pushToast('已确认收货，订单已完成。', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '确认收货失败', 'error')
    } finally {
      setConfirmingOrderNo(null)
    }
  }

  const orders = ordersState.data ?? []
  const visibleOrders = orders.filter((order) => matchesOrderFilter(order, orderFilter))

  const orderCounts = {
    all: orders.length,
    pending: orders.filter((order) => matchesOrderFilter(order, 'pending')).length,
    delivery: orders.filter((order) => matchesOrderFilter(order, 'delivery')).length,
    shipped: orders.filter((order) => matchesOrderFilter(order, 'shipped')).length,
    completed: orders.filter((order) => matchesOrderFilter(order, 'completed')).length,
    cancelled: orders.filter((order) => matchesOrderFilter(order, 'cancelled')).length,
  }

  return (
    <AccountShell
      activeSection="orders"
      title="我的订单"
      description="点击订单可进入详情页，待支付订单也可以直接继续支付。"
    >
      {!ordersState.data && ordersState.loading ? <LoadingScreen label="正在加载订单数据" /> : null}

      {!ordersState.data && !ordersState.loading ? (
        <MessageCard
          title="订单列表暂时不可用"
          description="请确认网关和订单服务已经正常启动后再试。"
          actionLabel="返回首页"
          actionHref="/"
        />
      ) : null}

      {ordersState.data ? (
        <>
          <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
            {orderFilters.map((filter) => (
              <button
                key={filter.key}
                className={`rounded-[24px] border p-5 text-left transition ${
                  orderFilter === filter.key
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
                type="button"
                onClick={() => setOrderFilter(filter.key)}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
                  {filter.label}
                </p>
                <strong className="mt-3 block text-3xl">{orderCounts[filter.key]}</strong>
              </button>
            ))}
          </section>

          <section className="rounded-[28px] bg-white p-8 shadow-sm">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <MaterialIcon className="text-primary" name="history" />
                <h2 className="text-xl font-bold tracking-tight text-slate-900">订单记录</h2>
              </div>
              <div className="text-sm text-slate-500">当前显示 {visibleOrders.length} 条记录</div>
            </div>

            <div className="space-y-4">
              {!visibleOrders.length ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                  当前筛选条件下还没有订单记录。
                </div>
              ) : null}

              {visibleOrders.map((order, index) => {
                const status = getOrderStatusMeta(order.orderStatus, order.payStatus)
                const deleting = busyOrderNo === order.orderNo
                const confirming = confirmingOrderNo === order.orderNo
                const payable = canPayOrder(order)
                const receivable = canConfirmReceipt(order)

                return (
                  <article
                    key={order.orderNo}
                    className="rounded-2xl border border-slate-200 p-5 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <button
                        className="flex flex-1 items-start gap-4 text-left transition-transform hover:translate-x-1"
                        type="button"
                        onClick={() => goToOrderDetail(order)}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                          <MaterialIcon
                            className="text-slate-500"
                            name={index % 2 === 0 ? 'shopping_bag' : 'inventory_2'}
                          />
                        </div>

                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="font-semibold text-slate-900">{order.orderNo}</p>
                            <StatusPill tone={status.tone}>{status.label}</StatusPill>
                          </div>
                          <p className="text-sm text-slate-500">
                            下单时间：{formatShortDate(order.createTime)}，共 {order.itemCount} 件商品
                          </p>
                          {order.buyerRemark ? (
                            <p className="text-sm text-slate-500">备注：{order.buyerRemark}</p>
                          ) : null}
                          <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                            查看详情
                            <MaterialIcon name="arrow_forward" />
                          </span>
                        </div>
                      </button>

                      <div className="flex flex-col items-start gap-4 lg:items-end">
                        <p className="text-2xl font-bold text-slate-900">
                          {formatMoney(order.payAmount)}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-white"
                            type="button"
                            onClick={() => goToOrderDetail(order)}
                          >
                            <MaterialIcon name="receipt_long" />
                            订单详情
                          </button>
                          {payable ? (
                            <button
                              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                              type="button"
                              onClick={() =>
                                goToOrderDetail(order, {
                                  startPayment: true,
                                })
                              }
                            >
                              <MaterialIcon name="payments" />
                              去支付
                            </button>
                          ) : null}
                          {receivable ? (
                            <button
                              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                              type="button"
                              disabled={confirming}
                              onClick={() => void confirmReceiving(order.orderNo)}
                            >
                              <MaterialIcon name="check_circle" />
                              {confirming ? '确认中...' : '确认收货'}
                            </button>
                          ) : null}
                          <button
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                            type="button"
                            disabled={deleting}
                            onClick={() => void removeOrder(order.orderNo)}
                          >
                            <MaterialIcon name="delete" />
                            {deleting ? '删除中...' : '删除订单'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </>
      ) : null}
    </AccountShell>
  )
}
