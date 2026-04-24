import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Address, AddressDraft, OrderSummary } from '../api/types'
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
import { formatMoney, formatShortDate, getOrderStatusMeta, getRoleLabel } from '../lib/format'
import { resolveStaticAsset } from '../lib/staticAssets'

const accountAvatar =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDnc0ufc4pe0TT5Xjxj-cKxYGqpTW5bytwKSi-xjEBuqbMjvYrbI2zzM_118CLcGSPpxfQYEFSRwSvaaKhZT4TYjCautt7Yyl6A_8D-eTbc7vkeV-9S6lS1HnDMy4IOOB62ZbzvLkXcNBtEkoVNMJr0-U3s_Va3K7GcJ6ziE1C85d0Ppi7wYtiTarYSf_wHQAQ5Bq3AOuAdKClmSV2-P-hB3li7KJ8bnMOwhJH4xuexhvU2pRtffTocBx2KnxDQkA7jGMZtPppXa2s'

const orderFilters = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待支付' },
  { key: 'delivery', label: '待发货' },
  { key: 'cancelled', label: '已取消' },
] as const

type OrderFilterKey = (typeof orderFilters)[number]['key']

function matchesOrderFilter(order: OrderSummary, filter: OrderFilterKey) {
  if (filter === 'pending') {
    return order.orderStatus === 10
  }

  if (filter === 'delivery') {
    return order.orderStatus === 20 && order.payStatus === 2
  }

  if (filter === 'cancelled') {
    return order.orderStatus === 50
  }

  return true
}

function toAddressDraft(address: Address): AddressDraft {
  return {
    consigneeName: address.consigneeName,
    consigneeMobile: address.consigneeMobile,
    detailAddress: address.detailAddress,
    defaultAddress: address.defaultAddress,
  }
}

