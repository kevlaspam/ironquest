import { useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import { Send, Heart, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type Comment = {
  userId: string
  userName: string
  content: string
  createdAt: Timestamp
  likes?: string[]
}

type CommentSectionProps = {
  postId: string
  comments: Comment[]
  onComment: (postId: string, comment: string) => void
  onLike: (postId: string, commentIndex: number) => void
  currentUserId: string
}

export function CommentSection({ postId, comments, onComment, onLike, currentUserId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [expanded, setExpanded] = useState(false)
  const visibleComments = expanded ? comments : comments.slice(0, 2)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      onComment(postId, newComment)
      setNewComment('')
    }
  }

  return (
    <div className="mt-4">
      <div className="space-y-3">
        {visibleComments.map((comment, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-3 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white-500">@{comment.userName}</span>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), { addSuffix: true })}
                </span>
              </div>
              <button
                onClick={() => onLike(postId, index)}
                className={`flex items-center space-x-1 ${(comment.likes || []).includes(currentUserId) ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors duration-200`}
              >
                <Heart className={`w-4 h-4 ${(comment.likes || []).includes(currentUserId) ? 'fill-current' : ''}`} />
                <span className="text-xs">{comment.likes?.length || 0}</span>
              </button>
            </div>
            <p className="text-white text-sm mt-1">{comment.content}</p>
          </div>
        ))}
      </div>
      {comments.length > 2 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-yellow-500 hover:text-yellow-400 transition-colors duration-200 flex items-center mt-2 text-sm"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Hide comments
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              See more comments
            </>
          )}
        </button>
      )}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          id={`comment-input-${postId}`}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-grow p-2 rounded-lg bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
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