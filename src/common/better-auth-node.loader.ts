/**
 * better-auth (and better-auth/node) are ESM-only. Nest emits CommonJS.
 * Vercel's bundler may rewrite `import('better-auth/node')` to `require()`, which
 * throws ERR_REQUIRE_ESM. Using a runtime-only import via Function avoids static analysis.
 */
let betterAuthNodePromise: Promise<typeof import('better-auth/node')> | null =
  null;

export function getBetterAuthNode(): Promise<
  typeof import('better-auth/node')
> {
  if (!betterAuthNodePromise) {
    const runtimeImport = new Function(
      'specifier',
      'return import(specifier)',
    ) as (s: string) => Promise<typeof import('better-auth/node')>;
    betterAuthNodePromise = runtimeImport('better-auth/node');
  }
  return betterAuthNodePromise;
}
