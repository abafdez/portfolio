---
title: Búsqueda estática con Pagefind, y resultados que vuelan a la página
description: Búsqueda en un sitio estático sin servidor, en dos idiomas, desde un botón en la cabecera. Después las animaciones, y la trampa de transformar un resultado en una página mientras la caja de búsqueda sigue en pantalla.
reviewed: false
---

Este sitio no tiene servidor: son archivos estáticos en GitHub Pages. Aun así la búsqueda funciona, porque [Pagefind](https://pagefind.app/) construye el índice a partir del HTML terminado después del build, como más archivos estáticos. Una lupa en la cabecera abre una caja debajo, `/` la abre desde cualquier sitio, y una búsqueda solo descarga los pequeños trozos de índice que necesita.

![La caja de búsqueda abierta bajo el botón de la cabecera, con "20 results" para "dark mode": un artículo, dos entradas del Devlog y la lista Modern CSS, cada uno con su sección, su título y un extracto con las coincidencias resaltadas](./search-box.png 'Cada resultado tiene su sección, su título y las palabras alrededor de la coincidencia')

## Qué se indexa

Por defecto Pagefind indexa todas las páginas, también las de listas y etiquetas, que solo repiten títulos. En cuanto algún elemento tiene `data-pagefind-body`, solo se indexan esos elementos: aquí, los artículos del blog y del Devlog, las cabeceras de los proyectos, las listas Awesome y la introducción de Sobre mí. Cada uno lleva además `data-pagefind-meta="section:Blog"` (en el idioma de la página), que es la pequeña etiqueta encima de cada resultado.

Los primeros extractos estaban llenos de "6 min de lectura", listas de etiquetas y la palabra "copiar" de los bloques de código, así que esas partes llevan `data-pagefind-ignore`.

## Dos idiomas

Pagefind construye un índice por cada `<html lang>` y elige uno al arrancar. Pero el selector de idioma de este sitio no recarga la página, así que un Pagefind ya cargado seguiría buscando en el idioma anterior. La solución es pequeña: importar `pagefind.js?lang=es` y `?lang=en`. Otra URL es otra instancia del módulo, cada una con su índice.

## Por qué no funcionaba en preview

`vite preview` sirve la carpeta de salida de SvelteKit, no `build/`, y Pagefind escribe en `build/`. Así que ahora `pnpm preview` ejecuta un pequeño servidor estático mío que sirve `build/` con las reglas de GitHub Pages (`x`, `x.html`, `x/index.html` y si no, `404.html`), y los tests de extremo a extremo también lo usan.

## Animar un popover

La caja es un popover, como el menú de temas de color: Escape y un clic fuera la cierran, y el foco vuelve al botón, sin JavaScript mío. Animarla al entrar y al salir necesita dos novedades de CSS. `@starting-style` da el estado del que parte cuando aparece, y `transition-behavior: allow-discrete` en `display` y `overlay` la mantiene en pantalla hasta que termina su transición de cierre, en lugar de desaparecer de golpe. Después los resultados suben uno tras otro.

## Un resultado que se convierte en la página

Las tarjetas de artículos de este sitio ya se transforman en la página que abren: su título y su descripción vuelan a la cabecera con una view transition. Ahora un resultado de búsqueda hace lo mismo.

![A mitad de la transición: el título del resultado crece hacia el encabezado del artículo mientras la página anterior se desvanece](./result-morph.png 'El título de camino del resultado al encabezado')

Había una pega. Una tarjeta desaparece cuando cambia su página; la caja de búsqueda no, porque está fuera de la página. Así que en la foto "después" de la transición el título del resultado seguía ahí, con el mismo `view-transition-name` que el nuevo encabezado, y dos elementos no pueden compartir nombre: el navegador se saltaba la transición entera. La solución cierra la caja sin animación antes de que se tome esa foto. Quitarle la transición también cancela la animación de cierre que ya había empezado. Después la caja recibe un nombre propio durante las transiciones de página, para que se desvanezca por encima de la página anterior y no por debajo.
