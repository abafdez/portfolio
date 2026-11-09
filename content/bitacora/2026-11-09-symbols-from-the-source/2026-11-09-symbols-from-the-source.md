---
title: HTML symbols, straight from the source
date: 2026-11-09
phase: 8.5
tags: [unicode, html, open-source]
---

## What we did

- The toolbox's second tool, HTML symbols (`/projects/toolbox/symbols`): search by words, a pasted character, `U+2192` or `&rarr;`; 20 groups as a list and as a row of icons (each one of its group's own characters); a card with every way to write a symbol, each with a copy button.
- The data comes from the standards themselves, not from someone's table: `scripts/symbols.ts` (`pnpm data:symbols`) downloads Unicode's `UnicodeData.txt` and `Blocks.txt` and the HTML spec's `entities.json`, and writes `symbols.json`: 3,169 characters, 1,431 with an HTML name, 33 KB gzipped. It runs once, not on every build.
- Everything else (decimal and hex references, CSS and JS escapes, URL encoding, UTF-8 bytes, UTF-16 units) is worked out from the code point in `forms()`.
- Both sources ask for a notice, so the tool credits them at its foot (`ToolCredits.svelte`), Unicode's licence in full. The toolbox's rule in action: credit what you ship, not what inspired you.
- Refined with Alfonso: the group icons, a preview on hover or focus while nothing is picked (wide screens), the character growing on hover, the card pinned at the bottom of a phone screen only once a symbol is picked.

## What I learned

- No dataset has names, HTML codes and CSS escapes together, and none is needed: a code point is all you need to write a character every way there is.
- W3Schools was the reference for the groups, but its tables are its own content: ideas, not data.
- Data has licences too: Unicode License v3 wants its notice "with all copies", the WHATWG's standards are CC BY 4.0.
- `content-visibility: auto` lets a list of 1,431 buttons render without the page slowing down: off-screen tiles skip layout and paint.
- A radio hidden with `pointer-events: none` can't be clicked; stretched invisibly over its label (`inset: 0; opacity: 0`) it gets clicks, focus and arrow keys.

## Problems & fixes

- The named group showed only 300 of its symbols: the cap meant for searches applied to groups too.
- On a phone, the details card covered half the grid; now it only appears once a symbol is picked, with a close button that puts focus back.

## Links

- [Unicode Character Database](https://www.unicode.org/ucd/)
- [HTML spec: named character references](https://html.spec.whatwg.org/multipage/named-characters.html)
- [MDN: `content-visibility`](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility)

## Next

- The cursors and selection tool.
