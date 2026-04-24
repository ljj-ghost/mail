import { useEffect, useEffectEvent, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import type {
  OrderSummary,
  PaymentCreateResponse,
  PaymentDetail,
} from '../api/types'
import { mallApi } from '../api/mallApi'
import { AccountShell } from '../components/AccountShell'
import { LoadingScreen, MaterialIcon, MessageCard, StatusPill } from '../components/PageBits'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
  formatDateTime,
  formatMoney,
  getOrderStatusMeta,
  getPaymentChannelLabel,
  getPaymentStatusMeta,
  sumBy,
} from '../lib/format'

const paymentChannels = [
  { value: 1, label: '在线支付', icon: 'credit_card' },
  { value: 2, label: '电子钱包', icon: 'account_balance_wallet' },
  { value: 3, label: '银行转账', icon: 'account_balance' },
] as const

interface AccountOrderDetailLocationState {
  orderSummary?: OrderSummary
  startPayment?: boolean
}

function canPayOrder(orderStatus: number, payStatus: number) {
  return orderStatus === 10 && payStatus === 0
}

function canConfirmReceipt(orderStatus: number, payStatus: number) {
  return orderStatus === 30 && payStatus === 2
}

export function AccountOrderDetailPage() {
  const { orderNo = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, session } = useAuth()
  const { pushToast } = useToast()
  const [payChannel, setPayChannel] = useState(1)
  const [payment, setPayment] = useState<PaymentCreateResponse | null>(null)
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(null)
  const [creatingPayment, setCreatingPayment] = useState(false)
  const [refreshingPayment, setRefreshingPayment] = useState(false)
  const [confirmingPayment, setConfirmingPayment] = useState(false)
  const [confirmingReceipt, setConfirmingReceipt] = useState(false)
  const [autoCreateHandled, setAutoCreateHandled] = useState(false)

  useDocumentTitle(orderNo ? `订单详情 ${orderNo} | Executive Store` : '订单详情 | Executive Store')

  const locationState = location.state as AccountOrderDetailLocationState | null
  const summarySeed =
    locationState?.orderSummary?.orderNo === orderNo ? locationState.orderSummary : null
  const startPaymentIntent =
    new URLSearchParams(location.search).get('pay') === '1' || Boolean(locationState?.startPayment)

  const orderState = useAsyncData(
    () => mallApi.getOrderDetail(orderNo),
    [session?.userId ?? 0, orderNo],
    { enabled: isAuthenticated && Boolean(orderNo) },
  )

  const orderDetail = orderState.data
  const displayOrder = orderDetail ?? summarySeed
  const orderStatus = displayOrder
    ? getOrderStatusMeta(displayOrder.orderStatus, displayOrder.payStatus)
    : { label: '加载中', tone: 'neutral' as const }
  const payable = displayOrder
    ? canPayOrder(displayOrder.orderStatus, displayOrder.payStatus)
    : false
  const receivable = displayOrder
    ? canConfirmReceipt(displayOrder.orderStatus, displayOrder.payStatus)
    : false
  const totalQuantity = orderDetail
    ? sumBy(orderDetail.items, (item) => item.quantity)
    : summarySeed?.itemCount ?? 0
  const paymentStatus = payment
    ? getPaymentStatusMeta(paymentDetail?.payStatus ?? payment.payStatus)
    : null

  const autoCreatePayment = useEffectEvent(async (targetOrderNo: string) => {
    try {
      setCreatingPayment(true)
      const created = await mallApi.createPayment(targetOrderNo, payChannel)
      setPayment(created)
      setPaymentDetail(null)
      pushToast('支付单已创建，请继续完成支付。', 'success')
    } catch (error) {
      orderState.reload()
      pushToast(error instanceof Error ? error.message : '创建支付单失败', 'error')
    } finally {
      setCreatingPayment(false)
    }
  })

  const createPayment = async (targetOrderNo: string) => {
    try {
      setCreatingPayment(true)
      const created = await mallApi.createPayment(targetOrderNo, payChannel)
      setPayment(created)
      setPaymentDetail(null)
      pushToast('支付单已创建，请继续完成支付。', 'success')
    } catch (error) {
      orderState.reload()
      pushToast(error instanceof Error ? error.message : '创建支付单失败', 'error')
    } finally {
      setCreatingPayment(false)
    }
  }

  useEffect(() => {
    if (!orderNo || !startPaymentIntent || autoCreateHandled || payment || creatingPayment) {
      return
    }

    setAutoCreateHandled(true)
    navigate(location.pathname, {
      replace: true,
      state: summarySeed ? { orderSummary: summarySeed } : undefined,
    })
    void autoCreatePayment(orderNo)
  }, [
    autoCreateHandled,
    creatingPayment,
    location.pathname,
    navigate,
    orderNo,
    payment,
    startPaymentIntent,
    summarySeed,
  ])

  const refreshPayment = async () => {
    if (!payment) {
      return
    }

    try {
      setRefreshingPayment(true)
      const detail = await mallApi.getPaymentDetail(payment.paymentNo)
      setPaymentDetail(detail)
      if (detail.payStatus === 2) {
        orderState.reload()
      }
      pushToast('支付状态已刷新。', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '刷新支付状态失败', 'error')
    } finally {
      setRefreshingPayment(false)
    }
  }

  const finishMockPayment = async () => {
    if (!payment) {
      return
    }

    try {
      setConfirmingPayment(true)
      const detail = await mallApi.mockPaymentSuccess(payment.paymentNo)
      setPaymentDetail(detail)
      orderState.reload()
      pushToast('模拟支付已完成。', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '模拟支付失败', 'error')
    } finally {
      setConfirmingPayment(false)
    }
  }

  const confirmReceipt = async () => {
    if (!displayOrder) {
      return
    }

    try {
      setConfirmingReceipt(true)
      await mallApi.confirmOrderReceipt(displayOrder.orderNo)
      orderState.reload()
      pushToast('已确认收货。', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '确认收货失败', 'error')
    } finally {
      setConfirmingReceipt(false)
    }
  }

  if (!orderNo) {
    return (
      <AccountShell
        activeSection="orders"
        title="订单详情"
      >
        <MessageCard
          title="没有找到订单编号"
          description="请从订单列表重新进入详情页面。"
          actionLabel="返回订单列表"
          actionHref="/account/orders"
        />
      </AccountShell>
    )
  }

  return (
    <AccountShell
      activeSection="orders"
      title="订单详情"
      description="查看订单状态、商品明细和支付进度。"
    >
      {!displayOrder && orderState.loading ? <LoadingScreen label="正在加载订单详情" /> : null}

      {!displayOrder && !orderState.loading ? (
        <MessageCard
          title="订单详情暂时不可用"
          description="请确认网关和订单服务已经正常启动后再试。"
          actionLabel="返回订单列表"
          actionHref="/account/orders"
        />
      ) : null}

      {displayOrder ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="rounded-[28px] bg-white p-8 shadow-sm xl:col-span-7">
            <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <Link
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
                  to="/account/orders"
                >
                  <MaterialIcon name="arrow_back" />
                  返回订单列表
                </Link>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    {displayOrder.orderNo}
                  </h2>
                  <StatusPill tone={orderStatus.tone}>{orderStatus.label}</StatusPill>
                </div>
                <p className="text-sm text-slate-500">
                  下单时间：{formatDateTime(displayOrder.createTime)}
                </p>
              </div>

              <div className="grid min-w-[14rem] gap-2 rounded-2xl bg-slate-50 px-5 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  订单金额
                </span>
                <strong className="text-3xl text-slate-900">
                  {formatMoney(displayOrder.payAmount)}
                </strong>
                <span className="text-sm text-slate-500">共 {totalQuantity} 件商品</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  买家备注
                </p>
                <p className="mt-3 text-sm text-slate-700">{displayOrder.buyerRemark || '无备注'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  配送状态
                </p>
                <p className="mt-3 text-sm text-slate-700">
                  {orderDetail?.deliveryCompany && orderDetail?.deliveryNo
                    ? `${orderDetail.deliveryCompany} / ${orderDetail.deliveryNo}`
                    : orderDetail
                      ? '暂未发货'
                      : '正在同步'}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  发货时间
                </p>
                <p className="mt-3 text-sm text-slate-700">
                  {orderDetail ? formatDateTime(orderDetail.deliveryTime) : '正在同步'}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  完成时间
                </p>
                <p className="mt-3 text-sm text-slate-700">
                  {orderDetail ? formatDateTime(orderDetail.finishTime) : '正在同步'}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <MaterialIcon className="text-primary" name="shopping_bag" />
                <h3 className="text-xl font-bold tracking-tight text-slate-900">商品清单</h3>
              </div>

              {orderDetail ? (
                orderDetail.items.map((item, index) => (
                  <article
                    key={`${item.skuId}-${index}`}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                        <MaterialIcon
                          className="text-slate-500"
                          name={index % 2 === 0 ? 'shopping_bag' : 'inventory_2'}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.skuName}</p>
                        <p className="mt-1 text-sm text-slate-500">SKU {item.skuId}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 lg:justify-end">
                      <span>数量：{item.quantity}</span>
                      <span>单价：{formatMoney(item.salePrice)}</span>
                      <strong className="text-base text-slate-900">
                        {formatMoney(item.itemAmount)}
                      </strong>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                  正在加载商品明细...
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6 xl:col-span-5">
            <section className="rounded-[28px] bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <MaterialIcon className="text-primary" name="payments" />
                <h3 className="text-xl font-bold tracking-tight text-slate-900">支付进度</h3>
              </div>

              {payment && paymentStatus ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        支付单号
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {payment.paymentNo}
                      </p>
                    </div>
                    <StatusPill tone={paymentStatus.tone}>{paymentStatus.label}</StatusPill>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-4">
                      <span>支付方式</span>
                      <span>{getPaymentChannelLabel(paymentDetail?.payChannel ?? payChannel)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>支付金额</span>
                      <span>{formatMoney(payment.payAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>支付时间</span>
                      <span>{formatDateTime(paymentDetail?.payTime)}</span>
                    </div>
                    {paymentDetail?.thirdTradeNo ? (
                      <div className="flex items-center justify-between gap-4">
                        <span>交易流水</span>
                        <span className="break-all text-right">{paymentDetail.thirdTradeNo}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {paymentDetail?.payStatus === 2 ? null : (
                      <button
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                        disabled={confirmingPayment}
                        onClick={() => void finishMockPayment()}
                      >
                        <MaterialIcon name="check_circle" />
                        {confirmingPayment ? '支付处理中...' : '完成模拟支付'}
                      </button>
                    )}
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      type="button"
                      disabled={refreshingPayment}
                      onClick={() => void refreshPayment()}
                    >
                      <MaterialIcon name="history" />
                      {refreshingPayment ? '刷新中...' : '刷新支付状态'}
                    </button>
                  </div>
                </div>
              ) : payable ? (
                <>
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                    当前订单待支付，选择支付方式后即可继续完成支付。
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {paymentChannels.map((option) => (
                      <button
                        key={option.value}
                        className={`rounded-2xl border p-4 text-left transition ${
                          payChannel === option.value
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                        type="button"
                        onClick={() => setPayChannel(option.value)}
                      >
                        <MaterialIcon className="text-lg" name={option.icon} />
                        <p className="mt-3 text-sm font-semibold">{option.label}</p>
                      </button>
                    ))}
                  </div>

                  <button
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    disabled={creatingPayment}
                    onClick={() => void createPayment(orderNo)}
                  >
                    <MaterialIcon name="payments" />
                    {creatingPayment ? '创建支付单中...' : '去支付'}
                  </button>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  {displayOrder.payStatus === 2
                    ? '该订单已完成支付，可继续跟进发货和收货状态。'
                    : displayOrder.orderStatus === 50
                      ? '该订单已取消，无法继续支付。'
                      : '当前订单暂无可执行的支付操作。'}
                </div>
              )}
            </section>

            <section className="rounded-[28px] bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <MaterialIcon className="text-primary" name="local_shipping" />
                <h3 className="text-xl font-bold tracking-tight text-slate-900">订单操作</h3>
              </div>

              <div className="space-y-4 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="font-semibold text-slate-900">当前状态</p>
                  <p className="mt-2">{orderStatus.label}</p>
                </div>

                {receivable ? (
                  <button
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    disabled={confirmingReceipt}
                    onClick={() => void confirmReceipt()}
                  >
                    <MaterialIcon name="check_circle" />
                    {confirmingReceipt ? '确认收货中...' : '确认收货'}
                  </button>
                ) : null}

                <Link
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  to="/account/orders"
                >
                  <MaterialIcon name="receipt_long" />
                  返回订单列表
                </Link>
              </div>
            </section>
          </aside>
        </div>
      ) : null}
    </AccountShell>
  )
}
