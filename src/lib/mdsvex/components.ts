// The elements mdsvex 1.0 draws with our components (its `components` option).
// Each export is named after the element it replaces; mdsvex hands the element's
// attributes to it as props, plus `children`, `level` for headings, `lang` and `code`
// for pre.
export { default as h2 } from './Heading.svelte';
export { default as h3 } from './Heading.svelte';
export { default as h4 } from './Heading.svelte';
export { default as pre } from './Pre.svelte';
export { default as table } from './Table.svelte';
export { default as blockquote } from './Blockquote.svelte';
