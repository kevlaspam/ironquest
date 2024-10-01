'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MainMenu } from '../../components/MainMenu'
import { Users, PlusSquare, History, BarChart2, Award, CheckSquare, User, Dumbbell, Zap, Calendar } from 'lucide-react'
import { useAuth } from '../../components/AuthProvider'
import { db } from '../../lib/firebase'
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { WorkoutCalendar } from '../../components/WorkoutCalendar'

type UserProfile = {
  name: string
  username: string
  height: number
  weightHistory: { date: string; weight: number }[]
  fitnessGoal: string
  activityLevel: string
  profileEmoji: string
}

export default function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalWeightLifted: 0,
    workoutStreak: 0,
  })
  const [workoutDates, setWorkoutDates] = useState<Date[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const fetchUserDataAndStats = async () => {
      if (!user) return

      try {
        // Fetch user profile
        const userProfileDoc = await getDoc(doc(db, 'users', user.uid))
        if (userProfileDoc.exists()) {
          setUserProfile(userProfileDoc.data() as UserProfile)
        }

        // Fetch workouts
        const workoutsQuery = query(
          collection(db, 'workouts'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          limit(365)
        )
        const workoutsSnapshot = await getDocs(workoutsQuery)
        const totalWorkouts = workoutsSnapshot.size

        let totalWeightLifted = 0
        const dates: Date[] = []
        workoutsSnapshot.forEach((doc) => {
          const workout = doc.data()
          dates.push(workout.date.toDate())
          workout.exercises?.forEach((exercise: any) => {
            exercise.sets?.forEach((set: any) => {
              totalWeightLifted += (set.weight || 0) * (set.reps || 0)
            })
          })
        })

        let streak = 0
        let lastWorkoutDate: Date | null = null

        workoutsSnapshot.forEach((doc) => {
          const workoutDate = doc.data().date.toDate()
          if (!lastWorkoutDate) {
            lastWorkoutDate = workoutDate
            streak = 1
          } else {
            const dayDifference = Math.floor((lastWorkoutDate.getTime() - workoutDate.getTime()) / (1000 * 3600 * 24))
            if (dayDifference === 1) {
              streak++
              lastWorkoutDate = workoutDate
            } else {
              return
            }
          }
        })

        setStats({
          totalWorkouts,
          totalWeightLifted,
          workoutStreak: streak,
        })
        setWorkoutDates(dates)
      } catch (error) {
        console.error('Error fetching user data and stats:', error)
      }
    }

    fetchUserDataAndStats()
  }, [user])

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
      <motion.h1 
        className="text-3xl md:text-4xl font-bold mb-8 text-white text-center animate-float"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome to GymGa.me, {userProfile?.username || userProfile?.name || 'Athlete'} 🏋️‍♂️
      </motion.h1>
      
      {/* User Stats */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-500">
        <h2 className="text-2xl font-bold mb-4 text-white">Your Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Workouts</p>
              <p className="text-2xl font-bold text-white">{stats.totalWorkouts}</p>
            </div>
            <Dumbbell className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Weight Lifted</p>
              <p className="text-2xl font-bold text-white">{stats.totalWeightLifted.toLocaleString()} kg</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Workout Streak</p>
              <p className="text-2xl font-bold text-white">{stats.workoutStreak} days</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Workout Calendar */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-4 mb-8 border-4 border-yellow-500">
        <WorkoutCalendar workoutDates={workoutDates} />
      </div>

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