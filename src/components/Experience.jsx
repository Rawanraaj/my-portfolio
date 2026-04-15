export default function Experience() {
  return (
    <section className="section" id="experience">
      <div className="section-inner">
        <div className="section-header reveal">
          <span className="section-eyebrow">Journey</span>
          <h2 className="section-title">
            <span className="gradient-text">Experience</span> & Education
          </h2>
          <p className="section-subtitle">
            My professional path and academic foundation.
          </p>
        </div>

        <div className="timeline reveal-left">
          <div className="timeline-item glass-card">
            <div className="timeline-dot" />
            <span className="timeline-date">Chaitra 2081 – Present</span>
            <h3 className="timeline-role">Graphic Designer & Web Handler</h3>
            <span className="timeline-company">Khalipana News</span>
            <ul className="timeline-desc-list">
              <li>Designed engaging social media graphics and digital content</li>
              <li>Maintained and updated website content regularly</li>
              <li>Managed social media platforms and audience engagement</li>
              <li>Supported overall digital presence and visual consistency</li>
            </ul>
          </div>
        </div>

        <div className="reveal" style={{ marginTop: '40px' }}>
          <h3 className="tools-section-title">Education</h3>
        </div>

        <div className="edu-grid">
          <div className="edu-card glass-card reveal delay-1">
            <span className="material-symbols-outlined" style={{ color: 'var(--accent-violet)', fontSize: '24px' }}>
              school
            </span>
            <h4 className="edu-degree">Bachelor in Computer Science</h4>
            <p className="edu-school">IIMS College</p>
            <span className="edu-status">● Currently Running</span>
          </div>

          <div className="edu-card glass-card reveal delay-2">
            <span className="material-symbols-outlined" style={{ color: 'var(--accent-pink)', fontSize: '24px' }}>
              menu_book
            </span>
            <h4 className="edu-degree">+2 Level</h4>
            <p className="edu-school">Viswa Aadarsha College, Itahari</p>
            <span className="edu-status">Completed</span>
          </div>

          <div className="edu-card glass-card reveal delay-3">
            <span className="material-symbols-outlined" style={{ color: 'var(--accent-blue)', fontSize: '24px' }}>
              history_edu
            </span>
            <h4 className="edu-degree">School Level</h4>
            <p className="edu-school">Kanchan Junga Secondary School</p>
            <span className="edu-status">Completed</span>
          </div>
        </div>

        <div className="cert-card glass-card reveal delay-4">
          <span className="material-symbols-outlined" style={{ color: 'var(--accent-amber)', fontSize: '26px' }}>
            workspace_premium
          </span>
          <div>
            <h4 className="cert-title">Fullstack Web Development Bootcamp 2025</h4>
            <p className="cert-source">Udemy — Certificate of Completion</p>
          </div>
        </div>
      </div>
    </section>
  )
}
