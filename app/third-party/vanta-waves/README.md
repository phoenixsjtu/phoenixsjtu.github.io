# Downloaded Vanta Waves background

Downloaded from the official tengbao/vanta repository on 2026-11-08.

- Source: https://github.com/tengbao/vanta
- Fixed commit: `f8b351906688b56f0fc744e53bde81fc3c56f150`
- Version: 0.5.24
- Scene: https://www.vantajs.com/?effect=waves
- License: MIT, Copyright 2020 Teng Bao. Original LICENSE.md is retained verbatim and included in the site's public licenses.
- `upstream/vanta.waves.js`, `_base.js`, and `helpers.js` are unchanged downloaded sources.

## Site integration

`src/components/DownloadedWavesBackground.tsx` adapts the downloaded Waves grid, indexed triangulation and trochoid height function to the site's existing Three.js version. It owns React lifecycle, pause/visibility scheduling, pixel budgets, modern lighting and renderer disposal instead of importing VantaBase. Camera/color/speed/lighting are tuned for the personal homepage; the effect is decorative, not measured fluid simulation data. No new npm dependency is needed.

The source-derived integration preserves the original MIT attribution. The original upstream files remain available for inspection.

## Download package

`downloads/vanta-waves-3d-background.zip` contains an immediately usable offline example, the downloaded Vanta distribution, its documented Three r134 runtime, original notices, source provenance, and the modern React integration. The homepage itself uses modern Three.js; the older runtime is confined to the offline example.
