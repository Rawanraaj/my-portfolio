import { useEffect, useRef } from 'react'

function OrbitRing({ size, speed, color, dotColor, dotSize, reverse }) {
  const ringRef = useRef(null)
  const dotRef = useRef(null)

  useEffect(() => {
    let angle = 0
    let raf
    const dir = reverse ? -1 : 1
    const radius = size / 2

    const animate = () => {
      angle += speed * dir
      if (dotRef.current) {
        const rad = (angle * Math.PI) / 180
        const x = radius + radius * Math.cos(rad) - dotSize / 2
        const y = radius + radius * Math.sin(rad) - dotSize / 2
        dotRef.current.style.transform = `translate(${x}px, ${y}px)`
      }
      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [size, speed, reverse, dotSize])

  return (
    <div
      ref={ringRef}
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        top: '50%',
        left: '50%',
        marginTop: `-${size / 2}px`,
        marginLeft: `-${size / 2}px`,
        border: `1px ${reverse ? 'dashed' : 'solid'} ${color}`,
        borderRadius: '50%',
        pointerEvents: 'none',
      }}
    >
      <div
        ref={dotRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          backgroundColor: dotColor,
          borderRadius: '50%',
          boxShadow: `0 0 10px ${dotColor}`,
        }}
      />
    </div>
  )
}

export default function About() {
  return (
    <section className="section" id="about">
      <div className="section-inner">
        <div className="section-header reveal">
          <span className="section-eyebrow">Overview</span>
          <h2 className="section-title">
            <span className="gradient-text">About</span> Me
          </h2>
          <p className="section-subtitle">
            BCS student with design sensibilities and dynamic development skills.
          </p>
        </div>

        <div className="about-layout">
          <div className="about-visual reveal-left">
            <div className="about-avatar">
              <div className="about-avatar-inner" style={{ overflow: 'hidden', padding: 0 }}>
                <img
                  src="/profile.jpg"
                  alt="Rawan Raj"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    display: 'block'
                  }}
                />
              </div>
              <OrbitRing
                size={300}
                speed={0.5}
                color="rgba(0, 210, 255, 0.15)"
                dotColor="#00d2ff"
                dotSize={8}
                reverse={false}
              />
              <OrbitRing
                size={340}
                speed={0.3}
                color="rgba(255, 170, 60, 0.1)"
                dotColor="#ffaa3c"
                dotSize={6}
                reverse={true}
              />
            </div>
          </div>

          <div className="about-text reveal-right">
            <p>
              I'm a <strong>BCS student at IIMS College</strong> with a growing passion for
              frontend development and modern web technologies. My creative background as a
              graphic designer, video editor, and social media handler has given me a sharp
              eye for design, layout, and user experience.
            </p>
            <p>
              Currently building real-world projects including the website for{' '}
              <strong>KFX Studios</strong>, and managing the digital presence of{' '}
              <strong>Khalipana News</strong> for over a year.
            </p>

            <div className="about-stats">
              <div className="stat-card glass-card reveal delay-1">
                <span className="stat-value">1+</span>
                <span className="stat-label"><strong>Years Experience</strong></span>
              </div>
              <div className="stat-card glass-card reveal delay-2">
                <span className="stat-value">BCS</span>
                <span className="stat-label"><strong>IIMS College</strong></span>
              </div>
              <div className="stat-card glass-card reveal delay-3">
                <span className="stat-value">NP</span>
                <span className="stat-label"><strong>Kathmandu</strong></span>
              </div>
            </div>

            <div className="availability-badge reveal delay-4">
              <span className="availability-dot" />
              Open for Internship & Freelance
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
