'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../components/AuthProvider'
import { db } from '../../../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { MainMenu } from '../../../components/MainMenu'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Clipboard, ChevronRight, X, Plus, Save, Sword, Play, Pause, RotateCcw } from 'lucide-react'

type Exercise = {
  name: string
  sets: { reps: number; weight: number }[]
}

const exerciseOptions = [
  'Barbell Bench Press', 'Incline Dumbbell Press', 'Chest Dips', 'Tricep Rope Pushdown', 'Overhead Tricep Extension',
  'Iso-Lateral Row', 'Lat Pulldown', 'T-Bar Row', 'Seated Cable Row', 'Barbell Curl', 'Hammer Curls',
  'Overhead Barbell Press', 'Side Lateral Raises', 'Rear Delt Flyes', 'Face Pulls', 'Shrugs',
  'Leg Press', 'Hack Squat', 'Leg Curl', 'Leg Extension', 'Calf Raises',
  'Incline Barbell Press', 'Dumbbell Shoulder Press', 'Cable Flyes', 'Lateral Raises', 'Tricep Dips',
  'Bent Over Row', 'Deadlift', 'Concentration Curl'
]

const preFilledWorkouts = {
  chestTriceps: {
    name: 'Chest/Triceps',
    icon: '💪',
    exercises: [
      { name: 'Barbell Bench Press', sets: [{ reps: 8, weight: 0 }, { reps: 8, weight: 0 }, { reps: 8, weight: 0 }, { reps: 8, weight: 0 }] },
      { name: 'Incline Dumbbell Press', sets: [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }, { reps: 10, weight: 0 }] },
      { name: 'Chest Dips', sets: [{ reps: 12, weight: 0 }, { reps: 12, weight: 0 }, { reps: 12, weight: 0 }] },
      { name: 'Tricep Rope Pushdown', sets: [{ reps: 14, weight: 0 }, { reps: 14, weight: 0 }, { reps: 14, weight: 0 }] },
      { name: 'Overhead Tricep Extension', sets: [{ reps: 11, weight: 0 }, { reps: 11, weight: 0 }, { reps: 11, weight: 0 }] },
    ]
  },
  backBiceps: {
    name: 'Back/Biceps',
    icon: '🏋️',
    exercises: [
      { name: 'Iso-Lateral Row', sets: [{ reps: 9, weight: 0 }, { reps: 9, weight: 0 }, { reps: 9, weight: 0 }, { reps: 9, weight: 0 }] },
      { name: 'Lat Pulldown', sets: [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }, { reps: 10, weight: 0 }] },
      { name: 'T-Bar Row', sets: [{ reps: 9, weight: 0 }, { reps: 9, weight: 0 }, { reps: 9, weight: 0 }] },
      { name: 'Seated Cable Row', sets: [{ reps: 11, weight: 0 }, { reps: 11, weight: 0 }, { reps: 11, weight: 0 }] },
      { name: 'Barbell Curl', sets: [{ reps: 11, weight: 0 }, { reps: 11, weight: 0 }, { reps: 11, weight: 0 }] },
      { name: 'Hammer Curls', sets: [{ reps: 11, weight: 0 }, { reps: 11, weight: 0 }, { reps: 11, weight: 0 }] },
    ]
  },
  shoulders: {
    name: 'Shoulders',
    icon: '🏔️',
    exercises: [
      { name: 'Overhead Barbell Press', sets: [{ reps: 7, weight: 0 }, { reps: 7, weight: 0 }, { reps: 7, weight: 0 }, { reps: 7, weight: 0 }] },
      { name: 'Side Lateral Raises', sets: [{ reps: 14, weight: 0 }, { reps: 14, weight: 0 }, { reps: 14, weight: 0 }] },
      { name: 'Rear Delt Flyes', sets: [{ reps: 14, weight: 0 }, { reps: 14, weight: 0 }, { reps: 14, weight: 0 }] },
      { name: 'Face Pulls', sets: [{ reps: 14, weight: 0 }, { reps: 14, weight: 0 }, { reps: 14, weight: 0 }] },
      { name: 'Shrugs', sets: [{ reps: 11, weight: 0 }, { reps: 11, weight: 0 }, { reps: 11, weight: 0 }] },
    ]
  },
  legs: {
    name: 'Legs',
    icon: '🦵',
    exercises: [
      { name: 'Leg Press', sets: [{ reps: 9, weight: 0 }, { reps: 9, weight: 0 }, { reps: 9, weight: 0 }, { reps: 9, weight: 0 }] },
      { name: 'Hack Squat', sets: [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }, { reps: 10, weight: 0 }] },
      { name: 'Leg Curl', sets: [{ reps: 11, weight: 0 }, { reps: 11, weight: 0 }, { reps: 11, weight: 0 }] },
      { name: 'Leg Extension', sets: [{ reps: 11, weight: 0 }, { reps: 11, weight: 0 }, { reps: 11, weight: 0 }] },
      { name: 'Calf Raises', sets: [{ reps: 18, weight: 0 }, { reps: 18, weight: 0 }, { reps: 18, weight: 0 }] },
    ]
  },
  chestShouldersTriceps: {
    name: 'Chest/Shoulders/Triceps',
    icon: '💪🏔️',
    exercises: [
      { name: 'Incline Barbell Press', sets: [{ reps: 7, weight: 0 }, { reps: 7, weight: 0 }, { reps: 7, weight: 0 }, { reps: 7, weight: 0 }] },
      { name: 'Dumbbell Shoulder Press', sets: [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }, { reps: 10, weight: 0 }] },
      { name: 'Cable Flyes', sets: [{ reps: 11, weight: 0 }, { reps: 11, weight: 0 }, { reps: 11, weight: 0 }] },
      { name: 'Lateral Raises', sets: [{ reps: 14, weight: 0 }, { reps: 14, weight: 0 }, { reps: 14, weight: 0 }] },
      { name: 'Tricep Dips', sets: [{ reps: 11, weight: 0 }, { reps: 11, weight: 0 }, { reps: 11, weight: 0 }] },
    ]
  },
  backBicepsAlt: {
    name: 'Back/Biceps (Alt)',
    icon: '🏋️‍♂️',
    exercises: [
      { name: 'Bent Over Row', sets: [{ reps: 9, weight: 0 }, { reps: 9, weight: 0 }, { reps: 9, weight: 0 }, { reps: 9, weight: 0 }] },
      { name: 'Lat Pulldown', sets: [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }, { reps: 10, weight: 0 }] },
      { name: 'Deadlift', sets: [{ reps: 6, weight: 0 }, { reps: 6, weight: 0 }, { reps: 6, weight: 0 }] },
      { name: 'Concentration Curl', sets: [{ reps: 12, weight: 0 }, { reps: 12, weight: 0 }, { reps: 12, weight: 0 }] },
      { name: 'Face Pulls', sets: [{ reps: 14, weight: 0 }, { reps: 14, weight: 0 }, { reps: 14, weight: 0 }] },
    ]
  },
}

