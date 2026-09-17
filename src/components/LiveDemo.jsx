export default function LiveDemo() {
  return (
    <section className="section" id="demo">
      <div className="section-inner">
        <div className="section-header reveal">
          <span className="section-eyebrow">Interactive Demo</span>
          <h2 className="section-title">
            Live <span className="gradient-text">Demo</span>
          </h2>
          <p className="section-subtitle">
            Live demo: FlyStore, an AI shopping assistant built with Next.js and Groq — try asking it to search for a product.
          </p>
        </div>

        <div className="demo-wrapper reveal">
          <div className="demo-caption-bar">
            <div className="demo-status">
              <span className="demo-status-dot" />
              <span className="demo-caption-text">
                Live demo: FlyStore, an AI shopping assistant built with Next.js and Groq — try asking it to search for a product.
              </span>
            </div>
            <a
              href="https://flyrank-capstone-foundations-xi.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="demo-external-btn"
              title="Open FlyStore in a new tab"
            >
              <span>Open in new tab</span>
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                open_in_new
              </span>
            </a>
          </div>

          <div className="demo-frame-container glass-card">
            <iframe
              src="https://flyrank-capstone-foundations-xi.vercel.app"
              title="FlyStore — AI Shopping Assistant Live Demo"
              className="demo-iframe"
              loading="lazy"
              allow="clipboard-write"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
