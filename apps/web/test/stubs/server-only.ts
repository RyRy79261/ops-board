// Empty stand-in for the `server-only` marker package under vitest. The real
// package's default export throws when imported outside a React Server context
// (which is exactly what running under vitest is). Aliasing it here lets the
// pipeline integration suite import server-only-guarded modules (the voice
// executor) without changing production behaviour — in `next build` the real
// `server-only` is still resolved and still enforces the boundary.
export {};
