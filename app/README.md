# Yafei Deng — bilingual research homepage

English and Simplified Chinese personal research portfolio, with a charcoal canvas, a concise introduction and a full-page cobalt/lilac volumetric flame. background=water selects the official Three Water alternative. A URL language (?lang=en or ?lang=zh) takes precedence over the locally remembered selection; the language control preserves the background parameter.

## Run and build

```sh
npm ci
npm run dev
npm run typecheck
npm run build
npm run preview
```

The dist directory is deployable to a static host. Relative assets support a domain root or subdirectory. The repository's root build.mjs builds this app and copies its static output into the GitHub Pages root.

## Active components

- src/App.tsx: bilingual introduction, account links and career history.
- src/components/ResearchFramework.tsx: Cult UI research-area tabs; predictive maintenance is selected initially.
- src/components/ProjectCollection.tsx: one authentic publication and three attributed repository-document resources.
- src/components/motion-primitives/: adapted MIT Morphing Dialog with native modal semantics, focus return and shared-element motion.
- src/components/RefinedSceneBackground.tsx: one shared Three.js renderer with pause, visibility, resolution, fallback and disposal handling.
- src/components/scenes/FlameScene.ts: downloaded Housz volume renderer and original textures, with local composition, color grading and embers.
- src/components/scenes/WaterScene.ts: official Three Water, downloaded normals, optical reflections and camera parallax.
- src/vendor/three-volumetric-fire/: unchanged module and local TypeScript declarations.
- src/components/cult/: adapted Cult UI source. Earlier renderer studies remain inactive in source.
- public/: local assets, provenance and original license notices.
- third-party/: upstream source and documented adaptations.
- cover-sources/: public repository excerpts used in the three non-paper covers.
- downloads/refined-3d-backgrounds.zip: approved source and texture archive copied to the repository root by build.mjs.

The four projects link to phoenixdyf; current profile links use phoenixsjtu. Career dates and roles follow the supplied professional history. Physics + AI and digital twins retain their methods and forthcoming project status.

## Motion and accessibility

The full-page background pauses when hidden or explicitly stopped. Reduced-motion users begin with a still frame and can enable motion. Rendering is capped at 30fps and responsive pixel budgets; loading or WebGL failure retains a static background. Keyboard research tabs, native paper dialog, visible focus and both document languages are preserved.

## Credits

Housz ThreeVolumetricFire is MIT, Copyright 2025 Housz; Three.js Water uses the existing 0.187 renderer and original MIT notices. Motion Primitives and Cult UI are source-derived MIT components, with retained provenance. Geist is self-hosted with original font notices. Vercel Compute, Nim and Magic Portfolio are visual references; their page code and media were not copied.

See DESIGN.md and the third-party/public source notices for details. The animated scenes are decorative materials rather than measured simulations.
