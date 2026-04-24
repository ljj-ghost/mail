import { Link } from 'react-router-dom'
import type { ProductSkuCard } from '../api/types'
import { formatMoney } from '../lib/format'
import { translateCategoryName } from '../lib/productVisuals'
import { ProductArtwork } from './ProductArtwork'

export function ProductCard({ product }: { product: ProductSkuCard }) {
  const savings = Math.max(0, Number(product.marketPrice) - Number(product.salePrice))

  return (
    <article className="product-card">
      <Link className="product-card__visual" to={`/products/${product.skuId}`}>
        <ProductArtwork
          imageKey={product.mainImageUrl}
          title={product.spuName}
          subtitle={translateCategoryName(product.categoryName)}
          mode="card"
        />
      </Link>

      <div className="product-card__body">
        <div className="product-card__head">
          <span className="product-card__eyebrow">
            {translateCategoryName(product.categoryName)}
          </span>
          <span
            className={`status-badge ${
              product.status === 1 ? 'status-badge--positive' : 'status-badge--neutral'
            }`}
          >
            {product.status === 1 ? '现货在售' : '暂未上架'}
          </span>
        </div>

        <div className="product-card__title">
          <h3>{product.skuName}</h3>
          <p>{product.sellingPoint}</p>
        </div>

        <div className="product-card__footer">
          <div className="product-card__price-block">
            <strong>{formatMoney(product.salePrice)}</strong>
            <span>市场价 {formatMoney(product.marketPrice)}</span>
            <small>立省 {formatMoney(savings)}</small>
          </div>

          <Link className="button button--ghost" to={`/products/${product.skuId}`}>
            查看详情
          </Link>
        </div>
      </div>
    </article>
  )
}
