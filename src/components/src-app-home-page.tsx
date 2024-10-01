'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Activity, Calendar, CheckSquare, BarChart2, Users, User, Dumbbell, Flame, Award } from "lucide-react"
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Progress } from "@/components/ui/progress"

export function Page() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    workouts: 0,
    habits: 0,
    streak: 0,
    caloriesBurned: 0,
    minutesExercised: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 100
  })

  useEffect(() => {
    // Fetch user stats here
    // For now, we'll use dummy data
    setStats({
      workouts: 24,
      habits: 5,
      streak: 7,
      caloriesBurned: 1500,
      minutesExercised: 180,
      level: 5,
      xp: 75,
      nextLevelXp: 100
    })
  }, [])

  const menuItems = [
    { href: '/feed', label: 'Social Feed', icon: Users, color: 'from-pink-500 to-rose-500' },
    { href: '/workout/log', label: 'Log Workout', icon: Activity, color: 'from-green-500 to-emerald-500' },
    { href: '/habits', label: 'Habits', icon: CheckSquare, color: 'from-purple-500 to-indigo-500' },
    { href: '/history', label: 'History', icon: Calendar, color: 'from-yellow-500 to-amber-500' },
    { href: '/stats', label: 'Statistics', icon: BarChart2, color: 'from-blue-500 to-cyan-500' },
    { href: '/profile', label: 'Profile', icon: User, color: 'from-orange-500 to-red-500' },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div 
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-primary">Welcome back, {user?.name || 'Athlete'}!</h1>
        <div className="flex items-center bg-secondary rounded-full px-4 py-2">
          <Flame className="text-primary mr-2" />
          <span className="font-bold text-primary">{stats.streak} Day Streak</span>
        </div>
      </motion.div>

      <motion.div 
        className="grid gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-primary to-primary-foreground shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Your Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-white">
            <div className="text-center">
              <Dumbbell className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">{stats.workouts}</p>
              <p className="text-sm">Workouts</p>
            </div>
            <div className="text-center">
              <CheckSquare className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">{stats.habits}</p>
              <p className="text-sm">Active Habits</p>
            </div>
            <div className="text-center">
              <Flame className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">{stats.caloriesBurned}</p>
              <p className="text-sm">Calories Burned</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Level {stats.level}</span>
              <span className="text-sm font-medium">{stats.xp} / {stats.nextLevelXp} XP</span>
            </div>
            <Progress value={(stats.xp / stats.nextLevelXp) * 100} className="w-full" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Exercised</p>
                <p className="text-2xl font-bold">{stats.minutesExercised} min</p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Milestone</p>
                <p className="text-2xl font-bold">30 Workouts</p>
              </div>
              <Award className="w-8 h-8 text-primary" />
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
          >
            <Link href={item.href}>
              <Card className={`bg-gradient-to-br ${item.color} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center">
                    <item.icon className="w-8 h-8 mr-4 text-white" />
                    <h2 className="text-xl font-semibold text-white">{item.label}</h2>
                  </div>
                  <ArrowRight className="w-6 h-6 text-white" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}