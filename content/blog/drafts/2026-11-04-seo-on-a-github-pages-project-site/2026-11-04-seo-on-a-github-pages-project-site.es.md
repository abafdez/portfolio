---
title: 'SEO en un sitio de proyecto de GitHub Pages, empezando por un robots.txt que no hacía nada'
description: Mi robots.txt bloqueaba a todos los rastreadores, o eso creía. En un sitio de proyecto nunca se lee. Lo que de verdad controla la indexación ahí, más un componente Seo, URLs absolutas al prerenderizar y un sitemap a partir de mi contenido.
reviewed: false
---

Cuando empecé este sitio, añadí un `robots.txt` que lo bloqueaba todo:

```text
User-agent: *
Disallow: /
```

El plan era mantener el sitio oculto hasta que estuviera listo. No estaba oculto. Nunca lo estuvo.

## Dónde buscan los rastreadores el robots.txt

Un rastreador pide `robots.txt` en la **raíz del host**, y solo ahí. Mi sitio es un sitio _de proyecto_ de GitHub Pages: vive en `abafdez.github.io/portfolio/`. Así que un rastreador pide:

```text
https://abafdez.github.io/robots.txt            → 404
```

Mi archivo estaba en `https://abafdez.github.io/portfolio/robots.txt`, un archivo perfectamente normal que ningún rastreador pide nunca. El de la raíz da un 404, y un `robots.txt` que no existe significa "rastréalo todo".

La raíz de `abafdez.github.io` pertenece a otro repositorio (`abafdez.github.io`, si algún día creo uno). En un sitio de proyecto, el único interruptor que controlo es una etiqueta en cada página:

```html
<meta name="robots" content="noindex" />
```

De todas formas no significan lo mismo. `Disallow` dice "no rastrees esto", pero una URL que enlazan otros sitios puede seguir apareciendo en los resultados, sin descripción. `noindex` dice "no listes esta página", y el rastreador tiene que poder entrar para leerlo.

<!-- TODO: qué decidí, y por qué: que se pueda encontrar, porque un portfolio está para que lo encuentren -->

Decidí que el sitio se pudiera encontrar. El archivo ya no está, y la única página que no está lista (la hoja de revisión de la mascota) dice `noindex`.

## Un componente para la cabecera de cada página

Cada página tenía su propio `<svelte:head>` con un título, y algunas con una descripción. Ahora todas usan un mismo componente:

```svelte
<Seo title={post.title} section="Blog" description={post.description} published={post.date} />
```

`Seo.svelte` escribe:

- el `<title>`: `título · sección · Alfonso Baeza`;
- la descripción, que los resultados de búsqueda suelen mostrar bajo el título;
- la URL canónica: la única dirección verdadera de la página;
- las etiquetas Open Graph (`og:title`, `og:description`, `og:url`, `og:type`), que LinkedIn, Slack o Discord leen para construir la vista previa de un enlace;
- `twitter:card`, porque X lee las etiquetas `og:` pero necesita esta para mostrar una tarjeta.

Una página con fecha de `published` es un `article` con `article:published_time`, y el resto son `website`. `noindex` es una prop, así que `/mascot` es solo `<Seo … noindex />`.

Empecé sin `og:image`, así que las vistas previas eran tarjetas de texto. (Las vistas previas necesitan un PNG o un JPG, no un SVG.) Más tarde, los artículos tuvieron [imágenes de portada](./2026-11-06-cover-images-and-cards), y un artículo con portada la usa ahora como su `og:image`, con `twitter:card` en `summary_large_image`, la tarjeta grande.

<!-- TODO: una captura de la vista previa de un enlace, en una app de mensajería o en una herramienta de vista previa de OG, cuando esté desplegado -->

## URLs absolutas al prerenderizar

Una URL canónica tiene que ser absoluta. El componente la construye a partir de `page.url`:

```ts
const canonical = $derived(page.url.origin + page.url.pathname);
```

Sin la query: `/projects/cv?profile=support` es la misma página que `/projects/cv`.

Pero mi sitio está prerenderizado, así que al construirlo no hay ninguna petición real, y SvelteKit se inventa la URL. Su origen es `http://sveltekit-prerender`. Una línea en la configuración lo arregla:

```ts
paths: {
	base: base,
	origin: 'https://abafdez.github.io'
}
```

(En SvelteKit 3 es `paths.origin`. La documentación y los artículos más antiguos lo ponen bajo `prerender`.) Ahora el HTML generado dice:

```html
<link rel="canonical" href="https://abafdez.github.io/portfolio/projects/cv" />
```

**Actualización:** el sitio ya está en inglés y en español, así que el componente construye la dirección de la página en cada idioma y añade enlaces `hreflang` entre ellas. Un artículo que aún no está traducido tiene una copia en español cuya canónica apunta a la página en inglés, para que los buscadores no vean el mismo texto dos veces. El [artículo sobre el segundo idioma](./2026-11-08-a-second-language-without-a-library) tiene los detalles.

## Una descripción para cada página

Los artículos tienen una `description` en su frontmatter. Las entradas del Devlog no, y no voy a escribir 47. Así que `content.ts` saca una del cuerpo: el primer párrafo o elemento de lista, como texto sin formato, cortado en una palabra por debajo de 160 caracteres (los resultados de búsqueda cortan más o menos ahí).

````ts
export function summary(text: string, max = 160): string {
	const first =
		text
			.replace(frontmatter, '')
			.replace(codeBlock, '') // whole fenced blocks, fence to fence
			.split(/\r?\n/)
			.map((line) => line.trim())
			.find((line) => line && !/^(#|<!--|```)/.test(line)) ?? '';
	// …strip the list marker, links and code marks, then cut at a word
}
````

Mis entradas empiezan con "Qué hicimos", así que el primer punto suele ser un buen resumen de una línea. (Mi primer test unitario de esta función encontró un bug: se saltaba la valla de apertura de un bloque de código pero cogía como resumen el código de debajo. Eso es el [siguiente artículo](./2026-11-04-unit-tests-with-vitest).)

## Un sitemap a partir del contenido

Un sitemap lista las páginas que los buscadores deberían conocer. El mío es un endpoint prerenderizado, `src/routes/sitemap.xml/+server.ts`, construido a partir de las mismas listas de las que salen las páginas:

```ts
const pages: Page[] = [
	...sections.map(({ href }) => ({ path: resolve(href) })),
	...allLog.map(({ slug, date }) => ({
		path: resolve('/devlog/[slug]', { slug }),
		updated: date
	}))
	// …projects, Awesome lists, posts, tags
];
```

Un artículo o una entrada nueva aparece en él sin tocar este archivo. Nada lo enlaza, así que va en `prerender.entries`, como mi sprite SVG.

Normalmente, `robots.txt` dice dónde está el sitemap. En mi caso no, mira arriba. Así que lo envío a mano en Google Search Console.

<!-- TODO: enviar el sitemap en Search Console, y qué informó -->

## Enlaces

- [Google: introducción a robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google: bloquear la indexación con noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [El protocolo Open Graph](https://ogp.me/)
- [El protocolo de sitemaps.org](https://www.sitemaps.org/protocol.html)
- [SvelteKit: configuración, paths](https://svelte.dev/docs/kit/configuration#paths)
