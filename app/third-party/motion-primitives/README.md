# Motion Primitives — Morphing Dialog

This is an adaptation of the real [Motion Primitives Morphing Dialog source](https://github.com/ibelick/motion-primitives/blob/main/components/core/morphing-dialog.tsx), retrieved on 2026-11-08. The original is retained as `morphing-dialog.upstream.tsx`. Content hashes and installed dependency versions are recorded in `provenance.json`.

The upstream MIT copyright and permission notice is retained in `public/licenses/motion-primitives-MIT.txt` and included in the static build. Copyright (c) 2024 ibelick.

## Preserved interaction

The root context, per-instance IDs, portal, AnimatePresence, MotionConfig, and matched `layoutId` pairs for the trigger/content, image, title, subtitle, and description are derived from upstream. A project image and its containing surface animate into their expanded reading view and back. Reduced-motion users receive an immediate state change.

## Local adaptations

- Native `<dialog>` provides modal background inertness, keyboard focus containment and Escape behavior. Its top-layer element stays open until the exit animation completes.
- Trigger references now connect correctly; close focuses the original trigger without scrolling. Close is focused on entry. The title and description IDs are emitted only in expanded content.
- Opening locks body scroll while preserving the existing overflow and padding; closing/unmount restores them. The dialog itself scrolls for tall documents and small viewports.
- Backdrop clicks, Escape and a 44px close button dismiss it. The close button accepts a localized accessible label and portals directly under the native dialog, outside the transforming content. Its fixed viewport position remains reachable while tall documents scroll, including mobile safe-area offsets.
- Local inline SVG replaces Lucide. Native backdrop handling replaces the additional click-outside hook. No dependency was added.
- CSS uses the site's color tokens where appropriate and one 12px content radius. Consumers provide project-specific cover and reading layouts.

## Integration contract

Use `MorphingDialogTrigger` for the opening control. Use `MorphingDialogContainer` to wrap a `MorphingDialogContent`. Expanded content should include `MorphingDialogTitle`, `MorphingDialogDescription`, and `MorphingDialogClose`; these supply the dialog's accessible name, description, and visible dismissal control. Pair `MorphingDialogImage` and optionally `MorphingDialogTitle` in the trigger and content for shared-element morphing. Provide an accessible opening label on the trigger and a localized closing label.

All assets and links remain owned by the caller. This primitive does not fetch or rewrite paper images.
