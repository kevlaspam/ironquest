'use client'

import { useState, useEffect } from 'react'
import { MainMenu } from '../../components/MainMenu'
import { Achievements } from '../../components/Achievements'
import { useAuth } from '../../components/AuthProvider'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../../lib/firebase'

type Workout = {
  id: string;
  date: { seconds: number; nanoseconds: number };
  exercises: { name: string; sets: { reps: number; weight: number }[] }[];
  duration: number;
}

export default function AchievementsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        console.log('No user logged in')
        setLoading(false)
        return
      }

      console.log('Fetching data for user:', user.uid)

      if (!db) {
        console.error("Firestore is not initialized")
        setError("Firestore is not initialized. Please check your Firebase configuration.")
        setLoading(false)
        return
      }

      try {
        // Fetch workouts
        const workoutsQuery = query(
          collection(db, 'workouts'),
          where('userId', '==', user.uid),
          orderBy('date', 'asc')
        )
        const workoutsSnapshot = await getDocs(workoutsQuery)
        const workoutsData = workoutsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Workout[]
        setWorkouts(workoutsData)

      } catch (error) {
        console.error('Error fetching user data:', error)
        setError('Failed to load user data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <MainMenu />
        <div className="text-red-500 text-center p-8 bg-gray-800 rounded-xl shadow-lg">
          <p className="text-xl font-semibold mb-2">Oops! Something went wrong.</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <MainMenu />
        <div className="text-white text-center mt-10">Please sign in to view your achievements.</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MainMenu />
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center animate-float">Your Achievements 🏆</h1>
      
      <Achievements workouts={workouts} />
    </div>
  )
}