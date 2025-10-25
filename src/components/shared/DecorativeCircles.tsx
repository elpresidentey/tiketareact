import React from 'react'

interface DecorativeCirclesProps {
  variant?: 'hero' | 'section'
  className?: string
}

const DecorativeCircles: React.FC<DecorativeCirclesProps> = ({ 
  variant = 'hero', 
  className = '' 
}) => {
  if (variant === 'hero') {
    return (
      <>
        {/* Hero Section Decorative Circles */}
        <img 
          src="./assets/decorative-circle-1.svg" 
          alt="" 
          className={`decorative-circle w-32 sm:w-64 h-32 sm:h-64 top-10 -right-16 sm:-right-32 z-5 ${className}`} 
          aria-hidden="true"
        />
        <img 
          src="./assets/decorative-circle-2.svg" 
          alt="" 
          className={`decorative-circle w-16 sm:w-32 h-16 sm:h-32 top-40 -left-8 sm:-left-16 z-5 ${className}`} 
          aria-hidden="true"
        />
        <img 
          src="./assets/decorative-circle-3.svg" 
          alt="" 
          className={`decorative-circle w-24 sm:w-48 h-24 sm:h-48 bottom-20 right-10 sm:right-20 z-5 ${className}`} 
          aria-hidden="true"
        />
        <img 
          src="./assets/decorative-circle-4.svg" 
          alt="" 
          className={`decorative-circle w-20 sm:w-40 h-20 sm:h-40 top-1/3 left-1/4 z-5 ${className}`} 
          aria-hidden="true"
        />
        <img 
          src="./assets/decorative-circle-5.svg" 
          alt="" 
          className={`decorative-circle w-12 sm:w-24 h-12 sm:h-24 bottom-1/3 left-10 sm:left-20 z-5 ${className}`} 
          aria-hidden="true"
        />
      </>
    )
  }

  // Section variant with fewer, smaller circles
  return (
    <>
      <img 
        src="./assets/decorative-circle-2.svg" 
        alt="" 
        className={`decorative-circle w-16 h-16 top-10 right-10 z-5 ${className}`} 
        aria-hidden="true"
      />
      <img 
        src="./assets/decorative-circle-5.svg" 
        alt="" 
        className={`decorative-circle w-12 h-12 bottom-10 left-10 z-5 ${className}`} 
        aria-hidden="true"
      />
    </>
  )
}

export default DecorativeCircles