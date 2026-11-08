import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { createFlameScene } from './scenes/FlameScene'
import { createWaterScene } from './scenes/WaterScene'
import type { BackgroundKind, BackgroundScene } from './scenes/scene-types'
import './RefinedSceneBackground.css'

export default function RefinedSceneBackground({ kind, paused }: { kind: BackgroundKind; paused: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(paused)
  const syncRef = useRef<(() => void) | null>(null)
  const [ready, setReady] = useState(false)
  const [running, setRunning] = useState(false)

  useEffect(() => { pausedRef.current = paused; syncRef.current?.() }, [paused])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    setReady(false)
    setRunning(false)
    const canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false, powerPreference: 'low-power' })
    } catch { return }
    renderer.setClearColor('#080a0f')
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1
    host.appendChild(canvas)

    let alive = true
    let broken = false
    let visible = true
    let effect: BackgroundScene | null = null
    let width = 0, height = 0, ratio = 0
    let frame = 0, last = 0, lastDraw = 0, elapsed = 7, draws = 0
    let firstRender = true
    const pointer = new THREE.Vector2()
    const canRun = () => alive && !broken && effect !== null && visible && !document.hidden && !pausedRef.current && width > 0 && height > 0
    const stopFrame = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = last = lastDraw = 0
    }
    const fail = () => {
      if (!alive || broken) return
      broken = true
      stopFrame()
      setReady(false)
      setRunning(false)
      queueMicrotask(() => cleanup())
    }
    const draw = () => {
      if (!alive || broken || !effect) return
      try {
        renderer.render(effect.scene, effect.camera)
        if (broken) return
        host.dataset.frame = String(++draws)
        if (firstRender) { firstRender = false; setReady(true) }
      } catch { fail() }
    }
    const tick = (time: number) => {
      frame = 0
      if (!canRun()) { setRunning(false); last = lastDraw = 0; return }
      if (!lastDraw) last = lastDraw = time
      const sinceDraw = time - lastDraw
      if (sinceDraw >= 1000 / 30) {
        lastDraw = time - sinceDraw % (1000 / 30)
        const delta = Math.min((time - last) / 1000, .1)
        last = time
        elapsed += delta
        try { effect?.update(elapsed, delta, pointer); draw() } catch { fail() }
      }
      if (canRun()) frame = requestAnimationFrame(tick)
    }
    function sync() {
      stopFrame()
      const active = canRun()
      setRunning(active)
      if (active) frame = requestAnimationFrame(tick)
    }
    syncRef.current = sync

    const resize = () => {
      if (!alive || broken) return
      const bounds = host.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return
      const mobile = bounds.width < 768
      const cap = mobile ? 200000 : 650000
      const nextRatio = Math.min(window.devicePixelRatio || 1, Math.sqrt(cap / (bounds.width * bounds.height)))
      if (width === bounds.width && height === bounds.height && ratio === nextRatio) return
      width = bounds.width; height = bounds.height; ratio = nextRatio
      try {
        renderer.setPixelRatio(ratio)
        renderer.setSize(width, height, false)
        effect?.resize(width, height)
        effect?.update(elapsed, 0, pointer)
        draw()
        sync()
      } catch { fail() }
    }
    const onPointer = (event: PointerEvent) => {
      if (!canRun() || event.pointerType === 'touch') return
      pointer.set(event.clientX / Math.max(width, 1) - .5, event.clientY / Math.max(height, 1) - .5)
    }
    const onLeave = () => pointer.set(0, 0)
    const onLost = (event: Event) => { event.preventDefault(); fail() }
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize)
    observer?.observe(host)
    const visibility = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      if (!alive || broken) return
      visible = entry?.isIntersecting ?? false
      sync()
    })
    visibility?.observe(host)
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', sync)
    canvas.addEventListener('webglcontextlost', onLost)
    renderer.debug.onShaderError = fail

    function cleanup() {
      if (!alive) return
      alive = false
      stopFrame()
      if (syncRef.current === sync) syncRef.current = null
      observer?.disconnect(); visibility?.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', sync)
      canvas.removeEventListener('webglcontextlost', onLost)
      renderer.debug.onShaderError = null
      try { effect?.dispose() } finally {
        effect = null
        renderer.dispose()
        renderer.forceContextLoss()
        canvas.remove()
      }
    }
    resize()
    const load = kind === 'fire' ? createFlameScene : createWaterScene
    void load().then(scene => {
      if (!alive || broken) { scene.dispose(); return }
      effect = scene
      try {
        scene.resize(width, height)
        scene.update(elapsed, 0, pointer)
        draw()
        sync()
      } catch { fail() }
    }).catch(fail)
    return cleanup
  }, [kind])

  return <div ref={hostRef} className={`refined-background refined-background-${kind}`} aria-hidden="true" data-renderer={ready ? kind : 'fallback'} data-running={running ? 'true' : 'false'} data-frame="0">
    <div className="refined-background-fallback" />
    <div className="refined-background-shade" />
  </div>
}
