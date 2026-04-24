import { Link, useSearchParams } from 'react-router-dom'
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

export function ProductsPage() {
  useDocumentTitle('商品列表 | Executive Store')

  const { isAuthenticated, openLogin } = useAuth()
  const { pushToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const keyword = searchParams.get('keyword')?.trim() ?? ''
  const categoryId = Number(searchParams.get('categoryId') || '') || undefined

  const categoriesState = useAsyncData(() => mallApi.getCategories(), [])
  const catalogState = useAsyncData(
    () =>
      mallApi.getCatalog({
        categoryId,
        keyword,
        limit: 24,
      }),
    [categoryId ?? 0, keyword],
  )

  const categories = categoriesState.data ?? []
  const products = catalogState.data ?? []
  const activeCategory = categories.find((item) => item.categoryId === categoryId)

  const applyFilters = (next: { categoryId?: number; keyword?: string }) => {
    const nextParams = new URLSearchParams()
    if (next.categoryId) {
      nextParams.set('categoryId', String(next.categoryId))
    }
    if (next.keyword?.trim()) {
      nextParams.set('keyword', next.keyword.trim())
    }
    setSearchParams(nextParams)
  }

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

  if (!catalogState.loading && !products.length) {
    return (
      <StorefrontShell activeNav="products" searchKeyword={keyword}>
        <MessageCard
          title="没有找到匹配商品"
          description="可以清空筛选条件后重新浏览，也可以返回首页查看推荐商品。"
          actionLabel="查看全部商品"
          onAction={() => applyFilters({})}
        />
      </StorefrontShell>
    )
  }

  return (
    <StorefrontShell activeNav="products" searchKeyword={keyword}>
      <section className="border-b border-slate-200/60 bg-slate-50">
        <div className="mx-auto max-w-screen-2xl px-6 py-12 md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Product Directory
              </span>
              <h1 className="mt-3 font-headline text-4xl font-extrabold tracking-tight text-slate-900">
                {keyword
                  ? `搜索 “${keyword}” 的结果`
                  : activeCategory
                    ? translateCategoryName(activeCategory.categoryName)
                    : '全部商品'}
              </h1>
            </div>

            <div className="grid gap-2 rounded-2xl bg-white px-6 py-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                当前结果
              </span>
              <strong className="text-2xl text-slate-900">{products.length}</strong>
              <span className="text-sm text-slate-500">件可售商品</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                !categoryId
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 shadow-sm hover:text-slate-900'
              }`}
              type="button"
              onClick={() => applyFilters({ keyword })}
            >
              全部
            </button>
            {categories.map((category) => (
              <button
                key={category.categoryId}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  categoryId === category.categoryId
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 shadow-sm hover:text-slate-900'
                }`}
                type="button"
                onClick={() =>
                  applyFilters({
                    categoryId: category.categoryId,
                    keyword,
                  })
                }
              >
                {translateCategoryName(category.categoryName)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-6 py-10 md:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {catalogState.loading && !products.length
            ? Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-3xl bg-slate-100 p-4">
                  <div className="aspect-[4/5] rounded-2xl bg-slate-200" />
                  <div className="mt-4 h-4 w-2/3 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                </div>
              ))
            : null}

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
                    <h2 className="mt-2 font-headline text-xl font-bold tracking-tight text-slate-900">
                      {product.skuName}
                    </h2>
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
