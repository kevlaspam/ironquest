import React, { useState } from 'react'
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth, isSameDay, subMonths, addMonths } from 'date-fns'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type WorkoutCalendarProps = {
  workoutDates: Date[]
}

export function WorkoutCalendar({ workoutDates }: WorkoutCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getIntensity = (date: Date) => {
    const count = workoutDates.filter(workoutDate => isSameDay(workoutDate, date)).length
    if (count === 0) return 'bg-gray-800'
    if (count === 1) return 'bg-yellow-700'
    if (count === 2) return 'bg-yellow-600'
    return 'bg-yellow-500'
  }

  const renderMonth = (month: Date) => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const startDate = startOfWeek(monthStart)
    const endDate = startOfWeek(addDays(monthEnd, 7))

    const rows = []
    let days = []
    let day = startDate

    while (day < endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day
        days.push(
          <motion.div
            key={day.toString()}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              !isSameMonth(day, monthStart)
                ? 'opacity-30'
                : isSameDay(day, new Date())
                ? 'ring-2 ring-yellow-500'
                : ''
            } ${getIntensity(cloneDay)}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            title={`${format(cloneDay, 'MMM d, yyyy')}: ${
              workoutDates.filter(workoutDate => isSameDay(workoutDate, cloneDay)).length
            } workouts`}
          >
            {isSameMonth(day, monthStart) && (
              <span className="text-xs font-medium text-white">{format(day, 'd')}</span>
            )}
          </motion.div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="flex justify-between">
          {days}
        </div>
      )
      days = []
    }
    return rows
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-yellow-500">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={prevMonth}
            className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft size={20} className="text-yellow-500" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <ChevronRight size={20} className="text-yellow-500" />
          </button>
        </div>
      </div>
      <div className="mb-4">
        <div className="grid grid-cols-7 gap-2 text-center mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="text-yellow-500 text-xs font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {renderMonth(currentMonth)}
        </div>
      </div>
      <div className="mt-4 flex justify-center items-center space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-700 mr-2"></div>
          <span className="text-xs text-yellow-500">1 workout</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-600 mr-2"></div>
          <span className="text-xs text-yellow-500">2 workouts</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <span className="text-xs text-yellow-500">3+ workouts</span>
        </div>
      </div>
    </div>
  )
}