export const MALL_CART_UPDATED_EVENT = 'mall-cart-updated'

export function emitCartUpdated() {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(MALL_CART_UPDATED_EVENT))
}
