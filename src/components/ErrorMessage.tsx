import { AlertCircle } from 'lucide-react'

type ErrorMessageProps = {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="text-red-500 text-center p-8 bg-gray-800 rounded-xl shadow-lg">
      <AlertCircle className="w-16 h-16 mx-auto mb-4" />
      <p className="text-xl font-semibold mb-2">Oops! Something went wrong.</p>
      <p>{message}</p>
    </div>
  )
}