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
    let timer
    const currentWord = words[wordIndex]

    if (isDeleting) {
      timer = setTimeout(() => {
        setText(currentWord.substring(0, text.length - 1))
      }, deletingSpeed)
    } else {
      timer = setTimeout(() => {
        setText(currentWord.substring(0, text.length + 1))
      }, typingSpeed)
    }

    if (!isDeleting && text === currentWord) {
      timer = setTimeout(() => setIsDeleting(true), pauseTime)
    } else if (isDeleting && text === '') {
      setIsDeleting(false)
      setWordIndex((prev) => (prev + 1) % words.length)
    }

    return () => clearTimeout(timer)
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseTime])

  return text
}

export default function Hero() {
  const roles = ['Frontend Developer', 'Graphic Designer', 'Video Editor', 'Web Maintainer']
  const typedRole = useTypewriter(roles)

  const [rotY, setRotY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const sceneRef = useRef(null)
  const dragStartRef = useRef(0)
  const rotStartRef = useRef(0)
  const autoSpinRef = useRef(null)

  const radius = 170 // 3D Circle radius for carousel cards positioning

  // Auto spin when not dragging
  const startAutoSpin = useCallback(() => {
    if (autoSpinRef.current) clearInterval(autoSpinRef.current)
    autoSpinRef.current = setInterval(() => {
      setRotY((prev) => prev - 0.2)
    }, 16)
  }, [])

  const stopAutoSpin = useCallback(() => {
    if (autoSpinRef.current) {
      clearInterval(autoSpinRef.current)
      autoSpinRef.current = null;
    }
  }, [])

  useEffect(() => {
    startAutoSpin()
    return () => stopAutoSpin()
  }, [startAutoSpin, stopAutoSpin])

  // Mouse / Touch Dragging controls
  const handleStart = (clientX) => {
    setIsDragging(true)
    stopAutoSpin()
    dragStartRef.current = clientX
    rotStartRef.current = rotY
  }

  const handleMove = (clientX) => {
    if (!isDragging) return
    const deltaX = clientX - dragStartRef.current
    // Factor determines speed of dragging rotation
    const factor = 360 / (window.innerWidth || 1000)
    setRotY(rotStartRef.current + deltaX * factor)
  }

  const handleEnd = () => {
    setIsDragging(false)
    startAutoSpin()
  }

  const onMouseDown = (e) => handleStart(e.clientX)
  const onMouseMove = (e) => handleMove(e.clientX)
  const onMouseUp = handleEnd
  const onMouseLeave = handleEnd

  const onTouchStart = (e) => {
    if (e.touches.length > 0) handleStart(e.touches[0].clientX)
  }
  const onTouchMove = (e) => {
    if (e.touches.length > 0) handleMove(e.touches[0].clientX)
  }
  const onTouchEnd = handleEnd

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero" id="home">
      <div className="hero-layout">
        
        {/* Left Info Column */}
        <div className="hero-content">
          <div className="hero-badge reveal">
            <span className="hero-badge-dot" />
            Available for Projects
          </div>

          <span className="hero-greeting reveal delay-1">HELLO, I'M</span>
          
          {/* Brutalist Heading typography */}
          <div className="select-none my-3 reveal delay-2">
            <h1 
              className="font-black tracking-tight text-[#f0ece4] leading-none"
              style={{
                fontSize: 'clamp(50px, 6.5vw, 100px)',
                transform: 'rotate(-2deg)',
                transformOrigin: 'left center',
                display: 'block'
              }}
            >
              AALOK
            </h1>
            <span 
              className="text-outline font-black tracking-tight leading-none block"
              style={{
                fontSize: 'clamp(50px, 6.5vw, 100px)',
                marginTop: '-0.15em',
                display: 'block'
              }}
            >
              NIROULA
            </span>
          </div>

          <div className="hero-role reveal delay-3">
            <span className="bracket">&lt;</span>
            <span className="typed">{typedRole}</span>
            <span className="cursor-blink">|</span>
            <span className="bracket">&gt;</span>
          </div>

          <p className="hero-desc reveal delay-4">
            Frontend developer and creative designer from Kathmandu. BCS student at IIMS College. Building immersive 3D interfaces and clean user experiences.
          </p>

          <div className="hero-actions reveal delay-5">
            <button onClick={() => scrollTo('projects')} className="btn-primary">
              My Projects
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>arrow_outward</span>
            </button>
            <button onClick={() => scrollTo('contact')} className="btn-outline">
              Get in Touch
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>chat_bubble</span>
            </button>
          </div>

          <div className="hero-stats-row reveal delay-5">
            <div className="hero-stat">
              <span className="hero-stat-value">1+</span>
              <span className="hero-stat-label">YEARS EXP</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">10+</span>
              <span className="hero-stat-label">PROJECTS</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">3+</span>
              <span className="hero-stat-label">ROLES</span>
            </div>
          </div>
        </div>

        {/* Right 3D Carousel Column */}
        <div className="carousel-wrap">
          <div
            className={`carousel-container carousel-fadein ${isDragging ? 'dragging' : ''}`}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              ref={sceneRef}
              className="carousel-scene"
              style={{
                transform: `rotateY(${rotY}deg)`,
                transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {navCards.map((card, i) => {
                const angleStep = 360 / navCards.length
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
