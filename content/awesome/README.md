# Awesome lists

One YAML file per list; the file name is its URL (`modern-css.yaml` → `/awesome/modern-css`). Edit them in the CMS (`pnpm dev`, then `/admin`) or by hand.

- Every `url` must be `https://` and every tag lowercase kebab-case, or the build fails (`src/lib/awesome/awesome.ts`).
- Each list has an icon for its card and page: `icon:` with a Lucide name ([lucide.dev/icons](https://lucide.dev/icons), e.g. `sparkles`) or `logo:` with a Simple Icons slug ([simpleicons.org](https://simpleicons.org), e.g. `svelte`), not both. A name that doesn't exist fails the build (`src/lib/glyph.server.ts`).
- A new list also needs an entry in the CMS config (`src/lib/cms/config.yml`, the `awesome` collection), or the CMS won't show it.
- Tags cut across categories: what a link is (docs, article, tool, site) and what it's about.
- In Spanish, a text is plain (the same in every language) or `{ en: …, es: … }`. Once the list's description is in both, every link's description must be too (else the build fails: the Spanish page would be half English).
- In the CMS, the list's title and description, category names and link descriptions are always `{ en, es }` (a field has one shape); write the same word twice when it doesn't change. Link titles stay plain: they're the sources' own, so they stay as their authors wrote them.
- Comments in the YAML files are lost when the CMS saves them, so notes about the lists go here.
- After editing a file by hand, run `pnpm content:format` so the CMS's next save only changes what it edits.
