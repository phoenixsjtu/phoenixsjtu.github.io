import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import './DownloadedWavesBackground.css'

/*
 * Geometry, randomized triangulation and trochoid wave formula adapted from
 * Vanta Waves, Copyright (c) 2020 Teng Bao, MIT License.
 * https://github.com/tengbao/vanta/blob/f8b351906688b56f0fc744e53bde81fc3c56f150/src/vanta.waves.js
 * Modifications: deterministic seed, modern lighting, React lifecycle and
 * explicit pause/visibility/frame/pixel controls. Upstream source is retained
 * unchanged in third-party/vanta-waves; its LICENSE accompanies the download.
 */
const WAVE_SPEED = 0.48
const WAVE_HEIGHT = 36
const FRAME_INTERVAL = 1000 / 30

function createWavesGeometry(mobile: boolean) {
  const columns = mobile ? 64 : 100
  const rows = mobile ? 48 : 80
  const stride = rows + 1
  const count = (columns + 1) * stride
  const positions = new Float32Array(count * 3)
  const heights = new Float32Array(count)
  const phases = new Float32Array(count)
  const indices: number[] = []
  let seed = 0x56f150
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }

  for (let i = 0; i <= columns; i++) {
    for (let j = 0; j <= rows; j++) {
      const vertex = i * stride + j
      const x = (i - columns * 0.5) * 18
      const z = (rows * 0.5 - j) * 18
      const y = random() * 4 - 10
      positions.set([x, y, z], vertex * 3)
      heights[vertex] = y
      const crossChop = Math.sqrt(WAVE_SPEED) * Math.cos(-x - z * 0.7)
      phases[vertex] = -WAVE_SPEED * x * 0.025 + WAVE_SPEED * z * 0.015 + crossChop
    }
  }

  for (let i = 1; i <= columns; i++) {
    for (let j = 1; j <= rows; j++) {
      const d = i * stride + j
      const b = d - 1
      const c = (i - 1) * stride + j
      const a = c - 1
      if (random() >= 0.5) indices.push(a, b, c, b, c, d)
      else indices.push(a, b, d, a, c, d)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage))
  geometry.setIndex(indices)
  const update = (elapsedSeconds: number) => {
    // Upstream t advances once per 60Hz frame. Preserve its time scale.
    const time = WAVE_SPEED * elapsedSeconds * 60 * 0.02
    for (let vertex = 0; vertex < count; vertex++) {
      const delta = Math.sin(time + phases[vertex])
      const trochoidDelta = Math.pow(delta + 1, 2) / 4
      positions[vertex * 3 + 1] = heights[vertex] + trochoidDelta * WAVE_HEIGHT
    }
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
  }
  return { geometry, update }
}

