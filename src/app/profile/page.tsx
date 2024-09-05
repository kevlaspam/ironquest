'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { MainMenu } from '../../components/MainMenu'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import html2canvas from 'html2canvas'
import { Scale, Target, Activity, Share2, User, Loader2 } from 'lucide-react'

type WeightEntry = {
  date: string
  weight: number
}

type UserProfile = {
  username: string
  fitnessGoal: string
  weightHistory: WeightEntry[]
}

const goalIcons: { [key: string]: JSX.Element } = {
  weight_loss: <Scale className="w-6 h-6 text-yellow-500" />,
  muscle_gain: <Activity className="w-6 h-6 text-yellow-500" />,
  overall_health: <Target className="w-6 h-6 text-yellow-500" />,
}

const defaultProfile: UserProfile = {
  username: '',
  fitnessGoal: 'overall_health',
  weightHistory: [],
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newWeight, setNewWeight] = useState<number | ''>('')
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [totalWeightLifted, setTotalWeightLifted] = useState(0)
  const profileCardRef = useRef<HTMLDivElement>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [newUsername, setNewUsername] = useState('')

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const profileDoc = await getDoc(doc(db, 'userProfiles', user.uid))
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as UserProfile)
        } else {
          // Create a new profile for the user
          await setDoc(doc(db, 'userProfiles', user.uid), defaultProfile)
          setProfile(defaultProfile)
        }

        const workoutsQuery = query(collection(db, 'workouts'), where('userId', '==', user.uid))
        const workoutsSnapshot = await getDocs(workoutsQuery)
        setTotalWorkouts(workoutsSnapshot.size)

        let totalWeight = 0
        workoutsSnapshot.forEach((doc) => {
          const workout = doc.data()
          workout.exercises.forEach((exercise: any) => {
            exercise.sets.forEach((set: any) => {
              totalWeight += set.weight * set.reps
            })
          })
        })
        setTotalWeightLifted(totalWeight)

        setError(null)
      } catch (err) {
        console.error('Error fetching profile and stats:', err)
        setError('Failed to fetch profile and stats. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfileAndStats()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setError(null)
      setUsernameError(null)

      if (newUsername) {
        const usernameQuery = query(collection(db, 'userProfiles'), where('username', '==', newUsername))
        const usernameSnapshot = await getDocs(usernameQuery)
        
        if (!usernameSnapshot.empty && usernameSnapshot.docs[0].id !== user.uid) {
          setUsernameError('This username is already taken. Please choose another.')
          return
        }

        await setDoc(doc(db, 'userProfiles', user.uid), { username: newUsername }, { merge: true })
        setProfile(prev => ({ ...prev, username: newUsername }))
        setNewUsername('')
        alert('Username updated successfully!')
      }
    } catch (err) {
      console.error('Error updating username:', err)
      setError('Failed to update username. Please try again.')
    }
  }

  const handleAddWeight = async () => {
    if (!user || newWeight === '') return

    const weightEntry: WeightEntry = {
      date: new Date().toISOString().split('T')[0],
      weight: Number(newWeight),
    }

    try {
      await updateDoc(doc(db, 'userProfiles', user.uid), {
        weightHistory: arrayUnion(weightEntry),
      })

      setProfile(prev => ({
        ...prev,
        weightHistory: [...prev.weightHistory, weightEntry],
      }))

      setNewWeight('')
      alert('Weight entry added successfully!')
      setError(null)
    } catch (err) {
      console.error('Error adding weight entry:', err)
      setError('Failed to add weight entry. Please try again.')
    }
  }

  const handleSaveProfileImage = async () => {
    if (profileCardRef.current) {
      try {
        const canvas = await html2canvas(profileCardRef.current)
        const image = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = image
        link.download = 'gymgame-profile.png'
        link.click()
      } catch (err) {
        console.error('Error saving profile image:', err)
        setError('Failed to save profile image. Please try again.')
      }
    }
  }

  if (!user) {
    return <div className="text-center mt-10 text-white">Please sign in to view your profile.</div>
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MainMenu />
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center">Your GymGa.me Profile</h1>
      
      {/* Player Card */}
      <div ref={profileCardRef} className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-700 rounded-full p-4">
              <User className="w-8 h-8 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{profile.username || 'New Hero'}</h2>
              <p className="text-yellow-500">Level: {Math.floor(totalWorkouts / 10) + 1}</p>
            </div>
          </div>
          <button
            onClick={handleSaveProfileImage}
            className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-full hover:bg-yellow-400 transition-colors duration-200 flex items-center space-x-2"
          >
            <Share2 className="w-5 h-5" />
            <span>Share Quest Log</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-400">Quests Completed</p>
            <p className="text-lg font-semibold text-white">{totalWorkouts}</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-400">Total Weight Conquered</p>
            <p className="text-lg font-semibold text-white">{totalWeightLifted.toLocaleString()} kg</p>
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Quest Objective</p>
            <p className="text-lg font-semibold text-white flex items-center">
              {goalIcons[profile.fitnessGoal] || <Target className="w-6 h-6 text-yellow-500 mr-2" />}
              <span className="ml-2">{profile.fitnessGoal.replace('_', ' ')}</span>
            </p>
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 text-center mb-4" role="alert">{error}</div>}
      
      {/* Username Update Form */}
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-500">
        <h2 className="text-2xl font-bold mb-4 text-white">Update Your Username</h2>
        <div className="mb-4">
          <label htmlFor="newUsername" className="block text-gray-300 font-bold mb-2">New Username (Your unique GymGa.me ID)</label>
          <input
            type="text"
            id="newUsername"
            name="newUsername"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-yellow-300 bg-gray-700 text-white"
            placeholder="Enter new username"
          />
          {usernameError && <p className="text-red-500 text-sm mt-1" role="alert">{usernameError}</p>}
        </div>
        <button
          type="submit"
          className="w-full bg-yellow-500 text-gray-900 py-2 px-4 rounded-full hover:bg-yellow-400 focus:outline-none focus:ring focus:border-yellow-300 transition-colors duration-200 font-bold"
        >
          Update Username
        </button>
      </form>

      {/* Weight Tracking Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border-4 border-yellow-500">
        <h2 className="text-2xl font-bold mb-4 text-white">Weight Tracking</h2>
        <div className="flex items-center mb-4">
          <input
            type="number"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Enter weight (kg)"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-yellow-300 bg-gray-700 text-white mr-2"
          />
          <button
            onClick={handleAddWeight}
            className="bg-yellow-500 text-gray-900 py-2 px-4 rounded-full hover:bg-yellow-400 focus:outline-none focus:ring focus:border-yellow-300 transition-colors duration-200 font-bold"
          >
            Log Weight
          </button>
        </div>
        {profile.weightHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={profile.weightHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="#EAB308" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-white text-center">No weight data available. Start logging your weight to see the chart!</p>
        )}
      </div>
    </div>
  )
}