import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function About() {
  useEffect(() => {
    // ScrollTrigger reveal for right column
    gsap.fromTo(
      '.about-right-col',
      {
        opacity: 0,
        y: 30
      },
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.about-right-col',
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  }, []);

  return (
    <section 
      id="about" 
      className="w-full overflow-hidden"
      style={{
        padding: '15vh 6vw',
        backgroundColor: 'rgba(6, 6, 15, 0.8)'
      }}
    >
      <div 
        className="grid gap-[6vw]"
        style={{
          gridTemplateColumns: '35% 65%'
        }}
      >
        {/* Left Column (Sticky rotated label) */}
        <div className="self-start sticky top-[40vh] flex md:justify-end pr-4">
          <h2 
            className="clip-reveal font-mono font-bold tracking-[0.3em] uppercase select-none"
            style={{
              fontSize: '11px',
              color: 'rgba(240, 236, 228, 0.3)',
              transform: 'rotate(-90deg)',
              whiteSpace: 'nowrap',
              transformOrigin: 'left center'
            }}
          >
            ABOUT
          </h2>
        </div>

        {/* Right Column (Content copy & Stats block) */}
        <div className="about-right-col flex flex-col gap-12">
          <p 
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 300,
              fontSize: '16px',
              lineHeight: '1.8',
              color: 'rgba(240, 236, 228, 0.7)',
              maxWidth: '520px'
            }}
          >
            Aalok Niroula is a data-focused frontend developer specializing in BCS Data Science. Currently working as a web developer intern at Multichoice Media, where he maintains products like <a href="https://khalipana.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#f0ece4]" style={{ cursor: 'none' }}>khalipana.com</a>. As an active freelancer on Upwork and Fiverr, Aalok has developed tools like the <strong className="font-semibold text-[#f0ece4]">Fiverr Guard Pro</strong> Chrome extension, protecting over 1,000 active users from scams, and the custom cyberpunk film platform <strong className="font-semibold text-[#f0ece4]">KFX Movies</strong>.
          </p>

          <div className="flex flex-col gap-6 max-w-[520px]">
            <div className="border-t border-[#f0ece410] pt-[12px] flex flex-col gap-1">
              <span className="font-mono text-[10px] text-white/30">01</span>
              <span className="font-normal text-[14px] text-[#f0ece499]" style={{ fontFamily: 'Inter, sans-serif' }}>
                BCS Data Science, IIMS College Kathmandu
              </span>
            </div>
            <div className="border-t border-[#f0ece410] pt-[12px] flex flex-col gap-1">
              <span className="font-mono text-[10px] text-white/30">02</span>
              <span className="font-normal text-[14px] text-[#f0ece499]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Web Dev Intern, Multichoice Media 2026
              </span>
            </div>
            <div className="border-t border-[#f0ece410] pt-[12px] flex flex-col gap-1">
              <span className="font-mono text-[10px] text-white/30">03</span>
              <span className="font-normal text-[14px] text-[#f0ece499]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Freelancer: Fiverr, Upwork, Freelancer.com
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Thin full-bleed horizontal line */}
      <hr className="border-t border-[#f0ece410] mt-16 w-screen -ml-[6vw]" />
    </section>
  );
}
