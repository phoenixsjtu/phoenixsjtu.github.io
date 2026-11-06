# Yafei Deng — research & projects

Bilingual personal homepage: [English](https://phoenixsjtu.github.io/?lang=en) · [中文](https://phoenixsjtu.github.io/?lang=zh).

Research in physics + AI, digital twins, and predictive maintenance. Built with React, TypeScript, Vite, Motion, Three.js, and locally adapted Cult UI components.

## Develop

Use Node.js 22.12 or newer.

```sh
cd app
npm ci
npm run dev
```

## Build and publish

```sh
node build.mjs
```

The script typechecks and builds `app/`, then copies its static output into the repository root. Review and commit both source and output. GitHub Pages publishes the `main` branch root; `.nojekyll` preserves the static build.

## Source

- `app/src/`: bilingual content, research tabs, image-led project cards, career history, and original ambient engineering scene.
- `app/public/`: organization logos, project covers, source attribution and dependency licenses.
- `app/third-party/cult-ui/`: registry sources and provenance for TextureCard, Expandable and DirectionAwareTabs.
- `app/cover-sources/`: public repository excerpts used to render document covers.
- `app/DESIGN.md`: design decisions.

The TPTLN cover is the original paper first page. Other covers are typeset README/Notebook excerpts, not papers or synthetic experimental results. See [cover sources](projects/SOURCES.md). The background is an original conceptual visualization, not measured or simulated data.

The current account is [phoenixsjtu](https://github.com/phoenixsjtu); earlier open-source work remains on [phoenixdyf](https://github.com/phoenixdyf). The GitHub profile README is maintained in [phoenixsjtu/phoenixsjtu](https://github.com/phoenixsjtu/phoenixsjtu).
