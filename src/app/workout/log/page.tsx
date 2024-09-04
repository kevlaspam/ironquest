'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../components/AuthProvider'
import { db } from '../../../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { MainMenu } from '../../../components/MainMenu'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Clipboard, ChevronRight, X, Plus, Save } from 'lucide-react'

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

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isTimerRunning])

  const startWorkout = (workoutType?: keyof typeof preFilledWorkouts) => {
    setWorkoutStarted(true)
    setIsTimerRunning(true)
    if (workoutType) {
      setExercises(preFilledWorkouts[workoutType].exercises)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
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
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center animate-float">Log Your Workout 💪</h1>
      
      {!workoutStarted ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div 
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col justify-between p-6"
            onClick={() => startWorkout()}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Blank Workout</h2>
                <Clipboard className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-gray-600 text-sm mb-4">Start with a blank slate and create your own custom workout.</p>
            </div>
            <div className="flex justify-end">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          {Object.entries(preFilledWorkouts).map(([key, workout]) => (
            <div 
              key={key} 
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col justify-between p-6"
              onClick={() => startWorkout(key as keyof typeof preFilledWorkouts)}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 truncate" title={workout.name}>{workout.name}</h2>
                  <span className="text-2xl">{workout.icon}</span>
                </div>
                <ul className="text-gray-600 text-sm mb-4 list-disc list-inside">
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
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Workout Timer</h2>
          <p className="text-3xl md:text-4xl font-bold text-gray-800">{formatTime(timer)}</p>
        </div>
      )}

      {workoutStarted && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {exercises.map((exercise, exerciseIndex) => (
            <div key={exerciseIndex} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                <select
                  value={exercise.name}
                  onChange={(e) => handleExerciseChange(exerciseIndex, e.target.value)}
                  className="bg-gray-100 text-gray-800 rounded-lg p-2 w-full sm:w-2/3"
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
                  className="btn btn-secondary w-full sm:w-auto flex items-center justify-center"
                >
                  <X className="w-4 h-4 mr-2" /> Remove
                </button>
              </div>
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-2">
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'reps', parseInt(e.target.value))}
                    placeholder="Reps"
                    className="bg-gray-100 text-gray-800 rounded-lg p-2 w-full sm:w-1/3"
                    required
                  />
                  <input
                    type="number"
                    value={set.weight}
                    onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'weight', parseInt(e.target.value))}
                    placeholder="Weight (kg)"
                    className="bg-gray-100 text-gray-800 rounded-lg p-2 w-full sm:w-1/3"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeSet(exerciseIndex, setIndex)}
                    className="btn btn-secondary w-full sm:w-1/3 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 mr-2" /> Remove Set
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addSet(exerciseIndex)}
                className="btn btn-secondary mt-2 w-full sm:w-auto flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Set
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addExercise}
            className="btn btn-secondary w-full flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Exercise
          </button>
          <button
            type="submit"
            className="btn btn-primary w-full flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" /> Log Workout
          </button>
        </form>
      )}
    </div>
  )
}