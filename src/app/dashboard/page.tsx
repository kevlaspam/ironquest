'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { MainMenu } from '../../components/MainMenu'

type Set = {
  reps: number;
  weight: number;
}

type Exercise = {
  name: string;
  sets: Set[];
}

type Workout = {
  id: string;
  date: { seconds: number; nanoseconds: number };
  exercises: Exercise[];
  duration?: number;
}

export default function Dashboard() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isIndexBuilding, setIsIndexBuilding] = useState(false)

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!user) {
        console.log("No user found");
        setLoading(false);
        return;
      }

      if (!db) {
        console.error("Firestore is not initialized");
        setError("Firestore is not initialized. Please check your Firebase configuration.");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching workouts for user:", user.uid);
        const workoutsQuery = query(
          collection(db, 'workouts'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          limit(5)
        )
        const workoutsSnapshot = await getDocs(workoutsQuery)
        console.log("Fetched workouts:", workoutsSnapshot.docs.length);
        const workoutsData = workoutsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Workout[]
        setWorkouts(workoutsData)
      } catch (err) {
        console.error('Error fetching workouts:', err)
        if ((err as Error).message.includes("The query requires an index")) {
          setIsIndexBuilding(true)
        } else {
          setError(`Failed to fetch workouts: ${(err as Error).message}`)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [user])

  if (!user) {
    return <div className="text-white text-center mt-10">Please sign in to view your dashboard.</div>
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  return (
    <div className="container mx-auto p-8">
      <MainMenu />
      <h1 className="text-4xl font-bold mb-8 text-white animate-float">Your IronQuest Dashboard 🏆</h1>
      {loading ? (
        <div className="text-white text-center">Loading...</div>
      ) : isIndexBuilding ? (
        <div className="text-yellow-300 text-center">
          <p>We're setting up some things to make your dashboard faster.</p>
          <p>This usually takes a few minutes. Please check back soon!</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="space-y-6">
          {workouts.map((workout) => (
            <div key={workout.id} className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 text-white">
                Workout on {new Date(workout.date.seconds * 1000).toLocaleDateString()}
              </h2>
              {workout.duration && (
                <p className="text-gray-200 mb-4">Duration: {formatDuration(workout.duration)}</p>
              )}
              {workout.exercises.map((exercise, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-xl font-semibold text-white">{exercise.name}</h3>
                  <ul className="list-disc list-inside text-gray-200">
                    {exercise.sets.map((set, setIndex) => (
                      <li key={setIndex}>Set {setIndex + 1}: {set.reps} reps at {set.weight} kg</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}