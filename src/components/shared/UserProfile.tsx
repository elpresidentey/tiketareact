import React from 'react'
import { User } from '../../types'

interface UserProfileProps {
  user: User
  onLogout: () => void
  showLogout?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  onLogout, 
  showLogout = true, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: {
      avatar: 'w-6 h-6',
      text: 'text-xs',
      subtext: 'text-xs',
      button: 'px-3 py-1.5 text-xs'
    },
    md: {
      avatar: 'w-8 h-8',
      text: 'text-sm',
      subtext: 'text-xs',
      button: 'px-4 py-2 text-sm'
    },
    lg: {
      avatar: 'w-10 h-10',
      text: 'text-base',
      subtext: 'text-sm',
      button: 'px-5 py-2.5 text-sm'
    }
  }

  const classes = sizeClasses[size]

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`${classes.avatar} bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center`}>
          <span className={`text-blue-600 font-semibold ${classes.text}`}>
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex flex-col">
          <span className={`font-medium text-gray-900 ${classes.text}`}>
            {user?.name}
          </span>
          <span className={`text-gray-500 ${classes.subtext}`}>
            {user?.role === 'admin' ? 'Administrator' : 'User'}
          </span>
        </div>
      </div>
      
      {showLogout && (
        <button
          onClick={onLogout}
          className={`group flex items-center gap-2 ${classes.button} bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 hover:text-red-800 rounded-xl border border-red-200 hover:border-red-300 transition-all duration-200 font-medium shadow-sm hover:shadow-md`}
          aria-label="Sign out of your account"
        >
          <svg 
            className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
          <span className="hidden sm:inline">Sign Out</span>
          <span className="sm:hidden">Logout</span>
        </button>
      )}
    </div>
  )
}

export default UserProfile