# Drafts to publish

Every post was published on 2026-11-08 (Alfonso's call), all 57 with covers, and the same day Alfonso decided to skip the `<!-- TODO -->`s Claude had left for his own part: all of them were removed from the posts, English and Spanish.

New posts start as drafts in `content/blog/posts/<slug>/` with `draft: true` (dev only). Publishing one is deleting that line; a published post that links to a draft fails the build (`prerender_http_error … was linked from …`). The how-to for images, links and the publishing checklist is in `content/blog/posts/README.md`.

List new drafts here, with their TODOs and the drafts they link to, until they go up.

**2026-11-26 (branch `articles`, Alfonso's call):** the 15 drafts from 2026-11-09 to 2026-11-18 were published **without covers** (the cards show the #tag tile); covers come with the cover pipeline (`design/cover-generation.md`). Their Spanish files are still `reviewed: false`. The spotlight post's update note now links to `2026-11-09-text-never-sits-on-the-grid` instead of the Devlog entry.

Still drafts, on branches not merged yet: the three from 2026-11-19 (on `feat/covers-icons-and-motion` and `feat/cms-icons-and-settings`; their entries are in this file on those branches).
