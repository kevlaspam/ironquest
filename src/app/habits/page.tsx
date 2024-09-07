'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, deleteDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { MainMenu } from '../../components/MainMenu'
import { Check, Plus, X, ChevronLeft, ChevronRight, Flame, Trophy, Target } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type Habit = {
  id: string
  userId: string
  name: string
  frequency: number
  completedDays: string[]
  streak: number
}

type PresetPlan = {
  name: string
  habits: Omit<Habit, 'id' | 'userId' | 'completedDays' | 'streak'>[]
}

const presetPlans: PresetPlan[] = [
  {
    name: '75 Hard',
    habits: [
      { name: 'Work out twice daily (45 min each)', frequency: 7 },
      { name: 'Follow a strict diet', frequency: 7 },
      { name: 'No alcohol or cheats', frequency: 7 },
      { name: 'Take a progress picture', frequency: 7 },
      { name: 'Drink 1 gallon of water', frequency: 7 },
      { name: 'Read 10 pages daily', frequency: 7 },
    ],
  },
  {
    name: 'Gym Habit Builder',
    habits: [
      { name: 'Go to the gym', frequency: 4 },
      { name: 'Take pre-workout', frequency: 4 },
      { name: 'Log workout', frequency: 4 },
      { name: 'Stretch post-workout', frequency: 4 },
    ],
  },
  {
    name: 'Supplements',
    habits: [
      { name: 'Take multivitamin', frequency: 7 },
      { name: 'Protein shake post-workout', frequency: 4 },
      { name: 'Take creatine', frequency: 7 },
      { name: 'Take omega-3', frequency: 7 },
    ],
  },
  {
    name: 'Hypertrophy',
    habits: [
      { name: 'Target muscle group', frequency: 5 },
      { name: 'Lift heavy', frequency: 5 },
      { name: 'High-protein meal', frequency: 5 },
      { name: 'Track macros', frequency: 7 },
      { name: 'Sleep 7-8 hours', frequency: 7 },
    ],
  },
  {
    name: 'Functional Fitness',
    habits: [
      { name: 'Dynamic stretches', frequency: 5 },
      { name: 'Do WOD', frequency: 5 },
      { name: 'Mobility work', frequency: 3 },
      { name: 'Practice lifts', frequency: 2 },
      { name: 'Follow clean diet', frequency: 7 },
    ],
  },
  {
    name: 'Strength',
    habits: [
      { name: 'Squat', frequency: 2 },
      { name: 'Bench press', frequency: 2 },
      { name: 'Deadlift', frequency: 2 },
      { name: 'Accessory lifts', frequency: 3 },
      { name: 'Track progress', frequency: 7 },
    ],
  },
  {
    name: 'Cardio',
    habits: [
      { name: 'Do HIIT', frequency: 3 },
      { name: 'Steady-state cardio', frequency: 3 },
      { name: 'Stretch after cardio', frequency: 3 },
      { name: 'Monitor heart rate', frequency: 3 },
    ],
  },
  {
    name: 'Recovery',
    habits: [
      { name: 'Foam roll', frequency: 4 },
      { name: 'Static stretching', frequency: 4 },
      { name: 'Yoga or Pilates', frequency: 2 },
      { name: 'Massage therapy', frequency: 1 },
      { name: 'Stay hydrated', frequency: 7 },
    ],
  },
];


