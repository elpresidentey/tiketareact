import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { RequireAuth, RequireGuest } from './components/ProtectedRoute'
import { LandingPage, Dashboard } from './components'
import { ErrorBoundary, PageErrorBoundary } from './components/ErrorBoundary'
import { NetworkStatus } from './components/NetworkStatus'
import { ErrorHandlingDemo } from './components/ErrorHandlingDemo'
import { LoadingSpinner } from './components/LoadingSpinner'
import { preloadWithDelay } from './utils/routePreloader'
import { addResourceHints, trackWebVitals } from './utils/performanceOptimization'
import './App.css'

// Lazy load page components for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })))
const SignupPage = lazy(() => import('./pages/SignupPage').then(module => ({ default: module.SignupPage })))
const TicketManagementPage = lazy(() => import('./pages/TicketManagementPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))

// App content component with route guard
const AppContent = () => {
  // Initialize performance optimizations and route preloading
  useEffect(() => {
    // Initialize performance optimizations
    addResourceHints()
    
    // Track web vitals in development
    if (import.meta.env.DEV) {
      trackWebVitals()
    }

    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth'

    // Preload high-priority routes after initial render
    preloadWithDelay('all', 1000)

    // Cleanup on unmount
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="skip-link"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>
      
      {/* Development Tools */}
      <NetworkStatus className="fixed top-4 right-4 z-50" showDetails />
      <ErrorHandlingDemo />
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            color: '#fff',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            duration: 3000,
            style: {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            duration: Infinity,
            style: {
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            },
            iconTheme: {
              primary: '#60a5fa',
              secondary: '#fff',
            },
          },
        }}
      />
      <main id="main-content" role="main" className="flex-1">
        <Routes>
        {/* Public routes */}
        <Route path="/" element={
          <PageErrorBoundary>
            <LandingPage />
          </PageErrorBoundary>
        } />
        
        {/* Auth routes - redirect to dashboard if already authenticated */}
        <Route 
          path="/login" 
          element={
            <PageErrorBoundary>
              <RequireGuest>
                <Suspense fallback={<LoadingSpinner />}>
                  <LoginPage />
                </Suspense>
              </RequireGuest>
            </PageErrorBoundary>
          } 
        />
        <Route 
          path="/auth/login" 
          element={
            <PageErrorBoundary>
              <RequireGuest>
                <Suspense fallback={<LoadingSpinner />}>
                  <LoginPage />
                </Suspense>
              </RequireGuest>
            </PageErrorBoundary>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PageErrorBoundary>
              <RequireGuest>
                <Suspense fallback={<LoadingSpinner />}>
                  <SignupPage />
                </Suspense>
              </RequireGuest>
            </PageErrorBoundary>
          } 
        />
        
        {/* Protected routes - require authentication */}
        <Route 
          path="/dashboard" 
          element={
            <PageErrorBoundary>
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            </PageErrorBoundary>
          } 
        />
        <Route 
          path="/tickets" 
          element={
            <PageErrorBoundary>
              <RequireAuth>
                <Suspense fallback={<LoadingSpinner />}>
                  <TicketManagementPage />
                </Suspense>
              </RequireAuth>
            </PageErrorBoundary>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <PageErrorBoundary>
              <RequireAuth>
                <Suspense fallback={<LoadingSpinner />}>
                  <ReportsPage />
                </Suspense>
              </RequireAuth>
            </PageErrorBoundary>
          } 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App