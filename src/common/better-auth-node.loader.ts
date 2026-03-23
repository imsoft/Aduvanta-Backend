/**
 * better-auth/node is ESM-only. Nest emits CommonJS; static imports become require()
 * and crash on Vercel/Node with ERR_REQUIRE_ESM. Dynamic import() works from CJS.
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