export default function HabitTracker() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitFrequency, setNewHabitFrequency] = useState(1)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(getStartOfWeek(new Date()))

  const fetchHabits = useCallback(async () => {
    if (!user || !db) {
      setLoading(false)
      setError("User or database not initialized")
      return
    }

    try {
      const habitsQuery = query(
        collection(db, 'habits'),
        where('userId', '==', user.uid),
        orderBy('name')
      )
      const habitsSnapshot = await getDocs(habitsQuery)
      const habitsData = habitsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        streak: calculateStreak(doc.data().completedDays as string[])
      })) as Habit[]
      console.log("Fetched habits:", habitsData)
      setHabits(habitsData)
      setError(null)
    } catch (error) {
      console.error('Error fetching habits:', error)
      setError(`Failed to fetch habits: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchHabits()
    } else {
      setLoading(false)
      setError("User not authenticated")
    }
  }, [user, fetchHabits])

  function getStartOfWeek(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const calculateStreak = (completedDays: string[]): number => {
    if (completedDays.length === 0) return 0
    
    const sortedDays = completedDays.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    const today = new Date().toISOString().split('T')[0]
    let streak = 0
    let currentDate = new Date(today)

    for (const day of sortedDays) {
      if (day === currentDate.toISOString().split('T')[0]) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !db) return

    try {
      const newHabit = {
        userId: user.uid,
        name: newHabitName,
        frequency: newHabitFrequency,
        completedDays: [],
        streak: 0,
      }
      await addDoc(collection(db, 'habits'), newHabit)
      setNewHabitName('')
      setNewHabitFrequency(1)
      fetchHabits()
      toast.success('Habit added successfully!')
    } catch (error) {
      console.error('Error adding habit:', error)
      toast.error('Failed to add habit. Please try again.')
    }
  }

  const toggleHabitCompletion = async (habit: Habit, date: string) => {
    if (!user || !db) return

    try {
      const habitRef = doc(db, 'habits', habit.id)
      const updatedCompletedDays = habit.completedDays.includes(date)
        ? habit.completedDays.filter(d => d !== date)
        : [...habit.completedDays, date]

      const updatedStreak = calculateStreak(updatedCompletedDays)

      await updateDoc(habitRef, { 
        completedDays: updatedCompletedDays,
        streak: updatedStreak
      })
      fetchHabits()
    } catch (error) {
      console.error('Error updating habit:', error)
      toast.error('Failed to update habit. Please try again.')
    }
  }

  const addPresetPlan = async (plan: PresetPlan) => {
    if (!user || !db) return

    try {
      for (const habit of plan.habits) {
        await addDoc(collection(db, 'habits'), {
          userId: user.uid,
          name: habit.name,
          frequency: habit.frequency,
          completedDays: [],
          streak: 0,
        })
      }
      fetchHabits()
      toast.success(`${plan.name} plan added successfully!`)
    } catch (error) {
      console.error('Error adding preset plan:', error)
      toast.error('Failed to add preset plan. Please try again.')
    }
  }

  const removeHabit = async (habitId: string) => {
    if (!user || !db) return

    try {
      await deleteDoc(doc(db, 'habits', habitId))
      fetchHabits()
      toast.success('Habit removed successfully!')
    } catch (error) {
      console.error('Error removing habit:', error)
      toast.error('Failed to remove habit. Please try again.')
    }
  }

  const getDaysOfWeek = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(selectedDate)
      date.setDate(date.getDate() + i)
      return {
        day: days[i],
        date: date.toISOString().split('T')[0],
      }
    })
  }

  const changeDate = (weeks: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + weeks * 7)
    setSelectedDate(getStartOfWeek(newDate))
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getCompletedCount = (habit: Habit) => {
    const startOfWeek = new Date(selectedDate)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 6)

    return habit.completedDays.filter(day => {
      const date = new Date(day)
      return date >= startOfWeek && date <= endOfWeek
    }).length
  }

  const getProgressMessage = (habit: Habit) => {
    const completedCount = getCompletedCount(habit)
    const remaining = habit.frequency - completedCount

    if (completedCount >= habit.frequency) {
      return (
        <div className="flex items-center text-green-400">
          <Trophy className="w-5 h-5 mr-2" />
          <span>Great job! You&apos;ve completed your goal {completedCount} times this week!</span>
        </div>
      )
    } else if (remaining > 0) {
      return (
        <div className="flex items-center text-yellow-400">
          <Target className="w-5 h-5 mr-2" />
          <span>
            Keep going! You need to complete this habit {remaining} more {remaining === 1 ? 'time' : 'times'} this week.
          </span>
        </div>
      );      
    } else {
      return null
    }
  }

  if (!user) {
    return <div className="text-white text-center mt-10">Please sign in to track your habits.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MainMenu />
      <ToastContainer />
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center animate-float">
        Habit Tracker 🎯
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-500">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => changeDate(-1)}
                className="bg-yellow-500 text-gray-900 p-2 rounded-full hover:bg-yellow-400 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-xl font-semibold text-white">
                Week of {formatDate(selectedDate)} - {formatDate(new Date(selectedDate.getTime() + 6 * 24 * 60 * 60 * 1000))}
              </h2>
              <button
                onClick={() => changeDate(1)}
                className="bg-yellow-500 text-gray-900 p-2 rounded-full hover:bg-yellow-400 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            <div className="space-y-4">
              {habits.map((habit) => (
                <div key={habit.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white font-semibold">{habit.name}</h3>
                    <div className="flex items-center space-x-2">
                      <div className="bg-yellow-500 text-gray-900 px-2 py-1 rounded-full text-sm font-semibold">
                        {getCompletedCount(habit)}/{habit.frequency}
                      </div>
                      <div className="flex items-center bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 px-2 py-1 rounded-full">
                        <Flame className="w-4 h-4 mr-1" />
                        <span className="font-semibold">{habit.streak}</span>
                      </div>
                      <button
                        onClick={() => removeHabit(habit.id)}
                        className="p-1 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {getDaysOfWeek().map(({ day, date }) => {
                      const isCompleted = habit.completedDays.includes(date)
                      return (
                        <div key={date} className="flex flex-col items-center">
                          <span className="text-xs text-gray-400">{day}</span>
                          <button
                            onClick={() => toggleHabitCompletion(habit, date)}
                            className={`w-8 h-8 mt-1 rounded-full flex items-center justify-center transition-colors ${
                              isCompleted ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : (
                              <span className="w-5 h-5 border-2 border-gray-400 rounded-full"></span>
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-2 p-2 bg-gray-700 rounded-lg">
                    {getProgressMessage(habit)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-500">
            <h2 className="text-2xl font-semibold mb-4 text-white">Add New Habit</h2>
            <form onSubmit={addHabit} className="flex flex-col space-y-4">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Habit name"
                className="bg-gray-700 text-white rounded-lg p-2"
                required
              />
              <div className="flex items-center space-x-4">
                <label className="text-white">Frequency per week:</label>
                <input
                  type="number"
                  value={newHabitFrequency}
                  onChange={(e) => setNewHabitFrequency(parseInt(e.target.value))}
                  min="1"
                  max="7"
                  className="bg-gray-700 text-white rounded-lg p-2 w-16"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded"
              >
                Add Habit
              </button>
            </form>
          </div>

          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-500">
            <h2 className="text-2xl font-semibold mb-4 text-white">Preset Plans</h2>
            <select
              value={selectedPreset || ''}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="bg-gray-700 text-white rounded-lg p-2 mb-4 w-full"
            >
              <option value="">Select a preset plan</option>
              {presetPlans.map((plan) => (
                <option key={plan.name} value={plan.name}>
                  {plan.name}
                </option>
              ))}
            </select>
            {selectedPreset && (
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">{selectedPreset} Habits:</h3>
                <ul className="list-disc list-inside text-white mb-4">
                  {presetPlans.find(plan => plan.name === selectedPreset)?.habits.map((habit, index) => (
                    <li key={index}>{habit.name} ({habit.frequency}x per week)</li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    const plan = presetPlans.find(p => p.name === selectedPreset)
                    if (plan) addPresetPlan(plan)
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded"
                >
                  Add {selectedPreset} Plan
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}