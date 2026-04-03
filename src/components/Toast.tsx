'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  onDone: () => void
}

export function Toast({ message, type = 'success', onDone }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, 2200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div
        className={`px-5 py-3 rounded-full shadow-lg text-sm font-semibold text-white ${
          type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}
      >
        {type === 'success' ? '✓ ' : '✕ '}
        {message}
      </div>
    </div>
  )
}

/** Hook to fire toasts easily */
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const show = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
  }

  const node = toast ? (
    <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
  ) : null

  return { show, node }
}
