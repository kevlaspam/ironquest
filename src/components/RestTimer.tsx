'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Play, Pause, RotateCcw, Clock, Plus, Minus, Volume2, VolumeX, Minimize2, Maximize2 } from 'lucide-react'
import { useWorkout } from './WorkoutContext'

const presetTimes = [
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '1.5m', value: 90 },
  { label: '2m', value: 120 },
  { label: '2.5m', value: 150 },
  { label: '3m', value: 180 },
]

export const RestTimer: React.FC = () => {
  const {
    restTimer,
    setRestTimer,
    isRestTimerRunning,
    setIsRestTimerRunning,
    restDuration,
    setRestDuration
  } = useWorkout()

  const [isMuted, setIsMuted] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRestTimerRunning && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prevTimer) => {
          if (prevTimer > 0) {
            return prevTimer - 1
          } else {
            setIsRestTimerRunning(false)
            if (!isMuted && audioRef.current) {
              audioRef.current.play()
            }
            return 0
          }
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRestTimerRunning, restTimer, setRestTimer, setIsRestTimerRunning, isMuted])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const startRestTimer = () => {
    if (restTimer === 0) {
      setRestTimer(restDuration)
    }
    setIsRestTimerRunning(true)
  }

  const resetTimer = () => {
    setRestTimer(restDuration)
    setIsRestTimerRunning(false)
  }

  const handlePresetClick = (value: number) => {
    setRestDuration(value)
    setRestTimer(value)
    setIsRestTimerRunning(false)
  }

  const adjustTime = (amount: number) => {
    setRestTimer((prevTimer) => Math.max(0, prevTimer + amount))
    setRestDuration((prevDuration) => Math.max(0, prevDuration + amount))
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <div 
      className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg border-4 border-yellow-500 sticky top-4 z-10 transition-all duration-300 ease-in-out ${
        isMinimized ? 'p-2' : 'p-4'
      }`}
      onClick={() => isMinimized && toggleMinimize()}
    >
      {isMinimized ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-lg font-bold text-yellow-500">{formatTime(restTimer)}</span>
          </div>
          <div className="flex items-center space-x-2">
            {isRestTimerRunning ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRestTimerRunning(false);
                }} 
                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <Pause size={16} />
              </button>
            ) : (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  startRestTimer();
                }} 
                className="bg-green-500 text-white p-1 rounded-full hover:bg-green-600 transition-colors"
              >
                <Play size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-500" />
              Rest Timer
            </h3>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-yellow-500">{formatTime(restTimer)}</p>
              <button
                onClick={toggleMinimize}
                className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <Minimize2 size={16} className="text-white" />
              </button>
            </div>
          </div>
          <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(restTimer / restDuration) * 100}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {presetTimes.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                className={`px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                  restDuration === preset.value
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => adjustTime(-5)} 
              className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-colors"
            >
              <Minus size={20} />
            </button>
            {isRestTimerRunning ? (
              <button 
                onClick={() => setIsRestTimerRunning(false)} 
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <Pause size={20} />
              </button>
            ) : (
              <button 
                onClick={startRestTimer} 
                className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
              >
                <Play size={20} />
              </button>
            )}
            <button 
              onClick={resetTimer} 
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              <RotateCcw size={20} />
            </button>
            <button 
              onClick={() => adjustTime(5)} 
              className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-colors"
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={toggleMute} 
              className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-colors"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>
      )}
      <audio ref={audioRef} src="/ding.mp3" />
    </div>
  )
}