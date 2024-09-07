import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProviderWrapper } from '../components/AuthProviderWrapper'
import { Footer } from '../components/Footer'
import { Metadata } from 'next'
import { WorkoutProvider } from '../components/WorkoutContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GymGa.me',
  description: 'Gamified workout tracker for fitness enthusiasts',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 min-h-screen flex flex-col`}>
        <AuthProviderWrapper>
          <WorkoutProvider>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -inset-[10px] opacity-30">
                <div className="absolute left-[--left] top-[--top] h-[--size] w-[--size] rounded-full bg-blue-600 filter blur-[calc(var(--size)/5)]"
                     style={{"--left": "10%", "--top": "10%", "--size": "120px"} as React.CSSProperties}></div>
                <div className="absolute left-[--left] top-[--top] h-[--size] w-[--size] rounded-full bg-yellow-400 filter blur-[calc(var(--size)/5)]"
                     style={{"--left": "60%", "--top": "20%", "--size": "160px"} as React.CSSProperties}></div>
                <div className="absolute left-[--left] top-[--top] h-[--size] w-[--size] rounded-full bg-green-400 filter blur-[calc(var(--size)/5)]"
                     style={{"--left": "30%", "--top": "70%", "--size": "200px"} as React.CSSProperties}></div>
              </div>
            </div>
            <div className="relative z-10 flex-grow">
              {children}
            </div>
            <Footer />
          </WorkoutProvider>
        </AuthProviderWrapper>
      </body>
    </html>
  )
}