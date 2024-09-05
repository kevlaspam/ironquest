import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Trophy, Dumbbell, Heart, Zap, Target, Award, Flame, Sunrise, Moon, Coffee, Pizza, Scale, Clock, Calendar, Rocket, Star, Zap as Lightning, Droplet, Mountain, Feather } from 'lucide-react'

type Achievement = {
  id: string
  name: string
  description: string
  icon: JSX.Element
  unlocked: boolean
}

const achievementsList: Omit<Achievement, 'unlocked'>[] = [
  { id: 'first_workout', name: 'First Step', description: 'Complete your first workout', icon: <Dumbbell className="w-8 h-8 text-yellow-500" /> },
  { id: 'workout_streak_7', name: 'Consistency is Key', description: 'Achieve a 7-day workout streak', icon: <Flame className="w-8 h-8 text-orange-500" /> },
  { id: 'total_workouts_20', name: 'Dedicated Athlete', description: 'Complete 20 workouts', icon: <Trophy className="w-8 h-8 text-purple-500" /> },
  { id: 'leg_master', name: 'Leg Day Champion', description: 'Complete 10 leg workouts', icon: <Zap className="w-8 h-8 text-blue-500" /> },
  { id: 'chest_master', name: 'Chest Day Hero', description: 'Complete 10 chest workouts', icon: <Heart className="w-8 h-8 text-red-500" /> },
  { id: 'volume_king', name: 'Volume King', description: 'Lift a total of 10,000 kg in a single workout', icon: <Award className="w-8 h-8 text-green-500" /> },
  { id: 'all_rounder', name: 'Jack of All Trades', description: 'Complete workouts for all major muscle groups', icon: <Target className="w-8 h-8 text-indigo-500" /> },
  { id: 'early_bird', name: 'Early Bird', description: 'Complete a workout before 7 AM', icon: <Sunrise className="w-8 h-8 text-yellow-400" /> },
  { id: 'night_owl', name: 'Night Owl', description: 'Complete a workout after 10 PM', icon: <Moon className="w-8 h-8 text-blue-900" /> },
  { id: 'caffeine_boost', name: 'Caffeine Boost', description: 'Log a workout within an hour of drinking coffee', icon: <Coffee className="w-8 h-8 text-yellow-700" /> },
  { id: 'pizza_power', name: 'Pizza Power', description: 'Complete a workout on the same day you eat pizza', icon: <Pizza className="w-8 h-8 text-red-600" /> },
  { id: 'weight_loss', name: 'Feather Weight', description: 'Lose 5% of your starting body weight', icon: <Feather className="w-8 h-8 text-teal-500" /> },
  { id: 'muscle_gain', name: 'Muscle Mammoth', description: 'Gain 5 kg of muscle mass', icon: <Scale className="w-8 h-8 text-purple-600" /> },
  { id: 'marathon_workout', name: 'Marathon Man', description: 'Complete a workout lasting over 2 hours', icon: <Clock className="w-8 h-8 text-gray-600" /> },
  { id: 'year_round', name: 'Year-Round Warrior', description: 'Work out at least once every month for a year', icon: <Calendar className="w-8 h-8 text-green-600" /> },
  { id: 'pr_breaker', name: 'PR Breaker', description: 'Break a personal record in any exercise', icon: <Rocket className="w-8 h-8 text-red-500" /> },
  { id: 'gym_celebrity', name: 'Gym Celebrity', description: 'Check in at the gym 50 times', icon: <Star className="w-8 h-8 text-yellow-500" /> },
  { id: 'lightning_fast', name: 'Lightning Fast', description: 'Complete a HIIT workout in under 15 minutes', icon: <Lightning className="w-8 h-8 text-yellow-300" /> },
  { id: 'hydration_hero', name: 'Hydration Hero', description: 'Log water intake for 30 consecutive days', icon: <Droplet className="w-8 h-8 text-blue-400" /> },
  { id: 'mountain_climber', name: 'Mountain Climber', description: 'Complete an outdoor workout at an elevation over 1000m', icon: <Mountain className="w-8 h-8 text-gray-700" /> },
]

export function Achievements() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const workoutsQuery = query(collection(db, 'workouts'), where('userId', '==', user.uid))
        const workoutsSnapshot = await getDocs(workoutsQuery)
        const workouts = workoutsSnapshot.docs.map(doc => doc.data())

        const unlockedAchievements = achievementsList.map(achievement => ({
          ...achievement,
          unlocked: checkAchievementUnlocked(achievement.id, workouts)
        }))

        setAchievements(unlockedAchievements)
      } catch (error) {
        console.error('Error fetching achievements:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [user])

  const checkAchievementUnlocked = (achievementId: string, workouts: any[]) => {
    switch (achievementId) {
      case 'first_workout':
        return workouts.length > 0
      case 'workout_streak_7':
        // This is a simplified check. For a real app, you'd need more sophisticated streak tracking.
        return workouts.length >= 7
      case 'total_workouts_20':
        return workouts.length >= 20
      case 'leg_master':
        return workouts.filter(w => w.exercises.some((e: any) => e.name.toLowerCase().includes('leg') || e.name.toLowerCase().includes('squat'))).length >= 10
      case 'chest_master':
        return workouts.filter(w => w.exercises.some((e: any) => e.name.toLowerCase().includes('chest') || e.name.toLowerCase().includes('bench'))).length >= 10
      case 'volume_king':
        return workouts.some(w => w.exercises.reduce((total: number, e: any) => 
          total + e.sets.reduce((setTotal: number, set: any) => setTotal + (set.reps * set.weight), 0), 0) >= 10000)
      case 'all_rounder':
        const muscleGroups = ['chest', 'back', 'legs', 'shoulders', 'arms']
        return muscleGroups.every(group => 
          workouts.some(w => w.exercises.some((e: any) => e.name.toLowerCase().includes(group)))
        )
      default:
        return false
    }
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievementsList.length

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center text-white p-8 bg-gray-800 rounded-xl shadow-lg">
        <p className="text-xl font-semibold mb-2">Please sign in to view your achievements.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Achievements Unlocked</h2>
        <p className="text-3xl font-bold text-yellow-500">{unlockedCount} / {totalCount}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 flex items-center space-x-4 border-4 ${
              achievement.unlocked ? 'border-yellow-500' : 'border-gray-700'
            } transition-all duration-300 ease-in-out transform hover:scale-105`}
          >
            <div className="flex-shrink-0">
              {achievement.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{achievement.name}</h3>
              <p className="text-gray-400">{achievement.description}</p>
              {achievement.unlocked ? (
                <span className="text-yellow-500 font-semibold flex items-center mt-2">
                  <Trophy className="w-4 h-4 mr-1" />
                  Unlocked!
                </span>
              ) : (
                <span className="text-gray-500 font-semibold mt-2">Locked</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}