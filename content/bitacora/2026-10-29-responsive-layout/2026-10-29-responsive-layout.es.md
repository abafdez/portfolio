---
title: Maquetación adaptable con grid y container queries
reviewed: false
---

## Qué hicimos

- Hero: una container query lo pasa a dos columnas (la foto junto al texto) cuando el hero mide al menos 36rem de ancho.
- Rejilla de tarjetas: `repeat(auto-fit, minmax(min(100%, 16rem), 1fr))`, sin media queries.
- Cabecera: áreas de grid. En pantallas estrechas, el nombre y el selector de tema comparten fila y el menú va debajo. En pantallas anchas, todo va en una fila.
- Pie: el copyright a un lado y los enlaces a los perfiles al otro. Se queda abajo en las páginas cortas.
- Añadí un token `--content-width` que comparten la cabecera, el main y el pie.
- Lo probé a 320px y a 1280px: sin desplazamiento horizontal.

## Qué aprendí

- Una media query pregunta por la pantalla. Una container query pregunta por el contenedor, así que un componente se adapta al espacio que le dan, esté donde esté.
- Un elemento no puede consultar su propio tamaño. El `<section>` es el contenedor (`container-type: inline-size`) y el `.layout` de dentro es lo que cambia.
- `auto-fill` conserva las columnas vacías. `auto-fit` las colapsa, así que 3 tarjetas se estiran para llenar una fila de 4 columnas.
- `min(100%, 16rem)` evita que una tarjeta se desborde en pantallas de menos de 16rem.
- Las áreas de grid cambian la maquetación sin cambiar el marcado.
- Pie siempre abajo: `body { display: grid; grid-template-rows: auto 1fr auto }`. Funciona porque el div envoltorio de `app.html` es `display: contents`. El anunciador de SvelteKit es `position: absolute`, así que no ocupa una fila.
- Tipografía fluida: `--font-size-fluid-3` es `clamp(2rem, 9vw, 3.5rem)`. Crece entre esos tamaños sin breakpoints.
- El enlace actual del menú usa color y un subrayado grueso, así que no depende solo del color.

## Problemas y soluciones

- A 320px la página se desplazaba hacia los lados. El menú de la fase 2 era una fila flex que no podía pasar a la línea siguiente. Añadí `flex-wrap: wrap`.
- La foto se quedaba en 128px en escritorio. Había puesto la regla `@container` encima de la regla base de `.photo`. `@container` (como `@media`) no añade especificidad, así que las dos reglas empataban y ganaba la de después. Primero las reglas base, luego la del contenedor.
- `vite preview` lee la lista de archivos al arrancar. Después de un nuevo build puede servir recursos antiguos o que ya no existen, así que hay que reiniciarlo.

## Enlaces

- [MDN: container queries](https://developer.mozilla.org/es/docs/Web/CSS/CSS_containment/Container_queries)
- [MDN: auto-fill frente a auto-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/repeat#auto-fill)
- [MDN: grid-template-areas](https://developer.mozilla.org/es/docs/Web/CSS/grid-template-areas)

## Siguiente

- La página del CV de la fase 5: necesita espacio arriba para el contenido (el `h1` de la página del CV toca la cabecera).
