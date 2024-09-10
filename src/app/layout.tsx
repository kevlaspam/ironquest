'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProviderWrapper } from '../components/AuthProviderWrapper'
import { Footer } from '../components/Footer'
import { WorkoutProvider } from '../components/WorkoutContext'
import { useEffect, useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

function Star({ delay, duration, size, left, top, color }: { delay: number; duration: number; size: number; left: string; top: string; color: string }) {
  return (
    <div 
      className="absolute rounded-full opacity-0 animate-twinkle"
      style={{
        width: size,
        height: size,
        left,
        top,
        backgroundColor: color,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  )
}

function ShootingStar({ delay, duration, left, top }: { delay: number; duration: number; left: string; top: string }) {
  return (
    <div 
      className="absolute w-0.5 h-0.5 bg-white opacity-0 animate-shooting-star"
      style={{
        left,
        top,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [stars, setStars] = useState<React.ReactNode[]>([])
  const [shootingStars, setShootingStars] = useState<React.ReactNode[]>([])

  useEffect(() => {
    const newStars = []
    for (let i = 0; i < 200; i++) {
      const delay = Math.random() * 10
      const duration = 3 + Math.random() * 7
      const size = 1 + Math.random() * 3
      const left = `${Math.random() * 100}%`
      const top = `${Math.random() * 100}%`
      const color = `rgb(${180 + Math.random() * 75}, ${180 + Math.random() * 75}, ${200 + Math.random() * 55})`
      newStars.push(<Star key={i} delay={delay} duration={duration} size={size} left={left} top={top} color={color} />)
    }
    setStars(newStars)

    const newShootingStars = []
    for (let i = 0; i < 5; i++) {
      const delay = Math.random() * 15
      const duration = 1 + Math.random() * 2
      const left = `${Math.random() * 100}%`
      const top = `${Math.random() * 50}%`
      newShootingStars.push(<ShootingStar key={i} delay={delay} duration={duration} left={left} top={top} />)
    }
    setShootingStars(newShootingStars)
  }, [])

  return (
    <html lang="en">
      <head>
        <title>GymGa.me</title>
        <meta name="description" content="Gamified workout tracker for fitness enthusiasts" />
        <link rel="icon" href="/favicon.ico" />
        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1); }
          }
          .animate-twinkle {
            animation-name: twinkle;
            animation-iteration-count: infinite;
          }
          @keyframes shooting-star {
            0% { transform: translateX(0) translateY(0) rotate(315deg) scale(0); opacity: 1; }
            70% { opacity: 1; }
            100% { transform: translateX(1000px) translateY(1000px) rotate(315deg) scale(1); opacity: 0; }
          }
          .animate-shooting-star {
            animation-name: shooting-star;
            animation-iteration-count: infinite;
          }
        `}</style>
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProviderWrapper>
          <WorkoutProvider>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
              {stars}
              {shootingStars}
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