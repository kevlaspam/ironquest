'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../components/AuthProvider'
import { db } from '../../../lib/firebase'
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { MainMenu } from '../../../components/MainMenu'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Clipboard, ChevronRight, X, Plus, Save, Dumbbell, Play, Pause, RotateCcw, Trash2, ChevronUp, ChevronDown, Check } from 'lucide-react'

type Exercise = {
  name: string
  sets: { reps: number; weight: number; completed: boolean }[]
}

type Workout = {
  id?: string
  name: string
  exercises: Exercise[]
}

const exerciseOptions = {
  Chest: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Decline Bench Press', 'Chest Dips', 'Push-Ups', 'Cable Flyes', 'Pec Deck Machine', 'Landmine Press', 'Smith Machine Bench Press'],
  Back: ['Lat Pulldown', 'Seated Cable Row', 'Bent Over Barbell Row', 'T-Bar Row', 'Pull-Ups', 'Chin-Ups', 'Face Pulls', 'Straight Arm Pulldown', 'Single-Arm Dumbbell Row'],
  Shoulders: ['Overhead Barbell Press', 'Dumbbell Shoulder Press', 'Arnold Press', 'Lateral Raises', 'Front Raises', 'Reverse Flyes', 'Upright Rows', 'Shrugs'],
  Biceps: ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curls', 'Preacher Curls', 'Concentration Curls', 'Cable Curls', 'Incline Dumbbell Curls', 'Spider Curls'],
  Triceps: ['Tricep Pushdowns', 'Overhead Tricep Extension', 'Skull Crushers', 'Close-Grip Bench Press', 'Diamond Push-Ups', 'Tricep Dips', 'Cable Tricep Kickbacks'],
  Legs: ['Barbell Back Squat', 'Front Squat', 'Leg Press', 'Romanian Deadlift', 'Lunges', 'Leg Extensions', 'Leg Curls', 'Calf Raises', 'Hip Thrusts', 'Bulgarian Split Squats'],
  Abs: ['Crunches', 'Planks', 'Russian Twists', 'Leg Raises', 'Ab Wheel Rollouts', 'Hanging Leg Raises', 'Cable Crunches', 'Mountain Climbers'],
  Compound: ['Deadlifts', 'Power Cleans', 'Barbell Rows', 'Dumbbell Thrusters'],
  Machines: ['Chest Press Machine', 'Shoulder Press Machine', 'Leg Press Machine', 'Seated Leg Curl Machine', 'Lat Pulldown Machine', 'Seated Row Machine', 'Pec Deck Machine', 'Tricep Pushdown Machine'],
  Bodyweight: ['Push-Ups', 'Pull-Ups', 'Dips', 'Squats', 'Lunges', 'Burpees', 'Mountain Climbers', 'Plank', 'Side Plank', 'Glute Bridges', 'Step-Ups'],
  Cable: ['Cable Crossovers', 'Cable Woodchoppers', 'Cable Crunches', 'Cable Lateral Raises', 'Cable Face Pulls', 'Cable Tricep Pushdowns', 'Cable Bicep Curls']
}

