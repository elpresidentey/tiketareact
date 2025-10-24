# Ticket Management App

A modern, responsive ticket management application built with React 18, TypeScript, and Tailwind CSS. Features secure authentication, real-time state management, and comprehensive error handling.

## 🌐 Live Demo

**[View Live Application](https://elpresidentey.github.io/tiketareact/)**

Try the app with demo credentials:
- **Email**: `demo@example.com` | **Password**: `password123`
- **Admin**: `admin@example.com` | **Password**: `admin123`

## 🚀 Features

- **Authentication System**: Secure login/signup with session management
- **Ticket Management**: Full CRUD operations for tickets with status tracking
- **Real-time State Management**: Zustand-powered state with LocalStorage persistence
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Comprehensive Testing**: Unit, integration, accessibility, and E2E tests
- **Error Handling**: Robust error boundaries and user feedback
- **Performance Optimized**: Code splitting, lazy loading, and bundle optimization
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

## 🛠️ Tech Stack

### Core Technologies
- **React 18** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework

### State Management & Forms
- **Zustand** - Lightweight state management
- **React Hook Form** - Performant form handling
- **Zod** - Runtime type validation

### Routing & Navigation
- **React Router v7** - Client-side routing with data loading
- **Protected Routes** - Authentication-based route guards

### UI & UX
- **React Hot Toast** - Beautiful notifications
- **Framer Motion** - Smooth animations (via custom hooks)
- **Loading States** - Skeleton screens and spinners

### Testing
- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing utilities
- **Jest Axe** - Accessibility testing
- **jsdom** - DOM environment for testing

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd ticket-management-app

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

## 🎯 Quick Start

### Demo Credentials
The app includes demo accounts for testing:

**Regular User:**
- Email: `demo@example.com`
- Password: `password123`

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123`

### Basic Usage
1. **Landing Page**: Visit the homepage to see the hero section
2. **Authentication**: Click "Login" or "Get Started" to access auth forms
3. **Dashboard**: View ticket statistics and navigate to ticket management
4. **Ticket Management**: Create, edit, delete, and filter tickets
5. **Session Management**: Automatic logout after 24 hours with extension options

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── __tests__/       # Component tests
│   ├── ErrorBoundary.tsx
│   ├── LandingPage.tsx
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   ├── Dashboard.tsx
│   ├── TicketCard.tsx
│   ├── TicketForm.tsx
│   └── index.ts
├── pages/               # Page-level components
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── TicketManagementPage.tsx
├── store/               # Zustand stores
│   ├── __tests__/       # Store tests
│   ├── authStore.ts     # Authentication state
│   └── ticketStore.ts   # Ticket management state
├── hooks/               # Custom React hooks
│   ├── useSession.ts    # Session management
│   ├── useTickets.ts    # Ticket operations
│   └── useNavigation.ts # Route navigation
├── utils/               # Utility functions
│   ├── localStorage.ts  # Storage operations
│   ├── notifications.ts # Toast notifications
│   └── networkSimulation.ts # Mock network delays
├── types/               # TypeScript type definitions
│   └── index.ts
├── schemas/             # Zod validation schemas
│   └── validation.ts
├── constants/           # App constants and errors
│   └── errors.ts
├── contexts/            # React contexts
│   └── AuthContext.tsx
├── config/              # Configuration files
│   └── routes.ts
└── __tests__/           # Integration and E2E tests
    ├── integration/
    ├── accessibility/
    └── e2e/
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run tests with coverage report

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript compiler check
```

## 🧪 Testing

The application includes a comprehensive test suite covering:

### Test Types
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: Feature workflow testing
- **Accessibility Tests**: WCAG compliance validation
- **End-to-End Tests**: Complete user journey testing

### Key Test Files
- `src/components/__tests__/LoginForm.test.tsx` - Authentication form testing
- `src/components/__tests__/TicketCard.test.tsx` - Ticket component testing
- `src/store/__tests__/authStore.test.ts` - Authentication state testing
- `src/store/__tests__/ticketStore.test.ts` - Ticket state testing
- `src/__tests__/integration/` - Integration test suites
- `src/__tests__/accessibility/` - Accessibility compliance tests
- `src/__tests__/e2e/` - End-to-end user journey tests

### Running Specific Tests
```bash
# Run component tests
npm test -- src/components/__tests__/

# Run store tests
npm test -- src/store/__tests__/

# Run integration tests
npm test -- src/__tests__/integration/

# Run accessibility tests
npm test -- src/__tests__/accessibility/
```

## 🏛️ Architecture

### State Management
The application uses **Zustand** for state management with two main stores:

#### Authentication Store (`authStore.ts`)
- User authentication state
- Login/signup operations
- Session token management
- Automatic session validation
- Cross-tab logout synchronization

#### Ticket Store (`ticketStore.ts`)
- Ticket CRUD operations
- LocalStorage persistence
- Error handling and loading states
- Ticket filtering and statistics
- Optimistic updates

### Component Architecture
- **Atomic Design**: Components organized by complexity and reusability
- **Compound Components**: Complex components broken into smaller, focused pieces
- **Custom Hooks**: Business logic extracted into reusable hooks
- **Error Boundaries**: Graceful error handling at component level

### Data Flow
1. **User Actions** → Components
2. **Components** → Custom Hooks
3. **Custom Hooks** → Zustand Stores
4. **Stores** → LocalStorage/API
5. **State Updates** → Component Re-renders

## 🔐 Authentication System

### Features
- **Session-based Authentication**: JWT-like tokens with expiration
- **Automatic Session Management**: 24-hour sessions with extension capability
- **Protected Routes**: Route-level authentication guards
- **Cross-tab Synchronization**: Logout in one tab affects all tabs
- **Session Warnings**: Notifications before session expiry

### Security Measures
- Input validation with Zod schemas
- Secure session token generation
- Automatic session cleanup
- Protection against common vulnerabilities
- Error message sanitization

### Usage Example
```typescript
import { useAuth } from './contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  const handleLogin = async (credentials) => {
    const success = await login(credentials)
    if (success) {
      // Handle successful login
    }
  }
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}!</p>
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
    </div>
  )
}
```

## 🎫 Ticket Management

### Features
- **Full CRUD Operations**: Create, read, update, delete tickets
- **Status Tracking**: Open, In Progress, Closed statuses
- **Priority Levels**: Low, Medium, High priority classification
- **Tag System**: Flexible tagging for organization
- **Search & Filter**: Real-time search and status filtering
- **Responsive Design**: Optimized for all screen sizes

### Data Model
```typescript
interface Ticket {
  id: string
  title: string
  description?: string
  status: 'open' | 'in_progress' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
  assignedTo?: string
  tags: string[]
}
```

### Usage Example
```typescript
import { useTickets } from './hooks/useTickets'

function TicketList() {
  const { tickets, createTicket, updateTicket, deleteTicket, isLoading } = useTickets()
  
  const handleCreateTicket = async (ticketData) => {
    try {
      await createTicket(ticketData)
      // Handle success
    } catch (error) {
      // Handle error
    }
  }
  
  return (
    <div>
      {tickets.map(ticket => (
        <TicketCard 
          key={ticket.id} 
          ticket={ticket}
          onUpdate={updateTicket}
          onDelete={deleteTicket}
        />
      ))}
    </div>
  )
}
```

## 🎨 Styling & Design

### Design System
- **Color Palette**: Modern gradient-based color scheme
- **Typography**: System font stack with proper hierarchy
- **Spacing**: Consistent 8px grid system
- **Shadows**: Layered shadow system for depth
- **Animations**: Subtle transitions and micro-interactions

### Responsive Breakpoints
```css
/* Mobile First Approach */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Accessibility Features
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: WCAG AA compliant contrast ratios
- **Focus Management**: Visible focus indicators
- **Semantic HTML**: Proper HTML structure and landmarks

## 📊 Performance Optimizations

### Build Optimizations
- **Code Splitting**: Route-based and component-based splitting
- **Tree Shaking**: Unused code elimination
- **Bundle Analysis**: Optimized chunk sizes
- **Asset Optimization**: Image and CSS optimization
- **Compression**: Gzip and Brotli compression

### Runtime Optimizations
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtual Scrolling**: For large ticket lists (when implemented)
- **Debounced Search**: Optimized search performance
- **LocalStorage Caching**: Reduced API calls

### Performance Monitoring
```typescript
// Web Vitals tracking (development mode)
import { trackWebVitals } from './utils/performanceOptimization'

if (import.meta.env.DEV) {
  trackWebVitals()
}
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Development
VITE_APP_TITLE=Ticket Management App
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_MOCK_API=true

# Production
VITE_API_BASE_URL=https://api.yourapp.com
VITE_ENABLE_MOCK_API=false
```

### Tailwind Configuration
The app uses Tailwind CSS 4 with custom configuration in `tailwind.config.js`:

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { /* Custom color palette */ },
        secondary: { /* Custom color palette */ }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  }
}
```

### Vite Configuration
Optimized build configuration in `vite.config.ts`:
- Code splitting strategies
- Asset optimization
- Development server settings
- Test environment setup

## 🚀 Deployment

### Build for Production
```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

### Deployment Options

#### Static Hosting (Recommended)
- **Vercel**: Zero-config deployment
- **Netlify**: Continuous deployment from Git
- **GitHub Pages**: Free hosting for public repos
- **AWS S3 + CloudFront**: Scalable static hosting

#### Docker Deployment
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🐛 Troubleshooting

### Common Issues

#### LocalStorage Issues
```typescript
// Check if LocalStorage is available
import { isLocalStorageAvailable } from './utils/localStorage'

if (!isLocalStorageAvailable()) {
  console.warn('LocalStorage is not available')
  // Fallback to in-memory storage
}
```

#### Authentication Problems
- Clear browser storage: `localStorage.clear()`
- Check network tab for API errors
- Verify demo credentials are correct
- Ensure session hasn't expired

#### Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Debug Mode
Enable debug logging in development:
```typescript
// Add to localStorage in browser console
localStorage.setItem('debug', 'ticket-app:*')
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with React rules
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Standardized commit messages
- **Test Coverage**: Maintain >80% coverage

### Pull Request Guidelines
- Include tests for new features
- Update documentation as needed
- Ensure all tests pass
- Follow existing code patterns
- Add meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Vite Team** - For the lightning-fast build tool
- **Tailwind CSS** - For the utility-first CSS framework
- **Zustand** - For the simple state management solution
- **Testing Library** - For the excellent testing utilities

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the test documentation in `src/__tests__/README.md`

---

**Built with ❤️ using React, TypeScript, and modern web technologies.**