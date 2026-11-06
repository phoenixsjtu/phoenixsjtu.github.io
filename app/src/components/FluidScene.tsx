import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import './FluidScene.css'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

// An original ambient material study: domain-warped layers suggest fluid folds.
// It is decorative, rather than a physical flow solver or measured field.
const fragmentShader = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;
float hash(vec3 p) {
  p = fract(p * .3183099 + vec3(.11,.17,.13));
  p *= 17.;
  return fract(p.x*p.y*p.z*(p.x+p.y+p.z));
}
float noise(vec3 p) {
  vec3 i=floor(p), f=fract(p);
  f=f*f*(3.-2.*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float fbm(vec3 p) {
  float v=.54*noise(p);
  p=p*2.04+vec3(1.7,2.3,4.1);
  v+=.27*noise(p);
  p=p*2.02+vec3(4.1,1.3,3.7);
  return v+.135*noise(p);
}
mat2 rotate(float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }
void main() {
  vec2 screen=vec2(vUv.x,1.-vUv.y);
  float aspect=uResolution.x/max(uResolution.y,1.);
  vec2 p=vec2((screen.x-.84)*max(aspect,1.)*2.1,(screen.y-.46)*2.65);
  p=rotate(-.29)*p;
  p+=uPointer*vec2(.035,.018);
  float t=uTime*.10;
  vec3 q=vec3(p*1.8,t);
  vec2 warp=vec2(fbm(q+vec3(0,0,4)),fbm(q+vec3(5,1,0)))-.44;
  vec2 w=p+warp*.37;
  float curve=.17*sin(w.y*2.4-t*.52)+.08*cos(w.y*4.4+t*.3);
  float width=.25+.11*(.5+.5*sin(w.y*2.6+.8));
  float dist=w.x-curve;
  float ribbon=exp(-pow(dist/width,2.));
  float wing=exp(-pow((dist-.38-.12*sin(w.y*3.1))/.19,2.));
  float cloud=fbm(vec3(w*4.2,t*.55));
  float phase=dist*23.+w.y*3.2+cloud*8.+sin(w.y*3.5-t*.2)*2.;
  float fold=.5+.5*sin(phase);
  float fine=.5+.5*sin(phase*3.1+fbm(vec3(w*12.,t*.2))*2.);
  float highlight=pow(fold,4.);
  float seam=pow(1.-fold,7.);
  vec3 blue=mix(vec3(.075,.24,.66),vec3(.39,.61,.94),fold);
  blue=mix(blue,vec3(.96,.98,1.),highlight*.90);
  blue-=vec3(.035,.045,.035)*seam;
  blue+=fine*.025;
  float opacity=(ribbon*.80+wing*.23)*( .72+.28*cloud );
  // The moving material occupies the margin, leaving a calm reading surface.
  float readingSpace=smoothstep(.39,.68,screen.x);
  float ends=smoothstep(-.08,.12,screen.y)*(1.-smoothstep(.84,1.03,screen.y));
  opacity*=readingSpace*ends;
  vec3 paper=vec3(.985,.987,.992);
  vec3 color=mix(paper,blue,clamp(opacity,0.,.9));
  float haze=exp(-dot(p*vec2(.8,.45),p*vec2(.8,.45)))*readingSpace*.04;
  color=mix(color,vec3(.70,.81,.98),haze);
  gl_FragColor=vec4(color,1.);
}
`

type FluidSceneProps = { paused: boolean }

export default function FluidScene({ paused }: FluidSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(paused)
  const syncRef = useRef<(() => void) | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    pausedRef.current = paused
    syncRef.current?.()
  }, [paused])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' })
    } catch {
      setFailed(true)
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1))
    renderer.domElement.setAttribute('aria-hidden', 'true')
    host.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const uniforms = {
      uTime: { value: 8 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2() },
    }
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthTest: false, depthWrite: false })
    const geometry = new THREE.PlaneGeometry(2, 2)
    scene.add(new THREE.Mesh(geometry, material))
    const pointer = new THREE.Vector2()
    let alive = true
    let visible = false
    let broken = false
    let frame = 0
    let previousTime = 0
    const render = () => { if (alive && !broken) renderer.render(scene, camera) }
    const tick = (time: number) => {
      frame = 0
      if (!alive || broken || !visible || document.hidden || pausedRef.current) return
      if (previousTime && time - previousTime < 1000 / 30) {
        frame = requestAnimationFrame(tick)
        return
      }
      const delta = previousTime ? Math.min((time - previousTime) / 1000, .1) : 0
      previousTime = time
      uniforms.uTime.value += delta
      uniforms.uPointer.value.lerp(pointer, .035)
      render()
      if (!broken) frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      previousTime = 0
      if (alive && !broken && visible && !document.hidden && !pausedRef.current) frame = requestAnimationFrame(tick)
    }
    syncRef.current = sync
    const fail = () => {
      broken = true
      sync()
      setFailed(true)
    }
    renderer.debug.onShaderError = fail
    const resize = () => {
      const { width, height } = host.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      uniforms.uResolution.value.set(width, height)
      render()
    }
    const onPointer = (event: PointerEvent) => {
      if (pausedRef.current) return
      const bounds = host.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return
      pointer.set((event.clientX - bounds.left) / bounds.width - .5, (event.clientY - bounds.top) / bounds.height - .5)
    }
    const onLeave = () => pointer.set(0, 0)
    const onContextLost = (event: Event) => { event.preventDefault(); fail() }
    const parent = host.parentElement
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() }, { rootMargin: '80px' })
    visibility.observe(host)
    parent?.addEventListener('pointermove', onPointer, { passive: true })
    parent?.addEventListener('pointerleave', onLeave)
    renderer.domElement.addEventListener('webglcontextlost', onContextLost)
    document.addEventListener('visibilitychange', sync)
    resize()
    return () => {
      alive = false
      if (frame) cancelAnimationFrame(frame)
      syncRef.current = null
      observer.disconnect()
      visibility.disconnect()
      parent?.removeEventListener('pointermove', onPointer)
      parent?.removeEventListener('pointerleave', onLeave)
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
      document.removeEventListener('visibilitychange', sync)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div className={`fluid-background${failed ? ' fluid-background-fallback' : ''}`} ref={hostRef} aria-hidden="true" />
}
