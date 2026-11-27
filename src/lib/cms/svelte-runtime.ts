// The Svelte runtime a compiled component imports ('svelte/internal/client'),
// handed to posts compiled in the browser (mdsvex.svelte.ts). Svelte forbids this import
// in .svelte.ts files (it's private and changes without notice), so it lives in plain .ts.
// It must be this bundle's copy: the one that mounts the post.
// @ts-expect-error: no types, it's private.
export * as client from 'svelte/internal/client';
