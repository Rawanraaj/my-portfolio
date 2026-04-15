import { useState, useEffect, useRef, useCallback } from 'react'

const navCards = [
  {
    id: 'about',
    title: 'About Me',
    label: 'DISCOVER',
    desc: 'My journey & passion for design',
    icon: 'person',
    accent: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
    accentVar: '#8b5cf6',
  },
  {
    id: 'projects',
    title: 'Projects',
    label: 'EXPLORE',
    desc: 'Creative work & experiments',
    icon: 'dashboard',
    accent: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    accentVar: '#ec4899',
  },
  {
    id: 'skills',
    title: 'Skills',
    label: 'DISCOVER',
    desc: 'Tech stack & capabilities',
    icon: 'code',
    accent: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    accentVar: '#3b82f6',
  },
  {
    id: 'experience',
    title: 'Experience',
    label: 'VIEW',
    desc: 'Professional milestones',
    icon: 'work',
    accent: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    accentVar: '#f59e0b',
  },
  {
    id: 'contact',
    title: 'Contact',
    label: 'CONNECT',
    desc: "Let's build together",
    icon: 'mail',
    accent: 'linear-gradient(135deg, #10b981, #3b82f6)',
    accentVar: '#10b981',
  },
]

function useTypewriter(words, typingSpeed = 80, deletingSpeed = 40, pauseTime = 1800) {
  const [text, setText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentWord = words[wordIndex]
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (text.length < currentWord.length) {
          setText(currentWord.slice(0, text.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime)
        }
      } else {
        if (text.length > 0) {
          setText(text.slice(0, -1))
        } else {
          setIsDeleting(false)
          setWordIndex((prev) => (prev + 1) % words.length)
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed)
    return () => clearTimeout(timer)
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseTime])

  return text
}

export default function Hero() {
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartRotation, setDragStartRotation] = useState(0)
  const autoSpeedRef = useRef(0.12)
  const animFrameRef = useRef(null)
  const rotationRef = useRef(0)
  const velocityRef = useRef(0)
  const isDraggingRef = useRef(false)
  const containerRef = useRef(null)
  const lastTimeRef = useRef(0)

  const typedText = useTypewriter([
    'Frontend Developer',
    'Creative Designer',
    'BCS Student',
    'Problem Solver',
  ])

  const totalCards = navCards.length
  const angleStep = 360 / totalCards
  const radius = 260

  useEffect(() => {
    const animate = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current) > 0.05) {
          rotationRef.current += velocityRef.current
          velocityRef.current *= 0.97
        } else {
          velocityRef.current = 0
          rotationRef.current += autoSpeedRef.current
        }
        setRotation(rotationRef.current)
      }
      lastTimeRef.current = timestamp
      animFrameRef.current = requestAnimationFrame(animate)
    }
    animFrameRef.current = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(animFrameRef.current); lastTimeRef.current = 0 }
  }, [])

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    isDraggingRef.current = true
    setIsDragging(true)
    setDragStartX(e.clientX)
    setDragStartRotation(rotationRef.current)
    velocityRef.current = 0
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - dragStartX
    rotationRef.current = dragStartRotation + dx * 0.3
    setRotation(rotationRef.current)
    velocityRef.current = dx * 0.01
  }, [dragStartX, dragStartRotation])

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback((e) => {
    isDraggingRef.current = true
    setIsDragging(true)
    setDragStartX(e.touches[0].clientX)
    setDragStartRotation(rotationRef.current)
    velocityRef.current = 0
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!isDraggingRef.current) return
    const dx = e.touches[0].clientX - dragStartX
    rotationRef.current = dragStartRotation + dx * 0.3
    setRotation(rotationRef.current)
    velocityRef.current = dx * 0.01
  }, [dragStartX, dragStartRotation])

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <section className="hero" id="home">
      <div className="hero-layout">
        {/* Left — Text Content */}
        <div className="hero-content reveal">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Available for work
          </div>

          <p className="hero-greeting">// hello world, I'm</p>
          <h1 className="hero-name">
            <span className="hero-name-gradient"> Aalok Niroula </span>
          </h1>

          <div className="hero-role">
            <span className="bracket">{'<'}</span>
            <span className="typed">{typedText}</span>
            <span className="bracket">{'/>'}</span>
            <span className="cursor-blink" />
          </div>

          <p className="hero-desc">
            An student who always had a learning attitude.
            I am a quick learner and can pick up new skills very quickly.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => scrollTo('projects')}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                arrow_forward
              </span>
              View My Work
            </button>
            <button className="btn-outline" onClick={() => scrollTo('contact')}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                mail
              </span>
              Get In Touch
            </button>
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat">
              <span className="hero-stat-value">1+</span>
              <span className="hero-stat-label"> Years Experience </span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">2+</span>
              <span className="hero-stat-label"> Projects Built </span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">BCS</span>
              <span className="hero-stat-label"> IIMS College </span>
            </div>
          </div>
        </div>

        {/* Right — 3D Carousel */}
        <div className="carousel-wrap">
          <div
            ref={containerRef}
            className={`carousel-container carousel-fadein ${isDragging ? 'dragging' : ''}`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="carousel-scene"
              style={{ transform: `rotateY(${rotation}deg)` }}
            >
              {navCards.map((card, i) => {
                const angle = i * angleStep
                return (
                  <div
                    key={card.id}
                    className="carousel-card"
                    onClick={() => scrollTo(card.id)}
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                      '--card-accent': card.accentVar,
                    }}
                  >
                    <div>
                      <div className="card-icon-wrap" style={{ background: card.accent }}>
                        <span className="material-symbols-outlined">{card.icon}</span>
                      </div>
                      <span className="card-label">{card.label}</span>
                      <h3 className="card-title">{card.title}</h3>
                    </div>
                    <div>
                      <p className="card-desc">{card.desc}</p>
                      <div className="card-arrow">
                        Explore
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="carousel-hint">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>swipe</span>
              Drag to spin
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator reveal delay-5">
        <div className="scroll-line" />
        <span className="scroll-text">scroll</span>
      </div>
    </section>
  )
}
