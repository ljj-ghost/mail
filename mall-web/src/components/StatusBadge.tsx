import {
  getOrderBadge,
  getPaymentBadge,
  getSessionBadge,
  type BadgeInfo,
} from '../lib/format'

function BaseBadge({ badge }: { badge: BadgeInfo }) {
  return <span className={`status-badge status-badge--${badge.tone}`}>{badge.label}</span>
}

export function OrderStatusBadge({
  orderStatus,
  payStatus,
}: {
  orderStatus: number
  payStatus: number
}) {
  return <BaseBadge badge={getOrderBadge(orderStatus, payStatus)} />
}

export function PaymentStatusBadge({ payStatus }: { payStatus: number }) {
  return <BaseBadge badge={getPaymentBadge(payStatus)} />
}

export function SessionStatusBadge({ status }: { status: number }) {
  return <BaseBadge badge={getSessionBadge(status)} />
}
