import { useRef, useState } from 'react'

const projects = [
  {
    title: 'KFX Studios Website',
    category: 'Web Development',
    description:
      'Building a modern website for KFX Studios with responsive layouts, clean UI sections, and professional design.',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    status: 'ongoing',
    link: '#',
    image: "/kfxstudio.png",
  },
  {
    title: 'Personal Portfolio',
    category: '3D Interactive',
    description:
      'This immersive 3D portfolio with custom cursor, floating shapes, glass morphism, and interactive carousel.',
    technologies: ['React', 'CSS 3D', 'Vite'],
    status: 'live',
    link: '#',
    image: "/Portfolio.png",
  },
  {
    title: 'Khalipana News Portal',
    category: 'Web Maintenance',
    description:
      'Managing digital content, maintaining the website, and driving social media engagement for 1+ year.',
    technologies: ['CMS', 'Design', 'Social Media'],
    status: 'live',
    link: 'https://khalipana.com/',
    image: "/Khalipana.png",
  },
]

function useTilt(ref) {
  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.transform = `perspective(800px) rotateX(${y * -8}deg) rotateY(${x * 8}deg) translateY(-6px)`
  }
  const handleMouseLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)'
  }
  return { handleMouseMove, handleMouseLeave }
}

function ProjectCard({ project, index, onDevClick }) {
  const ref = useRef(null)
  const { handleMouseMove, handleMouseLeave } = useTilt(ref)

  return (
    <div
      ref={ref}
      className={`project-card glass-card reveal delay-${index + 1}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="project-image">
        {project.image ? (
          <img src={project.image} alt={project.title} />
        ) : (
          <div className="project-image-placeholder">
            <span className="material-symbols-outlined">image</span>
            <span>Preview</span>
          </div>
        )}
        <span className={`project-status ${project.status}`}>
          {project.status === 'live' ? '● Live' : '◉ Ongoing'}
        </span>
      </div>

      <div className="project-body">
        <span className="project-category">{project.category}</span>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-desc">{project.description}</p>
        <div className="project-tags">
          {project.technologies.map((tech) => (
            <span className="project-tag" key={tech}>{tech}</span>
          ))}
        </div>
        {project.status === 'ongoing' ? (
          <button
            className="project-link"
            onClick={onDevClick}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            View Project
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
          </button>
        ) : (
          <a href={project.link} className="project-link" target="_blank" rel="noopener noreferrer">
            View Project
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
          </a>
        )}
      </div>
    </div>
  )
}

export default function Projects() {
  const [showToast, setShowToast] = useState(false)

  const handleDevClick = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <section className="section" id="projects">
      <div className="section-inner">
        <div className="section-header reveal">
          <span className="section-eyebrow">Portfolio</span>
          <h2 className="section-title">
            <span className="gradient-text">Featured</span> Projects
          </h2>
          <p className="section-subtitle">
            Real-world projects showcasing design thinking and technical execution.
          </p>
        </div>

        <div className="projects-grid">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} onDevClick={handleDevClick} />
          ))}
        </div>
      </div>

      {/* Development Toast Popup */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          padding: '14px 28px',
          background: 'rgba(15, 15, 36, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 20px rgba(245, 158, 11, 0.1)',
          animation: 'toastSlideUp 0.4s ease-out',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#f59e0b' }}>
            construction
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f59e0b' }}>
            🚧 Still in Development — Coming Soon!
          </span>
        </div>
      )}

      <style>{`
        @keyframes toastSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </section>
  )
}
