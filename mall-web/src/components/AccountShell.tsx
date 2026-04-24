import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { mallApi } from '../api/mallApi'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getRoleLabel } from '../lib/format'
import { LoadingScreen, MaterialIcon, MessageCard } from './PageBits'
import { StorefrontShell } from './StorefrontShell'

type AccountSection = 'profile' | 'orders'

interface AccountShellProps {
  activeSection: AccountSection
  title: string
  description?: string
  children: ReactNode
  headerAside?: ReactNode
}

const emptyPasswordDraft = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

function validatePasswordDraft(draft: typeof emptyPasswordDraft) {
  if (!draft.currentPassword) {
    return '请输入当前密码'
  }
  if (!draft.newPassword) {
    return '请输入新密码'
  }
  if (draft.newPassword.length < 6 || draft.newPassword.length > 32) {
    return '新密码长度需为 6 到 32 位'
  }
  if (draft.newPassword === draft.currentPassword) {
    return '新密码需要和当前密码不同'
  }
  if (!draft.confirmPassword) {
    return '请再次输入新密码'
  }
  if (draft.newPassword !== draft.confirmPassword) {
    return '两次输入的新密码不一致'
  }

  return ''
}

export function AccountShell({
  activeSection,
  title,
  description,
  children,
  headerAside,
}: AccountShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { ready, isAuthenticated, logout, openLogin, profile, session } = useAuth()
  const { pushToast } = useToast()
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [passwordDraft, setPasswordDraft] = useState(emptyPasswordDraft)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    next: false,
    confirm: false,
  })

  if (!ready) {
    return (
      <StorefrontShell activeNav="account">
        <LoadingScreen label="正在同步账户信息" />
      </StorefrontShell>
    )
  }

  if (!isAuthenticated) {
    return (
      <StorefrontShell activeNav="account">
        <MessageCard
          title="登录后才能进入个人中心"
          description="个人资料、收货地址和订单记录都需要登录后读取。"
          actionLabel="去登录"
          onAction={openLogin}
        />
      </StorefrontShell>
    )
  }

  const viewerRole = profile?.userRole ?? session?.userRole
  const isAdmin = viewerRole === 'ADMIN'
  const nickname = profile?.nickname ?? session?.nickname ?? '当前用户'
  const email = profile?.email ?? '未绑定邮箱'
  const productCatalogTarget = isAdmin ? '/admin?tab=products' : '/products'

  const resetPasswordDialog = () => {
    setPasswordDraft(emptyPasswordDraft)
    setPasswordError('')
    setPasswordVisible({
      current: false,
      next: false,
      confirm: false,
    })
  }

  const closePasswordDialog = () => {
    if (passwordSubmitting) {
      return
    }

    setPasswordDialogOpen(false)
    resetPasswordDialog()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  const submitPasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationError = validatePasswordDraft(passwordDraft)
    if (validationError) {
      setPasswordError(validationError)
      pushToast(validationError, 'error')
      return
    }

    try {
      setPasswordSubmitting(true)
      setPasswordError('')
      await mallApi.changeCurrentUserPassword({
        currentPassword: passwordDraft.currentPassword,
        newPassword: passwordDraft.newPassword,
      })
      await logout({ silent: true })
      setPasswordDialogOpen(false)
      resetPasswordDialog()
      pushToast('密码已重置，请使用新密码重新登录。', 'success')

      const redirect = `${location.pathname}${location.search}`
      const params = new URLSearchParams({
        mode: 'login',
        portal: isAdmin ? 'admin' : 'shopper',
        redirect,
      })
      navigate(`/auth?${params.toString()}`, { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : '重置密码失败'
      setPasswordError(message)
      pushToast(message, 'error')
    } finally {
      setPasswordSubmitting(false)
    }
  }

  const navItems = [
    { key: 'home', label: '首页', icon: 'home', to: '/' },
    { key: 'catalog', label: '商品目录', icon: 'category', to: productCatalogTarget },
    { key: 'profile', label: '个人资料', icon: 'person', to: '/account/profile' },
    { key: 'orders', label: '我的订单', icon: 'receipt_long', to: '/account/orders' },
    { key: 'cart', label: '购物车', icon: 'shopping_cart', to: '/cart' },
  ] as const

  return (
    <StorefrontShell activeNav="account">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-6 py-8 md:px-8 md:py-10 lg:flex-row">
        <aside className="w-full shrink-0 self-start rounded-[28px] bg-slate-100 p-6 text-sm antialiased lg:sticky lg:top-28 lg:w-72">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-black text-slate-700 shadow-sm">
              {nickname.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-['Manrope'] text-base font-black text-slate-800">
                {nickname}
              </p>
              <p className="truncate text-xs text-slate-500">{getRoleLabel(viewerRole)}</p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              当前账号
            </p>
            <p className="mt-3 break-all text-sm font-semibold text-slate-800">{email}</p>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = item.key === activeSection
              return (
                <Link
                  key={item.key}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition duration-150 hover:translate-x-1 ${
                    isActive
                      ? 'bg-white font-bold text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-200'
                  }`}
                  to={item.to}
                >
                  <MaterialIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-6 space-y-3 border-t border-slate-200 pt-6">
            {isAdmin ? (
              <Link
                className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                to="/admin?tab=products"
              >
                <MaterialIcon name="dashboard" />
                <span>进入后台</span>
              </Link>
            ) : null}

            <button
              className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-left font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              type="button"
              onClick={() => {
                resetPasswordDialog()
                setPasswordDialogOpen(true)
              }}
            >
              <MaterialIcon name="lock" />
              <span>重置密码</span>
            </button>

            <button
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-500 transition duration-150 hover:bg-slate-200 hover:text-slate-700"
              type="button"
              onClick={() => void handleLogout()}
            >
              <MaterialIcon name="logout" />
              <span>退出登录</span>
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-on-surface">
                {title}
              </h1>
              {description ? <p className="text-on-surface-variant">{description}</p> : null}
            </div>

            {headerAside ? (
              headerAside
            ) : (
              <div className="grid gap-2 rounded-2xl bg-white px-6 py-4 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  当前账号
                </span>
                <strong className="text-lg text-slate-900">{nickname}</strong>
                <span className="text-sm text-slate-500">{email}</span>
              </div>
            )}
          </header>

          {children}
        </main>
      </div>

      {passwordDialogOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Security
                </p>
                <h3 className="mt-2 font-['Manrope'] text-2xl font-extrabold text-slate-900">
                  重置登录密码
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  为了保护账户安全，请先输入当前密码。修改成功后，当前设备和其他已登录设备会自动退出登录。
                </p>
              </div>

              <button
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                type="button"
                onClick={closePasswordDialog}
              >
                取消
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={submitPasswordReset}>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">当前密码</span>
                <div className="relative">
                  <MaterialIcon
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-slate-400"
                    name="lock"
                  />
                  <input
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-16 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                    placeholder="请输入当前登录密码"
                    type={passwordVisible.current ? 'text' : 'password'}
                    value={passwordDraft.currentPassword}
                    onChange={(event) =>
                      setPasswordDraft((current) => ({
                        ...current,
                        currentPassword: event.target.value,
                      }))
                    }
                  />
                  <button
                    className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    type="button"
                    onClick={() =>
                      setPasswordVisible((current) => ({
                        ...current,
                        current: !current.current,
                      }))
                    }
                    aria-label={passwordVisible.current ? '隐藏当前密码' : '显示当前密码'}
                  >
                    <MaterialIcon name={passwordVisible.current ? 'visibility_off' : 'visibility'} />
                  </button>
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">新密码</span>
                <div className="relative">
                  <MaterialIcon
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-slate-400"
                    name="verified_user"
                  />
                  <input
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-16 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                    placeholder="请输入 6 到 32 位新密码"
                    type={passwordVisible.next ? 'text' : 'password'}
                    value={passwordDraft.newPassword}
                    onChange={(event) =>
                      setPasswordDraft((current) => ({
                        ...current,
                        newPassword: event.target.value,
                      }))
                    }
                  />
                  <button
                    className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    type="button"
                    onClick={() =>
                      setPasswordVisible((current) => ({
                        ...current,
                        next: !current.next,
                      }))
                    }
                    aria-label={passwordVisible.next ? '隐藏新密码' : '显示新密码'}
                  >
                    <MaterialIcon name={passwordVisible.next ? 'visibility_off' : 'visibility'} />
                  </button>
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">确认新密码</span>
                <div className="relative">
                  <MaterialIcon
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-slate-400"
                    name="task_alt"
                  />
                  <input
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-16 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                    placeholder="请再次输入新密码"
                    type={passwordVisible.confirm ? 'text' : 'password'}
                    value={passwordDraft.confirmPassword}
                    onChange={(event) =>
                      setPasswordDraft((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }))
                    }
                  />
                  <button
                    className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    type="button"
                    onClick={() =>
                      setPasswordVisible((current) => ({
                        ...current,
                        confirm: !current.confirm,
                      }))
                    }
                    aria-label={passwordVisible.confirm ? '隐藏确认密码' : '显示确认密码'}
                  >
                    <MaterialIcon
                      name={passwordVisible.confirm ? 'visibility_off' : 'visibility'}
                    />
                  </button>
                </div>
              </label>

              {passwordError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {passwordError}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  修改完成后会立即使旧会话失效，建议保存好新密码后再提交。
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  type="button"
                  onClick={closePasswordDialog}
                >
                  稍后再说
                </button>
                <button
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={passwordSubmitting}
                >
                  {passwordSubmitting ? '正在重置密码...' : '确认重置密码'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </StorefrontShell>
  )
}
