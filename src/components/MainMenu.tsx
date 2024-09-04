import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { auth } from '../lib/firebase'

export function MainMenu() {
  const pathname = usePathname()
  const { user } = useAuth()

  const menuItems = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/workout/log', label: 'Log Workout' },
    { href: '/progress', label: 'Progress' },
  ]

  const handleLogout = async () => {
    try {
      await auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg p-4 rounded-xl shadow-xl mb-6 flex justify-between items-center">
      <ul className="flex space-x-4">
        {menuItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`text-white hover:text-gray-200 transition-colors ${
                pathname === item.href ? 'font-bold' : ''
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      {user && (
        <button
          onClick={handleLogout}
          className="text-white hover:text-gray-200 transition-colors"
        >
          Logout
        </button>
      )}
    </nav>
  )
}