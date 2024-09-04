'use client'

import { useState, useEffect, useRef } from 'react'
import { MainMenu } from '../../components/MainMenu'
import { Achievements } from '../../components/Achievements'
import html2canvas from 'html2canvas'
import { Trophy, Share2, Sword, Shield, Crown, Calendar, Dumbbell } from 'lucide-react'
import { useAuth } from '../../components/AuthProvider'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { initializeUserData } from '../../lib/userDataUtils'

export default function AchievementsPage() {
  const [totalAchievements, setTotalAchievements] = useState(0)
  const [achievedCount, setAchievedCount] = useState(0)
  const [playerLevel, setPlayerLevel] = useState(1)
  const [workoutStreak, setWorkoutStreak] = useState(0)
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const shareCardRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        console.log('No user logged in')
        return
      }

      console.log('Fetching data for user:', user.uid)

      try {
        // Initialize user data if needed
        await initializeUserData(user.uid)

        // Fetch achievements
        const achievementsDoc = await getDoc(doc(db, 'userAchievements', user.uid))
        if (achievementsDoc.exists()) {
          const achievementsData = achievementsDoc.data()
          console.log('Achievements data:', achievementsData)
          if (Array.isArray(achievementsData.achievements)) {
            setTotalAchievements(achievementsData.achievements.length)
            setAchievedCount(achievementsData.achievements.filter((a: any) => a.achieved).length)
          } else {
            console.error('Achievements is not an array:', achievementsData.achievements)
            setError('Achievement data is in an unexpected format')
          }
        } else {
          console.log('No achievements document found')
          setError('No achievements found. Complete a workout to earn your first achievement!')
        }

        // Fetch user profile
        const profileDoc = await getDoc(doc(db, 'userProfiles', user.uid))
        if (profileDoc.exists()) {
          const profileData = profileDoc.data()
          console.log('Profile data:', profileData)
          setPlayerLevel(profileData.level || 1)
          if (typeof profileData.workoutStreak === 'number') {
            setWorkoutStreak(profileData.workoutStreak)
          } else {
            console.error('Workout streak is not a number:', profileData.workoutStreak)
            // Instead of setting an error, we'll initialize the workout streak to 0
            setWorkoutStreak(0)
            // Update the workout streak in Firestore
            await initializeUserData(user.uid)
          }
        } else {
          console.log('No profile document found')
          setError('Profile not found. Please update your profile.')
        }

        // Fetch total workouts
        const workoutsQuery = query(collection(db, 'workouts'), where('userId', '==', user.uid))
        const workoutsSnapshot = await getDocs(workoutsQuery)
        console.log('Total workouts:', workoutsSnapshot.size)
        setTotalWorkouts(workoutsSnapshot.size)

      } catch (error) {
        console.error('Error fetching user data:', error)
        setError('Failed to load user data. Please try again later.')
      }
    }

    fetchUserData()
  }, [user])

  const handleScreenshot = async () => {
    if (shareCardRef.current) {
      try {
        const canvas = await html2canvas(shareCardRef.current)
        const image = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = image
        link.download = 'ironquest-achievements.png'
        link.click()
      } catch (error) {
        console.error('Error creating screenshot:', error)
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MainMenu />
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center animate-float">Your Achievements 🏆</h1>
      
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-8">
        <div ref={shareCardRef} className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 text-white border-4 border-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Shield className="w-12 h-12 text-yellow-500" />
              <div>
                <h2 className="text-2xl font-bold">IronQuest</h2>
                <p className="text-yellow-500">Achievement Board</p>
              </div>
            </div>
            <div className="bg-yellow-500 text-gray-900 rounded-full p-2">
              <Crown className="w-8 h-8" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-700 rounded-lg p-3 flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-300">Achievements</p>
                <p className="text-xl font-bold">{achievedCount} / {totalAchievements}</p>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 flex items-center space-x-3">
              <Sword className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-300">Player Level</p>
                <p className="text-xl font-bold">{playerLevel}</p>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-300">Workout Streak</p>
                <p className="text-xl font-bold">{workoutStreak} days</p>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 flex items-center space-x-3">
              <Dumbbell className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-300">Total Workouts</p>
                <p className="text-xl font-bold">{totalWorkouts}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-300 mb-1">Achievement Progress</p>
            <div className="bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-yellow-500 to-yellow-300 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(achievedCount / totalAchievements) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-300">Keep pushing, brave adventurer!</p>
            <p className="text-lg font-semibold text-yellow-500">Glory awaits!</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleScreenshot}
            className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-full hover:bg-yellow-400 transition-colors duration-200 flex items-center space-x-2"
            aria-label="Take screenshot"
          >
            <Share2 className="w-5 h-5" />
            <span>Share Achievements</span>
          </button>
        </div>
      </div>

      <Achievements />
    </div>
  )
}