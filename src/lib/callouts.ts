// Callouts: a blockquote that starts with [!type] becomes a box with an icon and a
// title. GitHub draws the same syntax (it calls them "alerts") and so does Obsidian
// ("callouts"); anywhere else it's still a readable blockquote.
//
//   > [!tip]                     > [!warning] Not on GitHub Pages
//   > Text of the tip.           > Custom title, then the text.
//
// The types live here; markdown/parse.ts finds the callouts and markdown/Callout.svelte
// and CalloutTitle.svelte draw them.
// One icon at a time from 'lucide' (each is a list of SVG elements), not its `icons`
// object: that one holds every icon, and the CMS preview bundles this file.
import { Info, Lightbulb, MessageSquareWarning, OctagonAlert, TriangleAlert } from 'lucide';

// GitHub's five types. The title is the type as text, so it isn't told by colour
// alone; the icon is a second hint for the eye. Obsidian has more types, but GitHub
// would show those as plain blockquotes, so they fail the build instead (parse.ts).
// The title is in the file's language (<slug>.es.md is Spanish), in the words GitHub
// uses in Spanish. It's written into the HTML at build time, so it can't come from the
// UI messages, which follow the page.
export const calloutTypes = {
	note: { title: { en: 'Note', es: 'Nota' }, icon: Info },
	tip: { title: { en: 'Tip', es: 'Sugerencia' }, icon: Lightbulb },
	important: { title: { en: 'Important', es: 'Importante' }, icon: MessageSquareWarning },
	warning: { title: { en: 'Warning', es: 'Advertencia' }, icon: TriangleAlert },
	caution: { title: { en: 'Caution', es: 'Precaución' }, icon: OctagonAlert }
} as const;
export type CalloutType = keyof typeof calloutTypes;

// [!type] at the very start of the first paragraph. The + or - after it is Obsidian's
// folding (open or closed); we don't fold yet, so it's accepted and shown open.
export const marker = /^\[!(\w+)\][+-]?[ \t]*/;
