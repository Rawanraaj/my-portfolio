import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// SVG path parser helper to turn simple paths to 3D line points
const parseSVGPath = (pathString) => {
  const points = [];
  const commands = pathString.split(/(?=[MLZ])/);
  let current = new THREE.Vector3();
  
  commands.forEach(cmd => {
    const type = cmd[0];
    const args = cmd.slice(1).trim().split(/[\s,]+/).map(Number);
    
    if (type === 'M' && args.length >= 2) {
      current = new THREE.Vector3(args[0], args[1], 0);
      points.push(current.clone());
    } else if (type === 'L' && args.length >= 2) {
      current = new THREE.Vector3(args[0], args[1], 0);
      points.push(current.clone());
    } else if (type === 'Z') {
      if (points.length > 0) {
        points.push(points[0].clone());
      }
    }
  });
  return points;
};

// LAYER 1 — Mountain Silhouettes
function MountainLayer({ drawFn, color, zPos, scrollProgress, parallaxFactor }) {
  const planeRef = useRef();

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.beginPath();
    drawFn(ctx, canvas.width, canvas.height);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, [drawFn, color]);

  useFrame(() => {
    if (planeRef.current) {
      // Custom Y scrolling speed
      planeRef.current.position.y = -1.2 + scrollProgress.current * parallaxFactor;
    }
  });

  return (
    <mesh ref={planeRef} position={[0, -1.2, zPos]}>
      <planeGeometry args={[16, 8]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

// LAYER 2 — Stars (Pinpoint Twinkling Lights)
function Stars({ scrollProgress }) {
  const pointsRef = useRef();
  const count = 3000;

  const [positions, sizes, randoms, opacities, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const szs = new Float32Array(count);
    const rnds = new Float32Array(count);
    const opacs = new Float32Array(count);
    const cols = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Upper 70% sky coordinates
      pos[i * 3] = (Math.random() - 0.5) * 24; // x: wide span
      pos[i * 3 + 1] = -0.5 + Math.random() * 6.5; // y: sky area
      pos[i * 3 + 2] = -6.5 + Math.random() * 0.5; // z: behind mountains

      // Size: 50 bright stars are 2.0px, others are 0.5px to 1.5px
      if (i < 50) {
        szs[i] = 2.0;
      } else {
        szs[i] = 0.5 + Math.random() * 1.0;
      }

      // Unique frequency factor for twinkle speed
      rnds[i] = 0.5 + Math.random() * 1.5;

      // Base opacity: 0.3 to 0.7
      opacs[i] = 0.3 + Math.random() * 0.4;

      // Star colors: 80% white (#ffffff), 20% soft blue (#a8c4ff)
      const isBlue = Math.random() < 0.20;
      if (isBlue) {
        // Soft blue #a8c4ff
        cols[i * 3] = 0.66;
        cols[i * 3 + 1] = 0.77;
        cols[i * 3 + 2] = 1.0;
      } else {
        // White #ffffff
        cols[i * 3] = 1.0;
        cols[i * 3 + 1] = 1.0;
        cols[i * 3 + 2] = 1.0;
      }
    }

    return [pos, szs, rnds, opacs, cols];
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      uniforms.uTime.value += delta;
    }
  });

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms,
      vertexShader: `
        uniform float uTime;
        attribute float aSize;
        attribute float aRandom;
        attribute float aBaseOpacity;
        attribute vec3 aColor;
        varying vec3 vColor;
        varying float vOpacity;

        void main() {
          vColor = aColor;
          
          // Twinkle logic: Sinusoidal opacity oscillation
          vOpacity = aBaseOpacity + (1.0 - aBaseOpacity) * 0.4 * (sin(uTime * aRandom * 1.8) + 0.2);
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          gl_PointSize = aSize;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vOpacity;

        void main() {
          // Sharp pinpoint drawing
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.42, dist) * vOpacity;
          gl_FragColor = vec4(vColor, alpha);
        }
      `
    });
  }, [uniforms]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          args={[randoms, 1]}
        />
        <bufferAttribute
          attach="attributes-aBaseOpacity"
          args={[opacities, 1]}
        />
        <bufferAttribute
          attach="attributes-aColor"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  );
}

