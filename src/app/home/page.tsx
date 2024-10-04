'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MainMenu } from '../../components/MainMenu'
import { Users, PlusSquare, History, BarChart2, Award, CheckSquare, User, Dumbbell, Zap, Calendar } from 'lucide-react'
import { useAuth } from '../../components/AuthProvider'
import { db } from '../../lib/firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { WorkoutCalendar } from '../../components/WorkoutCalendar'

type Workout = {
  id: string;
  date: { seconds: number; nanoseconds: number };
  exercises: { name: string; sets: { reps: number; weight: number }[] }[];
  duration: number;
}

export default function Home() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workoutDates, setWorkoutDates] = useState<Date[]>([])

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const workoutsQuery = query(
          collection(db, 'workouts'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        )
        const workoutsSnapshot = await getDocs(workoutsQuery)
        const workoutsData = workoutsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Workout[]
        setWorkouts(workoutsData)
        setWorkoutDates(workoutsData.map(workout => new Date(workout.date.seconds * 1000)))
      } catch (err) {
        console.error('Error fetching workouts:', err)
        setError(`Failed to fetch workouts: ${(err as Error).message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [user])

  const calculateWorkoutStreak = () => {
    if (workouts.length === 0) return 0;
    
    let streak = 1;
    let currentStreak = 1;
    let lastWorkoutDate = new Date(workouts[0].date.seconds * 1000);

    for (let i = 1; i < workouts.length; i++) {
      const workoutDate = new Date(workouts[i].date.seconds * 1000);
      const dayDifference = (lastWorkoutDate.getTime() - workoutDate.getTime()) / (1000 * 3600 * 24);

      if (dayDifference === 1) {
        currentStreak++;
        if (currentStreak > streak) {
          streak = currentStreak;
        }
      } else if (dayDifference > 1) {
        currentStreak = 1;
      }

      lastWorkoutDate = workoutDate;
    }

    return streak;
  }

  const calculateTotalVolume = () => {
    return workouts.reduce((total, workout) => 
      total + workout.exercises.reduce((exerciseTotal, exercise) => 
        exerciseTotal + exercise.sets.reduce((setTotal, set) => setTotal + (set.reps * set.weight), 0), 0
      ), 0
    );
  }

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
        Welcome to GymGa.me, Athlete 🏋️‍♂️
      </motion.h1>
      
      {loading ? (
        <div className="text-white text-center">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <>
          {/* User Stats */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-500">
            <h2 className="text-2xl font-bold mb-4 text-white">Your Stats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Workouts</p>
                  <p className="text-2xl font-bold text-white">{workouts.length}</p>
                </div>
                <Dumbbell className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Weight Lifted</p>
                  <p className="text-2xl font-bold text-white">{calculateTotalVolume().toLocaleString()} kg</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Workout Streak</p>
                  <p className="text-2xl font-bold text-white">{calculateWorkoutStreak()} days</p>
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
        </>
      )}
    </div>
  )
}