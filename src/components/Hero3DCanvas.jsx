import { useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

function FloatingShape({
  geometry,
  position,
  rotationSpeeds = [0.2, 0.1],
  floatConfig = { speed: 1.5, rotationIntensity: 0.3, floatIntensity: 0.4 },
  distortConfig = { distort: 0.3, speed: 1.5 },
  color,
  colorOffset = 0,
  reducedMotion = false,
}) {
  const meshRef = useRef()
  const materialRef = useRef()

  // Harmonious subtle hue/lightness variation around the active swatch color
  const targetColor = useMemo(() => {
    const col = new THREE.Color(color)
    if (colorOffset !== 0) {
      const hsl = { h: 0, s: 0, l: 0 }
      col.getHSL(hsl)
      hsl.h = (hsl.h + colorOffset + 1) % 1
      hsl.s = THREE.MathUtils.clamp(hsl.s + colorOffset * 0.15, 0.65, 1)
      hsl.l = THREE.MathUtils.clamp(hsl.l + (colorOffset > 0 ? 0.03 : -0.03), 0.45, 0.7)
      col.setHSL(hsl.h, hsl.s, hsl.l)
    }
    return col
  }, [color, colorOffset])

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return

    // Smooth color transition on swatch selection
    materialRef.current.color.lerp(targetColor, 0.08)

    // Skip continuous motion when reduced motion is preferred
    if (reducedMotion) return

    meshRef.current.rotation.x += delta * rotationSpeeds[0]
    meshRef.current.rotation.y += delta * rotationSpeeds[1]
  })

  return (
    <Float
      speed={reducedMotion ? 0 : floatConfig.speed}
      rotationIntensity={reducedMotion ? 0 : floatConfig.rotationIntensity}
      floatIntensity={reducedMotion ? 0 : floatConfig.floatIntensity}
    >
      <mesh ref={meshRef} position={position}>
        {geometry}
        <MeshDistortMaterial
          ref={materialRef}
          color={targetColor}
          roughness={0.16}
          metalness={0.72}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          distort={reducedMotion ? distortConfig.distort * 0.6 : distortConfig.distort}
          speed={reducedMotion ? 0 : distortConfig.speed}
          wireframe={false}
        />
      </mesh>
    </Float>
  )
}

function FloatingShapesCluster({ color, reducedMotion = false }) {
  const groupRef = useRef()
  const { viewport } = useThree()

  // Pointer position for smooth parallax tilt
  const pointerPos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  // Scroll position
  const scrollRef = useRef(0)

  useEffect(() => {
    if (reducedMotion) return

    const handlePointerMove = (e) => {
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
  }, [reducedMotion])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Skip all parallax / scroll motion when reduced motion is preferred
    if (reducedMotion) return

    // 1. Smooth group parallax tilt toward cursor
    pointerPos.current.x = THREE.MathUtils.lerp(pointerPos.current.x, pointerPos.current.targetX, 0.05)
    pointerPos.current.y = THREE.MathUtils.lerp(pointerPos.current.y, pointerPos.current.targetY, 0.05)

    groupRef.current.rotation.y = pointerPos.current.x * 0.28
    groupRef.current.rotation.x = -pointerPos.current.y * 0.22

    // 2. Scroll reaction: rotation and responsive scaling
    const scrollFactor = Math.min(scrollRef.current / (window.innerHeight || 800), 2)
    groupRef.current.rotation.z = scrollFactor * Math.PI * 0.35

    const baseScale = viewport.width < 5 ? 0.78 : 1
    const targetScale = Math.max(0.65, (1 - scrollFactor * 0.12) * baseScale)
    groupRef.current.scale.set(targetScale, targetScale, targetScale)
  })

  // 5 smaller floating shapes of mixed geometry:
  // 1. Icosahedron (center-top behind heading)
  // 2. Torus Knot (lower-left behind role/tagline)
  // 3. Octahedron (upper-right of text, contained in left column)
  // 4. Sphere (upper-left near greeting/badge)
  // 5. Dodecahedron (lower-right behind stats/actions)
  const shapesData = useMemo(() => [
    {
      id: 'icosahedron',
      geometry: <icosahedronGeometry args={[0.55, 16]} />,
      position: [-0.2, 0.45, 0.2],
      rotationSpeeds: [0.24, 0.16],
      floatConfig: { speed: 1.5, rotationIntensity: 0.32, floatIntensity: 0.4 },
      distortConfig: { distort: 0.3, speed: 1.6 },
      colorOffset: 0,
    },
    {
      id: 'torusknot',
      geometry: <torusKnotGeometry args={[0.38, 0.12, 64, 16]} />,
      position: [-1.25, -0.65, -0.3],
      rotationSpeeds: [-0.2, 0.22],
      floatConfig: { speed: 1.2, rotationIntensity: 0.45, floatIntensity: 0.5 },
      distortConfig: { distort: 0.25, speed: 1.4 },
      colorOffset: 0.035,
    },
    {
      id: 'octahedron',
      geometry: <octahedronGeometry args={[0.48, 0]} />,
      position: [1.15, 0.65, -0.35],
      rotationSpeeds: [0.28, -0.18],
      floatConfig: { speed: 1.8, rotationIntensity: 0.48, floatIntensity: 0.35 },
      distortConfig: { distort: 0.32, speed: 1.8 },
      colorOffset: -0.035,
    },
    {
      id: 'sphere',
      geometry: <sphereGeometry args={[0.42, 24, 24]} />,
      position: [-1.15, 0.85, 0.1],
      rotationSpeeds: [0.18, 0.26],
      floatConfig: { speed: 2.1, rotationIntensity: 0.25, floatIntensity: 0.55 },
      distortConfig: { distort: 0.35, speed: 2.0 },
      colorOffset: 0.02,
    },
    {
      id: 'dodecahedron',
      geometry: <dodecahedronGeometry args={[0.45, 0]} />,
      position: [0.75, -0.85, 0.15],
      rotationSpeeds: [-0.22, -0.16],
      floatConfig: { speed: 1.3, rotationIntensity: 0.4, floatIntensity: 0.45 },
      distortConfig: { distort: 0.28, speed: 1.5 },
      colorOffset: -0.02,
    },
  ], [])

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {shapesData.map((item) => (
        <FloatingShape
          key={item.id}
          geometry={item.geometry}
          position={item.position}
          rotationSpeeds={item.rotationSpeeds}
          floatConfig={item.floatConfig}
          distortConfig={item.distortConfig}
          color={color}
          colorOffset={item.colorOffset}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  )
}

export default function Hero3DCanvas({ activeColor = '#8b5cf6', reducedMotion = false }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.8], fov: 45 }}
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
      <pointLight position={[0, -1, 2]} intensity={1.2} color={activeColor} />
      <FloatingShapesCluster color={activeColor} reducedMotion={reducedMotion} />
    </Canvas>
  )
}
