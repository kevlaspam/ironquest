'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithPopup, GoogleAuthProvider, getAuth } from 'firebase/auth'
import { useAuth } from '../components/AuthProvider'

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  const signIn = async () => {
    const auth = getAuth();
    if (!auth) {
      console.error("Firebase auth is not initialized")
      setError("Firebase authentication is not initialized. Please check your configuration.")
      return
    }

    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Error signing in with Google', error)
      setError(`Failed to sign in with Google: ${(error as Error).message}`)
    }
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">
      <div className="text-white text-2xl">Loading...</div>
    </div>
  }

  if (user) {
    return null // This will prevent any flash of content while redirecting
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-6xl font-bold mb-8 text-white animate-float">
        Welcome to IronQuest 💪
      </h1>
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-xl mb-4 max-w-md mx-auto">
          {error}
        </div>
      )}
      <button
        onClick={signIn}
        className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-xl text-white text-xl font-semibold hover:bg-opacity-30 transition-all"
      >
        Sign in with Google to start your journey 🚀
      </button>
    </main>
  )
}