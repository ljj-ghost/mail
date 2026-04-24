/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, type ReactNode } from 'react'
import { MaterialIcon } from '../components/PageBits'

type ToastTone = 'info' | 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

interface ToastContextValue {
  pushToast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = (id: number) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  const pushToast = (message: string, tone: ToastTone = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setItems((current) => [...current, { id, message, tone }])
    window.setTimeout(() => dismiss(id), 3200)
  }

  const toneClass = (tone: ToastTone) =>
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : tone === 'error'
        ? 'border-rose-200 bg-rose-50 text-rose-800'
        : 'border-slate-200 bg-white text-slate-700'

  const iconName = (tone: ToastTone) =>
    tone === 'success' ? 'check_circle' : tone === 'error' ? 'error' : 'info'

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[80] grid gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_16px_40px_rgba(42,52,57,0.12)] ${toneClass(item.tone)}`}
          >
            <MaterialIcon className="mt-0.5 text-lg" name={iconName(item.tone)} fill />
            <p className="m-0 flex-1 text-sm leading-6">{item.message}</p>
            <button
              className="rounded-full p-1 text-current/60 transition hover:bg-black/5 hover:text-current"
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="关闭提示"
            >
              <MaterialIcon className="text-base" name="close" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
