import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { useState } from 'react'
import { Menu, X, Dumbbell, Home, PlusSquare, History, BarChart2, Award, User, LogOut, LogIn } from 'lucide-react'

export function MainMenu() {
  const { user, signIn, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { href: '/feed', label: 'Feed', icon: Home },
    { href: '/workout/log', label: 'New Quest', icon: PlusSquare },
    { href: '/history', label: 'History', icon: History },
    { href: '/stats', label: 'Stats', icon: BarChart2 },
    { href: '/achievements', label: 'Achievements', icon: Award },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="bg-gray-800 rounded-xl shadow-lg mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-2xl font-extrabold">
              <div className="h-8 w-8 mr-2 flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-600 rounded">
                <Dumbbell className="h-6 w-6 text-gray-800" />
              </div>
              <span className="hidden md:inline text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">GymGa.me</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium relative group"
                >
                  <item.icon className="h-6 w-6" />
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-10 bg-gray-700 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.label}
                  </span>
                </Link>
              ))}
              {user ? (
                <button
                  onClick={signOut}
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium relative group"
                  aria-label="Sign Out"
                >
                  <LogOut className="h-6 w-6" />
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-10 bg-gray-700 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Sign Out
                  </span>
                </button>
              ) : (
                <button
                  onClick={signIn}
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium relative group"
                  aria-label="Sign In"
                >
                  <LogIn className="h-6 w-6" />
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-10 bg-gray-700 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Sign In
                  </span>
                </button>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">{isMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
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
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={signOut}
                className="text-gray-300 hover:bg-gray-700 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            ) : (
              <button
                onClick={signIn}
                className="text-gray-300 hover:bg-gray-700 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}