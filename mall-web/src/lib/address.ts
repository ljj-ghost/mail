import type { AddressDraft } from '../api/types'

const CN_MOBILE_PATTERN = /^1\d{10}$/

export const emptyAddressDraft: AddressDraft = {
  consigneeName: '',
  consigneeMobile: '',
  detailAddress: '',
  defaultAddress: false,
}

export function sanitizeMobileInput(value: string) {
  return value.replace(/\D/g, '').slice(0, 11)
}

export function normalizeAddressDraft(draft: AddressDraft): AddressDraft {
  return {
    consigneeName: draft.consigneeName.trim(),
    consigneeMobile: sanitizeMobileInput(draft.consigneeMobile),
    detailAddress: draft.detailAddress.trim(),
    defaultAddress: Boolean(draft.defaultAddress),
  }
}

export function validateAddressDraft(draft: AddressDraft) {
  if (!draft.consigneeName) {
    return '请填写收货人姓名'
  }

  if (!CN_MOBILE_PATTERN.test(draft.consigneeMobile)) {
    return '手机号需为 1 开头的 11 位手机号'
  }

  if (!draft.detailAddress) {
    return '请填写详细地址'
  }

  return null
}
