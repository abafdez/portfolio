---
title: 'Traducciones junto al artículo'
description: La versión en español de cada artículo es un segundo archivo en su carpeta, con solo las palabras en su frontmatter. Cómo lo lee el sitio y qué muestra una página en español mientras no existe.
reviewed: false
---

La interfaz de mi sitio ya está en dos idiomas. El contenido es el trabajo grande: artículos, un devlog, una lista de habilidades. Así es como un artículo consigue su versión en español, y lo que hace el sitio mientras no la tiene.

## Un segundo archivo, en la misma carpeta

Cada artículo ya vive en su propia carpeta, con sus imágenes. La versión en español va justo ahí:

```text
content/blog/published/an-accordion-without-javascript/
  an-accordion-without-javascript.md
  an-accordion-without-javascript.es.md
  cover.avif
```

Los dos archivos comparten las imágenes, y publicar sigue siendo mover una carpeta. Obsidian y GitHub muestran los dos como markdown normal.

## Solo se traducen las palabras

El frontmatter del archivo en español tiene el título, la descripción, el texto alternativo de la portada y nada más:

```yaml
---
title: 'Un acordeón sin JavaScript'
description: Dales el mismo name a varios elementos details…
cover: Un elemento que se despliega y se pliega como un acordeón.
reviewed: false
---
```

La fecha y las etiquetas salen del archivo en inglés. Si la traducción pudiera tener las suyas, tarde o temprano dirían cosas distintas. En cambio, escribirlas en el archivo en español hace fallar el build.

`reviewed` está ahí porque al principio las traducciones no son mías: las escribe Claude y yo las leo. Hasta que lo pongo a `true`, el artículo muestra una etiqueta "sin revisar", solo en desarrollo.

<!-- TODO: Alfonso, ¿cuántas tuviste que cambiar y qué cambiaste más? -->

## Se localiza donde se cargan los datos

El sitio lee el frontmatter de cada artículo al construirse. Las listas siguen en inglés, cada artículo sabe qué idiomas tiene, y una página pide cada artículo en su propio idioma:

```ts
export const load: PageServerLoad = ({ params, url }) => {
	const original = allPosts.find(({ slug }) => slug === params.slug);
	const post = inLocale(original, localeOf(url));
	return { post, translated: isTranslated(post) };
};
```

El componente recibe un artículo en un idioma y no necesita saber que hay dos. Las habilidades y la lista Awesome funcionan igual: el texto de su YAML es simple (Docker es Docker) o `{ en, es }`, y el load elige.

## Qué muestra mientras tanto una página en español

Hasta que un artículo está traducido, su página en español muestra el artículo en inglés dentro del sitio en español: los menús en español, el artículo en inglés, marcado "en inglés". Dos detalles lo hacen honesto:

- `lang="en"` en el artículo, para que un lector de pantalla lo lea con voz inglesa en vez de pronunciarlo mal en español.
- Un enlace canónico a la página en inglés, para que los buscadores no indexen el mismo texto dos veces en dos direcciones. Solo cuando hay traducción la página en español lista las dos versiones con `hreflang`.

<!-- TODO: Alfonso, una captura de un artículo sin traducir en el sitio en español. -->

## Una trampa: las claves no son etiquetas

Mi generador de CV guarda mis cambios en cada habilidad por su nombre. Traducir los nombres habría dejado huérfano todo lo guardado. Así que ahora cada habilidad tiene una `key`, su nombre en inglés, para guardar, y un `name` para mostrar. Nada de lo que se guarda debería depender del idioma en que se muestra.
