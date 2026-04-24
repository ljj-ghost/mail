export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'brand'

export interface StatusMeta {
  label: string
  tone: Tone
}

export type BadgeInfo = StatusMeta

const moneyFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  maximumFractionDigits: 2,
})

const dateTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const shortDateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function formatMoney(value: number | string | null | undefined) {
  return moneyFormatter.format(Number(value ?? 0))
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return '暂无记录'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return dateTimeFormatter.format(parsed)
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return '暂无日期'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return shortDateFormatter.format(parsed)
}

export function getRoleLabel(role?: string) {
  return role === 'ADMIN' ? '管理员' : '会员'
}

export function getUserStatusLabel(status: number) {
  return status === 1
    ? ({ label: '活跃', tone: 'success' } satisfies StatusMeta)
    : ({ label: '停用', tone: 'danger' } satisfies StatusMeta)
}

export function getOrderStatusMeta(orderStatus: number, payStatus: number): StatusMeta {
  if (orderStatus === 50) {
    return { label: '已取消', tone: 'danger' }
  }

  if (orderStatus === 40) {
    return { label: '已完成', tone: 'success' }
  }

  if (orderStatus === 30 && payStatus === 2) {
    return { label: '待收货', tone: 'brand' }
  }

  if (payStatus === 2 && orderStatus === 20) {
    return { label: '待发货', tone: 'brand' }
  }

  if (payStatus === 2) {
    return { label: '已支付', tone: 'success' }
  }

  if (orderStatus === 10) {
    return { label: '待支付', tone: 'warning' }
  }

  return { label: '处理中', tone: 'neutral' }
}

export function getOrderBadge(orderStatus: number, payStatus: number) {
  return getOrderStatusMeta(orderStatus, payStatus)
}

export function getPaymentStatusMeta(payStatus: number): StatusMeta {
  if (payStatus === 2) {
    return { label: '支付成功', tone: 'success' }
  }

  if (payStatus === 4) {
    return { label: '已关闭', tone: 'danger' }
  }

  return { label: '待支付', tone: 'warning' }
}

export function getPaymentBadge(payStatus: number) {
  return getPaymentStatusMeta(payStatus)
}

export function getSessionStatusMeta(status: number): StatusMeta {
  if (status === 1) {
    return { label: '在线', tone: 'success' }
  }

  if (status === 2) {
    return { label: '已失效', tone: 'danger' }
  }

  if (status === 3) {
    return { label: '已登出', tone: 'neutral' }
  }

  return { label: '未知', tone: 'neutral' }
}

export function getSessionBadge(status: number) {
  return getSessionStatusMeta(status)
}

export function getPaymentChannelLabel(channel: number) {
  if (channel === 2) {
    return '电子钱包'
  }

  if (channel === 3) {
    return '银行转账'
  }

  return '在线支付'
}

export function sumBy<T>(items: T[], selector: (item: T) => number) {
  return items.reduce((total, item) => total + selector(item), 0)
}
