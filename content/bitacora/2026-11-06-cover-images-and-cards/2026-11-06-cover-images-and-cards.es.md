---
title: Imágenes de portada, tarjetas con miniatura y figuras
reviewed: false
---

## Qué hicimos

- Un artículo puede tener una **portada**: `cover.png` (o `.jpg`, `.webp`) en su carpeta, con su texto alternativo como `cover:` en el frontmatter. `checkCover()` hace fallar el build cuando una llega sin la otra.
- `src/lib/covers.ts` recoge con un glob todos los `cover.*` de `content/` (los borradores solo en desarrollo) y encuentra una portada por su carpeta (`Entry.folder`), así que las entradas de la Bitácora, las listas Awesome y secciones enteras podrán tener portada más adelante con el mismo código. Cada portada viene en 16:9 (1600, 800 y 480 px), un cuadrado recortado al construir el sitio (480 y 240 px) y un JPEG de 1200 px para las vistas previas de los enlaces.
- **Tarjetas** (mi elección): una miniatura cuadrada junto al texto, de 12rem y centrada en su altura; por debajo de 34rem de ancho de tarjeta (una container query), la portada en 16:9 arriba. Elegí el cuadrado después de que la primera versión en 16:9 dejara un hueco bajo la imagen (la opción C de cinco). Sin portada, un mosaico generado: la rejilla de planos con la primera etiqueta del artículo, cuadrado junto al texto y una franja de 4:1 arriba. Ahora toda la tarjeta es el enlace.
- **Artículos**: la portada arriba (`fetchpriority="high"`). `![alt](./x.png "Pie")` se convierte en un `<figure>` con un `<figcaption>`, y las imágenes de los artículos se cargan de forma diferida. Figuras sencillas (mi elección).
- **Vistas previas de los enlaces**: un artículo con portada recibe `og:image` y `twitter:card` `summary_large_image`.
- `enhanceImages()` pasó de `vite.config.ts` a `src/lib/enhance-images.ts`, con 6 tests. `checkUniqueSlugs()` falla cuando un artículo está en `drafts/` y en `published/` a la vez. 100 tests unitarios.
- Lighthouse en `/blog` y en un artículo con portada (una copia, que luego quité): 96 / 100 / 100 / 100 en los dos temas, CLS 0. Sin desplazamiento a 320px.

## Qué aprendí

- Una misma imagen tiene varios nombres: **portada** (o imagen destacada), **miniatura** en una tarjeta, **hero** arriba de un artículo y **og:image** en la vista previa de un enlace.
- En una tarjeta, la imagen lleva `alt=""`: el título de al lado ya dice de qué va el artículo, y un lector de pantalla lo leería dos veces. Arriba del artículo, necesita un texto alternativo de verdad.
- `srcset` con anchos (`480w, 800w, 1600w`) y `sizes` deja que el navegador elija el archivo más pequeño que se vea nítido.
- Se recorta **al construir el sitio**, no con CSS: el `aspect: '1:1'` de imagetools corta un cuadrado del centro. Un recorte en CSS (`object-fit: cover`) de un archivo 16:9 necesita un archivo mucho más ancho para llenar un cuadrado con nitidez.
- Dos recortes en el HTML, uno visible según la container query, los dos con `loading="lazy"`: una imagen diferida con `display: none` nunca se descarga. Comprobado: en `/blog` solo se descargó el cuadrado.
- Elegir qué parte de una imagen conservar se llama **dirección de arte**. Un punto focal elegido en un CMS (una fase posterior) podría sustituir a "el centro".
- Un **enlace estirado**: el `<a>` del título recibe `::after { position: absolute; inset: 0 }`, así que toda la tarjeta se puede pulsar con un solo enlace. Las etiquetas reciben `position: relative; z-index: 1` para seguir siendo pulsables por encima, y `:has(a:focus-visible)` dibuja el anillo de foco alrededor de la tarjeta.
- Una **container query** pregunta cuánto mide la tarjeta, no la ventana, así que la misma tarjeta funciona en la columna ancha de `/blog` y en la rejilla estrecha de la portada.
- mdsvex pone cada atributo en su propia línea cuando una etiqueta es larga. Mi expresión regular tenía un solo espacio después de `<img`, así que las imágenes largas no se convertían y daban un 404. `\s+` lo arregló, y un test con la salida real de mdsvex mantiene el arreglo.
- Prettier cambia las comillas dobles del título de una imagen en markdown por simples; mdsvex acepta las dos.
- Un servidor de previsualización arrancado antes de un build sirve la lista de archivos antigua. Mi primera pasada de Lighthouse fue a una previsualización desfasada en el mismo puerto: errores en la consola y un CLS de 0,33 que no eran reales.

## Problemas y soluciones

- Una imagen de prueba con pie daba un 404: el bug de la expresión regular de arriba.
- Una copia temporal de un borrador en `published/` creó dos artículos con el mismo slug en desarrollo; ahora `checkUniqueSlugs()` lo detecta.

## Enlaces

- [SvelteKit: imágenes, elegir una imagen de forma dinámica](https://svelte.dev/docs/kit/images#sveltejs-enhanced-img-Dynamically-choosing-an-image)
- [MDN: imágenes adaptables, srcset y sizes](https://developer.mozilla.org/es/docs/Web/HTML/Guides/Responsive_images)
- [MDN: container queries de CSS](https://developer.mozilla.org/es/docs/Web/CSS/CSS_containment/Container_queries)
- [Inclusive Components: tarjetas](https://inclusive-components.design/cards/)
- [El protocolo Open Graph](https://ogp.me/)

## Siguiente

- Portadas de verdad para los primeros borradores que publique.
