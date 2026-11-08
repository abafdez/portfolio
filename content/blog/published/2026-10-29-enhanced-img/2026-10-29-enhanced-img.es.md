---
title: Imágenes adaptables con @sveltejs/enhanced-img
description: La foto de la portada en AVIF, WebP y JPEG a dos densidades, sin saltos de maquetación, a partir de un solo import.
cover: El flujo de trabajo de una función que procesa imágenes.
reviewed: false
---

La portada de mi portfolio tiene una foto. La quería alojada en mi sitio (sin enlazar directamente mi avatar de GitHub), en formatos modernos y sin que la página diera un salto al cargarla.

## Primero, alojarla yo

Descargué mi avatar de GitHub en `src/lib/assets/avatar.jpg`. Enlazar `github.com/abafdez.png` funcionaría, pero entonces cada visitante haría una petición a GitHub. Prefiero no meter terceros en mis páginas.

## Un import, muchos archivos

El `@sveltejs/enhanced-img` de SvelteKit procesa las imágenes al construir el sitio:

```ts
import photo from '#lib/assets/avatar.jpg?enhanced';
```

```svelte
<enhanced:img src={photo} alt="" class="photo" />
```

A partir de un JPEG de 24 KB, el build generó seis archivos: AVIF, WebP y JPEG, cada uno a 1x y a 2x. El HTML es un elemento `<picture>`, y el navegador elige el mejor formato que admite.

También pone `width` y `height` en el `<img>`. El navegador reserva el espacio justo antes de que llegue la imagen, así que nada salta.

## Pasarla como prop

Cuando la imagen viene de un componente padre, el tipo de la prop es `Picture`:

```ts
import type { Picture } from '@sveltejs/enhanced-img';

interface Props {
	photo?: Picture;
}
```

## ¿1x/2x o sizes?

Añadí un atributo `sizes` por costumbre. Luego miré el resultado:

```html
<source srcset="avatar.avif 1x, avatar@2x.avif 2x" sizes="…" type="image/avif" />
```

`1x`/`2x` son **descriptores de densidad**: eligen un archivo según la densidad de píxeles de la pantalla. `sizes` solo funciona con **descriptores de ancho** (`400w`, `800w`), en los que el navegador necesita saber a qué ancho se va a mostrar la imagen. Con `1x`/`2x`, los navegadores lo ignoran. Mi foto siempre mide 8rem o 12rem, un tamaño pequeño y fijo, así que los descriptores de densidad son lo adecuado. Quité `sizes`.

## alt=""

La foto está justo al lado de mi nombre, en un encabezado grande. Con `alt="Alfonso Baeza"`, los lectores de pantalla dirían mi nombre dos veces seguidas. Cuando una imagen no añade nada que no diga ya el texto de al lado, `alt=""` le indica a la tecnología de apoyo que se la salte.
