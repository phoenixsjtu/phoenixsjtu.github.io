import { BufferGeometry, Camera, Euler, Mesh, Quaternion, RawShaderMaterial, Texture, Vector3 } from 'three'

export interface FireControlPoint {
  pos: Vector3
  scale: Vector3
  rot: Quaternion | Euler
}

export interface VolumetricFireOptions {
  camera: Camera
  textureNoise: Texture
  textureProfile: Texture
  width?: number
  height?: number
  depth?: number
  sliceSpacing?: number
  segments?: number
  debug?: boolean
}

export class VolumetricFire extends Mesh<BufferGeometry, RawShaderMaterial> {
  constructor(options: VolumetricFireOptions)
  setControlPoints(points: FireControlPoint[]): void
  setRectangularShape(width: number, height: number, depth: number): void
  update(elapsed: number): void
}
