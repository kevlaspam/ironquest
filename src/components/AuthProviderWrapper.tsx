// src/components/AuthProviderWrapper.tsx
'use client'

import { AuthProvider } from './AuthProvider'

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}