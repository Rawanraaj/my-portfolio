import { useEffect, useRef } from 'react'

const skills = [
  { name: 'Graphic Design', pct: 85 },
  { name: 'Video Editing', pct: 80 },
  { name: 'Website Maintenance', pct: 75 },
  { name: 'HTML', pct: 50 },
  { name: 'CSS', pct: 50 },
  { name: 'JavaScript', pct: 50 },
  { name: 'React', pct: 30 },
]

const tools = [
  { name: 'Photoshop', icon: 'photo_camera' },
  { name: 'Canva', icon: 'palette' },
  { name: 'CapCut', icon: 'movie' },
  { name: 'VS Code', icon: 'terminal' },
  { name: 'Figma', icon: 'design_services' },
  { name: 'Git', icon: 'source' },
]

const softSkills = ['Creativity', 'Communication', 'Adaptability', 'Time Mgmt', 'Problem Solving']

export default function Skills() {
  const skillsRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.skill-fill').forEach((bar) => {
              bar.style.width = bar.dataset.width
            })
          }
        })
      },
      { threshold: 0.2 }
    )
    if (skillsRef.current) observer.observe(skillsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="section" id="skills">
      <div className="section-inner">
        <div className="section-header reveal">
          <span className="section-eyebrow">Abilities</span>
          <h2 className="section-title">
            My <span className="gradient-text">Skills</span> & Tools
          </h2>
          <p className="section-subtitle">
            A very hardworking person. Willing to learn new things.
          </p>
        </div>

        <div className="skills-layout" ref={skillsRef}>
          <div className="reveal-left">
            {skills.map((skill, i) => (
              <div className="skill-item" key={skill.name}>
                <div className="skill-header">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-pct">{skill.pct}%</span>
                </div>
                <div className="skill-bar">
                  <div
                    className="skill-fill"
                    data-width={`${skill.pct}%`}
                    style={{ width: 0, transitionDelay: `${i * 0.1}s` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="reveal-right">
            <h3 className="tools-section-title">Tools & Platforms</h3>
            <div className="tools-grid">
              {tools.map((tool) => (
                <div className="tool-card glass-card" key={tool.name}>
                  <span className="material-symbols-outlined">{tool.icon}</span>
                  {tool.name}
                </div>
              ))}
            </div>

            <h3 className="tools-section-title" style={{ marginTop: '28px' }}>
              Soft Skills
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {softSkills.map((s) => (
                <span key={s} className="soft-skill-tag">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
