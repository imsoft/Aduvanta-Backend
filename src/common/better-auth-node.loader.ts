/**
 * better-auth/node is ESM-only. Nest emits CommonJS; `import()` here stays as runtime
 * dynamic import in the emitted JS (not `require()`). Do not use `new Function(import…)`:
 * Vercel’s file tracer then skips `better-auth` and `node.mjs` is missing at runtime.
 */
let betterAuthNodePromise: Promise<typeof import('better-auth/node')> | null =
  null;

export function getBetterAuthNode(): Promise<
  typeof import('better-auth/node')
> {
  if (!betterAuthNodePromise) {
    betterAuthNodePromise = import('better-auth/node');
  }
  return betterAuthNodePromise;
}
