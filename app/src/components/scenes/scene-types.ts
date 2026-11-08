import type { PerspectiveCamera, Scene, Vector2 } from 'three'

export type BackgroundKind = 'fire' | 'water'

export interface BackgroundScene {
  scene: Scene
  camera: PerspectiveCamera
  update: (elapsed: number, delta: number, pointer: Vector2) => void
  resize: (width: number, height: number) => void
  dispose: () => void
}
