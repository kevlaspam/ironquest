'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { collection, query, where, getDocs, orderBy, limit, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { MainMenu } from '../../components/MainMenu'
import { Trash2, AlertCircle } from 'lucide-react'

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
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)

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

  useEffect(() => {
    fetchWorkouts()
  }, [user])

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!user || !db) return;

    try {
      await deleteDoc(doc(db, 'workouts', workoutId));
      setWorkouts(prevWorkouts => prevWorkouts.filter(workout => workout.id !== workoutId));
      setDeleteConfirmation(null);
    } catch (err) {
      console.error('Error deleting workout:', err);
      setError(`Failed to delete workout: ${(err as Error).message}`);
    }
  }

  if (!user) {
    return <div className="text-white text-center mt-10">Please sign in to view your dashboard.</div>
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MainMenu />
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center animate-float">Your IronQuest Dashboard 🏆</h1>
      {loading ? (
        <div className="text-white text-center">Loading...</div>
      ) : isIndexBuilding ? (
        <div className="text-yellow-300 text-center">
          <p>We&apos;re setting up some things to make your dashboard faster.</p>
          <p>This usually takes a few minutes. Please check back soon!</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="space-y-6">
          {workouts.map((workout) => (
            <div key={workout.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-purple-500 to-indigo-600">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-white">
                    Workout on {new Date(workout.date.seconds * 1000).toLocaleDateString()}
                  </h2>
                  {deleteConfirmation === workout.id ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDeleteWorkout(workout.id)}
                        className="text-red-500 hover:text-red-700 bg-white rounded-full p-1 transition-colors duration-200"
                        aria-label="Confirm delete workout"
                      >
                        <Trash2 size={20} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmation(null)}
                        className="text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 transition-colors duration-200"
                        aria-label="Cancel delete workout"
                      >
                        <AlertCircle size={20} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmation(workout.id)}
                      className="text-white hover:text-red-200 transition-colors duration-200"
                      aria-label="Delete workout"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
                {workout.duration && (
                  <p className="text-white mt-2">Duration: {formatDuration(workout.duration)}</p>
                )}
              </div>
              <div className="p-6">
                {workout.exercises.map((exercise, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <h3 className="text-xl font-semibold text-gray-800">{exercise.name}</h3>
                    <ul className="mt-2 space-y-1">
                      {exercise.sets.map((set, setIndex) => (
                        <li key={setIndex} className="text-gray-600">
                          Set {setIndex + 1}: {set.reps} reps at {set.weight} kg
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}