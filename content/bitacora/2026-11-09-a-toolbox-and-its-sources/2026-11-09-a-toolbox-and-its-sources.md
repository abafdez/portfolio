---
title: A toolbox, and when to credit a source
date: 2026-11-09
phase: 8.5
tags: [open-source, licensing, svelte]
---

## What we did

- Started Phase 8.5: a dashboard of small browser-only tools at `/projects/toolbox`, each at `/projects/toolbox/<tool>`. The first is Base64. The ideas come from several collections (Omatsuri, it-tools, DevToys, tiny-helpers), picked and chosen.
- Before borrowing anything, checked the licence of every candidate project with the GitHub API. MIT (Omatsuri, color-color, huetone, svgomg, transform…): code can be ported. Apache-2.0 (CyberChef, Squoosh, Leonardo): also fine, with their NOTICE file. GPL-3.0 (it-tools) and repos with no licence (Clippy): ideas only.
- Built a credit line for Omatsuri at the foot of the dashboard, with its MIT licence folded in a `<details>`, then removed it the same day: Base64 copies nothing from Omatsuri. The rule now: a tool credits a project only when it ships that project's code or data, on that tool.
- Dropped the CSS generators from the plan, and HTML symbols will get our own, bigger data instead of Omatsuri's lists.
- The dashboard draws each tool as a small terminal window (`ToolWindow.svelte`), like the skill windows on `/about`. The whole window is one link, and its parts morph into the tool's header.
- The breadcrumbs got a fourth level (`crumbParent` in the page data): Home / Projects / Toolbox / Base64.
- An e2e test reads the tools from the dashboard and opens each one, so a new tool is tested without touching it.

## What I learned

- MIT asks for one thing: "The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software." A built site is a copy too, so a notice for code it ships has to be on the page, not only in the repo.
- A licence covers code and data, not ideas. A Base64 converter is everyone's idea, and a credit for code I didn't copy would say something untrue.
- GPL-3.0 is different: copying its code into the site would put the site's own code under the GPL. Reading it for ideas is fine.
- No licence doesn't mean free: it means all rights reserved.
- Data has licences too: the HTML spec's list of named characters is CC BY 4.0, which asks for attribution. If the symbols tool uses it, that tool gets a credit.

## Problems & fixes

- Lighthouse gave best practices 96 for "errors in console" on every page, even untouched ones: 404s on `_app/immutable/*`. The e2e run had rebuilt the site, but the old `pnpm preview` was still running, so the new one couldn't take the port. Stopping it by port (`ss -ltnp`) fixed it: 100.

## Links

- [Choose a License: MIT](https://choosealicense.com/licenses/mit/)
- [GitHub Docs: Licensing a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)
- [Creative Commons: CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## Next

- Step 2: keyboard events (`key`, `code`, modifiers and a generated snippet).
