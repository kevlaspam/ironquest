import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function MainMenu() {
  const { user, signIn, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/workout/log', label: 'Log Workout' },
    { href: '/progress', label: 'Progress' },
    { href: '/achievements', label: 'Achievements' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <nav className="bg-white rounded-xl shadow-lg mb-8 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-gray-800 text-2xl font-bold">
              IronQuest 💪
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {menuItems.map((item, index) => (
                <div key={item.href} className="flex items-center">
                  {index > 0 && <div className="h-6 w-px bg-gray-300 mx-2"></div>}
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
              <div className="h-6 w-px bg-gray-300 mx-2"></div>
              {user ? (
                <button
                  onClick={signOut}
                  className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={signIn}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
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
        <div className="md:hidden mt-4">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {menuItems.map((item, index) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className="text-gray-600 hover:text-gray-800 block px-3 py-2 rounded-md text-base font-medium"
                >
                  {item.label}
                </Link>
                {index < menuItems.length - 1 && <hr className="border-gray-200 my-1" />}
              </div>
            ))}
            <hr className="border-gray-200 my-1" />
            {user ? (
              <button
                onClick={signOut}
                className="text-gray-600 hover:text-gray-800 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={signIn}
                className="bg-purple-600 hover:bg-purple-700 text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}