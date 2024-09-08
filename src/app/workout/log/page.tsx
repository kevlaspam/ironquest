'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithPopup, GoogleAuthProvider, getAuth } from 'firebase/auth'
import { useAuth } from '../../../components/AuthProvider'
import { db } from '../../../lib/firebase'
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { MainMenu } from '../../../components/MainMenu'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Clipboard, ChevronRight, Save, Dumbbell, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useWorkout } from '../../../components/WorkoutContext'
import { RestTimer } from '../../../components/RestTimer'
import { WorkoutCardTracker } from '../../../components/WorkoutCardTracker'

type Workout = {
  id?: string
  name: string
  exercises: {
    name: string
    sets: { reps: number; weight: number; completed: boolean }[]
  }[]
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
  crossfitWOD: {
    name: 'CrossFit WOD',
    icon: '🏋️‍♂️',
    exercises: [
      { name: 'Burpees', sets: [{ reps: 20, weight: 0, completed: false }] },
      { name: 'Kettlebell Swings', sets: [{ reps: 30, weight: 0, completed: false }] },
      { name: 'Box Jumps', sets: [{ reps: 20, weight: 0, completed: false }] },
      { name: 'Thrusters', sets: [{ reps: 15, weight: 0, completed: false }] },
      { name: 'Pull-Ups', sets: [{ reps: 10, weight: 0, completed: false }] },
    ]
  },
  calisthenicsBasic: {
    name: 'Calisthenics Basic',
    icon: '🤸',
    exercises: [
      { name: 'Push-Ups', sets: [{ reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }] },
      { name: 'Pull-Ups', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
      { name: 'Dips', sets: [{ reps: 12, weight: 0, completed: false }, { reps: 12, weight: 0, completed: false }, { reps: 12, weight: 0, completed: false }] },
      { name: 'Pistol Squats', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
      { name: 'L-Sit Hold', sets: [{ reps: 20, weight: 0, completed: false }, { reps: 20, weight: 0, completed: false }, { reps: 20, weight: 0, completed: false }] },
    ]
  },
  calisthenicsAdvanced: {
    name: 'Calisthenics Advanced',
    icon: '🏆',
    exercises: [
      { name: 'Muscle-Ups', sets: [{ reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }] },
      { name: 'Handstand Push-Ups', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
      { name: 'Front Lever Hold', sets: [{ reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }] },
      { name: 'Planche Progressions', sets: [{ reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }] },
      { name: 'One-Arm Pull-Up Progressions', sets: [{ reps: 3, weight: 0, completed: false }, { reps: 3, weight: 0, completed: false }, { reps: 3, weight: 0, completed: false }] },
    ]
  },
  functionalFitness: {
    name: 'Functional Fitness',
    icon: '🔄',
    exercises: [
      { name: 'Kettlebell Swings', sets: [{ reps: 20, weight: 0, completed: false }, { reps: 20, weight: 0, completed: false }, { reps: 20, weight: 0, completed: false }] },
      { name: 'Turkish Get-Ups', sets: [{ reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }] },
      { name: 'Battle Rope Slams', sets: [{ reps: 30, weight: 0, completed: false }, { reps: 30, weight: 0, completed: false }, { reps: 30, weight: 0, completed: false }] },
      { name: 'Medicine Ball Slams', sets: [{ reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }] },
      { name: 'Farmers Walks', sets: [{ reps: 40, weight: 0, completed: false }, { reps: 40, weight: 0, completed: false }, { reps: 40, weight: 0, completed: false }] },
    ]
  },
  powerlifting: {
    name: 'Powerlifting',
    icon: '🏋️‍♀️',
    exercises: [
      { name: 'Barbell Back Squat', sets: [{ reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }] },
      { name: 'Bench Press', sets: [{ reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }] },
      { name: 'Deadlift', sets: [{ reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }] },
      { name: 'Overhead Press', sets: [{ reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }] },
      { name: 'Barbell Rows', sets: [{ reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }] },
    ]
  },
  olympicWeightlifting: {
    name: 'Olympic Weightlifting',
    icon: '🏅',
    exercises: [
      { name: 'Clean and Jerk', sets: [{ reps: 3, weight: 0, completed: false }, { reps: 3, weight: 0, completed: false }, { reps: 3, weight: 0, completed: false }] },
      { name: 'Snatch', sets: [{ reps: 3, weight: 0, completed: false }, { reps: 3, weight: 0, completed: false }, { reps: 3, weight: 0, completed: false }] },
      { name: 'Front Squat', sets: [{ reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }] },
      { name: 'Overhead Squat', sets: [{ reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }] },
      { name: 'Clean Pulls', sets: [{ reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }, { reps: 5, weight: 0, completed: false }] },
    ]
  },
  hiit: {
    name: 'High Intensity Interval Training',
    icon: '🔥',
    exercises: [
      { name: 'Burpees', sets: [{ reps: 20, weight: 0, completed: false }] },
      { name: 'Mountain Climbers', sets: [{ reps: 30, weight: 0, completed: false }] },
      { name: 'Jump Squats', sets: [{ reps: 15, weight: 0, completed: false }] },
      { name: 'High Knees', sets: [{ reps: 40, weight: 0, completed: false }] },
      { name: 'Plank Jacks', sets: [{ reps: 20, weight: 0, completed: false }] },
    ]
  },
  yogaFlow: {
    name: 'Yoga Flow',
    icon: '🧘‍♀️',
    exercises: [
      { name: 'Sun Salutation A', sets: [{ reps: 5, weight: 0, completed: false }] },
      { name: 'Warrior Series', sets: [{ reps: 1, weight: 0, completed: false }] },
      { name: 'Balance Poses', sets: [{ reps: 1, weight: 0, completed: false }] },
      { name: 'Core Work', sets: [{ reps: 1, weight: 0, completed: false }] },
      { name: 'Cool Down and Stretching', sets: [{ reps: 1, weight: 0, completed: false }] },
    ]
  },
  mobilityAndFlexibility: {
    name: 'Mobility & Flexibility',
    icon: '🤸‍♂️',
    exercises: [
      { name: 'Dynamic Stretching Routine', sets: [{ reps: 1, weight: 0, completed: false }] },
      { name: 'Foam Rolling', sets: [{ reps: 1, weight: 0, completed: false }] },
      { name: 'Joint Mobility Exercises', sets: [{ reps: 1, weight: 0, completed: false }] },
      { name: 'Static Stretching', sets: [{ reps: 1, weight: 0, completed: false }] },
      { name: 'Yoga-inspired Stretches', sets: [{ reps: 1, weight: 0, completed: false }] },
    ]
  },
  martialArtsConditioning: {
    name: 'Martial Arts Conditioning',
    icon: '🥋',
    exercises: [
      { name: 'Shadow Boxing', sets: [{ reps: 3, weight: 0, completed: false }] },
      { name: 'Burpees', sets: [{ reps: 20, weight: 0, completed: false }] },
      { name: 'Jump Rope', sets: [{ reps: 100, weight: 0, completed: false }] },
      { name: 'Mountain Climbers', sets: [{ reps: 50, weight: 0, completed: false }] },
      { name: 'Leg Raises', sets: [{ reps: 20, weight: 0, completed: false }] },
    ]
  }
}

export default function LogWorkout() {
  const { user } = useAuth()
  const {
    exercises,
    setExercises,
    timer,
    setTimer,
    isTimerRunning,
    setIsTimerRunning,
    workoutStarted,
    setWorkoutStarted,
    currentWorkoutName,
    setCurrentWorkoutName,
    clearWorkout
  } = useWorkout()

  const [userWorkouts, setUserWorkouts] = useState<Workout[]>([])
  const [newWorkoutName, setNewWorkoutName] = useState('')
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null)
  const router = useRouter()

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
  }, [isTimerRunning, setTimer])

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
      setCurrentWorkoutName(workout.name)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
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
      clearWorkout()
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

  const handleCancel = () => {
    clearWorkout()
    router.push('/workout/log')
  }

  const toggleExpand = (key: string) => {
    setExpandedWorkout(expandedWorkout === key ? null : key)
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
              <button
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  startWorkout();
                }}
              >
                Start Workout
              </button>
            </div>
            {Object.entries(preFilledWorkouts).map(([key, workout]) => (
              <div 
                key={key} 
                className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-6 border-4 border-yellow-500 group hover:scale-105 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white truncate group-hover:text-yellow-400 transition-colors duration-300" title={workout.name}>{workout.name}</h2>
                    <span className="text-2xl group-hover:text-yellow-400 transition-colors duration-300">{workout.icon}</span>
                  </div>
                  <ul className="text-gray-300 text-sm mb-4 list-disc list-inside group-hover:text-white transition-colors duration-300">
                    {workout.exercises.slice(0, expandedWorkout === key ? workout.exercises.length : 3).map((exercise, index) => (
                      <li key={index} className="truncate">{exercise.name}</li>
                    ))}
                    {expandedWorkout !== key && workout.exercises.length > 3 && (
                      <li className="text-gray-400 group-hover:text-gray-200">+{workout.exercises.length - 3} more</li>
                    )}
                  </ul>
                </div>
                {expandedWorkout === key && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <h3 className="text-sm font-semibold text-white mb-2">Detailed Exercises:</h3>
                    {workout.exercises.map((exercise, index) => (
                      <div key={index} className="mb-2">
                        <h4 className="text-sm font-medium text-yellow-500">{exercise.name}</h4>
                        <p className="text-xs text-gray-400">
                          {exercise.sets.length} sets of {exercise.sets[0].reps} reps
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-col space-y-2 mt-4">
                  <button
                    className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(key);
                    }}
                  >
                    {expandedWorkout === key ? 'Close Preview' : 'Preview Workout'}
                  </button>
                  <button
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      startWorkout({ name: workout.name, exercises: workout.exercises });
                    }}
                  >
                    Start Workout
                  </button>
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
                  className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between p-6 border-4 border-yellow-500"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-white truncate" title={workout.name}>{workout.name}</h2>
                      <Dumbbell className="w-6 h-6 text-yellow-500" />
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
                  <div className="flex flex-col space-y-2 mt-4">
                    <button
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300"
                      onClick={() => startWorkout(workout)}
                    >
                      Start Workout
                    </button>
                    <button
                      className="w-full bg-gradient-to-r from-red-400 to-red-600 text-white font-bold py-2 px-4 rounded-lg hover:from-red-500 hover:to-red-700 transition-all duration-300"
                      onClick={() => deleteWorkout(workout.id!)}
                    >
                      Delete Workout
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (        <div className="space-y-6">
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
          </div>

          <RestTimer />

          <form onSubmit={handleSubmit} className="space-y-6">
            <WorkoutCardTracker />
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-400 transition-colors duration-200 flex items-center justify-center"
              >
                <X size={20} className="mr-2" />
                Cancel Workout
              </button>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-400 transition-colors duration-200 flex items-center justify-center"
              >
                <Save size={20} className="mr-2" />
                Log Workout
              </button>
            </div>
          </form>
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border-4 border-yellow-500">
            <h2 className="text-xl font-semibold text-white mb-4">Save Workout as Template</h2>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
              <input
                type="text"
                value={newWorkoutName}
                onChange={(e) => setNewWorkoutName(e.target.value)}
                placeholder="Enter workout name"
                className="bg-gray-700 text-white rounded-lg p-2 flex-grow"
              />
              <button
                onClick={saveWorkout}
                className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors duration-200 flex items-center justify-center"
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