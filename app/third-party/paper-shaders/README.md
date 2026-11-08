# Paper Shaders

The ambient background uses the unmodified `MeshGradient` component from `@paper-design/shaders-react@0.0.82` and its `@paper-design/shaders@0.0.82` dependency.

- Project: https://github.com/paper-design/shaders
- MeshGradient documentation: https://shaders.paper.design/mesh-gradient
- React component: https://github.com/paper-design/shaders/blob/main/packages/shaders-react/src/shaders/mesh-gradient.tsx
- React mount: https://github.com/paper-design/shaders/blob/main/packages/shaders-react/src/shader-mount.tsx
- Core mount: https://github.com/paper-design/shaders/blob/main/packages/shaders/src/shader-mount.ts
- Apache 2.0 license source: https://github.com/paper-design/shaders/blob/main/LICENSE
- Attribution notice source: https://github.com/paper-design/shaders/blob/main/NOTICE

LICENSE and NOTICE are copied verbatim from the official repository. Public copies in `public/licenses/` are included in the built site.

## Integration

`src/components/BreathingBackground.tsx` is original integration code. Its parent passes `paused`, including the user's reduced-motion setting. A paused or hidden page sets the shader's native `speed` to zero and pauses the CSS breathing cycle. The library retains its own visibility and intersection handling.

The render target is capped at 400,000 pixels, or 200,000 below 768 CSS pixels. WebGL2 is checked before mounting. A static CSS background remains underneath; initialization failure or canvas context loss selects that fallback. The integration handles explicit Paper Shaders initialization rejections because the upstream React wrapper initializes asynchronously without an error callback.

The component exposes `data-renderer="paper|fallback"` and `data-running="true|false"` on its decorative host for verification. The fallback remains static.
