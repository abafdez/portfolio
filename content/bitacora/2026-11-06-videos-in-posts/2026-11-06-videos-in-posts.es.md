---
title: Vídeos en los artículos
reviewed: false
---

## Qué hicimos

- **Vídeos junto a un artículo**, escritos como HTML en el markdown (`<video>`, `<source>`, `<track>`, `poster`). El paso del markdown convierte cada `src` o `poster` con `./` en un import, así que el build le da una URL real con hash y falla si falta el archivo.
- **Un `<video>` sin `width` y `height` hace fallar el build**, como una imagen sin texto alternativo: sin ellos, la página salta al cargar el vídeo.
- `enhance-images.ts` es ahora `enhance-media.ts` (`enhanceMedia()`), con cinco tests nuevos (11 en el archivo).
- `.prose` da a los vídeos el mismo estilo que a las imágenes (borde, radio y reducidos con `block-size: auto`).
- La guía de publicación tiene una sección de Vídeos: MP4 y WebM, los atributos y los comandos de ffmpeg para comprimir una grabación.

## Qué aprendí

- **Un GIF animado en un artículo saldría quieto**: enhanced-img abre los archivos con `sharp` sin pedirle la animación, así que solo se conserva el primer fotograma. Un vídeo además pesa mucho menos y se puede pausar.
- Vite ya trata `.mp4`, `.webm` y `.vtt` como recursos: un `import clip from './clip.mp4'` sin más da la URL con hash. Los vídeos se usan tal cual, sin volver a codificarlos, así que hay que comprimirlos antes de subirlos.
- Con varios `<source>`, el navegador reproduce el primero que puede: WebM (más ligero) primero, MP4 (se reproduce en todas partes) al final.
- `muted` le importa a Svelte: avisa de un vídeo sin un `<track>` de subtítulos, salvo que esté silenciado.
- Playwright puede grabar un navegador en WebM (`recordVideo`), útil para un vídeo de prueba.

## Enlaces

- [MDN: el elemento video](https://developer.mozilla.org/es/docs/Web/HTML/Element/video)
- [web.dev: sustituir los GIF animados por vídeo](https://web.dev/articles/replace-gifs-with-videos)
- [Vite: recursos estáticos](https://vite.dev/guide/assets)

## Siguiente

- Grabar la lista Awesome saltando (desde el commit anterior al arreglo) para "Páginas que saltan".
