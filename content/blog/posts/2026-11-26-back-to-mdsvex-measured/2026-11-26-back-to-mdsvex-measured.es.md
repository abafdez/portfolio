---
title: De vuelta a mdsvex, y esta vez midiendo antes
description: Dos semanas después de dejar mdsvex por svelte-markdown salió mdsvex 1.0 y volví. Solo cambié cuando todas las páginas del blog y del Devlog, en los dos idiomas, coincidían bloque a bloque con la versión anterior. Esto es lo que cambió, y las dos cosas que un artículo compilado me obligó a repensar.
reviewed: false
---

El 2026-11-11 [cambié mdsvex por svelte-markdown](/blog/2026-11-11-markdown-drawn-by-my-own-components): mdsvex 0.12 chocaba con enhanced-img, enviaba más JavaScript por artículo y yo quería que mis propios componentes dibujaran el markdown. Una semana después salió mdsvex 1.0, reescrito con su propio analizador, su propio resaltador y un sistema de plugins. El motivo para volver a mirarlo no fue ninguno de los problemas de antes. Fue que quiero **componentes y demos en vivo en mis artículos**, y svelte-markdown no me lo puede dar: dibuja markdown, no lo compila.

Cambiar dos veces en un mes cómo se construyen los artículos solo tiene sentido si no se pierde nada por el camino. Así que la regla de esta prueba era sencilla: no cambiar hasta que la nueva versión coincidiera con la anterior.

## Medir que no se pierde nada

Construí la rama `main` en un worktree de git aparte, para tener siempre las páginas antiguas con las que comparar. Luego un script leyó todos los artículos del blog y las entradas del Devlog de las dos versiones, en inglés y en español, y comparó el cuerpo bloque a bloque: la etiqueta, el texto sin espacios, los ids de los títulos, el destino y el `rel` de cada enlace, el texto alternativo de cada imagen y qué etiquetas en línea aparecían.

El primer intento coincidía en 69 de 72 artículos en inglés. El último coincidió en **158 de 158 páginas en inglés y 158 de 158 en español**. Todo lo que hubo entre medias fueron diferencias que encontró el script y que arreglé, y algunas no las habría visto a simple vista.

## Un markdown un poco distinto

