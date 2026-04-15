import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Contact from './components/Contact'
import Footer from './components/Footer'


/* ═══════════════════════════════════════════════════════
   INTERACTIVE PARTICLE CONSTELLATION CANVAS
   Particles float, connect with lines, react to mouse
   ═══════════════════════════════════════════════════════ */
function ParticleConstellation() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const particlesRef = useRef([])
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      initParticles()
    }

    const PARTICLE_COUNT = Math.min(Math.floor((width * height) / 12000), 120)
    const CONNECTION_DIST = 150
    const MOUSE_RADIUS = 200
    const MOUSE_PUSH = 0.8

    const colors = [
      'rgba(139, 92, 246, ',   // violet
      'rgba(59, 130, 246, ',    // blue
      'rgba(236, 72, 153, ',    // pink
      'rgba(245, 158, 11, ',    // amber
      'rgba(16, 185, 129, ',    // emerald
    ]

    function initParticles() {
      particlesRef.current = []
      const count = Math.min(Math.floor((width * height) / 12000), 120)
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          baseAlpha: Math.random() * 0.5 + 0.2,
          pulseSpeed: Math.random() * 0.02 + 0.005,
          pulsePhase: Math.random() * Math.PI * 2,
        })
      }
    }

    function animate(time) {
      ctx.clearRect(0, 0, width, height)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const particles = particlesRef.current

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Mouse interaction — push particles away gently
        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * MOUSE_PUSH
          p.vx += (dx / dist) * force * 0.3
          p.vy += (dy / dist) * force * 0.3
        }

        // Apply velocity with damping
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.99
        p.vy *= 0.99

        // Wrap around edges
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10

        // Pulsing alpha
        const pulse = Math.sin(time * p.pulseSpeed + p.pulsePhase) * 0.3 + 0.7
        const alpha = p.baseAlpha * pulse

        // Draw particle with glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color + alpha + ')'
        ctx.fill()

        // Outer glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2)
        ctx.fillStyle = p.color + (alpha * 0.15) + ')'
        ctx.fill()
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }

        // Mouse connections — lines from nearby particles to cursor
        const mdx = particles[i].x - mx
        const mdy = particles[i].y - my
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy)

        if (mdist < MOUSE_RADIUS * 1.2) {
          const alpha = (1 - mdist / (MOUSE_RADIUS * 1.2)) * 0.3
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(mx, my)
          ctx.strokeStyle = `rgba(236, 72, 153, ${alpha})`
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    resize()
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}


/* ═══════════════════════════════════════════════════════
   AURORA GRADIENT BACKGROUND — Animated blobs that
   shift and morph, creating a living aurora effect
   ═══════════════════════════════════════════════════════ */
function AuroraBackground() {
  return (
    <div className="bg-layer" aria-hidden="true">
      <div className="aurora-wrap">
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
        <div className="aurora aurora-3" />
        <div className="aurora aurora-4" />
      </div>
      <div className="floating-shapes">
        {[
          { cls: 'shape-cube', top: '8%', left: '5%' },
          { cls: 'shape-circle', top: '15%', left: '88%' },
          { cls: 'shape-diamond', top: '35%', left: '10%' },
          { cls: 'shape-ring', top: '50%', left: '92%' },
          { cls: 'shape-tri', top: '65%', left: '6%' },
          { cls: 'shape-cube', top: '75%', left: '82%' },
          { cls: 'shape-circle', top: '85%', left: '18%' },
          { cls: 'shape-diamond', top: '22%', left: '55%' },
        ].map((s, i) => (
          <div key={i} className={`shape ${s.cls}`} style={{ top: s.top, left: s.left }} />
        ))}
      </div>
      <div className="noise-overlay" />
    </div>
  )
}


/* ═══════════════════════════════════════════════════════
   CUSTOM CURSOR
   ═══════════════════════════════════════════════════════ */
function CustomCursor() {
  const cursorRef = useRef(null)
  const dotRef = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const cursorPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`
        dotRef.current.style.top = `${e.clientY}px`
      }
    }

    const handleOver = (e) => {
      if (e.target.closest('button, a, .carousel-card, .glass-card, .nav-link, .nav-cta, .nav-logo, input, textarea, .project-card, .tool-card')) {
        if (cursorRef.current) cursorRef.current.classList.add('hovering')
      }
    }

    const handleOut = () => {
      if (cursorRef.current) cursorRef.current.classList.remove('hovering')
    }

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
    requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseout', handleOut)
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
   HOOKS
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

function useMouseParallax() {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  useEffect(() => {
    let raf
    const handleMouseMove = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        setOffset({
          x: (e.clientX / window.innerWidth - 0.5) * 2,
          y: (e.clientY / window.innerHeight - 0.5) * 2,
        })
      })
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => { window.removeEventListener('mousemove', handleMouseMove); cancelAnimationFrame(raf) }
  }, [])
  return offset
}


/* ═══════════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════════ */
function App() {
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
    <>
      <CustomCursor />

      {/* Layer 1: Animated Aurora Gradients */}
      <AuroraBackground />

      {/* Layer 2: Interactive Particle Constellation */}
      <ParticleConstellation />

      {/* Scroll Progress */}
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
    </>
  )
}

export default App
