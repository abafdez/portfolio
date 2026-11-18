---
title: Un 404 en el que da gusto caer
reviewed: false
---

## Qué hicimos

- Rehice la página 404 (`src/routes/+error.svelte`): el código, la dirección que se pidió, enlaces a todas las secciones y una de cuatro variantes al azar, con "Otro 404" para pasar a la siguiente. Ideas de 404s.design; diseños y código propios.
- Las variantes: **Breakout** (los ladrillos son el 404), **Snake** (la comida es el 404 y las paredes dan la vuelta), una **onda ASCII** que se revuelve bajo el puntero y unos **puntos sueltos** que se dispersan y vuelven a su sitio. Las cuatro dibujan el mismo mapa de 47 casillas (`digits.ts`).
- Las reglas de los juegos son funciones normales (`breakout.ts`, `snake.ts`, `ascii.ts`) con tests y sin canvas; los `.svelte` solo dibujan y escuchan (teclado, puntero, toques, botones en pantalla).
- Sin JavaScript, el `404.html` de GitHub Pages salía en blanco: ahora `hooks.server.ts` le añade un mensaje breve en los dos idiomas con enlaces al inicio.
- Después lo convertí en un proyecto, `/projects/404`: un grupo de radios elige la variante y debajo se explica cómo está hecha, con enlaces a sus archivos en GitHub. Todas las páginas de proyectos y herramientas tienen ahora "Código fuente en GitHub" (`source` en `projects.ts`, `sourceUrl()` en `links.ts`), y un test comprueba que cada ruta enlazada existe.

## Qué aprendí

- En GitHub Pages, una dirección que no existe recibe `404.html` (el `fallback` de adapter-static), que arranca la aplicación; el router no encuentra ruta y muestra `+error.svelte` dentro del layout raíz, así que hasta sale en el idioma correcto.
- La variante al azar se elige en `onMount`, nunca al renderizar: `pnpm dev` renderiza los 404 en el servidor, y otra elección en el navegador sería un error de hidratación.
- Guardar el estado del juego en un objeto normal y copiar a `$state` solo lo que enseña la plantilla (`phase`, los contadores) evita despertar a Svelte 60 veces por segundo.
- Un juego en canvas necesita `role="application"` para que el lector de pantalla deje pasar las flechas, y una línea `role="status"` que cuente lo que pasa.

## Problemas y soluciones

- Las ligaduras de Fira Code juntaban caracteres en el arte ASCII: `font-variant-ligatures: none`.
- Una expresión regular de un test e2e contaba 48 ladrillos; el 404 tiene 47 casillas.

## Siguiente

- Quizá una quinta variante; la carpeta está preparada (un componente y una línea en `variants.ts`).
