'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Float, RoundedBox, OrbitControls, ContactShadows,
  Sparkles, Environment, Text, Html,
} from '@react-three/drei'
import { useRef, useMemo, Suspense } from 'react'
import * as THREE from 'three'

const JADE = '#00C9A7'
const SAPPHIRE = '#4A9EF0'
const ORCHID = '#B06EF5'
const CORAL = '#FF6B6B'
const GOLD = '#F5C518'

function Bar({ x, height, color, delay }: { x: number; height: number; color: string; delay: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const targetH = height
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = Math.max(0, clock.elapsedTime - delay)
    const eased = Math.min(1, 1 - Math.pow(1 - Math.min(t / 0.9, 1), 3))
    const h = targetH * eased + 0.001
    ref.current.scale.y = h
    ref.current.position.y = h / 2
    const pulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 1.2 + x * 2)
    const mat = ref.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 0.6 + pulse * 0.5
  })
  return (
    <mesh ref={ref} position={[x, 0, 0]} castShadow>
      <boxGeometry args={[0.32, 1, 0.32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        metalness={0.4}
        roughness={0.25}
      />
    </mesh>
  )
}

function BarChart() {
  const heights = [0.7, 0.45, 1.1, 0.6, 1.3, 0.55, 1.5, 0.85]
  const barColors = [SAPPHIRE, SAPPHIRE, JADE, SAPPHIRE, JADE, SAPPHIRE, JADE, SAPPHIRE]
  return (
    <group position={[0, -1.6, 0]}>
      {heights.map((h, i) => (
        <Bar
          key={i}
          x={(i - 3.5) * 0.42}
          height={h}
          color={barColors[i]}
          delay={0.4 + i * 0.08}
        />
      ))}
      {/* Base platform */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[4.2, 0.08, 0.6]} />
        <meshStandardMaterial color="#0a0716" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function HoloMonitor() {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.08
    }
  })
  return (
    <group ref={ref} position={[0, 0.4, 0]}>
      {/* Bezel */}
      <RoundedBox args={[3.4, 2.1, 0.18]} radius={0.08} smoothness={4} castShadow>
        <meshStandardMaterial color="#120a26" metalness={0.8} roughness={0.3} />
      </RoundedBox>
      {/* Screen */}
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[3.15, 1.85]} />
        <meshStandardMaterial
          color="#040210"
          emissive={JADE}
          emissiveIntensity={0.18}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      {/* Screen content via Html overlay */}
      <Html
        transform
        occlude
        position={[0, 0, 0.11]}
        distanceFactor={1.6}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          width: 320, height: 188,
          background: 'linear-gradient(180deg, rgba(6,4,16,0.95), rgba(10,7,22,0.95))',
          borderRadius: 8, padding: 12,
          fontFamily: 'monospace', color: 'white',
          boxShadow: 'inset 0 0 30px rgba(0,201,167,0.15)',
        }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8, alignItems: 'center' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: CORAL }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: JADE }} />
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginLeft: 6, letterSpacing: 1 }}>VIGÍA · DASHBOARD</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5, marginBottom: 9 }}>
            {[
              { v: '94%', l: 'Ocupación', c: JADE },
              { v: '127', l: 'Citas', c: SAPPHIRE },
              { v: '8.7', l: 'KPI', c: ORCHID },
            ].map(k => (
              <div key={k.l} style={{ background: `${k.c}18`, border: `1px solid ${k.c}50`, borderRadius: 6, padding: '6px 7px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: k.c }}>{k.v}</div>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{k.l}</div>
              </div>
            ))}
          </div>
          <svg width="296" height="58" viewBox="0 0 296 58">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={JADE} stopOpacity="0.5" />
                <stop offset="100%" stopColor={JADE} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 50 L 37 36 L 74 44 L 110 22 L 148 32 L 185 14 L 222 26 L 259 8 L 296 18 L 296 58 L 0 58 Z"
              fill="url(#g1)"
            />
            <path
              d="M 0 50 L 37 36 L 74 44 L 110 22 L 148 32 L 185 14 L 222 26 L 259 8 L 296 18"
              stroke={JADE} strokeWidth="2" fill="none" strokeLinecap="round"
            />
          </svg>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { c: CORAL, t: 'Ausencias alta', s: 'ALTA' },
              { c: GOLD, t: 'Espera >30 min', s: 'MEDIA' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: `${a.c}12`, border: `1px solid ${a.c}40`, borderRadius: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.c, boxShadow: `0 0 6px ${a.c}` }} />
                <span style={{ fontSize: 8, flex: 1, color: 'rgba(255,255,255,0.7)' }}>{a.t}</span>
                <span style={{ fontSize: 7, fontWeight: 700, color: a.c, padding: '1px 5px', borderRadius: 3, background: `${a.c}25` }}>{a.s}</span>
              </div>
            ))}
          </div>
        </div>
      </Html>
      {/* Glow rim */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[3.7, 2.4]} />
        <meshBasicMaterial color={JADE} transparent opacity={0.08} />
      </mesh>
      {/* Stand */}
      <mesh position={[0, -1.25, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.18, 0.5, 12]} />
        <meshStandardMaterial color="#1a1030" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, -1.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.7, 0.08, 24]} />
        <meshStandardMaterial color="#140b28" metalness={0.6} roughness={0.5} />
      </mesh>
    </group>
  )
}

