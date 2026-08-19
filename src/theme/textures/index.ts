/**
 * Textures.
 *
 * `BridalWash`, `JaalPattern` and `ShimmerText` were here and are gone. They
 * were v1 decoration — a pastel radial, a lattice overlay and a shimmering
 * headline — and v4 removed exactly that: *"a section is separated by space and
 * a hairline, not by a wash"* (`tokens.ts`, gradients). Their only remaining
 * consumer was `app/dev.tsx`, a showcase whose own header said it had been
 * "replaced by the tab shell", unreachable from anywhere in the app, and three
 * design versions out of date — a reference sheet that misreports the system is
 * worse than none, which is the same fault already fixed in `gallery`'s type
 * specimen. `app/gallery.tsx` is the v4 specimen sheet and the only one now.
 *
 * `PaperGrain` stays. It has no call site either, but unlike the other three it
 * is not retired by the design system — a 3% warm grain is consistent with the
 * paper ground v4 is built on, and it is 22 lines. Unused, not obsolete.
 */
export { PaperGrain } from './PaperGrain';
