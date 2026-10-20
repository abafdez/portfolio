---
name: bitacora-entry
description: Write a Bitácora (dev-log) entry summarizing the current session or phase into content/bitacora/. Use when the user asks to log, record, or save the conversation/session, or at the end of a learning-path phase.
---

# Bitácora entry

Create `content/bitacora/YYYY-MM-DD-<short-slug>.md` (today's date; if the file exists, pick a different slug).

## Format

```markdown
---
title: <short title>
date: YYYY-MM-DD
phase: <learning-path phase number, or omit>
tags: [<2–4 lowercase tags>]
---

## What we did

- <bullets: concrete changes, decisions>

## What I learned

- <concepts, written for Alfonso's future self>

## Problems & fixes

- <what broke and why; omit section if nothing>

## Links

- <docs used>

## Next

- <next step>
```

## Rules

- Keep it short: a log, not an article (that's what `content/blog/` is for).
- Write in first person from Alfonso's point of view. Alfonso is the author and reviews it before committing.
- Only record what actually happened in the session. Don't invent results.
- Frontmatter must stay valid YAML. Phase 6 will parse it with mdsvex.
