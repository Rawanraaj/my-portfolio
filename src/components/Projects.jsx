import { useRef } from 'react'

const projects = [
  {
    title: 'KFX Studios Website',
    category: 'Web Development',
    description:
      'Building a modern website for KFX Studios with responsive layouts, clean UI sections, and professional design.',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    status: 'ongoing',
    link: '#',
    image: null,
  },
  {
    title: 'Personal Portfolio',
    category: '3D Interactive',
    description:
      'This immersive 3D portfolio with custom cursor, floating shapes, glass morphism, and interactive carousel.',
    technologies: ['React', 'CSS 3D', 'Vite'],
    status: 'live',
    link: '#',
    image: null,
  },
  {
    title: 'Khalipana News Portal',
    category: 'Web Maintenance',
    description:
      'Managing digital content, maintaining the website, and driving social media engagement for 1+ year.',
    technologies: ['CMS', 'Design', 'Social Media'],
    status: 'live',
    link: 'https://khalipana.com/',
    image: null,
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

function ProjectCard({ project, index }) {
  const cardRef = useRef(null)
  const { handleMouseMove, handleMouseLeave } = useTilt(cardRef)

  return (
    <div
      ref={cardRef}
      className={`project-card glass-card reveal delay-${index + 1}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="project-image">
        {project.image ? (
          <img src={project.image} alt={project.title} loading="lazy" />
        ) : (
          <div className="project-image-placeholder">
            <span className="material-symbols-outlined">add_photo_alternate</span>
            <span>Add Screenshot</span>
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
        <a href={project.link} className="project-link">
          View Project
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
        </a>
      </div>
    </div>
  )
}

export default function Projects() {
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
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