export default function LogWorkout() {
  const { user } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([{ name: '', sets: [{ reps: 0, weight: 0 }] }])
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [workoutStarted, setWorkoutStarted] = useState(false)
  const [restTimer, setRestTimer] = useState(0)
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false)
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0)
  const [activeSetIndex, setActiveSetIndex] = useState(0)

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

  const startWorkout = (workoutType?: keyof typeof preFilledWorkouts) => {
    setWorkoutStarted(true)
    setIsTimerRunning(true)
    if (workoutType) {
      setExercises(preFilledWorkouts[workoutType].exercises)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleExerciseChange = (index: number, value: string) => {
    const newExercises = [...exercises]
    newExercises[index].name = value
    setExercises(newExercises)
  }

  const handleSetChange = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets[setIndex][field] = value
    setExercises(newExercises)
  }

  const addSet = (exerciseIndex: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets.push({ reps: 0, weight: 0 })
    setExercises(newExercises)
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets.splice(setIndex, 1)
    setExercises(newExercises)
  }

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ reps: 0, weight: 0 }] }])
  }

  const removeExercise = (index: number) => {
    const newExercises = [...exercises]
    newExercises.splice(index, 1)
    setExercises(newExercises)
  }

  const startRestTimer = () => {
    setRestTimer(60) // Set to 60 seconds, adjust as needed
    setIsRestTimerRunning(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('You must be logged in to log a workout')
      return
    }

    setIsTimerRunning(false)

    try {
      await addDoc(collection(db, 'workouts'), {
        userId: user.uid,
        exercises,
        duration: timer,
        date: serverTimestamp(),
      })
      toast.success('Workout logged successfully!')
      setExercises([{ name: '', sets: [{ reps: 0, weight: 0 }] }])
      setTimer(0)
      setWorkoutStarted(false)
    } catch (error) {
      console.error('Error adding document: ', error)
      toast.error('Failed to log workout. Please try again.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MainMenu />
      <ToastContainer />
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center animate-float">Choose Your Quest 🏆</h1>
      
      {!workoutStarted ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div 
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col justify-between p-6 border-4 border-yellow-500"
            onClick={() => startWorkout()}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Blank Quest</h2>
                <Clipboard className="w-6 h-6 text-yellow-500" />
              </div>
              <p className="text-gray-300 text-sm mb-4">Forge your own path and create a custom quest.</p>
            </div>
            <div className="flex justify-end">
              <ChevronRight className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          {Object.entries(preFilledWorkouts).map(([key, workout]) => (
            <div 
              key={key} 
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col justify-between p-6 border-4 border-yellow-500"
              onClick={() => startWorkout(key as keyof typeof preFilledWorkouts)}
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
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Quest Timer</h2>
              <p className="text-3xl font-bold text-yellow-500">{formatTime(timer)}</p>
            </div>
            <div className="flex justify-between items-center">
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
                <button onClick={() => setRestTimer(60)} className="bg-blue-500 text-white p-2 rounded-full">
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {exercises.map((exercise, exerciseIndex) => (
              <div key={exerciseIndex} className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border-4 border-yellow-500">
                <div className="flex justify-between items-center mb-4">
                  <select
                    value={exercise.name}
                    onChange={(e) => handleExerciseChange(exerciseIndex, e.target.value)}
                    className="bg-gray-700 text-white rounded-lg p-2 w-2/3"
                    required
                  >
                    <option value="">Select an exercise</option>
                    {exerciseOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeExercise(exerciseIndex)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-gray-400">Set</th>
                      <th className="text-left text-gray-400">Reps</th>
                      <th className="text-left text-gray-400">Weight (kg)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set, setIndex) => (
                      <tr key={setIndex} className="border-b border-gray-700">
                        <td className="py-2 text-white">{setIndex + 1}</td>
                        <td className="py-2">
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'reps', parseInt(e.target.value))}
                            className="bg-gray-700 text-white rounded-lg p-2 w-full"
                            required
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="number"
                            value={set.weight}
                            onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'weight', parseInt(e.target.value))}
                            className="bg-gray-700 text-white rounded-lg p-2 w-full"
                            required
                          />
                        </td>
                        <td className="py-2">
                          <button
                            type="button"
                            onClick={() => removeSet(exerciseIndex, setIndex)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  onClick={() => addSet(exerciseIndex)}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center"
                >
                  <Plus size={16} className="mr-2" /> Add Set
                </button>
              </div>
            ))}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={addExercise}
                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center"
              >
                <Plus size={16} className="mr-2" /> Add Exercise
              </button>
              <button
                type="submit"
                className="bg-yellow-500 text-gray-900 px-6 py-2 rounded-full hover:bg-yellow-400 transition-colors duration-200 flex items-center"
              >
                <Sword size={16} className="mr-2" /> Complete Quest
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}