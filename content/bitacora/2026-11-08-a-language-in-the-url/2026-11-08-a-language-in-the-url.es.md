---
title: Un idioma en la URL
reviewed: false
---

## Qué hicimos

- Empezó la fase 10: el sitio en inglés y en español. Elegí una solución hecha a mano en vez de [Paraglide JS](https://paraglidejs.com): casi todo el texto es markdown y YAML, que Paraglide no traduce, su manejo de URLs es un hook de SvelteKit que puedo escribir yo, y su v3 tenía días. Mis mensajes tienen la forma de los de Paraglide (`m.blogTitle()`), así que pasarse más adelante sería sobre todo cambiar imports.
- Decidido en una entrevista: inglés en `/portfolio/`, español en `/portfolio/es/`, las mismas rutas (sin slugs traducidos), español de España (`es-ES`), sin detección de idioma, un enlace ES/EN en la cabecera y fechas ISO en los dos idiomas.
- Primero una prueba en `/blog`, luego todas las páginas:
  - `src/hooks.ts`: un hook `reroute` quita el `/es`, así que `/es/blog` es la ruta `/blog`. Los ids de ruta no cambian, así que las migas de pan, el marcador del menú e `isInside()` siguieron funcionando.
  - `src/lib/i18n/`: `en.ts` y `es.ts` (unos 130 mensajes cada uno; `es.ts` usa `satisfies`, así que si falta uno falla `pnpm check`), `locales.ts` (sin imports de SvelteKit: `split()`, `plural()` con `Intl.PluralRules`), `index.ts` (`m`, `route()`, `getLocale()`, `formatNumber()`).
  - `<html lang>` mediante un marcador `%lang%` en `app.html`, que rellena `hooks.server.ts` y que se actualiza en el navegador tras un cambio de idioma en el cliente.
  - `Seo.svelte`: alternativas `hreflang`, `x-default` y `og:locale`. El sitemap lista cada página traducida una vez por idioma.
- Tests: la prueba de humo se ejecuta en los dos idiomas, más un test del selector de idioma; tests unitarios de `split()`, los plurales y todos los mensajes.

## Qué aprendí

- **`reroute` cambia la ruta, no la URL.** `page.url` conserva el `/es` (de ahí sale el idioma); `page.route.id` sigue siendo `/blog`.
- **`resolve()` escribe los enlaces relativos a la URL real** al prerenderizar: en `/es/blog`, `resolve('/blog')` es `../blog`, la página en inglés. Así que todos los enlaces pasan por `route()`, que pone `es/` justo después de `resolve('/')`. Un test unitario falla si cualquier otro archivo importa `resolve`.
- **El idioma sale de la página, no de una variable:** el build renderiza todas las páginas, en los dos idiomas, en un solo proceso. `getLocale()` lee `page.data.locale`, que pertenece a la página que se está renderizando.
- **Misma ruta, otro idioma, mismo componente:** SvelteKit conserva el componente de una página cuando solo cambia el idioma de la URL, así que lo que se calcula una vez en un `<script>` se queda en el idioma anterior. `{#key getLocale()}` en el layout raíz reconstruye la página.
- El español escribe `4,53`, no `4.53`: `Intl.NumberFormat` lo sabe.

## Problemas y soluciones

- El `import.meta.env.BASE_URL` de Vite es `./` con SvelteKit, así que no le sirve al hook para saber la ruta base. En su lugar, `vite.config.ts` define `import.meta.env.BASE_PATH`.
- El primer sitemap no tenía URLs en español. Construye su lista de páginas al cargar el módulo, donde `resolve()` es absoluto, y la localizaba durante la petición, donde `resolve('/')` es relativo. `localizePath()` trabaja con la ruta base real.
- El test de "todos los mensajes tienen texto" llamaba a cada mensaje con `{ count: 2 }`; los mensajes del nivel de una habilidad necesitan un `level`. No encontró nada mal en los mensajes, pero me recordó que la muestra del test tiene que valer para todos.

## Enlaces

- [SvelteKit: reroute](https://svelte.dev/docs/kit/hooks#Universal-hooks-reroute)
- [Google: versiones localizadas de una página](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [MDN: Intl.PluralRules](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules)

## Siguiente

- La parte del contenido: artículos, entradas y YAML en los dos idiomas.
