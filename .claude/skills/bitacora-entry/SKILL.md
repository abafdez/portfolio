---
name: bitacora-entry
description: Write a Bitácora (dev-log) entry summarizing the current session or phase into content/bitacora/. Use when the user asks to log, record, or save the conversation/session, or at the end of a learning-path phase.
---

# Bitácora entry

Create `content/bitacora/YYYY-MM-DD-<short-slug>/YYYY-MM-DD-<short-slug>.md`: a folder and a file with the same name (today's date; if the folder exists, pick a different slug). Images go in the same folder, written as `![What it shows](./file.png)` (alt text is required).

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

## In Spanish too

Every entry is written in both languages (since Phase 10). Next to the English file, write `YYYY-MM-DD-<short-slug>.es.md` in the same folder, in Spain's Spanish (tú, ordenador), with its own frontmatter:

```markdown
---
title: <the title in Spanish>
reviewed: false
---
```

Only `title`, `description` (optional), `cover` (the alt text, if the folder has a cover) and `reviewed` go in it: `date`, `phase` and `tags` come from the English file, and writing them fails the build. `reviewed: false` until Alfonso has read it. Headings in Spanish: Qué hicimos, Qué aprendí, Problemas y soluciones, Enlaces, Siguiente. Code stays as it is. Avoid wording that needs a gender for Alfonso (phrase around desarrollador/desarrolladora).

## Rules

- Keep it short: a log, not an article (that's what `content/blog/` is for).
- Write in first person from Alfonso's point of view. Alfonso is the author and reviews it before committing.
- Only record what actually happened in the session. Don't invent results.
- Frontmatter must stay valid YAML. Phase 6 will parse it with mdsvex.
