import type { CSSProperties } from 'react'
import { getVisualTheme } from '../lib/productVisuals'

export function ProductArtwork({
  imageKey,
  title,
  subtitle,
  mode = 'card',
}: {
  imageKey?: string
  title: string
  subtitle?: string
  mode?: 'hero' | 'detail' | 'card' | 'mini'
}) {
  const theme = getVisualTheme(imageKey)
  const style = {
    '--art-primary': theme.primary,
    '--art-secondary': theme.secondary,
    '--art-glow': theme.glow,
    '--art-ink': theme.ink,
  } as CSSProperties

  return (
    <div
      className={`product-art product-art--${mode} product-art--${theme.kind}`}
      style={style}
    >
      <div className="product-art__noise" />
      <div className="product-art__orb product-art__orb--one" />
      <div className="product-art__orb product-art__orb--two" />
      <div className="product-art__panel" />

      <div className="product-art__shape-wrap">
        <span className="product-art__shape product-art__shape--main" />
        <span className="product-art__shape product-art__shape--accent" />
        <span className="product-art__shape product-art__shape--detail" />
      </div>

      <div className="product-art__meta">
        <span>{theme.label}</span>
        <strong>{title}</strong>
        {subtitle ? <small>{subtitle}</small> : null}
      </div>
    </div>
  )
}
