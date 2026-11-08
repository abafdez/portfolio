---
title: Las entradas del Devlog, renderizadas con mdsvex
reviewed: false
---

## Qué hicimos

- Elegí mdsvex 0.12.8 (la estable) para renderizar el cuerpo del markdown. La reescritura `1.0.0-next` todavía es una versión preliminar.
- Llamé a mdsvex desde un pequeño plugin de Vite, `markdown()`, en `vite.config.ts`, no desde `preprocess`. `extensions: ['.svelte', '.md']` se queda para que Svelte compile el resultado.
- Añadí `/devlog/[slug]`: `entries()` y el frontmatter en `+page.server.ts`, y el componente del cuerpo en `+page.ts`. Las 23 entradas se prerenderizan.
- Añadí `RouteWithoutParams` en `src/lib/links.ts` para los enlaces que pasan solo por `resolve()`.

## Qué aprendí

- Vite ejecuta primero todos los hooks de transformación `order: 'pre'`, luego los normales y luego los `'post'`. El orden del array `plugins` solo importa dentro de cada grupo.
- Un filtro como `{ id: /\.md$/ }` mantiene un plugin lejos de `file.md?raw`. Ese import ya es un módulo JS (`export default "…"`) y todos los hooks de transformación se ejecutan sobre él.
- Los datos de un load de servidor se guardan como JSON, y un componente no se puede guardar así. Por eso el componente viene de un `+page.ts` universal, que recibe los `data` del servidor.
- Un `import.meta.glob` perezoso da un chunk por entrada, así que el navegador solo descarga la entrada que muestra.
- El prerenderizador solo encuentra las páginas enlazadas. Todavía nada enlaza a una entrada, así que es `entries()` quien las construye.
- ``Exclude<RouteId, `${string}[${string}`>`` quita todas las rutas con un parámetro.

## Problemas y soluciones

- ``CompileError: `<enhanced:img>` was left open`` en una entrada del Devlog que menciona la etiqueta en el texto. enhanced-img analiza todos los archivos Svelte en un hook `'pre'`, antes de los preprocesadores, así que leía el markdown en bruto. Mi plugin `'pre'` ejecuta mdsvex antes que él, y la etiqueta llega escapada.
- Un aviso de obsolescencia de `context="module"` por archivo: mdsvex 0.12 escribe sintaxis de Svelte 4. El plugin la reescribe a `<script module>`.
- Un aviso de sourcemap por archivo. Devolver `map: { mappings: '' }` dice "sin mapa, a propósito".
- `pnpm check` fallaba en Nav, Hero y TeaserCard: `RouteId` ahora incluye `/devlog/[slug]`, que `resolve()` no puede construir sin un slug. Lo arreglé con `RouteWithoutParams`.
- Parecía que faltaba el CSS de la página en la previsualización. Una previsualización antigua seguía en el puerto 4173 sirviendo recursos viejos; la nueva se había ido al 4174.

## Enlaces

- [Documentación de mdsvex](https://mdsvex.com/docs)
- [Vite: orden de los plugins](https://vite.dev/guide/api-plugin#plugin-ordering)
- [Vite: glob import](https://vite.dev/guide/features#glob-import)
- [SvelteKit: load universal frente a load de servidor](https://svelte.dev/docs/kit/load#Universal-vs-server)
- [SvelteKit: entries](https://svelte.dev/docs/kit/page-options#entries)

## Siguiente

- Estilos de prosa para el markdown renderizado, y luego la línea de tiempo de `/bitacora` con tarjetas enlazadas.
