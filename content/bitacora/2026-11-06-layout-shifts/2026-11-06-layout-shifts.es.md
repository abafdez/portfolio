---
title: Lighthouse por encima de 90, y páginas que dejaron de saltar
reviewed: false
---

## Qué hicimos

- Pasé Lighthouse (móvil, el modo por defecto) por una página de cada tipo. Accesibilidad, buenas prácticas y SEO daban 100 en todas; el rendimiento, entre 95 y 98, salvo en tres páginas: una entrada del Devlog (89), la lista de CSS moderno (91) y el comprobador de contraste (86). Las tres perdían puntos por el **CLS**, contenido que se mueve después de aparecer.
- **Fuentes:** `src/hooks.server.ts` le pide a SvelteKit que precargue los archivos latinos de Fira Code y Shantell Sans (`resolve(event, { preload })`), para que se descarguen con el HTML en vez de después del CSS.
- **Lista Awesome:** los filtros ya están en el HTML prerenderizado, con `visibility: hidden` hasta que `onMount` añade `.ready`, y `display: none` bajo `@media (scripting: none)`. Antes, `{#if ready}` los añadía más tarde y empujaba la lista hacia abajo.
- **Comprobador de contraste:** la línea de la puntuación siempre se muestra (un espacio de no separación hasta que se leen los tokens), así que ya no aparece de golpe empujando la página hacia abajo.
- Después: CLS 0 en esas páginas, rendimiento de 95 a 97 en las siete páginas auditadas y accesibilidad 100 en los dos temas.

## Qué aprendí

- El **CLS** (Cumulative Layout Shift) suma cuánto se mueve el contenido visible, y cuánto contenido. Por debajo de 0,1 está bien. Es lo que te hace pulsar el enlace equivocado porque la página saltó.
- La auditoría `layout-shifts` de Lighthouse nombra cada elemento que se movió y la causa, como "Web font loaded".
- **Las fuentes mueven la página** porque el texto se muestra primero con una fuente de respaldo de otro ancho, y vuelve a partir las líneas cuando llega la de verdad. El navegador solo encuentra una fuente después de leer el CSS, así que un `<link rel="preload" as="font">` en el HTML la empieza antes.
- Fontsource divide cada fuente en un archivo por alfabeto (`unicode-range`), y el navegador solo descarga los que usa una página. Así que solo hay que precargar el archivo latino, o cada visitante recibirá también el cirílico y el griego.
- **El contenido que aparece después de que se ejecute el JS** también mueve la página. La solución es reservar su espacio desde el primer pintado: mostrarlo oculto (`visibility: hidden` conserva el espacio, `display: none` no) o mostrar un hueco vacío.
- `@media (scripting: none)` coincide cuando el JS está desactivado, así que la versión sin JS puede seguir quitando lo que nunca funcionaría.
- Precargar tiene un coste: en la red ralentizada, el LCP pasó de unos 2,0 s a 2,5 s, porque ahora las fuentes se descargan antes que otras cosas. Aun así la puntuación subió; el CLS pesa más.
- En SvelteKit 3, `Handle` viene de `@sveltejs/kit/hooks`, no de `@sveltejs/kit`.

## Problemas y soluciones

- `/about` todavía se mueve un poco (CLS de 0,05, las ventanas de habilidades que se pliegan después de la hidratación). Está por debajo de 0,1, así que lo dejé.

## Enlaces

- [web.dev: Cumulative Layout Shift](https://web.dev/articles/cls)
- [web.dev: optimizar el CLS](https://web.dev/articles/optimize-cls)
- [MDN: rel=preload](https://developer.mozilla.org/es/docs/Web/HTML/Reference/Attributes/rel/preload)
- [SvelteKit: hooks, handle y preload](https://svelte.dev/docs/kit/hooks#Server-hooks-handle)
- [MDN: @media scripting](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/scripting)

## Siguiente

- El "terminado cuando" de la fase 9 se cumple: la CI ejecuta check, lint, test y build en las PR, y Lighthouse está por encima de 90. Opcional: datos estructurados `BreadcrumbList`.
