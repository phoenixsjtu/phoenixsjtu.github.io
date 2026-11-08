import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import './EngineeringScene.css'

// Original conceptual field on a wafer-like surface. No measured data or solver claims.
export default function EngineeringScene({ paused, compact = false }: { paused: boolean; compact?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(paused)
  const syncRef = useRef<(() => void) | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => { pausedRef.current = paused; syncRef.current?.() }, [paused])
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }) }
    catch { setFailed(true); return }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    host.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 60)
    camera.position.set(0, 3.8, 11.8)
    camera.lookAt(0, 0, 0)
    const field = new THREE.Group()
    field.rotation.x = -1.36
    field.scale.setScalar(1.35)
    field.rotation.z = -.13
    scene.add(field)
    if (!compact) {
    const surface = new THREE.RingGeometry(0, 3.15, 112, 28)
    const positions = surface.attributes.position
    const colors = new Float32Array(positions.count * 3)
    const cold = new THREE.Color('#1556d5'), mid = new THREE.Color('#50c9f1'), warm = new THREE.Color('#ef915d')
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i)
      const peak = Math.exp(-((x + .65) ** 2 * .8 + (y - .4) ** 2 * .5))
      const value = Math.min(1, peak * .85 + .1 * Math.sin(x * 2 + y) + .1)
      positions.setZ(i, .08 + peak * .32)
      const color = value < .6 ? cold.clone().lerp(mid, value / .6) : mid.clone().lerp(warm, (value - .6) / .4)
      color.toArray(colors, i * 3)
    }
    surface.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    surface.computeVertexNormals()
    field.add(new THREE.Mesh(surface, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })))
    field.add(new THREE.LineSegments(new THREE.WireframeGeometry(surface), new THREE.LineBasicMaterial({ color: '#153565', transparent: true, opacity: .26 })))
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.16, 3.16, .1, 112), new THREE.MeshStandardMaterial({ color: '#b8c8e0', metalness: .65, roughness: .35 }))
    base.rotation.x = Math.PI / 2
    base.position.z = -.04
    field.add(base)
    scene.add(new THREE.AmbientLight('#ffffff', 2.4))
    const light = new THREE.DirectionalLight('#ffffff', 3)
    light.position.set(-3, 7, 8)
    scene.add(light)
    const ringMaterial = new THREE.LineBasicMaterial({ color: '#6e88ad', transparent: true, opacity: .3 })
    for (const radius of [3.45, 3.8, 4.35]) {
      const points = Array.from({ length: 145 }, (_, i) => new THREE.Vector3(Math.cos(i / 144 * Math.PI * 2) * radius, Math.sin(i / 144 * Math.PI * 2) * radius, -.24))
      field.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), ringMaterial))
    }
    }
    const curves: THREE.CatmullRomCurve3[] = []
    for (let i = 0; i < 12; i++) {
      const offset = (i - 5.5) * .35
      const points = Array.from({ length: 26 }, (_, n) => {
        const x = -6.8 + n / 25 * 13.6
        return new THREE.Vector3(x, offset + Math.sin(x * .55 + i * .08) * .22, .6 + Math.exp(-x * x / 8) * (.6 + i * .025))
      })
      const curve = new THREE.CatmullRomCurve3(points)
      curves.push(curve)
      field.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(100)), new THREE.LineBasicMaterial({ color: i % 3 ? '#4289df' : '#28b8d7', transparent: true, opacity: compact ? .5 : .2 })))
    }
    const particlePositions = new Float32Array(curves.length * 3 * 3)
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: '#1861d8', size: .043, transparent: true, opacity: .8, sizeAttenuation: true }))
    field.add(particles)
    if (!compact) {
    const grid = new THREE.GridHelper(28, 38, '#b4c5db', '#d0dbe9')
    grid.position.y = -2.2
    const gridMaterial = grid.material as THREE.Material
    gridMaterial.transparent = true
    gridMaterial.opacity = .22
    scene.add(grid)
    }
    let alive = true, visible = false, broken = false, frame = 0, last = 0, elapsed = 4
    const render = () => {
      for (let i = 0; i < curves.length; i++) for (let j = 0; j < 3; j++) {
        const point = curves[i].getPoint((elapsed * .035 + i * .071 + j / 3) % 1)
        point.toArray(particlePositions, (i * 3 + j) * 3)
      }
      particleGeometry.attributes.position.needsUpdate = true
      renderer.render(scene, camera)
    }
    const tick = (time: number) => {
      frame = 0
      if (!alive || broken || !visible || document.hidden || pausedRef.current) return
      if (!last || time - last >= 1000 / 30) {
        elapsed += last ? Math.min((time - last) / 1000, .1) : 0
        last = time
        field.rotation.z = -.13 + Math.sin(elapsed * .09) * .035
        render()
      }
      if (!broken) frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0; last = 0
      if (alive && !broken && visible && !document.hidden && !pausedRef.current) frame = requestAnimationFrame(tick)
    }
    syncRef.current = sync
    const fail = () => { broken = true; sync(); setFailed(true) }
    renderer.debug.onShaderError = fail
    const resize = () => {
      const { width, height } = host.getBoundingClientRect()
      if (!width || !height || broken) return
      camera.aspect = width / height
      camera.position.z = width < 650 ? 17 : 11.8
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      render()
    }
    const lost = (event: Event) => { event.preventDefault(); fail() }
    const sizeObserver = new ResizeObserver(resize)
    sizeObserver.observe(host)
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() }, { rootMargin: '60px' })
    visibility.observe(host)
    renderer.domElement.addEventListener('webglcontextlost', lost)
    document.addEventListener('visibilitychange', sync)
    resize()
    return () => {
      alive = false
      if (frame) cancelAnimationFrame(frame)
      syncRef.current = null
      sizeObserver.disconnect(); visibility.disconnect()
      document.removeEventListener('visibilitychange', sync)
      renderer.domElement.removeEventListener('webglcontextlost', lost)
      const materials = new Set<THREE.Material>()
      scene.traverse(object => {
        const drawable = object as THREE.Mesh
        drawable.geometry?.dispose()
        if (drawable.material) (Array.isArray(drawable.material) ? drawable.material : [drawable.material]).forEach(material => materials.add(material))
      })
      materials.forEach(material => material.dispose())
      renderer.dispose(); renderer.domElement.remove()
    }
  }, [compact])
  return <div className={`engineering-background${failed ? ' engineering-background-fallback' : ''}`} ref={hostRef} aria-hidden="true" />
}
