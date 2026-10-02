import { useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

function FloatingShape({
  geometry,
  basePosition,
  wanderConfig,
  rotationSpeeds = [0.2, 0.1],
  floatConfig = { speed: 1.5, rotationIntensity: 0.3, floatIntensity: 0.4 },
  distortConfig = { distort: 0.3, speed: 1.5 },
  color,
  colorOffset = 0,
  reducedMotion = false,
}) {
  const meshRef = useRef()
  const materialRef = useRef()
  const positionRef = useRef(new THREE.Vector3(...basePosition))

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

    // Per-shape auto-rotation
    meshRef.current.rotation.x += delta * rotationSpeeds[0]
    meshRef.current.rotation.y += delta * rotationSpeeds[1]

    // Slow wandering drift (Lissajous curves)
    const t = state.clock.elapsedTime
    const wx = basePosition[0] + Math.sin(t * wanderConfig.freqX + wanderConfig.phaseX) * wanderConfig.ampX
    const wy = basePosition[1] + Math.cos(t * wanderConfig.freqY + wanderConfig.phaseY) * wanderConfig.ampY
    const wz = basePosition[2] + Math.sin(t * wanderConfig.freqZ + wanderConfig.phaseZ) * wanderConfig.ampZ * 0.5

    // Smooth lerp toward wander target
    positionRef.current.lerp(new THREE.Vector3(wx, wy, wz), 0.02)
    meshRef.current.position.copy(positionRef.current)
  })

  return (
    <Float
      speed={reducedMotion ? 0 : floatConfig.speed}
      rotationIntensity={reducedMotion ? 0 : floatConfig.rotationIntensity}
      floatIntensity={reducedMotion ? 0 : floatConfig.floatIntensity}
    >
      <mesh ref={meshRef} position={basePosition}>
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

    groupRef.current.rotation.y = pointerPos.current.x * 0.2
    groupRef.current.rotation.x = -pointerPos.current.y * 0.15

    // 2. Scroll reaction: gentle rotation based on total scroll through entire page
    const docHeight = document.documentElement.scrollHeight - window.innerHeight || 1
    const scrollFactor = Math.min(scrollRef.current / docHeight, 1)
    groupRef.current.rotation.z = scrollFactor * Math.PI * 0.25
  })

  // 5 shapes scattered across the full viewport with wandering drift configs.
  // Camera at z=8, fov=45 gives ~7 units wide, ~4 units tall visible area.
  // Wander amplitudes let shapes drift 1.5-2.2 units from base over ~40-70s cycles.
  const shapesData = useMemo(() => [
    {
      id: 'icosahedron',
      geometry: <icosahedronGeometry args={[0.5, 6]} />,
      basePosition: [-1.8, 1.2, 0.3],
      wanderConfig: { freqX: 0.08, freqY: 0.06, freqZ: 0.04, ampX: 1.8, ampY: 1.2, ampZ: 0.6, phaseX: 0, phaseY: 1.5, phaseZ: 0.8 },
      rotationSpeeds: [0.24, 0.16],
      floatConfig: { speed: 1.5, rotationIntensity: 0.32, floatIntensity: 0.4 },
      distortConfig: { distort: 0.22, speed: 1.2 },
      colorOffset: 0,
    },
    {
      id: 'torusknot',
      geometry: <torusKnotGeometry args={[0.34, 0.1, 48, 12]} />,
      basePosition: [2.2, -1.0, -0.4],
      wanderConfig: { freqX: 0.07, freqY: 0.09, freqZ: 0.05, ampX: 2.0, ampY: 1.4, ampZ: 0.5, phaseX: 2.1, phaseY: 0.4, phaseZ: 3.2 },
      rotationSpeeds: [-0.2, 0.22],
      floatConfig: { speed: 1.2, rotationIntensity: 0.45, floatIntensity: 0.5 },
      distortConfig: { distort: 0.18, speed: 1.1 },
      colorOffset: 0.035,
    },
    {
      id: 'octahedron',
      geometry: <octahedronGeometry args={[0.42, 0]} />,
      basePosition: [1.5, 1.5, -0.6],
      wanderConfig: { freqX: 0.1, freqY: 0.07, freqZ: 0.06, ampX: 1.5, ampY: 1.6, ampZ: 0.7, phaseX: 4.0, phaseY: 2.8, phaseZ: 1.0 },
      rotationSpeeds: [0.28, -0.18],
      floatConfig: { speed: 1.8, rotationIntensity: 0.48, floatIntensity: 0.35 },
      distortConfig: { distort: 0.24, speed: 1.3 },
      colorOffset: -0.035,
    },
    {
      id: 'sphere',
      geometry: <sphereGeometry args={[0.38, 16, 16]} />,
      basePosition: [-2.0, -1.3, 0.1],
      wanderConfig: { freqX: 0.06, freqY: 0.1, freqZ: 0.08, ampX: 1.6, ampY: 1.0, ampZ: 0.4, phaseX: 1.2, phaseY: 3.5, phaseZ: 5.0 },
      rotationSpeeds: [0.18, 0.26],
      floatConfig: { speed: 2.1, rotationIntensity: 0.25, floatIntensity: 0.55 },
      distortConfig: { distort: 0.25, speed: 1.4 },
      colorOffset: 0.02,
    },
    {
      id: 'dodecahedron',
      geometry: <dodecahedronGeometry args={[0.4, 0]} />,
      basePosition: [0.2, -0.3, 0.2],
      wanderConfig: { freqX: 0.09, freqY: 0.05, freqZ: 0.07, ampX: 2.2, ampY: 1.8, ampZ: 0.5, phaseX: 5.5, phaseY: 0.7, phaseZ: 2.4 },
      rotationSpeeds: [-0.22, -0.16],
      floatConfig: { speed: 1.3, rotationIntensity: 0.4, floatIntensity: 0.45 },
      distortConfig: { distort: 0.2, speed: 1.2 },
      colorOffset: -0.02,
    },
  ], [])

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {shapesData.map((item) => (
        <FloatingShape
          key={item.id}
          geometry={item.geometry}
          basePosition={item.basePosition}
          wanderConfig={item.wanderConfig}
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
      camera={{ position: [0, 0, 8], fov: 45 }}
      dpr={[1, 1.25]}
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
      <pointLight position={[0, -1, 3]} intensity={1.0} color={activeColor} />
      <FloatingShapesCluster color={activeColor} reducedMotion={reducedMotion} />
    </Canvas>
  )
}
