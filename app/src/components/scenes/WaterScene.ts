import * as THREE from 'three'
import { Water } from 'three/addons/objects/Water.js'
import type { BackgroundScene } from './scene-types'

/** Official Three.js r187 Water, lit as a dark material study rather than a daylight ocean. */
export async function createWaterScene(): Promise<BackgroundScene> {
  const normal = await new THREE.TextureLoader().loadAsync(
    `${import.meta.env.BASE_URL}backgrounds/water/waternormals.jpg`,
  )
  normal.wrapS = normal.wrapT = THREE.RepeatWrapping
  normal.colorSpace = THREE.NoColorSpace
  normal.anisotropy = 2

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#080a0f')
  scene.fog = new THREE.FogExp2('#080a0f', 0.007)
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 500)
  const home = new THREE.Vector3(7.5, 7.2, 13.5)
  const goal = home.clone()
  const target = new THREE.Vector3(0, -0.8, -10)
  camera.position.copy(home)
  camera.lookAt(target)

  const plane = new THREE.PlaneGeometry(800, 800)
  const initialReflectionSize = window.innerWidth < 768 ? 128 : 256
  let water: Water
  try {
    water = new Water(plane, {
      textureWidth: initialReflectionSize,
      textureHeight: initialReflectionSize,
      waterNormals: normal,
      sunDirection: new THREE.Vector3(-0.28, 0.62, -0.73).normalize(),
      sunColor: '#aecbff',
      waterColor: '#06152d',
      distortionScale: 2.6,
      fog: true,
    })
  } catch (error) {
    normal.dispose()
    plane.dispose()
    throw error
  }
  water.rotation.x = -Math.PI / 2
  water.material.uniforms.size.value = 5.2
  scene.add(water)

  // Off-camera luminous panels produce long, finely broken reflections on the water.
  // They are scene geometry, not screen-space painted highlights or a replacement water shader.
  const reflectionPanels: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = []
  const addPanel = (x: number, y: number, z: number, width: number, height: number, color: string) => {
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, toneMapped: false }),
    )
    panel.position.set(x, y, z)
    panel.rotation.set(Math.PI / 2, 0, -0.18)
    scene.add(panel)
    reflectionPanels.push(panel)
  }
  addPanel(8, 12, -14, 3.2, 30, '#c1d9ff')
  addPanel(-2, 18, -24, 1.5, 34, '#567ed7')
  addPanel(16, 20, -4, 2.2, 26, '#7062b3')

  // Water keeps its render target in a closure. Capture only its own target when
  // the upstream callback binds it; use a forwarding proxy so the renderer itself
  // is never patched and unrelated render targets are never disposed here.
  const upstreamBeforeRender = water.onBeforeRender
  const reflectionTexture = water.material.uniforms.mirrorSampler.value as THREE.Texture
  let reflectionTarget: Exclude<Parameters<THREE.WebGLRenderer['setRenderTarget']>[0], null> | undefined
  const rendererProxies = new WeakMap<THREE.WebGLRenderer, THREE.WebGLRenderer>()
  water.onBeforeRender = function (renderer, renderScene, renderCamera, geometry, material, group) {
    let proxy = rendererProxies.get(renderer)
    if (!proxy) {
      proxy = new Proxy(renderer, {
        get(realRenderer, property) {
          if (property === 'setRenderTarget') {
            return (...args: Parameters<THREE.WebGLRenderer['setRenderTarget']>) => {
              const candidate = args[0]
              if (candidate?.texture === reflectionTexture) reflectionTarget = candidate
              realRenderer.setRenderTarget(...args)
            }
          }
          const value = Reflect.get(realRenderer, property, realRenderer)
          return typeof value === 'function' ? value.bind(realRenderer) : value
        },
      })
      rendererProxies.set(renderer, proxy)
    }
    upstreamBeforeRender.call(this, proxy, renderScene, renderCamera, geometry, material, group)
  }

  let disposed = false
  return {
    scene,
    camera,
    resize(width, height) {
      camera.aspect = width / Math.max(height, 1)
      const narrow = width < 768
      camera.fov = narrow ? 44 : 38
      home.set(narrow ? 4.5 : 7.5, narrow ? 8.5 : 7.2, narrow ? 17 : 13.5)
      camera.position.copy(home)
      camera.lookAt(target)
      camera.updateProjectionMatrix()
      reflectionTarget?.setSize(narrow ? 128 : 256, narrow ? 128 : 256)
    },
    update(elapsed, delta, pointer) {
      water.material.uniforms.time.value = elapsed * 0.38
      goal.set(home.x + pointer.x * 0.8, home.y - pointer.y * 0.25, home.z)
      if (delta > 0) camera.position.lerp(goal, 1 - Math.exp(-delta * 1.5))
      camera.lookAt(target)
    },
    dispose() {
      if (disposed) return
      disposed = true
      water.onBeforeRender = () => {}
      reflectionTarget?.dispose()
      if (!reflectionTarget) reflectionTexture.dispose()
      water.material.dispose()
      plane.dispose()
      normal.dispose()
      for (const panel of reflectionPanels) {
        panel.geometry.dispose()
        panel.material.dispose()
      }
      scene.clear()
    },
  }
}
