---
title: 'El tiempo de lectura, contado una vez al construir el sitio'
description: Dónde calcular el tiempo de lectura de un artículo en SvelteKit, y por qué la respuesta es "donde ya está el texto".
cover: Un reloj y un documento.
reviewed: false
---

Cada artículo y cada entrada del devlog de mi sitio dicen ya cuánto se tarda en leerlos: `· 6 min de lectura`, junto a la fecha. El código es una función pequeña. Lo interesante fue dónde ponerla.

## La función

```ts
function readingTime(text: string): number {
	const words = text.replace(frontmatter, '').match(/\S+/g)?.length ?? 0;
	return Math.max(1, Math.ceil(words / 200));
}
```

Quita el frontmatter, cuenta como palabra todo lo que hay entre espacios y divide entre 200 palabras por minuto. Los estudios sitúan la lectura en silencio de textos de no ficción en unas 238 palabras por minuto. Los míos son artículos técnicos llenos de código, así que me quedé un poco por debajo.

<!-- TODO: ¿200 parece razonable? Cronometrarme leyendo uno de mis artículos -->

## Quién tiene el texto

Mi sitio lee cada archivo markdown de dos maneras.

`content.ts` lee todos los archivos como texto plano, con un glob `?raw`, para sacar su frontmatter. Solo se ejecuta en archivos `+page.server.ts`, así que solo mientras se construye el sitio:

```ts
const posts = import.meta.glob<string>('/content/blog/published/*/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});
```

La página del artículo importa un archivo como componente compilado, que mdsvex y Svelte han convertido en JavaScript. Ya no le quedan palabras que contar, solo código que construye HTML. El layout que lo rodea tampoco recibe el contenido como texto, sino como un snippet que renderizar.

Así que `content.ts` es el único sitio que tiene el texto de todos los archivos, todos a la vez.

## Quién necesita el número

Lo muestra la página del artículo, pero también cada tarjeta de `/blog`, `/bitacora` y la portada. Si lo calculara la página del artículo, la lista tendría que cargar el cuerpo de cada artículo solo para contar palabras, y aun así tendría componentes, no texto.

Calculado en `content.ts`, `minutes` forma parte de cada entrada, junto al título y la fecha:

```ts
const entry = {
	...(parse(text.match(frontmatter)?.[1] ?? '') as T),
	slug: path.split('/').at(-1)!.replace(/\.md$/, ''),
	minutes: readingTime(text)
};
```

Todas las páginas lo reciben como un dato. Las páginas se prerenderizan, así que acaba en el HTML y en unos pocos bytes de `__data.json`. No llega nada de markdown al navegador para obtenerlo.

<!-- TODO: qué encontré en build/ al buscar "minutes" -->

## La regla

Calcula un valor donde ya están sus datos de partida, y pásalo como dato. El slug y la marca de borrador salen de la ruta, y el tiempo de lectura del texto, así que todos viven en `content.ts`. Las etiquetas también están ahí: forman parte del frontmatter.

Además, hay un efecto secundario. Contar sobre el markdown en bruto significa que las etiquetas HTML y los `<span>` del código resaltado nunca cuentan como palabras.
