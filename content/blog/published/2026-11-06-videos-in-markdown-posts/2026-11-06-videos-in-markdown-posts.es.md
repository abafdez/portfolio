---
title: 'Vídeos en artículos de markdown, y por qué no un GIF'
description: 'Grabaciones de pantalla cortas junto a un artículo: por qué no un GIF, cómo encuentra el build los archivos y los atributos que evitan que un vídeo salte o se reproduzca solo.'
cover: Un reproductor de vídeo en una pantalla, con código markdown y archivos MP4 y WebM.
reviewed: false
---

Algunas cosas son más fáciles de enseñar que de describir: una página que salta mientras carga, un botón que se anima. Quería grabaciones de pantalla cortas en mis artículos, junto al markdown, como mis imágenes.

## Por qué no un GIF

Mi primera idea fue un GIF. Dos motivos por los que no lo es:

- **Mi build lo congelaría.** Las imágenes de mis artículos pasan por [enhanced-img](https://svelte.dev/docs/kit/images), que genera copias más ligeras en AVIF y WebP. Por debajo, abre cada archivo con `sharp` sin pedirle la animación, así que un GIF sale como su primer fotograma.
- **De todas formas es el formato equivocado.** Un GIF es una secuencia de imágenes completas con como mucho 256 colores. El mismo fragmento como vídeo suele ser de cinco a diez veces más pequeño, y a todo color. Y un GIF no se puede pausar, mientras que las [WCAG](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) piden que todo lo que se mueva más de cinco segundos se pueda pausar.

Así que: un vídeo.

## Escribirlo en markdown

Markdown tiene una sintaxis para las imágenes, `![alt](./x.png)`, pero ninguna para el vídeo. mdsvex me deja escribir HTML en un artículo, así que un vídeo es HTML:

```html
<figure>
	<video width="1280" height="720" controls muted playsinline preload="metadata">
		<source src="./awesome-list-shift.webm" type="video/webm" />
		<source src="./awesome-list-shift.mp4" type="video/mp4" />
	</video>
	<figcaption>The filters appear after the list has loaded, and push it down.</figcaption>
</figure>
```

Ese `./` tiene el mismo problema que tenían mis imágenes: el navegador lo lee a partir de la URL de la página, no de la carpeta del artículo, y pide un archivo que no está ahí. Mi build ya lo arreglaba para las imágenes convirtiendo cada una en un import. Ahora hace lo mismo con `src` y `poster` en `<video>`, `<source>` y `<track>`:

```ts
const mediaTag = /<(video|source|track)\b[^>]*>/g;
const localFile = /\b(src|poster)="(\.\/[^"]+)"/g;

// …inside enhanceMedia(), after the images:
.replace(mediaTag, (tag: string, element: string) => {
	if (element === 'video' && !(/\swidth="\d+"/.test(tag) && /\sheight="\d+"/.test(tag))) {
		throw new Error(`${id}: a <video> needs width and height …`);
	}
	return tag.replace(localFile, (_, attribute: string, src: string) => {
		const name = `__file${imports.length}`;
		imports.push(`import ${name} from '${src}';`);
		return `${attribute}={${name}}`;
	});
});
```

Basta con un `import clip from './clip.mp4'` sin más: [Vite](https://vite.dev/guide/assets) conoce `.mp4`, `.webm` y `.vtt` como recursos. Copia el archivo en el build con un hash en el nombre y devuelve esa URL. A diferencia de las imágenes, no se vuelve a codificar nada: el archivo se usa tal cual, así que lo comprimo antes de subirlo.

<!-- TODO: qué escribió el build para mi primer vídeo (el nombre del archivo con hash) -->

## Los atributos

Cada uno está por un motivo:

- **`width` y `height`**: el tamaño al que exporté. Sin ellos, el vídeo no tiene tamaño hasta que llega el archivo, y el texto que hay debajo salta hacia abajo: un salto de maquetación, en un artículo sobre saltos de maquetación. Con ellos, el navegador reserva el espacio justo desde el principio, y el CSS (`max-inline-size: 100%; block-size: auto`) lo reduce en el móvil. Mi build falla si un `<video>` no tiene los dos.
- **`controls`**: quien lee puede reproducir, pausar y avanzar.
- **Sin `autoplay`**: nada se mueve hasta que quien lee lo pide, lo que además cubre a quien prefiere reducir el movimiento.
- **`muted`**: mis grabaciones no tienen sonido. Svelte avisa de un `<video>` sin un `<track>` de subtítulos, salvo que esté silenciado.
- **`playsinline`**: en un iPhone, se reproduce dentro de la página en vez de pasar a pantalla completa.
- **`preload="metadata"`**: el navegador solo descarga el principio del archivo (su tamaño y su duración) hasta que se reproduce, no el vídeo entero al cargar la página.
- **Un `<figcaption>`**: un vídeo no tiene texto alternativo, así que el texto que lo rodea tiene que decir qué muestra.

## MP4 o WebM

**MP4** con H.264 se reproduce en todos los navegadores. **WebM** con VP9 suele ser más pequeño con la misma calidad. Con los dos como `<source>`, el navegador reproduce el primero que puede, así que WebM va primero y MP4 es la alternativa. Si solo hago uno, es MP4.

Grabo con la herramienta Recortes de Windows y luego hago los dos con [ffmpeg](https://ffmpeg.org/):

```sh
ffmpeg -i raw.mp4 -vf "scale=1280:-2" -c:v libx264 -crf 28 -preset slow -an -movflags +faststart clip.mp4
ffmpeg -i raw.mp4 -vf "scale=1280:-2" -c:v libvpx-vp9 -crf 40 -b:v 0 -row-mt 1 -an clip.webm
```

- `scale=1280:-2`: 1280 px de ancho, con la altura que mantiene las proporciones (un número par, que necesita H.264).
- `-crf`: la calidad; más alto es más pequeño y peor.
- `-an`: sin pista de audio.
- `+faststart`: el índice del MP4 va al principio del archivo, para que pueda empezar a reproducirse antes de haberse descargado entero.

<!-- TODO: los tamaños de mi primer fragmento: en bruto, MP4 y WebM -->

## Probarlo sin una grabación

Para probar el paso del build antes de tener una grabación de verdad, hice una con Playwright, que puede grabar un navegador en WebM:

```js
const context = await browser.newContext({
	recordVideo: { dir: 'out', size: { width: 640, height: 360 } }
});
```

Una página con un contador, dos segundos, y ya tenía un archivo de vídeo de verdad que poner en un artículo de usar y tirar. Construido y reproducido en la previsualización a 320 px y en escritorio: los dos conservaron su caja de 16:9, se reprodujeron y nada se desplazó hacia los lados.

## Más tarde: un bloque de vídeo

Todo este HTML es ahora un solo bloque en mis artículos: un bloque de código cuyo lenguaje es `video`, con el archivo, el tamaño y un pie como YAML. El build escribe el mismo `<video>` y comprueba cada campo. Eso tiene [su propio artículo](./2026-11-07-components-in-code-blocks).

## Enlaces

- [MDN: el elemento video](https://developer.mozilla.org/es/docs/Web/HTML/Element/video)
- [web.dev: sustituir los GIF animados por vídeo](https://web.dev/articles/replace-gifs-with-videos)
- [Vite: recursos estáticos](https://vite.dev/guide/assets)
- [WCAG: pausar, detener, ocultar](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
- [Imágenes junto al artículo](./2026-11-06-images-next-to-the-post)
- [Páginas que saltan](./2026-11-06-pages-that-jump)
