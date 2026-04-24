import { useEffect, useEffectEvent, useState, type FormEvent } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { mallApi } from '../api/mallApi'
import { useAuth } from '../context/AuthContext'
import { getRoleLabel, sumBy } from '../lib/format'

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, logout, openLogin, profile, ready, session } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  const viewerRole = profile?.userRole ?? session?.userRole
  const isAdmin = viewerRole === 'ADMIN'

  const refreshCartCount = useEffectEvent(async () => {
    if (!isAuthenticated) {
      setCartCount(0)
      return
    }

    try {
      const items = await mallApi.getCartItems()
      setCartCount(sumBy(items, (item) => item.quantity))
    } catch {
      setCartCount(0)
    }
  })

  useEffect(() => {
    refreshCartCount()
  }, [isAuthenticated, location.pathname, session?.userId])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const keyword = String(formData.get('keyword') ?? '').trim()
    const params = new URLSearchParams()
    if (keyword) {
      params.set('keyword', keyword)
    }

    navigate({
      pathname: '/',
      search: params.toString(),
    })
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="app-shell">
      <header className="store-header">
        <div className="store-header__inner">
          <NavLink className="store-brand" to="/">
            <span className="store-brand__mark" />
            <div>
              <strong>Architect Mall</strong>
              <span>商城前台与运营后台一体化演示</span>
            </div>
          </NavLink>

          <nav className="store-nav">
            <NavLink className="store-nav__link" to="/">
              首页
            </NavLink>
            <NavLink className="store-nav__link" to="/cart">
              购物车
            </NavLink>
            <NavLink className="store-nav__link" to="/account">
              个人中心
            </NavLink>
            {isAdmin ? (
              <NavLink className="store-nav__link" to="/admin">
                管理后台
              </NavLink>
            ) : null}
          </nav>

          <form key={location.search} className="store-search" onSubmit={handleSearch}>
            <input
              className="store-search__input"
              defaultValue={new URLSearchParams(location.search).get('keyword') ?? ''}
              name="keyword"
              placeholder="搜索商品、品牌或场景"
            />
          </form>

          <div className="store-actions">
            <button
              className="store-cart-pill"
              type="button"
              onClick={() => navigate('/cart')}
            >
              <span>购物车</span>
              <strong>{cartCount}</strong>
            </button>

            {ready ? (
              isAuthenticated ? (
                <>
                  <button
                    className="store-user-pill"
                    type="button"
                    onClick={() => navigate('/account')}
                  >
                    <strong>{profile?.nickname ?? session?.nickname}</strong>
                    <span>{getRoleLabel(viewerRole)}</span>
                  </button>
                  <button className="button button--ghost" type="button" onClick={() => void handleLogout()}>
                    退出登录
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="button button--ghost"
                    type="button"
                    onClick={() =>
                      navigate('/auth?mode=login&portal=admin&redirect=%2Fadmin')
                    }
                  >
                    管理员登录
                  </button>
                  <button className="button button--primary" type="button" onClick={openLogin}>
                    立即登录
                  </button>
                </>
              )
            ) : (
              <div className="store-user-pill">
                <strong>会话同步中</strong>
                <span>正在检查登录状态</span>
              </div>
            )}
          </div>
        </div>

        <div className="store-header__notice">
          <span>默认网关</span>
          <strong>http://localhost:18080</strong>
          <span>演示账号 demo / 123456，管理员 admin / 123456</span>
        </div>
      </header>

      <main className="page-frame">
        <Outlet />
      </main>

      <footer className="store-footer">
        <div>
          <strong>Architect Mall</strong>
          <p>商品浏览、购物车、结算、支付、账户中心和后台都已对接现有微服务接口。</p>
        </div>
        <div className="store-footer__meta">
          <span>前端：Vite + React</span>
          <span>后端：Gateway + 微服务</span>
          <span>数据：MySQL + Redis</span>
        </div>
      </footer>
    </div>
  )
}
