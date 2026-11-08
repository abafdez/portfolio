---
title: 'Una imagen de portada, cuatro trabajos: tarjetas, artículos y vistas previas de enlaces'
description: Cómo un cover.png junto a un artículo se convierte en la miniatura de una tarjeta, la imagen principal del artículo y la vista previa de su enlace, con los tamaños adecuados, el texto alternativo adecuado y una sola tarjeta que se puede pulsar.
reviewed: false
---

En cuanto mis artículos pudieron tener imágenes, la lista de artículos se veía vacía: cada tarjeta era una caja de texto. Así que ahora cada artículo puede tener una **imagen de portada**, y ese único archivo hace cuatro trabajos:

- una **miniatura** en la tarjeta del artículo;
- un sustituto cuando todavía no hay portada;
- la **imagen principal** arriba del artículo;
- la **og:image**, la imagen que muestran LinkedIn o Slack cuando alguien comparte el enlace.

<!-- TODO: una captura de /blog con portadas y sustitutos -->

## La convención

Una portada es un archivo llamado `cover.png` (o `.jpg`, `.webp`) en la carpeta del artículo, junto al markdown. Su texto alternativo va en el frontmatter:

```yaml
---
title: Pages that jump
cover: The Performance panel in DevTools, with the layout shifts track highlighted
---
```

(**Actualización:** la versión en español de un artículo, `<slug>.es.md` en la misma carpeta, comparte la imagen y tiene su propio `cover:` en español.)

Los dos van juntos, y el build lo comprueba. Una portada que nadie ha descrito falla, y también un texto alternativo sin imagen:

```ts
export function checkCover(path: string, alt: unknown, files: string[] = coverFiles) {
	const folder = path.slice(0, path.lastIndexOf('/') + 1);
	const file = files.find((file) => file.startsWith(folder));
	if (file && (typeof alt !== 'string' || !alt.trim())) {
		throw new Error(`${file}: a cover needs alt text in the frontmatter: cover: What it shows`);
	}
	if (!file && alt !== undefined) {
		throw new Error(`${path}: has cover: but no cover.png, .jpg or .webp next to it`);
	}
}
```

## Un glob, los tamaños adecuados

Las portadas se encuentran con el `import.meta.glob` de Vite y las procesa `@sveltejs/enhanced-img`. Un solo glob cubre todo lo que hay en `content/`, así que el mismo código servirá para las entradas del Devlog y las listas Awesome cuando tengan portada. Un patrón con `!` deja los borradores fuera de un build:

```ts
const pictures = import.meta.glob<Picture>(
	['/content/**/cover.{png,jpg,jpeg,webp}', '!/content/blog/drafts/**'],
	{ eager: true, import: 'default', query: { enhanced: true, w: '1600;800;480' } }
);
```

Luego cada portada se encuentra por su **carpeta**: cada artículo sabe dónde vive (`/content/blog/published/<slug>`), y `coverOf(post.folder)` devuelve su portada, si la tiene.

Cada una se convierte en AVIF, WebP y el formato original, cada uno a tres anchos. En la página es un `<picture>` con un `srcset` como `cover.avif 1600w, cover.avif 800w, cover.avif 480w`. Con `sizes`, el navegador elige el archivo más pequeño que siga viéndose nítido:

```svelte
<!-- At the top of the post: the reading column -->
<enhanced:img
	src={cover.picture}
	alt={post.cover}
	sizes="(min-width: 800px) 740px, 100vw"
	fetchpriority="high"
/>
```

La portada de arriba de un artículo suele ser lo más grande que hay en pantalla al cargar (su **LCP**, Largest Contentful Paint), así que recibe `fetchpriority="high"` y nunca es diferida. Las miniaturas de las tarjetas sí son diferidas: `/blog` lista todos los artículos, y la mayoría de las tarjetas están fuera de la pantalla.

## Dos tipos de texto alternativo

La misma imagen recibe un texto alternativo distinto en sitios distintos:

- **En una tarjeta, `alt=""`.** El título está justo al lado. Un lector de pantalla leería la descripción de la imagen y luego el título, las dos sobre el mismo artículo. Un alt vacío dice "decorativa, sáltatela".
- **Arriba del artículo, la descripción de verdad.** Ahí es contenido: muestra algo de lo que habla el texto.

<!-- TODO: qué dijo mi lector de pantalla en una tarjeta antes y después -->

## La tarjeta

Probé tres maquetaciones: una miniatura junto al texto, un banner arriba y la imagen dentro de un marco de ventana de terminal. Me quedé con la miniatura al lado: la lista sigue siendo compacta.

La misma tarjeta aparece en la columna ancha de `/blog` y en una rejilla más estrecha de mi portada. Una media query preguntaría cuánto mide la **ventana**, lo que no dice nada de la tarjeta. Una **container query** le pregunta a la tarjeta:

```css
article {
	container-type: inline-size;
}

@container (min-width: 34rem) {
	.layout.with-thumbnail {
		grid-template-columns: 12rem 1fr;
		align-items: center;
	}
}
```

Si es más estrecha, la imagen va encima del texto.

### ¿16:9 o cuadrada?

Mi primera versión ponía la portada en 16:9 junto al texto. Con 240px de ancho medía 135px de alto, junto a unos 220px de texto: un hueco bajo la imagen en cada tarjeta. Sopesé cinco opciones:

