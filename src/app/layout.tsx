// src/app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProviderWrapper } from '../components/AuthProviderWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'IronQuest',
  description: 'Gamified workout tracker for bodybuilders and weightlifters',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-br from-gradient-start via-gradient-middle to-gradient-end min-h-screen`}>
        <AuthProviderWrapper>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -inset-[10px] opacity-50">
              <div className="absolute left-[--left] top-[--top] h-[--size] w-[--size] rounded-full bg-gradient-start filter blur-[calc(var(--size)/5)]"
                   style={{"--left": "10%", "--top": "10%", "--size": "120px"} as React.CSSProperties}></div>
              <div className="absolute left-[--left] top-[--top] h-[--size] w-[--size] rounded-full bg-gradient-middle filter blur-[calc(var(--size)/5)]"
                   style={{"--left": "60%", "--top": "20%", "--size": "160px"} as React.CSSProperties}></div>
              <div className="absolute left-[--left] top-[--top] h-[--size] w-[--size] rounded-full bg-gradient-end filter blur-[calc(var(--size)/5)]"
                   style={{"--left": "30%", "--top": "70%", "--size": "200px"} as React.CSSProperties}></div>
            </div>
          </div>
          <div className="relative z-10">
            {children}
          </div>
        </AuthProviderWrapper>
      </body>
    </html>
  )
}