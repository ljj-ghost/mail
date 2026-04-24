import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { mallApi } from '../api/mallApi'
import { LoadingScreen, MaterialIcon, MessageCard } from '../components/PageBits'
import { StorefrontShell } from '../components/StorefrontShell'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { emitCartUpdated } from '../lib/cartEvents'
import { formatMoney } from '../lib/format'
import { getProductGallery, getProductImage, translateCategoryName } from '../lib/productVisuals'

export function ProductPage() {
  const params = useParams()
  const skuId = Number(params.skuId || '')
  const navigate = useNavigate()
  const { isAuthenticated, openLogin } = useAuth()
  const { pushToast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const detailState = useAsyncData(
    () => mallApi.getProductDetail(skuId),
    [skuId],
    { enabled: Number.isFinite(skuId) && skuId > 0 },
  )
  const siblingState = useAsyncData(
    async () => (detailState.data ? mallApi.getSpuSkus(detailState.data.spuId) : []),
    [detailState.data?.spuId ?? 0],
    { enabled: Boolean(detailState.data?.spuId) },
  )

  const detail = detailState.data
  useDocumentTitle(detail ? `${detail.skuName} | Executive Store` : '商品详情 | Executive Store')

  const gallery = useMemo(() => getProductGallery(detail?.mainImageUrl), [detail?.mainImageUrl])

  if (!skuId) {
    return (
      <StorefrontShell activeNav="products">
        <MessageCard
          title="商品编号无效"
          description="请从商品页重新进入商品详情。"
          actionLabel="返回商品页"
          actionHref="/products"
        />
      </StorefrontShell>
    )
  }

  if (!detail && !detailState.loading) {
    return (
      <StorefrontShell activeNav="products">
        <MessageCard
          title="没有找到这件商品"
          description="这件商品可能已经下架，或者暂时没有读取到详情数据。"
          actionLabel="返回商品页"
          actionHref="/products"
        />
      </StorefrontShell>
    )
  }

  if (!detail) {
    return (
      <StorefrontShell activeNav="products">
        <LoadingScreen label="正在加载商品详情" />
      </StorefrontShell>
    )
  }

  const doAddToCart = async (goCheckout = false) => {
    if (!isAuthenticated) {
      openLogin()
      return
    }

    try {
      setSubmitting(true)
      await mallApi.addCartItem(detail.skuId, quantity)
      emitCartUpdated()
      pushToast(goCheckout ? '已加入购物车，正在进入结算' : '商品已加入购物车', 'success')
      if (goCheckout) {
        navigate('/checkout')
      }
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '加入购物车失败', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const currentImage = gallery[selectedIndex] ?? getProductImage(detail.mainImageUrl)

  return (
    <StorefrontShell activeNav="products">
      <main className="mx-auto max-w-screen-2xl px-6 py-12 md:px-8 md:py-20 lg:flex lg:gap-16">
        <div className="space-y-6 lg:w-3/5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-surface-container-lowest shadow-editorial md:aspect-[5/4]">
            <img className="h-full w-full object-cover" src={currentImage} alt={detail.skuName} />
          </div>

          <div className="grid grid-cols-4 gap-4">
            {gallery.map((image, index) => (
              <button
                key={image}
                className={`aspect-square overflow-hidden rounded-2xl border bg-surface-container-lowest ${
                  selectedIndex === index
                    ? 'border-primary/40 ring-2 ring-primary/20'
                    : 'border-outline-variant/10'
                }`}
                type="button"
                onClick={() => setSelectedIndex(index)}
              >
                <img className="h-full w-full object-cover" src={image} alt={`${detail.skuName} ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col lg:mt-0 lg:w-2/5">
          <nav className="mb-6 flex gap-2 text-[10px] font-medium uppercase tracking-[0.1em] text-outline">
            <Link to="/products">商品</Link>
            <span>/</span>
            <span>{translateCategoryName(detail.categoryName)}</span>
            <span>/</span>
            <span className="text-on-surface">{detail.brandName}</span>
          </nav>

          <h1 className="mb-2 font-headline text-4xl font-extrabold leading-none tracking-tighter text-on-surface md:text-5xl">
            {detail.skuName}
          </h1>

          <div className="mb-8 flex items-center gap-4">
            <div className="flex text-primary">
              {Array.from({ length: 4 }).map((_, index) => (
                <MaterialIcon key={index} className="text-sm" name="star" fill />
              ))}
              <MaterialIcon className="text-sm" name="star_half" fill />
            </div>
            <span className="text-xs font-semibold tracking-wider text-outline">(128 条评价)</span>
          </div>

          <div className="mb-8 text-3xl font-bold text-on-surface">{formatMoney(detail.salePrice)}</div>

          <p className="mb-10 max-w-prose text-sm leading-relaxed text-on-surface-variant">
            {detail.description}
          </p>

          <div className="mb-12 space-y-10">
            <div className="space-y-4">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface">
                选择配色
              </span>
              <div className="flex gap-4">
                {['#1a1a1a', '#cfdce3', '#9f403d'].map((color, index) => (
                  <button
                    key={color}
                    className={`h-8 w-8 rounded-full ring-2 ring-offset-4 transition-all ${
                      index === 0 ? 'ring-primary' : 'ring-transparent hover:ring-surface-variant'
                    }`}
                    style={{ backgroundColor: color }}
                    type="button"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface">
                  选择数量
                </span>
                <button className="text-[10px] font-semibold text-primary underline underline-offset-4" type="button">
                  购买建议
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-container-low text-lg font-bold text-on-surface transition hover:bg-surface-container-high"
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                >
                  -
                </button>
                <span className="w-12 text-center font-headline text-lg font-bold">{quantity}</span>
                <button
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-container-low text-lg font-bold text-on-surface transition hover:bg-surface-container-high"
                  type="button"
                  onClick={() => setQuantity((value) => value + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-auto grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              className="rounded-xl bg-gradient-to-br from-primary to-primary-dim py-5 text-xs font-bold uppercase tracking-widest text-on-primary shadow-editorial transition-opacity hover:opacity-90"
              type="button"
              disabled={submitting}
              onClick={() => doAddToCart(false)}
            >
              加入购物车
            </button>
            <button
              className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest py-5 text-xs font-bold uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-container-low"
              type="button"
              disabled={submitting}
              onClick={() => doAddToCart(true)}
            >
              立即购买
            </button>
          </div>

          <div className="mt-12 flex items-center gap-12 border-t border-outline-variant/10 pt-8">
            <div className="flex items-center gap-3">
              <MaterialIcon className="text-lg text-primary" name="local_shipping" />
              <span className="text-[10px] font-bold uppercase tracking-wider">包邮送达</span>
            </div>
            <div className="flex items-center gap-3">
              <MaterialIcon className="text-lg text-primary" name="verified" />
              <span className="text-[10px] font-bold uppercase tracking-wider">品质保障</span>
            </div>
          </div>
        </div>
      </main>

      {siblingState.data?.length ? (
        <section className="mx-auto max-w-screen-2xl px-6 py-16 md:px-8">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <h2 className="font-headline text-2xl font-bold tracking-tighter text-on-surface">
                同系列商品
              </h2>
              <p className="text-sm text-on-surface-variant">切换到同一 SPU 下的其他 SKU 版本。</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {siblingState.data.map((item, index) => (
              <Link
                key={item.skuId}
                className={`overflow-hidden rounded-xl border bg-white shadow-editorial transition hover:-translate-y-1 ${
                  item.skuId === detail.skuId ? 'border-primary/30' : 'border-outline-variant/10'
                }`}
                to={`/products/${item.skuId}`}
              >
                <img
                  className="aspect-[4/3] w-full object-cover"
                  src={getProductImage(item.mainImageUrl, index)}
                  alt={item.skuName}
                />
                <div className="grid gap-3 p-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline">
                    {translateCategoryName(item.categoryName)}
                  </span>
                  <strong className="font-headline text-lg tracking-tight text-on-surface">
                    {item.skuName}
                  </strong>
                  <span className="text-sm text-primary">{formatMoney(item.salePrice)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </StorefrontShell>
  )
}
