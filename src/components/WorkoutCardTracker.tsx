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
  Chest: [
    'Barbell Bench Press', 'Incline Dumbbell Press', 'Decline Bench Press', 'Chest Dips', 'Push-Ups',
    'Cable Flyes', 'Pec Deck Machine', 'Landmine Press', 'Smith Machine Bench Press', 'Dumbbell Flyes',
    'Svend Press', 'Resistance Band Chest Press', 'Machine Chest Press', 'Single Arm Dumbbell Bench Press',
    'Incline Cable Flyes', 'Decline Dumbbell Press', 'Cable Chest Press', 'Push-Up with Feet Elevated',
    'Bench Dips', 'Flat Bench Dumbbell Press', 'Incline Bench Barbell Press', 'Incline Bench Dumbbell Press',
    'Decline Bench Barbell Press', 'Decline Bench Dumbbell Press', 'Chest Fly Machine'
  ],
  Back: [
    'Lat Pulldown', 'Seated Cable Row', 'Bent Over Barbell Row', 'T-Bar Row', 'Pull-Ups', 'Chin-Ups',
    'Face Pulls', 'Straight Arm Pulldown', 'Single-Arm Dumbbell Row', 'Pendlay Row', 'Meadows Row',
    'Inverted Row', 'Good Mornings', 'Iso Machine Row', '1 Arm Cable Rear Delt Pull', 'Wide Grip Pull-Up',
    'Reverse Grip Barbell Row', 'Cable Row with V-Bar', 'Kettlebell Swings', 'Barbell Shrugs',
    'Single Arm Lat Pulldown', 'Chest Supported Row', 'Wide Grip Lat Pulldown', 'Single Arm T-Bar Row',
    'Reverse Fly Machine'
  ],
  Shoulders: [
    'Overhead Barbell Press', 'Dumbbell Shoulder Press', 'Arnold Press', 'Lateral Raises', 'Front Raises',
    'Reverse Flyes', 'Upright Rows', 'Shrugs', 'Pike Push-Ups', 'Landmine Press', 'Cable Face Pulls',
    'Barbell High Pulls', 'Machine Shoulder Press', 'Cable Lateral Raises', 'Face Pulls', 'Dumbbell Rear Delt Fly',
    'Barbell Behind the Neck Press', 'Cable Rear Delt Fly', 'Dumbbell Shrugs', 'Front Plate Raises',
    'Dumbbell Lateral Raises', 'Single Arm Overhead Press', 'Seated Dumbbell Press', 'Reverse Pec Deck Machine'
  ],
  Biceps: [
    'Barbell Curl', 'Dumbbell Curl', 'Hammer Curls', 'Preacher Curls', 'Concentration Curls', 'Cable Curls',
    'Incline Dumbbell Curls', 'Spider Curls', 'Zottman Curls', 'Reverse Curls', 'Chin-Ups', 'EZ-Bar Curls',
    'High Curl', 'Cable Hammer Curl', 'Drag Curl', 'Barbell Preacher Curl', 'Seated Alternating Curl',
    'Incline Hammer Curl', 'Cross-Body Hammer Curl', 'Dumbbell Curl with Supination', 'Cable Bicep Curl', 
    'Cable Concentration Curl', 'Single Arm Dumbbell Curl', 'Machine Bicep Curl'
  ],
  Triceps: [
    'Tricep Pushdowns', 'Overhead Tricep Extension', 'Skull Crushers', 'Close-Grip Bench Press', 'Diamond Push-Ups',
    'Tricep Dips', 'Cable Tricep Kickbacks', 'JM Press', 'Tate Press', 'Board Press', 'Rolling Tricep Extensions',
    'Tricep Kickbacks', 'Tricep Rope Pushdown', 'Single-Arm Overhead Tricep Extension', 'Bench Dips',
    'French Press', 'Dumbbell Tricep Extensions', 'Tricep Dips on Parallel Bars', 'Cable Tricep Extensions',
    'Tricep Dip Machine', 'Overhead Rope Tricep Extension', 'Decline Tricep Extension', 'Single Arm Tricep Pushdown'
  ],
  Legs: [
    'Barbell Back Squat', 'Front Squat', 'Leg Press', 'Romanian Deadlift', 'Lunges', 'Leg Extensions', 'Leg Curls',
    'Calf Raises', 'Hip Thrusts', 'Bulgarian Split Squats', 'Hack Squat', 'Goblet Squat', 'Step-Ups',
    'Nordic Hamstring Curls', 'Sissy Squats', 'Single-Leg Deadlift', 'Cable Kickbacks', 'Leg Press Calf Raises',
    'Standing Calf Raises', 'Smith Machine Squats', 'Barbell Hip Thrust', 'Machine Hip Thrust', 'Seated Leg Press',
    'Hip Abduction Machine', 'Hip Adduction Machine', 'Walking Lunges', 'Box Squats'
  ],
  Abs: [
    'Crunches', 'Planks', 'Russian Twists', 'Leg Raises', 'Ab Wheel Rollouts', 'Hanging Leg Raises',
    'Cable Crunches', 'Mountain Climbers', 'Dragon Flags', 'Hollow Body Hold', 'L-Sit', 'Windshield Wipers',
    'Bicycle Crunches', 'Reverse Crunches', 'Toe Touches', 'Plank with Shoulder Tap', 'Hanging Knee Raises',
    'V-Ups', 'Side Plank with Hip Dip', 'Cable Side Bends', 'Flutter Kicks', 'Medicine Ball Russian Twists'
  ],
  Compound: [
    'Deadlifts', 'Power Cleans', 'Barbell Rows', 'Dumbbell Thrusters', 'Clean and Jerk', 'Snatch',
    'Kettlebell Swings', 'Turkish Get-Ups', 'Farmers Walks', 'Sled Pushes/Pulls', 'Bench Press',
    'Overhead Squats', 'Front Squats', 'Weighted Pull-Ups', 'Push Press', 'Medicine Ball Clean',
    'Single-Leg Deadlifts', 'Battling Ropes', 'Barbell Hip Thrusts', 'Incline Bench Press',
    'Barbell Shrugs', 'Dumbbell Bench Press', 'Chest Supported Dumbbell Rows', 'Cable Deadlifts'
  ],
  Machines: [
    'Chest Press Machine', 'Shoulder Press Machine', 'Leg Press Machine', 'Seated Leg Curl Machine',
    'Lat Pulldown Machine', 'Seated Row Machine', 'Pec Deck Machine', 'Tricep Pushdown Machine',
    'Hack Squat Machine', 'Smith Machine', 'Assisted Pull-Up Machine', 'Iso Machine Row', 'Cable Machine',
    'Leg Extension Machine', 'Standing Calf Raise Machine', 'Abduction Machine', 'Adduction Machine',
    'Seated Calf Raise Machine', 'Overhead Shoulder Press Machine', 'Decline Chest Press Machine',
    'Ab Crunch Machine', 'Reverse Leg Press Machine'
  ],
  Bodyweight: [
    'Push-Ups', 'Pull-Ups', 'Dips', 'Squats', 'Lunges', 'Burpees', 'Mountain Climbers', 'Plank',
    'Side Plank', 'Glute Bridges', 'Step-Ups', 'Handstand Push-Ups', 'Pistol Squats', 'Muscle-Ups',
    'Dragon Flags', 'Archer Push-Ups', 'Bodyweight Rows', 'Clapping Push-Ups', 'Dive Bomber Push-Ups',
    'Single-Leg Glute Bridges', 'Sphinx Push-Ups', 'Inverted Rows', 'Commando Plank', 'Spider Man Plank'
  ],
  Cable: [
    'Cable Crossovers', 'Cable Woodchoppers', 'Cable Crunches', 'Cable Lateral Raises', 'Cable Face Pulls',
    'Cable Tricep Pushdowns', 'Cable Bicep Curls', 'Cable Pull-Throughs', 'Cable Upright Rows', 'Cable Rotations',
    'Cable Rear Delt Flyes', 'Cable Single Arm Row', 'Cable Shrugs', 'Cable Standing Ab Twist', 'Cable Side Lateral Raises',
    'Cable Overhead Tricep Extension', 'Cable Front Raises', 'Cable Hip Abductions', 'Cable High Rows',
    'Cable Curl to Press', 'Cable Rotational Woodchopper', 'Cable Kickbacks', 'Cable Single Arm Lat Pulldown'
  ],
  Calisthenics: [
    'Muscle-Ups', 'Front Lever', 'Back Lever', 'Planche', 'Human Flag', 'Handstand', 'L-Sit',
    'Pistol Squat', 'One-Arm Push-Up', 'One-Arm Pull-Up', 'Dragon Flag', 'Straddle Planche',
    'Wide Grip Pull-Up', 'Handstand Push-Ups', 'Tuck Planche', 'Clapping Pull-Ups', 'Archers Push-Ups',
    'Kipping Pull-Ups', 'Front Lever Pull-Ups', 'One-Legged Squats', 'One Arm L-Sit Pull-Up', 'L-Sit Chin-Up'
  ],
  Plyometrics: [
    'Box Jumps', 'Depth Jumps', 'Burpees', 'Jump Squats', 'Clap Push-Ups', 'Jumping Lunges', 'Tuck Jumps',
    'Broad Jumps', 'Plyo Push-Ups', 'Medicine Ball Slams', 'Single-Leg Box Jumps', 'Lateral Box Jumps',
    'Explosive Step-Ups', 'Depth Drops', 'Jumping Jacks', 'Skater Jumps', 'Kangaroo Jumps', 'High Knees',
    'Split Squat Jumps', 'Bounding',     'Plyometric Push-Ups', 'Seated Box Jumps', 'Medicine Ball Chest Passes'
  ]
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