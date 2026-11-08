---
title: 'El componente Hero: props tipadas, enlaces y textos alternativos'
reviewed: false
---

## Qué hicimos

- Construí `Hero.svelte` (nombre, lema, foto y enlaces) y `TeaserCard.svelte`, y los combiné en la portada.
- Añadí `src/lib/links.ts` con un tipo `Link` y una lista compartida `profiles` (GitHub, LinkedIn) que usan el hero y el pie.
- Sustituí las tarjetas falsas de "Próximamente" por listas tipadas y vacías con un texto alternativo mediante `{#each}…{:else}`.

## Qué aprendí

- La página tiene los datos y el componente tiene la maquetación. Hero no sabe nada de mi contenido.
- `Link` es una unión de dos formas: una `route` (un `RouteId`) o una `url` (un texto que empieza por `https://`). `'route' in link` la estrecha, así que TypeScript sabe si llamar a `resolve()` o usar la URL.
- Un template literal type (`` `https://${string}` ``) rechaza `http://` y los textos sueltos al compilar.
- Las props obligatorias (`name`, `links`) convierten un valor que falta en un error de tipos. Un valor por defecto como `''` mostraría un `<h1>` vacío: se ve bien, pero los lectores de pantalla reciben un encabezado sin texto, y nada me avisa.
- Las props opcionales (`tagline?`, `photo?`) son para cosas sin las que el componente sigue teniendo sentido.
- `<script module>` se ejecuta una vez por archivo, no una vez por instancia, así que ahí va un tipo compartido como `Teaser`. Las páginas lo importan con `import TeaserCard, { type Teaser } from '…'`.
- `{#each list as item}…{:else}…{/each}` muestra un texto alternativo cuando la lista está vacía. Cuando lleguen los datos de verdad, no cambia nada más.
- `as const satisfies readonly Link[]` comprueba que cada elemento es un `Link` válido pero conserva el tipo exacto, así que el pie sabe que todos los perfiles tienen `url`. Con `: Link[]` necesitaría un `if`.
- El alias `#lib/*` de `package.json` apunta a rutas exactas, así que los archivos TS necesitan la extensión: `#lib/links.ts`.

## Problemas y soluciones

- `Cannot find module '#lib/links'`: añadí la extensión `.ts`.
- `svelte-check` decía "`<script>` was left open" porque un comentario de mi script contenía literalmente el texto `<style>`. Encuentra los bloques por sus etiquetas en el texto en bruto, así que reescribí el comentario.

## Enlaces

- [Svelte: $props](https://svelte.dev/docs/svelte/$props)
- [Svelte: bloques each](https://svelte.dev/docs/svelte/each)
- [TypeScript: satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)

## Siguiente

- Escribir el lema de verdad (TODO en `src/routes/+page.svelte`).
