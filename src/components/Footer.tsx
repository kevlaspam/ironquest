import React from 'react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          💪 Level up your fitness journey
        </p>
        <p className="text-xs mt-2">
          Built by <Link href="https://x.com/kevindgtl" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">@kevindgtl</Link>
        </p>
      </div>
    </footer>
  )
}