'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithPopup, GoogleAuthProvider, getAuth } from 'firebase/auth'
import { useAuth } from '../components/AuthProvider'
import { Dumbbell, Award, LineChart } from 'lucide-react'

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/history')
    }
  }, [user, isLoading, router])

  const signIn = async () => {
    const auth = getAuth();
    if (!auth) {
      console.error("Firebase auth is not initialized")
      setError("Authentication is not initialized. Please check your configuration.")
      return
    }

    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Error signing in with Google', error)
      setError(`Failed to sign in: ${(error as Error).message}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="text-yellow-500 text-2xl">Loading GymGa.me...</div>
      </div>
    )
  }

  if (user) {
    return null // This will prevent any flash of content while redirecting
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-yellow-500 text-5xl sm:text-6xl md:text-7xl font-extrabold mb-4 flex items-center justify-center">
            GymGa.me <span className="ml-2">💪</span>
          </h1>
          <p className="text-gray-400 text-xl md:text-2xl font-semibold">
            Level Up Your Fitness Journey
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-8 shadow-2xl border-2 border-yellow-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center bg-gray-700 rounded-lg p-6 transition-all duration-300 hover:bg-gray-600 border border-yellow-500">
              <Dumbbell size={48} className="mb-4 text-yellow-500" />
              <h2 className="text-xl font-bold mb-2 text-white">Log Workouts</h2>
              <p className="text-center text-gray-300">Track your exercises and complete fitness challenges</p>
            </div>
            <div className="flex flex-col items-center bg-gray-700 rounded-lg p-6 transition-all duration-300 hover:bg-gray-600 border border-yellow-500">
              <Award size={48} className="mb-4 text-yellow-500" />
              <h2 className="text-xl font-bold mb-2 text-white">Earn Achievements</h2>
              <p className="text-center text-gray-300">Unlock rewards as you progress in your fitness journey</p>
            </div>
            <div className="flex flex-col items-center bg-gray-700 rounded-lg p-6 transition-all duration-300 hover:bg-gray-600 border border-yellow-500">
              <LineChart size={48} className="mb-4 text-yellow-500" />
              <h2 className="text-xl font-bold mb-2 text-white">Track Progress</h2>
              <p className="text-center text-gray-300">Visualize your gains with detailed charts and stats</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-8 max-w-md mx-auto">
              {error}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={signIn}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
            >
              Start Your Fitness Game
            </button>

            <p className="mt-8 text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
              Join GymGa.me today and transform your workouts into an exciting journey. 
              Set personal records, overcome challenges, and build your path to peak fitness!
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}