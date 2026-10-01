import React, { lazy, Suspense, useState, useEffect } from 'react'

const Hero3DCanvas = lazy(() => import('./Hero3DCanvas'))

function isWebGLAvailable() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!(window.WebGLRenderingContext && ctx)
  } catch {
    return false
  }
}

class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

function StaticFallback({ activeColor }) {
  return (
    <div
      className="hero-3d-fallback"
      style={{
        '--fallback-color': activeColor,
      }}
      aria-hidden="true"
    />
  )
}

export default function Hero3DBackground({ activeColor = '#8b5cf6' }) {
  const [shouldRender3D, setShouldRender3D] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Check reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(motionQuery.matches)

    const handleMotionChange = (e) => setReducedMotion(e.matches)
    motionQuery.addEventListener('change', handleMotionChange)

    // Only skip 3D WebGL if WebGL is unavailable or device is strictly low-power (<= 2 cores)
    const webglOk = isWebGLAvailable()
    const cores = navigator.hardwareConcurrency || 4
    const memory = navigator.deviceMemory
    const isVeryLowEnd = cores <= 2 || (memory && memory < 2)

    if (webglOk && !isVeryLowEnd) {
      setShouldRender3D(true)
    } else {
      setShouldRender3D(false)
    }

    return () => motionQuery.removeEventListener('change', handleMotionChange)
  }, [])

  if (!isMounted) {
    return (
      <div className="hero-3d-container">
        <StaticFallback activeColor={activeColor} />
      </div>
    )
  }

  return (
    <div className="hero-3d-container" aria-hidden="true">
      {shouldRender3D ? (
        <CanvasErrorBoundary fallback={<StaticFallback activeColor={activeColor} />}>
          <Suspense fallback={<StaticFallback activeColor={activeColor} />}>
            <Hero3DCanvas activeColor={activeColor} reducedMotion={reducedMotion} />
          </Suspense>
        </CanvasErrorBoundary>
      ) : (
        <StaticFallback activeColor={activeColor} />
      )}
    </div>
  )
}