| Opción                                        | Por qué no (o por qué)                                                           |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| Mantener 16:9 y centrarla en vertical         | El hueco solo se parte en dos, y cambia con cada descripción                     |
| Estirar la 16:9 a la altura de la tarjeta     | Cada tarjeta recorta de una forma distinta, según su texto                       |
| **Cuadrada, recortada al construir el sitio** | Más o menos tan alta como el texto; el recorte conserva el centro                |
| Cuadrada, más un `thumbnail.png` opcional     | Elegir el recorte a mano cuando el centro no sirve; se puede añadir más adelante |
| 4:3                                           | Sigue habiendo un pequeño hueco, y sigue siendo un recorte                       |

Me quedé con la cuadrada. La parte importante es **dónde** se recorta. Con CSS (`object-fit: cover` sobre el archivo 16:9), el navegador necesitaría un archivo mucho más ancho para llenar un cuadrado con nitidez, así que o se ve borrosa o pesa mucho. En su lugar, imagetools (que usa enhanced-img) la recorta al construir el sitio:

```ts
const squares = import.meta.glob<Picture>(
	['/content/**/cover.{png,jpg,jpeg,webp}', '!/content/blog/drafts/**'],
	{ eager: true, import: 'default', query: { enhanced: true, w: '480;240', aspect: '1:1' } }
);
```

Eso genera archivos de 480×480 y 240×240 (29 KB y 12 KB en PNG para mi imagen de prueba, menos en AVIF), cortados del centro de la portada. Así que las portadas necesitan tener en el centro lo que importa.

En una tarjeta estrecha, el cuadrado sería enorme, así que ahí va encima la versión 16:9. Las dos están en el HTML, y la container query muestra una:

```svelte
<div class="wide"><enhanced:img src={cover.picture} alt="" loading="lazy" … /></div>
<div class="square"><enhanced:img src={cover.square} alt="" sizes="192px" loading="lazy" /></div>
```

Las dos son `loading="lazy"`, y una imagen diferida con `display: none` nunca entra en pantalla, así que el navegador nunca la descarga. Lo comprobé: en `/blog` solo se descargó el cuadrado.

<!-- TODO: qué opción elegiría si un CMS me dejara elegir el punto focal -->

### Todavía sin portada

Ninguno de mis artículos tiene portada todavía. Las tarjetas solo de texto junto a tarjetas con imagen se verían desiguales, así que un artículo sin portada recibe un mosaico dibujado con CSS: la rejilla de planos de mi sitio con la primera etiqueta del artículo.

```css
.tile {
	background-image:
		linear-gradient(var(--grid-line-major) 1px, transparent 1px),
		linear-gradient(90deg, var(--grid-line-major) 1px, transparent 1px);
	background-size: var(--grid-size) var(--grid-size);
	font-family: var(--font-label);
	color: var(--brand);
}
```

Es `aria-hidden`: la etiqueta ya está en la lista de etiquetas de la tarjeta. Junto al texto es cuadrado como las portadas; encima del texto es una franja de 4:1, porque no dice más que su etiqueta.

### Toda la tarjeta es el enlace

Antes, solo el título era un enlace. Ahora lo es toda la tarjeta, todavía con un solo `<a>`. El enlace del título recibe un pseudoelemento que cubre la tarjeta:

```css
article {
	position: relative;
}

h3 a::after {
	content: '';
	position: absolute;
	inset: 0;
}
```

Envolver toda la tarjeta en un `<a>` también funcionaría, pero entonces un lector de pantalla leería la fecha, la descripción y cada etiqueta como el nombre del enlace. Con el enlace estirado, el enlace sigue siendo solo el título.

Las etiquetas también son enlaces, así que se elevan por encima del estirado:

```css
[aria-label='Tags'] a {
	position: relative;
	z-index: 1;
}
```

Y como el enlace ahora cubre la tarjeta, el anillo de foco rodea la tarjeta:

```css
article:has(h3 a:focus-visible) {
	outline: var(--border-size-2) solid var(--brand);
}
```

<!-- TODO: probarlo: recorrer /blog con el tabulador, y luego pulsar la descripción de una tarjeta y una etiqueta -->

## Figuras en un artículo

Las imágenes dentro de un artículo pueden tener un pie, a partir del título del markdown:

```md
![El seguimiento de los saltos de maquetación](./shifts.png 'Cada bloque morado es un salto de maquetación')
```

Mi paso del markdown lo convierte en un `<figure>` con un `<figcaption>`. Sustituye al párrafo entero, ya que un `<figure>` no puede ir dentro de un `<p>`.

## Vistas previas de los enlaces

Un artículo con portada también la tiene en su `<head>`:

```html
<meta
	property="og:image"
	content="https://abafdez.github.io/portfolio/_app/immutable/assets/cover.CMaF8XsI.jpg"
/>
<meta property="og:image:alt" content="…" />
<meta name="twitter:card" content="summary_large_image" />
```

Para esta uso otro glob con `{ w: '1200', format: 'jpg' }`: 1200px es el tamaño que piden LinkedIn y Slack, y no todos los servicios que leen `og:image` entienden AVIF. `og:image` tiene que ser una URL completa, así que la ruta del import pasa por `new URL(src, page.url.href)`.

## Enlaces

- [SvelteKit: imágenes](https://svelte.dev/docs/kit/images)
- [MDN: imágenes adaptables](https://developer.mozilla.org/es/docs/Web/HTML/Guides/Responsive_images)
- [MDN: container queries](https://developer.mozilla.org/es/docs/Web/CSS/CSS_containment/Container_queries)
- [Inclusive Components: tarjetas](https://inclusive-components.design/cards/)
- [El protocolo Open Graph](https://ogp.me/)
- [Imágenes junto al artículo](./2026-11-06-images-next-to-the-post)
- [SEO en un sitio de proyecto de GitHub Pages](./2026-11-04-seo-on-a-github-pages-project-site)
