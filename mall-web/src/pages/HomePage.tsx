import { Link } from 'react-router-dom'
import { mallApi } from '../api/mallApi'
import { MaterialIcon, MessageCard } from '../components/PageBits'
import { StorefrontShell } from '../components/StorefrontShell'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { emitCartUpdated } from '../lib/cartEvents'
import { formatMoney } from '../lib/format'
import { getProductImage, translateCategoryName } from '../lib/productVisuals'

export function HomePage() {
  useDocumentTitle('商城首页 | Executive Store')

  const { isAuthenticated, openLogin } = useAuth()
  const { pushToast } = useToast()

  const categoriesState = useAsyncData(() => mallApi.getCategories(), [])
  const featuredState = useAsyncData(() => mallApi.getCatalog({ limit: 8 }), [])

  const categories = categoriesState.data ?? []
  const products = featuredState.data ?? []
  const hero = products[0]

  const addToCart = async (skuId: number) => {
    if (!isAuthenticated) {
      openLogin()
      return
    }

    try {
      await mallApi.addCartItem(skuId, 1)
      emitCartUpdated()
      pushToast('商品已加入购物车', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '加入购物车失败', 'error')
    }
  }

  if (!hero && !featuredState.loading) {
    return (
      <StorefrontShell activeNav="home">
        <MessageCard
          title="暂时没有可展示的商品"
          description="请确认商品服务已经启动，然后刷新重试。"
          actionLabel="刷新重试"
          onAction={() => featuredState.reload()}
        />
      </StorefrontShell>
    )
  }

  return (
    <StorefrontShell activeNav="home">
      {hero ? (
        <section className="border-b border-slate-200/60 bg-slate-50">
          <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-10 px-6 py-12 md:px-8 lg:grid-cols-12 lg:items-center lg:py-16">
            <div className="lg:col-span-5">
              <span className="inline-flex rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
                中小商城精选首页
              </span>
              <h1 className="mt-6 font-headline text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 md:text-6xl">
                商城首页
                <br />
                精选正在上新
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-500">
                这里汇集了本周主推单品和热门分类，想逛新品、加购物车或直接下单，都可以从这里快速开始。
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  className="rounded-2xl bg-[#545f73] px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
                  to="/products"
                >
                  查看全部商品
                </Link>
                <Link
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  to="/account/profile"
                >
                  进入个人中心
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {categories.map((category) => (
                  <Link
                    key={category.categoryId}
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:text-slate-900"
                    to={`/products?categoryId=${category.categoryId}`}
                  >
                    {translateCategoryName(category.categoryName)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-white shadow-[0_30px_80px_rgba(42,52,57,0.12)] lg:col-span-7">
              <img
                className="h-[420px] w-full object-cover md:h-[520px]"
                src={getProductImage(hero.mainImageUrl)}
                alt={hero.skuName}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/20 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 rounded-3xl bg-white/90 px-6 py-5 shadow-lg backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  本期推荐
                </p>
                <h2 className="mt-2 font-headline text-2xl font-bold text-slate-900">{hero.skuName}</h2>
                <p className="mt-2 max-w-md text-sm text-slate-500">{hero.sellingPoint}</p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-screen-2xl px-6 py-12 md:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Featured Products
            </span>
            <h2 className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-slate-900">
              首页精选商品
            </h2>
          </div>

          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
            to="/products"
          >
            前往商品页
            <MaterialIcon name="arrow_forward" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product, index) => (
            <article
              key={product.skuId}
              className="group overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_20px_50px_rgba(42,52,57,0.06)] transition hover:-translate-y-1"
            >
              <Link className="block" to={`/products/${product.skuId}`}>
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                  <img
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={getProductImage(product.mainImageUrl, index)}
                    alt={product.skuName}
                  />
                </div>
              </Link>

              <div className="grid gap-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      {translateCategoryName(product.categoryName)}
                    </p>
                    <h3 className="mt-2 font-headline text-xl font-bold tracking-tight text-slate-900">
                      {product.skuName}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{product.sellingPoint}</p>
                  </div>
                  <span className="font-headline text-lg font-bold text-slate-900">
                    {formatMoney(product.salePrice)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    to={`/products/${product.skuId}`}
                  >
                    查看详情
                  </Link>
                  <button
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#545f73] text-white transition hover:opacity-90"
                    type="button"
                    onClick={() => addToCart(product.skuId)}
                  >
                    <MaterialIcon name="add_shopping_cart" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

    </StorefrontShell>
  )
}
