import { useState } from 'react'
import type { Address, AddressDraft, UserSession } from '../api/types'
import { mallApi } from '../api/mallApi'
import { AccountShell } from '../components/AccountShell'
import { LoadingScreen, MaterialIcon, MessageCard, StatusPill } from '../components/PageBits'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
  emptyAddressDraft,
  normalizeAddressDraft,
  sanitizeMobileInput,
  validateAddressDraft,
} from '../lib/address'
import { formatDateTime, getRoleLabel, getSessionStatusMeta } from '../lib/format'

function toAddressDraft(address: Address): AddressDraft {
  return {
    consigneeName: address.consigneeName,
    consigneeMobile: address.consigneeMobile,
    detailAddress: address.detailAddress,
    defaultAddress: address.defaultAddress,
  }
}

function normalizeSessions(sessions: UserSession[]) {
  return sessions.slice().sort((left, right) => {
    return new Date(right.lastActiveTime).getTime() - new Date(left.lastActiveTime).getTime()
  })
}

export function AccountProfilePage() {
  useDocumentTitle('个人资料 | Executive Store')

  const { isAuthenticated, session } = useAuth()
  const { pushToast } = useToast()
  const [addressDraft, setAddressDraft] = useState<AddressDraft>(emptyAddressDraft)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [savingAddress, setSavingAddress] = useState(false)
  const [busyAddressId, setBusyAddressId] = useState<number | null>(null)

  const profileState = useAsyncData(
    async () => {
      const [profile, addresses, sessions] = await Promise.all([
        mallApi.getCurrentUser(),
        mallApi.getAddresses(),
        mallApi.getSessions().catch(() => []),
      ])

      return {
        profile,
        addresses,
        sessions: normalizeSessions(sessions),
      }
    },
    [session?.userId ?? 0],
    { enabled: isAuthenticated },
  )

  const resetAddressForm = () => {
    setEditingAddressId(null)
    setAddressDraft(emptyAddressDraft)
  }

  const saveAddress = async () => {
    const draft = normalizeAddressDraft(addressDraft)
    const validationError = validateAddressDraft(draft)
    if (validationError) {
      pushToast(validationError, 'error')
      return
    }

    try {
      setSavingAddress(true)
      if (editingAddressId) {
        await mallApi.updateAddress(editingAddressId, draft)
        pushToast('收货地址已更新', 'success')
      } else {
        await mallApi.createAddress(draft)
        pushToast('新地址已保存', 'success')
      }
      resetAddressForm()
      profileState.reload()
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '保存地址失败', 'error')
    } finally {
      setSavingAddress(false)
    }
  }

  const startEditAddress = (address: Address) => {
    setEditingAddressId(address.id)
    setAddressDraft(toAddressDraft(address))
  }

  const makeDefaultAddress = async (addressId: number) => {
    try {
      setBusyAddressId(addressId)
      await mallApi.setDefaultAddress(addressId)
      profileState.reload()
      pushToast('默认地址已更新', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '设置默认地址失败', 'error')
    } finally {
      setBusyAddressId(null)
    }
  }

  const removeAddress = async (addressId: number) => {
    try {
      setBusyAddressId(addressId)
      await mallApi.deleteAddress(addressId)
      if (editingAddressId === addressId) {
        resetAddressForm()
      }
      profileState.reload()
      pushToast('地址已删除', 'success')
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '删除地址失败', 'error')
    } finally {
      setBusyAddressId(null)
    }
  }

  const data = profileState.data

  return (
    <AccountShell
      activeSection="profile"
      title="个人资料"
    >
      {!data && profileState.loading ? <LoadingScreen label="正在加载个人资料" /> : null}

      {!data && !profileState.loading ? (
        <MessageCard
          title="个人资料暂时不可用"
          description="请确认网关和用户服务已经正常启动后再试。"
          actionLabel="返回首页"
          actionHref="/"
        />
      ) : null}

      {data ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="rounded-[28px] bg-white p-8 shadow-sm xl:col-span-5">
            <div className="mb-6 flex items-center gap-3">
              <MaterialIcon className="text-primary" name="person" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900">基本信息</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  昵称
                </p>
                <strong className="mt-3 block text-lg text-slate-900">{data.profile.nickname}</strong>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  角色
                </p>
                <strong className="mt-3 block text-lg text-slate-900">
                  {getRoleLabel(data.profile.userRole)}
                </strong>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  邮箱
                </p>
                <strong className="mt-3 block break-all text-base text-slate-900">
                  {data.profile.email || '未绑定'}
                </strong>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  手机号
                </p>
                <strong className="mt-3 block text-base text-slate-900">
                  {data.profile.mobile || '未绑定'}
                </strong>
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">登录设备</p>
                    <p className="text-xs text-slate-500">当前共 {data.sessions.length} 个会话</p>
                  </div>
                  <StatusPill tone="brand">已同步</StatusPill>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">收货地址</p>
                    <p className="text-xs text-slate-500">当前共 {data.addresses.length} 个地址</p>
                  </div>
                  <StatusPill tone="success">正常</StatusPill>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-8 shadow-sm xl:col-span-7">
            <div className="mb-6 flex items-center gap-3">
              <MaterialIcon className="text-primary" name="location_on" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900">收货地址</h2>
            </div>

            <div className="space-y-4">
              {!data.addresses.length ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                  还没有保存任何收货地址。
                </div>
              ) : null}

              {data.addresses.map((address) => {
                const busy = busyAddressId === address.id

                return (
                  <article
                    key={address.id}
                    className={`rounded-2xl border p-5 transition-colors ${
                      editingAddressId === address.id
                        ? 'border-primary/30 bg-slate-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <strong className="text-sm text-slate-900">{address.consigneeName}</strong>
                          {address.defaultAddress ? <StatusPill tone="brand">默认地址</StatusPill> : null}
                        </div>
                        <p className="text-sm text-slate-500">{address.consigneeMobile}</p>
                        <p className="text-sm text-slate-500">{address.detailAddress}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!address.defaultAddress ? (
                          <button
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            type="button"
                            disabled={busy}
                            onClick={() => makeDefaultAddress(address.id)}
                          >
                            设为默认
                          </button>
                        ) : null}
                        <button
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                          type="button"
                          onClick={() => startEditAddress(address)}
                        >
                          编辑
                        </button>
                        <button
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          type="button"
                          disabled={busy}
                          onClick={() => removeAddress(address.id)}
                        >
                          {busy ? '删除中...' : '删除'}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}

              <div className="space-y-3 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {editingAddressId ? '编辑地址' : '新增地址'}
                  </h3>
                  {editingAddressId ? (
                    <button
                      className="text-xs font-semibold text-primary"
                      type="button"
                      onClick={resetAddressForm}
                    >
                      取消编辑
                    </button>
                  ) : null}
                </div>

                <input
                  className="w-full rounded-xl border-none bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:bg-white focus:ring-1 focus:ring-primary"
                  placeholder="收货人姓名"
                  value={addressDraft.consigneeName}
                  onChange={(event) =>
                    setAddressDraft((current) => ({
                      ...current,
                      consigneeName: event.target.value,
                    }))
                  }
                />
                <input
                  className="w-full rounded-xl border-none bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:bg-white focus:ring-1 focus:ring-primary"
                  placeholder="详细地址"
                  value={addressDraft.detailAddress}
                  onChange={(event) =>
                    setAddressDraft((current) => ({
                      ...current,
                      detailAddress: event.target.value,
                    }))
                  }
                />
                <input
                  className="w-full rounded-xl border-none bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:bg-white focus:ring-1 focus:ring-primary"
                  placeholder="手机号"
                  inputMode="numeric"
                  maxLength={11}
                  value={addressDraft.consigneeMobile}
                  onChange={(event) =>
                    setAddressDraft((current) => ({
                      ...current,
                      consigneeMobile: sanitizeMobileInput(event.target.value),
                    }))
                  }
                />

                <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <input
                    checked={addressDraft.defaultAddress}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                    type="checkbox"
                    onChange={(event) =>
                      setAddressDraft((current) => ({
                        ...current,
                        defaultAddress: event.target.checked,
                      }))
                    }
                  />
                  设为默认地址
                </label>

                <div className="flex gap-3">
                  <button
                    className="flex-1 rounded-xl bg-[#545f73] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    disabled={savingAddress}
                    onClick={saveAddress}
                  >
                    {savingAddress
                      ? '保存中...'
                      : editingAddressId
                        ? '保存修改'
                        : '保存新地址'}
                  </button>
                  {editingAddressId ? (
                    <button
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                      type="button"
                      onClick={resetAddressForm}
                    >
                      取消
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-8 shadow-sm lg:flex lg:max-h-[36rem] lg:min-h-[28rem] lg:flex-col xl:col-span-12">
            <div className="mb-6 flex items-center gap-3">
              <MaterialIcon className="text-primary" name="verified_user" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900">登录安全</h2>
            </div>

            <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-2">
              {data.sessions.length ? (
                data.sessions.map((item) => {
                  const status = getSessionStatusMeta(item.status)

                  return (
                    <article
                      key={item.sessionNo}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <strong className="text-sm text-slate-900">{item.deviceId}</strong>
                          {item.current ? <StatusPill tone="brand">当前设备</StatusPill> : null}
                          <StatusPill tone={status.tone}>{status.label}</StatusPill>
                        </div>
                        <p className="text-sm text-slate-500">{item.userAgent || '未知设备'}</p>
                      </div>

                      <div className="grid gap-1 text-sm text-slate-500 lg:text-right">
                        <span>最近活跃：{formatDateTime(item.lastActiveTime)}</span>
                        <span>过期时间：{formatDateTime(item.expireTime)}</span>
                      </div>
                    </article>
                  )
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                  暂时没有读取到设备会话信息。
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </AccountShell>
  )
}
