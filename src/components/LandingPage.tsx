import { Link } from 'react-router-dom'
import Footer from './Footer'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Navigation */}
      <nav className="relative z-10 px-4 sm:px-6 py-4" role="navigation" aria-label="Main navigation">
        <div className="max-w-app mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">TicketFlow</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/login"
              className="link-primary font-medium px-3 py-2 rounded-md"
              aria-label="Sign in to your account"
            >
              Sign In
            </Link>
            <Link 
              to="/signup"
              className="btn-primary"
              aria-label="Get started with TicketFlow"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative hero-section px-4 sm:px-6 py-12 sm:py-20 overflow-hidden" aria-labelledby="hero-heading">
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(./hero-image.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            filter: 'brightness(0.6) contrast(1.2) saturate(1.1)'
          }}
          role="img"
          aria-label="Hero background showing ticket management workflow"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/80"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
        </div>

        {/* Decorative Circles - Hidden from screen readers */}
        <div className="decorative-circle w-32 sm:w-64 h-32 sm:h-64 bg-white/5 top-10 -right-16 sm:-right-32 z-5" aria-hidden="true"></div>
        <div className="decorative-circle w-16 sm:w-32 h-16 sm:h-32 bg-blue-200/10 top-40 -left-8 sm:-left-16 z-5" aria-hidden="true"></div>
        <div className="decorative-circle w-24 sm:w-48 h-24 sm:h-48 bg-indigo-200/10 bottom-20 right-10 sm:right-20 z-5" aria-hidden="true"></div>
        <div className="decorative-circle w-20 sm:w-40 h-20 sm:h-40 bg-purple-200/8 top-1/3 left-1/4 z-5" aria-hidden="true"></div>
        <div className="decorative-circle w-12 sm:w-24 h-12 sm:h-24 bg-cyan-200/10 bottom-1/3 left-10 sm:left-20 z-5" aria-hidden="true"></div>
        
        <div className="max-w-app mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-black/30 backdrop-blur-md rounded-3xl p-6 sm:p-10 mx-2 sm:mx-4 border border-white/10">
              <h2 id="hero-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight" style={{textShadow: '4px 4px 8px rgba(0,0,0,0.8)'}}>
                Streamline Your
                <span className="text-blue-300 block">Ticket Management</span>
              </h2>
              
              <p className="text-lg sm:text-xl text-gray-100 mb-8 max-w-2xl mx-auto leading-relaxed" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                Organize, track, and resolve tickets efficiently with our intuitive 
                ticket management system. Perfect for teams of any size.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link 
                  to="/signup"
                  className="btn-primary text-white font-semibold px-6 sm:px-10 py-3 sm:py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-2xl hover:shadow-3xl backdrop-blur-sm border border-primary/30 w-full sm:w-auto"
                  aria-label="Get started with TicketFlow for free"
                >
                  Get Started Free
                </Link>
                <Link 
                  to="/login"
                  className="bg-white/90 hover:bg-white text-gray-900 font-semibold px-6 sm:px-10 py-3 sm:py-4 rounded-xl border-2 border-white/40 hover:border-white/60 transition-all duration-200 backdrop-blur-sm shadow-xl w-full sm:w-auto focus:outline-none focus:ring-3 focus:ring-white/50"
                  aria-label="Sign in to your existing account"
                >
                  Sign In
                </Link>
              </div>
              
              <div className="text-sm text-gray-200" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}} role="list" aria-label="Key features">
                <span role="listitem">✨ No credit card required</span> • <span role="listitem">🚀 Setup in minutes</span> • <span role="listitem">📊 Real-time analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* SVG Wave Background */}
        <div className="wave-background" aria-hidden="true">
          <svg 
            viewBox="0 0 1440 320" 
            className="w-full h-auto"
            preserveAspectRatio="none"
            role="presentation"
          >
            <path 
              fill="#ffffff" 
              fillOpacity="1"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,106.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6" aria-labelledby="features-heading">
        <div className="max-w-app mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 id="features-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Everything you need to manage tickets
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you stay organized and productive
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <article className="bg-white text-center p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100" tabIndex={0}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md" aria-hidden="true">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Easy Tracking</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Keep track of all your tickets with intuitive status management and real-time updates.
              </p>
            </article>
            
            <article className="bg-white text-center p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100" tabIndex={0}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md" aria-hidden="true">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Built for speed with instant search, filtering, and responsive design for any device.
              </p>
            </article>
            
            <article className="bg-white text-center p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100" tabIndex={0}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md" aria-hidden="true">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Smart Analytics</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Get insights into your ticket patterns with built-in analytics and reporting features.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default LandingPage