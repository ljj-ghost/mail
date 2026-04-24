import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { LoginRequest, RegisterRequest } from '../api/types'
import { MaterialIcon } from '../components/PageBits'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function resolveRedirect(candidate: string | null, portal: 'shopper' | 'admin') {
  const fallback = portal === 'admin' ? '/admin' : '/account/profile'
  if (!candidate || !candidate.startsWith('/')) {
    return fallback
  }

  return candidate
}

function validateLoginForm(form: LoginRequest) {
  if (!form.loginName.trim()) {
    return '请输入登录名、邮箱或手机号'
  }
  if (!form.password) {
    return '请输入密码'
  }

  return ''
}

function validateRegisterForm(form: RegisterRequest & { confirmPassword: string }) {
  if (form.nickname.trim().length < 2) {
    return '昵称至少需要 2 个字符'
  }
  if (form.loginName.trim().length < 3) {
    return '登录名至少需要 3 个字符'
  }
  if (!/^1\d{10}$/.test(form.mobile.trim())) {
    return '请输入正确的 11 位手机号'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return '请输入正确的邮箱地址'
  }
  if (form.password.length < 6 || form.password.length > 32) {
    return '密码长度需为 6 到 32 位'
  }
  if (form.password !== form.confirmPassword) {
    return '两次输入的密码不一致'
  }

  return ''
}

const portalMeta = {
  shopper: {
    title: '商城账号',
    description: '登录后可继续浏览、下单和查看订单。',
    loginHeading: '登录账号',
    loginDescription: '支持登录名、邮箱或手机号。',
    registerHeading: '注册账号',
    registerDescription: '注册成功后会自动登录。',
    quickTitle: '演示账号',
    quickDescription: '默认密码 123456。',
    aliases: ['demo', 'demo@mall.com', '13800138000'],
    defaultLoginName: 'demo',
    submitLabel: '登录',
  },
  admin: {
    title: '后台账号',
    description: '登录后进入后台管理商品、订单和用户。',
    loginHeading: '管理员登录',
    loginDescription: '支持管理员登录名、邮箱或手机号。',
    registerHeading: '管理员登录',
    registerDescription: '管理员账号仅支持登录。',
    quickTitle: '管理员演示账号',
    quickDescription: '默认密码 123456。',
    aliases: ['admin', 'admin@mall.com', '13900139000'],
    defaultLoginName: 'admin',
    submitLabel: '进入后台',
  },
} as const

