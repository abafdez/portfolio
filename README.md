# Alfonso Baeza · portfolio

My personal site, built in the open as a learning project: [abafdez.github.io/portfolio](https://abafdez.github.io/portfolio/). A blog, a Devlog of how the site is made, Awesome lists, small browser tools, and a CV builder, in English and Spanish.

SvelteKit 3 and Svelte 5, prerendered to static files with adapter-static and served by GitHub Pages. Plain modern CSS on design tokens (Open Props for scales), markdown rendered on the server with marked, svelte-markdown and Shiki, search with Pagefind, and Sveltia CMS at `/admin`.

## Run it

```sh
pnpm install
pnpm dev            # http://localhost:5173, drafts visible, the CMS at /admin
BASE_PATH=/portfolio pnpm build && BASE_PATH=/portfolio pnpm preview   # the real thing
pnpm check && pnpm lint && pnpm test && pnpm test:e2e                  # what CI runs
```

## Customize it

**[The customizing guide](docs/customizing/README.md)** explains how everything fits together: every library and what it does, the design tokens and colour themes, every effect and how to turn it off, the page and theme transitions, reusable recipes for the animations, checklists for adding things, and the sources behind it all.

Other guides: [writing posts](content/blog/posts/README.md), [the Awesome lists](content/awesome/README.md), [the CMS](src/lib/cms/README.md).

## Licence

All rights reserved: see [LICENSE.txt](LICENSE.txt). The colour themes and other third-party pieces keep their own licences, noted where they're used.