mdsvex 1.0 lee su propio dialecto, [Penguin-Flavoured Markdown](https://github.com/pngwn/MDsveX/blob/main/PFM.md): CommonMark sin las partes ambiguas. Algunas reglas difieren de lo que hacen GitHub y Obsidian:

- `_texto_` es cursiva y `*texto*` es negrita. `**texto**` es negrita dentro de negrita: se ve igual, y es a propósito. Mis archivos ya usan `_` y `**`, porque Prettier cambia `*texto*` por `_texto_` al formatearlos, así que se leen igual en todas partes.
- Las URL sueltas se quedan como texto; un enlace se escribe `<https://…>`.
- Una llave es una expresión de Svelte: `{1 + 1}` en una frase imprime `2`. Mis artículos son texto, así que una llave fuera de las comillas invertidas ahora hace fallar la construcción (más abajo explico por qué).

Y un fallo: una marca que nunca se cierra dentro del texto de un enlace o de una imagen anula el enlace entero. `[~/dir](https://example.com)` salía como el texto tal cual, porque `~` empieza un subíndice. En una frase, una `~` suelta no da problemas. El texto alternativo de una captura lo tenía; escribir `\~`, un escape estándar que GitHub y Obsidian muestran como `~`, lo arregló.

## Mis reglas como plugins de análisis

Con svelte-markdown, mi propia pasada sobre los tokens de marked convertía `> [!tip]` en un aviso, una imagen con pie suelta en una figura, y paraba la construcción si había HTML en el texto. mdsvex tiene [plugins de análisis](https://mdsvex.pngwn.at/docs/plugins/writing/parse-plugins) para eso: funciones según el tipo de nodo, que pueden devolver otra función que se ejecuta cuando el nodo se ha cerrado y ya se sabe todo lo que tiene dentro.

```ts
// An image is a file next to the post, with alt text: anything else fails the build.
function checkImage(node: NodeView, ctx: Context) {
	return () => {
		const src = String(node.attrs.src ?? '');
		if (!src.startsWith('./'))
			throw new Error(`${ctx.filename}: ${src} should be a file next to the post (./…)`);
		if (!node.text_content.trim())
			throw new Error(`${ctx.filename}: ${src} needs alt text: ![What it shows](${src})`);
	};
}
```

El aviso necesitó tres intentos. Un plugin no puede sustituir el objeto de atributos de un nodo, solo cambiarlo clave a clave. Un elemento nuevo que me inventé no recibía props de mdsvex. Lo que funcionó: dejarlo como cita, añadir `kind`, `title` y el archivo a sus atributos, y que mi componente de cita decida si dibuja un aviso o una cita normal.

## Un artículo compilado cambia dos cosas

Antes, el servidor convertía cada artículo en HTML y la página lo insertaba. Ahora cada artículo es un componente de Svelte que carga la página y que también se ejecuta en el navegador. Dos cosas que daba por hechas dejaron de funcionar.

**Los enlaces no pueden saber el idioma cuando se compila el artículo.** En el sitio en español, `[mi creador de CV](/projects/cv)` tiene que llevar a `/es/projects/cv`. svelte-markdown conocía el idioma de la página mientras dibujaba. Pero un artículo compilado se compila una vez, y un artículo sin traducir muestra su archivo en inglés también en la página en español. Así que el componente de enlace añade la ruta base y el idioma cuando se muestra la página, leyendo el idioma de la página de un contexto de Svelte. Un contexto y no el `getLocale()` habitual del sitio, porque la vista previa del CMS dibuja artículos sin SvelteKit.

**Un plugin no puede añadir imports.** Mis bloques ` ```video ` y ` ```yt ` nombran archivos que están junto al artículo, y en una construcción un archivo tiene que ser un `import` para tener su URL con hash. mdsvex importa por sí mismo las imágenes del markdown, pero un plugin no tiene forma de añadir un import propio. Así que el plugin de bloques escribe los archivos que ha visto en los datos de plugin del artículo, que mdsvex exporta desde el módulo compilado, y la función de carga de la página lee esa lista y carga solo esos archivos antes de mostrarla. Los componentes los reciben por otro contexto.

## El choque de antes, más pequeño

mdsvex le dice a Vite que los archivos `.md` son archivos de Svelte. enhanced-img tiene un paso que se ejecuta antes que cualquier otro plugin y analiza todo archivo de Svelte que contenga `<enhanced:img`. Cuatro de mis artículos mencionan esa etiqueta en ejemplos de código, así que enhanced-img intentaba analizar su markdown sin compilar y fallaba. Un pequeño envoltorio hace que ese paso se salte los `.md`; mdsvex ya se ocupa de las imágenes del markdown.

## Qué gané, y qué viene

Hoy, más o menos lo mismo: páginas idénticas, una primera visita unos kilobytes más pesada (volveré sobre eso), resaltado síncrono con los colores en CSS, plugins como el de enlaces externos en lugar de código mío, y unas 300 líneas menos al borrar lo antiguo. Lo que quería es el siguiente paso: componentes en los artículos, escritos como [directivas](https://mdsvex.pngwn.at/docs/guides/directives) (`:name[texto]` en línea, `::name` en su propia línea, `:::name … :::` alrededor de un bloque). GitHub y Obsidian las mostrarán como texto, y puedo vivir con eso.

## Enlaces

- [La documentación de mdsvex 1.0](https://mdsvex.pngwn.at/docs) y [su markdown](https://mdsvex.pngwn.at/docs/learn/markdown)
- [Penguin-Flavoured Markdown](https://github.com/pngwn/MDsveX/blob/main/PFM.md), la especificación
- [El artículo en el que dejé mdsvex](/blog/2026-11-11-markdown-drawn-by-my-own-components)
