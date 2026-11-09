import type { Translated } from '#lib/i18n/index.ts';

// Where a tool's code or data comes from, when it ships someone else's. The toolbox's
// rule (learning-path.md, Phase 8.5): a tool credits a project only when it ships that
// project's code or data, on that tool, the way the licence asks. Ideas need no credit.
// A tool passes its credits to ToolCredits.svelte, at the foot of its page.
export interface Credit {
	// What we took: "Character names and blocks".
	what: Translated;
	source: string;
	url: `https://${string}`;
	// The copyright holder, as the source writes it.
	by: string;
	licence: { name: string; url: `https://${string}` };
	// The licence's own text, when it asks to travel with every copy (Unicode's does).
	notice?: string;
	// What we changed, when the licence asks to say so (CC BY does).
	changes?: Translated;
}

// Licence files are wrapped at about 72–80 characters. Shown narrower, each of those
// lines would wrap again and leave a word alone, so single line breaks become spaces
// and blank lines stay: the same words, in paragraphs that fit any width.
export const reflow = (text: string) => text.trim().replace(/(?<!\n)\n(?!\n)/g, ' ');
