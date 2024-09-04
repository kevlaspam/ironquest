'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { MainMenu } from '../../components/MainMenu'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import html2canvas from 'html2canvas'
import { Sword, Dumbbell, Scale, Target, Activity } from 'lucide-react'

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

const genderIcons: { [key: string]: JSX.Element } = {
  male: <Sword className="w-8 h-8 text-blue-500" />,
  female: <Sword className="w-8 h-8 text-pink-500" />,
  other: <Sword className="w-8 h-8 text-purple-500" />,
}

const goalIcons: { [key: string]: JSX.Element } = {
  weight_loss: <Scale className="w-6 h-6 text-green-500" />,
  muscle_gain: <Dumbbell className="w-6 h-6 text-red-500" />,
  endurance: <Activity className="w-6 h-6 text-yellow-500" />,
  strength: <Dumbbell className="w-6 h-6 text-orange-500" />,
  flexibility: <Activity className="w-6 h-6 text-blue-500" />,
  overall_health: <Target className="w-6 h-6 text-purple-500" />,
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
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [totalWeightLifted, setTotalWeightLifted] = useState(0)
  const playerCardRef = useRef<HTMLDivElement>(null)

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

  const handleSaveProfileImage = async () => {
    if (playerCardRef.current) {
      try {
        const canvas = await html2canvas(playerCardRef.current)
        const image = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = image
        link.download = 'ironquest-profile.png'
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
    return <div className="text-center mt-10 text-white">Loading profile...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MainMenu />
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center">Your IronQuest Profile</h1>
      
      {/* Player Card */}
      {profile.name && (
        <div ref={playerCardRef} className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border-2 border-blue-500">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gray-700 rounded-full p-4">
              {genderIcons[profile.gender] || <Sword className="w-8 h-8 text-gray-400" />}
            </div>
            <div className="flex-grow">
              <h2 className="text-3xl font-bold text-white">{profile.name}</h2>
              <p className="text-xl text-gray-300">Level {profile.age} Adventurer</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-400">Height</p>
              <p className="text-lg font-semibold text-white">{profile.height} cm</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-400">Total Workouts</p>
              <p className="text-lg font-semibold text-white">{totalWorkouts}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-400">Total Weight Lifted</p>
              <p className="text-lg font-semibold text-white">{totalWeightLifted.toLocaleString()} kg</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-400">Current Weight</p>
              <p className="text-lg font-semibold text-white">
                {profile.weightHistory.length > 0
                  ? `${profile.weightHistory[profile.weightHistory.length - 1].weight} kg`
                  : 'Not set'}
              </p>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Current Quest</p>
              <p className="text-lg font-semibold text-white flex items-center">
                {goalIcons[profile.fitnessGoal] || <Target className="w-6 h-6 text-gray-400 mr-2" />}
                <span className="ml-2">{profile.fitnessGoal.replace('_', ' ')}</span>
              </p>
            </div>
            <button
              onClick={handleSaveProfileImage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Save Profile Image
            </button>
          </div>
        </div>
      )}

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">Edit Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-gray-300 font-bold mb-2">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 bg-gray-700 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="age" className="block text-gray-300 font-bold mb-2">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={profile.age}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 bg-gray-700 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="height" className="block text-gray-300 font-bold mb-2">Height (cm)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={profile.height}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 bg-gray-700 text-white"
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
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 bg-gray-700 text-white"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="fitnessGoal" className="block text-gray-300 font-bold mb-2">Fitness Goal</label>
            <select
              id="fitnessGoal"
              name="fitnessGoal"
              value={profile.fitnessGoal}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 bg-gray-700 text-white"
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
          <div>
            <label htmlFor="activityLevel" className="block text-gray-300 font-bold mb-2">Activity Level</label>
            <select
              id="activityLevel"
              name="activityLevel"
              value={profile.activityLevel}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 bg-gray-700 text-white"
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
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:border-blue-300 mt-4 transition-colors duration-200"
        >
          Update Profile
        </button>
      </form>

      <div className="bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Weight Tracking</h2>
        <div className="flex items-center mb-4">
          <input
            type="number"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Enter weight (kg)"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 bg-gray-700 text-white mr-2"
          />
          <button
            onClick={handleAddWeight}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring focus:border-green-300 transition-colors duration-200"
          >
            Add Weight
          </button>
        </div>
        {profile.weightHistory.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={profile.weightHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="#3B82F6" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}