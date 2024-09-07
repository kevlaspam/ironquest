'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type WeightEntry = {
  date: string
  weight: number
}

type WeightTrackingCardProps = {
  weightHistory: WeightEntry[]
  newWeight: number | ''
  setNewWeight: (value: number | '') => void
  handleAddWeight: () => void
}

export const WeightTrackingCard: React.FC<WeightTrackingCardProps> = ({
  weightHistory,
  newWeight,
  setNewWeight,
  handleAddWeight
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 mb-8 border-4 border-yellow-500">
      <h2 className="text-2xl font-bold mb-4 text-white">Weight Tracking</h2>
      <div className="flex items-center mb-4">
        <input
          type="number"
          value={newWeight}
          onChange={(e) => setNewWeight(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="Enter weight (kg)"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-yellow-300 bg-gray-700 text-white mr-2"
        />
        <button
          onClick={handleAddWeight}
          className="bg-yellow-500 text-gray-900 py-2 px-4 rounded-full hover:bg-yellow-400 focus:outline-none focus:ring focus:border-yellow-300 transition-colors duration-200 font-bold"
        >
          Log Weight
        </button>
      </div>
      {weightHistory && weightHistory.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weightHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
            <Legend />
            <Line type="monotone" dataKey="weight" stroke="#EAB308" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-white text-center">No weight data available. Start logging your weight to see the chart!</p>
      )}
    </div>
  )
}