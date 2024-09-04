'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { MainMenu } from '../../components/MainMenu'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type WeightEntry = {
  date: string
  weight: number
}

type UserProfile = {
  name: string
  age: number
  height: number
  gender: string
  fitnessGoal: string
  activityLevel: string
  weightHistory: WeightEntry[]
}

const genderEmojis: { [key: string]: string } = {
  male: '👨',
  female: '👩',
  other: '👤',
}

const goalEmojis: { [key: string]: string } = {
  weight_loss: '⚖️',
  muscle_gain: '💪',
  endurance: '🏃',
  strength: '🏋️',
  flexibility: '🧘',
  overall_health: '❤️',
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: 0,
    height: 0,
    gender: '',
    fitnessGoal: '',
    activityLevel: '',
    weightHistory: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newWeight, setNewWeight] = useState<number | ''>('')

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const profileDoc = await getDoc(doc(db, 'userProfiles', user.uid))
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as UserProfile)
        }
        setError(null)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to fetch profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: name === 'age' || name === 'height' ? Number(value) : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      await setDoc(doc(db, 'userProfiles', user.uid), profile)
      alert('Profile updated successfully!')
      setError(null)
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

  if (!user) {
    return <div className="text-center mt-10">Please sign in to view your profile.</div>
  }

  if (loading) {
    return <div className="text-center mt-10">Loading profile...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MainMenu />
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center animate-float">Your Profile 👤</h1>
      
      {/* Player Card */}
      {profile.name && (
        <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-600">
          <div className="flex items-center space-x-4">
            <div className="text-6xl bg-white rounded-full p-2 shadow-inner">{genderEmojis[profile.gender] || '👤'}</div>
            <div className="flex-grow">
              <h2 className="text-3xl font-bold text-black">{profile.name}</h2>
              <p className="text-xl text-black">Level {profile.age} Adventurer</p>
              <div className="flex items-center mt-2">
                <span className="text-black font-semibold mr-2">Stats:</span>
                <span className="bg-white text-black px-2 py-1 rounded-full text-sm mr-2">Height: {profile.height}cm</span>
                <span className="bg-white text-black px-2 py-1 rounded-full text-sm">XP: {profile.weightHistory.length * 100}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-white bg-opacity-50 rounded-lg p-3">
            <p className="text-black font-semibold flex items-center">
              Quest: {goalEmojis[profile.fitnessGoal] || '🎯'} {profile.fitnessGoal.replace('_', ' ')}
            </p>
          </div>
        </div>
      )}

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={profile.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 bg-gray-50 text-gray-900"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="age" className="block text-gray-700 font-bold mb-2">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={profile.age}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 bg-gray-50 text-gray-900"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="height" className="block text-gray-700 font-bold mb-2">Height (cm)</label>
          <input
            type="number"
            id="height"
            name="height"
            value={profile.height}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 bg-gray-50 text-gray-900"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="gender" className="block text-gray-700 font-bold mb-2">Gender</label>
          <select
            id="gender"
            name="gender"
            value={profile.gender}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 bg-gray-50 text-gray-900"
            required
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="fitnessGoal" className="block text-gray-700 font-bold mb-2">Fitness Goal</label>
          <select
            id="fitnessGoal"
            name="fitnessGoal"
            value={profile.fitnessGoal}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 bg-gray-50 text-gray-900"
            required
          >
            <option value="">Select a goal</option>
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="endurance">Improve Endurance</option>
            <option value="strength">Increase Strength</option>
            <option value="flexibility">Enhance Flexibility</option>
            <option value="overall_health">Improve Overall Health</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="activityLevel" className="block text-gray-700 font-bold mb-2">Activity Level</label>
          <select
            id="activityLevel"
            name="activityLevel"
            value={profile.activityLevel}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 bg-gray-50 text-gray-900"
            required
          >
            <option value="">Select activity level</option>
            <option value="sedentary">Sedentary (little to no exercise)</option>
            <option value="light">Lightly active (light exercise 1-3 days/week)</option>
            <option value="moderate">Moderately active (moderate exercise 3-5 days/week)</option>
            <option value="very">Very active (hard exercise 6-7 days/week)</option>
            <option value="extra">Extra active (very hard exercise & physical job)</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
        >
          Update Profile
        </button>
      </form>

      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Weight Tracking</h2>
        <div className="flex items-center mb-4">
          <input
            type="number"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Enter weight (kg)"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 bg-gray-50 text-gray-900 mr-2"
          />
          <button
            onClick={handleAddWeight}
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:border-green-300"
          >
            Add Weight
          </button>
        </div>
        {profile.weightHistory.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={profile.weightHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}