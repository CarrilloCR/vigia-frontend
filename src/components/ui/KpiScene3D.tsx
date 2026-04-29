'use client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles, Float, Line, Trail } from '@react-three/drei'
import { useRef, useMemo, Suspense } from 'react'
import * as THREE from 'three'

const JADE = '#00C9A7'
const SAPPHIRE = '#4A9EF0'
const ORCHID = '#B06EF5'
const CORAL = '#FF6B6B'
const GOLD = '#F5C518'

/* ── Central pulsing core ───────────────────────────────────────────── */
function Core() {
  const inner = useRef<THREE.Mesh>(null)
  const wire = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.5)
    if (inner.current) {
      const mat = inner.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1.2 + pulse * 1.4
      inner.current.scale.setScalar(1 + pulse * 0.06)
      inner.current.rotation.y = t * 0.25
      inner.current.rotation.x = t * 0.15
    }
    if (wire.current) {
      wire.current.rotation.y = -t * 0.18
      wire.current.rotation.z = t * 0.12
      wire.current.scale.setScalar(1.35 + pulse * 0.04)
    }
    if (halo.current) {
      halo.current.scale.setScalar(1.7 + pulse * 0.08)
      const mat = halo.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.08 + pulse * 0.07
    }
  })

  return (
    <group>
      <mesh ref={inner}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          color={JADE}
          emissive={JADE}
          emissiveIntensity={1.6}
          metalness={0.3}
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={wire}>
        <icosahedronGeometry args={[0.55, 2]} />
        <meshBasicMaterial color={JADE} wireframe transparent opacity={0.35} toneMapped={false} />
      </mesh>
      <mesh ref={halo}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial color={JADE} transparent opacity={0.12} toneMapped={false} />
      </mesh>
    </group>
  )
}

/* ── Expanding pulse rings ──────────────────────────────────────────── */
function PulseRing({ delay, color }: { delay: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const cycle = 4
    const t = ((clock.elapsedTime + delay) % cycle) / cycle
    const scale = 0.6 + t * 4.5
    ref.current.scale.set(scale, scale, scale)
    const mat = ref.current.material as THREE.MeshBasicMaterial
    mat.opacity = (1 - t) * 0.55
  })
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1, 0.012, 16, 80]} />
      <meshBasicMaterial color={color} transparent toneMapped={false} />
    </mesh>
  )
}

/* ── Orbiting data node with trail ──────────────────────────────────── */
function OrbitNode({
  radius, speed, tilt, phase, color, size = 0.09,
}: {
  radius: number; speed: number; tilt: number; phase: number; color: string; size?: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime * speed + phase
    const x = Math.cos(t) * radius
    const z = Math.sin(t) * radius
    const y = Math.sin(t * 0.7 + phase) * radius * 0.3
    // Apply tilt rotation
    const cos = Math.cos(tilt), sin = Math.sin(tilt)
    ref.current.position.set(x, y * cos - z * sin, y * sin + z * cos)
    const pulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 2 + phase)
    const mat = ref.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 2 + pulse * 1.5
  })
  return (
    <Trail width={1.2} length={4} color={color} attenuation={(t) => t * t}>
      <mesh ref={ref}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} />
      </mesh>
    </Trail>
  )
}

/* ── Heartbeat ribbon (ECG-like curve flowing) ──────────────────────── */
function HeartbeatRibbon({ y, color, speed, phase }: { y: number; color: string; speed: number; phase: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const N = 220
    for (let i = 0; i < N; i++) {
      const x = (i / N) * 8 - 4
      // ECG-like wave
      const u = (i / N) * Math.PI * 4
      let h = Math.sin(u) * 0.18
      // Spike pattern
      const s = (i % 55) / 55
      if (s > 0.45 && s < 0.55) h += Math.sin((s - 0.45) / 0.1 * Math.PI) * 0.6
      pts.push(new THREE.Vector3(x, h, 0))
    }
    return pts
  }, [])
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points])
  const geom = useMemo(() => new THREE.TubeGeometry(curve, 220, 0.018, 8, false), [curve])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime * speed + phase
    ref.current.position.x = -((t * 0.8) % 4)
    ref.current.position.y = y
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.3 + phase) * 0.08
  })

  return (
    <mesh ref={ref} geometry={geom}>
      <meshBasicMaterial color={color} transparent opacity={0.7} toneMapped={false} />
    </mesh>
  )
}

/* ── Connection lines from core to orbital plane ────────────────────── */
function DataBeam({ angle, color, speed }: { angle: number; color: string; speed: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = (clock.elapsedTime * speed) % 1
    const mat = ref.current.material as THREE.MeshBasicMaterial
    mat.opacity = Math.sin(t * Math.PI) * 0.6
  })
  const x = Math.cos(angle) * 1.6
  const z = Math.sin(angle) * 1.6
  return (
    <mesh ref={ref} position={[x / 2, 0, z / 2]} rotation={[0, -angle, Math.PI / 2]}>
      <cylinderGeometry args={[0.006, 0.006, 1.6, 6]} />
      <meshBasicMaterial color={color} transparent toneMapped={false} />
    </mesh>
  )
}

