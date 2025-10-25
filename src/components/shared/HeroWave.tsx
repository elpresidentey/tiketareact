import React from 'react'

interface HeroWaveProps {
  className?: string
}

const HeroWave: React.FC<HeroWaveProps> = ({ className = "w-full h-auto" }) => {
  return (
    <div className="wave-background" aria-hidden="true">
      <img 
        src="./assets/hero-wave.svg" 
        alt="" 
        className={className}
        role="presentation"
      />
    </div>
  )
}

export default HeroWave