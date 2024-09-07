import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Minus, Plus, X } from 'lucide-react'

type RepSelectorProps = {
  value: number
  onChange: (value: number) => void
}

const commonReps = [5, 8, 10, 12, 15, 20]

export default function RepSelector({ value, onChange }: RepSelectorProps) {
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
    const newValue = parseInt(e.target.value)
    setSliderValue(newValue)
    onChange(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value)
    if (!isNaN(newValue) && newValue > 0) {
      onChange(newValue)
    }
  }

  const adjustReps = (adjustment: number) => {
    const newValue = Math.max(1, value + adjustment)
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
        {value} reps
        <ChevronDown size={16} />
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-11/12 max-w-sm max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Select Reps</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <h4 className="text-white text-sm font-semibold mb-2">Common Reps</h4>
              <div className="grid grid-cols-3 gap-2">
                {commonReps.map((reps) => (
                  <button
                    key={reps}
                    type="button"
                    onClick={() => {
                      onChange(reps)
                      setIsOpen(false)
                    }}
                    className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-yellow-500 hover:text-gray-900 transition-colors"
                  >
                    {reps}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h4 className="text-white text-sm font-semibold mb-2">Fine Tune</h4>
              <div className="flex items-center bg-gray-700 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => adjustReps(-1)}
                  className="text-white p-2 rounded-l-md hover:bg-gray-600 transition-colors flex-1 flex justify-center items-center"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={value}
                  onChange={handleInputChange}
                  className="bg-gray-800 text-white px-2 py-1 rounded w-20 text-center mx-1"
                  step={1}
                  min={1}
                />
                <button
                  type="button"
                  onClick={() => adjustReps(1)}
                  className="text-white p-2 rounded-r-md hover:bg-gray-600 transition-colors flex-1 flex justify-center items-center"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-2">Adjust Reps</h4>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={sliderValue}
                onChange={handleSliderChange}
                className="w-full appearance-none bg-gray-700 h-2 rounded-full outline-none"
                style={{
                  background: `linear-gradient(to right, #EAB308 0%, #EAB308 ${(sliderValue / 50) * 100}%, #4B5563 ${(sliderValue / 50) * 100}%, #4B5563 100%)`,
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
                <span>1</span>
                <span>25</span>
                <span>50+</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}