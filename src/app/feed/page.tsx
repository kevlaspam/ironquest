'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  deleteDoc, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  getDoc,
  where,
  setDoc,
  Timestamp,
  FieldValue
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { MainMenu } from '../../components/MainMenu'
import { Dumbbell, Trash2, Send, Heart, MessageCircle, AlertCircle } from 'lucide-react'
import { WorkoutCard } from '../../components/WorkoutCard'
import { CommentSection } from '../../components/CommentSection'
import { Toast } from '../../components/Toast'
import { formatDistanceToNow } from 'date-fns'
import { ErrorMessage } from '../../components/ErrorMessage'
import { LoadingSpinner } from '../../components/LoadingSpinner'

type Workout = {
  id: string
  name: string
  date: Timestamp
  exercises: { name: string; sets: { reps: number; weight: number }[] }[]
  duration: number
}

type Comment = {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: Timestamp | FieldValue
  likes: string[]
}

type Post = {
  id: string
  content: string
  userId: string
  userName: string
  createdAt: Timestamp | FieldValue | null
  likes: string[]
  comments: Comment[]
  workoutId?: string
  workout?: Workout
  mood?: string
  userProfileEmoji: string
}

type UserProfile = {
  username: string
  name: string
  profileEmoji: string
}

const moodOptions = [
  { emoji: "💪", text: "Feeling pumped!" },
  { emoji: "😓", text: "Didn't want to workout today" },
  { emoji: "🔥", text: "Crushed it!" },
  { emoji: "😊", text: "Feeling sore but satisfied" },
  { emoji: "🎉", text: "New personal best!" },
  { emoji: "😕", text: "Need more motivation" },
  { emoji: "😴", text: "Rest day vibes" },
  { emoji: "🦁", text: "Ready to conquer" },
  { emoji: "🚀", text: "Post-workout high" },
  { emoji: "💯", text: "Struggling but pushing through" }
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchPosts = useCallback(async () => {
    if (!user || !db) return

    try {
      const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50))
      const postsSnapshot = await getDocs(postsQuery)
      const postsData = await Promise.all(postsSnapshot.docs.map(async (document) => {
        const postData = document.data() as Post
        postData.id = document.id
        
        postData.likes = postData.likes || []
        postData.comments = postData.comments || []
        
        const userProfileDoc = await getDoc(doc(db, 'userProfiles', postData.userId))
        if (userProfileDoc.exists()) {
          const userProfileData = userProfileDoc.data() as UserProfile
          postData.userName = userProfileData.username
          postData.userProfileEmoji = userProfileData.profileEmoji
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
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError('Failed to fetch posts. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!db || !user) return

    const fetchUserProfile = async () => {
      const profileDoc = await getDoc(doc(db, 'userProfiles', user.uid))
      if (profileDoc.exists()) {
        setUserProfile(profileDoc.data() as UserProfile)
      } else {
        const defaultProfile: UserProfile = {
          username: user.displayName?.replace(/\s+/g, '').toLowerCase() || 'user',
          name: user.displayName || 'Anonymous',
          profileEmoji: '💪'
        }
        await setDoc(doc(db, 'userProfiles', user.uid), defaultProfile)
        setUserProfile(defaultProfile)
      }
    }

    fetchUserProfile()
    fetchPosts()

    const workoutsQuery = query(collection(db, 'workouts'), where('userId', '==', user.uid), orderBy('date', 'desc'), limit(10))
    getDocs(workoutsQuery).then((querySnapshot) => {
      const workoutsData = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          date: data.date as Timestamp
        }
      }) as Workout[]
      setWorkouts(workoutsData)
    })
  }, [user, fetchPosts])

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newPost.trim()) return

    try {
      const postData: Omit<Post, 'id'> = {
        content: newPost.trim(),
        userId: user.uid,
        userName: userProfile?.username || 'Anonymous',
        createdAt: serverTimestamp(),
        likes: [],
        comments: [],
        userProfileEmoji: userProfile?.profileEmoji || '💪'
      }

      if (selectedMood) {
        postData.mood = selectedMood
      }

      const postRef = await addDoc(collection(db, 'posts'), postData)

      if (selectedWorkout) {
        const workoutDoc = await getDoc(doc(db, 'workouts', selectedWorkout))
        if (workoutDoc.exists()) {
          const workoutData = workoutDoc.data() as Workout
          await setDoc(doc(db, 'posts', postRef.id, 'workouts', selectedWorkout), workoutData)
          await updateDoc(postRef, { workoutId: selectedWorkout })
        }
      }

      setNewPost('')
      setSelectedWorkout(null)
      setPreviewWorkout(null)
      setSelectedMood(null)
      setToast({ message: 'Post created successfully!', type: 'success' })
      fetchPosts()
    } catch (err) {
      console.error('Error adding post:', err)
      setToast({ message: 'Failed to create post. Please try again.', type: 'error' })
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!user) return

    try {
      await deleteDoc(doc(db, 'posts', postId))
      setToast({ message: 'Post deleted successfully!', type: 'success' })
      fetchPosts()
    } catch (err) {
      console.error('Error deleting post:', err)
      setToast({ message: 'Failed to delete post. Please try again.', type: 'error' })
    }
  }

  const handleLikePost = async (postId: string) => {
    if (!user) return

    try {
      const postRef = doc(db, 'posts', postId)
      const postDoc = await getDoc(postRef)
      
      if (postDoc.exists()) {
        const postData = postDoc.data() as Post
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
        fetchPosts()
      }
    } catch (err) {
      console.error('Error updating like:', err)
      setToast({ message: 'Failed to update like. Please try again.', type: 'error' })
    }
  }

  const handleAddComment = async (postId: string, commentContent: string) => {
    if (!user || !commentContent.trim()) return
  
    try {
      console.log('Adding comment:', { postId, commentContent, user })
      const postRef = doc(db, 'posts', postId)
      
      // First, get the current post data
      const postDoc = await getDoc(postRef)
      if (!postDoc.exists()) {
        throw new Error("Post not found")
      }
      
      const postData = postDoc.data() as Post
      const newComment: Comment = {
        id: crypto.randomUUID(),
        userId: user.uid,
        userName: userProfile?.username || 'Anonymous',
        content: commentContent.trim(),
        createdAt: Timestamp.now(), // Use client-side timestamp
        likes: []
      }
      console.log('New comment object:', newComment)
  
      // Add the new comment to the existing comments array
      const updatedComments = [...(postData.comments || []), newComment]
  
      // Update the post with the new comments array
      await updateDoc(postRef, {
        comments: updatedComments
      })
  
      console.log('Comment added successfully')
      setToast({ message: 'Comment added successfully!', type: 'success' })
      fetchPosts()
    } catch (err) {
      console.error('Error adding comment:', err)
      console.error('Error details:', JSON.stringify(err, null, 2))
      setToast({ 
        message: `Failed to add comment: ${err instanceof Error ? err.message : 'Unknown error'}`, 
        type: 'error' 
      })
    }
  }

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!user) return

    try {
      const postRef = doc(db, 'posts', postId)
      const postDoc = await getDoc(postRef)

      if (postDoc.exists()) {
        const postData = postDoc.data() as Post
        const updatedComments = postData.comments.filter(comment => comment.id !== commentId)

        await updateDoc(postRef, {
          comments: updatedComments
        })

        console.log('Comment deleted successfully')
        setToast({ message: 'Comment deleted successfully!', type: 'success' })
        fetchPosts()
      }
    } catch (err) {
      console.error('Error deleting comment:', err)
      setToast({ message: `Failed to delete comment: ${err.message}`, type: 'error' })
    }
  }

  const handleLikeComment = async (postId: string, commentId: string) => {
    if (!user) return

    try {
      const postRef = doc(db, 'posts', postId)
      const postDoc = await getDoc(postRef)
      
      if (postDoc.exists()) {
        const postData = postDoc.data() as Post
        const updatedComments = postData.comments.map(comment => {
          if (comment.id === commentId) {
            const likes = comment.likes || []
            if (likes.includes(user.uid)) {
              return { ...comment, likes: likes.filter(id => id !== user.uid) }
            } else {
              return { ...comment, likes: [...likes, user.uid] }
            }
          }
          return comment
        })

        await updateDoc(postRef, { comments: updatedComments })
        fetchPosts()
      }
    } catch (err) {
      console.error('Error updating comment like:', err)
      setToast({ message: 'Failed to update comment like. Please try again.', type: 'error' })
    }
  }

  const handleWorkoutSelect = (workoutId: string) => {
    setSelectedWorkout(workoutId)
    const selectedWorkout = workouts.find(w => w.id === workoutId)
    setPreviewWorkout(selectedWorkout || null)
  }

  if (!user) {
    return <div className="text-center mt-10 text-white">Please sign in to view the feed.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MainMenu />
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center animate-float">Social Feed 💬</h1>
      
      {loading && <LoadingSpinner />}

      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <>
          <div className="mb-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg p-6 border-2 border-yellow-500">
            <form onSubmit={handlePostSubmit}>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your workout or fitness thoughts..."
                className="w-full p-3 mb-4 bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 rounded-lg resize-none"
                rows={3}
              />
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <select
                  value={selectedWorkout || ''}
                  onChange={(e) => handleWorkoutSelect(e.target.value)}
                  className="w-full sm:w-1/2 p-2 bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 rounded-lg"
                >
                  <option value="">Select workout</option>
                  {workouts.map((workout) => (
                    <option key={workout.id} value={workout.id}>
                      {workout.name} - {workout.date.toDate().toLocaleDateString()}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedMood || ''}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  className="w-full sm:w-1/2 p-2 bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 rounded-lg"
                >
                  <option value="">Select mood</option>
                  {moodOptions.map((mood) => (
                    <option key={mood.emoji} value={mood.emoji}>
                      {mood.emoji} {mood.text}
                    </option>
                  ))}
                </select>
              </div>
              {previewWorkout && (
                <div className="mb-4">
                  <WorkoutCard workout={previewWorkout} />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {selectedWorkout && <Dumbbell className="text-yellow-500" />}
                  {selectedMood && <span className="text-2xl">{selectedMood}</span>}
                </div>
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-2 rounded-full transition-colors duration-200 flex items-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Post
                </button>
              </div>
            </form>
          </div>
          
          <div className="space-y-8">
            {posts.map((post) => (
              <div key={post.id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg p-6 border-2 border-yellow-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-2xl">
                      {post.userProfileEmoji}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-400">@{post.userName}</h3>
                      <p className="text-sm text-gray-400">
                        {post.createdAt && 'toDate' in post.createdAt
                          ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })
                          : 'Just now'}
                      </p>
                    </div>
                  </div>
                  {post.userId === user.uid && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-500 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <p className="text-white mb-4">{post.content}</p>
                {post.mood && (
                  <span className="inline-block bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold mr-2 mb-4">
                    {post.mood} {moodOptions.find(m => m.emoji === post.mood)?.text}
                  </span>
                )}
                {post.workout && (
                  <div className="mb-4">
                    <WorkoutCard workout={post.workout} />
                  </div>
                )}
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center space-x-2 ${
                      post.likes?.includes(user.uid) ? 'text-red-500' : 'text-gray-400'
                    } hover:text-red-500 transition-colors duration-200`}
                  >
                    <Heart className="w-6 h-6" />
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <MessageCircle className="w-6 h-6" />
                    <span>{post.comments?.length || 0}</span>
                  </div>
                </div>
                <CommentSection
                  postId={post.id}
                  comments={post.comments || []}
                  onComment={(postId, comment) => handleAddComment(postId, comment)}
                  onLike={handleLikeComment}
                  onDelete={handleDeleteComment}
                  currentUserId={user.uid}
                />
              </div>
            ))}
          </div>
        </>
      )}
      
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}