/**This component is used on the feed - it's the workout on posts */

import { useState } from 'react'
import { Dumbbell, Clock, ChevronDown, ChevronUp } from 'lucide-react'
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
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-yellow-500 text-sm">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-base font-semibold text-white">{workout.name}</h4>
        <button
          onClick={toggleExpand}
          className="text-yellow-500 hover:text-yellow-400 transition-colors duration-200 focus:outline-none"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse workout details" : "Expand workout details"}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      <div className="flex items-center space-x-4 text-xs text-gray-400 mb-2">
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {formatDuration(workout.duration)}
        </div>
        <div className="flex items-center">
          <Dumbbell className="w-3 h-3 mr-1" />
          {workout.exercises.length} exercises
        </div>
      </div>
      <div className="space-y-1">
        {workout.exercises.slice(0, isExpanded ? workout.exercises.length : 2).map((exercise, index) => (
          <div key={index} className="text-xs text-gray-300 flex justify-between">
            <span>{exercise.name}</span>
            <span>{exercise.sets.length} sets</span>
          </div>
        ))}
        {!isExpanded && workout.exercises.length > 2 && (
          <div className="text-xs text-gray-400">
            +{workout.exercises.length - 2} more exercises
          </div>
        )}
      </div>
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <h5 className="text-xs font-semibold text-white mb-1">Detailed Exercises:</h5>
          {workout.exercises.map((exercise, index) => (
            <div key={index} className="mb-2">
              <h6 className="text-xs font-medium text-yellow-500">{exercise.name}</h6>
              <div className="grid grid-cols-3 gap-1 text-xs text-gray-400">
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex}>
                    Set {setIndex + 1}: {set.reps}x{set.weight}kg
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}