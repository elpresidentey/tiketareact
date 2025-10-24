import { defineConfig } from '@tailwindcss/vite'

export default defineConfig({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Enhanced Status Colors with better contrast and gradients
        status: {
          open: {
            DEFAULT: '#059669',
            light: '#10b981',
            dark: '#047857',
            bg: '#ecfdf5',
            border: '#a7f3d0',
          },
          progress: {
            DEFAULT: '#d97706',
            light: '#f59e0b',
            dark: '#b45309',
            bg: '#fffbeb',
            border: '#fde68a',
          },
          closed: {
            DEFAULT: '#4b5563',
            light: '#6b7280',
            dark: '#374151',
            bg: '#f9fafb',
            border: '#d1d5db',
          },
        },
        // Enhanced Primary Colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#3b82f6',
        },
        // Neutral grays with better contrast
        neutral: {
          50: '#fafbfc',
          100: '#f4f6f8',
          200: '#e6eaee',
          300: '#d0d7de',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        'app': '1440px',
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
        'input': '12px',
        'badge': '8px',
      },
      boxShadow: {
        'card': '0 4px 20px 0 rgba(0, 0, 0, 0.08), 0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 40px 0 rgba(0, 0, 0, 0.12), 0 4px 16px 0 rgba(0, 0, 0, 0.08)',
        'button': '0 4px 14px 0 rgba(59, 130, 246, 0.2)',
        'button-hover': '0 8px 25px 0 rgba(59, 130, 246, 0.3)',
        'input': '0 2px 8px 0 rgba(15, 23, 42, 0.04)',
        'input-focus': '0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 16px 0 rgba(59, 130, 246, 0.08)',
        'focus': '0 0 0 3px rgba(59, 130, 246, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      screens: {
        'xs': '475px',
        'max-app': '1440px',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.5' }],
        'lg': ['1.125rem', { lineHeight: '1.5' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
})