import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AddressDraft, CheckoutResult } from '../api/types'
import { mallApi } from '../api/mallApi'
import { MaterialIcon, MessageCard, StatusPill } from '../components/PageBits'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
  emptyAddressDraft,
  normalizeAddressDraft,
  sanitizeMobileInput,
  validateAddressDraft,
} from '../lib/address'
import { formatMoney, getPaymentChannelLabel, getPaymentStatusMeta, sumBy } from '../lib/format'
import { getProductImage } from '../lib/productVisuals'

const initialAddressDraft = emptyAddressDraft

export function CheckoutPage() {
  useDocumentTitle('订单支付 - 尊享商城')

  const { isAuthenticated, openLogin, session } = useAuth()
  const { pushToast } = useToast()
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [addressDraft, setAddressDraft] = useState<AddressDraft>(emptyAddressDraft)
  const [payChannel, setPayChannel] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [creatingAddress, setCreatingAddress] = useState(false)
  const [result, setResult] = useState<CheckoutResult | null>(null)

  const checkoutState = useAsyncData(
    async () => {
      const [cartItems, addresses] = await Promise.all([
        mallApi.getCartItemsDetailed(),
        mallApi.getAddresses(),
      ])

      return { cartItems, addresses }
    },
    [session?.userId ?? 0],
    { enabled: isAuthenticated },
  )

  useEffect(() => {
    if (!checkoutState.data?.addresses.length || selectedAddressId) {
      return
    }

    const preferred =
      checkoutState.data.addresses.find((item) => item.defaultAddress) ??
      checkoutState.data.addresses[0]
    if (preferred) {
      setSelectedAddressId(preferred.id)
    }
  }, [checkoutState.data?.addresses, selectedAddressId])

  if (!isAuthenticated) {
    return (
      <MessageCard
        title="登录后才能继续结算"
        description="结算会调用地址、订单和支付接口，请先登录。"
        actionLabel="去登录"
        onAction={openLogin}
      />
    )
  }


  const cartItems = checkoutState.data?.cartItems ?? []
  const addresses = checkoutState.data?.addresses ?? []
  const isCheckoutPending = checkoutState.loading && !checkoutState.data
  const subtotal = sumBy(cartItems, (item) => item.subtotal)
  const tax = Math.round(subtotal * 0.084 * 100) / 100
  const total = subtotal + tax

  if (!cartItems.length && !result && !isCheckoutPending) {
    return (
      <MessageCard
        title="购物车为空"
        description="先把商品加入购物车，再回来继续支付。"
        actionLabel="返回首页"
        actionHref="/"
      />
    )
  }

  const createAddress = async () => {
    const draft = normalizeAddressDraft(addressDraft)
    const validationError = validateAddressDraft(draft)
    if (validationError) {
      pushToast(validationError, 'error')
      return
    }

    try {
      setCreatingAddress(true)
      const created = await mallApi.createAddress(draft)
      setSelectedAddressId(created.id)
      setAddressDraft(initialAddressDraft)
      checkoutState.reload()
      pushToast('地址已创建', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '创建地址失败', 'error')
    } finally {
      setCreatingAddress(false)
    }
  }

  const submitOrder = async () => {
    if (!selectedAddressId) {
      pushToast('请先选择收货地址', 'error')
      return
    }

    try {
      setSubmitting(true)
      const order = await mallApi.submitOrder({
        idempotencyKey: crypto.randomUUID(),
        submitToken: `checkout-${Date.now()}`,
        addressId: selectedAddressId,
        buyerRemark: '',
        items: cartItems.map((item) => ({
          skuId: item.skuId,
          quantity: item.quantity,
        })),
      })
      const payment = await mallApi.createPayment(order.orderNo, payChannel)
      setResult({
        order,
        payment,
        paymentDetail: null,
      })
      pushToast('订单与支付单已创建', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '提交订单失败', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const finishMockPayment = async () => {
    if (!result) {
      return
    }

    try {
      setSubmitting(true)
      const paymentDetail = await mallApi.mockPaymentSuccess(result.payment.paymentNo)
      setResult((current) =>
        current
          ? {
              ...current,
              paymentDetail,
            }
          : null,
      )
      pushToast('模拟支付已完成', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '模拟支付失败', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const paymentMeta = result
    ? getPaymentStatusMeta(result.paymentDetail?.payStatus ?? result.payment.payStatus)
    : null

  return (
    <div className="bg-surface text-on-surface antialiased">
      <header className="sticky top-0 z-50 w-full bg-slate-50 shadow-sm">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4 md:px-8">
          <div className="flex items-center gap-8">
            <Link className="font-headline text-xl font-bold tracking-tighter text-slate-800" to="/">
              Executive Store
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link className="font-headline font-semibold tracking-tight text-slate-500 transition hover:text-slate-700" to="/">
                首页
              </Link>
              <Link className="font-headline font-semibold tracking-tight text-slate-500 transition hover:text-slate-700" to="/">
                产品
              </Link>
              <Link className="border-b-2 border-slate-500 pb-1 font-headline font-semibold tracking-tight text-slate-900" to="/account/profile">
                订单
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100" to="/cart">
              <MaterialIcon name="shopping_cart" />
            </Link>
            <Link className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100" to="/account/profile">
              <MaterialIcon name="account_circle" />
            </Link>
          </div>
        </div>
        <div className="h-px w-full bg-slate-100" />
      </header>

      <main className="mx-auto max-w-screen-xl px-6 py-12 md:py-16">
        <div className="mb-12">
          <div className="mx-auto flex max-w-2xl items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
                1
              </div>
              <span className="font-headline text-sm font-semibold tracking-tight">配送</span>
            </div>
            <div className="h-[2px] flex-grow bg-primary-fixed-dim" />
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-dim bg-primary-fixed-dim text-xs font-bold text-primary">
                2
              </div>
              <span className="font-headline text-sm font-semibold tracking-tight text-primary">
                支付
              </span>
            </div>
            <div className="h-[2px] flex-grow bg-surface-variant" />
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-xs font-bold text-on-surface-variant">
                3
              </div>
              <span className="font-headline text-sm font-semibold tracking-tight text-on-surface-variant">
                确认
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-7">
            <section>
              <div className="mb-8 flex items-center gap-3">
                <MaterialIcon className="text-primary" name="local_shipping" />
                <h2 className="font-headline text-2xl font-extrabold tracking-tight">
                  配送地址
                </h2>
              </div>

              {addresses.length ? (
                <div className="mb-8 grid gap-4">
                  {addresses.map((address) => (
                    <button
                      key={address.id}
                      className={`rounded-xl p-5 text-left shadow-sm transition ${selectedAddressId === address.id ? 'bg-surface-container-high text-on-surface ring-1 ring-primary/20' : 'bg-surface-container-lowest hover:bg-surface-container'}`}
                      type="button"
                      onClick={() => setSelectedAddressId(address.id)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <strong className="block text-sm">{address.consigneeName}</strong>
                          <span className="mt-1 block text-xs text-on-surface-variant">
                            {address.consigneeMobile}
                          </span>
                        </div>
                        {address.defaultAddress ? (
                          <StatusPill tone="brand">默认地址</StatusPill>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm text-on-surface-variant">
                        {address.detailAddress}
                      </p>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs uppercase tracking-widest text-on-surface-variant">
                    姓名
                  </label>
                  <input
                    className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm outline-none transition-all focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                    placeholder="亚历山大·汉密尔顿"
                    value={addressDraft.consigneeName}
                    onChange={(event) =>
                      setAddressDraft((current) => ({
                        ...current,
                        consigneeName: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs uppercase tracking-widest text-on-surface-variant">
                    详细地址
                  </label>
                  <input
                    className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm outline-none transition-all focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                    placeholder="百老汇大街1024号，400室"
                    value={addressDraft.detailAddress}
                    onChange={(event) =>
                      setAddressDraft((current) => ({
                        ...current,
                        detailAddress: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-widest text-on-surface-variant">
                    手机号
                  </label>
                  <input
                    className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm outline-none transition-all focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                    placeholder="13800138000"
                    inputMode="numeric"
                    maxLength={11}
                    value={addressDraft.consigneeMobile}
                    onChange={(event) =>
                      setAddressDraft((current) => ({
                        ...current,
                        consigneeMobile: sanitizeMobileInput(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="flex items-end">
                  <button
                    className="w-full rounded-xl border border-outline-variant/20 bg-white py-3 text-sm font-semibold transition-colors hover:bg-surface-container"
                    type="button"
                    disabled={creatingAddress}
                    onClick={createAddress}
                  >
                    {creatingAddress ? '新增中...' : '保存为新地址'}
                  </button>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-8 flex items-center gap-3">
                <MaterialIcon className="text-primary" name="payments" />
                <h2 className="font-headline text-2xl font-extrabold tracking-tight">
                  支付方式
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { channel: 1, icon: 'credit_card', label: '信用卡' },
                  { channel: 2, icon: 'account_balance_wallet', label: '电子钱包' },
                  { channel: 3, icon: 'account_balance', label: '银行转账' },
                ].map((option) => (
                  <button
                    key={option.channel}
                    className={`relative flex flex-col items-center rounded-xl p-6 shadow-sm transition-colors ${payChannel === option.channel ? 'bg-surface-container-high' : 'bg-surface-container-lowest hover:bg-surface-container'}`}
                    type="button"
                    onClick={() => setPayChannel(option.channel)}
                  >
                    <span className="absolute right-4 top-4">
                      <input
                        checked={payChannel === option.channel}
                        className="text-primary focus:ring-primary"
                        readOnly
                        type="radio"
                      />
                    </span>
                    <MaterialIcon className="mb-3 text-3xl text-on-surface-variant" name={option.icon} />
                    <span className="text-sm font-semibold">{option.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-8 rounded-xl bg-surface-container-lowest p-8 shadow-sm">
              <h3 className="border-b border-outline-variant/10 pb-4 font-headline text-xl font-bold tracking-tight">
                订单摘要
              </h3>
              <div className="space-y-6">
                {cartItems.map((item, index) => (
                  <div key={item.skuId} className="flex gap-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container">
                      <img
                        className="h-full w-full object-cover"
                        src={getProductImage(item.detail?.mainImageUrl, index)}
                        alt={item.skuName}
                      />
                    </div>
                    <div className="flex flex-grow flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold">{item.skuName}</h4>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          {item.detail?.spuName ?? 'Executive Collection'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wider text-on-surface-variant">
                          数量: {item.quantity}
                        </span>
                        <span className="text-sm font-bold">{formatMoney(item.subtotal)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-outline-variant/10 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">小计</span>
                  <span className="font-medium">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">运费</span>
                  <span className="font-medium text-tertiary">确认阶段计算</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">预估税费</span>
                  <span className="font-medium">{formatMoney(tax)}</span>
                </div>
                <div className="flex justify-between pt-4 font-headline text-lg font-extrabold text-primary">
                  <span>订单总计</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>

              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim py-4 font-headline text-lg font-bold tracking-tight text-on-primary shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
                type="button"
                disabled={submitting}
                onClick={submitOrder}
              >
                提交订单
                <MaterialIcon name="arrow_forward" />
              </button>

              <p className="text-center text-[10px] uppercase tracking-wider text-on-surface-variant opacity-60">
                下单即代表你同意使用条款和隐私政策。安全加密结账。
              </p>

              {result && paymentMeta ? (
                <div className="rounded-xl bg-surface-container p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                        支付单
                      </p>
                      <p className="mt-2 text-sm font-bold">{result.payment.paymentNo}</p>
                    </div>
                    <StatusPill tone={paymentMeta.tone}>{paymentMeta.label}</StatusPill>
                  </div>
                  <p className="mt-3 text-xs text-on-surface-variant">
                    订单号 {result.order.orderNo} · {getPaymentChannelLabel(payChannel)}
                  </p>
                  <button
                    className="mt-4 w-full rounded-xl border border-outline-variant/20 bg-white py-3 text-sm font-semibold transition-colors hover:bg-surface-container-low"
                    type="button"
                    disabled={submitting || result.paymentDetail?.payStatus === 2}
                    onClick={finishMockPayment}
                  >
                    {result.paymentDetail?.payStatus === 2 ? '已完成模拟支付' : '完成模拟支付'}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-slate-200/50 bg-slate-50">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between px-12 py-8 md:flex-row">
          <span className="font-headline font-bold text-slate-400">EXECUTIVE ARCHITECT</span>
          <div className="my-4 flex gap-8 md:my-0">
            <a className="text-xs uppercase tracking-widest text-slate-400 transition-opacity duration-300 hover:text-slate-900" href="#">
              隐私政策
            </a>
            <a className="text-xs uppercase tracking-widest text-slate-400 transition-opacity duration-300 hover:text-slate-900" href="#">
              服务条款
            </a>
            <a className="text-xs uppercase tracking-widest text-slate-400 transition-opacity duration-300 hover:text-slate-900" href="#">
              配送信息
            </a>
            <a className="text-xs uppercase tracking-widest text-slate-400 transition-opacity duration-300 hover:text-slate-900" href="#">
              联系我们
            </a>
          </div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            © 2024 Executive Architect Storefront. 保留所有权利。
          </p>
        </div>
      </footer>
    </div>
  )
}
