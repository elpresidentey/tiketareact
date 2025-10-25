import { useAuthStore } from '../store/authStore'
import { useTicketStats } from '../hooks/useTickets'
import { useNavigation } from '../hooks/useNavigation'
import { UserProfile } from './shared'
import Footer from './Footer'
// import { preloadOnInteraction } from '../utils/routePreloader'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user, logout } = useAuthStore()
  const { stats, isLoading } = useTicketStats()
  const { goToHome, goToTickets } = useNavigation()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    goToHome()
  }

  const handleNavigateToTickets = () => {
    goToTickets()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b" role="banner">
        <div className="max-w-app mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center h-auto sm:h-16 py-4 sm:py-0 gap-4 sm:gap-0">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Ticket Management Dashboard
              </h1>
            </div>
            {user && <UserProfile user={user} onLogout={handleLogout} />}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-app mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600">
            Here's an overview of your ticket management system.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Tickets */}
          <div className="card card-hover card-interactive fade-in stagger-1 group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-card flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-button">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Total Tickets</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {isLoading ? (
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded shimmer"></div>
                  ) : (
                    <span className="bounce-in">{stats.total}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Open Tickets */}
          <div className="card card-hover card-interactive fade-in stagger-2 group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-card flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-button">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Open Tickets</p>
                <p className="text-3xl font-bold text-orange-600 group-hover:text-orange-700 transition-colors duration-300">
                  {isLoading ? (
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded shimmer"></div>
                  ) : (
                    <span className="bounce-in">{stats.open}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* In Progress Tickets */}
          <div className="card card-hover card-interactive fade-in stagger-3 group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-card flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-button">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-300">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600 group-hover:text-yellow-700 transition-colors duration-300">
                  {isLoading ? (
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded shimmer"></div>
                  ) : (
                    <span className="bounce-in">{stats.inProgress}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Resolved Tickets */}
          <div className="card card-hover card-interactive fade-in stagger-4 group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-card flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-button">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Resolved</p>
                <p className="text-3xl font-bold text-green-600 group-hover:text-green-700 transition-colors duration-300">
                  {isLoading ? (
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded shimmer"></div>
                  ) : (
                    <span className="bounce-in">{stats.resolved}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="card fade-in stagger-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 gradient-text">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Manage Tickets */}
            <button
              onClick={handleNavigateToTickets}
              className="flex items-center p-4 border border-gray-200 rounded-card hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-25 transition-all duration-300 text-left interactive-scale group"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-card flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-button">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">Manage Tickets</h4>
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">View, create, and edit tickets</p>
              </div>
            </button>

            {/* Create New Ticket */}
            <button
              onClick={handleNavigateToTickets}
              className="flex items-center p-4 border border-gray-200 rounded-card hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-25 transition-all duration-300 text-left interactive-scale group"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-card flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-button">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors duration-300">Create New Ticket</h4>
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Add a new ticket to the system</p>
              </div>
            </button>

            {/* View Reports */}
            <button
              onClick={() => toast('Reports feature will be implemented in future tasks', {
                icon: 'ℹ️',
              })}
              className="flex items-center p-4 border border-gray-200 rounded-card hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-25 transition-all duration-300 text-left interactive-scale group"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-card flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-button">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors duration-300">View Reports</h4>
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Analytics and reporting dashboard</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-600">Recent activity tracking will be implemented in future tasks</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Dashboard