export function AuthPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { ready, isAuthenticated, login, register } = useAuth()
  const { pushToast } = useToast()

  const portal = searchParams.get('portal') === 'admin' ? 'admin' : 'shopper'
  const mode =
    portal === 'admin'
      ? 'login'
      : searchParams.get('mode') === 'register'
        ? 'register'
        : 'login'
  const redirectTarget = resolveRedirect(searchParams.get('redirect'), portal)
  const portalContent = portalMeta[portal]

  useDocumentTitle(
    portal === 'admin'
      ? '管理员登录 | 尊享商城'
      : mode === 'register'
        ? '注册账号 | 尊享商城'
        : '登录账号 | 尊享商城',
  )

  const [submitting, setSubmitting] = useState<'login' | 'register' | null>(null)
  const [error, setError] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loginForm, setLoginForm] = useState<LoginRequest>({
    loginName: portalContent.defaultLoginName,
    password: '123456',
    deviceId: 'mall-web-browser',
    deviceType: 1,
  })
  const [registerForm, setRegisterForm] = useState<
    RegisterRequest & { confirmPassword: string }
  >({
    loginName: '',
    nickname: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    deviceId: 'mall-web-browser',
    deviceType: 1,
  })

  useEffect(() => {
    if (ready && isAuthenticated) {
      navigate(redirectTarget, { replace: true })
    }
  }, [ready, isAuthenticated, navigate, redirectTarget])

  useEffect(() => {
    setLoginForm((current) => ({
      ...current,
      loginName: portalContent.defaultLoginName,
      password: '123456',
    }))
    setError('')
  }, [portalContent.defaultLoginName])

  const fillLoginAccount = (loginName: string) => {
    setLoginForm((current) => ({
      ...current,
      loginName,
      password: '123456',
    }))
    setError('')
  }

  const updateMode = (nextMode: 'login' | 'register') => {
    if (portal === 'admin') {
      return
    }

    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('mode', nextMode)
    nextParams.set('portal', portal)
    nextParams.set('redirect', redirectTarget)
    setError('')
    setSearchParams(nextParams)
  }

  const updatePortal = (nextPortal: 'shopper' | 'admin') => {
    const nextParams = new URLSearchParams(searchParams)
    const currentRedirect = searchParams.get('redirect')
    nextParams.set('portal', nextPortal)
    nextParams.set('mode', nextPortal === 'admin' ? 'login' : mode)
    nextParams.set(
      'redirect',
      nextPortal === 'admin'
        ? '/admin'
        : currentRedirect && currentRedirect !== '/admin'
          ? currentRedirect
          : '/account/profile',
    )
    setError('')
    setSearchParams(nextParams)
  }

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationError = validateLoginForm(loginForm)
    if (validationError) {
      setError(validationError)
      pushToast(validationError, 'error')
      return
    }

    setSubmitting('login')
    setError('')

    try {
      await login({
        ...loginForm,
        loginName: loginForm.loginName.trim(),
      })
      navigate(redirectTarget, { replace: true })
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : '登录失败'
      setError(message)
      pushToast(message, 'error')
    } finally {
      setSubmitting(null)
    }
  }

  const submitRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationError = validateRegisterForm(registerForm)
    if (validationError) {
      setError(validationError)
      pushToast(validationError, 'error')
      return
    }

    setSubmitting('register')
    setError('')

    try {
      await register({
        loginName: registerForm.loginName.trim(),
        nickname: registerForm.nickname.trim(),
        mobile: registerForm.mobile.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
        deviceId: 'mall-web-browser',
        deviceType: 1,
      })
      navigate(redirectTarget, { replace: true })
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : '注册失败'
      setError(message)
      pushToast(message, 'error')
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f7fb_0%,#eef2f7_100%)] text-on-surface">
      <main className="relative overflow-hidden px-4 py-8 md:px-8 md:py-10">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,_rgba(84,95,115,0.18),_transparent_45%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.10),_transparent_30%)]" />

        <div className="relative mx-auto grid w-full max-w-screen-2xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="overflow-hidden rounded-[36px] bg-slate-900 px-8 py-10 text-white shadow-[0_28px_80px_rgba(15,23,42,0.22)] md:px-10 md:py-12">
            <div className="max-w-xl">
              <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-5xl">
                Executive Store
              </h1>
              <p className="mt-4 text-2xl font-bold tracking-tight text-white/95">
                {portalContent.title}
              </p>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/70 md:text-base">
                {portalContent.description}
              </p>
            </div>

            <div className="mt-10">
              <article className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 text-lg">
                    <MaterialIcon name={portal === 'admin' ? 'dashboard' : 'shopping_bag'} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{portalContent.quickTitle}</p>
                    <p className="text-xs leading-5 text-white/65">
                      {portalContent.quickDescription}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {portalContent.aliases.map((alias) => (
                    <button
                      key={alias}
                      className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 transition hover:bg-white/18"
                      type="button"
                      onClick={() => fillLoginAccount(alias)}
                    >
                      {alias}
                    </button>
                  ))}
                </div>
                <button
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  type="button"
                  onClick={() => fillLoginAccount(portalContent.defaultLoginName)}
                >
                  <MaterialIcon name="task_alt" />
                  一键填入演示账号
                </button>
              </article>
            </div>
          </section>

          <section className="rounded-[36px] border border-white/70 bg-white/95 p-7 shadow-[0_24px_60px_rgba(42,52,57,0.10)] backdrop-blur md:p-10">
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex rounded-full bg-slate-100 p-1">
                <button
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    portal === 'shopper'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  type="button"
                  onClick={() => updatePortal('shopper')}
                >
                  普通用户
                </button>
                <button
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    portal === 'admin'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  type="button"
                  onClick={() => updatePortal('admin')}
                >
                  管理员
                </button>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-8 border-b border-slate-200">
              <button
                className={`pb-4 font-headline text-lg font-bold ${
                  mode === 'login'
                    ? 'border-b-2 border-slate-900 text-slate-900'
                    : 'text-slate-400 transition-colors hover:text-slate-700'
                }`}
                type="button"
                onClick={() => updateMode('login')}
              >
                登录
              </button>
              {portal === 'shopper' ? (
                <button
                  className={`pb-4 font-headline text-lg font-bold ${
                    mode === 'register'
                      ? 'border-b-2 border-slate-900 text-slate-900'
                      : 'text-slate-400 transition-colors hover:text-slate-700'
                  }`}
                  type="button"
                  onClick={() => updateMode('register')}
                >
                  注册
                </button>
              ) : null}
            </div>

            <div className="mt-8">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                {mode === 'login'
                  ? portalContent.loginHeading
                  : portalContent.registerHeading}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
                {mode === 'login'
                  ? portalContent.loginDescription
                  : portalContent.registerDescription}
              </p>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{portalContent.quickTitle}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {portalContent.quickDescription}
                  </p>
                </div>
                <button
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  type="button"
                  onClick={() => fillLoginAccount(portalContent.defaultLoginName)}
                >
                  一键填入默认账号
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {portalContent.aliases.map((account) => (
                  <button
                    key={account}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                    type="button"
                    onClick={() => fillLoginAccount(account)}
                  >
                    {account}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'login' ? (
              <form className="mt-8 space-y-6" onSubmit={submitLogin}>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {portal === 'admin' ? '管理员账号' : '登录名 / 邮箱 / 手机号'}
                  </span>
                  <div className="relative">
                    <MaterialIcon
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-slate-400"
                      name="mail"
                    />
                    <input
                      id="loginName"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                      placeholder={
                        portal === 'admin'
                          ? '例如：admin 或 admin@mall.com'
                          : '例如：demo / demo@mall.com / 13800138000'
                      }
                      value={loginForm.loginName}
                      onChange={(event) =>
                        setLoginForm((current) => ({
                          ...current,
                          loginName: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <p className="text-xs leading-5 text-slate-500">
                    {portal === 'admin' ? '管理员账号支持多种登录方式。' : '支持三种登录方式。'}
                  </p>
                </label>

                <label className="block space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-700">密码</span>
                    <button
                      className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                      type="button"
                      onClick={() => pushToast('当前演示账号默认密码为 123456。', 'info')}
                    >
                      忘记密码？
                    </button>
                  </div>
                  <div className="relative">
                    <MaterialIcon
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-slate-400"
                      name="lock"
                    />
                    <input
                      id="password"
                      autoComplete="current-password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-16 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                      placeholder="请输入密码"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                    />
                    <button
                      className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      type="button"
                      onClick={() => setShowLoginPassword((current) => !current)}
                      aria-label={showLoginPassword ? '隐藏密码' : '显示密码'}
                    >
                      <MaterialIcon name={showLoginPassword ? 'visibility_off' : 'visibility'} />
                    </button>
                  </div>
                  <p className="text-xs leading-5 text-slate-500">
                    演示密码：<span className="font-semibold text-slate-700">123456</span>
                  </p>
                </label>

                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}

                <button
                  className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={submitting === 'login'}
                >
                  {submitting === 'login' ? '登录中...' : portalContent.submitLabel}
                </button>

                {portal === 'shopper' ? (
                  <p className="text-center text-sm text-slate-500">
                    还没有账号？
                    <button
                      className="ml-2 font-semibold text-slate-900 transition hover:text-slate-700"
                      type="button"
                      onClick={() => updateMode('register')}
                    >
                      立即注册
                    </button>
                  </p>
                ) : null}
              </form>
            ) : (
              <form className="mt-8 space-y-6" onSubmit={submitRegister}>
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">昵称</span>
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                      placeholder="例如：Mall Demo User"
                      value={registerForm.nickname}
                      onChange={(event) =>
                        setRegisterForm((current) => ({
                          ...current,
                          nickname: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">登录名</span>
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                      placeholder="至少 3 个字符"
                      value={registerForm.loginName}
                      onChange={(event) =>
                        setRegisterForm((current) => ({
                          ...current,
                          loginName: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">手机号</span>
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                      inputMode="numeric"
                      maxLength={11}
                      placeholder="请输入 11 位手机号"
                      value={registerForm.mobile}
                      onChange={(event) =>
                        setRegisterForm((current) => ({
                          ...current,
                          mobile: event.target.value.replace(/\D/g, '').slice(0, 11),
                        }))
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">邮箱</span>
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                      placeholder="name@example.com"
                      type="email"
                      value={registerForm.email}
                      onChange={(event) =>
                        setRegisterForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">密码</span>
                    <div className="relative">
                      <input
                        autoComplete="new-password"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-14 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                        placeholder="6 到 32 位"
                        type={showRegisterPassword ? 'text' : 'password'}
                        value={registerForm.password}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                      />
                      <button
                        className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        type="button"
                        onClick={() => setShowRegisterPassword((current) => !current)}
                        aria-label={showRegisterPassword ? '隐藏密码' : '显示密码'}
                      >
                        <MaterialIcon
                          name={showRegisterPassword ? 'visibility_off' : 'visibility'}
                        />
                      </button>
                    </div>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">确认密码</span>
                    <div className="relative">
                      <input
                        autoComplete="new-password"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-14 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                        placeholder="请再次输入密码"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={registerForm.confirmPassword}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            confirmPassword: event.target.value,
                          }))
                        }
                      />
                      <button
                        className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        type="button"
                        onClick={() => setShowConfirmPassword((current) => !current)}
                        aria-label={showConfirmPassword ? '隐藏密码' : '显示密码'}
                      >
                        <MaterialIcon
                          name={showConfirmPassword ? 'visibility_off' : 'visibility'}
                        />
                      </button>
                    </div>
                  </label>
                </div>

                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}

                <button
                  className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={submitting === 'register'}
                >
                  {submitting === 'register' ? '注册中...' : '创建账号并自动登录'}
                </button>

                <p className="text-center text-sm text-slate-500">
                  已有账号？
                  <button
                    className="ml-2 font-semibold text-slate-900 transition hover:text-slate-700"
                    type="button"
                    onClick={() => updateMode('login')}
                  >
                    返回登录
                  </button>
                </p>
              </form>
            )}

            <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-500">
              <p>继续访问即表示你同意平台服务条款与隐私政策。</p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/90 px-6 py-6 text-sm text-slate-500 md:px-10">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Executive Store.</p>
          <div className="flex flex-wrap gap-6">
            <a className="transition hover:text-slate-900" href="#">
              隐私政策
            </a>
            <a className="transition hover:text-slate-900" href="#">
              服务条款
            </a>
            <a className="transition hover:text-slate-900" href="#">
              数据说明
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
