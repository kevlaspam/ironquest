import { useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import { Send } from 'lucide-react'

type Comment = {
  userId: string
  userName: string
  content: string
  createdAt: Timestamp
}

type CommentSectionProps = {
  postId: string
  comments: Comment[]
  onComment: (postId: string, comment: string) => void
}

export function CommentSection({ postId, comments, onComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      onComment(postId, newComment)
      setNewComment('')
    }
  }

  return (
    <div>
      <div className="mb-4 max-h-40 overflow-y-auto">
        {comments.map((comment, index) => (
          <div key={index} className="mb-2">
            <p className="text-sm">
              <span className="font-semibold text-yellow-500">{comment.userName}</span>
              <span className="text-gray-400 ml-2">
                {new Date(comment.createdAt.seconds * 1000).toLocaleString()}
              </span>
            </p>
            <p className="text-white">{comment.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          id={`comment-input-${postId}`}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-grow p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <button
          type="submit"
          className="bg-yellow-500 text-gray-900 p-2 rounded-lg hover:bg-yellow-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50"
          aria-label="Post comment"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}