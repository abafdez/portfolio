---
title: Minigames on a 404 page
date: 2026-11-18
tags: [games, canvas, svelte, accessibility]
description: My 404 page now picks one of four toys at random, Breakout, Snake, an ASCII wave and loose dots, all made of the 404 itself. How it works on GitHub Pages, and why the game rules have no canvas in them.
---

A 404 page is a dead end, so I wanted mine to be a nice one to hit. Sites like [404s.design](https://404s.design/) collect pages where the error itself is the toy. Mine now shows the status, the address you asked for, links to every section, and one of four variants at random:

- **Breakout**: the bricks are the number 404. Break them with the arrow keys, the mouse, a finger or two on-screen buttons.
- **Snake**: the food is the 404. The walls wrap around, so the only way to lose is to bite yourself.
- **ASCII wave**: the number drawn in text, with a wave running through it. The pointer scrambles it into code characters and a click sends out a ripple.
- **Loose dots**: the 404 made of dots that fly in, scatter from the pointer and spring back home.

All four are drawn from one tiny bitmap: three 5 × 7 glyphs, 47 cells in total.

![The 404 games project page: a row of four options, the Breakout board with the 404 as bricks, and links to its files](./project-page.png 'The same games on their own project page, with links to their code')

## How a 404 works on GitHub Pages

GitHub Pages serves `404.html` for any address it can't find. SvelteKit's static adapter writes that file when you give it a `fallback`, and it's an empty shell that starts the app. The router finds no route for the address and renders `+error.svelte`, inside the root layout. So the header, the footer and even the language are all right: `/es/no-such-page` gets a Spanish 404.

Without JavaScript the shell was blank, so the server hook adds a small `noscript` message to that one file, in both languages, with links home.

## Random, but only in the browser

The variant is picked in `onMount`, never while the component renders. In development SvelteKit renders 404s on the server too, and a random pick on the server and another in the browser would be a hydration mismatch. Each variant is a lazy `import()`, so a 404 downloads one game, not four.

## Rules without a canvas

The games are split in two. The rules are plain functions in their own files: `step(game, seconds)` moves the ball in small steps, so it never jumps over a brick, and the spot where it hits the paddle sets its angle. `turn()` queues up to two turns for the snake, so two quick key presses aren't lost. None of that touches a canvas, so it has unit tests that run in milliseconds.

The `.svelte` files only draw a frame and listen to keys, pointer and touch. The game state is a plain object, not `$state`: it changes 60 times a second, and only the few things the page shows as text (the phase and the counts) are copied into `$state` when they change.

## Games a screen reader can use

A canvas is a picture, so each game canvas has `role="application"`. That tells a screen reader to pass the arrow keys through to the game instead of using them to read. A `role="status"` line underneath says what's happening ("Ball ready", "Missed!"), and the score is text. The animations hold still with reduced motion, and the games only move when you play.

The colours come from the design tokens, read through a hidden element, and are read again when the theme changes, so the games follow the light, dark and colour themes like everything else.

## Also a project

The games got their own page under Projects, where you pick one from a row of options and read how it's made, with links to each of its files on GitHub. Every project page now has a "Source code on GitHub" link, and a test fails if any of those paths stops existing.
