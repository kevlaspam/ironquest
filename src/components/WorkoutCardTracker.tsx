import React, { useState } from 'react'
import { ChevronDown, X, Check, Plus, Dumbbell } from 'lucide-react'
import { useWorkout } from './WorkoutContext'
import RepSelector from './RepSelector'
import WeightSelector from './WeightSelector'
import { cn } from '@/lib/utils'

type Exercise = {
  name: string
  sets: { reps: number; weight: number; completed: boolean }[]
}

const exerciseOptions = {
  Chest: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Decline Bench Press', 'Chest Dips', 'Push-Ups', 'Cable Flyes', 'Pec Deck Machine', 'Landmine Press', 'Smith Machine Bench Press', 'Dumbbell Flyes', 'Svend Press', 'Resistance Band Chest Press'],
  Back: ['Lat Pulldown', 'Seated Cable Row', 'Bent Over Barbell Row', 'T-Bar Row', 'Pull-Ups', 'Chin-Ups', 'Face Pulls', 'Straight Arm Pulldown', 'Single-Arm Dumbbell Row', 'Pendlay Row', 'Meadows Row', 'Inverted Row', 'Good Mornings'],
  Shoulders: ['Overhead Barbell Press', 'Dumbbell Shoulder Press', 'Arnold Press', 'Lateral Raises', 'Front Raises', 'Reverse Flyes', 'Upright Rows', 'Shrugs', 'Pike Push-Ups', 'Landmine Press', 'Cable Face Pulls', 'Barbell High Pulls'],
  Biceps: ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curls', 'Preacher Curls', 'Concentration Curls', 'Cable Curls', 'Incline Dumbbell Curls', 'Spider Curls', 'Zottman Curls', 'Reverse Curls', 'Chin-Ups', 'EZ-Bar Curls'],
  Triceps: ['Tricep Pushdowns', 'Overhead Tricep Extension', 'Skull Crushers', 'Close-Grip Bench Press', 'Diamond Push-Ups', 'Tricep Dips', 'Cable Tricep Kickbacks', 'JM Press', 'Tate Press', 'Board Press', 'Rolling Tricep Extensions'],
  Legs: ['Barbell Back Squat', 'Front Squat', 'Leg Press', 'Romanian Deadlift', 'Lunges', 'Leg Extensions', 'Leg Curls', 'Calf Raises', 'Hip Thrusts', 'Bulgarian Split Squats', 'Hack Squat', 'Goblet Squat', 'Step-Ups', 'Nordic Hamstring Curls', 'Sissy Squats'],
  Abs: ['Crunches', 'Planks', 'Russian Twists', 'Leg Raises', 'Ab Wheel Rollouts', 'Hanging Leg Raises', 'Cable Crunches', 'Mountain Climbers', 'Dragon Flags', 'Hollow Body Hold', 'L-Sit', 'Windshield Wipers'],
  Compound: ['Deadlifts', 'Power Cleans', 'Barbell Rows', 'Dumbbell Thrusters', 'Clean and Jerk', 'Snatch', 'Kettlebell Swings', 'Turkish Get-Ups', 'Farmers Walks', 'Sled Pushes/Pulls'],
  Machines: ['Chest Press Machine', 'Shoulder Press Machine', 'Leg Press Machine', 'Seated Leg Curl Machine', 'Lat Pulldown Machine', 'Seated Row Machine', 'Pec Deck Machine', 'Tricep Pushdown Machine', 'Hack Squat Machine', 'Smith Machine', 'Assisted Pull-Up Machine'],
  Bodyweight: ['Push-Ups', 'Pull-Ups', 'Dips', 'Squats', 'Lunges', 'Burpees', 'Mountain Climbers', 'Plank', 'Side Plank', 'Glute Bridges', 'Step-Ups', 'Handstand Push-Ups', 'Pistol Squats', 'Muscle-Ups', 'Dragon Flags'],
  Cable: ['Cable Crossovers', 'Cable Woodchoppers', 'Cable Crunches', 'Cable Lateral Raises', 'Cable Face Pulls', 'Cable Tricep Pushdowns', 'Cable Bicep Curls', 'Cable Pull-Throughs', 'Cable Upright Rows', 'Cable Rotations'],
  Calisthenics: ['Muscle-Ups', 'Front Lever', 'Back Lever', 'Planche', 'Human Flag', 'Handstand', 'L-Sit', 'Pistol Squat', 'One-Arm Push-Up', 'One-Arm Pull-Up'],
  Plyometrics: ['Box Jumps', 'Depth Jumps', 'Burpees', 'Jump Squats', 'Clap Push-Ups', 'Jumping Lunges', 'Tuck Jumps', 'Broad Jumps', 'Plyo Push-Ups', 'Medicine Ball Slams']
}

export const WorkoutCardTracker: React.FC = () => {
  const { exercises, setExercises } = useWorkout()
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number | null>(null)

  const handleExerciseChange = (exerciseIndex: number, exerciseName: string) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].name = exerciseName
    setExercises(newExercises)
    setSelectedExerciseIndex(null)
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
    <div className="space-y-4">
      {exercises.map((exercise, exerciseIndex) => (
        <div key={exerciseIndex} className="bg-gray-900 rounded-xl shadow-lg p-4 border-2 border-yellow-500">
          <div className="flex justify-between items-center mb-4">
            <div className="relative flex-grow">
              <button
                type="button"
                onClick={() => setSelectedExerciseIndex(selectedExerciseIndex === exerciseIndex ? null : exerciseIndex)}
                className="bg-gray-800 text-white rounded-lg py-2 px-4 w-full text-left flex justify-between items-center"
              >
                <span className="flex items-center truncate">
                  <Dumbbell className="w-5 h-5 mr-2 text-yellow-500" />
                  <span className="truncate">{exercise.name || "Select an exercise"}</span>
                </span>
                <ChevronDown size={20} className="text-yellow-500 flex-shrink-0 ml-2" />
              </button>
              {selectedExerciseIndex === exerciseIndex && (
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
                          onClick={() => handleExerciseChange(exerciseIndex, exerciseName)}
                          className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 truncate"
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
              <div key={setIndex} className="bg-gray-800 rounded-lg p-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm font-medium">Set {setIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeSet(exerciseIndex, setIndex)}
                    className="p-1 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 flex-grow">
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
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      set.completed ? "bg-green-500 hover:bg-green-600" : "bg-gray-700 hover:bg-gray-600"
                    )}
                  >
                    <Check size={16} className="text-white" />
                  </button>
                </div>
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