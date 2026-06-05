import { useState, useEffect, useRef } from 'react'

// Import background & overlays
import NepalBackground from './components/NepalBackground'
import GestureOverlay from './components/GestureOverlay'

// Import restored components
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Contact from './components/Contact'
import Footer from './components/Footer'


/* ═══════════════════════════════════════════════════════
   CUSTOM CURSOR — Supporting both Mouse & Gesture inputs
   ═══════════════════════════════════════════════════════ */
function CustomCursor() {
  const cursorRef = useRef(null)
  const dotRef = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const cursorPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Mouse movement updates cursor
    const handleMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`
        dotRef.current.style.top = `${e.clientY}px`
      }
    }

    // Set cursor hover state classes on interactive elements
    const handleOver = (e) => {
      if (e.target.closest('button, a, .carousel-card, .glass-card, .nav-link, .nav-cta, .nav-logo, input, textarea, .project-card, .tool-card')) {
        if (cursorRef.current) cursorRef.current.classList.add('hovering')
      }
    }

    const handleOut = () => {
      if (cursorRef.current) cursorRef.current.classList.remove('hovering')
    }

    // Connect hand gesture tracking positions to custom cursor
    window.__setCursorPos = (x, y) => {
      pos.current = { x, y }
      if (dotRef.current) {
        dotRef.current.style.left = `${x}px`
        dotRef.current.style.top = `${y}px`
      }
    }

    // Smooth cursor follow delay animation loop
    const animate = () => {
      cursorPos.current.x += (pos.current.x - cursorPos.current.x) * 0.12
      cursorPos.current.y += (pos.current.y - cursorPos.current.y) * 0.12
      if (cursorRef.current) {
        cursorRef.current.style.left = `${cursorPos.current.x}px`
        cursorRef.current.style.top = `${cursorPos.current.y}px`
      }
      requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    document.addEventListener('mouseover', handleOver, { passive: true })
    document.addEventListener('mouseout', handleOut, { passive: true })
    const animationFrame = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseout', handleOut)
      cancelAnimationFrame(animationFrame)
      window.__setCursorPos = null
    }
  }, [])

  return (
    <>
      <div ref={cursorRef} className="custom-cursor" />
      <div ref={dotRef} className="cursor-dot" />
    </>
  )
}


/* ═══════════════════════════════════════════════════════
   SCROLL & NAVIGATION TRACKING HOOKS
   ═══════════════════════════════════════════════════════ */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    )
    document
      .querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
      .forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function useActiveSection() {
  const [active, setActive] = useState('home')
  useEffect(() => {
    const sections = document.querySelectorAll('.section, .hero')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id || 'home')
        })
      },
      { threshold: 0.3 }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])
  return active
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return progress
}


/* ═══════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════ */
export default function App() {
  const activeSection = useActiveSection()
  useScrollReveal()
  const scrollProgress = useScrollProgress()

  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight) el.classList.add('visible')
      })
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      {/* Custom cursor — desktop only */}
      {typeof window !== 'undefined' && !('ontouchstart' in window) && <CustomCursor />}

      {/* Layer 1: Nepal Video Background & twinkling star canvas overlay */}
      <NepalBackground />

      {/* Scroll Progress bar */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <Navbar activeSection={activeSection} />

      {/* Hero is OUTSIDE any transform wrapper so preserve-3d carousel works */}
      <Hero />

      <main>
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>

      <Footer />

      {/* Hand Gesture controller overlays */}
      <GestureOverlay />
    </div>
  )
}
