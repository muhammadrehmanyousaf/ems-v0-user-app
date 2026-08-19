export { ArchImage, ArchOutline } from './ArchImage';
export { ArchOrnament, type ArchOrnamentProps } from './ArchOrnament';
export { ArchMedallion, MEDALLION_ASPECT, type ArchMedallionProps } from './ArchMedallion';
export { PhotoHero, type PhotoHeroProps } from './PhotoHero';
/**
 * `LightSweep` was here. Removed, not redrawn: `gradients.champagne` — the only
 * gradient it drew — is marked `@deprecated the light sweep is retired` in the
 * v4 token file, and the component had zero call sites anywhere in the app,
 * including the gallery. A component the design system has retired but nobody
 * deleted is how a retired thing gets used again by accident.
 */
export { archPath } from './arch-path';
export { MonogramFallback, type MonogramFallbackProps } from './MonogramFallback';
