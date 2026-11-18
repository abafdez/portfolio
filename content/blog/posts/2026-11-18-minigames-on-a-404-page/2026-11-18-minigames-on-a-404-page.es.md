---
title: Minijuegos en una página 404
description: Mi página 404 elige ahora al azar uno de cuatro juguetes, Breakout, Snake, una onda ASCII y puntos sueltos, todos hechos con el propio 404. Cómo funciona en GitHub Pages y por qué las reglas de los juegos no tienen canvas.
reviewed: false
---

Una página 404 es un callejón sin salida, así que quería que la mía fuera agradable de encontrar. Sitios como [404s.design](https://404s.design/) recopilan páginas en las que el propio error es el juguete. La mía muestra ahora el código, la dirección que pediste, enlaces a todas las secciones y una de cuatro variantes al azar:

- **Breakout**: los ladrillos son el número 404. Rómpelos con las flechas, el ratón, un dedo o dos botones en pantalla.
- **Snake**: la comida es el 404. Las paredes dan la vuelta, así que solo se pierde mordiéndose a sí misma.
- **Onda ASCII**: el número dibujado con texto y una onda que lo recorre. El puntero lo revuelve en caracteres de código y un clic lanza un anillo.
- **Puntos sueltos**: el 404 hecho de puntos que llegan volando, se apartan del puntero y vuelven a su sitio.

Las cuatro salen de un mapa diminuto: tres glifos de 5 × 7, 47 casillas en total.

![La página del proyecto de juegos del 404: una fila con cuatro opciones, el tablero de Breakout con el 404 como ladrillos y enlaces a sus archivos](./project-page.png 'Los mismos juegos en su propia página de proyecto, con enlaces a su código')

## Cómo funciona un 404 en GitHub Pages

GitHub Pages sirve `404.html` para cualquier dirección que no encuentra. El adaptador estático de SvelteKit escribe ese archivo cuando le das un `fallback`, y es un armazón vacío que arranca la aplicación. El router no encuentra ruta para la dirección y renderiza `+error.svelte` dentro del layout raíz. Así que la cabecera, el pie y hasta el idioma están bien: `/es/no-existe` recibe un 404 en español.

Sin JavaScript el armazón salía en blanco, así que el hook del servidor añade a ese archivo un mensaje breve con `noscript`, en los dos idiomas y con enlaces al inicio.

## Al azar, pero solo en el navegador

La variante se elige en `onMount`, nunca mientras se renderiza el componente. En desarrollo SvelteKit renderiza también los 404 en el servidor, y una elección al azar en el servidor y otra en el navegador serían un error de hidratación. Cada variante es un `import()` diferido, así que un 404 descarga un juego, no cuatro.

## Reglas sin canvas

Los juegos están partidos en dos. Las reglas son funciones normales en sus propios archivos: `step(game, seconds)` mueve la pelota a pasos cortos para que nunca se salte un ladrillo, y el punto donde toca la pala decide su ángulo. `turn()` guarda hasta dos giros en cola para la serpiente, para no perder dos pulsaciones rápidas. Nada de eso toca un canvas, así que tiene tests que se ejecutan en milisegundos.

Los `.svelte` solo dibujan cada fotograma y escuchan teclado, puntero y toques. El estado del juego es un objeto normal, no `$state`: cambia 60 veces por segundo, y solo lo poco que la página muestra como texto (la fase y los contadores) se copia a `$state` cuando cambia.

## Juegos que un lector de pantalla puede usar

Un canvas es una imagen, así que cada canvas de juego lleva `role="application"`. Eso le dice al lector de pantalla que deje pasar las flechas al juego en lugar de usarlas para leer. Una línea `role="status"` debajo cuenta lo que pasa ("Pelota lista", "¡Fallaste!"), y la puntuación es texto. Con movimiento reducido las animaciones se quedan quietas, y los juegos solo se mueven cuando juegas.

Los colores salen de los design tokens, leídos a través de un elemento oculto, y se vuelven a leer cuando cambia el tema, así que los juegos siguen los temas claro, oscuro y de color como todo lo demás.

## También es un proyecto

Los juegos tienen su propia página en Proyectos, donde eliges uno de una fila de opciones y lees cómo está hecho, con enlaces a cada uno de sus archivos en GitHub. Todas las páginas de proyectos tienen ahora un enlace "Código fuente en GitHub", y un test falla si alguna de esas rutas deja de existir.
