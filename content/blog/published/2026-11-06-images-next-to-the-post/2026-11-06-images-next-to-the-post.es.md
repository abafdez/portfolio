---
title: Imágenes junto al artículo, en markdown normal
description: Dónde guardar las imágenes de un blog, por qué ![alt](./x.png) se rompe en un sitio prerenderizado, y un pequeño paso en un plugin de Vite que lo convierte en imágenes optimizadas y comprobadas.
cover: Carpetas de borradores y contenido publicado, con personas que mueven archivos entre ellas.
reviewed: false
---

Mis artículos eran archivos markdown sueltos, y quería añadir capturas y diagramas. La primera pregunta era dónde ponerlos. La segunda, cómo escribirlos, porque la forma evidente no funcionaba.

## Dónde viven las imágenes

Me planteé seis opciones:

| Opción                                      | Problema principal                                                               |
| ------------------------------------------- | -------------------------------------------------------------------------------- |
| `static/images/…`, servidas tal cual        | Sin optimizar y sin ancho ni alto (la página salta); lejos del artículo          |
| Junto al archivo `.md`, en la misma carpeta | La carpeta se llena; publicar significa mover también las imágenes               |
| **Una carpeta por artículo**                | Mover una vez todos los archivos que ya existen                                  |
| Una carpeta compartida `content/images/`    | Las rutas relativas cambian cuando un borrador sube un nivel; imágenes huérfanas |
| `import` a mano en cada artículo            | Ya no es markdown normal; sin vista previa en el editor                          |
| Un alojamiento externo                      | Los enlaces pueden morir, y el build no puede comprobarlos                       |

Elegí una carpeta por artículo. El archivo conserva su nombre, así que el slug no cambia:

```text
content/blog/
  drafts/
    2026-11-06-images-next-to-the-post/
      2026-11-06-images-next-to-the-post.md
      diagram.png
  published/
```

Todo lo de un artículo está en un sitio. Publicar es un solo movimiento, y borrar un artículo borra sus imágenes. Ya puestos, los borradores y los artículos publicados tienen cada uno su carpeta, así que la ruta deja claro en qué estado está un artículo.

## Los globs

Mi sitio encuentra los artículos con el `import.meta.glob` de Vite. Con una carpeta para cada uno, el patrón baja un nivel:

```ts
const posts = import.meta.glob<string>('/content/blog/published/*/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});
```

El slug sigue saliendo del nombre del archivo. Una pequeña función comprueba que la carpeta coincide con él, así que un renombrado que se salte uno hace fallar el build:

```ts
export function slugOf(path: string): string {
	const [folder, file] = path.split('/').slice(-2);
	const slug = file.replace(/\.md$/, '');
	if (folder !== slug) throw new Error(`${path}: the folder and the file must have the same name`);
	return slug;
}
```

**Actualización:** la versión en español de un artículo está ahora en la misma carpeta, `<slug>.es.md`, y comparte las imágenes. `slugOf()` también acepta ese `.es`, así que los dos archivos tienen el mismo slug.

## Por qué `![alt](./x.png)` se rompe

Quería escribir las imágenes de la forma normal de markdown, para que también se vean en mi editor:

```md
![El seguimiento de los saltos de maquetación en DevTools](./cls.png)
```

mdsvex convierte eso en `<img src="./cls.png" alt="…">`. Pero un navegador lee `./` a partir de la **URL de la página**, `/portfolio/blog/mi-articulo`, no de la carpeta en la que está el archivo markdown. La imagen no está ahí. Por suerte, el rastreador del prerenderizado de SvelteKit comprueba `src` además de `href`, así que el build falló con un 404 en vez de publicar una imagen rota.

Uso `@sveltejs/enhanced-img`, que convierte `<enhanced:img src="./photo.jpg">` en un archivo Svelte en un `<picture>` con copias en AVIF y WebP a dos tamaños, más `width` y `height`. Pero en un archivo markdown no encontraba la imagen. Lo que sí funcionó fue un import:

```svelte
<script>
	import photo from './photo.jpg?enhanced';
</script>

<enhanced:img src={photo} alt="A photo" />
```

Vite resuelve un import desde la propia carpeta del archivo, así que `./` significa lo que yo quería decir. Y un archivo que falta es un error de build que lo nombra.

## Que escriba los imports por mí

