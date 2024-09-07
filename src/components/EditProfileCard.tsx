'use client'

import React from 'react'

type EditProfileCardProps = {
  profile: UserProfile
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  handleSubmit: (e: React.FormEvent) => void
  newUsername: string
  setNewUsername: (value: string) => void
  usernameError: string | null
  handleEmojiChange: (emoji: string) => void
}

const emojiOptions = [
  '💪', '🏋️', '🏃', '🧘', '🚴', '🏊', '🤸', // Fitness-related
  '🐶', '🐱', '🦁', '🐯', '🐻', '🐼', '🐨', '🐷', '🐸', '🦊', '🐒', // Animals for personality
  '🦅', '🦄', '🦋', '🐍', '🐢', '🐬', '🦜', '🐠', '🦓', '🐎', // More animals
  '🎧', '📸', '🎮', '🏆', '⚽', '🏀', '🎸', '🎨', '🎤', '🚗', '🚴‍♀️', // Hobbies and lifestyle
  '🌟', '🔥', '🌈', '✨', '💎', '🎯', '🌻', '🍀', '🎲' // Symbolic or aesthetic options
];

export const EditProfileCard: React.FC<EditProfileCardProps> = ({
  profile,
  handleInputChange,
  handleSubmit,
  newUsername,
  setNewUsername,
  usernameError,
  handleEmojiChange
}) => {
  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-500">
      <h2 className="text-2xl font-bold mb-4 text-white">Edit Your Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-gray-300 font-bold mb-2">Full Name</label>
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-yellow-300 bg-gray-600 text-gray-400 cursor-not-allowed"
            disabled
          />
        </div>
        <div>
          <label htmlFor="newUsername" className="block text-gray-300 font-bold mb-2">Set New Username</label>
          <input
            type="text"
            id="newUsername"
            name="newUsername"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-yellow-300 bg-gray-700 text-white"
          />
          <p className="text-sm text-gray-400 mt-1">This is what other people will see on the feed.</p>
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
          <label htmlFor="fitnessGoal" className="block text-gray-300 font-bold mb-2">Fitness Goal</label>
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
            <option value="sedentary">Novice (little to no exercise)</option>
            <option value="light">Apprentice (light exercise 1-3 days/week)</option>
            <option value="moderate">Adept (moderate exercise 3-5 days/week)</option>
            <option value="very">Expert (intense exercise 6-7 days/week)</option>
            <option value="extra">Legendary (very intense exercise & physical job)</option>
          </select>
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="profileEmoji" className="block text-gray-300 font-bold mb-2">Profile Emoji</label>
        <div className="flex flex-wrap gap-2">
          {emojiOptions.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiChange(emoji)}
              className={`text-2xl p-2 rounded-full ${profile.profileEmoji === emoji ? 'bg-yellow-500' : 'bg-gray-700'} hover:bg-yellow-400 transition-colors duration-200`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-yellow-500 text-gray-900 py-2 px-4 rounded-full hover:bg-yellow-400 focus:outline-none focus:ring focus:border-yellow-300 mt-4 transition-colors duration-200 font-bold"
      >
        Update Profile
      </button>
    </form>
  )
}