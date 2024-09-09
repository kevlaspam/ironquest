'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { collection, query, where, getDocs, orderBy, limit, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { MainMenu } from '../../components/MainMenu'
import { Trash2, AlertCircle, Calendar, Clock, Dumbbell, Share2, ChevronDown, ChevronUp, Edit2, Sword, Trophy, Save, Info } from 'lucide-react'
import html2canvas from 'html2canvas'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
      toast.success('Workout deleted successfully');
    } catch (err) {
      console.error('Error deleting workout:', err);
      toast.error(`Failed to delete workout: ${(err as Error).message}`);
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
          backgroundColor: '#1F2937',
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
        toast.success('Screenshot saved successfully');
      } catch (err) {
        console.error('Error creating screenshot:', err);
        toast.error('Failed to create screenshot. Please try again.');
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
      toast.success('Workout renamed successfully');
    } catch (err) {
      console.error('Error renaming workout:', err);
      toast.error(`Failed to rename workout: ${(err as Error).message}`);
    }
  }

  const handleSaveAsTemplate = async (workout: Workout) => {
    if (!user || !db) return;

    try {
      const templateData = {
        userId: user.uid,
        name: workout.name,
        exercises: workout.exercises
      };
      await addDoc(collection(db, 'userWorkouts'), templateData);
      toast.success('Workout saved as template!');
    } catch (err) {
      console.error('Error saving workout as template:', err);
      toast.error(`Failed to save workout as template: ${(err as Error).message}`);
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
      <ToastContainer />
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center animate-float">
        Your Workout History 🏆
      </h1>

      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-500 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white">Quick Guide</h2>
          <Info className="w-6 h-6 text-yellow-500" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button
              className="bg-yellow-500 text-gray-900 p-2 rounded-full hover:bg-yellow-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50"
              aria-label="Take screenshot"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <p className="text-gray-300">Press this button to take a screenshot of your workout</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50"
              aria-label="Save as template"
            >
              <Save className="h-5 w-5" />
            </button>
            <p className="text-gray-300">Press this button to save this workout as a template</p>
          </div>
        </div>
      </div>

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
        <div className="space-y-4">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg"
            >
              <div
                id={workout.id}
                ref={(el) => { workoutRefs.current[workout.id] = el; }}
                className="p-4 border-2 border-yellow-500"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Sword className="h-6 w-6 text-yellow-500" />
                    {editingWorkout === workout.id ? (
                      <input
                        type="text"
                        value={newWorkoutName}
                        onChange={(e) => setNewWorkoutName(e.target.value)}
                        className="bg-gray-700 text-white px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleRenameWorkout(workout.id);
                        }}
                      />
                    ) : (
                      <h2 className="text-lg font-bold text-white">
                        {workout.name}
                      </h2>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSaveAsTemplate(workout)}
                      className="text-green-500 hover:text-green-400 transition-colors duration-200"
                      title="Save as template"
                    >
                      <Save className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleScreenshot(workout.id)}
                      className="text-yellow-500 hover:text-yellow-400 transition-colors duration-200"
                      title="Take screenshot"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (editingWorkout === workout.id) {
                          handleRenameWorkout(workout.id);
                        } else {
                          setEditingWorkout(workout.id);
                          setNewWorkoutName(workout.name);
                        }
                      }}
                      className="text-blue-500 hover:text-blue-400 transition-colors duration-200"
                      title={editingWorkout === workout.id ? "Save workout name" : "Rename workout"}
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteWorkout(workout.id)}
                      className="text-red-500 hover:text-red-400 transition-colors duration-200"
                      title="Delete workout"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-400 mb-2">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-yellow-500" />
                    <span>{new Date(workout.date.seconds * 1000).toLocaleDateString()}</span>
                  </div>
                  {workout.duration && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span>{formatDuration(workout.duration)}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {workout.exercises.map((exercise, index) => (
                    <div key={index} className="bg-gray-700 rounded p-2 text-xs">
                      <h3 className="font-semibold text-white flex items-center mb-1">
                        <Dumbbell className="mr-1 h-3 w-3 text-yellow-500" />
                        {exercise.name}
                      </h3>
                      <div className="text-gray-300">
                        {expandedWorkouts.includes(workout.id) ? (
                          <ul className="space-y-1">
                            {exercise.sets.map((set, setIndex) => (
                              <li key={setIndex} className="flex justify-between items-center">
                                <span>Set {setIndex + 1}:</span>
                                <span className="font-medium">{set.reps} x {set.weight}kg</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span>Best:</span>
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
                className="w-full bg-gray-800 text-yellow-500 hover:text-yellow-400 transition-colors duration-200 py-2 flex items-center justify-center focus:outline-none focus:bg-gray-700 text-sm"
              >
                {expandedWorkouts.includes(workout.id) ? (
                  <>
                    <ChevronUp className="mr-1 h-4 w-4" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 h-4 w-4" />
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