'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Exercise = {
  name: string
  sets: { reps: number; weight: number; completed: boolean }[]
}

type LastUsedValues = {
  [exerciseName: string]: { reps: number; weight: number }
}

type WorkoutContextType = {
  exercises: Exercise[]
  setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>
  timer: number
  setTimer: React.Dispatch<React.SetStateAction<number>>
  isTimerRunning: boolean
  setIsTimerRunning: React.Dispatch<React.SetStateAction<boolean>>
  workoutStarted: boolean
  setWorkoutStarted: React.Dispatch<React.SetStateAction<boolean>>
  restTimer: number
  setRestTimer: React.Dispatch<React.SetStateAction<number>>
  isRestTimerRunning: boolean
  setIsRestTimerRunning: React.Dispatch<React.SetStateAction<boolean>>
  restDuration: number
  setRestDuration: React.Dispatch<React.SetStateAction<number>>
  currentWorkoutName: string
  setCurrentWorkoutName: React.Dispatch<React.SetStateAction<string>>
  clearWorkout: () => void
  lastUsedValues: LastUsedValues
  updateLastUsedValues: (exerciseName: string, reps: number, weight: number) => void
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined)

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [workoutStarted, setWorkoutStarted] = useState(false)
  const [restTimer, setRestTimer] = useState(0)
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false)
  const [restDuration, setRestDuration] = useState(60)
  const [currentWorkoutName, setCurrentWorkoutName] = useState('')
  const [lastUsedValues, setLastUsedValues] = useState<LastUsedValues>({})

  useEffect(() => {
    const savedWorkout = localStorage.getItem('currentWorkout')
    if (savedWorkout) {
      const parsedWorkout = JSON.parse(savedWorkout)
      setExercises(parsedWorkout.exercises)
      setTimer(parsedWorkout.timer)
      setIsTimerRunning(parsedWorkout.isTimerRunning)
      setWorkoutStarted(parsedWorkout.workoutStarted)
      setRestTimer(parsedWorkout.restTimer)
      setIsRestTimerRunning(parsedWorkout.isRestTimerRunning)
      setRestDuration(parsedWorkout.restDuration)
      setCurrentWorkoutName(parsedWorkout.currentWorkoutName)
    }
    const savedLastUsedValues = localStorage.getItem('lastUsedValues')
    if (savedLastUsedValues) {
      setLastUsedValues(JSON.parse(savedLastUsedValues))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('currentWorkout', JSON.stringify({
      exercises,
      timer,
      isTimerRunning,
      workoutStarted,
      restTimer,
      isRestTimerRunning,
      restDuration,
      currentWorkoutName
    }))
  }, [exercises, timer, isTimerRunning, workoutStarted, restTimer, isRestTimerRunning, restDuration, currentWorkoutName])

  useEffect(() => {
    localStorage.setItem('lastUsedValues', JSON.stringify(lastUsedValues))
  }, [lastUsedValues])

  const clearWorkout = () => {
    setExercises([])
    setTimer(0)
    setIsTimerRunning(false)
    setWorkoutStarted(false)
    setRestTimer(0)
    setIsRestTimerRunning(false)
    setRestDuration(60)
    setCurrentWorkoutName('')
    localStorage.removeItem('currentWorkout')
  }

  const updateLastUsedValues = (exerciseName: string, reps: number, weight: number) => {
    setLastUsedValues(prev => ({
      ...prev,
      [exerciseName]: { reps, weight }
    }))
  }

  return (
    <WorkoutContext.Provider value={{
      exercises,
      setExercises,
      timer,
      setTimer,
      isTimerRunning,
      setIsTimerRunning,
      workoutStarted,
      setWorkoutStarted,
      restTimer,
      setRestTimer,
      isRestTimerRunning,
      setIsRestTimerRunning,
      restDuration,
      setRestDuration,
      currentWorkoutName,
      setCurrentWorkoutName,
      clearWorkout,
      lastUsedValues,
      updateLastUsedValues
    }}>
      {children}
    </WorkoutContext.Provider>
  )
}

export const useWorkout = () => {
  const context = useContext(WorkoutContext)
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider')
  }
  return context
}