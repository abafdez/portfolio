---
title: Un robots.txt que nunca funcionó, y SEO a propósito
reviewed: false
---

## Qué hicimos

- Decidí la cuestión 3 del principio de la ruta de aprendizaje: el sitio se puede **encontrar**. Solo `/mascot` (una hoja de revisión, todavía no una página) dice `noindex`.
- Quité `static/robots.txt`: nunca había hecho nada (mira abajo).
- `Seo.svelte`, un componente que usan todas las páginas en vez de su propio `<svelte:head>`: `<title>`, descripción, URL canónica, etiquetas Open Graph y una tarjeta de Twitter. Todavía sin imagen, así que las vistas previas de los enlaces son tarjetas de texto (decisión mía, una imagen puede llegar más tarde).
- Los títulos terminan en "Alfonso Baeza" en vez de en "AB": `CV builder · Projects · Alfonso Baeza`.
- `sitemap.xml`, un endpoint prerenderizado construido a partir de las mismas listas que las páginas (secciones, proyectos, listas Awesome, artículos, etiquetas, entradas del Devlog), con `lastmod` donde hay fecha.
- Las entradas del Devlog reciben una descripción sacada de su cuerpo: `summary()` en `content.ts` coge el primer párrafo o elemento de lista, como texto sin formato, cortado en una palabra por debajo de 160 caracteres.
- SEO, accesibilidad y buenas prácticas de Lighthouse a 100 en la portada, el generador de CV y una entrada. `/mascot` saca un 63 en SEO, a propósito: "blocked from indexing".

## Qué aprendí

- Los rastreadores solo leen `robots.txt` en la raíz del host: `abafdez.github.io/robots.txt`. Mi sitio es un sitio de proyecto bajo `/portfolio/`, así que mi archivo en `/portfolio/robots.txt` nunca se leyó, y el de la raíz da un 404. El `Disallow: /` que creía que ocultaba el sitio no hacía nada. En un sitio de proyecto, la etiqueta `<meta name="robots">` de cada página es el único interruptor que controlo.
- De todas formas, `Disallow` y `noindex` no son lo mismo. `Disallow` impide rastrear, pero una URL bloqueada puede aparecer igualmente si otros sitios la enlazan. `noindex` deja una página fuera de los resultados, y el rastreador tiene que poder entrar para leerlo.
- Mientras se prerenderiza no hay ninguna petición real, así que SvelteKit se inventa `page.url` con el origen `http://sveltekit-prerender`. `paths.origin` en la configuración (en SvelteKit 3 está bajo `paths`, junto a `base`) pone el verdadero, así que la canónica y `og:url` son URLs absolutas que funcionan.
- La URL canónica deja fuera la query: `/projects/cv?profile=support` es la misma página que `/projects/cv`.
- Un sitemap no se puede anunciar en un `robots.txt` que no controlo, así que hay que enviarlo a mano (Google Search Console).

## Enlaces

- [Google: introducción a robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google: bloquear la indexación con noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [El protocolo Open Graph](https://ogp.me/)
- [El protocolo de sitemaps.org](https://www.sitemaps.org/protocol.html)
- [SvelteKit: configuración, paths](https://svelte.dev/docs/kit/configuration#paths)

## Siguiente

- Enviar `sitemap.xml` a Google Search Console cuando esté desplegado.
- La fase 9 sigue: Vitest para `content.ts` (`summary()` es un buen primer test), pruebas de humo con Playwright y tests en la CI.
