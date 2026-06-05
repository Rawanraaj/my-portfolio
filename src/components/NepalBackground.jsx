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

// Layer 1: Himalayan Mountain Silhouette Plane
function Mountains({ scrollProgress }) {
  const planeRef = useRef();

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Gradient background: deep navy #0a0a1a to #1a0a2e
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mountains silhouette: deep navy #0d0d1d
    ctx.fillStyle = '#0d0d1d';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, canvas.height * 0.75);
    ctx.lineTo(160, canvas.height * 0.62);
    ctx.lineTo(320, canvas.height * 0.68);
    ctx.lineTo(480, canvas.height * 0.5);
    ctx.lineTo(560, canvas.height * 0.58);
    ctx.lineTo(760, canvas.height * 0.3); // Everest peak
    ctx.lineTo(880, canvas.height * 0.44);
    ctx.lineTo(1000, canvas.height * 0.36); // Lhotse peak
    ctx.lineTo(1200, canvas.height * 0.58);
    ctx.lineTo(1400, canvas.height * 0.42); // Cho Oyu peak
    ctx.lineTo(1560, canvas.height * 0.52);
    ctx.lineTo(1760, canvas.height * 0.38); // Shishapangma peak
    ctx.lineTo(2048, canvas.height * 0.68);
    ctx.lineTo(2048, canvas.height);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  useFrame(() => {
    if (planeRef.current) {
      // Subtle parallax: mountains move up 15% of scroll (mountains "rise" as you scroll)
      planeRef.current.position.y = -0.5 + scrollProgress.current * 1.2;
    }
  });

  return (
    <mesh ref={planeRef} position={[0, -0.5, -5.5]}>
      <planeGeometry args={[16, 8]} />
      <meshBasicMaterial map={texture} depthWrite={false} />
    </mesh>
  );
}

