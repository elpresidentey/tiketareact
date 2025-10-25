import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'
import Footer from './Footer'

type AuthMode = 'login' | 'signup'

interface AuthPageProps {
  initialMode?: AuthMode
  redirectTo?: string
}

export const AuthPage: React.FC<AuthPageProps> = ({ 
  initialMode = 'login',
  redirectTo = '/dashboard'
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const { isAuthenticated } = useAuthStore()

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const handleAuthSuccess = () => {
    // Navigation will be handled by the redirect above
    // since isAuthenticated will become true
  }

  const switchToLogin = () => setMode('login')
  const switchToSignup = () => setMode('signup')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="max-w-app mx-auto w-full">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ticket Manager
          </h1>
          <p className="text-gray-600">
            {mode === 'login' 
              ? 'Welcome back! Please sign in to your account.' 
              : 'Create your account to get started.'
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {mode === 'login' ? (
          <LoginForm 
            onSuccess={handleAuthSuccess}
            onSwitchToSignup={switchToSignup}
          />
        ) : (
          <SignupForm 
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={switchToLogin}
          />
        )}
      </div>

          {/* Back to Home Link */}
          <div className="mt-8 text-center">
            <a 
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}