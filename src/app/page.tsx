'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithPopup, GoogleAuthProvider, getAuth } from 'firebase/auth'
import { useAuth } from '../components/AuthProvider'
import { Dumbbell, Award, LineChart, Users, BarChart, Target, Zap, Shield, Smartphone, LogIn } from 'lucide-react'

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/feed')
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
        <div className="text-center mb-8">
          <h1 className="text-yellow-500 text-5xl sm:text-6xl md:text-7xl font-extrabold mb-4 flex items-center justify-center">
            GymGa.me <span className="ml-2">💪</span>
          </h1>
          <p className="text-gray-400 text-xl md:text-2xl font-semibold mb-6">
            Level Up Your Fitness Journey
          </p>
          <button
            onClick={signIn}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
          >
            Start Your Fitness Game
          </button>
        </div>

        <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-8 shadow-2xl border-4 border-yellow-500 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Dumbbell, title: "Log Workouts", description: "Track your exercises and complete fitness challenges" },
              { icon: Award, title: "Earn Achievements", description: "Unlock rewards as you progress in your fitness journey" },
              { icon: LineChart, title: "Track Progress", description: "Visualize your gains with detailed charts and stats" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-6 transition-all duration-300 hover:from-gray-600 hover:to-gray-700 hover:scale-105 border-2 border-yellow-500 cursor-pointer shadow-md">
                <item.icon size={48} className="mb-4 text-yellow-500" />
                <h2 className="text-xl font-bold mb-2 text-white">{item.title}</h2>
                <p className="text-center text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose GymGa.me?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Zap, title: "Gamified Experience", description: "Transform your workouts into an exciting quest" },
                { icon: Users, title: "Social Motivation", description: "Connect with friends and share achievements" },
                { icon: BarChart, title: "Detailed Analytics", description: "Get insights into your fitness progress" },
                { icon: Target, title: "Personalized Goals", description: "Set and track your unique fitness objectives" },
                { icon: Shield, title: "Secure & Private", description: "Your data is protected and secure" },
                { icon: Smartphone, title: "Mobile Friendly", description: "Access your fitness data on any device" }
              ].map((item, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-700 to-gray-800 p-4 rounded-lg transition-all duration-300 hover:from-gray-600 hover:to-gray-700 hover:scale-105 cursor-pointer shadow-md border border-yellow-500">
                  <item.icon className="text-yellow-500 w-8 h-8 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-300 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-8 max-w-md mx-auto">
              {error}
            </div>
          )}

          <div className="text-center mb-8">
            <button
              onClick={signIn}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
            >
              Join GymGa.me Now
            </button>

            <p className="mt-4 text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
              Transform your workouts into an exciting journey. Set personal records, overcome challenges, and build your path to peak fitness!
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Features That Set Us Apart</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Comprehensive Workout Logging",
                features: [
                  "Custom workout creation",
                  "Pre-filled workout templates",
                  "Extensive exercise database",
                  "Set, rep, and weight tracking",
                  "Workout duration monitoring",
                  "Customizable rest timer"
                ]
              },
              {
                title: "Social Feed & Profiles",
                features: [
                  "Share workout updates",
                  "Like and comment on posts",
                  "View friends' achievements",
                  "Customizable user profiles",
                  "Personal fitness goal setting",
                  "Activity level tracking"
                ]
              },
              {
                title: "Progress Tracking & Stats",
                features: [
                  "Weight history with graph visualization",
                  "Total workouts completed",
                  "Workout streak tracking",
                  "Total weight lifted",
                  "Average workout duration",
                  "Exercise count and variety"
                ]
              },
              {
                title: "Gamification & Achievements",
                features: [
                  "Level up your fitness profile",
                  "Unlock achievements and rewards",
                  "Complete fitness challenges",
                  "Track achievement progress",
                  "Compete with friends",
                  "Earn badges for milestones"
                ]
              }
            ].map((section, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-700 to-gray-800 p-6 rounded-lg transition-all duration-300 hover:from-gray-600 hover:to-gray-700 hover:scale-105 cursor-pointer shadow-md border-2 border-yellow-500">
                <h3 className="text-xl font-semibold text-yellow-500 mb-4">{section.title}</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  {section.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <button
            onClick={signIn}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 flex items-center justify-center mx-auto"
          >
            <LogIn className="mr-2" /> Start Your Fitness Journey
          </button>
        </div>
      </div>
    </main>
  )
}