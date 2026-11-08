---
title: Un avatar alojado en mi sitio con enhanced-img
reviewed: false
---

## Qué hicimos

- Descargué mi avatar de GitHub (un JPEG de 460px y 24 KB) en `src/lib/assets/avatar.jpg`, en vez de enlazarlo desde GitHub.
- Lo importé con `?enhanced` y lo mostré con `<enhanced:img>` en Hero.

## Qué aprendí

- `?enhanced` produce un objeto `Picture`. Al construir el sitio genera versiones AVIF, WebP y JPEG a 1x y 2x, y el navegador elige el mejor formato que admite.
- También pone `width` y `height`, así que la maquetación no salta mientras carga la imagen.
- Cuando la imagen es una prop, el tipo es `Picture` de `@sveltejs/enhanced-img`.
- Para una imagen pequeña con un tamaño de visualización fijo, lo adecuado son los descriptores de densidad (`1x`, `2x`), y con ellos los navegadores ignoran `sizes`. `sizes` solo importa con descriptores de ancho (`400w`).
- La foto tiene `alt=""` porque mi nombre está justo al lado. Repetirlo sería ruido para quien usa un lector de pantalla.

## Problemas y soluciones

- Al principio añadí un atributo `sizes`. El resultado usaba `1x`/`2x`, así que `sizes` no hacía nada. Lo quité.

## Enlaces

- [SvelteKit: imágenes](https://svelte.dev/docs/kit/images)
- [MDN: imágenes adaptables](https://developer.mozilla.org/es/docs/Web/HTML/Guides/Responsive_images)

## Siguiente

- Usar enhanced-img para las capturas de los proyectos en la fase 8.
