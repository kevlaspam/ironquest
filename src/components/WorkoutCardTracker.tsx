import React, { useState } from 'react'
import { ChevronDown, X, Check, Plus, Dumbbell } from 'lucide-react'
import { useWorkout } from './WorkoutContext'
import RepSelector from './RepSelector'
import WeightSelector from './WeightSelector'

type Exercise = {
  name: string
  sets: { reps: number; weight: number; completed: boolean }[]
}

const exerciseOptions = {
  Chest: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Decline Bench Press', 'Chest Dips', 'Push-Ups', 'Cable Flyes', 'Pec Deck Machine', 'Landmine Press', 'Smith Machine Bench Press'],
  Back: ['Lat Pulldown', 'Seated Cable Row', 'Bent Over Barbell Row', 'T-Bar Row', 'Pull-Ups', 'Chin-Ups', 'Face Pulls', 'Straight Arm Pulldown', 'Single-Arm Dumbbell Row'],
  Shoulders: ['Overhead Barbell Press', 'Dumbbell Shoulder Press', 'Arnold Press', 'Lateral Raises', 'Front Raises', 'Reverse Flyes', 'Upright Rows', 'Shrugs'],
  Biceps: ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curls', 'Preacher Curls', 'Concentration Curls', 'Cable Curls', 'Incline Dumbbell Curls', 'Spider Curls'],
  Triceps: ['Tricep Pushdowns', 'Overhead Tricep Extension', 'Skull Crushers', 'Close-Grip Bench Press', 'Diamond Push-Ups', 'Tricep Dips', 'Cable Tricep Kickbacks'],
  Legs: ['Barbell Back Squat', 'Front Squat', 'Leg Press', 'Romanian Deadlift', 'Lunges', 'Leg Extensions', 'Leg Curls', 'Calf Raises', 'Hip Thrusts', 'Bulgarian Split Squats'],
  Abs: ['Crunches', 'Planks', 'Russian Twists', 'Leg Raises', 'Ab Wheel Rollouts', 'Hanging Leg Raises', 'Cable Crunches', 'Mountain Climbers'],
  Compound: ['Deadlifts', 'Power Cleans', 'Barbell Rows', 'Dumbbell Thrusters'],
  Machines: ['Chest Press Machine', 'Shoulder Press Machine', 'Leg Press Machine', 'Seated Leg Curl Machine', 'Lat Pulldown Machine', 'Seated Row Machine', 'Pec Deck Machine', 'Tricep Pushdown Machine'],
  Bodyweight: ['Push-Ups', 'Pull-Ups', 'Dips', 'Squats', 'Lunges', 'Burpees', 'Mountain Climbers', 'Plank', 'Side Plank', 'Glute Bridges', 'Step-Ups'],
  Cable: ['Cable Crossovers', 'Cable Woodchoppers', 'Cable Crunches', 'Cable Lateral Raises', 'Cable Face Pulls', 'Cable Tricep Pushdowns', 'Cable Bicep Curls']
}

export const WorkoutCardTracker: React.FC = () => {
  const { exercises, setExercises } = useWorkout()
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null)

  const handleExerciseChange = (exerciseIndex: number, bodyPart: string, exerciseName: string) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].name = exerciseName
    setExercises(newExercises)
    setSelectedBodyPart(null)
  }

  const handleSetChange = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets[setIndex][field] = value
    setExercises(newExercises)
  }

  const toggleSetCompletion = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets[setIndex].completed = !newExercises[exerciseIndex].sets[setIndex].completed
    setExercises(newExercises)
  }

  const addSet = (exerciseIndex: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets.push({ reps: 0, weight: 0, completed: false })
    setExercises(newExercises)
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets.splice(setIndex, 1)
    setExercises(newExercises)
  }

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ reps: 0, weight: 0, completed: false }] }])
  }

  const removeExercise = (index: number) => {
    const newExercises = [...exercises]
    newExercises.splice(index, 1)
    setExercises(newExercises)
  }

  return (
    <div className="space-y-6">
      {exercises.map((exercise, exerciseIndex) => (
        <div key={exerciseIndex} className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-4 border-4 border-yellow-500">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => setSelectedBodyPart(selectedBodyPart === exerciseIndex.toString() ? null : exerciseIndex.toString())}
                className="bg-gray-700 text-white rounded-lg p-2 w-full text-left flex justify-between items-center"
              >
                <span className="flex items-center">
                  <Dumbbell className="w-5 h-5 mr-2 text-yellow-500" />
                  {exercise.name || "Select an exercise"}
                </span>
                <ChevronDown size={20} className="text-yellow-500" />
              </button>
              {selectedBodyPart === exerciseIndex.toString() && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {Object.entries(exerciseOptions).map(([bodyPart, exercises]) => (
                    <div key={bodyPart}>
                      <div className="sticky top-0 bg-gray-900 px-4 py-2 font-semibold text-yellow-500">
                        {bodyPart}
                      </div>
                      {exercises.map((exerciseName) => (
                        <button
                          key={exerciseName}
                          type="button"
                          onClick={() => handleExerciseChange(exerciseIndex, bodyPart, exerciseName)}
                          className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
                        >
                          {exerciseName}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeExercise(exerciseIndex)}
              className="ml-2 p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
          <div className="space-y-2">
            {exercise.sets.map((set, setIndex) => (
              <div key={setIndex} className="flex items-center space-x-2 bg-gray-800 rounded-lg p-2">
                <span className="text-white text-sm font-medium w-12">Set {setIndex + 1}</span>
                <div className="flex-1 flex items-center space-x-2">
                  <RepSelector
                    value={set.reps}
                    onChange={(value) => handleSetChange(exerciseIndex, setIndex, 'reps', value)}
                  />
                  <span className="text-gray-400">x</span>
                  <WeightSelector
                    value={set.weight}
                    onChange={(value) => handleSetChange(exerciseIndex, setIndex, 'weight', value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => toggleSetCompletion(exerciseIndex, setIndex)}
                  className={`p-2 rounded-full transition-colors ${set.completed ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  <Check size={16} className="text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => removeSet(exerciseIndex, setIndex)}
                  className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addSet(exerciseIndex)}
            className="mt-2 w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center"
          >
            <Plus size={16} className="mr-2" />
            Add Set
          </button>
        </div>
      ))}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={addExercise}
          className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors duration-200 flex items-center justify-center font-bold"
        >
          <Plus size={20} className="mr-2" />
          Add Exercise
        </button>
      </div>
    </div>
  )
}