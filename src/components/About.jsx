import { useEffect, useRef } from 'react'

/* JS-driven orbit — immune to CSS transform/animation context issues */
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
          borderRadius: '50%',
          background: dotColor,
          boxShadow: `0 0 12px ${dotColor}, 0 0 24px ${dotColor}`,
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
          <span className="section-eyebrow">About Me</span>
          <h2 className="section-title">
            Designing the <span className="gradient-text">Future</span>, One Pixel at a Time
          </h2>
        </div>

        <div className="about-layout">
          <div className="about-visual" style={{ opacity: 1 }}>
            <div className="about-avatar">
              {/* JS-animated orbit rings with glowing dots */}
              <OrbitRing
                size={300}
                speed={0.5}
                color="rgba(139, 92, 246, 0.2)"
                dotColor="#8b5cf6"
                dotSize={10}
                reverse={false}
              />
              <OrbitRing
                size={340}
                speed={0.3}
                color="rgba(236, 72, 153, 0.12)"
                dotColor="#ec4899"
                dotSize={7}
                reverse={true}
              />
              <div className="about-avatar-inner">
                <img
                  src="/profile.png"
                  alt="Aalok Niroula"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%',
                  }}
                />
              </div>
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
                <span className="stat-value">📍</span>
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
