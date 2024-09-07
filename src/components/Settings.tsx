import React, { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { getUsername, updateUsername } from '../lib/userDataUtils'

export default function Settings() {
  const { user } = useAuth()
  const [username, setUsername] = useState('')
  const [newUsername, setNewUsername] = useState('')

  useEffect(() => {
    if (user) {
      getUsername(user.uid).then(fetchedUsername => {
        if (fetchedUsername) setUsername(fetchedUsername)
      })
    }
  }, [user])

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user && newUsername) {
      await updateUsername(user.uid, newUsername)
      setUsername(newUsername)
      setNewUsername('')
    }
  }

  if (!user) return <div>Please log in to view settings.</div>

  return (
    <div>
      <h1>Settings</h1>
      <p>Current username: {username}</p>
      <form onSubmit={handleUpdateUsername}>
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          placeholder="New username"
        />
        <button type="submit">Update Username</button>
      </form>
    </div>
  )
}