// LAYER 3 — Kathmandu City Glow at Mountain Ridgeline
function RidgelineGlow() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Horizontal glow represented as vertical fade in/out
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, 'rgba(255, 140, 0, 0)');
    grad.addColorStop(0.5, 'rgba(255, 140, 0, 0.04)'); // Amber glow #ff8c00 at exactly 4% opacity
    grad.addColorStop(1, 'rgba(255, 140, 0, 0)');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  // Positioned exactly along the general mountain horizon line (y = -0.5)
  return (
    <mesh position={[0, -0.5, -5.9]}>
      <planeGeometry args={[16, 1.2]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

// LAYER 4 — Static Cultural Geometry outlines (fixed opacity values)
function CulturalGeometry() {
  // Dharahara outline path
  const dharaharaPoints = useMemo(() => {
    const path = "M -0.15 -2 L 0.15 -2 L 0.15 1.5 L -0.15 1.5 Z M -0.25 1.5 L 0.25 1.5 L 0.25 1.62 L -0.25 1.62 Z M -0.12 1.62 L -0.12 2.1 L 0 2.4 L 0.12 2.1 L 0.12 1.62 Z M 0 2.4 L 0 2.7";
    return parseSVGPath(path);
  }, []);

  // Boudhanath outline path
  const boudhanathPoints = useMemo(() => {
    let path = "M -1.2 -1.5 L 1.2 -1.5 L 1.2 -1.35 L -1.2 -1.35 Z M -0.9 -1.35 L 0.9 -1.35 L 0.9 -1.2 L -0.9 -1.2 Z ";
    const r = 0.7;
    const cy = -1.2;
    path += "M " + (-r) + " " + cy + " ";
    for (let i = 1; i <= 10; i++) {
      const angle = Math.PI + (i / 10) * Math.PI;
      const x = r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      path += "L " + x.toFixed(3) + " " + y.toFixed(3) + " ";
    }
    path += "L " + r + " " + cy + " Z ";
    path += "M -0.2 -0.5 L 0.2 -0.5 L 0.2 -0.25 L -0.2 -0.25 Z ";
    path += "M -0.12 -0.25 L 0.12 -0.25 L 0 0.1 Z";
    return parseSVGPath(path);
  }, []);

  // Pashupatinath outline path
  const pashupatinathPoints = useMemo(() => {
    const path = "M -1.0 -1.5 L 1.0 -1.5 L 1.25 -1.0 L 0.4 -0.6 L -0.4 -0.6 L -1.25 -1.0 Z M -0.55 -0.6 L 0.55 -0.6 L 0.7 0.0 L 0.2 0.4 L -0.2 0.4 L -0.7 0.0 Z M -0.15 0.4 L 0.15 0.4 L 0.15 0.55 L -0.15 0.55 Z M 0 0.55 L 0 0.9";
    return parseSVGPath(path);
  }, []);

  const dharaharaGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(dharaharaPoints), [dharaharaPoints]);
  const boudhaGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(boudhanathPoints), [boudhanathPoints]);
  const pashupatiGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(pashupatinathPoints), [pashupatinathPoints]);

  return (
    <group>
      {/* Dharahara: Left side, stroke opacity 0.06 */}
      <line position={[-3.8, -0.6, -4.8]} scale={[0.85, 0.85, 1]}>
        <primitive object={dharaharaGeo} attach="geometry" />
        <lineBasicMaterial color="#f0ece4" transparent opacity={0.06} depthWrite={false} />
      </line>

      {/* Boudhanath: Center-right, stroke opacity 0.05 */}
      <line position={[1.2, -0.9, -4.6]} scale={[0.85, 0.85, 1]}>
        <primitive object={boudhaGeo} attach="geometry" />
        <lineBasicMaterial color="#f0ece4" transparent opacity={0.05} depthWrite={false} />
      </line>

      {/* Pashupatinath: Far right, stroke opacity 0.05 */}
      <line position={[3.6, -0.9, -4.6]} scale={[0.8, 0.8, 1]}>
        <primitive object={pashupatiGeo} attach="geometry" />
        <lineBasicMaterial color="#f0ece4" transparent opacity={0.05} depthWrite={false} />
      </line>
    </group>
  );
}

