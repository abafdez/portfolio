---
title: Printing the CV, and a JSON backup
date: 2026-11-03
phase: 5.5
tags: [css, print, svelte]
---

## What we did

- "Print or save as PDF" on `/projects/cv`. A print stylesheet keeps only the CV: A4, 15mm margins, sizes in points, no card, headings never alone at the bottom of a page (`break-after: avoid`), lines never split (`break-inside: avoid`).
- The header, the footer and the blueprint hide themselves on paper, site-wide, each in its own `<style>`. The CV route hides the project header.
- `tokens.css` switches to the light theme for print (`color-scheme: light` on `:root, [data-theme]`, last in the file).
- While printing, the page title is "Name Surnames - CV - Profile", so the PDF gets that name (`beforeprint` / `afterprint`).
- "Export details" downloads `cv-details.json`. "Import details" loads it back through the same `read()` as `localStorage`, which now returns how many fields it took.
- Later: the CV preview is `contenteditable`, for a last-minute change right before printing, with a hint under the buttons. It isn't saved: the CV sits in a `{#key}` on a JSON snapshot of everything it shows, so any change in the form rebuilds it from the form. A paste keeps only the text (`onpaste`). Pressing Ctrl+P while typing blurs the CV first (no cursor on paper), and print drops the focus ring.
- Tested: the PDF from a dark-theme screen is one A4 page, black on white, real text in reading order.

## What I learned

- Component styles are unlayered, so they beat anything in `global.css`'s layers. A component that should hide on paper says so in its own `<style>`.
- Browsers drop backgrounds when printing but keep text colors: without the light theme, dark-theme text prints light grey. One `color-scheme` flips every `light-dark()` token. Same specificity as `[data-theme='dark']`, so it has to come later.
- A download made in the page: `Blob` → `URL.createObjectURL()` → a link with `download` → click → `revokeObjectURL()`, or the Blob stays in memory until the tab closes.
- `file.text()` reads a picked file without uploading it. `event.currentTarget` is `null` after an `await`, so keep it in a variable first. Empty the input after, or picking the same file again doesn't fire `change`.
- Inside a `<form>`, a `<button>` without `type="button"` submits it.
- Svelte doesn't know about text typed into a `contenteditable`: it would update only the text it wrote and leave mine mixed in, or fail on a node I'd deleted. `{#key}` throws the block away and rebuilds it instead.
- `contenteditable="plaintext-only"` keeps pastes plain by itself, but Chrome then forces `white-space: pre-wrap` on everything inside, even over an inline `!important`, and the line breaks between the template's blocks printed as blank lines. `contenteditable="true"` plus an `onpaste` that inserts `text/plain` does the same job. `execCommand('insertText')` is deprecated, but it's the one way to insert text that Ctrl+Z can undo.

## Problems & fixes

- The quick check for this step is still open (why the print rule lives in `Header.svelte`; why `currentTarget` is kept before the `await`).

## Links

- [MDN: printing](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Printing)
- [MDN: @page](https://developer.mozilla.org/en-US/docs/Web/CSS/@page)
- [MDN: break-after](https://developer.mozilla.org/en-US/docs/Web/CSS/break-after)
- [MDN: URL.createObjectURL()](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static)
- [MDN: Blob.text() / File](https://developer.mozilla.org/en-US/docs/Web/API/Blob/text)

## Next

- Print a CV for each profile from my own browser, and check that selecting all its text gives the CV in order.
