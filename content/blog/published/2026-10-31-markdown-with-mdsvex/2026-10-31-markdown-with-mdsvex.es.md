---
title: 'Páginas de markdown con mdsvex, y una lección sobre el orden de los plugins de Vite'
description: Convertir una carpeta de archivos markdown en páginas de SvelteKit prerenderizadas con mdsvex, por qué la configuración habitual con preprocess se rompió con mis propios artículos, y cómo ordena Vite de verdad los plugins.
cover: Un archivo markdown que se convierte en un componente de Svelte.
reviewed: false
---

El Devlog y este blog son carpetas de archivos markdown. Hasta ahora, el sitio solo leía su frontmatter, para listar los últimos en la portada. Este artículo también renderiza los cuerpos: cada archivo de `content/bitacora/` se convierte en su propia página prerenderizada, y añadir un archivo es el único paso para publicar uno.

Mi primer intento falló, y el motivo resultó ser más interesante que la configuración.

## Por qué mdsvex

Hay dos formas de sacar HTML de un markdown en SvelteKit:

- **Renderizarlo tú** en un `load` de servidor, con una librería de markdown, y poner el texto HTML en la página con `{@html}`.
- **mdsvex**, que convierte cada archivo markdown en un componente Svelte. Lo importas y lo muestras como cualquier otro componente, y el markdown también puede usar componentes Svelte.

Ahora mismo mdsvex tiene dos versiones: la 0.12, la estable, y una reescritura `1.0.0-next` que todavía es preliminar. Uso la 0.12.

## La configuración habitual, y cómo se rompió

La documentación de mdsvex lo añade como preprocesador. Un preprocesador cambia el código de un archivo antes de que lo vea el compilador de Svelte, así que mdsvex convierte el markdown en marcado de Svelte, y Svelte lo compila como un archivo `.svelte`. En SvelteKit 3 la configuración vive en `vite.config.ts`:

```ts
sveltekit({
	extensions: ['.svelte', '.md'],
	preprocess: [mdsvex({ extensions: ['.md'] })]
});
```

`extensions` le dice a Svelte que compile los archivos `.md` como componentes. El build falló con mi propia entrada del Devlog sobre imágenes:

```
[plugin vite-plugin-enhanced-img-markup] content/bitacora/2026-10-29-enhanced-img-avatar.md
CompileError: `<enhanced:img>` was left open
```

La línea de la que se quejaba era prosa: "rendered it with `<enhanced:img>` in Hero". mdsvex sabe que eso es código en línea y lo escapa. Pero el error no venía de mdsvex. Venía de enhanced-img, el plugin que optimiza mis imágenes.

enhanced-img tiene que encontrar cada etiqueta `<enhanced:img>` de mis componentes antes de que Svelte los compile, así que analiza todos los archivos Svelte. En cuanto `.md` contó como archivo Svelte, también analizó mi markdown. Y lo hizo **antes de que se ejecutara mdsvex**, así que leyó el texto en bruto, encontró `<enhanced:img>` sin etiqueta de cierre y se rindió.

## Cómo ordena Vite los plugins

Creía que el orden del array `plugins` decidía quién se ejecuta primero. Lo decide, pero solo después de otra cosa. Vite ordena los hooks `transform` en tres grupos:

1. Todos los hooks con `order: 'pre'`.
2. Todos los hooks normales.
3. Todos los hooks con `order: 'post'`.

El orden en el array (y el `enforce` de un plugin) solo importa dentro de cada grupo. El hook de enhanced-img es `'pre'`. El hook que ejecuta los preprocesadores no lo es. Así que enhanced-img siempre iba primero, lo pusiera donde lo pusiera en el array.

## Un plugin diminuto propio

Si mdsvex tiene que ejecutarse antes que un hook `'pre'`, también tiene que ser un hook `'pre'`, y el primero de ese grupo. Así que en vez de `preprocess`, llamo a mdsvex desde mi propio plugin de Vite:

```ts
function markdown(): Plugin {
	return {
		name: 'markdown',
		enforce: 'pre',
		transform: {
			order: 'pre',
			filter: { id: /\.md$/ },
			async handler(code, id) {
				const out = await compile(code, { filename: id, extensions: ['.md'] });
				if (!out) return;
				return {
					code: out.code.replace('<script context="module">', '<script module>'),
					map: { mappings: '' }
				};
			}
		}
	};
}
```