// Layer 2: Particle Constellation (City Lights)
function CityParticles({ scrollProgress, isGestureActive }) {
  const pointsRef = useRef();
  const count = 2000;

  // Initialize particle positions, sizes, speeds, base colors, and gesture target colors
  const [positions, sizes, speeds, baseColors, targetColors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const szs = new Float32Array(count);
    const spds = new Float32Array(count);
    const baseCol = new Float32Array(count * 3);
    const targetCol = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Random position in a 20x10x5 box
      pos[i * 3] = (Math.random() - 0.5) * 20; // x: [-10, 10]
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10; // y: [-5, 5]
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 3; // z: [-5.5, -0.5]

      // Random sizes 0.5px to 2.5px
      szs[i] = 0.5 + Math.random() * 2.0;

      // Speed factor
      spds[i] = 0.4 + Math.random() * 0.6;

      // Kathmandu city lights colors:
      // Mix of warm amber #ffb347 (70%) and cool cyan #00ffff (30%)
      const isWarm = Math.random() < 0.7;
      if (isWarm) {
        // Amber #ffb347 -> rgb(1.0, 0.70, 0.28)
        baseCol[i * 3] = 1.0;
        baseCol[i * 3 + 1] = 0.70;
        baseCol[i * 3 + 2] = 0.28;
      } else {
        // Cyan #00ffff -> rgb(0.0, 1.0, 1.0)
        baseCol[i * 3] = 0.0;
        baseCol[i * 3 + 1] = 1.0;
        baseCol[i * 3 + 2] = 1.0;
      }

      // Gesture target color: shift more towards cyan (e.g. 80% cyan, 20% amber)
      const isTargetCyan = Math.random() < 0.8;
      if (isTargetCyan) {
        targetCol[i * 3] = 0.0;
        targetCol[i * 3 + 1] = 1.0;
        targetCol[i * 3 + 2] = 1.0;
      } else {
        targetCol[i * 3] = 1.0;
        targetCol[i * 3 + 1] = 0.70;
        targetCol[i * 3 + 2] = 0.28;
      }
    }

    return [pos, szs, spds, baseCol, targetCol];
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uGesture: { value: 0 }
  }), []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Increment time
      uniforms.uTime.value += delta;
      
      // Pass scroll progress
      uniforms.uScroll.value = scrollProgress.current;

      // Smoothly transition the gesture uniform towards target
      const targetGesture = isGestureActive ? 1.0 : 0.0;
      uniforms.uGesture.value += (targetGesture - uniforms.uGesture.value) * 0.08;
    }
  });

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms,
      vertexShader: `
        uniform float uTime;
        uniform float uScroll;
        uniform float uGesture;
        attribute float aSize;
        attribute float aSpeed;
        attribute vec3 aBaseColor;
        attribute vec3 aTargetColor;
        varying vec3 vColor;

        void main() {
          // Mix colors based on gesture activation
          vec3 mixedColor = mix(aBaseColor, aTargetColor, uGesture);

          // Shift hue warmer (towards orange-red) towards the bottom of the page (uScroll)
          vec3 warmColor = mix(mixedColor, vec3(1.0, 0.45, 0.1), uScroll * 0.4);
          vColor = warmColor;

          // Position setup
          vec3 pos = position;

          // Float upwards: speed increases when gesture is active
          float driftSpeed = mix(0.12, 0.45, uGesture) * aSpeed;
          pos.y += uTime * driftSpeed;
          
          // Wrap position inside Y [-5.0, 5.0]
          pos.y = mod(pos.y + 5.0, 10.0) - 5.0;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Size attenuation
          gl_PointSize = aSize * (250.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          // Circular soft particle shape
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.15, dist) * 0.85;
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
          attach="attributes-aSpeed"
          args={[speeds, 1]}
        />
        <bufferAttribute
          attach="attributes-aBaseColor"
          args={[baseColors, 3]}
        />
        <bufferAttribute
          attach="attributes-aTargetColor"
          args={[targetColors, 3]}
        />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  );
}

// Layer 3: Static Cultural Geometry Accents
function CulturalGeometry() {
  // Dharahara outline path
  const dharaharaPoints = useMemo(() => {
    const path = "M -0.15 -2 L 0.15 -2 L 0.15 1.5 L -0.15 1.5 Z M -0.25 1.5 L 0.25 1.5 L 0.25 1.62 L -0.25 1.62 Z M -0.12 1.62 L -0.12 2.1 L 0 2.4 L 0.12 2.1 L 0.12 1.62 Z M 0 2.4 L 0 2.7";
    return parseSVGPath(path);
  }, []);

  // Pashupatinath outline path
  const pashupatinathPoints = useMemo(() => {
    const path = "M -1.0 -1.5 L 1.0 -1.5 L 1.25 -1.0 L 0.4 -0.6 L -0.4 -0.6 L -1.25 -1.0 Z M -0.55 -0.6 L 0.55 -0.6 L 0.7 0.0 L 0.2 0.4 L -0.2 0.4 L -0.7 0.0 Z M -0.15 0.4 L 0.15 0.4 L 0.15 0.55 L -0.15 0.55 Z M 0 0.55 L 0 0.9";
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

  const dharaharaGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(dharaharaPoints), [dharaharaPoints]);
  const pashupatiGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(pashupatinathPoints), [pashupatinathPoints]);
  const boudhaGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(boudhanathPoints), [boudhanathPoints]);

  return (
    <group>
      {/* Dharahara: Center, Z = -4.8 */}
      <line position={[0.2, -0.6, -4.8]} scale={[0.85, 0.85, 1]}>
        <primitive object={dharaharaGeo} attach="geometry" />
        <lineBasicMaterial color="#f0ece4" transparent opacity={0.03} depthWrite={false} />
      </line>

      {/* Pashupatinath: Far left, Z = -4.0 */}
      <line position={[-3.8, -0.9, -4.0]} scale={[0.8, 0.8, 1]}>
        <primitive object={pashupatiGeo} attach="geometry" />
        <lineBasicMaterial color="#f0ece4" transparent opacity={0.04} depthWrite={false} />
      </line>

      {/* Boudhanath: Far right, Z = -4.0 */}
      <line position={[3.6, -0.9, -4.0]} scale={[0.85, 0.85, 1]}>
        <primitive object={boudhaGeo} attach="geometry" />
        <lineBasicMaterial color="#f0ece4" transparent opacity={0.03} depthWrite={false} />
      </line>
    </group>
  );
}

// Controller element for camera scroll parallax
function SceneController({ scrollProgress }) {
  const { camera } = useThree();

  useFrame(() => {
    // Scroll 0 -> 1: camera Z moves from 0 to -2
    camera.position.z = 0 - scrollProgress.current * 2.0;
  });

  return null;
}

export default function NepalBackground({ isGestureActive }) {
  const scrollProgress = useRef(0);

  // Passive window scroll listener to avoid scroll hijacking
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, 0], fov: 75, near: 0.1, far: 20 }}
        gl={{ antialias: true, alpha: false }}
      >
        <SceneController scrollProgress={scrollProgress} />
        
        {/* Layer 1: Mountain Plane */}
        <Mountains scrollProgress={scrollProgress} />
        
        {/* Layer 2: Kathmandu City Lights Particles */}
        <CityParticles scrollProgress={scrollProgress} isGestureActive={isGestureActive} />
        
        {/* Layer 3: Static Cultural Geometry outlines */}
        <CulturalGeometry />
      </Canvas>
    </div>
  );
}
