# 8. Sources

Where the knowledge in this project comes from: documentation, specs and articles, grouped by topic. Most of these are cited in the Devlog entries that used them; the second half of this chapter maps each part of the site to the entries that tell its story in more detail.

## Svelte and SvelteKit

- Runes: [`$state`](https://svelte.dev/docs/svelte/$state), [state in classes](https://svelte.dev/docs/svelte/$state#Classes), [`$derived`](https://svelte.dev/docs/svelte/$derived), [`$effect`](https://svelte.dev/docs/svelte/$effect) and [when not to use it](https://svelte.dev/docs/svelte/$effect#When-not-to-use-$effect), [`$props`](https://svelte.dev/docs/svelte/$props)
- Template: [attachments `{@attach}`](https://svelte.dev/docs/svelte/@attach), [`{#key}`](https://svelte.dev/docs/svelte/key), [`{@html}`](https://svelte.dev/docs/svelte/@html), [each blocks](https://svelte.dev/docs/svelte/each), [`style:` directive](https://svelte.dev/docs/svelte/style), [function bindings](https://svelte.dev/docs/svelte/bind#Function-bindings), [`<svelte:window>`](https://svelte.dev/docs/svelte/svelte-window), [`animate:flip`](https://svelte.dev/docs/svelte/animate)
- Styling: [scoped styles](https://svelte.dev/docs/svelte/scoped-styles), [global styles and `:global`](https://svelte.dev/docs/svelte/global-styles), [custom properties on components](https://svelte.dev/docs/svelte/custom-properties)
- Runtime: [`flushSync`](https://svelte.dev/docs/svelte/svelte#flushSync), [`prefersReducedMotion`](https://svelte.dev/docs/svelte/svelte-motion#prefersReducedMotion), [`mount`](https://svelte.dev/docs/svelte/imperative-component-api#mount), [rendering on the server](https://svelte.dev/docs/svelte/svelte-server)
- SvelteKit: [universal vs server load](https://svelte.dev/docs/kit/load#Universal-vs-server), [page options and `entries`](https://svelte.dev/docs/kit/page-options#entries), [prerender configuration](https://svelte.dev/docs/kit/configuration#prerender), [paths](https://svelte.dev/docs/kit/configuration#paths), [hooks: `handle`](https://svelte.dev/docs/kit/hooks#Server-hooks-handle) and [`reroute`](https://svelte.dev/docs/kit/hooks#Universal-hooks-reroute), [`onNavigate`](https://svelte.dev/docs/kit/$app-navigation#onNavigate), [`afterNavigate`](https://svelte.dev/docs/kit/$app-navigation#afterNavigate), [shallow routing](https://svelte.dev/docs/kit/shallow-routing), [`page` state](https://svelte.dev/docs/kit/$app-state#page), [server-only modules](https://svelte.dev/docs/kit/server-only-modules), [`+server` endpoints](https://svelte.dev/docs/kit/routing#server), [images and enhanced-img](https://svelte.dev/docs/kit/images)
- [Unlocking view transitions in SvelteKit](https://svelte.dev/blog/view-transitions) (the `onNavigate` pattern this site's layout uses)

## Vite and the build

- [Glob import, `import.meta.glob`](https://vite.dev/guide/features#glob-import), [static assets](https://vite.dev/guide/assets), [env variables](https://vite.dev/guide/env-and-mode.html), [plugin ordering](https://vite.dev/guide/api-plugin#plugin-ordering), [`css.postcss`](https://vite.dev/config/shared-options#css-postcss), [dependency optimization](https://vite.dev/config/dep-optimization-options)
- [Open Props](https://open-props.style/), [postcss-jit-props](https://github.com/GoogleChromeLabs/postcss-jit-props)
- [Fontsource](https://fontsource.org/), [Fira Code](https://github.com/tonsky/FiraCode)
- [pnpm `minimumReleaseAge`](https://pnpm.io/settings#minimumreleaseage)

## CSS: colour and tokens

- [Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties), [`@property`](https://developer.mozilla.org/en-US/docs/Web/CSS/@property)
- [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark), [`color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme), [`oklch()`](https://developer.mozilla.org/docs/Web/CSS/color_value/oklch), [`color-mix()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix), [relative colours](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors)
- [Björn Ottosson: OKLab](https://bottosson.github.io/posts/oklab/), [Evil Martians: OKLCH in CSS](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl), [oklch.com](https://oklch.com)
- [WCAG 2.2: Contrast (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- Dark mode toggles: [Kilian Valkhof: your dark mode toggle is broken](https://kilianvalkhof.com/2020/design/your-dark-mode-toggle-is-broken/), [Lea Verou: two states are enough](https://lea.verou.me/blog/2026/dark-mode-toggles/) (the model `ThemeToggle` uses), [Bramus: tri-state toggles](https://www.bram.us/2026/08/18/the-case-for-tri-state-dark-mode-toggles/), [Adam Argyle: building a theme switch](https://web.dev/articles/building/a-theme-switch-component)
- The colour themes' sources: [Tokyo Night](https://github.com/enkia/tokyo-night-vscode-theme), [Dracula spec](https://draculatheme.com/spec), [Catppuccin palette](https://github.com/catppuccin/palette), [Rosé Pine palette](https://github.com/rose-pine/palette), [Gruvbox](https://github.com/morhetz/gruvbox), [Solarized](https://ethanschoonover.com/solarized/)

## CSS: layout and structure

- [`@layer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer) and [layers with `!important`](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer#description), [Josh Comeau: a modern CSS reset](https://www.joshwcomeau.com/css/custom-css-reset/)
- [Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries), [`:has()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:has), [`grid-template-areas`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas), [`repeat()` auto-fill vs auto-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/repeat#auto-fill), [`min-width: auto` on grid items](https://developer.mozilla.org/en-US/docs/Web/CSS/min-width#auto)
- [`zoom`](https://developer.mozilla.org/en-US/docs/Web/CSS/zoom), [`position: sticky`](https://developer.mozilla.org/docs/Web/CSS/position#sticky_positioning), [`scroll-padding`](https://developer.mozilla.org/docs/Web/CSS/scroll-padding), [`scroll-snap-type`](https://developer.mozilla.org/docs/Web/CSS/scroll-snap-type), [`scroll-behavior`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior)
- [CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning), [`anchor-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/anchor-name), [`position-area`](https://developer.mozilla.org/en-US/docs/Web/CSS/position-area)
- [`@media (scripting)`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/scripting), [`@media (hover)`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover), [`@media (pointer)`](https://developer.mozilla.org/docs/Web/CSS/@media/pointer), [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Printing](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Printing), [`@page`](https://developer.mozilla.org/en-US/docs/Web/CSS/@page)

## CSS: motion and effects

- **View transitions:** [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API), [`view-transition-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-name), [`view-transition-class`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-class), [`:active-view-transition-type()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:active-view-transition-type), [`::view-transition-group()`](https://developer.mozilla.org/docs/Web/CSS/::view-transition-group), [Chrome: same-document view transitions](https://developer.chrome.com/docs/web-platform/view-transitions/same-document), [Ian Duffy: a theme switcher with view transitions](https://iankduffy.com/articles/creating-a-theme-switcher-using-view-transition), [theme toggle effects](https://theme-toggle.rdsx.dev/)
- **Scroll-driven animations:** [the MDN guide](https://developer.mozilla.org/docs/Web/CSS/CSS_scroll-driven_animations), [`animation-timeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline), [`animation-range`](https://developer.mozilla.org/docs/Web/CSS/animation-range), [`view-timeline-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-timeline-name), [scroll-driven-animations.style](https://scroll-driven-animations.style)
- **Popovers:** [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API), [`@starting-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style), [`transition-behavior`](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior), [`::backdrop`](https://developer.mozilla.org/en-US/docs/Web/CSS/::backdrop), [the `toggle` event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/toggle_event)
- **Masks and gradients:** [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask), [`mask-image`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image), [`mask-composite`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-composite), [`clip-path`](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path), [`conic-gradient()`](https://developer.mozilla.org/en-US/docs/Web/CSS/conic-gradient), [multiple backgrounds](https://developer.mozilla.org/docs/Web/CSS/CSS_backgrounds_and_borders/Using_multiple_backgrounds), [`mix-blend-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode), [SVG `<mask>`](https://developer.mozilla.org/docs/Web/SVG/Element/mask), [SVG `<animate>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animate)
- **3D:** [`perspective`](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective), [`transform-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style), [`backface-visibility`](https://developer.mozilla.org/en-US/docs/Web/CSS/backface-visibility)
- **Height to auto:** [CSS-Tricks: CSS grid can do auto height transitions](https://css-tricks.com/css-grid-can-do-auto-height-transitions/), [`hidden="until-found"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden), [`beforematch`](https://developer.mozilla.org/en-US/docs/Web/API/Element/beforematch_event), [`overflow-clip-margin`](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-clip-margin)
- **Pointer and cursors:** [`cursor`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor), [`pointer-events`](https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events), [`user-select`](https://developer.mozilla.org/en-US/docs/Web/CSS/user-select), [`::selection`](https://developer.mozilla.org/en-US/docs/Web/CSS/::selection)

## Browser APIs used by the effects

- [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API), [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver), [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver), [`getBoundingClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
- Canvas: [`getImageData()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData)
- Storage and files: [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), [`Blob.text()`](https://developer.mozilla.org/en-US/docs/Web/API/Blob/text), [`URL.createObjectURL()`](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static), [`Clipboard.writeText()`](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText), [`Window.postMessage()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

## Accessibility

- [WAI-ARIA APG: radio group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/), [breadcrumb](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)
- [`aria-pressed`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-pressed), [`aria-expanded`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-expanded), [`aria-current`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current), [the `status` role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role), [`inert`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert), [the `lang` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang)
- [WCAG 2.5.8: target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [Inclusive Components: cards](https://inclusive-components.design/cards/), [Deque: scrollable regions must be focusable](https://dequeuniversity.com/rules/axe/4.10/scrollable-region-focusable), [Lighthouse accessibility scoring](https://developer.chrome.com/docs/lighthouse/accessibility/scoring)

## Performance and images

- [web.dev: Cumulative Layout Shift](https://web.dev/articles/cls), [Optimize CLS](https://web.dev/articles/optimize-cls), [Optimize LCP](https://web.dev/articles/optimize-lcp), [`rel=preload`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload), [`unicode-range`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range)
- [Responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images), [`content-visibility`](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility), [replace animated GIFs with video](https://web.dev/articles/replace-gifs-with-videos)

## Content, search and the CMS

- Markdown: [marked's lexer](https://marked.js.org/using_pro#lexer), [svelte-markdown](https://markdown.svelte.page), [Shiki dual themes](https://shiki.style/guide/dual-themes), [GitHub alerts](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts), [Obsidian callouts](https://help.obsidian.md/callouts)
- Search: [Pagefind](https://pagefind.app/) (indexing with `data-pagefind-body`, the JS API, multilingual indexes)
- CMS: [Sveltia CMS docs](https://sveltiacms.app/en/docs), [editorial workflow](https://sveltiacms.app/en/docs/workflows/editorial), [custom file formats](https://sveltiacms.app/en/docs/api/file-formats), [preview templates](https://sveltiacms.app/en/docs/api/preview-templates), [GitHub backend](https://sveltiacms.app/en/docs/backends/github), [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth), [Cloudflare Workers: fetch handler](https://developers.cloudflare.com/workers/runtime-apis/fetch/), [GitHub App user access tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app) and [refreshing them](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/refreshing-user-access-tokens)
- SEO: [Open Graph](https://ogp.me/), [sitemaps.org](https://www.sitemaps.org/protocol.html), [Google: localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions), [Google: noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)

## Testing

- [Vitest](https://vitest.dev/guide/), [`test.each`](https://vitest.dev/api/#test-each), [Playwright: writing tests](https://playwright.dev/docs/writing-tests), [locators](https://playwright.dev/docs/locators), [web server](https://playwright.dev/docs/test-webserver), [CI](https://playwright.dev/docs/ci)

## Where ideas came from

Credit is given in the code when code or data is shipped; ideas only are noted here.

- The 404 games: pages collected on [404s.design](https://404s.design/). Our own designs and code.
- The pointer effects list in the cursors tool: [mouse-animations](https://github.com/tgomilar/mouse-animations) (MIT); our own code.
- The two-column blog with a tag sidebar: Josh Comeau's blog layout.
- The toolbox ideas: Omatsuri, it-tools, DevToys and tiny-helpers. Never port code from it-tools (GPL-3.0) or unlicensed repositories.
- Brand logos: [Simple Icons](https://simpleicons.org/) (see its [legal disclaimer](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md)); UI icons: [Lucide](https://lucide.dev/guide/packages/lucide-svelte).

## The Devlog: the story behind each part

The Devlog (`content/bitacora/`, on the site at `/devlog`) records why each thing is the way it is, what broke, and the links used. When you're about to change something, read its entries first.

| Part of the site             | Devlog entries                                                                                                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens, dark mode, layers    | `2026-10-27-semantic-tokens`, `2026-10-29-dark-mode-light-dark`, `2026-10-29-cascade-layers`, `2026-10-31-dark-first-palette`, `2026-11-18-an-engineering-pad-light-theme` |
| Theme toggle and transitions | `2026-10-29-theme-toggle-no-flash`, `2026-10-30-theme-reveal`, `2026-11-07-colour-themes`, `2026-11-07-theme-transitions`, `2026-11-08-more-theme-transitions`             |
| The grid and the sheet rule  | `2026-10-31-blueprint-background`, `2026-11-04-spotlight-contrast`, `2026-11-09-paper-on-the-drawing-board`                                                                |
| Page transitions             | `2026-10-31-route-view-transitions`, `2026-11-08-cards-that-become-the-page`, `2026-11-08-a-language-switch-with-effects`                                                  |
| Scroll-driven effects        | `2026-10-29-page-entrance-animations`, `2026-10-31-scroll-driven-header-footer`, `2026-11-03-scroll-spy-from-positions`, `2026-11-03-smooth-scroll-and-navigation`         |
| `/about` effects             | `2026-11-03-skills-page`, `2026-11-03-terminal-skill-rows`, `2026-11-03-collapsible-windows`                                                                               |
| Tags and cards               | `2026-11-06-cover-images-and-cards`, `2026-11-08-tag-cloud`, `2026-11-08-tags-everywhere`                                                                                  |
| Markdown                     | `2026-11-11-svelte-markdown-instead-of-mdsvex`, `2026-11-07-callouts`, `2026-11-07-video-blocks`, `2026-11-06-linkable-headings`, `2026-11-02-shiki-code-theme`            |
| Two languages                | `2026-11-08-a-language-in-the-url`, `2026-11-08-content-in-two-languages`                                                                                                  |
| CMS                          | `2026-11-09-a-cms-that-writes-like-me`, `2026-11-11-a-leaner-cms`, `2026-11-18-signing-in-through-a-worker`                                                                |
| Fonts, widths, text size     | `2026-10-29-self-hosted-fonts`, `2026-11-06-layout-shifts`, `2026-11-18-wider-pages-and-a-text-size`                                                                       |
| Search, footer panel, 404    | `2026-11-18-search-with-pagefind`, `2026-11-18-a-footer-that-opens`, `2026-11-18-a-404-worth-landing-on`                                                                   |
| Toolbox                      | `2026-11-09-a-toolbox-and-its-sources`, `2026-11-09-cursors-and-selection`, `2026-11-09-symbols-from-the-source`                                                           |
| CI and tests                 | `2026-11-04-unit-tests-with-vitest`, `2026-11-06-smoke-test-and-ci`, `2026-11-06-caching-on-github-pages`, `2026-11-18-a-workflow-that-cant-push`                          |

Other detailed guides in the repo: `content/blog/posts/README.md` (writing posts), `content/awesome/README.md` (the lists), `src/lib/cms/README.md` (the CMS), `design/` (design notes), and `.claude/CLAUDE.md` (the project's running notes).
