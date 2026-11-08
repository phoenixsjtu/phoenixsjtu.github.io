# Official Three.js Water material

- Three.js version: 0.187.0 (existing installed package).
- Fixed upstream r187 commit: `7e89746a687bb88271253698fa108b1dd59825d0`.
- Material: https://github.com/mrdoob/three.js/blob/r187/examples/jsm/objects/Water.js
- Official scene: https://threejs.org/examples/webgl_shaders_ocean.html
- Downloaded normal texture: https://raw.githubusercontent.com/mrdoob/three.js/7e89746a687bb88271253698fa108b1dd59825d0/examples/textures/waternormals.jpg
- Original MIT license: Copyright 2010-2026 three.js authors. Retained verbatim and bundled in public licenses.

`src/components/scenes/WaterScene.ts` imports the actual installed Water module. It adds a charcoal/cobalt composition with off-camera luminous reflection panels, gentle camera parallax and slow normal-map movement. This is an optical water surface, not a volume-flow simulation. The water normal asset is retained unchanged in `public/backgrounds/water/`.

The water effect's private reflection render target is captured when the official callback binds its own mirror texture, using a forwarding renderer proxy. The underlying renderer is never patched; only the captured matching target is resized/disposed. Pixel budgets and animation scheduling are handled by the shared `RefinedSceneBackground` wrapper.
