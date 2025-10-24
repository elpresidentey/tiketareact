import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion, animateNumber, easingFunctions } from '../utils/performanceOptimization'

/**
 * Hook for managing entrance animations
 */
export const useEntranceAnimation = (delay: number = 0) => {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setIsVisible(true)
      return
    }

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return {
    ref: elementRef,
    isVisible,
    className: isVisible ? 'fade-in' : 'opacity-0',
  }
}

/**
 * Hook for staggered list animations
 */
export const useStaggeredAnimation = (itemCount: number, staggerDelay: number = 100) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (prefersReducedMotion()) {
      setVisibleItems(new Set(Array.from({ length: itemCount }, (_, i) => i)))
      return
    }

    const timers: NodeJS.Timeout[] = []

    for (let i = 0; i < itemCount; i++) {
      const timer = setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, i]))
      }, i * staggerDelay)
      timers.push(timer)
    }

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [itemCount, staggerDelay])

  const getItemClassName = (index: number) => {
    if (prefersReducedMotion()) return ''
    return visibleItems.has(index) ? 'slide-up' : 'opacity-0 translate-y-4'
  }

  return { getItemClassName, visibleItems }
}

/**
 * Hook for intersection observer animations
 */
export const useIntersectionAnimation = (options: IntersectionObserverInit = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    if (prefersReducedMotion()) {
      setIsIntersecting(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          observer.unobserve(element)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  return {
    ref: elementRef,
    isIntersecting,
    className: isIntersecting ? 'fade-in' : 'opacity-0',
  }
}

/**
 * Hook for animated counters
 */
export const useAnimatedCounter = (
  end: number,
  duration: number = 1000,
  start: number = 0,
  trigger: boolean = true
) => {
  const [count, setCount] = useState(start)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!trigger) return

    if (prefersReducedMotion()) {
      setCount(end)
      return
    }

    const element = elementRef.current
    if (!element) return

    animateNumber(element, start, end, duration, easingFunctions.easeOut)
    setCount(end)
  }, [end, duration, start, trigger])

  return {
    ref: elementRef,
    count,
  }
}

/**
 * Hook for hover animations
 */
export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => setIsHovered(false)

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return {
    ref: elementRef,
    isHovered,
    className: isHovered ? 'scale-105 shadow-lg' : 'scale-100',
  }
}

/**
 * Hook for focus animations
 */
export const useFocusAnimation = () => {
  const [isFocused, setIsFocused] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleFocus = () => setIsFocused(true)
    const handleBlur = () => setIsFocused(false)

    element.addEventListener('focus', handleFocus)
    element.addEventListener('blur', handleBlur)

    return () => {
      element.removeEventListener('focus', handleFocus)
      element.removeEventListener('blur', handleBlur)
    }
  }, [])

  return {
    ref: elementRef,
    isFocused,
    className: isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : '',
  }
}

/**
 * Hook for scroll-triggered animations
 */
export const useScrollAnimation = (threshold: number = 0.1) => {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    if (prefersReducedMotion()) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold])

  return {
    ref: elementRef,
    isVisible,
    className: isVisible ? 'animate-fade-in' : 'opacity-0',
  }
}

/**
 * Hook for loading state animations
 */
export const useLoadingAnimation = (isLoading: boolean) => {
  const [showSkeleton, setShowSkeleton] = useState(isLoading)

  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true)
    } else {
      // Delay hiding skeleton to prevent flash
      const timer = setTimeout(() => {
        setShowSkeleton(false)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  return {
    showSkeleton,
    contentClassName: showSkeleton ? 'opacity-0' : 'opacity-100 transition-opacity duration-300',
    skeletonClassName: showSkeleton ? 'opacity-100' : 'opacity-0 transition-opacity duration-300',
  }
}

/**
 * Hook for micro-interactions on buttons
 */
export const useButtonAnimation = () => {
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const elementRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleMouseDown = () => setIsPressed(true)
    const handleMouseUp = () => setIsPressed(false)
    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => {
      setIsHovered(false)
      setIsPressed(false)
    }

    element.addEventListener('mousedown', handleMouseDown)
    element.addEventListener('mouseup', handleMouseUp)
    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousedown', handleMouseDown)
      element.removeEventListener('mouseup', handleMouseUp)
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  const getClassName = () => {
    if (prefersReducedMotion()) return ''
    
    let className = 'transition-all duration-200'
    
    if (isPressed) {
      className += ' scale-95'
    } else if (isHovered) {
      className += ' scale-105 shadow-lg'
    }
    
    return className
  }

  return {
    ref: elementRef,
    isPressed,
    isHovered,
    className: getClassName(),
  }
}

/**
 * Hook for ripple effect animation
 */
export const useRippleEffect = () => {
  const elementRef = useRef<HTMLElement>(null)

  const createRipple = (event: React.MouseEvent) => {
    const element = elementRef.current
    if (!element || prefersReducedMotion()) return

    const rect = element.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    const ripple = document.createElement('span')
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
    `

    element.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  }

  return {
    ref: elementRef,
    onMouseDown: createRipple,
  }
}