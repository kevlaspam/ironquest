'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithPopup, GoogleAuthProvider, getAuth } from 'firebase/auth'
import { useAuth } from '../components/AuthProvider'
import { Dumbbell, Award, LineChart, Users, BarChart, Target, Zap, Shield, Smartphone, LogIn, ArrowRight, Repeat, Flame } from 'lucide-react'

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
        <div className="text-center mb-16">
          <h1 className="text-yellow-500 text-6xl sm:text-7xl md:text-8xl font-extrabold mb-4 flex items-center justify-center">
            GymGa.me <span className="ml-2">💪</span>
          </h1>
          <p className="text-gray-400 text-2xl md:text-3xl font-semibold mb-8">
            Level Up Your Fitness Journey 🚀
          </p>
          <button
            onClick={signIn}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-bold py-4 px-10 rounded-full shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 text-xl hover:scale-105"
          >
            Start Your Fitness Game <ArrowRight className="inline-block ml-2" />
          </button>
        </div>

        <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border-4 border-yellow-500 mb-16">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">Gamify Your Fitness 🎯</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Dumbbell, title: "Log Workouts", description: "Track exercises and complete fitness quests" },
              { icon: Award, title: "Earn Achievements", description: "Unlock rewards and level up your fitness" },
              { icon: LineChart, title: "Track Progress", description: "Visualize gains with interactive charts" },
              { icon: Repeat, title: "Build Habits", description: "Create and maintain healthy routines" },
              { icon: Users, title: "Social Motivation", description: "Connect with friends and share victories" },
              { icon: Flame, title: "Daily Challenges", description: "Push your limits with exciting tasks" }
            ].map((item, index) => (
              <div 
                key={index}
                className="flex flex-col items-center bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 transition-all duration-300 hover:from-gray-600 hover:to-gray-700 border-2 border-yellow-500 cursor-pointer shadow-md hover:scale-105"
              >
                <item.icon size={48} className="mb-4 text-yellow-500" />
                <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                <p className="text-center text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-8">Why Choose GymGa.me? 🤔</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Gamified Experience", description: "Transform workouts into exciting quests" },
              { icon: Users, title: "Social Motivation", description: "Connect with friends and share achievements" },
              { icon: BarChart, title: "Detailed Analytics", description: "Get insights into your fitness journey" },
              { icon: Target, title: "Personalized Goals", description: "Set and track unique fitness objectives" },
              { icon: Shield, title: "Secure & Private", description: "Your data is protected and secure" },
              { icon: Smartphone, title: "Mobile Friendly", description: "Access your fitness data anywhere" }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-700 to-gray-800 p-6 rounded-xl transition-all duration-300 hover:from-gray-600 hover:to-gray-700 cursor-pointer shadow-md border border-yellow-500 hover:scale-105"
              >
                <item.icon className="text-yellow-500 w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-8 max-w-md mx-auto">
            {error}
          </div>
        )}

        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">Features That Set Us Apart 🌟</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Comprehensive Workout Logging 📝",
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
                title: "Social Feed & Profiles 👥",
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
                title: "Progress Tracking & Stats 📊",
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
                title: "Gamification & Achievements 🏆",
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
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-700 to-gray-800 p-6 rounded-xl transition-all duration-300 hover:from-gray-600 hover:to-gray-700 cursor-pointer shadow-md border-2 border-yellow-500 hover:scale-105"
              >
                <h3 className="text-2xl font-semibold text-yellow-500 mb-4">{section.title}</h3>
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
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-bold py-4 px-10 rounded-full shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 text-xl flex items-center justify-center mx-auto hover:scale-105"
          >
            <LogIn className="mr-2" /> Start Your Fitness Journey Now! 🚀
          </button>
          <p className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto">
            Transform your workouts into an exciting adventure. Set personal records, overcome challenges, and build your path to peak fitness! 💪✨
          </p>
        </div>
      </div>
    </main>
  )
}