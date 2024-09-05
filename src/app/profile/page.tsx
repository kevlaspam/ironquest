'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { MainMenu } from '../../components/MainMenu'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import html2canvas from 'html2canvas'
import { Dumbbell, Scale, Target, Activity, Share2, User, Sword, Loader2 } from 'lucide-react'

type WeightEntry = {
  date: string
  weight: number
}

type UserProfile = {
  name: string
  username: string
  lowercaseUsername: string
  age: number
  height: number
  gender: string
  fitnessGoal: string
  activityLevel: string
  weightHistory: WeightEntry[]
}

const goalIcons: { [key: string]: JSX.Element } = {
  weight_loss: <Scale className="w-6 h-6 text-yellow-500" />,
  muscle_gain: <Dumbbell className="w-6 h-6 text-yellow-500" />,
  endurance: <Activity className="w-6 h-6 text-yellow-500" />,
  strength: <Sword className="w-6 h-6 text-yellow-500" />,
  flexibility: <Activity className="w-6 h-6 text-yellow-500" />,
  overall_health: <Target className="w-6 h-6 text-yellow-500" />,
}

const defaultProfile: UserProfile = {
  name: '',
  username: '',
  lowercaseUsername: '',
  age: 0,
  height: 0,
  gender: '',
  fitnessGoal: 'overall_health',
  activityLevel: '',
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
          const profileData = profileDoc.data() as UserProfile
          setProfile({
            ...defaultProfile,
            ...profileData,
            weightHistory: profileData.weightHistory || [],
          })
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
          workout.exercises?.forEach((exercise: any) => {
            exercise.sets?.forEach((set: any) => {
              totalWeight += (set.weight || 0) * (set.reps || 0)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: name === 'age' || name === 'height' ? Number(value) : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setError(null)
      setUsernameError(null)

      if (newUsername) {
        const lowercaseNewUsername = newUsername.toLowerCase()
        // Check if the new username already exists (case-insensitive)
        const usernameQuery = query(collection(db, 'userProfiles'), where('lowercaseUsername', '==', lowercaseNewUsername))
        const usernameSnapshot = await getDocs(usernameQuery)
        
        if (!usernameSnapshot.empty && usernameSnapshot.docs[0].id !== user.uid) {
          setUsernameError('This username is already taken. Please choose another.')
          return
        }
      }

      const updatedProfile = {
        ...profile,
        username: newUsername || profile.username,
        lowercaseUsername: (newUsername || profile.username).toLowerCase(),
      }

      await setDoc(doc(db, 'userProfiles', user.uid), updatedProfile)
      setProfile(updatedProfile)
      setNewUsername('')
      alert('Profile updated successfully!')
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile. Please try again.')
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
        weightHistory: [...(prev.weightHistory || []), weightEntry],
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
      
      {/* Profile Card */}
      <div ref={profileCardRef} className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-700 rounded-full p-4">
              <User className="w-8 h-8 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{profile.username || profile.name || 'New Hero'}</h2>
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
            <p className="text-sm text-gray-400">Height</p>
            <p className="text-lg font-semibold text-white">{profile.height || 0} cm</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-400">Quests Completed</p>
            <p className="text-lg font-semibold text-white">{totalWorkouts}</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-400">Total Weight Lifted</p>
            <p className="text-lg font-semibold text-white">{totalWeightLifted.toLocaleString()} kg</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-400">Current Weight</p>
            <p className="text-lg font-semibold text-white">
              {profile.weightHistory && profile.weightHistory.length > 0
                ? `${profile.weightHistory[profile.weightHistory.length - 1].weight} kg`
                : 'Not set'}
            </p>
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Quest Objective</p>
            <p className="text-lg font-semibold text-white flex items-center">
              {goalIcons[profile.fitnessGoal] || <Target className="w-6 h-6 text-yellow-500 mr-2" />}
              <span className="ml-2">{(profile.fitnessGoal || '').replace('_', ' ') || 'Not set'}</span>
            </p>
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 text-center mb-4" role="alert">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-500">
        <h2 className="text-2xl font-bold mb-4 text-white">Edit Your Quest Log</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-gray-300 font-bold mb-2">Hero Name (Your real name)</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-yellow-300 bg-gray-700 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="username" className="block text-gray-300 font-bold mb-2">Current Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={profile.username}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-yellow-300 bg-gray-700 text-white"
              disabled
            />
          </div>
          <div>
            <label htmlFor="newUsername" className="block text-gray-300 font-bold mb-2">New Username (Your unique GymGa.me ID)</label>
            <input
              type="text"
              id="newUsername"
              name="newUsername"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-yellow-300 bg-gray-700 text-white"
            />
            {usernameError && <p className="text-red-500 text-sm mt-1" role="alert">{usernameError}</p>}
          </div>
          <div>
            <label htmlFor="age" className="block text-gray-300 font-bold mb-2">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={profile.age || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-yellow-300 bg-gray-700 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="height" className="block text-gray-300 font-bold mb-2">Height (cm)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={profile.height || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-yellow-300 bg-gray-700 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-gray-300 font-bold mb-2">Gender</label>
            <select
              id="gender"
              name="gender"
              value={profile.gender}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-yellow-300 bg-gray-700 text-white"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="fitnessGoal" className="block text-gray-300 font-bold mb-2">Quest Objective</label>
            <select
              id="fitnessGoal"
              name="fitnessGoal"
              value={profile.fitnessGoal}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-yellow-300 bg-gray-700 text-white"
              required
            >
              <option value="">Select a goal</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="endurance">Endurance</option>
              <option value="strength">Strength</option>
              <option value="flexibility">Flexibility</option>
              <option value="overall_health">Overall Health</option>
            </select>
          </div>
          <div>
            <label htmlFor="activityLevel" className="block text-gray-300 font-bold mb-2">Activity Level</label>
            <select
              id="activityLevel"
              name="activityLevel"
              value={profile.activityLevel}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-yellow-300 bg-gray-700 text-white"
              required
            >
              <option value="">Select activity level</option>
              <option value="sedentary">Novice (little to no questing)</option>
              <option value="light">Apprentice (light questing 1-3 days/week)</option>
              <option value="moderate">Adept (moderate questing 3-5 days/week)</option>
              <option value="very">Expert (intense questing 6-7 days/week)</option>
              <option value="extra">Legendary (very intense questing & physical job)</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-yellow-500 text-gray-900 py-2 px-4 rounded-full hover:bg-yellow-400 focus:outline-none focus:ring focus:border-yellow-300 mt-4 transition-colors duration-200 font-bold"
        >
          Update Quest Log
        </button>
      </form>

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
        {profile.weightHistory && profile.weightHistory.length > 0 ? (
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