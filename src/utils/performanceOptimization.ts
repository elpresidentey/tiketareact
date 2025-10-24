/**
 * Performance optimization utilities for better perceived performance
 */

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  }

  return new IntersectionObserver(callback, defaultOptions)
}

// Debounce function for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Preload images for better perceived performance
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

// Preload multiple images
export const preloadImages = (srcs: string[]): Promise<void[]> => {
  return Promise.all(srcs.map(preloadImage))
}

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Animate number counting for statistics
export const animateNumber = (
  element: HTMLElement,
  start: number,
  end: number,
  duration: number = 1000,
  easing: (t: number) => number = (t) => t
): void => {
  if (prefersReducedMotion()) {
    element.textContent = end.toString()
    return
  }

  const startTime = performance.now()
  const difference = end - start

  const updateNumber = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easing(progress)
    const current = Math.round(start + difference * easedProgress)

    element.textContent = current.toString()

    if (progress < 1) {
      requestAnimationFrame(updateNumber)
    }
  }

  requestAnimationFrame(updateNumber)
}

// Easing functions
export const easingFunctions = {
  easeInOut: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOut: (t: number): number => t * (2 - t),
  easeIn: (t: number): number => t * t,
  bounce: (t: number): number => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    }
  },
}

// Virtual scrolling helper for large lists
export class VirtualScrollManager {
  private itemHeight: number
  private visibleCount: number
  private totalCount: number
  private scrollTop: number = 0

  constructor(
    _container: HTMLElement,
    itemHeight: number,
    visibleCount: number,
    totalCount: number
  ) {
    this.itemHeight = itemHeight
    this.visibleCount = visibleCount
    this.totalCount = totalCount
  }

  getVisibleRange(): { start: number; end: number } {
    const start = Math.floor(this.scrollTop / this.itemHeight)
    const end = Math.min(start + this.visibleCount, this.totalCount)
    return { start, end }
  }

  updateScrollTop(scrollTop: number): void {
    this.scrollTop = scrollTop
  }

  getTotalHeight(): number {
    return this.totalCount * this.itemHeight
  }

  getOffsetY(): number {
    const { start } = this.getVisibleRange()
    return start * this.itemHeight
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()
  private measures: Map<string, number> = new Map()

  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const startTime = this.marks.get(startMark)
    if (!startTime) {
      console.warn(`Start mark "${startMark}" not found`)
      return 0
    }

    const endTime = endMark ? this.marks.get(endMark) : performance.now()
    if (endMark && !endTime) {
      console.warn(`End mark "${endMark}" not found`)
      return 0
    }

    const duration = (endTime || performance.now()) - startTime
    this.measures.set(name, duration)
    return duration
  }

  getMeasure(name: string): number | undefined {
    return this.measures.get(name)
  }

  clear(): void {
    this.marks.clear()
    this.measures.clear()
  }

  logMeasures(): void {
    console.table(Object.fromEntries(this.measures))
  }
}

// Create a global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Web Vitals tracking (simplified)
export const trackWebVitals = () => {
  // Track Largest Contentful Paint (LCP)
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries()
    const lastEntry = entries[entries.length - 1]
    console.log('LCP:', lastEntry.startTime)
  }).observe({ entryTypes: ['largest-contentful-paint'] })

  // Track First Input Delay (FID)
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries()
    entries.forEach((entry: any) => {
      if (entry.processingStart && entry.startTime) {
        console.log('FID:', entry.processingStart - entry.startTime)
      }
    })
  }).observe({ entryTypes: ['first-input'] })

  // Track Cumulative Layout Shift (CLS)
  let clsValue = 0
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries()
    entries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value
      }
    })
    console.log('CLS:', clsValue)
  }).observe({ entryTypes: ['layout-shift'] })
}

// Resource hints for better loading performance
export const addResourceHints = () => {
  // Preconnect to external domains
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ]

  preconnectDomains.forEach((domain) => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    document.head.appendChild(link)
  })

  // DNS prefetch for external resources
  const dnsPrefetchDomains = [
    'https://cdn.jsdelivr.net',
  ]

  dnsPrefetchDomains.forEach((domain) => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    document.head.appendChild(link)
  })
}