// Controller for Camera Parallax (Z moves 0 to -2)
function SceneController({ scrollProgress }) {
  const { camera } = useThree();

  useFrame(() => {
    // Scroll 0 -> 1: camera Z moves from 0 to -2
    camera.position.z = 0 - scrollProgress.current * 2.0;
  });

  return null;
}

export default function NepalBackground() {
  const scrollProgress = useRef(0);

  // Passive window scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Silhouette drawing functions for Layer 1
  const drawFarMountains = (ctx, w, h) => {
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.70);
    ctx.lineTo(w * 0.12, h * 0.58);
    ctx.lineTo(w * 0.28, h * 0.65);
    ctx.lineTo(w * 0.42, h * 0.50);
    ctx.lineTo(w * 0.55, h * 0.60);
    ctx.lineTo(w * 0.70, h * 0.40); // Everest Shape Peak
    ctx.lineTo(w * 0.80, h * 0.52);
    ctx.lineTo(w * 0.90, h * 0.45);
    ctx.lineTo(w, h * 0.60);
    ctx.lineTo(w, h);
  };

  const drawMidMountains = (ctx, w, h) => {
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.75);
    ctx.lineTo(w * 0.18, h * 0.62);
    ctx.lineTo(w * 0.35, h * 0.70);
    ctx.lineTo(w * 0.50, h * 0.55);
    ctx.lineTo(w * 0.68, h * 0.65);
    ctx.lineTo(w * 0.82, h * 0.58);
    ctx.lineTo(w, h * 0.72);
    ctx.lineTo(w, h);
  };

  const drawNearMountains = (ctx, w, h) => {
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.80);
    ctx.lineTo(w * 0.22, h * 0.70);
    ctx.lineTo(w * 0.45, h * 0.78);
    ctx.lineTo(w * 0.60, h * 0.68);
    ctx.lineTo(w * 0.75, h * 0.75);
    ctx.lineTo(w * 0.88, h * 0.70);
    ctx.lineTo(w, h * 0.80);
    ctx.lineTo(w, h);
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, 0], fov: 75, near: 0.1, far: 20 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Set Renderer background color to #06060f (almost black) */}
        <color attach="background" args={['#06060f']} />
        
        <SceneController scrollProgress={scrollProgress} />
        
        {/* LAYER 2: Stars (Tiny pinpoints, deep background layer) */}
        <Stars scrollProgress={scrollProgress} />
        
        {/* LAYER 3: Horizon Kathmandu City Glow */}
        <RidgelineGlow />

        {/* LAYER 1: 3 Layered Himalayan Mountains with separate parallax rates */}
        {/* Far layer: lightest (#12121f), moves 5px per 100px (0.4x relative scale) */}
        <MountainLayer 
          drawFn={drawFarMountains} 
          color="#12121f" 
          zPos={-5.8} 
          scrollProgress={scrollProgress} 
          parallaxFactor={0.4} 
        />
        {/* Mid layer: medium (#0d0d1a), moves 10px per 100px (0.8x relative scale) */}
        <MountainLayer 
          drawFn={drawMidMountains} 
          color="#0d0d1a" 
          zPos={-5.4} 
          scrollProgress={scrollProgress} 
          parallaxFactor={0.8} 
        />
        {/* Near layer: darkest (#080810), moves 15px per 100px (1.2x relative scale) */}
        <MountainLayer 
          drawFn={drawNearMountains} 
          color="#080810" 
          zPos={-5.0} 
          scrollProgress={scrollProgress} 
          parallaxFactor={1.2} 
        />

        {/* LAYER 4: Static transparent outline cultural geometry shapes */}
        <CulturalGeometry />
      </Canvas>
    </div>
  );
}
