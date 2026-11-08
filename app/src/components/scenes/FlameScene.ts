import * as THREE from 'three'
import { VolumetricFire, type FireControlPoint } from '../../vendor/three-volumetric-fire/ThreeVolumetricFire.js'
import type { BackgroundScene } from './scene-types'

// The unmodified Housz volume renderer and its original profile/noise textures
// supply the flame. This scene adds composition, cool color grading and embers.
function gradeFlame(material: THREE.RawShaderMaterial) {
  material.fragmentShader = material.fragmentShader.replace(
    'gl_FragColor = vec4(color.rgb * 1.5, color.a);',
    `float heat = clamp(color.r * 2.8, 0.0, 1.0);
     float core = clamp(color.g * 4.0, 0.0, 1.0);
     vec3 blue = mix(vec3(0.045, 0.13, 0.65), vec3(0.38, 0.30, 0.88), smoothstep(0.2, 0.8, heat));
     vec3 light = mix(blue, vec3(0.80, 0.88, 1.0), pow(core, 2.2));
     gl_FragColor = vec4(light * color.r * 0.34, color.a);`
  )
  material.toneMapped = false
  material.needsUpdate = true
}

export async function createFlameScene(): Promise<BackgroundScene> {
  const loader = new THREE.TextureLoader()
  const paths = ['nzw.png', 'firetex.png'].map(name => `${import.meta.env.BASE_URL}backgrounds/fire/${name}`)
  const loaded = await Promise.allSettled(paths.map(path => loader.loadAsync(path)))
  const textures = loaded.flatMap(result => result.status === 'fulfilled' ? [result.value] : [])
  if (loaded.some(result => result.status === 'rejected')) {
    textures.forEach(texture => texture.dispose())
    throw new Error('The downloaded fire textures could not be loaded.')
  }
  const [noise, profile] = textures
  for (const texture of textures) {
    texture.minFilter = texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = false
    texture.colorSpace = THREE.NoColorSpace
  }
  noise.wrapS = noise.wrapT = THREE.RepeatWrapping
  profile.wrapS = profile.wrapT = THREE.ClampToEdgeWrapping

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#080a0f')
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 60)
  const home = new THREE.Vector3(0, 0.2, 8.8)
  const target = new THREE.Vector3(0, 0.2, 0)
  const goal = home.clone()
  camera.position.copy(home)
  camera.lookAt(target)
  const mobile = window.innerWidth < 768
  const fire = new VolumetricFire({
    camera,
    textureNoise: noise,
    textureProfile: profile,
    width: 2.2,
    height: 7.0,
    depth: 1.7,
    sliceSpacing: mobile ? 0.08 : 0.055,
    segments: mobile ? 14 : 20,
    debug: false,
  })
  gradeFlame(fire.material)
  fire.material.uniforms.magnitude.value = 0.82
  fire.material.uniforms.lacunarity.value = 2.15
  fire.material.uniforms.gain.value = 0.48
  ;(fire.material.uniforms.noiseScale.value as THREE.Vector4).set(1.1, 2.5, 1.2, 0.24)

  const coordinates = [
    [2.75, -3.2, 0, 2.15, 1.6],
    [2.45, -1.4, 0.1, 2.75, 1.75],
    [3.10, 0.25, -0.05, 2.2, 1.5],
    [2.65, 1.9, 0.15, 1.55, 1.1],
    [3.40, 3.9, 0.0, 0.55, 0.55],
  ]
  const points: FireControlPoint[] = coordinates.map(([x, y, z, width, depth]) => ({
    pos: new THREE.Vector3(x, y, z),
    scale: new THREE.Vector3(width, 1, depth),
    rot: new THREE.Quaternion(),
  }))
  fire.setControlPoints(points)
  scene.add(fire)

  // Small emissive particles support the volume, without a second flame layer.
  const emberCount = mobile ? 28 : 48
  const emberPositions = new Float32Array(emberCount * 3)
  const emberGeometry = new THREE.BufferGeometry()
  emberGeometry.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3).setUsage(THREE.DynamicDrawUsage))
  const emberMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    vertexShader: `void main() {
      vec4 view = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * view;
      gl_PointSize = clamp(14.0 / -view.z, 1.0, 2.6);
    }`,
    fragmentShader: `void main() {
      float d = length(gl_PointCoord - 0.5);
      float alpha = (1.0 - smoothstep(0.05, 0.5, d)) * 0.55;
      gl_FragColor = vec4(0.62, 0.72, 1.0, alpha);
    }`,
  })
  const embers = new THREE.Points(emberGeometry, emberMaterial)
  embers.frustumCulled = false
  scene.add(embers)
  let disposed = false

  return {
    scene,
    camera,
    resize(width, height) {
      camera.aspect = width / Math.max(height, 1)
      // Keep the plume toward the margin even in a narrow portrait view.
      home.x = camera.aspect < 0.85 ? 1.45 : 0
      target.x = home.x
      camera.position.copy(home)
      camera.lookAt(target)
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld()
    },
    update(elapsed, delta, pointer) {
      if (disposed) return
      goal.copy(home)
      goal.x += pointer.x * 0.24
      goal.y += pointer.y * 0.14
      if (delta > 0) camera.position.lerp(goal, 1 - Math.exp(-delta * 2.5))
      camera.lookAt(target)
      camera.updateMatrixWorld()
      for (let i = 0; i < points.length; i++) {
        points[i].pos.x = coordinates[i][0] + Math.sin(elapsed * 0.19 + i * 0.8) * 0.055 * i
        points[i].pos.z = coordinates[i][2] + Math.sin(elapsed * 0.13 + i) * 0.04
      }
      fire.setControlPoints(points)
      scene.updateMatrixWorld(true)
      fire.update(elapsed)
      for (let i = 0; i < emberCount; i++) {
        const phase = (i * 0.61803398875 + elapsed * (0.028 + (i % 5) * 0.003)) % 1
        const spread = Math.sin(i * 17.13) * 0.8
        emberPositions[i * 3] = 2.9 + spread + Math.sin(phase * 5.0 + i) * 0.22
        emberPositions[i * 3 + 1] = -2.8 + phase * 6.4
        emberPositions[i * 3 + 2] = Math.cos(i * 7.91) * 0.8
      }
      emberGeometry.attributes.position.needsUpdate = true
    },
    dispose() {
      if (disposed) return
      disposed = true
      fire.geometry.dispose()
      fire.material.dispose()
      emberGeometry.dispose()
      emberMaterial.dispose()
      textures.forEach(texture => texture.dispose())
      scene.clear()
    },
  }
}
