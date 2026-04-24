import type { ApiEnvelope, TokenInfo } from './types'

const STORAGE_KEY = 'mall-web:session'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

type ApiErrorKind = 'network' | 'http' | 'business'

export class ApiError extends Error {
  kind: ApiErrorKind
  status?: number
  code?: number
  traceId?: string

  constructor(
    message: string,
    options: {
      kind: ApiErrorKind
      status?: number
      code?: number
      traceId?: string
    },
  ) {
    super(message)
    this.name = 'ApiError'
    this.kind = options.kind
    this.status = options.status
    this.code = options.code
    this.traceId = options.traceId
  }
}

let refreshPromise: Promise<TokenInfo | null> | null = null

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TokenInfo) : null
  } catch {
    return null
  }
}

export function writeStoredSession(session: TokenInfo | null) {
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

function buildUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return `${API_BASE_URL}${path}`
}

function buildHeaders(inputHeaders?: HeadersInit, body?: BodyInit | null) {
  const headers = new Headers(inputHeaders)
  if (body && !(body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return headers
}

async function parseEnvelope<T>(response: Response) {
  let payload: ApiEnvelope<T> | null = null

  try {
    payload = (await response.json()) as ApiEnvelope<T>
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new ApiError(payload?.message || response.statusText || '请求失败', {
      kind: 'http',
      status: response.status,
      code: payload?.code,
      traceId: payload?.traceId,
    })
  }

  if (!payload || typeof payload.code !== 'number') {
    throw new ApiError('服务端返回了无法识别的数据', {
      kind: 'http',
      status: response.status,
    })
  }

  if (payload.code !== 0) {
    throw new ApiError(payload.message || '请求失败', {
      kind: 'business',
      status: response.status,
      code: payload.code,
      traceId: payload.traceId,
    })
  }

  return payload.data
}

async function rawRequest<T>(path: string, init: RequestInit = {}) {
  try {
    const response = await fetch(buildUrl(path), init)
    return parseEnvelope<T>(response)
  } catch (error) {
    if (isApiError(error)) {
      throw error
    }

    throw new ApiError('网络请求失败，请确认网关和本地服务已经启动。', {
      kind: 'network',
    })
  }
}

async function refreshSession(refreshToken: string) {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = rawRequest<TokenInfo>('/api/v1/auth/token/refresh', {
    method: 'POST',
    headers: buildHeaders(undefined, '{}'),
    body: JSON.stringify({ refreshToken }),
  })
    .then((tokens) => {
      writeStoredSession(tokens)
      return tokens
    })
    .catch(() => {
      writeStoredSession(null)
      return null
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
  options: { auth?: boolean; retryOnAuthFailure?: boolean } = {},
) {
  const session = readStoredSession()
  const { auth = false, retryOnAuthFailure = true } = options

  if (auth && !session?.accessToken) {
    throw new ApiError('请先登录后再继续操作。', {
      kind: 'business',
      status: 401,
      code: 400101,
    })
  }

  const execute = async (accessToken?: string) => {
    const headers = buildHeaders(init.headers, init.body)
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }

    return rawRequest<T>(path, {
      ...init,
      headers,
    })
  }

  try {
    return await execute(auth ? session?.accessToken : undefined)
  } catch (error) {
    if (
      auth &&
      retryOnAuthFailure &&
      isApiError(error) &&
      error.status === 401 &&
      session?.refreshToken
    ) {
      const refreshed = await refreshSession(session.refreshToken)
      if (refreshed) {
        return execute(refreshed.accessToken)
      }
    }

    throw error
  }
}

export async function withFallback<T>(task: () => Promise<T>, fallback: T) {
  try {
    return await task()
  } catch (error) {
    if (isApiError(error) && error.kind === 'network') {
      return fallback
    }

    throw error
  }
}
