import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const SKILL_CATEGORIES = [
  {
    title: 'Frontend',
    skills: [
      { name: 'React', level: 'strong' },
      { name: 'Next.js', level: 'strong' },
      { name: 'Tailwind', level: 'strong' },
      { name: 'Three.js', level: 'learning' },
      { name: 'Framer Motion', level: 'solid' }
    ]
  },
  {
    title: 'Backend',
    skills: [
      { name: 'Node.js', level: 'solid' },
      { name: 'Express', level: 'solid' },
      { name: 'Prisma', level: 'solid' },
      { name: 'Supabase', level: 'solid' }
    ]
  },
  {
    title: 'Data Science',
    skills: [
      { name: 'Python', level: 'strong' },
      { name: 'NumPy', level: 'solid' },
      { name: 'Plotly', level: 'strong' },
      { name: 'Pandas', level: 'solid' }
    ]
  },
  {
    title: 'Tools',
    skills: [
      { name: 'Git', level: 'strong' },
      { name: 'Figma', level: 'solid' },
      { name: 'WordPress', level: 'strong' },
      { name: 'Vercel', level: 'strong' }
    ]
  }
];

export default function Skills() {
  const getLevelColor = (level) => {
    if (level === 'strong') return '#f0ece4';
    if (level === 'solid') return '#f0ece460';
    return '#f0ece430'; // learning
  };

  useEffect(() => {
    // ScrollTrigger staggered reveals for rows and category labels
    const categoryBlocks = document.querySelectorAll('.skill-category-block');
    
    categoryBlocks.forEach((block) => {
      const rows = block.querySelectorAll('.skill-row');
      const label = block.querySelector('.skill-cat-label');
      
      // Animate rows left-to-right clip path
      gsap.fromTo(
        rows,
        {
          clipPath: 'inset(0 100% 0 0)'
        },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.6,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: block,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          onComplete: () => {
            // Fade in label after rows finish
            gsap.to(label, {
              opacity: 0.4, // original label opacity is 0.4
              duration: 0.3
            });
          }
        }
      );
    });
  }, []);

  return (
    <section id="skills" className="w-full py-20 px-[6vw] overflow-hidden" style={{ backgroundColor: 'rgba(6, 6, 15, 0.75)' }}>
      <h2 
        className="clip-reveal font-mono text-[11px] tracking-[0.3em] text-[#f0ece430] mb-16 uppercase"
        style={{ fontFamily: '"JetBrains Mono", monospace' }}
      >
        CAPABILITIES
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 max-w-[1100px]">
        {SKILL_CATEGORIES.map((cat, idx) => (
          <div key={idx} className="skill-category-block flex flex-col">
            <h3 
              className="skill-cat-label font-mono text-[10px] tracking-[0.2em] uppercase mb-4"
              style={{ 
                fontFamily: '"JetBrains Mono", monospace',
                opacity: 0 // start invisible, GSAP will fade in
              }}
            >
              // {cat.title}
            </h3>

            <div className="flex flex-col">
              {cat.skills.map((skill, sIdx) => (
                <div 
                  key={sIdx}
                  className="skill-row flex items-baseline justify-between py-2.5 border-b border-[#f0ece408]"
                  style={{ clipPath: 'inset(0 100% 0 0)' }} // start clipped
                >
                  <span 
                    className="text-[14px] text-[#f0ece4] font-normal"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {skill.name}
                  </span>

                  <span 
                    className="flex-1 mx-3 overflow-hidden text-[14px] text-[#f0ece415] select-none tracking-[4px]"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    ················································································
                  </span>

                  <span 
                    className="font-mono text-[11px] lowercase"
                    style={{ 
                      fontFamily: '"JetBrains Mono", monospace',
                      color: getLevelColor(skill.level)
                    }}
                  >
                    {skill.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
