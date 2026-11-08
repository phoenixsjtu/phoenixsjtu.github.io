# Downloaded ThreeVolumetricFire

- Author: Housz; MIT, Copyright 2025 Housz. Original LICENSE is included verbatim.
- Repository: https://github.com/Housz/ThreeVolumetricFire
- Fixed commit: `ed1ee936cd451384a744bb6cd5c85454764b5ecc`
- Official demo: https://housz.github.io/ThreeVolumetricFire/examples/index.html
- Module: `src/ThreeVolumetricFire.js`
- Original assets: `examples/assets/nzw.png` and `examples/assets/firetex.png`

The downloaded module is unchanged at `src/vendor/three-volumetric-fire/ThreeVolumetricFire.js`; this directory also retains an unchanged upstream copy. Original textures are in `public/backgrounds/fire/`.

## Adaptation

`src/components/scenes/FlameScene.ts` adds a large curved right-side composition, blue/lilac/white profile grading, sparse embers, and gentle sway/parallax. It changes the instance's shader, leaving the vendor source and original textures unchanged. Rendering uses view-aligned volumetric slices and noise: a visual effect, not a physical combustion solver. The module's source credits yomotsu/VolumetricFire and Fuller et al., *Real-time procedural volumetric fire* (2007).

`RefinedSceneBackground.tsx` owns the existing Three.js renderer, 30fps scheduling, pause/visibility handling, pixel budgets, initial still rendering, failure fallback and cleanup. No new npm framework was installed.
