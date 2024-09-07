'use client'

import React from 'react'
import { Share2, Target, Scale, Dumbbell, Activity } from 'lucide-react'

type UserProfile = {
  name: string
  username: string
  height: number
  weightHistory: { date: string; weight: number }[]
  fitnessGoal: string
  activityLevel: string
  profileEmoji: string
}

type ProfileCardProps = {
  profile: UserProfile
  totalWorkouts: number
  totalWeightLifted: number
  handleSaveProfileImage: () => void
}

const goalIcons: { [key: string]: JSX.Element } = {
  weight_loss: <Scale className="w-6 h-6 text-yellow-500" />,
  muscle_gain: <Dumbbell className="w-6 h-6 text-yellow-500" />,
  endurance: <Activity className="w-6 h-6 text-yellow-500" />,
  strength: <Dumbbell className="w-6 h-6 text-yellow-500" />,
  flexibility: <Activity className="w-6 h-6 text-yellow-500" />,
  overall_health: <Target className="w-6 h-6 text-yellow-500" />,
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, totalWorkouts, totalWeightLifted, handleSaveProfileImage }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-yellow-500 rounded-full p-3 text-4xl">
            {profile.profileEmoji}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{profile.username || profile.name || 'New Hero'}</h2>
            <p className="text-yellow-500">Level: {Math.floor(totalWorkouts / 10) + 1}</p>
          </div>
        </div>
        <button
          onClick={handleSaveProfileImage}
          className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full hover:bg-yellow-400 transition-colors duration-200 flex items-center space-x-1 text-sm"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-400">Height</p>
          <p className="text-lg font-semibold text-white">{profile.height || 0} cm</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-400">Workouts Completed</p>
          <p className="text-lg font-semibold text-white">{totalWorkouts}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-400">Total Weight Lifted</p>
          <p className="text-lg font-semibold text-white">{totalWeightLifted.toLocaleString()} kg</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-400">Current Weight</p>
          <p className="text-lg font-semibold text-white">
            {profile.weightHistory && profile.weightHistory.length > 0
              ? `${profile.weightHistory[profile.weightHistory.length - 1].weight} kg`
              : 'Not set'}
          </p>
        </div>
      </div>
      <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Fitness Goal</p>
          <p className="text-lg font-semibold text-white flex items-center">
            {goalIcons[profile.fitnessGoal] || <Target className="w-5 h-5 text-yellow-500 mr-2" />}
            <span className="ml-2">{(profile.fitnessGoal || '').replace('_', ' ') || 'Not set'}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Activity Level</p>
          <p className="text-lg font-semibold text-white">{profile.activityLevel || 'Not set'}</p>
        </div>
      </div>
    </div>
  )
}