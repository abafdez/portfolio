---
title: Fifteen posts without covers, and a plan to make my own
date: 2026-11-26
phase: 13
tags: [content, images, blog]
---

## What we did

- **Published the 15 drafts** written between 2026-11-09 and 2026-11-18 (the toolbox, the CMS, the light theme, the hire panel, the 404, search…), on the `articles` branch, merged in PR #31. They had waited only for covers; the cards show the #tag tile until they get one. Their Spanish files are still `reviewed: false`.
- The spotlight post's update note now links to the grid post instead of the Devlog entry, since that post is published too.
- **A plan for covers made on my own GPU** (`design/cover-generation.md`): ComfyUI inside WSL on the RTX 3080 Ti, models with Apache 2.0 licences (Z-Image-Turbo for speed, Qwen-Image-2512 when a title is drawn in the picture), `pnpm cover <slug>` for four candidates and `pnpm cover:pick` to save one as a 16:9 AVIF. Phase 13 on the board.
- Phase 12 on the board too: trying mdsvex 1.0 and its highlighter, twinkleplop.

## What I learned

- Licences matter for image models as much as for code: some of the best-known ones only allow research or non-commercial use, and my portfolio is meant to get me hired.
- Rules for running models locally: only `.safetensors` or GGUF weights (a pickle file can run code when it loads), no custom nodes beyond the one for GGUF, and ComfyUI listening on 127.0.0.1 only.

## Next

- Set up ComfyUI (needs `memory=24GB` in `.wslconfig` for the bigger model), then covers for the 15 posts.
