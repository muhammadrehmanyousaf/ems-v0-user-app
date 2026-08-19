/**
 * Static asset modules.
 *
 * Expo's own `expo/types` declares `*.css` / `*.scss` and nothing else, so
 * `import photo from '@/assets/…/x.jpg'` does not typecheck out of the box —
 * which is why, until the auth revamp, not one file under `src/` imported an
 * image. The two tab-icon PNGs in `assets/images/tabIcons/` are unreferenced
 * leftovers from the Expo template.
 *
 * Metro rewrites a static asset import to its asset-registry id, which is a
 * number at runtime on native. `expo-image` and RN's `Image` both accept that
 * directly as a `source`.
 *
 * Declared here rather than inside `src/` so it reads as build configuration
 * rather than as application code.
 */
declare module '*.png' {
  const asset: number;
  export default asset;
}

declare module '*.jpg' {
  const asset: number;
  export default asset;
}

declare module '*.jpeg' {
  const asset: number;
  export default asset;
}

declare module '*.webp' {
  const asset: number;
  export default asset;
}

declare module '*.gif' {
  const asset: number;
  export default asset;
}
