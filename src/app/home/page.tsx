'use client'

import Link from 'next/link'
import { MainMenu } from '../../components/MainMenu'
import { Users, PlusSquare, History, BarChart2, Award, CheckSquare, User } from 'lucide-react'

export default function Home() {
  const pages = [
    { href: '/feed', label: 'Feed', icon: Users, description: 'View the social feed' },
    { href: '/workout/log', label: 'Log Workout', icon: PlusSquare, description: 'Record your latest workout' },
    { href: '/habits', label: 'Habits', icon: CheckSquare, description: 'Track your fitness habits' },
    { href: '/history', label: 'History', icon: History, description: 'Review past workouts' },
    { href: '/stats', label: 'Stats', icon: BarChart2, description: 'Analyze your progress' },
    { href: '/achievements', label: 'Achievements', icon: Award, description: 'View your accomplishments' },
    { href: '/profile', label: 'Profile', icon: User, description: 'Manage your account' },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MainMenu />
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center animate-float">
        Welcome to GymGa.me 🏋️‍♂️
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <Link key={page.href} href={page.href} className="group">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between p-6 border-4 border-yellow-500 h-full group-hover:scale-105 group-hover:from-gray-800 group-hover:via-gray-700 group-hover:to-gray-800">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white group-hover:text-yellow-400 transition-colors duration-300">
                    {page.label}
                  </h2>
                  <page.icon className="w-6 h-6 text-yellow-500 group-hover:text-yellow-400 transition-colors duration-300" />
                </div>
                <p className="text-gray-300 text-sm mb-4 group-hover:text-white transition-colors duration-300">
                  {page.description}
                </p>
              </div>
              <div className="flex justify-end">
                <span className="text-yellow-500 group-hover:text-yellow-400 transition-colors duration-300">
                  Go to {page.label} &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}