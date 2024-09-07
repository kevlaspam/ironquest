import { useState, useEffect } from 'react'
import { Trophy, Dumbbell, Zap, Award, Flame, Star } from 'lucide-react'

type Workout = {
  id: string;
  date: { seconds: number; nanoseconds: number };
  exercises: { name: string; sets: { reps: number; weight: number }[] }[];
  duration: number;
}

type Achievement = {
  id: string
  name: string
  description: string
  icon: JSX.Element
  unlocked: boolean
  progress: number
  goal: number
}

const achievementsList: Omit<Achievement, 'unlocked' | 'progress'>[] = [
  { id: 'first_workout', name: 'First Step', description: 'Complete your first workout', icon: <Dumbbell className="w-8 h-8 text-yellow-500" />, goal: 1 },
  { id: 'workout_streak_7', name: 'Consistency is Key', description: 'Achieve a 7-day workout streak', icon: <Flame className="w-8 h-8 text-orange-500" />, goal: 7 },
  { id: 'total_workouts_20', name: 'Dedicated Athlete', description: 'Complete 20 workouts', icon: <Trophy className="w-8 h-8 text-purple-500" />, goal: 20 },
  { id: 'bench_press_5', name: 'Bench Press Beginner', description: 'Complete Barbell Bench Press 5 times', icon: <Dumbbell className="w-8 h-8 text-blue-500" />, goal: 5 },
  { id: 'bench_press_20', name: 'Bench Press Master', description: 'Complete Barbell Bench Press 20 times', icon: <Dumbbell className="w-8 h-8 text-blue-700" />, goal: 20 },
  { id: 'squat_5', name: 'Squat Starter', description: 'Complete Barbell Back Squat 5 times', icon: <Dumbbell className="w-8 h-8 text-red-500" />, goal: 5 },
  { id: 'squat_20', name: 'Squat Specialist', description: 'Complete Barbell Back Squat 20 times', icon: <Dumbbell className="w-8 h-8 text-red-700" />, goal: 20 },
  { id: 'deadlift_5', name: 'Deadlift Novice', description: 'Complete Deadlifts 5 times', icon: <Dumbbell className="w-8 h-8 text-green-500" />, goal: 5 },
  { id: 'deadlift_20', name: 'Deadlift Pro', description: 'Complete Deadlifts 20 times', icon: <Dumbbell className="w-8 h-8 text-green-700" />, goal: 20 },
  { id: 'overhead_press_5', name: 'Overhead Press Initiate', description: 'Complete Overhead Barbell Press 5 times', icon: <Dumbbell className="w-8 h-8 text-yellow-500" />, goal: 5 },
  { id: 'overhead_press_20', name: 'Overhead Press Expert', description: 'Complete Overhead Barbell Press 20 times', icon: <Dumbbell className="w-8 h-8 text-yellow-700" />, goal: 20 },
  { id: 'pullups_50', name: 'Pull-up Prodigy', description: 'Complete 50 total Pull-ups', icon: <Dumbbell className="w-8 h-8 text-indigo-500" />, goal: 50 },
  { id: 'pushups_100', name: 'Push-up Powerhouse', description: 'Complete 100 total Push-ups', icon: <Dumbbell className="w-8 h-8 text-pink-500" />, goal: 100 },
  { id: 'volume_5000', name: 'Volume Rookie', description: 'Lift a total of 5,000 kg across all workouts', icon: <Award className="w-8 h-8 text-green-500" />, goal: 5000 },
  { id: 'volume_50000', name: 'Volume King', description: 'Lift a total of 50,000 kg across all workouts', icon: <Award className="w-8 h-8 text-green-700" />, goal: 50000 },
  { id: 'exercise_variety_10', name: 'Jack of All Trades', description: 'Perform 10 different exercises', icon: <Star className="w-8 h-8 text-indigo-500" />, goal: 10 },
  { id: 'long_workout', name: 'Endurance Champion', description: 'Complete a workout lasting over 90 minutes', icon: <Zap className="w-8 h-8 text-yellow-500" />, goal: 90 },
]

