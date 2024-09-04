'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, getAuth } from 'firebase/auth'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const AuthContext = createContext<{ user: User | null; isLoading: boolean }>({ user: null, isLoading: true })

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    if (!getApps().length) {
      try {
        const app = initializeApp(firebaseConfig);
        getFirestore(app); // Initialize Firestore
        console.log("Firebase initialized successfully");
      } catch (error) {
        console.error("Error initializing Firebase:", error);
      }
    }

    const auth = getAuth();

    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  )
}