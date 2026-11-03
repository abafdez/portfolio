---
title: 'Printing a CV from a web page'
date: 2026-11-03
tags: [css, print]
description: My CV builder makes its PDF with the browser's own print dialog. A print stylesheet, the light theme on paper, and a page title that becomes the file name.
---

My CV builder doesn't generate PDFs. The browser already does: "Save as PDF" in the print dialog gives a PDF with real, selectable text, which is what applicant tracking systems need. My job is a print stylesheet that leaves only the CV on the page.

<!-- TODO: a screenshot of the print preview next to the page -->

## Hiding the site

The header, the footer and the background grid each hide themselves:

```css
@media print {
	header {
		display: none;
	}
}
```

Each one in its own component, not in my global stylesheet. My global CSS lives in cascade layers, and component styles are unlayered, so they win over any layer, whatever the specificity. A global `display: none` would lose to any `display` a component sets for itself.

<!-- TODO: try the rule in global.css instead, and say what printed -->

## Paper is white

Browsers leave backgrounds out when printing, but keep text colors. In my dark theme the text is light grey, so on white paper it was barely there. Every color token is a `light-dark()`, so one line switches the whole site to its light theme on paper:

```css
@media print {
	:root,
	[data-theme] {
		color-scheme: light;
	}
}
```

It's last in the file: the theme toggle's `[data-theme='dark']` has the same specificity, and with equal specificity, the later rule wins.

## The sheet

```css
@page {
	size: A4;
	margin: 15mm;
}
```

Inside the CV, sizes in points, and two rules about page breaks: a heading never sits alone at the bottom of a page (`break-after: avoid`), and a line of skills never splits in two (`break-inside: avoid`).

## The file name

The browser names the PDF after the page title, so while the print dialog is open, the title is the CV's:

```ts
function beforePrint() {
	pageTitle = document.title;
	document.title = `${fullName || 'CV'} - CV - ${profile.name}`;
}
```

with `afterPrint` putting it back, both on `<svelte:window onbeforeprint onafterprint>`.

<!-- TODO: open the PDF, select all, paste it in a text editor: is it in order? -->
