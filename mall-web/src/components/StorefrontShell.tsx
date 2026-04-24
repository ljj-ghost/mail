import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mallApi } from '../api/mallApi'
import { useAuth } from '../context/AuthContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { MALL_CART_UPDATED_EVENT } from '../lib/cartEvents'
import { getRoleLabel, sumBy } from '../lib/format'
import { MaterialIcon } from './PageBits'

export type StorefrontNavKey = 'home' | 'products' | 'account'

const navItems: Array<{ key: StorefrontNavKey; label: string; to: string }> = [
  { key: 'home', label: '首页', to: '/' },
  { key: 'products', label: '商品', to: '/products' },
  { key: 'account', label: '个人中心', to: '/account/profile' },
]

const footerLinks = ['隐私政策', '服务条款', '配送说明', '联系我们']

export function StorefrontShell({
  activeNav,
  children,
  searchKeyword = '',
}: {
  activeNav: StorefrontNavKey
  children: ReactNode
  searchKeyword?: string
}) {
  const navigate = useNavigate()
  const { ready, isAuthenticated, logout, openLogin, profile, session } = useAuth()
  const [searchText, setSearchText] = useState(searchKeyword)

  const cartState = useAsyncData(
    () => mallApi.getCartItems(),
    [session?.userId ?? 0],
    { enabled: isAuthenticated },
  )

  useEffect(() => {
    setSearchText(searchKeyword)
  }, [searchKeyword])

  useEffect(() => {
    if (typeof window === 'undefined' || !isAuthenticated) {
      return
    }

    const handleCartUpdated = () => {
      cartState.reload()
    }

    window.addEventListener(MALL_CART_UPDATED_EVENT, handleCartUpdated)
    return () => {
      window.removeEventListener(MALL_CART_UPDATED_EVENT, handleCartUpdated)
    }
  }, [cartState, isAuthenticated])

  const viewerRole = profile?.userRole ?? session?.userRole
  const cartCount = isAuthenticated ? sumBy(cartState.data ?? [], (item) => item.quantity) : 0

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const params = new URLSearchParams()
    const keyword = searchText.trim()
    if (keyword) {
      params.set('keyword', keyword)
    }

    navigate({
      pathname: '/products',
      search: params.toString(),
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/', { replace: true })
    } catch {
      // Toast feedback is handled by the auth layer.
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <header className="sticky top-0 z-50 w-full bg-slate-50/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-6 px-6 py-4 md:px-8">
          <div className="flex items-center gap-12">
            <Link className="font-headline text-xl font-bold tracking-tighter text-slate-800" to="/">
              Executive Store
            </Link>

            <form
              className="hidden w-72 items-center rounded-xl bg-surface-container-low px-4 py-2 transition-all focus-within:bg-surface-container-lowest md:flex"
              onSubmit={handleSearch}
            >
              <MaterialIcon className="text-lg text-on-surface-variant" name="search" />
              <input
                className="w-full border-none bg-transparent px-2 text-sm placeholder:text-outline focus:ring-0"
                name="keyword"
                placeholder="搜索商品、品牌或分类"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </form>
          </div>

          <nav className="hidden items-center gap-8 font-['Manrope'] font-semibold tracking-tight text-slate-600 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.key}
                className={
                  activeNav === item.key
                    ? 'border-b-2 border-slate-500 pb-1 text-slate-900'
                    : 'text-slate-500 transition-colors hover:text-slate-700'
                }
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link className="relative rounded-full p-2 transition-colors hover:bg-slate-100" to="/cart">
              <MaterialIcon className="text-slate-600" name="shopping_cart" />
              {cartCount ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#545f73] text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            {ready ? (
              isAuthenticated ? (
                <>
                  <button
                    className="hidden rounded-full bg-white px-4 py-2 text-left shadow-sm transition hover:bg-slate-100 md:flex md:flex-col"
                    type="button"
                    onClick={() => navigate('/account/profile')}
                  >
                    <strong className="text-sm text-slate-900">
                      {profile?.nickname ?? session?.nickname}
                    </strong>
                    <span className="text-[11px] text-slate-500">{getRoleLabel(viewerRole)}</span>
                  </button>
                  <button
                    className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white md:inline-flex"
                    type="button"
                    onClick={() => void handleLogout()}
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white md:inline-flex"
                    type="button"
                    onClick={() =>
                      navigate('/auth?mode=login&portal=admin&redirect=%2Fadmin')
                    }
                  >
                    管理员登录
                  </button>
                  <button
                    className="rounded-full bg-[#545f73] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    type="button"
                    onClick={openLogin}
                  >
                    立即登录
                  </button>
                </>
              )
            ) : (
              <div className="hidden rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm md:block">
                正在同步会话
              </div>
            )}
          </div>
        </div>
        <div className="h-px w-full bg-slate-100" />
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 w-full border-t border-slate-200/50 bg-slate-50">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-8 px-8 py-12 md:flex-row md:px-12">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <span className="font-headline text-lg font-bold uppercase tracking-wider text-slate-400">
              EXECUTIVE STORE
            </span>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              2026 Executive Storefront
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-xs uppercase tracking-widest text-slate-400">
            {footerLinks.map((item) => (
              <a key={item} className="transition-colors duration-300 hover:text-slate-900" href="#">
                {item}
              </a>
            ))}
          </div>

          <div className="flex gap-4">
            <MaterialIcon className="cursor-pointer text-slate-400 transition-colors hover:text-primary" name="public" />
            <MaterialIcon className="cursor-pointer text-slate-400 transition-colors hover:text-primary" name="mail" />
          </div>
        </div>
      </footer>
    </div>
  )
}
