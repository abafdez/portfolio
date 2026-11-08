---
title: 'Una barra lateral de etiquetas que se desvanece'
description: La página de mi blog empezaba con una pared de 55 enlaces de etiqueta. Ahora es una barra lateral de chips de colores, las más usadas primero, que se desvanece hacia un botón, y lo que se desvanece desaparece de verdad también para el teclado.
reviewed: false
---

Lo primero que se veía en la página de mi blog era una pared de palabras: todas las etiquetas, de la A a la Z, 55. Más de la mitad estaban en un solo artículo.

<!-- TODO: Alfonso, una captura de /blog antes y después. -->

## Cómo lo hacen otros

Antes de dar estilo a nada, miré unos cuantos blogs que me gustan:

- [Kent C. Dodds](https://kentcdodds.com/blog) muestra unos veinte temas como píldoras que filtran los artículos en la misma página.
- [Josh Comeau](https://www.joshwcomeau.com/) tiene ocho categorías en una barra lateral junto a los artículos. Que sean pocas es la clave.
- [Maggie Appleton](https://maggieappleton.com/garden) pone sus temas en una fila que se desplaza hacia los lados: queda ordenado, pero solo ves los cinco primeros.
- [Jim Nielsen](https://blog.jim-nielsen.com/tags/) lista todas las etiquetas con su número de artículos, más o menos como hacía yo, pero en una página propia, no en la portada del blog.

La lección: mi problema no era el estilo, era la cantidad. Me quedé con las dos columnas de Josh, y con menos etiquetas a la vista.

## Las más usadas primero, y luego un desvanecido

Las etiquetas se ordenan por cuántos artículos las usan, y la lista se pliega en unas pocas filas. La última fila se desvanece hacia un botón **+** que abre el resto. El desvanecido es una máscara sobre la lista, un degradado de opaco a transparente sobre su última fila.

Un desvanecido tiene una pega. Una etiqueta que casi no se ve sigue siendo un enlace: el teclado todavía puede llegar a ella, y un lector de pantalla todavía la lee. Así que la fila desvanecida, y todo lo que hay debajo, recibe el atributo `inert` hasta que se abre la lista. Un elemento inerte no puede recibir el foco ni los clics, y la tecnología de apoyo se lo salta. Qué etiquetas quedan bajo el desvanecido depende de cómo se repartan los chips en filas, así que un `ResizeObserver` vuelve a medir cada vez que la lista cambia de ancho.

Cuando se abre la lista, el foco pasa a la primera etiqueta que estaba oculta, porque eso es lo que pediste ver.

<!-- TODO: Alfonso, recorrer con el tabulador la lista plegada y luego abrirla: ¿adónde va el foco? -->

## Sin JavaScript, sin saltos

El pliegue está en el CSS desde el principio, bajo `@media (scripting: enabled)`. Si lo añadiera cuando se ejecuta el JavaScript, la página cargaría con todas las etiquetas a la vista y luego daría un salto hacia arriba al plegarse la lista. Sin JavaScript, la media query no coincide: se ven todas las etiquetas y el botón sigue oculto, porque nada podría abrirlo.

## Un color para cada etiqueta

Cada etiqueta recibe un tono sacado de un pequeño hash de su nombre, así que `css` siempre es del mismo color. Su luminosidad sale del color de marca del tema, así que las etiquetas encajan en todos los temas y en los dos modos. El color se ve como una franja en el borde del chip, un tinte tenue detrás y un anillo que se ilumina cerca del puntero.

Un tinte es un fondo nuevo, así que necesita su propia comprobación de contraste. Comprobé el texto sobre cada tono en pasos de tres grados, en cada tema de color, claro y oscuro. El peor dio 4,81:1, por encima del 4,5:1 que necesita el texto normal, así que una etiqueta nueva no puede romperlo.

<!-- TODO: Alfonso, el color de etiqueta que más te gusta. -->

**Actualización:** la barra lateral ya es un componente, `TagColumns.svelte`, y el Devlog también tiene una. Las listas Awesome usan las mismas fichas como filtros: `TagCloud` crea enlaces o, si recibe `pressed` y `ontoggle`, botones que se activan y desactivan.

## Una sorpresa: la portada se volvió más lenta

Plegar las etiquetas mejoró la página en el móvil, y la puntuación de Lighthouse bajó. Antes, la pared de etiquetas empujaba el primer artículo por debajo de la primera pantalla. Ahora su imagen de portada está en pantalla al cargar la página, así que es lo más grande que pinta el navegador, y eso es lo que mide el Largest Contentful Paint. Hice que se cargara de inmediato y con prioridad alta, que es lo correcto para esa imagen, aunque el número simulado apenas se moviera.

## Enlaces

- [MDN: inert](https://developer.mozilla.org/es/docs/Web/HTML/Global_attributes/inert)
- [MDN: la media feature scripting](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/scripting)
- [MDN: mask-image](https://developer.mozilla.org/es/docs/Web/CSS/mask-image)
- [web.dev: optimizar el LCP](https://web.dev/articles/optimize-lcp)
