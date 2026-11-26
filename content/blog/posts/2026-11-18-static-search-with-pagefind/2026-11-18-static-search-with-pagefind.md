---
title: Static search with Pagefind, and results that fly into the page
date: 2026-11-18
tags: [search, sveltekit, view-transitions, animation]
description: Search on a static site with no server, in two languages, from a button in the header. Then the animations, and the trap of morphing a search result into a page while the search box is still on screen.
---

This site has no server: it's static files on GitHub Pages. Search still works, because [Pagefind](https://pagefind.app/) builds the index from the finished HTML after the build, as more static files. A magnifying glass in the header opens a box under it, `/` opens it from anywhere, and a search downloads only the small slices of index it needs.

![The search box open under the header button, showing "20 results" for "dark mode": a blog post, two Devlog entries and the Modern CSS list, each with its section, title and an excerpt with the matches highlighted](./search-box.png 'Each result has its section, its title and the words around the match')

## What gets indexed

By default Pagefind indexes every page, including list pages and tag pages, which only repeat titles. Once any element has `data-pagefind-body`, only those elements are indexed: here, the post and Devlog articles, project headers, the Awesome lists and the About intro. Each also has `data-pagefind-meta="section:Blog"` (in the page's language), which is the small label over each result.

The first excerpts were full of "6 min read", tag lists and the word "copy" from code blocks, so those parts are `data-pagefind-ignore`.

## Two languages

Pagefind builds one index per `<html lang>` and picks one when it starts. But the language switch on this site doesn't reload the page, so a loaded Pagefind would keep searching the old language. The fix is small: import `pagefind.js?lang=es` and `?lang=en`. A different URL is a different module instance, each with its own index.

## Why it didn't work on preview

`vite preview` serves SvelteKit's output folder, not `build/`, and Pagefind writes into `build/`. So `pnpm preview` now runs a tiny static server of mine that serves `build/` with GitHub Pages' rules (`x`, `x.html`, `x/index.html`, else `404.html`), and the end-to-end tests use it too.

## Animating a popover

The box is a popover, like the colour theme menu: Escape and a click outside close it, and focus goes back to the button, with no JavaScript of mine. Animating it in and out takes two newer CSS features. `@starting-style` gives the state it starts from when it appears, and `transition-behavior: allow-discrete` on `display` and `overlay` keeps it on screen until its closing transition has finished, instead of vanishing. The results then rise in one after another.

## A result that becomes the page

Post cards on this site already turn into the page they open: their title and description fly into the page's header with a view transition. A search result now does the same.

![Halfway through the transition: the result's title is growing into the post's heading while the old page fades](./result-morph.png 'The title on its way from the result to the heading')

There was a catch. A card disappears when its page changes; the search box doesn't, because it sits outside the page. So in the transition's "after" picture the result's title was still there, with the same `view-transition-name` as the new heading, and two elements can't share a name: the browser skipped the whole transition. The fix closes the box without its animation before that picture is taken. Taking its transition away also cancels the closing animation that had already started. Then the box gets its own name during page transitions, so it fades out on top of the old page instead of underneath it.
