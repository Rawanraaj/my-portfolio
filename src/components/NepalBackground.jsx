import React, { useEffect, useRef, useState } from 'react';

export default function NepalBackground() {
  const starsCanvasRef = useRef(null);
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const [activeVideo, setActiveVideo] = useState(1);

  // Sequential video playback — play one after another
  useEffect(() => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    if (!v1 || !v2) return;

    const handleV1End = () => {
      setActiveVideo(2);
      v2.currentTime = 0;
      v2.play().catch(() => {});
    };
    const handleV2End = () => {
      setActiveVideo(1);
      v1.currentTime = 0;
      v1.play().catch(() => {});
    };

    v1.addEventListener('ended', handleV1End);
    v2.addEventListener('ended', handleV2End);

    // Start with video 1
    v1.play().catch(() => {});

    return () => {
      v1.removeEventListener('ended', handleV1End);
      v2.removeEventListener('ended', handleV2End);
    };
  }, []);

  // Twinkling Star Canvas overlay
  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const starCount = 80;
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.2 + 0.4,
        baseOpacity: Math.random() * 0.35 + 0.15,
        twinkleSpeed: 0.008 + Math.random() * 0.015,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() < 0.15 ? '#ffd6a5' : '#ffffff',
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        star.phase += star.twinkleSpeed;
        const opacity = star.baseOpacity + Math.sin(star.phase) * 0.2;
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.05, Math.min(1, opacity));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div style={{position:'fixed',inset:0,zIndex:0,overflow:'hidden',background:'#080810'}}>
      {/* Video 1 */}
      <video
        ref={video1Ref}
        muted playsInline
        style={{
          position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',
          opacity: activeVideo === 1 ? 0.55 : 0,
          filter:'brightness(0.5) saturate(0.85) contrast(1.1)',
          transition:'opacity 1.5s ease-in-out'
        }}
        onError={e=>e.target.style.display='none'}
      >
        <source src="/videos/nepal-bg.mp4" type="video/mp4"/>
      </video>

      {/* Video 2 */}
      <video
        ref={video2Ref}
        muted playsInline
        style={{
          position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',
          opacity: activeVideo === 2 ? 0.55 : 0,
          filter:'brightness(0.5) saturate(0.85) contrast(1.1)',
          transition:'opacity 1.5s ease-in-out'
        }}
        onError={e=>e.target.style.display='none'}
      >
        <source src="/videos/nepal-bg1.mp4" type="video/mp4"/>
      </video>

      <canvas ref={starsCanvasRef}
        style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:0.4,mixBlendMode:'screen',pointerEvents:'none'}}
      />
      {/* Lighter gradient — lets more video through */}
      <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(8,8,16,0.05) 0%,rgba(8,8,16,0.3) 50%,rgba(8,8,16,0.85) 100%)',pointerEvents:'none'}}/>
    </div>
  );
}
