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
- Tested: the PDF from a dark-theme screen is one A4 page, black on white, real text in reading order.

## What I learned

- Component styles are unlayered, so they beat anything in `global.css`'s layers. A component that should hide on paper says so in its own `<style>`.
- Browsers drop backgrounds when printing but keep text colors: without the light theme, dark-theme text prints light grey. One `color-scheme` flips every `light-dark()` token. Same specificity as `[data-theme='dark']`, so it has to come later.
- A download made in the page: `Blob` → `URL.createObjectURL()` → a link with `download` → click → `revokeObjectURL()`, or the Blob stays in memory until the tab closes.
- `file.text()` reads a picked file without uploading it. `event.currentTarget` is `null` after an `await`, so keep it in a variable first. Empty the input after, or picking the same file again doesn't fire `change`.
- Inside a `<form>`, a `<button>` without `type="button"` submits it.

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
