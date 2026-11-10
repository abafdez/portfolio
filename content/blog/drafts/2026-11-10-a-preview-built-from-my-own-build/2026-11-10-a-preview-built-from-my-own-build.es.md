---
title: Una vista previa del CMS hecha con mi propio build
description: Mi CMS mostraba la vista previa de algo que no era mi sitio. Tres intentos después, ejecuta los mismos plugins de markdown que mi build, en el navegador, mientras escribo.
reviewed: false
---

Mis artículos son archivos markdown, y ahora los edito en [Sveltia CMS](https://sveltiacms.app/en/docs). Su panel de vista previa dibuja el markdown mientras escribes, que es lo que debe hacer una vista previa. Pero dibujaba algo que no era mi sitio: sin estilos, mis callouts como citas normales y mis componentes en bloques de código como YAML.

Me costó tres intentos arreglarlo, y cada uno me enseñó algo sobre de dónde sale de verdad el aspecto de mi sitio.

## Lo que tiene que reproducir una vista previa

Un artículo de este sitio pasa por varios pasos hasta convertirse en HTML. El build los ejecuta en `vite.config.ts`:

1. mdsvex convierte el markdown en un árbol de HTML.
2. Bloques de código: si el lenguaje es uno de mis componentes (` ```yt `, ` ```video `), su YAML se convierte en ese componente; cualquier otro lo resalta Shiki, con mi propio tema de colores.
3. Los plugins de rehype cambian el árbol: `> [!tip]` pasa a ser una caja de callout, las tablas anchas reciben una caja con scroll y los encabezados reciben id y enlaces a sí mismos.
4. enhanced-img convierte `![alt](./diagram.png)` en imágenes AVIF y WebP con su tamaño.
5. La página lo envuelve todo con la cabecera, los estilos y la maquetación del sitio.

La vista previa de Sveltia no hace nada de eso, y no puede: esos pasos son míos.

## Intento 1: la página real, tal como se guardó

La vista previa exacta más sencilla es la propia página. El servidor de desarrollo ya muestra cada artículo, así que el panel de vista previa pasó a ser un iframe de `/blog/<slug>`, recargado después de cada guardado.

Era exacta, pero solo mostraba archivos guardados. Escribías, guardabas, mirabas y vuelta a escribir. Eso no es una vista previa, es una segunda pestaña.

## Intento 2: la página real, en vivo

Para mostrar texto sin guardar, la página lo necesita como archivo. Así que, mientras escribía, el CMS mandaba la entrada al servidor de desarrollo, que la escribía en un archivo oculto junto al artículo, `.preview.md`. La página del artículo, abierta con `?preview`, mostraba ese archivo. Sus imágenes seguían funcionando, porque está en la misma carpeta, y un nombre que empieza por un punto no encaja con ninguno de mis globs de contenido, así que nunca se convertía en un artículo propio.

Dos cosas fallaron por el camino:

- **SvelteKit no permite `url.searchParams` en una página prerenderizada, ni siquiera en desarrollo.** Todas mis páginas se prerenderizan, así que estas dos ahora solo se prerenderizan en el build: `export const prerender = !import.meta.env.DEV`.
- **El CMS entero se recargaba cada vez que escribía, y perdía lo editado.** Vite pide recargarse a todas las páginas que tienen su cliente de recarga en vivo cuando cambia un archivo markdown. La página del CMS también lo tenía, por un componente de Svelte mío. Compilar los componentes del CMS sin recarga en caliente lo deja fuera.

Funcionaba, pero cada pausa al escribir recargaba la página entera, con un parpadeo. Y solo funciona mientras el servidor de desarrollo está en marcha. Más adelante quiero usar el CMS desde cualquier sitio, contra el repositorio de GitHub, sin servidor de desarrollo.

## Intento 3: los plugins de mi build, en el navegador

Volviendo a la lista de arriba, la mayoría de esos pasos son funciones pequeñas que escribí yo, en `src/lib`. Un plugin de rehype es una función que recibe un árbol de HTML y lo cambia. Mis componentes en bloques de código tienen un `render()` que devuelve HTML. Shiki funciona en el navegador. Ninguno necesita un servidor.

Así que el CMS importa los mismos archivos que importa el build y los ejecuta sobre el texto mientras escribo:

```ts
export async function renderMarkdown(markdown: string, file: string) {
	const tree = await toTree.run(toTree.parse(markdown)); // markdown → HTML tree
	await highlightAll(tree, file); // my blocks, then Shiki with my theme
	const done = await plugins.run(tree, { filename: file }); // callouts, tables, heading links
	return toHtml.stringify(done);
}
```

`file` es el nombre del archivo del artículo. Mis plugins lo leen para elegir el idioma: un callout en `<slug>.es.md` se titula "Sugerencia", no "Tip". Lo mismo pasa con el texto de los bloques.

El resto es conseguir que se parezca a la página:

- **El CSS del sitio entra en el marco de la vista previa.** El marco es un documento aparte, así que los estilos de la página no llegan. Vite puede importar una hoja de estilos como texto (`?inline`), y Sveltia acepta un texto con CSS para su vista previa (`registerPreviewStyle`). Las fuentes necesitaron un arreglo más: el marco es un documento `blob:`, donde una URL como `/node_modules/…` no tiene contra qué resolverse, así que se convierten en absolutas.
- **La cabecera** (fecha, tiempo de lectura, título, etiquetas, portada) se dibuja con los campos del formulario, y el cuerpo con `renderMarkdown()`, unos 150 ms después de dejar de escribir. Sin recarga, sin parpadeo, y la posición del scroll se mantiene.
- **Las imágenes** se escriben `./diagram.png` en el artículo. `getAsset()` de Sveltia lo convierte en una URL que el marco puede mostrar. Mientras todavía está leyendo el archivo responde con una vacía, así que las rutas se vuelven a buscar cada vez que se redibuja la vista previa.
- **Los errores** aparecen antes. Un bloque de código con un campo mal puesto lanza el mismo error que daría el build, y la vista previa lo muestra antes de guardar.

## Lo que no puede hacer, y lo que se queda

No es el build. mdsvex lee el markdown con un analizador más antiguo que el de la vista previa y convierte las comillas en tipográficas, y las imágenes se muestran tal cual, sin enhanced-img. Para eso, la página en vivo del intento 2 se queda como segunda pestaña, solo en desarrollo.

## Lo que me llevo

La vista previa fue posible porque los pasos del build ya eran funciones pequeñas en sus propios archivos, cada una probada por separado. No hubo que copiar nada: el build y el CMS importan el mismo código, así que un nuevo tipo de callout o un nuevo bloque aparece en los dos a la vez.

## Enlaces

- [Sveltia CMS: plantillas de vista previa propias](https://sveltiacms.app/en/docs/api/preview-templates)
- [Sveltia CMS: estilos propios para la vista previa](https://sveltiacms.app/en/docs/api/preview-styles)
- [unified: cómo ejecuta los plugins un procesador](https://unifiedjs.com/learn/guide/using-unified/)
- [Vite: importar CSS como texto con `?inline`](https://vite.dev/guide/features#disabling-css-injection-into-the-page)
- [Shiki en el navegador](https://shiki.style/guide/install)
