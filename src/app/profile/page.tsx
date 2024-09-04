'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { MainMenu } from '../../components/MainMenu'

type UserProfile = {
  name: string
  age: number
  weight: number
  height: number
  fitnessGoal: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: 0,
    weight: 0,
    height: 0,
    fitnessGoal: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    setProfile(prev => ({ ...prev, [name]: name === 'age' || name === 'weight' || name === 'height' ? Number(value) : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      await setDoc(doc(db, 'userProfiles', user.uid), profile)
      alert('Profile updated successfully!')
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile. Please try again.')
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="weight" className="block text-gray-700 font-bold mb-2">Weight (kg)</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={profile.weight}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="fitnessGoal" className="block text-gray-700 font-bold mb-2">Fitness Goal</label>
          <select
            id="fitnessGoal"
            name="fitnessGoal"
            value={profile.fitnessGoal}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
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
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
        >
          Update Profile
        </button>
      </form>
    </div>
  )
}