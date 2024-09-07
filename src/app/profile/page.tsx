'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { MainMenu } from '../../components/MainMenu'
import html2canvas from 'html2canvas'
import { Loader2 } from 'lucide-react'
import { ProfileCard } from '../../components/ProfileCard'
import { EditProfileCard } from '../../components/EditProfileCard'
import { WeightTrackingCard } from '../../components/WeightTrackingCard'
import { BodyFatTrackingCard } from '../../components/BodyFatTrackingCard'

type WeightEntry = {
  date: string
  weight: number
}

type BodyFatEntry = {
  date: string
  bodyFat: number
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
  bodyFatHistory: BodyFatEntry[]
  profileEmoji: string
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
  bodyFatHistory: [],
  profileEmoji: '💪'
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newWeight, setNewWeight] = useState<number | ''>('')
  const [newBodyFat, setNewBodyFat] = useState<number | ''>('')
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
            bodyFatHistory: profileData.bodyFatHistory || [],
            profileEmoji: profileData.profileEmoji || '💪'
          })
        } else {
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

  const handleAddBodyFat = async () => {
    if (!user || newBodyFat === '') return

    const bodyFatEntry: BodyFatEntry = {
      date: new Date().toISOString().split('T')[0],
      bodyFat: Number(newBodyFat),
    }

    try {
      await updateDoc(doc(db, 'userProfiles', user.uid), {
        bodyFatHistory: arrayUnion(bodyFatEntry),
      })

      setProfile(prev => ({
        ...prev,
        bodyFatHistory: [...(prev.bodyFatHistory || []), bodyFatEntry],
      }))

      setNewBodyFat('')
      alert('Body fat entry added successfully!')
      setError(null)
    } catch (err) {
      console.error('Error adding body fat entry:', err)
      setError('Failed to add body fat entry. Please try again.')
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

  const handleEmojiChange = async (emoji: string) => {
    if (!user) return

    try {
      await updateDoc(doc(db, 'userProfiles', user.uid), {
        profileEmoji: emoji
      })

      setProfile(prev => ({
        ...prev,
        profileEmoji: emoji
      }))

      alert('Profile emoji updated successfully!')
    } catch (err) {
      console.error('Error updating profile emoji:', err)
      setError('Failed to update profile emoji. Please try again.')
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
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center animate-float ">Your GymGa.me Profile 👥</h1>
      
      <div ref={profileCardRef}>
        <ProfileCard
          profile={profile}
          totalWorkouts={totalWorkouts}
          totalWeightLifted={totalWeightLifted}
          handleSaveProfileImage={handleSaveProfileImage}
        />
      </div>

      {error && <div className="text-red-500 text-center mb-4" role="alert">{error}</div>}
      
      <EditProfileCard
        profile={profile}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        newUsername={newUsername}
        setNewUsername={setNewUsername}
        usernameError={usernameError}
        handleEmojiChange={handleEmojiChange}
      />

      <WeightTrackingCard
        weightHistory={profile.weightHistory}
        newWeight={newWeight}
        setNewWeight={setNewWeight}
        handleAddWeight={handleAddWeight}
      />

      <BodyFatTrackingCard
        bodyFatHistory={profile.bodyFatHistory}
        newBodyFat={newBodyFat}
        setNewBodyFat={setNewBodyFat}
        handleAddBodyFat={handleAddBodyFat}
      />
    </div>
  )
}