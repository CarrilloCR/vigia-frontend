'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, Suspense } from 'react'
import * as THREE from 'three'

const JADE = '#00C9A7'

function Core() {
  const inner = useRef<THREE.Mesh>(null)
  const wire = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.5)
    if (inner.current) {
      const mat = inner.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1.4 + pulse * 1.6
      inner.current.scale.setScalar(1 + pulse * 0.05)
      inner.current.rotation.y = t * 0.25
      inner.current.rotation.x = t * 0.15
    }
    if (wire.current) {
      wire.current.rotation.y = -t * 0.18
      wire.current.rotation.z = t * 0.12
      wire.current.scale.setScalar(1.18 + pulse * 0.03)
    }
    if (halo.current) {
      halo.current.scale.setScalar(1.55 + pulse * 0.08)
      const mat = halo.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.1 + pulse * 0.08
    }
  })

  return (
    <group>
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshStandardMaterial
          color={JADE}
          emissive={JADE}
          emissiveIntensity={1.8}
          metalness={0.3}
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={wire}>
        <icosahedronGeometry args={[1.6, 2]} />
        <meshBasicMaterial color={JADE} wireframe transparent opacity={0.4} toneMapped={false} />
      </mesh>
      <mesh ref={halo}>
        <sphereGeometry args={[1.6, 48, 48]} />
        <meshBasicMaterial color={JADE} transparent opacity={0.14} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} color={JADE} intensity={3} distance={10} />
      <pointLight position={[3, 3, 3]} color={JADE} intensity={1.2} distance={12} />
      <pointLight position={[-3, -2, 2]} color={JADE} intensity={1} distance={12} />
      <Core />
    </>
  )
}

export default function KpiScene3D() {
  return (
    <div style={{ width: '100%', height: 680, position: 'relative', pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
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
