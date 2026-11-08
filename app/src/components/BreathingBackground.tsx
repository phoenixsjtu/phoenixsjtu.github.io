import { Component, useEffect, useRef, useState, type ReactNode } from 'react'
import { MeshGradient, type PaperShaderElement } from '@paper-design/shaders-react'
import './BreathingBackground.css'

const colors = ['#080a0f', '#4269b6', '#6059ad', '#17233e', '#8ba2d6']
const contextAttributes: WebGLContextAttributes = {
  alpha: true,
  antialias: false,
  powerPreference: 'low-power',
}

class ShaderBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function supportsWebGL2() {
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2', contextAttributes)
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return typeof ResizeObserver !== 'undefined'
  } catch {
    return false
  }
}

/** Ambient page layer. The caller includes reduced-motion preferences in `paused`. */
export default function BreathingBackground({ paused }: { paused: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const shaderRef = useRef<PaperShaderElement>(null)
  const [supported, setSupported] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)')
    const updateVisibility = () => setHidden(document.hidden)
    const updateSize = () => setMobile(mobileQuery.matches)

    // Paper's React wrapper initializes asynchronously and has no onError prop.
    // Handle only its own explicit initialization errors; leave other rejections alone.
    const handleShaderRejection = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof Error && event.reason.message.startsWith('Paper Shaders:')) {
        event.preventDefault()
        setFailed(true)
        setReady(false)
      }
    }

    window.addEventListener('unhandledrejection', handleShaderRejection)
    document.addEventListener('visibilitychange', updateVisibility)
    mobileQuery.addEventListener('change', updateSize)
    updateVisibility()
    updateSize()
    setSupported(supportsWebGL2())

    return () => {
      window.removeEventListener('unhandledrejection', handleShaderRejection)
      document.removeEventListener('visibilitychange', updateVisibility)
      mobileQuery.removeEventListener('change', updateSize)
    }
  }, [])

  useEffect(() => {
    const host = hostRef.current
    if (!supported || failed || !host) return

    const handleFailure = () => {
      setReady(false)
      setFailed(true)
    }
    const checkInitialization = () => {
      const shader = shaderRef.current
      if (!shader?.paperShaderMount) return
      const context = shader.querySelector('canvas')?.getContext('webgl2')
      // A mounted canvas with no linked program cannot draw the background.
      if (!context || context.isContextLost() || !context.getParameter(context.CURRENT_PROGRAM)) {
        handleFailure()
        return
      }
      setReady(true)
      window.clearTimeout(initTimeout)
    }

    const observer = new MutationObserver(checkInitialization)
    observer.observe(host, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-paper-shader'],
    })
    // The canvas event does not bubble; capture it at our own host.
    host.addEventListener('webglcontextlost', handleFailure, true)
    const initTimeout = window.setTimeout(handleFailure, 2500)
    checkInitialization()

    return () => {
      observer.disconnect()
      host.removeEventListener('webglcontextlost', handleFailure, true)
      window.clearTimeout(initTimeout)
    }
  }, [supported, failed])

  const running = !paused && !hidden
  const hasShader = supported && ready && !failed

  return (
    <div
      ref={hostRef}
      className="breathing-background"
      data-renderer={hasShader ? 'paper' : 'fallback'}
      data-running={hasShader && running ? 'true' : 'false'}
      aria-hidden="true"
    >
      <div className="breathing-background__fallback" />
      {supported && !failed && (
        <ShaderBoundary onError={() => setFailed(true)}>
          <div className="breathing-background__surface">
            <div className="breathing-background__breath">
              <MeshGradient
                ref={shaderRef}
                className="breathing-background__shader"
                colors={colors}
                distortion={0.52}
                swirl={0.24}
                grainMixer={0}
                grainOverlay={0}
                speed={running ? 0.1 : 0}
                frame={18000}
                minPixelRatio={1}
                maxPixelCount={mobile ? 200000 : 400000}
                webGlContextAttributes={contextAttributes}
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </ShaderBoundary>
      )}
      <div className="breathing-background__reading-light" />
    </div>
  )
}