export function AccountPage() {
  useDocumentTitle('个人中心 | Executive Store')

  const navigate = useNavigate()
  const { isAuthenticated, logout, openLogin, session } = useAuth()
  const { pushToast } = useToast()
  const [orderFilter, setOrderFilter] = useState<OrderFilterKey>('all')
  const [addressDraft, setAddressDraft] = useState<AddressDraft>(emptyAddressDraft)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [savingAddress, setSavingAddress] = useState(false)
  const [busyAddressId, setBusyAddressId] = useState<number | null>(null)
  const [busyOrderNo, setBusyOrderNo] = useState<string | null>(null)

  const profileState = useAsyncData(
    async () => {
      const [profile, addresses] = await Promise.all([
        mallApi.getCurrentUser(),
        mallApi.getAddresses(),
      ])

      return { profile, addresses }
    },
    [session?.userId ?? 0],
    { enabled: isAuthenticated },
  )

  const ordersState = useAsyncData(
    () => mallApi.getOrders(undefined, 20),
    [session?.userId ?? 0],
    { enabled: isAuthenticated },
  )
  const cartState = useAsyncData(
    () => mallApi.getCartItems(),
    [session?.userId ?? 0],
    { enabled: isAuthenticated },
  )

  if (!isAuthenticated) {
    return (
      <MessageCard
        title="登录后才能进入个人中心"
        description="个人资料、收货地址和历史订单都需要登录后读取。"
        actionLabel="去登录"
        onAction={openLogin}
      />
    )
  }

  const profileData = profileState.data
  if (!profileData && !profileState.loading) {
    return (
      <MessageCard
        title="个人中心暂时不可用"
        description="请确认网关和用户服务已经正常启动，然后再刷新重试。"
        actionLabel="返回首页"
        actionHref="/"
      />
    )
  }

  const profile = profileData?.profile
  const addresses = profileData?.addresses ?? []
  const orders = ordersState.data ?? []
  const cartCount = (cartState.data ?? []).reduce((total, item) => total + item.quantity, 0)
  const visibleOrders = orders.filter((order) => matchesOrderFilter(order, orderFilter))

  const orderCounts = {
    all: orders.length,
    pending: orders.filter((order) => matchesOrderFilter(order, 'pending')).length,
    delivery: orders.filter((order) => matchesOrderFilter(order, 'delivery')).length,
    cancelled: orders.filter((order) => matchesOrderFilter(order, 'cancelled')).length,
  }

  const resetAddressForm = () => {
    setEditingAddressId(null)
    setAddressDraft(emptyAddressDraft)
  }

  const saveAddress = async () => {
    const draft = normalizeAddressDraft(addressDraft)
    const validationError = validateAddressDraft(draft)
    if (validationError) {
      pushToast(validationError, 'error')
      return
    }

    try {
      setSavingAddress(true)
      if (editingAddressId) {
        await mallApi.updateAddress(editingAddressId, draft)
        pushToast('收货地址已更新', 'success')
      } else {
        await mallApi.createAddress(draft)
        pushToast('新地址已保存', 'success')
      }
      resetAddressForm()
      profileState.reload()
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '保存地址失败', 'error')
    } finally {
      setSavingAddress(false)
    }
  }

  const startEditAddress = (address: Address) => {
    setEditingAddressId(address.id)
    setAddressDraft(toAddressDraft(address))
  }

  const makeDefaultAddress = async (addressId: number) => {
    try {
      setBusyAddressId(addressId)
      await mallApi.setDefaultAddress(addressId)
      profileState.reload()
      pushToast('默认地址已更新', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '设置默认地址失败', 'error')
    } finally {
      setBusyAddressId(null)
    }
  }

  const removeAddress = async (addressId: number) => {
    try {
      setBusyAddressId(addressId)
      await mallApi.deleteAddress(addressId)
      if (editingAddressId === addressId) {
        resetAddressForm()
      }
      profileState.reload()
      pushToast('地址已删除', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '删除地址失败', 'error')
    } finally {
      setBusyAddressId(null)
    }
  }

  const removeOrder = async (orderNo: string) => {
    try {
      setBusyOrderNo(orderNo)
      await mallApi.deleteOrder(orderNo)
      ordersState.reload()
      pushToast('订单已删除', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '删除订单失败', 'error')
    } finally {
      setBusyOrderNo(null)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '退出登录失败', 'error')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <header className="sticky top-0 z-50 w-full bg-slate-50 shadow-sm">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4 md:px-8">
          <div className="flex items-center gap-8">
            <Link className="text-xl font-bold tracking-tighter text-slate-800" to="/">
              Executive Store
            </Link>
            <nav className="hidden gap-6 font-['Manrope'] font-semibold tracking-tight text-slate-600 md:flex">
              <Link className="text-slate-500 transition hover:text-slate-700" to="/">
                首页
              </Link>
              <Link className="text-slate-500 transition hover:text-slate-700" to="/">
                产品
              </Link>
              <Link className="border-b-2 border-slate-500 pb-1 text-slate-900" to="/account">
                订单
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100" to="/cart">
              <MaterialIcon name="shopping_cart" />
              {cartCount ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#545f73] text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>
            <button className="rounded-full border-b-2 border-slate-500 p-2 pb-1 text-slate-900" type="button">
              <MaterialIcon name="account_circle" />
            </button>
          </div>
        </div>
        <div className="h-px w-full bg-slate-100" />
      </header>

      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 items-start gap-8 px-6 py-8 md:px-8 md:py-10">
        <aside className="hidden w-64 shrink-0 self-start rounded-[28px] bg-slate-100 p-6 text-sm antialiased lg:sticky lg:top-28 lg:flex lg:h-[calc(100vh-8rem)] lg:flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <img
                className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                src={resolveStaticAsset(accountAvatar)}
                alt={profile?.nickname ?? '用户头像'}
              />
              <div>
                <p className="font-['Manrope'] text-base font-black text-slate-800">
                  {profile?.nickname ?? '读取中'}
                </p>
                <p className="text-xs text-slate-500">
                  {profile ? getRoleLabel(profile.userRole) : '同步中'}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
            {[
              ['home', '首页', '/'],
              ['category', '商品目录', '/'],
              ['shopping_bag', '购物车', '/cart'],
              ['person', '个人资料', '/account'],
              ['receipt_long', '订单', '/account'],
            ].map(([icon, label, href]) => (
              <Link
                key={label}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition duration-150 hover:translate-x-1 ${label === '个人资料' ? 'bg-white font-bold text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                to={href}
              >
                <MaterialIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-3 pt-8">
            <button
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-500 transition duration-150 hover:bg-slate-200 hover:text-slate-700"
              type="button"
              onClick={handleLogout}
            >
              <MaterialIcon name="logout" />
              <span>退出登录</span>
            </button>

            <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Executive Architect
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-on-surface">
                个人中心
              </h1>
              <p className="font-body text-on-surface-variant">
                管理你的账户信息、历史订单和收货地址。
              </p>
            </div>

            {profile ? (
              <div className="grid gap-2 rounded-xl bg-surface-container-lowest px-6 py-4 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                  当前账户
                </span>
                <strong className="text-lg text-on-surface">{profile.nickname}</strong>
                <span className="text-sm text-on-surface-variant">{profile.email}</span>
              </div>
            ) : (
              <div className="h-24 w-full animate-pulse rounded-xl bg-surface-container-low lg:w-72" />
            )}
          </header>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <section className="rounded-xl bg-surface-container-lowest p-8 shadow-sm lg:flex lg:max-h-[calc(100vh-11rem)] lg:min-h-[34rem] lg:flex-col xl:col-span-7">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <MaterialIcon className="text-primary" name="history" />
                  <h2 className="text-xl font-bold tracking-tight">历史订单</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {orderFilters.map((filter) => (
                    <button
                      key={filter.key}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${orderFilter === filter.key ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}
                      type="button"
                      onClick={() => setOrderFilter(filter.key)}
                    >
                      {filter.label} ({orderCounts[filter.key]})
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-2">
                {ordersState.loading && !ordersState.data
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="animate-pulse rounded-xl bg-surface-container-low p-5">
                        <div className="mb-4 h-4 w-40 rounded bg-surface-container-high" />
                        <div className="mb-3 h-3 w-28 rounded bg-surface-container" />
                        <div className="h-3 w-full rounded bg-surface-container" />
                      </div>
                    ))
                  : null}

                {!ordersState.loading && !visibleOrders.length ? (
                  <div className="rounded-xl border border-dashed border-outline-variant/20 bg-surface-container-low p-6 text-sm text-on-surface-variant">
                    当前筛选下还没有订单记录。
                  </div>
                ) : null}

                {visibleOrders.map((order, index) => {
                  const status = getOrderStatusMeta(order.orderStatus, order.payStatus)
                  const deleting = busyOrderNo === order.orderNo

                  return (
                    <article
                      key={order.orderNo}
                      className="rounded-xl bg-surface-container-low p-5 transition-colors hover:bg-surface-container-high"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white">
                            <MaterialIcon
                              className="text-outline"
                              name={index % 2 === 0 ? 'architecture' : 'villa'}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="font-semibold text-on-surface">{order.orderNo}</p>
                              <StatusPill tone={status.tone}>{status.label}</StatusPill>
                            </div>
                            <p className="text-xs uppercase tracking-wider text-on-surface-variant">
                              {formatShortDate(order.createTime)} / {order.itemCount} 件商品
                            </p>
                            {order.buyerRemark ? (
                              <p className="text-sm text-on-surface-variant">
                                备注：{order.buyerRemark}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-col items-start gap-4 lg:items-end">
                          <p className="text-lg font-bold text-on-surface">
                            {formatMoney(order.payAmount)}
                          </p>
                          <button
                            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/20 px-4 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                            type="button"
                            disabled={deleting}
                            onClick={() => removeOrder(order.orderNo)}
                          >
                            <MaterialIcon name="delete" />
                            {deleting ? '删除中...' : '删除订单'}
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>

            <section className="rounded-xl bg-surface-container-lowest p-8 shadow-sm xl:col-span-5">
              <div className="mb-6 flex items-center gap-3">
                <MaterialIcon className="text-primary" name="location_on" />
                <h2 className="text-xl font-bold tracking-tight">收货地址</h2>
              </div>

              <div className="space-y-4">
                {profileState.loading && !profileState.data
                  ? Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="animate-pulse rounded-xl bg-surface-container-low p-5">
                        <div className="mb-3 h-4 w-32 rounded bg-surface-container-high" />
                        <div className="mb-2 h-3 w-24 rounded bg-surface-container" />
                        <div className="h-3 w-full rounded bg-surface-container" />
                      </div>
                    ))
                  : null}

                {!profileState.loading && !addresses.length ? (
                  <div className="rounded-xl border border-dashed border-outline-variant/20 bg-surface-container-low p-6 text-sm text-on-surface-variant">
                    还没有保存任何收货地址。
                  </div>
                ) : null}

                {addresses.map((address) => {
                  const busy = busyAddressId === address.id

                  return (
                    <article
                      key={address.id}
                      className={`rounded-xl border p-5 transition-colors ${editingAddressId === address.id ? 'border-primary/30 bg-surface-container-high' : 'border-outline-variant/10 bg-surface-container-low'}`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <strong className="text-sm text-on-surface">{address.consigneeName}</strong>
                            {address.defaultAddress ? (
                              <StatusPill tone="brand">默认地址</StatusPill>
                            ) : null}
                          </div>
                          <p className="text-sm text-on-surface-variant">{address.consigneeMobile}</p>
                          <p className="text-sm text-on-surface-variant">{address.detailAddress}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {!address.defaultAddress ? (
                            <button
                              className="rounded-lg border border-outline-variant/20 px-3 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                              type="button"
                              disabled={busy}
                              onClick={() => makeDefaultAddress(address.id)}
                            >
                              设为默认
                            </button>
                          ) : null}
                          <button
                            className="rounded-lg border border-outline-variant/20 px-3 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-white"
                            type="button"
                            onClick={() => startEditAddress(address)}
                          >
                            编辑
                          </button>
                          <button
                            className="rounded-lg border border-outline-variant/20 px-3 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                            type="button"
                            disabled={busy}
                            onClick={() => removeAddress(address.id)}
                          >
                            {busy ? '删除中...' : '删除'}
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}

                <div className="space-y-3 border-t border-outline-variant/10 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-on-surface">
                      {editingAddressId ? '编辑地址' : '新增地址'}
                    </h3>
                    {editingAddressId ? (
                      <button
                        className="text-xs font-semibold text-primary"
                        type="button"
                        onClick={resetAddressForm}
                      >
                        取消编辑
                      </button>
                    ) : null}
                  </div>

                  <input
                    className="w-full rounded-lg border-none bg-surface-container-low px-4 py-3 text-sm outline-none transition-all focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                    placeholder="收货人姓名"
                    value={addressDraft.consigneeName}
                    onChange={(event) =>
                      setAddressDraft((current) => ({
                        ...current,
                        consigneeName: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="w-full rounded-lg border-none bg-surface-container-low px-4 py-3 text-sm outline-none transition-all focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                    placeholder="详细地址"
                    value={addressDraft.detailAddress}
                    onChange={(event) =>
                      setAddressDraft((current) => ({
                        ...current,
                        detailAddress: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="w-full rounded-lg border-none bg-surface-container-low px-4 py-3 text-sm outline-none transition-all focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                    placeholder="手机号"
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
                  <label className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                    <input
                      checked={addressDraft.defaultAddress}
                      className="rounded border-outline-variant/40 text-primary focus:ring-primary"
                      type="checkbox"
                      onChange={(event) =>
                        setAddressDraft((current) => ({
                          ...current,
                          defaultAddress: event.target.checked,
                        }))
                      }
                    />
                    设为默认地址
                  </label>

                  <div className="flex gap-3">
                    <button
                      className="flex-1 rounded-lg bg-primary py-3 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      type="button"
                      disabled={savingAddress}
                      onClick={saveAddress}
                    >
                      {savingAddress
                        ? '保存中...'
                        : editingAddressId
                          ? '保存修改'
                          : '保存新地址'}
                    </button>
                    {editingAddressId ? (
                      <button
                        className="rounded-lg border border-outline-variant/20 px-4 py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container"
                        type="button"
                        onClick={resetAddressForm}
                      >
                        取消
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl bg-surface-container-lowest p-8 shadow-sm xl:col-span-4">
              <div className="mb-6 flex items-center gap-3">
                <MaterialIcon className="text-primary" name="favorite" />
                <h2 className="text-xl font-bold tracking-tight">愿望清单</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-ZA39GBwJGHoY8ZEDtdmgZlaHhwsrFOIMExcezBKJHFZPVMGJH7XaoFtKWjuWym7AEfdvTlVlX5qhphtX7QrWP6YniKRvwiB4iOkxY077jnrg_XKl8NrtVJxsA1m0OdBIo3acwq_wXBtdKnpRHiPNdBqFg7LdhcEYNq4CEZgN36MRDR1PwUwPxZJoSbSu9nLZljY-wb2KOnZTd-V-0nTPz27qDjfFrIJNHTpwJV4TNBU4QQOpthJJL8kRJfwfC24GsHlG8LpbNEY',
                    label: '支撑平台套装',
                  },
                  {
                    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOwFVGevTHoceklAm1ljSfkiVnw4ddty1Xnzi0NymHaSNfuYErWWPlxWlQJl0DQYB3C1y0rLU4qAsTvmUiVSvdTd_nGIG3RSMWndnD-b4ptvo9ckvCTqb7Z0AlaNxMJhgZZozU2jL0a-0BK_VaQbFTi7P9BJcud4pMMEIJLNEfNgzlDe03LxTmQpoi-CVTtlzWE6GaIwE5jScBGr84_k4lQx31P95_MjvuPHOqBCa2A9H2U4YaEmatY5GKWmww6qnCovm8ZUcDeU4',
                    label: '隐黑创意屏',
                  },
                ].map((item) => (
                  <div key={item.label} className="group relative aspect-square overflow-hidden rounded-xl bg-surface-container">
                    <img
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      src={resolveStaticAsset(item.src)}
                      alt={item.label}
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white">
                        {item.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-surface-container-lowest p-8 shadow-sm xl:col-span-8">
              <div className="mb-6 flex items-center gap-3">
                <MaterialIcon className="text-primary" name="settings" />
                <h2 className="text-xl font-bold tracking-tight">安全与设置</h2>
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      电子邮箱
                    </label>
                    <div className="rounded-lg bg-surface-container-low p-3 text-sm font-medium">
                      {profile?.email ?? '读取中'}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      手机号
                    </label>
                    <div className="rounded-lg bg-surface-container-low p-3 text-sm font-medium">
                      {profile?.mobile ?? '读取中'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold">双重身份验证</p>
                      <p className="text-xs text-on-surface-variant">启用后会增强账户安全</p>
                    </div>
                    <div className="relative h-5 w-10 rounded-full bg-primary">
                      <div className="absolute right-1 top-1 h-3 w-3 rounded-full bg-white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-outline-variant/10 py-2">
                    <div>
                      <p className="text-sm font-semibold">营销偏好</p>
                      <p className="text-xs text-on-surface-variant">接收专属新品与活动提醒</p>
                    </div>
                    <div className="relative h-5 w-10 rounded-full bg-surface-variant">
                      <div className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      <footer className="w-full border-t border-slate-200/50 bg-slate-50">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between px-12 py-8 md:flex-row">
          <span className="mb-4 font-headline font-bold text-slate-400 md:mb-0">
            Executive Architect
          </span>
          <div className="flex gap-8 text-xs uppercase tracking-widest text-slate-400">
            <a className="transition-opacity duration-300 hover:text-slate-900" href="#">
              隐私政策
            </a>
            <a className="transition-opacity duration-300 hover:text-slate-900" href="#">
              服务条款
            </a>
            <a className="transition-opacity duration-300 hover:text-slate-900" href="#">
              配送信息
            </a>
            <a className="transition-opacity duration-300 hover:text-slate-900" href="#">
              联系我们
            </a>
          </div>
          <p className="mt-4 text-xs uppercase tracking-widest text-slate-400 md:mt-0">
            © 2024 Executive Architect Storefront
          </p>
        </div>
      </footer>
    </div>
  )
}