export function Achievements({ workouts }: { workouts: Workout[] }) {
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    const unlockedAchievements = achievementsList.map(achievement => {
      const { unlocked, progress } = checkAchievementProgress(achievement.id, workouts)
      return {
        ...achievement,
        unlocked,
        progress
      }
    })

    setAchievements(unlockedAchievements)
  }, [workouts])

  const checkAchievementProgress = (achievementId: string, workouts: Workout[]): { unlocked: boolean, progress: number } => {
    switch (achievementId) {
      case 'first_workout':
        return { unlocked: workouts.length > 0, progress: Math.min(workouts.length, 1) }
      case 'workout_streak_7':
        // This is a simplified check. For a real app, you'd need more sophisticated streak tracking.
        return { unlocked: workouts.length >= 7, progress: Math.min(workouts.length, 7) }
      case 'total_workouts_20':
        return { unlocked: workouts.length >= 20, progress: Math.min(workouts.length, 20) }
      case 'bench_press_5':
      case 'bench_press_20':
        const benchPressCount = workouts.filter(w => w.exercises.some(e => e.name === 'Barbell Bench Press')).length
        return { unlocked: benchPressCount >= (achievementId === 'bench_press_5' ? 5 : 20), progress: benchPressCount }
      case 'squat_5':
      case 'squat_20':
        const squatCount = workouts.filter(w => w.exercises.some(e => e.name === 'Barbell Back Squat')).length
        return { unlocked: squatCount >= (achievementId === 'squat_5' ? 5 : 20), progress: squatCount }
      case 'deadlift_5':
      case 'deadlift_20':
        const deadliftCount = workouts.filter(w => w.exercises.some(e => e.name === 'Deadlifts')).length
        return { unlocked: deadliftCount >= (achievementId === 'deadlift_5' ? 5 : 20), progress: deadliftCount }
      case 'overhead_press_5':
      case 'overhead_press_20':
        const overheadPressCount = workouts.filter(w => w.exercises.some(e => e.name === 'Overhead Barbell Press')).length
        return { unlocked: overheadPressCount >= (achievementId === 'overhead_press_5' ? 5 : 20), progress: overheadPressCount }
      case 'pullups_50':
        const totalPullups = workouts.reduce((total, w) => 
          total + w.exercises.filter(e => e.name === 'Pull-Ups').reduce((setTotal, e) => 
            setTotal + e.sets.reduce((repTotal, set) => repTotal + set.reps, 0), 0), 0)
        return { unlocked: totalPullups >= 50, progress: totalPullups }
      case 'pushups_100':
        const totalPushups = workouts.reduce((total, w) => 
          total + w.exercises.filter(e => e.name === 'Push-Ups').reduce((setTotal, e) => 
            setTotal + e.sets.reduce((repTotal, set) => repTotal + set.reps, 0), 0), 0)
        return { unlocked: totalPushups >= 100, progress: totalPushups }
      case 'volume_5000':
      case 'volume_50000':
        const totalVolume = workouts.reduce((total, w) => 
          total + w.exercises.reduce((workoutTotal, e) => 
            workoutTotal + e.sets.reduce((setTotal, set) => setTotal + (set.reps * set.weight), 0), 0), 0)
        return { unlocked: totalVolume >= (achievementId === 'volume_5000' ? 5000 : 50000), progress: totalVolume }
      case 'exercise_variety_10':
        const uniqueExercises = new Set(workouts.flatMap(w => w.exercises.map(e => e.name)))
        return { unlocked: uniqueExercises.size >= 10, progress: uniqueExercises.size }
      case 'long_workout':
        const longestWorkout = Math.max(...workouts.map(w => w.duration))
        return { unlocked: longestWorkout >= 90, progress: longestWorkout }
      default:
        return { unlocked: false, progress: 0 }
    }
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievementsList.length

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
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-white">{achievement.name}</h3>
              <p className="text-gray-400 text-sm">{achievement.description}</p>
              {achievement.unlocked ? (
                <span className="text-yellow-500 font-semibold flex items-center mt-2">
                  <Trophy className="w-4 h-4 mr-1" />
                  Unlocked!
                </span>
              ) : (
                <div className="mt-2">
                  <div className="bg-gray-700 h-2 rounded-full">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((achievement.progress / achievement.goal) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {achievement.progress} / {achievement.goal}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}