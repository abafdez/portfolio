---
title: 'Tarjetas que se convierten en la página: view transitions con elementos compartidos en SvelteKit'
description: Pulsa la tarjeta de un artículo y su título, su imagen, su fecha y sus etiquetas vuelan a su sitio en el artículo. Cómo view-transition-name empareja dos elementos a través de una navegación, y las cuatro cosas que hicieron que se viera bien.
cover: Una rejilla de tarjetas con una que se levanta y crece hasta ser un artículo completo.
reviewed: false
---

Hasta ahora, abrir un artículo desde la lista del blog era un fundido: la lista se iba y el artículo llegaba. Ahora la tarjeta que pulsas se convierte en la página. Su título crece hasta ser el encabezado del artículo, su miniatura se convierte en la portada, y la fecha, la descripción y las etiquetas se deslizan hasta donde las tiene el artículo, mientras las demás tarjetas caen. Volver atrás lo reproduce al revés.

## Dos elementos, un nombre

Mi sitio ya hace cada navegación dentro de una view transition (el `onNavigate` de SvelteKit más `document.startViewTransition`). El navegador toma una imagen de la página antes del cambio y otra después, y anima entre las dos.

Dale a un elemento un `view-transition-name` y tendrá su propio par de imágenes. Si un elemento de la página antigua y otro de la nueva tienen el **mismo nombre**, el navegador los trata como una sola cosa que se ha movido: anima la caja desde la posición y el tamaño antiguos a los nuevos y funde las dos imágenes dentro. Así que "el título de la tarjeta se convierte en el encabezado" es solo:

```css
.card h3 {
	view-transition-name: morph-title;
}
.post h1 {
	view-transition-name: morph-title;
}
```

## Solo la tarjeta que pulsaste

Ese CSS fallaría enseguida: un nombre tiene que ser **único en la página**, y `/blog` tiene decenas de tarjetas. Así que ninguna tarjeta tiene nombre hasta que la pulsas. En `onNavigate`, antes de que empiece la transición, busco la tarjeta cuyo título enlaza a donde vas y la marco:

```ts
export function cardLinkingTo(url: URL | undefined): HTMLElement | null {
	if (!url) return null;
	for (const link of document.querySelectorAll<HTMLAnchorElement>(
		'[data-morph-card] [data-morph="title"] a'
	)) {
		if (new URL(link.href).pathname === url.pathname) return link.closest('[data-morph-card]');
	}
	return null;
}
```

Las partes están marcadas en el HTML (`data-morph="title"`, `"picture"`, `"meta"`, `"description"`, `"tags"`), en la tarjeta y en la cabecera de la página, y los nombres solo existen dentro de una marcada:

```css
:root:active-view-transition-type(morph) [data-morphing] [data-morph='title'] {
	view-transition-name: morph-title;
}
```

El otro extremo se marca en el `update()` de la transición, cuando SvelteKit ya ha puesto la página nueva y antes de que el navegador tome su imagen del "después". Al volver atrás es al revés: primero se marca la cabecera del artículo, y la tarjeta solo se encuentra cuando la lista vuelve a estar en pantalla.

## Cuatro cosas que hicieron que se viera bien

**Texto tan ancho como sus palabras.** Un encabezado es un bloque: tan ancho como la columna, casi todo vacío. Escalar esa imagen del ancho de una tarjeta al del artículo escala el espacio vacío, no las palabras. Durante la transición las partes reciben `inline-size: fit-content`, así que cada imagen es casi todo texto.

**Un cuadrado que se convierte en 16:9.** La tarjeta muestra un recorte cuadrado y el artículo una portada 16:9. Por defecto, cada imagen conserva su ancho y su propia altura, así que una se sale de la caja que se mueve y la otra no llega. Llenar la caja y recortar las dos, como `object-fit` en una imagen, lo arregla, pero solo con un recorte, porque por defecto nada recorta las imágenes de una view transition:

```css
&::view-transition-old(morph-picture),
&::view-transition-new(morph-picture) {
	block-size: 100%;
	object-fit: cover;
	overflow: clip;
}
```

**La portada tiene que estar ahí.** La portada del artículo es un archivo más grande que la miniatura de la tarjeta, y el navegador toma la imagen del "después" en cuanto termina `update()`. Si la portada no ha cargado, llega volando vacía. Así que `update()` la espera, como mucho 300ms:

```ts
await Promise.race([Promise.all(images.map((img) => img.decode().catch(() => {}))), timeout]);
```

**La página antigua se queda donde estaba.** Al volver atrás, SvelteKit desplaza la lista hasta donde estabas, y la imagen de la página antigua se coloca donde empieza el contenido nuevo, muy arriba. El artículo se veía desde la mitad mientras se desvanecía. Medir dónde empieza el contenido antes y después, y mover la imagen antigua la diferencia (`--route-shift`), lo arregló para todas las navegaciones, no solo para esta.

## El resto de la página

Todo lo que no tiene nombre sigue en la imagen de la página, así que las demás tarjetas se van juntas: caen un poco y se desvanecen (220ms), y el cuerpo del artículo sube tras un pequeño retraso (250ms), cuando las partes ya van de camino. Una parte que no tiene dónde aterrizar, como la fecha de la tarjeta de un proyecto, se va con el resto.

Quien prefiere menos movimiento no ve ninguna transición, como con todos los demás efectos del sitio.

## Enlaces

- [MDN: view-transition-name](https://developer.mozilla.org/es/docs/Web/CSS/view-transition-name)
- [MDN: view-transition-class](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-class)
- [Chrome for Developers: view transitions en el mismo documento](https://developer.chrome.com/docs/web-platform/view-transitions/same-document)
- [SvelteKit: onNavigate](https://svelte.dev/docs/kit/$app-navigation#onNavigate)
