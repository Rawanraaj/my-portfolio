import React from 'react';

const PROJECTS = [
  { id:"01", name:"KFX Movies", stack:"Next.js · Node.js · Prisma · Supabase", desc:"Cyberpunk film platform. 25 pages, JWT auth, Cloudinary.", url:"https://kfxmovies.com" },
  { id:"02", name:"Fiverr Guard Pro", stack:"Chrome Extension · JS · ML", desc:"Scam detector for Fiverr. 1,000+ active users.", url:"https://github.com/Rawanraaj" },
  { id:"03", name:"Climate Viz", stack:"Python · Plotly · NumPy", desc:"577K+ records. Global warming choropleth maps.", url:"https://github.com/Rawanraaj" },
  { id:"04", name:"Khalipana.com", stack:"WordPress · PHP · Custom CSS", desc:"Job portal. Live in production at Multichoice Media.", url:"https://khalipana.com" }
];

export default function Projects() {
  return (
    <section id="projects" className="w-full py-20 px-[6vw] overflow-hidden">
      <h2 
        className="clip-reveal font-mono text-[11px] tracking-[0.3em] text-[#f0ece430] mb-12 uppercase"
        style={{ fontFamily: '"JetBrains Mono", monospace' }}
      >
        SELECTED WORK
      </h2>

      {/* Desktop Version: Full-width rows */}
      <div className="hidden md:flex flex-col w-full border-b border-[#f0ece410]">
        {PROJECTS.map((proj) => (
          <a
            key={proj.id}
            href={proj.url}
            target="_blank"
            rel="noopener noreferrer"
            className="project-line group flex items-center justify-between py-6 border-t border-[#f0ece410]"
            style={{ cursor: 'none' }}
          >
            <div className="flex items-baseline gap-6">
              <span 
                className="font-mono text-[11px] text-[#f0ece430]"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                {proj.id}
              </span>
              <span className="text-[28px] font-medium text-[#f0ece4] tracking-tight">
                {proj.name}
              </span>
            </div>

            <div className="flex items-center gap-16 text-right pr-12">
              <div className="flex flex-col items-end">
                <span 
                  className="font-mono text-[10px] text-[#f0ece440] mb-1"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  {proj.stack}
                </span>
                <span className="text-[13px] font-light text-[#f0ece460]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {proj.desc}
                </span>
              </div>
              <span className="text-[#f0ece430] text-[20px] transition-transform duration-300 group-hover:translate-x-2">
                →
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Mobile Version: Horizontal scroll list */}
      <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-6 w-full pb-4 scrollbar-none">
        {PROJECTS.map((proj) => (
          <a
            key={proj.id}
            href={proj.url}
            target="_blank"
            rel="noopener noreferrer"
            className="snap-center shrink-0 w-[80vw] border border-[#f0ece410] p-6 flex flex-col justify-between h-[220px]"
            style={{ cursor: 'none' }}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span 
                  className="font-mono text-[11px] text-[#f0ece430]"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  {proj.id}
                </span>
                <span className="text-[#f0ece430] text-[18px]">→</span>
              </div>
              <h3 className="text-[22px] font-medium text-[#f0ece4] tracking-tight mb-2">
                {proj.name}
              </h3>
              <p className="text-[12px] font-light text-[#f0ece460] line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                {proj.desc}
              </p>
            </div>
            <div 
              className="font-mono text-[9px] text-[#f0ece440]"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              {proj.stack}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
