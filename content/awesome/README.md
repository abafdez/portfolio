# Awesome lists

One YAML file per list; the file name is its URL (`modern-css.yaml` → `/awesome/modern-css`). Edit them in the CMS (`pnpm dev`, then `/admin/index.html`) or by hand.

- Every `url` must be `https://` and every tag lowercase kebab-case, or the build fails (`src/lib/awesome/awesome.ts`).
- Tags cut across categories: what a link is (docs, article, tool, site) and what it's about.
- In Spanish, a text is plain (the same in every language) or `{ en: …, es: … }`. Once the list's description is in both, every link's description must be too (else the build fails: the Spanish page would be half English).
- In the CMS, the list's title and description, category names and link descriptions are always `{ en, es }` (a field has one shape); write the same word twice when it doesn't change. Link titles stay plain: they're the sources' own, so they stay as their authors wrote them.
- Comments in the YAML files are lost when the CMS saves them, so notes about the lists go here.
- After editing a file by hand, run `pnpm content:format` so the CMS's next save only changes what it edits.
