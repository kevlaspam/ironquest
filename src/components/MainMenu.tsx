import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function MainMenu() {
  const { user, signIn, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-gradient-to-r from-purple-800 to-indigo-900 bg-opacity-90 backdrop-filter backdrop-blur-lg shadow-lg mb-8 rounded-lg mx-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white text-2xl font-bold">
              IronQuest 💪
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/dashboard" className="text-white hover:bg-purple-700 hover:bg-opacity-70 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                Dashboard
              </Link>
              <Link href="/workout/log" className="text-white hover:bg-purple-700 hover:bg-opacity-70 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                Log Workout
              </Link>
              <Link href="/progress" className="text-white hover:bg-purple-700 hover:bg-opacity-70 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                Progress
              </Link>
              {user ? (
                <button onClick={signOut} className="text-white hover:bg-purple-700 hover:bg-opacity-70 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                  Sign Out
                </button>
              ) : (
                <button onClick={signIn} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                  Sign In
                </button>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-purple-700 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/dashboard" className="text-white hover:bg-purple-700 hover:bg-opacity-70 block px-3 py-2 rounded-md text-base font-medium">
              Dashboard
            </Link>
            <Link href="/workout/log" className="text-white hover:bg-purple-700 hover:bg-opacity-70 block px-3 py-2 rounded-md text-base font-medium">
              Log Workout
            </Link>
            <Link href="/progress" className="text-white hover:bg-purple-700 hover:bg-opacity-70 block px-3 py-2 rounded-md text-base font-medium">
              Progress
            </Link>
            {user ? (
              <button onClick={signOut} className="text-white hover:bg-purple-700 hover:bg-opacity-70 block w-full text-left px-3 py-2 rounded-md text-base font-medium">
                Sign Out
              </button>
            ) : (
              <button onClick={signIn} className="bg-purple-600 hover:bg-purple-700 text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium">
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}