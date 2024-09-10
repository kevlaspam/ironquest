import React, { useState } from 'react'
import { Send, Heart, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type Comment = {
  id: string // Add this line
  userId: string
  userName: string
  content: string
  createdAt: number | { seconds: number; nanoseconds: number } | Date
  likes?: string[]
}

type CommentSectionProps = {
  postId: string
  comments: Comment[]
  onComment: (postId: string, comment: string) => void
  onLike: (postId: string, commentId: string) => void
  onDelete: (postId: string, commentId: string) => void // Add this line
  currentUserId: string
}

export function CommentSection({ postId, comments, onComment, onLike, onDelete, currentUserId }: CommentSectionProps) {
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

  const formatCommentDate = (createdAt: Comment['createdAt']) => {
    let date: Date;
    if (createdAt instanceof Date) {
      date = createdAt;
    } else if (typeof createdAt === 'number') {
      date = new Date(createdAt);
    } else if (typeof createdAt === 'object' && 'seconds' in createdAt) {
      date = new Date(createdAt.seconds * 1000);
    } else {
      return 'Invalid date';
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  }

  return (
    <div className="mt-4">
      <div className="space-y-3">
        {visibleComments.map((comment) => (
          <div key={comment.id} className="bg-gray-800 rounded-lg p-3 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-400">@{comment.userName}</span>
                <span className="text-xs text-gray-400">
                  {formatCommentDate(comment.createdAt)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onLike(postId, comment.id)}
                  className={`flex items-center space-x-1 ${comment.likes?.includes(currentUserId) ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors duration-200`}
                >
                  <Heart className={`w-4 h-4 ${comment.likes?.includes(currentUserId) ? 'fill-current' : ''}`} />
                  <span className="text-xs">{comment.likes?.length || 0}</span>
                </button>
                {comment.userId === currentUserId && (
                  <button
                    onClick={() => onDelete(postId, comment.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
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
              See {comments.length - 2} more {comments.length - 2 === 1 ? 'comment' : 'comments'}
            </>
          )}
        </button>
      )}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2">
        <input
          type="text"
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