import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Minus, Plus } from 'lucide-react'

type WeightSelectorProps = {
  value: number
  onChange: (value: number) => void
}

const commonWeights = [20, 40, 60, 80, 100, 120]

export default function WeightSelector({ value, onChange }: WeightSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [sliderValue, setSliderValue] = useState(value)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSliderValue(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    setSliderValue(newValue)
    onChange(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    if (!isNaN(newValue) && newValue >= 0) {
      onChange(newValue)
    }
  }

  const adjustWeight = (adjustment: number) => {
    const newValue = Math.max(0, Math.round((value + adjustment) * 2) / 2)
    onChange(newValue)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-700 text-white rounded-lg p-2 w-24 text-center flex items-center justify-between"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {value} kg
        <ChevronDown size={16} />
      </button>
      {isOpen && (
        <div className="absolute z-20 bg-gray-800 p-4 rounded-lg shadow-lg mt-2" style={{ width: '300px' }}>
          <div className="mb-4">
            <h4 className="text-white text-sm font-semibold mb-2">Common Weights (kg)</h4>
            <div className="grid grid-cols-3 gap-2">
              {commonWeights.map((weight) => (
                <button
                  key={weight}
                  type="button"
                  onClick={() => {
                    onChange(weight)
                    setIsOpen(false)
                  }}
                  className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-yellow-500 hover:text-gray-900 transition-colors"
                >
                  {weight}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h4 className="text-white text-sm font-semibold mb-2">Fine Tune</h4>
            <div className="flex items-center bg-gray-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => adjustWeight(-2.5)}
                className="text-white p-2 rounded-l-md hover:bg-gray-600 transition-colors flex-1 flex justify-center items-center"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={value}
                onChange={handleInputChange}
                className="bg-gray-800 text-white px-2 py-1 rounded w-20 text-center mx-1"
                step={2.5}
                min={0}
              />
              <button
                type="button"
                onClick={() => adjustWeight(2.5)}
                className="text-white p-2 rounded-r-md hover:bg-gray-600 transition-colors flex-1 flex justify-center items-center"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-2">Adjust Weight</h4>
            <input
              type="range"
              min={0}
              max={200}
              step={2.5}
              value={sliderValue}
              onChange={handleSliderChange}
              className="w-full appearance-none bg-gray-700 h-2 rounded-full outline-none"
              style={{
                background: `linear-gradient(to right, #EAB308 0%, #EAB308 ${(sliderValue / 200) * 100}%, #4B5563 ${(sliderValue / 200) * 100}%, #4B5563 100%)`,
              }}
            />
            <style jsx>{`
              input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #EAB308;
                cursor: pointer;
              }
              input[type=range]::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #EAB308;
                cursor: pointer;
              }
            `}</style>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span>100</span>
              <span>200+</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}