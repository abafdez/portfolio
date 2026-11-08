---
title: 'Borradores que nunca se publican: un glob, import.meta.env.DEV y código muerto'
description: Por qué filtrar los borradores no bastaba en un blog estático con SvelteKit, y cómo un glob solo para desarrollo deja todos los borradores fuera del build.
cover: Un embudo que filtra artículos.
reviewed: false
---

Mi blog empezó con todos los artículos marcados `draft: true` en su frontmatter, y un filtro que ocultaba los borradores fuera de desarrollo. Parecía que funcionaba: ningún borrador aparecía en el sitio construido. Pero los borradores seguían en el build, y cualquiera podía leerlos.

## Por qué un filtro no basta

Cada página de artículo obtiene su cuerpo de un glob:

```ts
const bodies = import.meta.glob<Component>('/content/blog/*.md', { import: 'default' });
```

`import.meta.glob` es una función de Vite. Vite lo resuelve mientras se construye el sitio, solo a partir de las rutas de los archivos. Nunca lee el frontmatter, así que no puede saber que un archivo es un borrador. Genera un chunk de JavaScript por cada archivo que coincide con el glob, se use o no.

Así que el filtro ocultaba los enlaces y las páginas, pero el cuerpo de cada borrador seguía acabando en `build/_app/immutable/` como un archivo `.js`, listo para abrirlo por su URL.

<!-- TODO: qué encontré en el resultado del build (buscar con grep el título de un borrador en build/) antes del arreglo -->

## Los borradores son una carpeta

Ahora un borrador es un borrador por dónde vive: `content/blog/drafts/`, junto a `content/blog/published/`. Cada artículo es una carpeta con sus imágenes, y publicar uno significa mover su carpeta de una a la otra (`git mv content/blog/drafts/<slug> content/blog/published/`). La marca `draft` sale de la ruta, así que no hay frontmatter que olvidar:

```ts
const draft = path.includes('/drafts/');
```

## Un glob que solo ve desarrollo

Los borradores tienen su propio glob, detrás de `import.meta.env.DEV`:

```ts
const bodies = {
	...import.meta.glob<Component>('/content/blog/published/*/*.md', { import: 'default' }),
	...(import.meta.env.DEV
		? import.meta.glob<Component>('/content/blog/drafts/*/*.md', { import: 'default' })
		: {})
};
```

(`*/*.md`: cada artículo está en una carpeta con su propio nombre, junto a sus imágenes.)

En un build, Vite sustituye `import.meta.env.DEV` por `false`. La condición se queda en `false ? … : {}`, el bundler ve que la primera rama no puede ejecutarse nunca y la elimina, glob incluido. Sin glob no se genera ningún chunk y no se lee ningún borrador.

La lista de artículos (solo el frontmatter) funciona igual en `content.ts`, así que `/blog` y la portada tampoco listan nunca un borrador en un build.

<!-- TODO: probarlo: `pnpm build` y luego `grep -rl "<el título de un borrador>" build/` no encuentra nada; `pnpm dev` muestra los borradores -->

## El cuerpo viene de un load universal

La página del artículo tiene dos archivos load. El frontmatter viene de `+page.server.ts`, y el cuerpo de `+page.ts`. Un `load` de servidor envía sus datos al navegador serializados, y un componente es una función, que no se puede serializar. Un `load` universal también se ejecuta en el navegador, así que puede hacer `import()` del chunk directamente.

## Una excepción a una comprobación útil

Mientras todos los artículos sean borradores, `/blog/[slug]` no tiene ninguna página en un build. SvelteKit hace fallar el build cuando nunca se llega a una ruta durante el prerenderizado, y me gusta esa comprobación: detecta una página que olvidé enlazar. Así que no la desactivé. Hice una excepción:

```ts
sveltekit({
	prerender: {
		handleUnseenRoutes: ({ routes, message }) => {
			if (routes.some((route) => route !== '/blog/[slug]')) throw new Error(message);
		}
	}
});
```

Cualquier otra ruta sin visitar sigue haciendo fallar el build. En cuanto publique un artículo, `entries()` lo devuelve, la ruta tiene una página y la excepción deja de importar.

<!-- TODO: el primer artículo que publiqué, y si quité la excepción -->