function FloatingCard({
  position, color, label, value,
}: { position: [number, number, number]; color: string; label: string; value: string }) {
  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.7}>
      <group position={position}>
        <RoundedBox args={[1.3, 0.7, 0.08]} radius={0.06} smoothness={4} castShadow>
          <meshStandardMaterial
            color="#0a0518"
            emissive={color}
            emissiveIntensity={0.15}
            metalness={0.4}
            roughness={0.3}
          />
        </RoundedBox>
        {/* Glow accent line */}
        <mesh position={[-0.55, 0, 0.045]}>
          <boxGeometry args={[0.04, 0.5, 0.02]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} />
        </mesh>
        <Text
          position={[0.05, 0.14, 0.05]}
          fontSize={0.16}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {value}
        </Text>
        <Text
          position={[0.05, -0.13, 0.05]}
          fontSize={0.085}
          color="rgba(255,255,255,0.6)"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    </Float>
  )
}

function OrbitRing({ radius, color, speed, tilt }: { radius: number; color: string; speed: number; tilt: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.elapsedTime * speed
  })
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.008, 16, 100]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} transparent opacity={0.6} />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-3, 2, 3]} color={JADE} intensity={1.6} distance={10} />
      <pointLight position={[3, -1, 4]} color={ORCHID} intensity={1.2} distance={10} />
      <pointLight position={[0, 4, -2]} color={SAPPHIRE} intensity={0.9} distance={10} />

      <Suspense fallback={null}>
        <Environment preset="night" />
      </Suspense>

      <HoloMonitor />
      <BarChart />

      <FloatingCard position={[-3.2, 1.4, 1.2]} color={CORAL} label="Alerta crítica" value="ALTA" />
      <FloatingCard position={[3.2, 1.0, 1.2]} color={JADE} label="Ocupación" value="+12%" />
      <FloatingCard position={[-3.0, -0.8, 1.4]} color={ORCHID} label="Reportes" value="3 nuevos" />
      <FloatingCard position={[3.1, -1.3, 0.8]} color={SAPPHIRE} label="Citas hoy" value="127" />

      <OrbitRing radius={3.2} color={JADE} speed={0.15} tilt={Math.PI / 2.4} />
      <OrbitRing radius={3.6} color={ORCHID} speed={-0.1} tilt={Math.PI / 3} />

      <Sparkles count={60} scale={[10, 6, 6]} size={2} speed={0.3} color={JADE} opacity={0.5} />
      <Sparkles count={40} scale={[10, 6, 6]} size={1.5} speed={0.2} color={ORCHID} opacity={0.4} />

      <ContactShadows
        position={[0, -2.3, 0]}
        opacity={0.55}
        scale={10}
        blur={2.4}
        far={4}
        color="#000020"
      />
    </>
  )
}

export default function KpiScene3D() {
  return (
    <div style={{ width: '100%', height: 680, position: 'relative' }}>
      <Canvas
        shadows
        camera={{ position: [0, 1.2, 7.5], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent', cursor: 'grab' }}
      >
        <Scene />
        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={5}
          maxDistance={12}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.7}
          autoRotate
          autoRotateSpeed={0.5}
          dampingFactor={0.08}
        />
      </Canvas>
      <div style={{
        position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center',
        fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5,
        fontFamily: 'monospace', pointerEvents: 'none',
      }}>
        scroll · zoom    drag · rotate
      </div>
    </div>
  )
}
