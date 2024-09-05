'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  Timestamp, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  getDoc, 
  where, 
  setDoc 
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { MainMenu } from '../../components/MainMenu'
import { Trash2, Send, Heart, MessageCircle, Smile } from 'lucide-react'
import { WorkoutCard } from '../../components/WorkoutCard'
import { CommentSection } from '../../components/CommentSection'

type Workout = {
  id: string
  name: string
  date: Timestamp
  exercises: { name: string; sets: { reps: number; weight: number }[] }[]
  duration: number
}

type Post = {
  id: string
  content: string
  userId: string
  userName: string
  createdAt: Timestamp | null
  likes?: string[]
  comments?: { userId: string; userName: string; content: string; createdAt: Timestamp }[]
  workoutId?: string
  workout?: Workout
  mood?: string
}

type UserProfile = {
  username: string
  name: string
}

const moodOptions = [
  "Feeling pumped! 💪",
  "Didn't want to workout today 😓",
  "Crushed it! 🔥",
  "Feeling sore but satisfied 😊",
  "New personal best! 🎉",
  "Need more motivation 😕",
  "Rest day vibes 😴",
  "Ready to conquer 🦁",
  "Post-workout high 🚀",
  "Struggling but pushing through 💯"
]

export default function Feed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null)
  const [previewWorkout, setPreviewWorkout] = useState<Workout | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)

  useEffect(() => {
    if (!db || !user) return

    const fetchUserProfile = async () => {
      const profileDoc = await getDoc(doc(db, 'userProfiles', user.uid))
      if (profileDoc.exists()) {
        setUserProfile(profileDoc.data() as UserProfile)
      } else {
        // If profile doesn't exist, create a default one
        const defaultProfile: UserProfile = {
          username: user.displayName?.replace(/\s+/g, '').toLowerCase() || 'user',
          name: user.displayName || 'Anonymous'
        }
        await setDoc(doc(db, 'userProfiles', user.uid), defaultProfile)
        setUserProfile(defaultProfile)
      }
    }

    fetchUserProfile()

    const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50))
    const unsubscribePosts = onSnapshot(postsQuery, async (querySnapshot) => {
      const postsData = await Promise.all(querySnapshot.docs.map(async (document) => {
        const postData = document.data() as Post
        postData.id = document.id
        
        // Fetch the user's profile to get the username
        const userProfileDoc = await getDoc(doc(db, 'userProfiles', postData.userId))
        if (userProfileDoc.exists()) {
          const userProfileData = userProfileDoc.data() as UserProfile
          postData.userName = userProfileData.username
        }
        
        if (postData.workoutId) {
          const workoutDoc = await getDoc(doc(db, 'posts', document.id, 'workouts', postData.workoutId))
          if (workoutDoc.exists()) {
            postData.workout = workoutDoc.data() as Workout
          }
        }
        return postData
      }))
      setPosts(postsData)
      setLoading(false)
    }, (err) => {
      console.error('Error fetching posts:', err)
      setError('Failed to fetch posts. Please try again later.')
      setLoading(false)
    })

    const workoutsQuery = query(collection(db, 'workouts'), where('userId', '==', user.uid), orderBy('date', 'desc'), limit(10))
    const unsubscribeWorkouts = onSnapshot(workoutsQuery, (querySnapshot) => {
      const workoutsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Workout[]
      setWorkouts(workoutsData)
    })

    return () => {
      unsubscribePosts()
      unsubscribeWorkouts()
    }
  }, [user])

  useEffect(() => {
    if (selectedWorkout) {
      const workout = workouts.find(w => w.id === selectedWorkout)
      setPreviewWorkout(workout || null)
    } else {
      setPreviewWorkout(null)
    }
  }, [selectedWorkout, workouts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newPost.trim() || !userProfile) return

    try {
      const postRef = await addDoc(collection(db, 'posts'), {
        content: newPost.trim(),
        userId: user.uid,
        userName: userProfile.username,
        createdAt: serverTimestamp(),
        likes: [],
        comments: [],
        mood: selectedMood
      })

      if (selectedWorkout) {
        const workoutDoc = await getDoc(doc(db, 'workouts', selectedWorkout))
        if (workoutDoc.exists()) {
          await setDoc(doc(db, 'posts', postRef.id, 'workouts', selectedWorkout), workoutDoc.data())
          await updateDoc(postRef, { workoutId: selectedWorkout })
        }
      }

      setNewPost('')
      setSelectedWorkout(null)
      setPreviewWorkout(null)
      setSelectedMood(null)
    } catch (err) {
      console.error('Error adding post:', err)
      setError('Failed to add post. Please try again.')
    }
  }

  const handleDelete = async (postId: string) => {
    if (!user) return

    try {
      await deleteDoc(doc(db, 'posts', postId))
    } catch (err) {
      console.error('Error deleting post:', err)
      setError('Failed to delete post. Please try again.')
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) return

    const postRef = doc(db, 'posts', postId)
    const postSnap = await getDoc(postRef)
    
    if (postSnap.exists()) {
      const postData = postSnap.data() as Post
      const likes = postData.likes || []
      
      if (likes.includes(user.uid)) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid)
        })
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid)
        })
      }
    }
  }

  const handleComment = async (postId: string, comment: string) => {
    if (!user || !comment.trim() || !userProfile) return

    const postRef = doc(db, 'posts', postId)
    await updateDoc(postRef, {
      comments: arrayUnion({
        userId: user.uid,
        userName: userProfile.username,
        content: comment.trim(),
        createdAt: Timestamp.now()
      })
    })
  }

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'Date unknown'
    return new Date(timestamp.seconds * 1000).toLocaleString()
  }

  if (!user) {
    return <div className="text-white text-center mt-10">Please sign in to view the feed.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MainMenu />
      <h1 className="text-4xl font-bold mb-8 text-white text-center">Social Feed</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 bg-gray-800 rounded-xl p-4">
        <div className="flex flex-col space-y-4">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
            rows={3}
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2">
            <select
              value={selectedWorkout || ''}
              onChange={(e) => setSelectedWorkout(e.target.value || null)}
              className="w-full sm:w-auto p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Attach a workout</option>
              {workouts.map((workout) => (
                <option key={workout.id} value={workout.id}>
                  {workout.name} - {formatDate(workout.date)}
                </option>
              ))}
            </select>
            <select
              value={selectedMood || ''}
              onChange={(e) => setSelectedMood(e.target.value || null)}
              className="w-full sm:w-auto p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">How are you feeling?</option>
              {moodOptions.map((mood) => (
                <option key={mood} value={mood}>
                  {mood}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full sm:w-auto bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50 flex items-center justify-center"
            >
              <Send className="w-5 h-5 mr-2" />
              Post
            </button>
          </div>
        </div>
        {previewWorkout && (
          <div className="mt-4 p-4 bg-gray-700 rounded-lg">
            <h4 className="text-white font-semibold mb-2">Workout Preview:</h4>
            <WorkoutCard workout={previewWorkout} />
          </div>
        )}
      </form>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4 bg-gray-800 rounded-xl">{error}</div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border-2 border-yellow-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">@{post.userName}</h3>
                  <p className="text-sm text-gray-400">
                    {formatDate(post.createdAt)}
                  </p>
                </div>
                {user.uid === post.userId && (
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-500 hover:text-red-600 transition-colors duration-200"
                    aria-label="Delete post"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              {post.mood && (
                <div className="mb-2">
                  <span className="inline-block bg-yellow-500 text-gray-900 px-2 py-1 rounded-full text-sm font-semibold">
                    <Smile className="w-4 h-4 inline-block mr-1" />
                    {post.mood}
                  </span>
                </div>
              )}
              <p className="text-white mb-4">{post.content}</p>
              {post.workout && (
                <div className="mb-4">
                  <WorkoutCard workout={post.workout} />
                </div>
              )}
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-1 ${(post.likes || []).includes(user.uid) ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors duration-200`}
                >
                  <Heart className="w-5 h-5" />
                  <span>{post.likes?.length || 0}</span>
                </button>
                <button
                  onClick={() => document.getElementById(`comment-input-${post.id}`)?.focus()}
                  className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.comments?.length || 0}</span>
                </button>
              </div>
              <CommentSection postId={post.id} comments={post.comments || []} onComment={handleComment} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}