const preFilledWorkouts = {
  chestTriceps: {
    name: 'Chest/Triceps',
    icon: '💪',
    exercises: [
      { name: 'Barbell Bench Press', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
      { name: 'Incline Dumbbell Press', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
      { name: 'Chest Dips', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
      { name: 'Tricep Pushdowns', sets: [{ reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }] },
      { name: 'Overhead Tricep Extension', sets: [{ reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }] },
    ]
  },
  backBiceps: {
    name: 'Back/Biceps',
    icon: '🏋️',
    exercises: [
      { name: 'Lat Pulldown', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
      { name: 'Seated Cable Row', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
      { name: 'T-Bar Row', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
      { name: 'Barbell Curl', sets: [{ reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }] },
      { name: 'Hammer Curls', sets: [{ reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }] },
    ]
  },
  shoulders: {
    name: 'Shoulders',
    icon: '🏔️',
    exercises: [
      { name: 'Overhead Barbell Press', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
      { name: 'Lateral Raises', sets: [{ reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }] },
      { name: 'Front Raises', sets: [{ reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }] },
      { name: 'Face Pulls', sets: [{ reps: 12, weight: 0, completed: false }, { reps: 12, weight: 0, completed: false }, { reps: 12, weight: 0, completed: false }] },
      { name: 'Shrugs', sets: [{ reps: 12, weight: 0, completed: false }, { reps: 12, weight: 0, completed: false }, { reps: 12, weight: 0, completed: false }] },
    ]
  },
  legs: {
    name: 'Legs',
    icon: '🦵',
    exercises: [
      { name: 'Barbell Back Squat', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
      { name: 'Romanian Deadlift', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
      { name: 'Leg Press', sets: [{ reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }] },
      { name: 'Leg Extensions', sets: [{ reps: 12, weight: 0, completed: false }, { reps: 12, weight: 0, completed: false }, { reps: 12, weight: 0, completed: false }] },
      { name: 'Calf Raises', sets: [{ reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }] },
    ]
  },
  fullBody: {
    name: 'Full Body',
    icon: '💪🏋️',
    exercises: [
      { name: 'Barbell Bench Press', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
      { name: 'Lat Pulldown', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
      { name: 'Barbell Back Squat', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
      { name: 'Overhead Barbell Press', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
      { name: 'Barbell Curl', sets: [{ reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }] },
      { name: 'Tricep Pushdowns', sets: [{ reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }] },
    ]
  },
  bodyweightBasic: {
    name: 'Bodyweight Basic',
    icon: '🏃',
    exercises: [
      { name: 'Push-Ups', sets: [{ reps: 12, weight: 0, completed: false }, { reps: 12, weight: 0, completed: false }, { reps: 12, weight: 0, completed: false }] },
      { name: 'Pull-Ups', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
      { name: 'Squats', sets: [{ reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }] },
      { name: 'Lunges', sets: [{ reps: 12, weight: 0, completed: false }, { reps: 12, weight: 0, completed: false }, { reps: 12, weight: 0, completed: false }] },
      { name: 'Plank', sets: [{ reps: 30, weight: 0, completed: false }, { reps: 30, weight: 0, completed: false }, { reps: 30, weight: 0, completed: false }] },
    ]
  },
  absCore: {
    name: 'Abs & Core',
    icon: '🧘',
    exercises: [
      { name: 'Crunches', sets: [{ reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }] },
      { name: 'Russian Twists', sets: [{ reps: 20, weight: 0, completed: false }, { reps: 20, weight: 0, completed: false }, { reps: 20, weight: 0, completed: false }] },
      { name: 'Leg Raises', sets: [{ reps: 12, weight: 0, completed: false }, { reps: 12, weight: 0, completed: false }, { reps: 12, weight: 0, completed: false }] },
      { name: 'Plank', sets: [{ reps: 30, weight: 0, completed: false }, { reps: 30, weight: 0, completed: false }, { reps: 30, weight: 0, completed: false }] },
      { name: 'Mountain Climbers', sets: [{ reps: 20, weight: 0, completed: false }, { reps: 20, weight: 0, completed: false }, { reps: 20, weight: 0, completed: false }] },
    ]
  },
}

export default function LogWorkout() {
  const { user } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([{ name: '', sets: [{ reps: 0, weight: 0, completed: false }] }])
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [workoutStarted, setWorkoutStarted] = useState(false)
  const [restTimer, setRestTimer] = useState(0)
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false)
  const [userWorkouts, setUserWorkouts] = useState<Workout[]>([])
  const [newWorkoutName, setNewWorkoutName] = useState('')
  const [restDuration, setRestDuration] = useState(60)
  const [currentWorkoutName, setCurrentWorkoutName] = useState('')
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchUserWorkouts()
    }
  }, [user])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isTimerRunning])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRestTimerRunning) {
      interval = setInterval(() => {
        setRestTimer((prevTimer) => {
          if (prevTimer > 0) {
            return prevTimer - 1
          } else {
            setIsRestTimerRunning(false)
            return 0
          }
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRestTimerRunning])

  const fetchUserWorkouts = async () => {
    if (!user) return

    const q = query(collection(db, 'userWorkouts'), where('userId', '==', user.uid))
    const querySnapshot = await getDocs(q)
    const workouts: Workout[] = []
    querySnapshot.forEach((doc) => {
      workouts.push({ id: doc.id, ...doc.data() } as Workout)
    })
    setUserWorkouts(workouts)
  }

  const startWorkout = (workout?: Workout) => {
    setWorkoutStarted(true)
    setIsTimerRunning(true)
    if (workout) {
      setExercises(workout.exercises)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleExerciseChange = (exerciseIndex: number, bodyPart: string, exerciseName: string) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].name = exerciseName
    setExercises(newExercises)
    setSelectedBodyPart(null)
  }

  const handleSetChange = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets[setIndex][field] = value
    setExercises(newExercises)
  }

  const toggleSetCompletion = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets[setIndex].completed = !newExercises[exerciseIndex].sets[setIndex].completed
    setExercises(newExercises)
  }

  const addSet = (exerciseIndex: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets.push({ reps: 0, weight: 0, completed: false })
    setExercises(newExercises)
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets.splice(setIndex, 1)
    setExercises(newExercises)
  }

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ reps: 0, weight: 0, completed: false }] }])
  }

  const removeExercise = (index: number) => {
    const newExercises = [...exercises]
    newExercises.splice(index, 1)
    setExercises(newExercises)
  }

  const startRestTimer = () => {
    setRestTimer(restDuration)
    setIsRestTimerRunning(true)
  }

  const adjustRestDuration = (adjustment: number) => {
    setRestDuration(prevDuration => Math.max(30, prevDuration + adjustment))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('You must be logged in to log a workout')
      return
    }

    if (!currentWorkoutName.trim()) {
      toast.error('Please enter a name for your workout')
      return
    }

    setIsTimerRunning(false)

    try {
      await addDoc(collection(db, 'workouts'), {
        userId: user.uid,
        name: currentWorkoutName,
        exercises,
        duration: timer,
        date: serverTimestamp(),
      })
      toast.success('Workout logged successfully!')
      setExercises([{ name: '', sets: [{ reps: 0, weight: 0, completed: false }] }])
      setTimer(0)
      setWorkoutStarted(false)
      setCurrentWorkoutName('')
    } catch (error) {
      console.error('Error adding document: ', error)
      toast.error('Failed to log workout. Please try again.')
    }
  }

  const saveWorkout = async () => {
    if (!user) {
      toast.error('You must be logged in to save a workout')
      return
    }

    if (!newWorkoutName) {
      toast.error('Please enter a name for your workout')
      return
    }

    try {
      await addDoc(collection(db, 'userWorkouts'), {
        userId: user.uid,
        name: newWorkoutName,
        exercises,
      })
      toast.success('Workout saved successfully!')
      setNewWorkoutName('')
      fetchUserWorkouts()
    } catch (error) {
      console.error('Error saving workout: ', error)
      toast.error('Failed to save workout. Please try again.')
    }
  }

  const deleteWorkout = async (workoutId: string) => {
    if (!user) {
      toast.error('You must be logged in to delete a workout')
      return
    }

    try {
      await deleteDoc(doc(db, 'userWorkouts', workoutId))
      toast.success('Workout deleted successfully!')
      fetchUserWorkouts()
    } catch (error) {
      console.error('Error deleting workout: ', error)
      toast.error('Failed to delete workout. Please try again.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MainMenu />
      <ToastContainer />
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center animate-float">Choose Your Workout 🏆</h1>
      
      {!workoutStarted ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div 
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col justify-between p-6 border-4 border-yellow-500"
              onClick={() => startWorkout()}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Blank Workout</h2>
                  <Clipboard className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-gray-300 text-sm mb-4">Create your own custom workout from scratch.</p>
              </div>
              <div className="flex justify-end">
                <ChevronRight className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
            {Object.entries(preFilledWorkouts).map(([key, workout]) => (
              <div 
                key={key} 
                className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col justify-between p-6 border-4 border-yellow-500"
                onClick={() => startWorkout({ name: workout.name, exercises: workout.exercises })}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white truncate" title={workout.name}>{workout.name}</h2>
                    <span className="text-2xl">{workout.icon}</span>
                  </div>
                  <ul className="text-gray-300 text-sm mb-4 list-disc list-inside">
                    {workout.exercises.slice(0, 3).map((exercise, index) => (
                      <li key={index} className="truncate">{exercise.name}</li>
                    ))}
                    {workout.exercises.length > 3 && (
                      <li className="text-gray-400">+{workout.exercises.length - 3} more</li>
                    )}
                  </ul>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{workout.exercises.length} exercises</span>
                  <ChevronRight className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-4 text-white">Your Saved Workouts</h2>
          {userWorkouts.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border-4 border-yellow-500 text-center">
              <p className="text-white mb-4">You haven&apos;t saved any workouts yet.</p>
              <p className="text-gray-300">Go to the &apos;History&apos; page to save one of your previous workouts as a template!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {userWorkouts.map((workout) => (
                <div 
                  key={workout.id} 
                  className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between p-6 border-4 border-yellow-500 cursor-pointer"
                  onClick={() => startWorkout(workout)}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-white truncate" title={workout.name}>{workout.name}</h2>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWorkout(workout.id!);
                        }} 
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <ul className="text-gray-300 text-sm mb-4 list-disc list-inside">
                      {workout.exercises.slice(0, 3).map((exercise, index) => (
                        <li key={index} className="truncate">{exercise.name}</li>
                      ))}
                      {workout.exercises.length > 3 && (
                        <li className="text-gray-400">+{workout.exercises.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{workout.exercises.length} exercises</span>
                    <ChevronRight className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-500">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white mb-2 md:mb-0">Name Your Workout</h2>
              <input
                type="text"
                value={currentWorkoutName}
                onChange={(e) => setCurrentWorkoutName(e.target.value)}
                placeholder="Enter workout name"
                className="bg-gray-700 text-white rounded-lg p-2 w-full md:w-1/2"
                required
              />
            </div>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Workout Timer</h3>
              <p className="text-3xl font-bold text-yellow-500">{formatTime(timer)}</p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <h3 className="text-lg font-semibold text-white">Rest Timer</h3>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-yellow-500">{formatTime(restTimer)}</p>
                {isRestTimerRunning ? (
                  <button onClick={() => setIsRestTimerRunning(false)} className="bg-red-500 text-white p-2 rounded-full">
                    <Pause size={20} />
                  </button>
                ) : (
                  <button onClick={startRestTimer} className="bg-green-500 text-white p-2 rounded-full">
                    <Play size={20} />
                  </button>
                )}
                <button onClick={() => setRestTimer(restDuration)} className="bg-blue-500 text-white p-2 rounded-full">
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-white">Rest Duration: {formatTime(restDuration)}</span>
              <div className="flex items-center space-x-2">
                <button onClick={() => adjustRestDuration(-30)} className="bg-gray-700 text-white p-2 rounded-full">
                  <ChevronDown size={20} />
                </button>
                <button onClick={() => adjustRestDuration(30)} className="bg-gray-700 text-white p-2 rounded-full">
                  <ChevronUp size={20} />
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {exercises.map((exercise, exerciseIndex) => (
              <div key={exerciseIndex} className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border-4 border-yellow-500">
                <div className="flex justify-between items-center mb-4">
                  <div className="relative w-2/3">
                    <button
                      type="button"
                      onClick={() => setSelectedBodyPart(selectedBodyPart === exerciseIndex.toString() ? null : exerciseIndex.toString())}
                      className="bg-gray-700 text-white rounded-lg p-2 w-full text-left flex justify-between items-center"
                    >
                      {exercise.name || "Select an exercise"}
                      <ChevronDown size={20} />
                    </button>
                    {selectedBodyPart === exerciseIndex.toString() && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {Object.entries(exerciseOptions).map(([bodyPart, exercises]) => (
                          <div key={bodyPart}>
                            <div className="sticky top-0 bg-gray-900 px-4 py-2 font-semibold text-yellow-500">
                              {bodyPart}
                            </div>
                            {exercises.map((exerciseName) => (
                              <button
                                key={exerciseName}
                                type="button"
                                onClick={() => handleExerciseChange(exerciseIndex, bodyPart, exerciseName)}
                                className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
                              >
                                {exerciseName}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExercise(exerciseIndex)}
                    className="bg-red-500 text-white p-2 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center space-x-2">
                      <span className="text-white">Set {setIndex + 1}</span>
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'reps', parseInt(e.target.value))}
                        className="bg-gray-700 text-white rounded-lg p-2 w-20"
                        placeholder="Reps"
                      />
                      <input
                        type="number"
                        value={set.weight}
                        onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'weight', parseInt(e.target.value))}
                        className="bg-gray-700 text-white rounded-lg p-2 w-20"
                        placeholder="Weight"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSetCompletion(exerciseIndex, setIndex)}
                        className={`p-2 rounded-full ${set.completed ? 'bg-green-500' : 'bg-gray-700'}`}
                      >
                        <Check size={20} className="text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSet(exerciseIndex, setIndex)}
                        className="bg-red-500 text-white p-2 rounded-full"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addSet(exerciseIndex)}
                  className="mt-4 bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors duration-200"
                >
                  Add Set
                </button>
              </div>
            ))}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={addExercise}
                className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors duration-200 flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Add Exercise
              </button>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-400 transition-colors duration-200 flex items-center"
              >
                <Save size={20} className="mr-2" />
                Log Workout
              </button>
            </div>
          </form>
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border-4 border-yellow-500">
            <h2 className="text-xl font-semibold text-white mb-4">Save Workout as Template</h2>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newWorkoutName}
                onChange={(e) => setNewWorkoutName(e.target.value)}
                placeholder="Enter workout name"
                className="bg-gray-700 text-white rounded-lg p-2 flex-grow"
              />
              <button
                onClick={saveWorkout}
                className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors duration-200 flex items-center"
              >
                <Save size={20} className="mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}