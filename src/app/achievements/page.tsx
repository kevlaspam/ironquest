'use client'

import { MainMenu } from '../../components/MainMenu'
import { Achievements } from '../../components/Achievements'

export default function AchievementsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MainMenu />
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center animate-float">Your Achievements 🏆</h1>
      <Achievements />
    </div>
  )
}