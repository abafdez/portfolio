---
title: A frame for code blocks, and a wider column
date: 2026-11-02
phase: 7
tags: [css, svelte, a11y, layout]
---

## What we did

- Widened the reading composition from 60ch to `--reading-width: 80ch` (`tokens.css`), for text and code alike. I picked one wider column over a breakout layout for code or the full 70rem.
- Added `CodeBlock.svelte`. `highlight()` wraps every Shiki `<pre>` in it, as `Components.CodeBlock` (exported from `MarkdownLayout`). It adds:
  - a bar with the language;
  - a copy button with `role="status"` feedback;
  - wrapped lines;
  - line numbers.
- Removed Shiki's `tabindex="0"` with a transformer: nothing scrolls now, so there's nothing to focus. The old `.prose pre` rule is gone.

## What I learned

- Lines wrap with `white-space: pre-wrap` plus `overflow-wrap: anywhere`, which also breaks long words and URLs.
- Line numbers are a CSS counter in `::before`. Generated content isn't in the DOM text, so copying (by hand or with the button) never includes them.
- Each `.line` is a full-width `inline-block` with `padding-inline-start: 4ch`, and the number is pulled into that room with a negative margin. A wrapped line continues under its own text, not under the number.
- `:only-child` only counts elements, not the `\n` text nodes between lines, so a one-line block gets no number.
- The button only renders after an `$effect` runs and only if `navigator.clipboard` exists. Without JS there's no button that does nothing.
- Shiki's HTML comes in through `{@html}`, so the component's styles reach it with `:global()`, still scoped to the component's `figure`.

## Problems & fixes

- `display: block` lines added an empty line after each one: Shiki puts a `\n` between lines, and a `<pre>` shows it. `inline-block` with `inline-size: 100%` fixed it.
- With `position: absolute`, an empty line lost its height and its number overlapped the next one. An in-flow `::before` with a negative margin fixed it.

## Links

- [MDN: Using CSS counters](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_counter_styles/Using_CSS_counters)
- [MDN: `overflow-wrap`](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-wrap)
- [MDN: `Clipboard.writeText()`](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText)
- [MDN: ARIA `status` role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role)
- [Shiki: transformers](https://shiki.style/guide/transformers)

## Next

- Tag pages, `/blog/tags/[tag]`.
