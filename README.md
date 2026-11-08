# Yafei Deng — research & projects

Bilingual personal homepage: [English](https://phoenixsjtu.github.io/?lang=en) · [中文](https://phoenixsjtu.github.io/?lang=zh).

Research in physics + AI, digital twins, and predictive maintenance. The charcoal portfolio uses a cobalt/lilac volumetric flame by default, with an [optional reflective water background](https://phoenixsjtu.github.io/?lang=en&background=water).

Built with React, TypeScript, Vite, Motion and the existing Three.js renderer. Cult UI research tabs and TextureCard, plus an adapted Motion Primitives Morphing Dialog, provide the interaction layer. The same content, paper covers, organization marks and career history are available in both languages.

## Develop

Use Node.js 22.12 or newer.

```sh
cd app
npm ci
npm run dev
```

## Build

```sh
node build.mjs
```

The script typechecks and builds app/, replaces only the generated root assets directory, then copies the static build and approved background source archive into the repository root. Review and commit both source and generated output. GitHub Pages uses the main branch root; .nojekyll preserves the static build.

## Source and attribution

- app/src/: bilingual introduction, research tabs, authentic publication previews, career rows and the shared 3D background lifecycle.
- app/src/components/scenes/: flame and water scene composition. Flame is the default; background=water selects the alternative.
- app/src/vendor/three-volumetric-fire/: unchanged downloaded Housz module and local TypeScript declarations.
- app/public/: local textures, Geist font, organization logos, paper/document covers, source attribution and licenses.
- app/third-party/: retained upstream source, version pins, hashes, notices and adaptation notes.
- app/cover-sources/: public repository excerpts used to render document covers.
- app/DESIGN.md: the approved visual system.
- [Background source and texture package](downloads/refined-3d-backgrounds.zip): React/Vite integration source, original textures and licenses.

Housz ThreeVolumetricFire is MIT, Copyright 2025 Housz. Official Three.js Water and its normal texture retain the Three.js MIT notice. The original module and textures are unchanged; local composition, color grading and lifecycle behavior are documented in app/third-party/. Earlier inactive material studies remain available in source. The backgrounds are decorative material effects, not measured flow or combustion results.

The TPTLN cover is the original paper first page. Other covers are attributed README/Notebook excerpts; see [cover sources](projects/SOURCES.md). Current repositories remain under predictive maintenance; the other research areas retain their methods and forthcoming status.

Current account: [phoenixsjtu](https://github.com/phoenixsjtu). Earlier open-source work: [phoenixdyf](https://github.com/phoenixdyf). The GitHub profile README is maintained in [phoenixsjtu/phoenixsjtu](https://github.com/phoenixsjtu/phoenixsjtu).
