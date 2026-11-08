---
title: Cards that become the page
date: 2026-11-08
tags: [view-transitions, sveltekit, css, animation]
---

## What we did

- Clicking a card (blog, Devlog, projects, Awesome, the home page) turns it into its page: the title, picture, date line, description and tags fly to their places in the page's header, while the other cards drop away and the page body rises in after them. Back, or the breadcrumbs, play it in reverse. Choices from an interview: all five parts move, a tile without a cover fades out, the other cards drop away.
- `src/lib/morph.ts`: `cardLinkingTo(url)` (the card whose title links there), `pageHeader()`, `mark()`, `unmarkAll()`, `picturesReady()`. The root layout's `onNavigate` marks one end before the transition and the other in `update()`, and adds the type `morph`.
- Markup: `data-morph-card` on `TeaserCard`, `data-morph-page` on `ArticleHeader`, `ProjectHeader` and an Awesome list's header, `data-morph="title|picture|meta|description|tags"` on the parts (the article header's date line got a wrapper for it).
- `global.css`: names only inside `[data-morphing]` during a `morph` transition, `view-transition-class: morph` for their shared timing (450ms), `fit-content` text, the cover cropped to the moving box, `route-drop` for the old page.
- Fixed for every route change: the old page's picture now stays where it was on screen (`--route-shift`).

## What I learned

- Two elements with the same `view-transition-name`, one before and one after, become one moving box. Names must be unique, so they're set on the clicked card only, at the moment of the click.
- The old and new pictures of a group keep their own aspect ratio by default; `object-fit: cover` crops them to the box, but only with `overflow: clip` on the pictures and their image pair.
- `::view-transition-old(.morph):only-child` styles a part that has no partner on the other page.
- The browser takes the "after" picture when `update()` ends, so an image that's still loading flies in empty: `img.decode()`, raced against a timeout.

## Problems & fixes

- Going Back, the old article showed from its middle: its picture is placed where the new content starts, and SvelteKit restores the list's scroll. The layout measures the content's top before and after and moves the old picture by the difference.
- A click during a transition skips it, and its clean-up removed the next one's marks: only the latest transition cleans up now, and every navigation clears old marks before setting new ones.

## Links

- [MDN: view-transition-name](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-name)
- [MDN: view-transition-class](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-class)
- [Chrome for Developers: same-document view transitions](https://developer.chrome.com/docs/web-platform/view-transitions/same-document)

## Next

- Alfonso tries it on a phone and says if the timing needs tuning.
