import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import sections
import Hero from './sections/Hero';
import About from './sections/About';
import Projects from './sections/Projects';
import Skills from './sections/Skills';
import Contact from './sections/Contact';

// Import overlay component
import GestureOverlay from './components/GestureOverlay';

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

export default function App() {
  useEffect(() => {
    // 1. Title reveal animation (clip-path)
    const clipReveals = document.querySelectorAll('.clip-reveal');
    clipReveals.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => el.classList.add('visible'),
        toggleActions: 'play none none none'
      });
    });

    // 2. Project rows entrance animation
    const projectRows = document.querySelectorAll('.project-line');
    projectRows.forEach((row) => {
      gsap.fromTo(
        row,
        {
          y: 40,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Cleanup ScrollTriggers on unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#06060f] text-[#f0ece4] select-none">
      <main className="w-full flex flex-col">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>

      {/* Gesture overlay system */}
      <GestureOverlay />
    </div>
  );
}
