// src/components/Toast.tsx

import { useEffect } from 'react'
import { X } from 'lucide-react'

type ToastProps = {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center justify-between`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 focus:outline-none">
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}