import { Dumbbell, Clock } from 'lucide-react'
import { Timestamp } from 'firebase/firestore'

type Workout = {
  id: string
  name: string
  date: Timestamp
  exercises: { name: string; sets: { reps: number; weight: number }[] }[]
  duration: number
}

type WorkoutCardProps = {
  workout: Workout
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border-2 border-yellow-500">
      <h4 className="text-lg font-semibold text-white mb-2">{workout.name}</h4>
      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {formatDuration(workout.duration)}
        </div>
        <div className="flex items-center">
          <Dumbbell className="w-4 h-4 mr-1" />
          {workout.exercises.length} exercises
        </div>
      </div>
      <div className="space-y-2">
        {workout.exercises.slice(0, 3).map((exercise, index) => (
          <div key={index} className="text-sm text-gray-300">
            {exercise.name}: {exercise.sets.length} sets
          </div>
        ))}
        {workout.exercises.length > 3 && (
          <div className="text-sm text-gray-400">
            +{workout.exercises.length - 3} more exercises
          </div>
        )}
      </div>
    </div>
  )
}