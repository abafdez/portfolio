---
title: A YouTube video without YouTube on the page
date: 2026-11-09
phase: 8.5
tags: [markdown, privacy, components]
---

## What we did

- A new fenced-block component, ` ```yt `: `src` (any YouTube link shape), `title`, an optional `thumbnail` (a file next to the post) and `caption`. It renders a card with the picture, the title and "opens in a new tab", as a plain link to youtube.com.
- Nothing loads from Google until a reader clicks: no player, no scripts, no cookies, and the thumbnail is our own copy (one from `i.ytimg.com` would be a request to Google too). Checked: loading the post makes no request outside the site.
- `render()` in `blocks.ts` now gets the post's file name, so the card's text follows its language (`<slug>.es.md` is Spanish), like callout titles.
- `enhance-media.ts` now accepts an explicit `alt=""`: markdown can't write one (mdsvex leaves `alt` out), so it only comes from a block marking its picture as decorative.
- First used in the UTF-8 draft, for Dylan Beattie's talk "Plain Text".

## What I learned

- An embedded YouTube player loads Google's scripts on every page view, watched or not. A link with a picture costs nothing until it's used.
- `rel="noreferrer"` also keeps our page's address from YouTube; `noopener` is the default for `target="_blank"` now, but writing it costs nothing.
- Opening a new tab without warning surprises people, so the card says it does.

## Links

- [MDN: `rel=noreferrer`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/noreferrer)
- [YouTube's oEmbed endpoint](https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=gd5uJ7Nlvvo&format=json) (where a video's title and thumbnail can be looked up)

## Next

- The cursors and selection tool.
