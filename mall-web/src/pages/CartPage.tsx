import { Link, useNavigate } from 'react-router-dom'
import { mallApi } from '../api/mallApi'
import { MaterialIcon, MessageCard } from '../components/PageBits'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatMoney, sumBy } from '../lib/format'
import { getProductImage, translateCategoryName } from '../lib/productVisuals'

export function CartPage() {
  useDocumentTitle('购物车 - 尊享商城')

  const navigate = useNavigate()
  const { isAuthenticated, openLogin, session } = useAuth()
  const { pushToast } = useToast()

  const cartState = useAsyncData(
    () => mallApi.getCartItemsDetailed(),
    [session?.userId ?? 0],
    { enabled: isAuthenticated },
  )

  if (!isAuthenticated) {
    return (
      <MessageCard
        title="登录后才能查看购物车"
        description="购物车和当前登录用户绑定，请先登录后再继续。"
        actionLabel="去登录"
        onAction={openLogin}
      />
    )
  }


  const items = cartState.data ?? []
  const isCartPending = cartState.loading && !cartState.data
  const cartCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = sumBy(items, (item) => item.subtotal)
  const shipping = subtotal >= 1000 ? 0 : 25
  const tax = Math.round(subtotal * 0.08 * 100) / 100
  const total = subtotal + shipping + tax

  const updateQuantity = async (skuId: number, current: number, next: number) => {
    try {
      if (next <= 0) {
        await mallApi.deleteCartItem(skuId)
      } else if (next > current) {
        await mallApi.addCartItem(skuId, next - current)
      } else {
        await mallApi.deleteCartItem(skuId)
        await mallApi.addCartItem(skuId, next)
      }
      cartState.reload()
      pushToast('购物车已更新', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '更新购物车失败', 'error')
    }
  }

  const removeItem = async (skuId: number) => {
    try {
      await mallApi.deleteCartItem(skuId)
      cartState.reload()
      pushToast('商品已移除', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '移除商品失败', 'error')
    }
  }

  if (!items.length && !isCartPending) {
    return (
      <MessageCard
        title="购物车还是空的"
        description="先从首页挑几件商品加入购物车，再回来继续结算。"
        actionLabel="继续购物"
        actionHref="/"
      />
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <header className="sticky top-0 z-50 w-full bg-slate-50 shadow-sm">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4 md:px-8">
          <div className="flex items-center gap-8">
            <Link className="font-headline text-xl font-bold tracking-tighter text-slate-800" to="/">
              尊享商城
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link className="font-headline font-semibold tracking-tight text-slate-500 transition hover:text-slate-700" to="/">
                首页
              </Link>
              <Link className="font-headline font-semibold tracking-tight text-slate-500 transition hover:text-slate-700" to="/">
                商品
              </Link>
              <Link className="font-headline font-semibold tracking-tight text-slate-500 transition hover:text-slate-700" to="/account/profile">
                订单
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link className="relative flex items-center rounded-full border-b-2 border-slate-500 p-2 pb-1 text-slate-900 transition-colors hover:bg-slate-100" to="/cart">
              <MaterialIcon name="shopping_cart" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                {cartCount}
              </span>
            </Link>
            <Link className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100" to="/account/profile">
              <MaterialIcon name="account_circle" />
            </Link>
          </div>
        </div>
        <div className="h-px w-full bg-slate-100" />
      </header>

      <main className="mx-auto w-full max-w-screen-2xl flex-grow px-6 py-12 md:px-8">
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="flex-grow">
            <div className="mb-8 flex items-baseline justify-between">
              <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-on-surface">
                您的购物车
              </h1>
              <span className="font-medium text-on-surface-variant">({cartCount} 件商品)</span>
            </div>

            <div className="space-y-6">
              {items.map((item, index) => (
                <article
                  key={item.skuId}
                  className="group flex flex-col items-center gap-6 rounded-xl bg-surface-container-lowest p-6 transition-all duration-300 sm:flex-row"
                >
                  <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container">
                    <img
                      className="h-full w-full object-cover"
                      src={getProductImage(item.detail?.mainImageUrl, index)}
                      alt={item.skuName}
                    />
                  </div>
                  <div className="flex-grow space-y-1">
                    <h3 className="font-headline text-lg font-bold text-on-surface">
                      {item.skuName}
                    </h3>
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                      {translateCategoryName(item.detail?.categoryName)} / {item.detail?.spuName}
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      <span className="text-xl font-bold text-primary">
                        {formatMoney(item.salePrice)}
                      </span>
                      <span className="text-sm text-on-surface-variant line-through">
                        {formatMoney(item.detail?.marketPrice)}
                      </span>
                    </div>
                  </div>
                  <div className="flex self-stretch flex-col items-end justify-between gap-4">
                    <div className="flex items-center rounded-lg bg-surface-container-low p-1">
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container-high"
                        type="button"
                        onClick={() => updateQuantity(item.skuId, item.quantity, item.quantity - 1)}
                      >
                        <MaterialIcon className="text-lg" name="remove" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container-high"
                        type="button"
                        onClick={() => updateQuantity(item.skuId, item.quantity, item.quantity + 1)}
                      >
                        <MaterialIcon className="text-lg" name="add" />
                      </button>
                    </div>
                    <button
                      className="flex items-center gap-1 text-xs font-semibold text-on-surface-variant transition-colors hover:text-error"
                      type="button"
                      onClick={() => removeItem(item.skuId)}
                    >
                      <MaterialIcon className="text-sm" name="delete" />
                      删除
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-6 sm:flex-row">
              <Link
                className="flex items-center gap-2 font-headline font-semibold text-on-surface transition-all duration-300 hover:gap-4"
                to="/"
              >
                <MaterialIcon name="arrow_back" />
                继续购物
              </Link>
              <div className="flex w-full items-center gap-4 sm:w-auto">
                <input
                  className="w-full rounded-lg border-none bg-surface-container-low px-4 py-3 text-sm uppercase tracking-widest focus:ring-1 focus:ring-primary sm:w-auto"
                  placeholder="优惠码"
                />
                <button className="whitespace-nowrap rounded-lg bg-surface-container-high px-6 py-3 text-sm font-bold transition-colors hover:bg-surface-variant">
                  应用
                </button>
              </div>
            </div>
          </div>

          <aside className="w-full lg:w-[400px]">
            <div className="sticky top-28 rounded-xl bg-surface-container-low p-8">
              <h2 className="mb-8 font-headline text-2xl font-extrabold tracking-tighter text-on-surface">
                订单摘要
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">小计</span>
                  <span className="font-bold text-on-surface">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">预估运费</span>
                  <span className="font-bold text-on-surface">{formatMoney(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">预估税费</span>
                  <span className="font-bold text-on-surface">{formatMoney(tax)}</span>
                </div>
                <div className="my-6 h-px w-full bg-outline-variant/10" />
                <div className="mb-8 flex items-end justify-between">
                  <span className="font-headline text-lg font-bold tracking-tight">总价</span>
                  <span className="font-headline text-3xl font-extrabold tracking-tighter text-primary">
                    {formatMoney(total)}
                  </span>
                </div>
                <button
                  className="w-full rounded-xl bg-gradient-to-br from-primary to-primary-dim py-5 font-headline text-xs font-extrabold uppercase tracking-widest text-on-primary shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                  type="button"
                  onClick={() => navigate('/checkout')}
                >
                  去结算
                </button>
                <p className="pt-4 text-center text-[10px] uppercase tracking-widest text-on-surface-variant">
                  通过建筑级支付网关安全处理
                </p>
              </div>

              <div className="mt-8 border-t border-outline-variant/10 pt-8">
                <div className="mb-4 flex items-center gap-4">
                  <MaterialIcon className="text-primary" name="local_shipping" />
                  <div>
                    <h4 className="text-xs font-bold font-headline">免运费</h4>
                    <p className="text-[10px] text-on-surface-variant">订单满 ¥1,000 即可享受</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MaterialIcon className="text-primary" name="verified_user" />
                  <div>
                    <h4 className="text-xs font-bold font-headline">安全资产</h4>
                    <p className="text-[10px] text-on-surface-variant">包含延长保护计划</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-auto w-full border-t border-slate-200/50 bg-slate-50">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between px-12 py-8 md:flex-row">
          <span className="font-headline font-bold text-slate-400">尊享建筑师</span>
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
          <span className="text-xs uppercase tracking-widest text-slate-400">
            © 2024 尊享建筑师商城。保留所有权利。
          </span>
        </div>
      </footer>
    </div>
  )
}