Va el primero del array, y `extensions: ['.svelte', '.md']` se queda para que Svelte siga compilando el resultado. Ahora enhanced-img ve el HTML que generó mdsvex, donde mi etiqueta es el texto inofensivo `&lt;enhanced:img&gt;`.

Tres cosas pequeñas ahí dentro:

- **El filtro.** `content.ts` sigue importando los mismos archivos con `?raw`, para leer su frontmatter como texto. Vite los convierte en un módulo JS (`export default "---\ntitle: …"`), y todos los hooks de transformación se ejecutan también sobre ese módulo. Su id termina en `?raw`, no en `.md`, así que el `$` de `/\.md$/` mantiene mi plugin lejos de ellos. Sin él, mdsvex envolvería ese JS en un `<p>` y el build fallaría.
- **`<script module>`.** mdsvex 0.12 todavía escribe la sintaxis de Svelte 4 `context="module"`. Svelte 5 la acepta con un aviso de obsolescencia, uno por archivo. Un `replace` y los avisos desaparecen.
- **El sourcemap vacío.** Un plugin que cambia código debería decir cómo se corresponden las líneas nuevas con las antiguas. De markdown a HTML no hay una correspondencia útil, y `{ mappings: '' }` lo dice a propósito. Sin él, el build avisaba una vez por archivo.

Más tarde el plugin creció un poco. Le pasa dos opciones más a `compile`: una función `highlight` para los bloques de código (mira [Resaltado de sintaxis con Shiki](./2026-11-02-shiki-with-design-tokens)) y un `layout`, un componente Svelte que envuelve cada archivo. El layout trajo otra pieza de sintaxis de Svelte 4, `{...$$props}`, que el modo runes no permite, así que un segundo `replace` la quita. Mi layout cambia cada enlace por un componente que conoce la ruta base: [Enlaces de markdown que conocen la ruta base](./2026-11-02-markdown-links-with-an-mdsvex-layout).

## Una página por archivo

La página vive en `src/routes/devlog/[slug]/` y se reparte entre dos archivos load.

`+page.server.ts` solo se ejecuta al construir el sitio. Lista las páginas que prerenderizar y busca el frontmatter de la entrada en la misma lista que usa la portada:

```ts
export const entries: EntryGenerator = () => allLog.map(({ slug }) => ({ slug }));

export const load: PageServerLoad = ({ params }) => {
	const entry = allLog.find(({ slug }) => slug === params.slug);
	if (!entry) error(404, 'No Devlog entry with that name');
	return { entry };
};
```

El prerenderizador solo encuentra las páginas que algo enlaza. Todavía nada enlazaba una entrada, así que sin `entries()` el build no generaba ninguna.

`+page.ts` añade el cuerpo. Tiene que ser un load universal porque los datos del servidor se guardan como JSON junto a la página, y un componente es una función, que JSON no puede contener:

```ts
const bodies = import.meta.glob<Component>('/content/bitacora/*/*.md', { import: 'default' });

export const load: PageLoad = async ({ data, params }) => ({
	...data,
	Body: await bodies[`/content/bitacora/${params.slug}/${params.slug}.md`]()
});
```

El glob no es eager: cada valor es una función que importa un archivo. Cada entrada recibe su propio chunk de JS pequeño, y el navegador solo descarga el que muestra.

**Actualización:** ahora una entrada puede estar en dos archivos, en inglés y en español, así que el load de servidor elige el archivo del idioma de la página y el cuerpo sale de él: `bodies[data.entry.path]()`.

La página muestra `<Body />` bajo una cabecera con la fecha, el título y las etiquetas.

## Un tipo que se rompió

Añadir `[slug]` rompió `pnpm check` en cuatro componentes. Todos llamaban a `resolve(link.route)` con una ruta tipada como `RouteId`, y `RouteId` incluye ahora `'/devlog/[slug]'`, que `resolve()` no puede construir sin un slug. Esos enlaces nunca apuntan a una ruta con parámetros, así que lo dije en el tipo, con un template literal type:

```ts
export type RouteWithoutParams = Exclude<RouteId, `${string}[${string}`>;
```

Se deja fuera cualquier id de ruta que contenga un `[`.

## Enlaces

- [Documentación de mdsvex](https://mdsvex.com/docs)
- [Vite: orden de los plugins](https://vite.dev/guide/api-plugin#plugin-ordering)
- [Vite: glob import](https://vite.dev/guide/features#glob-import)
- [SvelteKit: load universal frente a load de servidor](https://svelte.dev/docs/kit/load#Universal-vs-server)
- [SvelteKit: entries](https://svelte.dev/docs/kit/page-options#entries)