/* ── Floating glyphs (KPI markers) ──────────────────────────────────── */
function Glyph({ position, color, shape }: { position: [number, number, number]; color: string; shape: 'tri' | 'box' | 'oct' }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.x = clock.elapsedTime * 0.4
    ref.current.rotation.y = clock.elapsedTime * 0.3
  })
  return (
    <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.6}>
      <mesh ref={ref} position={position}>
        {shape === 'tri' && <tetrahedronGeometry args={[0.16]} />}
        {shape === 'box' && <boxGeometry args={[0.2, 0.2, 0.2]} />}
        {shape === 'oct' && <octahedronGeometry args={[0.18]} />}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.8}
          metalness={0.4}
          roughness={0.25}
          toneMapped={false}
        />
      </mesh>
    </Float>
  )
}

/* ── Cinematic auto camera drift ────────────────────────────────────── */
function CinematicCamera() {
  const { camera } = useThree()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    camera.position.x = Math.sin(t * 0.12) * 0.7
    camera.position.y = 1.0 + Math.sin(t * 0.08) * 0.35
    camera.position.z = 6.5 + Math.cos(t * 0.1) * 0.4
    camera.lookAt(0, 0, 0)
  })
  return null
}

/* ── Scene ──────────────────────────────────────────────────────────── */
function Scene() {
  const orbits = useMemo(() => [
    { r: 1.6, s: 0.9, tilt: 0.0, ph: 0, c: JADE },
    { r: 1.8, s: -0.7, tilt: 0.6, ph: 1.2, c: SAPPHIRE },
    { r: 2.2, s: 0.55, tilt: -0.5, ph: 2.5, c: ORCHID },
    { r: 2.0, s: -0.45, tilt: 1.1, ph: 0.7, c: JADE, size: 0.07 },
    { r: 2.6, s: 0.4, tilt: 0.3, ph: 3.4, c: CORAL, size: 0.08 },
    { r: 1.9, s: 0.75, tilt: -1.0, ph: 4.1, c: GOLD, size: 0.06 },
  ], [])

  const beams = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * Math.PI * 2,
    color: i % 2 === 0 ? JADE : ORCHID,
    speed: 0.5 + (i % 3) * 0.2,
  })), [])

  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 0]} color={JADE} intensity={2.5} distance={8} />
      <pointLight position={[3, 2, 2]} color={ORCHID} intensity={1.2} distance={10} />
      <pointLight position={[-3, -1, 2]} color={SAPPHIRE} intensity={1.0} distance={10} />

      <CinematicCamera />
      <Core />

      {[0, 1.3, 2.6].map(d => (
        <PulseRing key={d} delay={d} color={JADE} />
      ))}
      <PulseRing delay={2.0} color={ORCHID} />

      {orbits.map((o, i) => (
        <OrbitNode key={i} radius={o.r} speed={o.s} tilt={o.tilt} phase={o.ph} color={o.c} size={o.size} />
      ))}

      {beams.map((b, i) => (
        <DataBeam key={i} angle={b.angle} color={b.color} speed={b.speed} />
      ))}

      <HeartbeatRibbon y={1.6} color={JADE} speed={1.0} phase={0} />
      <HeartbeatRibbon y={-1.4} color={ORCHID} speed={0.7} phase={2} />
      <HeartbeatRibbon y={2.4} color={SAPPHIRE} speed={0.5} phase={4} />

      <Glyph position={[2.8, 1.4, -1]} color={JADE} shape="oct" />
      <Glyph position={[-2.9, 1.0, -0.5]} color={ORCHID} shape="tri" />
      <Glyph position={[2.5, -1.5, 0.6]} color={SAPPHIRE} shape="box" />
      <Glyph position={[-2.6, -1.2, -0.8]} color={CORAL} shape="oct" />

      <Sparkles count={120} scale={[12, 8, 8]} size={1.8} speed={0.25} color={JADE} opacity={0.5} />
      <Sparkles count={80} scale={[10, 6, 6]} size={1.2} speed={0.15} color={ORCHID} opacity={0.4} />
      <Sparkles count={60} scale={[14, 10, 10]} size={2.5} speed={0.1} color={SAPPHIRE} opacity={0.3} />

      <fog attach="fog" args={['#050210', 7, 15]} />
    </>
  )
}

export default function KpiScene3D() {
  return (
    <div style={{ width: '100%', height: 680, position: 'relative', pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 1, 6.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
