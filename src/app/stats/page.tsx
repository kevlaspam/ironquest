'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { MainMenu } from '../../components/MainMenu'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts'
import { Dumbbell, Clock, Flame, Trophy, Calendar, TrendingUp } from 'lucide-react'

type Workout = {
  id: string;
  date: { seconds: number; nanoseconds: number };
  exercises: { name: string; sets: { reps: number; weight: number }[] }[];
  duration: number;
}

export default function Stats() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      if (!db) {
        console.error("Firestore is not initialized")
        setError("Firestore is not initialized. Please check your Firebase configuration.")
        setLoading(false)
        return
      }

      try {
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
    let lastWorkoutDate = new Date(workouts[workouts.length - 1].date.seconds * 1000);

    for (let i = workouts.length - 2; i >= 0; i--) {
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

  const prepareChartData = () => {
    return workouts.map(workout => ({
      date: new Date(workout.date.seconds * 1000).toLocaleDateString(),
      duration: workout.duration / 60, // Convert to minutes
      exercises: workout.exercises.length,
      volume: workout.exercises.reduce((total, exercise) => 
        total + exercise.sets.reduce((setTotal, set) => setTotal + (set.reps * set.weight), 0), 0
      )
    }));
  }

  const calculateTotalVolume = () => {
    return workouts.reduce((total, workout) => 
      total + workout.exercises.reduce((exerciseTotal, exercise) => 
        exerciseTotal + exercise.sets.reduce((setTotal, set) => setTotal + (set.reps * set.weight), 0), 0
      ), 0
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MainMenu />
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center animate-float">
        Your GymGa.me Stats 📊
      </h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-8 bg-gray-800 rounded-xl shadow-lg">
          <p className="text-xl font-semibold mb-2">Oops! Something went wrong.</p>
          <p>{error}</p>
        </div>
      ) : !user ? (
        <div className="text-white text-center mt-10">Please sign in to view your fitness progress.</div>
      ) : workouts.length === 0 ? (
        <div className="text-white text-center mt-10">No workouts completed yet. Start your journey to see your progress!</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-white">Workouts Completed</h2>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-4xl font-bold text-yellow-500">{workouts.length}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-white">Workout Streak</h2>
                <Flame className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-4xl font-bold text-yellow-500">{calculateWorkoutStreak()} days</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-white">Total Weight Lifted</h2>
                <TrendingUp className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-4xl font-bold text-yellow-500">{calculateTotalVolume().toLocaleString()} kg</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-white">Avg. Workout Duration</h2>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-4xl font-bold text-yellow-500">
                {(workouts.reduce((total, workout) => total + workout.duration, 0) / workouts.length / 60).toFixed(1)} min
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-white">Total Workout Time</h2>
                <Calendar className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-4xl font-bold text-yellow-500">
                {(workouts.reduce((total, workout) => total + workout.duration, 0) / 60).toFixed(1)} min
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-white">Total Exercises</h2>
                <Dumbbell className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-4xl font-bold text-yellow-500">
                {workouts.reduce((total, workout) => total + workout.exercises.length, 0)}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-500">
            <h2 className="text-2xl font-semibold mb-4 text-white">Workout Duration Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prepareChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="duration" stroke="#EAB308" strokeWidth={2} name="Duration (minutes)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-500">
            <h2 className="text-2xl font-semibold mb-4 text-white">Weight Lifted Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prepareChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
                <Legend />
                <Bar dataKey="volume" fill="#EAB308" name="Weight Lifted (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border-4 border-yellow-500">
            <h2 className="text-2xl font-semibold mb-4 text-white">Exercises per Workout</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prepareChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="exercises" stroke="#EAB308" strokeWidth={2} name="Number of Exercises" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}