No quería un bloque de script en cada artículo, así que lo escribe el paso que compila el markdown. Después de que mdsvex haya generado el HTML, cada `<img>` local se convierte en un import y un `<enhanced:img>`:

```ts
const localImage = /<img\s+src="(\.\/[^"]+)"([^>]*?)\s*\/?>/g;
const captioned = /<p>(<img\s+src="\.\/[^"]+"[^>]*?)\s+title="([^"]*)"\s*\/?><\/p>/g;

export function enhanceImages(code: string, id: string): string {
	const imports: string[] = [];
	const html = code
		.replace(captioned, '<figure>$1><figcaption>$2</figcaption></figure>')
		.replace(localImage, (_, src: string, attributes: string) => {
			if (!/\salt="[^"]+"/.test(attributes)) {
				throw new Error(`${id}: ${src} needs alt text: ![What it shows](${src})`);
			}
			const name = `__image${imports.length}`;
			imports.push(`import ${name} from '${src}?enhanced';`);
			return `<enhanced:img src={${name}}${attributes} loading="lazy" />`;
		});
	return imports.length ? html.replace('<script>', `<script>\n\t${imports.join('\n\t')}`) : code;
}
```

- `localImage` solo coincide con orígenes que empiezan por `./`, así que una imagen de otro sitio se queda como está.
- mdsvex deja fuera `alt` del todo cuando está vacío, así que es fácil detectar una descripción que falta. Lo convertí en un error de build: cada imagen de un artículo debería decir qué muestra.
- Los imports van en el propio `<script>` del componente, que mdsvex siempre escribe.
- Una imagen con título, `![alt](./x.png "Lo que muestra")`, se convierte en un `<figure>` con el título como `<figcaption>`. Sustituye al `<p>` entero, porque un `<figure>` no puede ir dentro de un párrafo.
- `loading="lazy"`: una imagen más abajo en el artículo solo se descarga cuando haces scroll cerca de ella.

### El bug que se le escapó a mi primera prueba

Mi primera versión tenía `<img src=` con un solo espacio. Funcionó con mi imagen de prueba, y falló con la siguiente: su descripción era más larga, y cuando una etiqueta se hace larga, mdsvex pone cada atributo en su propia línea:

```html
<p>
	<img
		src="./screenshot.png"
		alt="A purple test image with the words a screenshot"
		title="A caption under the image"
	/>
</p>
```

La expresión regular no coincidía, la imagen se quedaba como un `<img src="./screenshot.png">` normal y el navegador pedía un archivo que no estaba ahí. `\s+` coincide con cualquier espacio en blanco, saltos de línea incluidos. La función vive ahora en su propio archivo, para que Vitest pueda probarla con la salida real de mdsvex, la etiqueta larga incluida. (Hoy es `enhance-media.ts`, `enhanceMedia()`: también se encarga de los [vídeos](./2026-11-06-videos-in-markdown-posts).)

## Una línea de CSS

`<enhanced:img>` pone `width` y `height`, así que el navegador reserva el espacio de la imagen mientras carga: no hay salto de maquetación. Pero mi reset les da a las imágenes `max-inline-size: 100%`. Una captura ancha se estrecha para caber y, sin ayuda, conserva toda su altura y se ve aplastada:

```css
.prose img {
	block-size: auto;
}
```

`auto` deja que la altura siga al ancho, usando la proporción de los dos atributos.

## Antes de subir una imagen

- **El tamaño:** git guarda cada versión de cada archivo para siempre, incluso después de borrarlo. Subo las imágenes a más o menos el doble del ancho al que se muestran, comprimidas. `enhanced-img` genera las copias más pequeñas.
- **La privacidad:** una captura puede mostrar más de lo que quería: pestañas abiertas, notificaciones, datos personales en un formulario. Una vez subida, es pública.

## Enlaces

- [Vite: recursos estáticos](https://vite.dev/guide/assets)
- [SvelteKit: imágenes](https://svelte.dev/docs/kit/images)
- [MDN: el elemento img, alt](https://developer.mozilla.org/es/docs/Web/HTML/Reference/Elements/img#alt)
- [Markdown con mdsvex](./2026-10-31-markdown-with-mdsvex)
- [Borradores que nunca se publican](./2026-11-02-drafts-that-never-ship)
