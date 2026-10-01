import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

function ProceduralShape({ color }) {
  const meshRef = useRef()
  const materialRef = useRef()
  const groupRef = useRef()
  const { viewport } = useThree()

  // Track pointer for smooth parallax tilt
  const pointerPos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  // Track scroll position
  const scrollRef = useRef(0)

  useEffect(() => {
    const handlePointerMove = (e) => {
      // Map cursor coordinates to -1 to +1 normalized range
      pointerPos.current.targetX = (e.clientX / window.innerWidth) * 2 - 1
      pointerPos.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1
    }

    const handleScroll = () => {
      scrollRef.current = window.scrollY || window.pageYOffset
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useFrame((state, delta) => {
    if (!meshRef.current || !groupRef.current) return

    // 1. Slow, ambient auto-rotation
    meshRef.current.rotation.y += delta * 0.25
    meshRef.current.rotation.x += delta * 0.12

    // 2. Smooth parallax tilt toward cursor
    pointerPos.current.x = THREE.MathUtils.lerp(pointerPos.current.x, pointerPos.current.targetX, 0.05)
    pointerPos.current.y = THREE.MathUtils.lerp(pointerPos.current.y, pointerPos.current.targetY, 0.05)
    
    groupRef.current.rotation.y = pointerPos.current.x * 0.35
    groupRef.current.rotation.x = -pointerPos.current.y * 0.3

    // 3. Scroll reaction: additional rotation and responsive scaling
    const scrollFactor = Math.min(scrollRef.current / (window.innerHeight || 800), 2)
    meshRef.current.rotation.z = scrollFactor * Math.PI * 0.6
    
    const baseScale = viewport.width < 6 ? 0.75 : 1
    const targetScale = Math.max(0.6, (1 - scrollFactor * 0.15) * baseScale)
    meshRef.current.scale.set(targetScale, targetScale, targetScale)

    // 4. Smooth color transition
    if (materialRef.current && color) {
      materialRef.current.color.lerp(new THREE.Color(color), 0.08)
    }
  })

  // Position: On wide screens, position slightly to the right behind carousel / center
  const posX = viewport.width > 7 ? 0.7 : 0

  return (
    <group ref={groupRef} position={[posX, 0, 0]}>
      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
        <mesh ref={meshRef}>
          {/* Distorted Icosahedron geometry */}
          <icosahedronGeometry args={[1.85, 32]} />
          <MeshDistortMaterial
            ref={materialRef}
            color={color}
            roughness={0.15}
            metalness={0.75}
            clearcoat={0.9}
            clearcoatRoughness={0.1}
            distort={0.42}
            speed={1.8}
            wireframe={false}
          />
        </mesh>
      </Float>
    </group>
  )
}

export default function Hero3DCanvas({ activeColor = '#8b5cf6' }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <directionalLight position={[-10, -5, -5]} intensity={0.5} />
      <pointLight position={[0, -2, 2]} intensity={1.2} color={activeColor} />
      <ProceduralShape color={activeColor} />
    </Canvas>
  )
}
