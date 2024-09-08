'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithPopup, GoogleAuthProvider, getAuth } from 'firebase/auth'
import { useAuth } from '../components/AuthProvider'
import { Dumbbell, Award, LineChart, Users, BarChart, Target, Zap, Shield, Smartphone, LogIn, ArrowRight, Repeat, Flame, ChevronDown } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)

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
    return null
  }

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="bg-gray-900 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/home" className="flex items-center text-2xl font-extrabold">
            <div className="h-8 w-8 mr-2 flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-600 rounded">
              <Dumbbell className="h-6 w-6 text-gray-800" />
            </div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">GymGa.me</span>
          </Link>
          <button
            onClick={signIn}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-full transition-colors duration-300"
          >
            Sign In
          </button>
        </div>
      </header>

      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6">Level Up Your Fitness Journey 🚀</h2>
          <p className="text-xl mb-8">GymGa.me: Your social gym companion with a gamified twist. Log workouts, connect with friends, and level up your fitness journey.</p>
          <button
            onClick={signIn}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
          >
            Sign Up with Google <ArrowRight className="inline-block ml-2" />
          </button>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-800">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Dumbbell, title: "Workout Logging", description: "Easily track your exercises and routines" },
              { icon: Award, title: "Achievements", description: "Earn rewards for your fitness milestones" },
              { icon: LineChart, title: "Progress Tracking", description: "Visualize your fitness journey" },
              { icon: Repeat, title: "Habit Building", description: "Develop and maintain healthy routines" },
              { icon: Users, title: "Social Connection", description: "Share and compete with friends" },
              { icon: Flame, title: "Daily Challenges", description: "Stay motivated with regular tasks" }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-gray-700 rounded-xl p-6 transition-all duration-300 hover:bg-gray-600 cursor-pointer shadow-lg border border-yellow-500"
              >
                <item.icon size={48} className="mb-4 text-yellow-500 mx-auto" />
                <h3 className="text-xl font-bold mb-2 text-center">{item.title}</h3>
                <p className="text-center text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why GymGa.me? 🤔</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Gamified Experience", description: "Make fitness fun and engaging" },
              { icon: Users, title: "Community Support", description: "Stay motivated with peer encouragement" },
              { icon: BarChart, title: "Insightful Analytics", description: "Understand your fitness trends" },
              { icon: Target, title: "Goal Setting", description: "Set and achieve personalized targets" },
              { icon: Shield, title: "Data Privacy", description: "Your information is secure with us" },
              { icon: Smartphone, title: "Mobile Access", description: "Track your progress on the go" }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-gray-700 rounded-xl p-6 transition-all duration-300 hover:bg-gray-600 cursor-pointer shadow-lg"
              >
                <item.icon className="text-yellow-500 w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-center">{item.title}</h3>
                <p className="text-center text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-800">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12">Features That Set Us Apart 🌟</h2>
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
            <div key={index} className="mb-8">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full bg-gray-700 p-4 rounded-xl flex justify-between items-center hover:bg-gray-600 transition-colors duration-300"
              >
                <h3 className="text-2xl font-semibold text-yellow-500 text-left">{section.title}</h3>
                <ChevronDown className={`transform transition-transform duration-300 ${activeSection === section.title ? 'rotate-180' : ''}`} />
              </button>
              {activeSection === section.title && (
                <ul className="mt-4 space-y-2 pl-6 bg-gray-700 p-4 rounded-xl">
                  {section.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-gray-300">• {feature}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg max-w-md">
          {error}
        </div>
      )}

      <footer className="bg-gray-900 py-8 px-4">
        <div className="container mx-auto text-center">
          <button
            onClick={signIn}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 mb-8"
          >
            <LogIn className="inline-block mr-2" /> Start Your Fitness Journey
          </button>
          <p className="text-gray-400 text-sm">
            © 2023 GymGa.me. All rights reserved. Elevate your fitness with social tracking and gamification.
          </p>
        </div>
      </footer>
    </main>
  )
}