export default function DownloadedWavesBackground({ paused }: { paused: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(paused)
  const syncRef = useRef<(() => void) | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    pausedRef.current = paused
    syncRef.current?.()
  }, [paused])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    setReady(false)
    setFailed(false)
    setRunning(false)
    const canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    let renderer: THREE.WebGLRenderer
    let context: WebGL2RenderingContext | null = null
    try {
      context = canvas.getContext('webgl2', {
        alpha: false,
        antialias: false,
        powerPreference: 'low-power',
        stencil: false,
      })
      if (!context) {
        setFailed(true)
        return
      }
      renderer = new THREE.WebGLRenderer({ canvas, context, antialias: false, alpha: false })
    } catch {
      context?.getExtension('WEBGL_lose_context')?.loseContext()
      setFailed(true)
      return
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    host.appendChild(canvas)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#080a0f')
    scene.fog = new THREE.FogExp2('#080a0f', 0.0007)
    const material = new THREE.MeshPhongMaterial({
      color: '#285b9b',
      specular: '#8faee1',
      shininess: 48,
      flatShading: true,
      side: THREE.DoubleSide,
    })
    let mobile = window.innerWidth < 768
    let terrain = createWavesGeometry(mobile)
    const surface = new THREE.Mesh(terrain.geometry, material)
    surface.frustumCulled = false
    scene.add(surface)

    scene.add(new THREE.HemisphereLight('#7f9bc9', '#02040a', 0.65))
    const key = new THREE.DirectionalLight('#b4ceff', 2.3)
    key.position.set(-180, 420, 280)
    scene.add(key)
    const rim = new THREE.DirectionalLight('#8574bc', 0.85)
    rim.position.set(380, 210, -260)
    scene.add(rim)

    const camera = new THREE.PerspectiveCamera(35, 1, 50, 10000)
    const cameraHome = new THREE.Vector3(240, 200, 390)
    const cameraTarget = new THREE.Vector3(140, -30, 190)
    const cameraGoal = cameraHome.clone()
    camera.position.copy(cameraHome)
    camera.lookAt(cameraTarget)
    const pointer = new THREE.Vector2()
    let alive = true
    let broken = false
    let inView = typeof IntersectionObserver === 'undefined'
    let width = 0
    let height = 0
    let pixelRatio = 0
    let frameRequest = 0
    let lastDrawTime = 0
    let lastClockTime = 0
    let elapsedSeconds = 8
    let renderedFrames = 0
    let firstRender = true
    let teardown: (() => void) | undefined

    const canAnimate = () => alive && !broken && inView && !document.hidden && !pausedRef.current && width > 0 && height > 0
    const fail = () => {
      if (!alive || broken) return
      broken = true
      sync()
      setReady(false)
      setFailed(true)
      // Avoid disposing renderer internals inside an active render callback.
      queueMicrotask(() => teardown?.())
    }
    const render = () => {
      if (!alive || broken) return
      try {
        renderer.render(scene, camera)
        if (broken) return
        host.dataset.frame = String(++renderedFrames)
        if (firstRender) {
          firstRender = false
          setReady(true)
        }
      } catch {
        fail()
      }
    }
    const tick = (time: number) => {
      frameRequest = 0
      if (!canAnimate()) {
        lastDrawTime = lastClockTime = 0
        setRunning(false)
        return
      }
      if (!lastDrawTime) lastDrawTime = lastClockTime = time
      const frameDelta = time - lastDrawTime
      if (frameDelta >= FRAME_INTERVAL) {
        lastDrawTime = time - frameDelta % FRAME_INTERVAL
        const delta = Math.min((time - lastClockTime) / 1000, 0.1)
        lastClockTime = time
        elapsedSeconds += delta
        terrain.update(elapsedSeconds)
        cameraGoal.set(cameraHome.x + pointer.x * 38, cameraHome.y - pointer.y * 22, cameraHome.z - pointer.x * 20)
        camera.position.lerp(cameraGoal, 1 - Math.pow(0.98, delta * 60))
        camera.lookAt(cameraTarget)
        render()
      }
      if (canAnimate()) frameRequest = requestAnimationFrame(tick)
    }
    function sync() {
      if (frameRequest) cancelAnimationFrame(frameRequest)
      frameRequest = 0
      lastDrawTime = lastClockTime = 0
      const animate = canAnimate()
      setRunning(animate)
      if (animate) frameRequest = requestAnimationFrame(tick)
    }
    syncRef.current = sync
    renderer.debug.onShaderError = fail

    const resize = () => {
      if (!alive || broken) return
      const bounds = host.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return
      const nextMobile = bounds.width < 768
      const cap = nextMobile ? 240000 : 700000
      const ratio = Math.min(window.devicePixelRatio || 1, Math.sqrt(cap / (bounds.width * bounds.height)))
      if (width === bounds.width && height === bounds.height && pixelRatio === ratio && mobile === nextMobile) return
      width = bounds.width
      height = bounds.height
      pixelRatio = ratio
      if (mobile !== nextMobile) {
        mobile = nextMobile
        const previousGeometry = terrain.geometry
        terrain = createWavesGeometry(mobile)
        surface.geometry = terrain.geometry
        previousGeometry.dispose()
      }
      renderer.setPixelRatio(ratio)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      terrain.update(elapsedSeconds)
      render()
      sync()
    }
    const onPointer = (event: PointerEvent) => {
      if (!canAnimate() || event.pointerType === 'touch') return
      pointer.set(event.clientX / Math.max(width, 1) - 0.5, event.clientY / Math.max(height, 1) - 0.5)
    }
    const onLeave = () => pointer.set(0, 0)
    const onContextLost = (event: Event) => {
      event.preventDefault()
      fail()
    }
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize)
    resizeObserver?.observe(host)
    const intersectionObserver = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      if (!alive || broken) return
      inView = entry?.isIntersecting ?? false
      sync()
    })
    intersectionObserver?.observe(host)
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', sync)
    canvas.addEventListener('webglcontextlost', onContextLost)

    teardown = () => {
      if (!alive) return
      alive = false
      if (frameRequest) cancelAnimationFrame(frameRequest)
      if (syncRef.current === sync) syncRef.current = null
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', sync)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      renderer.debug.onShaderError = null
      terrain.geometry.dispose()
      material.dispose()
      scene.clear()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    }
    resize()
    return teardown
  }, [])

  return (
    <div
      ref={hostRef}
      className="downloaded-waves-background"
      data-renderer={ready && !failed ? 'vanta-waves' : 'fallback'}
      data-running={running ? 'true' : 'false'}
      data-frame="0"
      aria-hidden="true"
    >
      <div className="downloaded-waves-background__fallback" />
      <div className="downloaded-waves-background__shade" />
    </div>
  )
}
