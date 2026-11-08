---
title: Props y enlaces tipados en componentes de Svelte 5
description: Cómo tipé las props de mi componente de portada, hice enlaces que no pueden apuntar a una página que no existe y resolví las listas vacías, con algunos trucos de TypeScript por el camino.
cover: Un esquema con SvelteKit y TypeScript construyendo un componente tipado
reviewed: false
---

La parte de arriba de la portada de mi portfolio es un "hero": mi nombre, un lema, una foto y unos enlaces. Construirlo fue una buena excusa para hacer que las props de Svelte 5 y TypeScript trabajaran bien juntos.

## La página tiene los datos, el componente tiene la maquetación

El hero no sabe nada de mí. Lo recibe todo como props:

```svelte
<script lang="ts">
	import type { Picture } from '@sveltejs/enhanced-img';
	import type { Link } from '#lib/links.ts';

	interface Props {
		name: string;
		links: Link[];
		tagline?: string;
		photo?: Picture;
	}

	let { name, links, tagline, photo }: Props = $props();
</script>
```

La portada le pasa el contenido:

```svelte
<Hero name="Alfonso Baeza" tagline="Web developer." {photo} {links} />
```

## ¿Obligatoria u opcional?

Mi primer instinto fue darle a cada prop un valor por defecto, por si acaso. Pero piensa en lo que hace un valor por defecto con `name`:

```ts
let { name = '' }: Props = $props(); // ❌
```

Si me olvido de pasarlo, la página muestra un `<h1>` vacío. Se ve bien. Pero los lectores de pantalla anuncian un encabezado sin texto, y nada me avisa. Hacer que `name` sea **obligatoria** convierte ese bug silencioso en un error de tipos.

Así que uso una regla:

- **Obligatoria** cuando el componente no tiene sentido sin ella: `name`, `links`.
- **Opcional** cuando sigue funcionando sin ella: el hero se ve bien sin lema o sin foto.

## Enlaces que no pueden apuntar a una página que no existe

El hero tiene dos tipos de enlaces: páginas de mi sitio y perfiles externos. Un tipo cubre los dos:

```ts
import type { RouteId } from '$app/types';

export type Link = { label: string; route: RouteId } | { label: string; url: `https://${string}` };
```

- `RouteId` lo genera SvelteKit a partir de mis rutas reales. Una errata como `'/porjects'` es un error de tipos.
- `` `https://${string}` `` es un template literal type. `'http://…'` o un `'github.com'` a secas no compilan.
- Un enlace tiene `route` o `url`, nunca los dos.

En la plantilla, el operador `in` le dice a TypeScript qué tipo de enlace es:

```svelte
<a href={'route' in link ? resolve(link.route) : link.url}>{link.label}</a>
```

Dentro de la primera rama, TypeScript sabe que `link.route` existe. Esto se llama estrechamiento (narrowing).

Más tarde, añadir una ruta con un parámetro (`/bitacora/[slug]`) rompió esto. `resolve('/bitacora/[slug]')` también necesita un slug, así que `resolve()` ya no acepta "cualquier `RouteId`" por sí solo. Estos enlaces nunca apuntan a una ruta con parámetros, así que ahora el tipo lo dice:

```ts
export type RouteWithoutParams = Exclude<RouteId, `${string}[${string}`>;

export type Link =
	{ label: string; route: RouteWithoutParams } | { label: string; url: `https://${string}` };
```

`Exclude` quita todos los ids de ruta que contienen un `[`. Es el mismo truco de template literal que el de `https://`.

## satisfies: comprobar el tipo y conservar los detalles

Mis enlaces de GitHub y LinkedIn aparecen en el hero y en el pie, así que viven en una sola lista:

```ts
export const profiles = [
	{ label: 'GitHub', url: 'https://github.com/abafdez' },
	{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/alfonso-baeza-fdez/' }
] as const satisfies readonly Link[];
```

Si hubiera escrito `const profiles: Link[] = …`, TypeScript olvidaría que todos son URLs. El pie necesitaría una comprobación `if ('url' in profile)` para cada uno. `satisfies` comprueba que cada elemento es un `Link` válido **sin ensanchar el tipo**, así que el pie puede usar `profile.url` directamente.

## Compartir un tipo desde un componente

Las tarjetas de "últimos artículos" tienen sus propias props. Para que las páginas puedan tipar sus listas, la tarjeta exporta el tipo de sus props desde un bloque `<script module>`, que se ejecuta una vez por archivo en vez de una vez por tarjeta:

```svelte
<script module lang="ts">
	import type { ResolvedPathname } from '$app/types';

	export interface Teaser {
		title: string;
		description?: string;
		href?: ResolvedPathname;
	}
</script>
```

La tarjeta recibe un enlace ya resuelto. La página que la muestra conoce la ruta exacta, así que llama a `resolve('/bitacora/[slug]', { slug })`, y esa llamada comprueba la ruta y sus parámetros. Dentro de la tarjeta, la ruta podría ser cualquiera, y TypeScript no podría comprobar los parámetros.

```ts
import TeaserCard, { type Teaser } from '#lib/components/TeaserCard.svelte';
const posts: Teaser[] = [];
```

## Las listas vacías llevan un texto alternativo, no datos falsos

Mi blog aún no existe. Mi primera versión mostraba tres tarjetas falsas de "Próximamente". La versión mejor usa la lista real (vacía), con el `{:else}` de Svelte:

```svelte
{#each posts as post (post.title)}
	<TeaserCard {...post} />
{:else}
	<p>No posts yet. They'll show up here once the blog is live.</p>
{/each}
```

Cuando llegue el blog, relleno el array y no cambia nada más.

## Una trampa: las extensiones en los alias

Mi proyecto usa el campo `imports` de Node en `package.json` para el alias `#lib`. Apunta a rutas de archivo exactas, así que los archivos TypeScript necesitan su extensión:

```ts
import type { Link } from '#lib/links.ts'; // ✅
import type { Link } from '#lib/links'; // ❌ Cannot find module
```
