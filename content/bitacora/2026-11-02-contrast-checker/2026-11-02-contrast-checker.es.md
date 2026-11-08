---
title: Proyectos a partir de datos y un comprobador de contraste
reviewed: false
---

## Qué hicimos

- Añadí `src/lib/projects/`: una lista tipada de proyectos (`projects.ts`) y una carpeta por herramienta. El `tool` de cada proyecto es un `import()` dinámico, así que su código es un chunk propio y solo se carga en su página.
- `/projects` es una rejilla de tarjetas a partir de esa lista, y los "Proyectos destacados" de la portada también la usan. `/projects/[tool]` saca sus páginas de `entries()` y su componente de un load universal en `+page.ts` (un componente no puede venir de un load de servidor).
- La primera herramienta: un comprobador de contraste. Puntúa cada token de texto sobre cada superficie, en los dos temas, según las WCAG. El par que eliges va en la URL (`?text=brand&surface=surface-2`), así que un par se puede compartir.
- `tokens.css` vuelve a declarar los tokens en cualquier elemento con `[data-theme]`, no solo en `:root`.
- El `onNavigate` del layout se salta la view transition en las navegaciones superficiales.

## Qué aprendí

- La herramienta lee los colores en el navegador en vez de analizar `tokens.css` al construir el sitio. Una sonda oculta recibe `color: var(--token)`, `getComputedStyle()` devuelve `oklch(…)` y un canvas de 1×1 lo convierte a sRGB: se pinta el píxel y se lee con `getImageData()`. El navegador lo resuelve todo, y la herramienta comprobará temas futuros que solo existen en el navegador. El coste: sin JS no hay ratios.
- Una custom property se calcula donde se declara. En `:root`, `--text-1: light-dark(…)` ya es un solo color, y los hijos heredan ese color, no la fórmula. El `color-scheme` de un hijo no puede cambiarlo. Volver a declarar los tokens en el hijo hace que los calcule con su propio esquema. (Medido en Chrome.)
- `url.searchParams` no se puede leer mientras se prerenderiza: todavía no hay visitante. `onMount` solo se ejecuta en el navegador, así que la herramienta los lee ahí.
- SvelteKit 3 marca `replaceState` como obsoleto. `goto(url, { shallow: true, replace: true })` cambia la barra de direcciones sin navegar, y `replace` lo deja en una sola entrada del historial.
- Las navegaciones superficiales también ejecutan `onNavigate`. Sin una condición, cada elección en un select habría hecho desvanecerse la página y volver a aparecer.
- La URL se actualiza en el `onchange` de los select, no en un `$effect`: reacciona a lo que hice, no a cada cambio de estado.
- `page.url` está tipado como de solo lectura, así que lo copio con `new URL(page.url.href)` antes de poner parámetros.
- Los ratios de las WCAG se cortan, no se redondean: 4,497 no pasa el AA y no puede mostrarse como 4,50.

## Problemas y soluciones

- Primera versión: los dos temas mostraban los mismos ratios. La sonda tenía `color-scheme: dark`, pero `getPropertyValue('--text-1')` en `:root` ya era `oklch(21% .02 250)`. Lo arreglé con `[data-theme]` en `tokens.css`.
- A 320px, las tablas se pasaban 11px de ancho (`<body>` es un grid y crecía para que cupieran). Reducir el relleno de las celdas lo arregló.
- Lighthouse le dio un 98 a `/projects` por `heading-order` (un `h1` directamente a los `h3` de las tarjetas). Un `h2` de "Herramientas" lo subió a 100.
- La herramienta encontró algo: en el tema claro, `--code-constant` y `--code-type` solo llegan a "grande" (4,34 y 4,39) sobre `--surface-3`. El código va sobre `--surface-2`, donde sí pasan.

## Enlaces

- [MDN: `light-dark()`](https://developer.mozilla.org/es/docs/Web/CSS/color_value/light-dark)
- [MDN: `getImageData()`](https://developer.mozilla.org/es/docs/Web/API/CanvasRenderingContext2D/getImageData)
- [WCAG: contraste (mínimo)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)
- [SvelteKit: enrutado superficial](https://svelte.dev/docs/kit/shallow-routing)
- [SvelteKit: prerender y `url.searchParams`](https://svelte.dev/docs/kit/page-options#prerender)
- [Svelte: cuándo no usar `$effect`](https://svelte.dev/docs/svelte/$effect#When-not-to-use-$effect)

## Siguiente

- La primera lista Awesome, con búsqueda y filtros por etiqueta guardados en la URL.
