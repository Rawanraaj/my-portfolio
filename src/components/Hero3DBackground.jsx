import { lazy, Suspense, useState, useEffect } from 'react'

const Hero3DCanvas = lazy(() => import('./Hero3DCanvas'))

function isWebGLAvailable() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
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
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // 1. Check prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotionQuery.matches) {
      setShouldRender3D(false)
      return
    }

    // 2. Check WebGL availability
    if (!isWebGLAvailable()) {
      setShouldRender3D(false)
      return
    }

    // 3. Check for low-power devices (very low core count or constrained memory)
    const cores = navigator.hardwareConcurrency || 4
    const isVeryLowEnd = cores <= 2 || (navigator.deviceMemory && navigator.deviceMemory < 2)

    if (isVeryLowEnd) {
      setShouldRender3D(false)
      return
    }

    setShouldRender3D(true)
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
        <Suspense fallback={<StaticFallback activeColor={activeColor} />}>
          <Hero3DCanvas activeColor={activeColor} />
        </Suspense>
      ) : (
        <StaticFallback activeColor={activeColor} />
      )}
    </div>
  )
}
