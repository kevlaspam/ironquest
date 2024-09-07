'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Percent } from 'lucide-react'

type BodyFatTrackingCardProps = {
  bodyFatHistory: BodyFatEntry[]
  newBodyFat: number | ''
  setNewBodyFat: (value: number | '') => void
  handleAddBodyFat: () => void
}

export const BodyFatTrackingCard: React.FC<BodyFatTrackingCardProps> = ({
  bodyFatHistory,
  newBodyFat,
  setNewBodyFat,
  handleAddBodyFat
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border-4 border-yellow-500">
      <h2 className="text-2xl font-bold mb-4 text-white">Body Fat Tracking</h2>
      <div className="flex items-center mb-4">
        <input
          type="number"
          value={newBodyFat}
          onChange={(e) => setNewBodyFat(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="Enter body fat (%)"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-yellow-300 bg-gray-700 text-white mr-2"
        />
        <button
          onClick={handleAddBodyFat}
          className="bg-yellow-500 text-gray-900 py-2 px-4 rounded-full hover:bg-yellow-400 focus:outline-none focus:ring focus:border-yellow-300 transition-colors duration-200 font-bold flex items-center"
        >
          <Percent className="w-5 h-5 mr-2" />
          Log Body Fat
        </button>
      </div>
      {bodyFatHistory && bodyFatHistory.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={bodyFatHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
            <Legend />
            <Line type="monotone" dataKey="bodyFat" stroke="#10B981" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-white text-center">No body fat data available. Start logging your body fat percentage to see the chart!</p>
      )}
    </div>
  )
}