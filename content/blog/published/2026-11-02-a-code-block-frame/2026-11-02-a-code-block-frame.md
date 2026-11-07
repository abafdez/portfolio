---
title: 'A code block frame: line numbers, wrapping and a copy button'
date: 2026-11-02
tags: [css, svelte, a11y]
description: Wrapping long lines, numbering them with a CSS counter and adding a copy button that only shows up when it works, around Shiki's HTML.
cover: A code block with line numbers.
---

My code blocks were cut off. The reading column was 60 characters wide, so most lines didn't fit, and on a desktop the site felt like reading on a phone. I wanted four things: a wider column, lines that wrap instead of scrolling, line numbers, and a bar with the language and a copy button.

## A wider column

The column is now one token:

```css
--reading-width: 80ch;
```

`ch` is the width of the "0" in the current font. 80ch of my body font fits about 90 characters of text and 80 of code. I thought about a breakout layout, with text at 60ch and code wider, and about the full 70rem of the header. I kept one column for both.

<!-- TODO: why one column (it reads better? simpler?) -->

## The frame

My Shiki highlighter wraps every block in a component:

```ts
return `<Components.CodeBlock lang="${language}">{@html \`${escaped}\`}</Components.CodeBlock>`;
```

`CodeBlock` is a `<figure>`. Its `<figcaption>` holds the language and the button, and the `<pre>` comes in as children. That HTML arrives through `{@html}`, so Svelte's scoped styles don't reach it by themselves. I use `:global()` inside a scoped selector, so the styles still only apply inside this component:

```css
figure :global(pre) {
	white-space: pre-wrap;
	overflow-wrap: anywhere;
	tab-size: 2;
}
```

`pre-wrap` keeps every space and newline but lets lines wrap. `overflow-wrap: anywhere` also breaks inside long words and URLs, which would otherwise still overflow. Nothing scrolls now, so I removed the `tabindex="0"` Shiki puts on the `<pre>`: a tab stop that does nothing only gets in the way.

## Line numbers in CSS

Shiki puts each line in a `<span class="line">`. A CSS counter numbers them:

```css
figure :global(code) {
	counter-reset: line;
}

figure :global(.line) {
	display: inline-block;
	inline-size: 100%;
	padding-inline-start: 4ch;
}

figure :global(.line::before) {
	counter-increment: line;
	content: counter(line);
	display: inline-block;
	inline-size: 2.5ch;
	margin-inline: -4ch 1.5ch;
	text-align: end;
}
```

Each line leaves 4ch of room on its left, and the negative margin pulls the number into it. A line that wraps continues under its own text, not under its number.

The numbers are generated content, so they aren't part of the page's text. Selecting the code by hand never picks them up.

Two attempts failed first:

- **`display: block` lines.** Shiki puts a newline between the line spans, and a `<pre>` shows newlines, so every line got an empty one after it. `inline-block` at full width takes the whole row without that.
- **`position: absolute` numbers.** An empty line had no height to hold its number, and the numbers overlapped. In the flow, the number itself gives an empty line its height.

<!-- TODO: a screenshot of the overlapping numbers, or of the empty lines -->

A one-line block, like a single command, doesn't need a number. `:only-child` only counts elements, not the newline text, so it finds them:

```css
figure :global(.line:only-child::before) {
	content: none;
}
```

## A copy button that only shows up when it works

The button needs JavaScript and the Clipboard API. Without them, it would be a button that does nothing. So it only renders once an `$effect` has run in the browser:

```svelte
<script lang="ts">
	let canCopy = $state(false);

	$effect(() => {
		canCopy = 'clipboard' in navigator;
	});
</script>
```

It copies the `textContent` of the `<code>`: the code as written, without the numbers, with a wrapped line still one line. A `role="status"` span next to it says "copied" (or "couldn't copy") for two seconds, and screen readers announce it when it changes.

<!-- TODO: what a screen reader said when I pressed the button -->
