/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
  type ReactNode,
} from 'react'
import { mallApi } from '../api/mallApi'
import { readStoredSession, writeStoredSession } from '../api/client'
import type {
  LoginRequest,
  RegisterRequest,
  TokenInfo,
  UserProfile,
} from '../api/types'
import { useToast } from './ToastContext'

type ToastTone = 'info' | 'success' | 'error'

interface LogoutOptions {
  silent?: boolean
  message?: string
  tone?: ToastTone
}

interface AuthContextValue {
  ready: boolean
  session: TokenInfo | null
  profile: UserProfile | null
  isAuthenticated: boolean
  openLogin: () => void
  login: (payload: LoginRequest) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  logout: (options?: LogoutOptions) => Promise<void>
  refreshProfile: () => Promise<UserProfile | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<TokenInfo | null>(() => readStoredSession())
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const { pushToast } = useToast()

  const bootstrap = useEffectEvent(async () => {
    const stored = readStoredSession()
    if (!stored) {
      setReady(true)
      return
    }

    setSession(stored)

    try {
      const currentUser = await mallApi.getCurrentUser()
      setProfile(currentUser)
    } catch {
      writeStoredSession(null)
      setSession(null)
      setProfile(null)
    } finally {
      setReady(true)
    }
  })

  useEffect(() => {
    bootstrap()
  }, [])

  const refreshProfile = async () => {
    if (!readStoredSession()) {
      setProfile(null)
      return null
    }

    const currentUser = await mallApi.getCurrentUser()
    setProfile(currentUser)
    return currentUser
  }

  const completeAuth = async (
    tokens: TokenInfo,
    successMessage: string,
    fallbackMessage: string,
  ) => {
    writeStoredSession(tokens)
    setSession(tokens)

    try {
      const currentUser = await mallApi.getCurrentUser()
      setProfile(currentUser)
      pushToast(successMessage.replace('{nickname}', currentUser.nickname), 'success')
    } catch {
      setProfile(null)
      pushToast(fallbackMessage.replace('{nickname}', tokens.nickname), 'success')
    }
  }

  const login = async (payload: LoginRequest) => {
    const tokens = await mallApi.loginByPassword(payload)
    await completeAuth(tokens, '欢迎回来，{nickname}', '已登录为 {nickname}')
  }

  const register = async (payload: RegisterRequest) => {
    const tokens = await mallApi.registerByPassword(payload)
    await completeAuth(tokens, '账户已创建，欢迎你 {nickname}', '已创建账户 {nickname}')
  }

  const logout = async (options?: LogoutOptions) => {
    let requestFailed = false

    try {
      await mallApi.logout()
    } catch {
      requestFailed = true
    } finally {
      setSession(null)
      setProfile(null)
    }

    if (options?.silent) {
      return
    }

    if (options?.message) {
      pushToast(options.message, options.tone ?? 'info')
      return
    }

    if (requestFailed) {
      pushToast('当前设备已退出，如需继续操作请重新登录。', 'info')
      return
    }

    pushToast('已安全退出登录', 'info')
  }

  return (
    <AuthContext.Provider
      value={{
        ready,
        session,
        profile,
        isAuthenticated: Boolean(session?.accessToken),
        openLogin: () => {
          if (typeof window === 'undefined') {
            return
          }

          const currentPath = `${window.location.pathname}${window.location.search}`
          const redirect =
            currentPath.startsWith('/auth') || currentPath === ''
              ? '/account/profile'
              : currentPath
          const params = new URLSearchParams({
            mode: 'login',
            redirect,
          })
          window.location.assign(`/auth?${params.toString()}`)
        },
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
