'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { MainMenu } from '../../components/MainMenu'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts'

type Workout = {
  id: string;
  date: { seconds: number; nanoseconds: number };
  exercises: { name: string; sets: { reps: number; weight: number }[] }[];
  duration: number;
}

export default function Progress() {
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
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center animate-float">Your Progress 📈</h1>
      
      {loading ? (
        <div className="text-white text-center mt-10">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center mt-10">{error}</div>
      ) : !user ? (
        <div className="text-white text-center mt-10">Please sign in to view your progress.</div>
      ) : workouts.length === 0 ? (
        <div className="text-white text-center mt-10">No workouts logged yet. Start working out to see your progress!</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">Total Workouts</h2>
              <p className="text-4xl font-bold text-gray-700">{workouts.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">Workout Streak 🔥</h2>
              <p className="text-4xl font-bold text-gray-700">{calculateWorkoutStreak()} days</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">Total Volume</h2>
              <p className="text-4xl font-bold text-gray-700">{calculateTotalVolume().toLocaleString()} kg</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">Avg. Workout Duration</h2>
              <p className="text-4xl font-bold text-gray-700">
                {(workouts.reduce((total, workout) => total + workout.duration, 0) / workouts.length / 60).toFixed(1)} min
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Workout Duration Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prepareChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="duration" stroke="#8884d8" name="Duration (minutes)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Workout Volume Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prepareChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="volume" fill="#82ca9d" name="Volume (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Exercises per Workout</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prepareChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="exercises" stroke="#ffc658" name="Number of Exercises" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}