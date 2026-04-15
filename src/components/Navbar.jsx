import { useState, useEffect, useRef } from 'react'

export default function Navbar({ activeSection }) {
  const [visible, setVisible] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef(null)
  const indicatorRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300)
      setScrolled(window.scrollY > 500)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Exp' },
    { id: 'contact', label: 'Contact' },
  ]

  useEffect(() => {
    if (!navRef.current || !indicatorRef.current || !visible) return
    const activeLink = navRef.current.querySelector('.nav-link.active')
    if (activeLink) {
      const navRect = navRef.current.getBoundingClientRect()
      const linkRect = activeLink.getBoundingClientRect()
      indicatorRef.current.style.left = `${linkRect.left - navRect.left}px`
      indicatorRef.current.style.width = `${linkRect.width}px`
      indicatorRef.current.style.opacity = '1'
    } else {
      indicatorRef.current.style.opacity = '0'
    }
  }, [activeSection, visible])

  const scrollTo = (id) => {
    setMobileOpen(false)
    const el = document.getElementById(id)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <>
      <nav
        ref={navRef}
        className={`floating-nav ${visible ? 'visible' : ''} ${scrolled ? 'scrolled' : ''}`}
        id="main-nav"
      >
        <span className="nav-logo" onClick={() => scrollTo('home')}>
          Aalok.
        </span>

        <div
          className="nav-links-desktop"
          style={{ display: 'flex', gap: '2px', alignItems: 'center', position: 'relative' }}
        >
          {links.map((link) => (
            <button
              key={link.id}
              className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
              onClick={() => scrollTo(link.id)}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div ref={indicatorRef} className="nav-indicator" style={{ opacity: 0 }} />

        <button className="nav-cta" onClick={() => scrollTo('contact')}>
          Let's Talk
        </button>

        <button
          className="nav-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">
            {mobileOpen ? 'close' : 'menu'}
          </span>
        </button>
      </nav>

      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {links.map((link) => (
          <button
            key={link.id}
            className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
            onClick={() => scrollTo(link.id)}
          >
            {link.label}
          </button>
        ))}
        <button className="nav-cta" onClick={() => scrollTo('contact')} style={{ marginTop: '16px' }}>
          Let's Talk
        </button>
      </div>
    </>
  )
}
