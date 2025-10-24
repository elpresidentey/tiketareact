import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../store/authStore'
import { loginSchema, LoginFormData } from '../schemas/validation'
import { notifyOperation } from '../utils/notifications'
import { ErrorDisplay } from './ErrorDisplay'
import { InlineSpinner } from './LoadingSpinner'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToSignup?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  onSwitchToSignup 
}) => {
  const { login, isLoading, error, clearError } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur'
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError()
      const success = await login(data)
      
      if (success) {
        notifyOperation.loginSuccess()
        reset()
        onSuccess?.()
      } else {
        notifyOperation.loginError(error || undefined)
      }
    } catch (err) {
      notifyOperation.loginError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Sign In
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Email Field */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address <span className="text-red-500" aria-label="required">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              autoComplete="email"
              required
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`input-field ${
                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p id="email-error" className="mt-2 text-sm text-red-600" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password <span className="text-red-500" aria-label="required">*</span>
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              autoComplete="current-password"
              required
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={`input-field ${
                errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p id="password-error" className="mt-2 text-sm text-red-600" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Global Error Display */}
          {error && (
            <ErrorDisplay 
              error={error} 
              variant="inline"
              onDismiss={clearError}
            />
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="btn-primary w-full"
            aria-describedby={isLoading || isSubmitting ? 'signin-status' : undefined}
          >
            {isLoading || isSubmitting ? (
              <span className="flex items-center justify-center" id="signin-status">
                <InlineSpinner size="sm" color="white" />
                <span className="ml-2">Signing In...</span>
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Switch to Signup */}
        {onSwitchToSignup && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="link-primary font-medium"
                aria-label="Switch to sign up form"
              >
                Sign up here
              </button>
            </p>
          </div>
        )}

        {/* Demo Credentials */}
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600 mb-2 font-medium">Demo Credentials:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>User:</strong> demo@example.com / password123</p>
            <p><strong>Admin:</strong> admin@example.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}