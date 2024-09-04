'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { collection, query, where, getDocs, orderBy, limit, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { MainMenu } from '../../components/MainMenu'
import { Trash2, AlertCircle, Calendar, Clock, Dumbbell, Share2, ChevronDown, ChevronUp, Edit2, Sword } from 'lucide-react'
import html2canvas from 'html2canvas'

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
  name: string;
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
  const [expandedWorkouts, setExpandedWorkouts] = useState<string[]>([])
  const [editingWorkout, setEditingWorkout] = useState<string | null>(null)
  const [newWorkoutName, setNewWorkoutName] = useState('')
  const workoutRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const fetchWorkouts = useCallback(async () => {
    if (!user || !db) return;

    try {
      const workoutsQuery = query(
        collection(db, 'workouts'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
        limit(5)
      )
      const workoutsSnapshot = await getDocs(workoutsQuery)
      const workoutsData = workoutsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        name: doc.data().name || `Workout on ${new Date(doc.data().date.seconds * 1000).toLocaleDateString()}`
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
  }, [user])

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

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

  const handleScreenshot = async (workoutId: string) => {
    const workoutElement = workoutRefs.current[workoutId];
    if (workoutElement) {
      try {
        const canvas = await html2canvas(workoutElement, {
          scale: 2,
          logging: false,
          useCORS: true,
          backgroundColor: null,
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `workout-${workoutId}.png`;
        link.click();
      } catch (err) {
        console.error('Error creating screenshot:', err);
        setError('Failed to create screenshot. Please try again.');
      }
    }
  }

  const toggleExpand = (workoutId: string) => {
    setExpandedWorkouts(prev => 
      prev.includes(workoutId) 
        ? prev.filter(id => id !== workoutId)
        : [...prev, workoutId]
    );
  }

  const handleRenameWorkout = async (workoutId: string) => {
    if (!user || !db || !newWorkoutName.trim()) return;

    try {
      await updateDoc(doc(db, 'workouts', workoutId), { name: newWorkoutName.trim() });
      setWorkouts(prevWorkouts => prevWorkouts.map(workout => 
        workout.id === workoutId ? { ...workout, name: newWorkoutName.trim() } : workout
      ));
      setEditingWorkout(null);
      setNewWorkoutName('');
    } catch (err) {
      console.error('Error renaming workout:', err);
      setError(`Failed to rename workout: ${(err as Error).message}`);
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

  const getBestSet = (sets: Set[]) => {
    return sets.reduce((best, current) => 
      current.weight > best.weight ? current : best
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MainMenu />
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center animate-float">Your IronQuest History 🏆</h1>
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
            <div 
              key={workout.id} 
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border-4 border-yellow-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Sword className="h-6 w-6 mr-2 text-yellow-500" />
                  {editingWorkout === workout.id ? (
                    <input
                      type="text"
                      value={newWorkoutName}
                      onChange={(e) => setNewWorkoutName(e.target.value)}
                      className="bg-gray-700 text-white px-2 py-1 rounded"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleRenameWorkout(workout.id);
                      }}
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-white">
                      {workout.name}
                    </h2>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleScreenshot(workout.id)}
                    className="bg-yellow-500 text-gray-900 p-2 rounded-full hover:bg-yellow-400 transition-colors duration-200"
                    aria-label="Take screenshot"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  {editingWorkout === workout.id ? (
                    <button
                      onClick={() => handleRenameWorkout(workout.id)}
                      className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors duration-200"
                      aria-label="Save workout name"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingWorkout(workout.id);
                        setNewWorkoutName(workout.name);
                      }}
                      className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
                      aria-label="Rename workout"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                  )}
                  {deleteConfirmation === workout.id ? (
                    <>
                      <button
                        onClick={() => handleDeleteWorkout(workout.id)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-200"
                        aria-label="Confirm delete workout"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmation(null)}
                        className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600 transition-colors duration-200"
                        aria-label="Cancel delete workout"
                      >
                        <AlertCircle className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmation(workout.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors duration-200"
                      aria-label="Delete workout"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              <div ref={(el) => { workoutRefs.current[workout.id] = el; }}>
                <div className="flex items-center space-x-4 text-sm text-gray-300 mb-4">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {new Date(workout.date.seconds * 1000).toLocaleDateString()}
                  </div>
                  {workout.duration && (
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {formatDuration(workout.duration)}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {workout.exercises.map((exercise, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3">
                      <h3 className="text-lg font-semibold text-white flex items-center mb-2">
                        <Dumbbell className="mr-2 h-5 w-5 text-yellow-500" />
                        {exercise.name}
                      </h3>
                      {expandedWorkouts.includes(workout.id) ? (
                        <ul className="space-y-1 text-sm">
                          {exercise.sets.map((set, setIndex) => (
                            <li key={setIndex} className="text-gray-300">
                              Set {setIndex + 1}: {set.reps} x {set.weight}kg
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-gray-300 text-sm">
                          Best: {getBestSet(exercise.sets).reps} x {getBestSet(exercise.sets).weight}kg
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => toggleExpand(workout.id)}
                className="mt-4 text-yellow-500 hover:text-yellow-400 transition-colors duration-200 flex items-center"
              >
                {expandedWorkouts.includes(workout.id) ? (
                  <>
                    <ChevronUp className="mr-1 h-4 w-4" />
                    Minimize
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 h-4 w-4" />
                    Expand
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}