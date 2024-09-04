'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { collection, query, where, getDocs, orderBy, limit, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { MainMenu } from '../../components/MainMenu'
import { Trash2, AlertCircle, Calendar, Clock, Dumbbell, Share2, ChevronDown, ChevronUp, Edit2, Sword, Trophy } from 'lucide-react'
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
          backgroundColor: '#1F2937', // Match the background color
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.getElementById(workoutId);
            if (clonedElement) {
              clonedElement.style.padding = '2rem';
              clonedElement.style.borderRadius = '1rem';
              clonedElement.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }
          }
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
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${remainingSeconds}s`;
  }

  const getBestSet = (sets: Set[]) => {
    return sets.reduce((best, current) => 
      current.weight > best.weight ? current : best
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MainMenu />
      <h1 className="text-4xl font-bold mb-8 text-white text-center">
        Your IronQuest History
        <span className="inline-block ml-2 animate-bounce">🏆</span>
      </h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : isIndexBuilding ? (
        <div className="text-yellow-300 text-center p-8 bg-gray-800 rounded-xl shadow-lg">
          <Trophy className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-xl font-semibold mb-2">Preparing Your Quest Log</p>
          <p>We&apos;re setting up some things to make your dashboard faster.</p>
          <p>This usually takes a few minutes. Please check back soon!</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-8 bg-gray-800 rounded-xl shadow-lg">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">Oops! Something went wrong.</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out"
            >
              <div
                id={workout.id}
                ref={(el) => { workoutRefs.current[workout.id] = el; }}
                className="p-6 border-4 border-yellow-500"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <Sword className="h-8 w-8 text-yellow-500" />
                    {editingWorkout === workout.id ? (
                      <input
                        type="text"
                        value={newWorkoutName}
                        onChange={(e) => setNewWorkoutName(e.target.value)}
                        className="bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                      className="bg-yellow-500 text-gray-900 p-2 rounded-full hover:bg-yellow-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50"
                      aria-label="Take screenshot"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                    {editingWorkout === workout.id ? (
                      <button
                        onClick={() => handleRenameWorkout(workout.id)}
                        className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50"
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
                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                        aria-label="Rename workout"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                    )}
                    {deleteConfirmation === workout.id ? (
                      <>
                        <button
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
                          aria-label="Confirm delete workout"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmation(null)}
                          className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50"
                          aria-label="Cancel delete workout"
                        >
                          <AlertCircle className="h-5 w-5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmation(workout.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
                        aria-label="Delete workout"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-300 mb-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-yellow-500" />
                    <span>{new Date(workout.date.seconds * 1000).toLocaleDateString()}</span>
                  </div>
                  {workout.duration && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <span>{formatDuration(workout.duration)}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workout.exercises.map((exercise, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4 shadow-md">
                      <h3 className="text-lg font-semibold text-white flex items-center mb-3">
                        <Dumbbell className="mr-2 h-5 w-5 text-yellow-500" />
                        {exercise.name}
                      </h3>
                      <div className="text-gray-300 text-sm">
                        {expandedWorkouts.includes(workout.id) ? (
                          <ul className="space-y-2">
                            {exercise.sets.map((set, setIndex) => (
                              <li
                                key={setIndex}
                                className="flex justify-between items-center"
                              >
                                <span>Set {setIndex + 1}:</span>
                                <span className="font-medium">{set.reps} x {set.weight}kg</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span>Best Set:</span>
                            <span className="font-medium">
                              {getBestSet(exercise.sets).reps} x {getBestSet(exercise.sets).weight}kg
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => toggleExpand(workout.id)}
                className="w-full bg-gray-700 text-yellow-500 hover:text-yellow-400 transition-colors duration-200 py-3 flex items-center justify-center focus:outline-none focus:bg-gray-600"
              >
                {expandedWorkouts.includes(workout.id) ? (
                  <>
                    <ChevronUp className="mr-2 h-5 w-5" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-5 w-5" />
                    Show Details
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