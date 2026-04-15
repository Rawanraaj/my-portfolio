import { useState } from 'react'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')

    try {
      const res = await fetch('https://formsubmit.co/ajax/niroulaaalok54@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          _replyto: formData.email || 'not provided',
          email: formData.email || 'not provided',
          _subject: formData.subject,
          message: formData.message,
        }),
      })

      if (res.ok) {
        setStatus('sent')
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setStatus('idle'), 4000)
      } else {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 3000)
      }
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section className="section" id="contact">
      <div className="section-inner">
        <div className="section-header reveal">
          <span className="section-eyebrow">Contact</span>
          <h2 className="section-title">
            Let's <span className="gradient-text">Connect</span>
          </h2>
          <p className="section-subtitle">
            Have a project in mind? I'd love to collaborate and bring your ideas to life.
          </p>
        </div>

        <div className="contact-layout">
          <div className="contact-cards reveal-left">
            <div className="contact-card glass-card">
              <div className="contact-card-icon">
                <span className="material-symbols-outlined">mail</span>
              </div>
              <div>
                <span className="contact-label">Email</span>
                <a href="mailto:niroulaaalok54@gmail.com" className="contact-value"
                  style={{ textDecoration: 'none', color: 'var(--text-white)' }}>
                  niroulaaalok54@gmail.com
                </a>
              </div>
            </div>

            <div className="contact-card glass-card">
              <div className="contact-card-icon">
                <span className="material-symbols-outlined">phone</span>
              </div>
              <div>
                <span className="contact-label">Phone</span>
                <a href="tel:+9779810546623" className="contact-value"
                  style={{ textDecoration: 'none', color: 'var(--text-white)' }}>
                  +977 9810546623
                </a>
              </div>
            </div>

            <div className="contact-card glass-card">
              <div className="contact-card-icon">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <div>
                <span className="contact-label">Location</span>
                <span className="contact-value">Kathmandu, Nepal</span>
              </div>
            </div>

            <div className="contact-card glass-card">
              <div className="contact-card-icon">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div>
                <span className="contact-label">Response Time</span>
                <span className="contact-value">Within 24 hours</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="social-links" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <a href="https://github.com/Rawanraaj" target="_blank" rel="noopener noreferrer"
                className="social-icon glass-card" aria-label="GitHub"
                style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', textDecoration: 'none' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#c4c1d4' }}>
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a href="https://wa.me/9779810546623" target="_blank" rel="noopener noreferrer"
                className="social-icon glass-card" aria-label="WhatsApp"
                style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', textDecoration: 'none' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#25D366' }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/iam_aalokniroula/" target="_blank" rel="noopener noreferrer"
                className="social-icon glass-card" aria-label="Instagram"
                style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', textDecoration: 'none' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#E4405F' }}>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          <form className="contact-form reveal-right" onSubmit={handleSubmit}>
            <input type="text" name="name" className="form-input" placeholder="Your Name"
              value={formData.name} onChange={handleChange} required />
            <input type="email" name="email" className="form-input" placeholder="Your Email (optional — so I can reply)"
              value={formData.email} onChange={handleChange} />
            <input type="text" name="subject" className="form-input" placeholder="Subject"
              value={formData.subject} onChange={handleChange} required />
            <textarea name="message" className="form-input" placeholder="Your Message..."
              value={formData.message} onChange={handleChange} required rows={5} />

            <div className="form-submit">
              {status === 'sent' ? (
                <div style={{
                  padding: '12px 24px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '50px',
                  color: 'var(--accent-emerald)',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                  Message Sent!
                </div>
              ) : status === 'error' ? (
                <div style={{
                  padding: '12px 24px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '50px',
                  color: '#ef4444',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
                  Failed — try again
                </div>
              ) : (
                <button type="submit" className="btn-primary" disabled={status === 'sending'}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    {status === 'sending' ? 'hourglass_empty' : 'send'}
                  </span>
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
