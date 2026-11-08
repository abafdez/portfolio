---
title: Ventanas de terminal, barras de htop y un foco en el borde
reviewed: false
---

## Qué hicimos

- Probé tres aspectos para `/about` en tres ramas (terminal, foco, órbita), luego junté las partes que me gustaron de las dos primeras y borré las ramas.
- Cada grupo de habilidades es una ventana de terminal: una barra de título con tres luces y `alfonso@portfolio: ~/skills/web`, y luego las habilidades como filas.
- El nivel es una barra al estilo de htop, `[||||||......]`, con 3 marcas por nivel. Las marcas son texto en la fuente del código, así que `1ch` es una marca.
- Las barras se llenan de vacío a su nivel, de izquierda a derecha, cuando entran en pantalla. Las que entran a la vez caen en cascada por la lista.
- Al señalar una fila: su borde se ilumina en el color de marca de la habilidad (y también el de sus vecinas), su barra crece un poco con un muelle y un cursor de bloque parpadea en la última marca de la barra.
- Una franja con todos los logos de marca pasa por encima de las habilidades, sin fin.

## Qué aprendí

- `count-up` iba de `inset(0 100% 0 0)` al `clip-path: none` del propio relleno. `inset()` y `none` no se pueden mezclar, así que el navegador saltaba de vacío a lleno a mitad de camino en vez de animarlo. Todas las versiones que probé "aparecían sin más" por eso. Ahora los dos keyframes son `inset()`.
- CSS por sí solo no puede iniciar una animación con tiempo cuando algo entra en pantalla (`animation-trigger` todavía no está muy extendido). Un attachment de Svelte (`fill.ts`) y un IntersectionObserver compartido ponen `data-filling`, y el CSS anima.
- Un IntersectionObserver mide la parte visible de lo que observa, `clip-path` incluido. Un relleno vacío está recortado a nada, así que nunca contaba como visible. En su lugar observa la barra.
- `@media (scripting: enabled)` deja que el CSS empiece los rellenos vacíos, así que la página prerenderizada no muestra barras llenas que se vacían y se vuelven a llenar cuando arranca el JS. Sin JS se quedan llenas.
- Svelte quita el CSS que no puede casar con la plantilla. `data-filling` lo pone el JS, así que su regla necesita `:global()`.
- El brillo del borde es un degradado radial recortado a un anillo de 1px con `mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)`. Una segunda luz, interior, desteñía el tema claro, así que la quité.
- Un `<span>` en línea no se puede escalar; la barra es `inline-block`. Su `transform-origin` va en la propia barra, no en la regla del hover, o vuelve de golpe al centro al encogerse.
- La marquesina es la lista dos veces, desplazándose la mitad de su ancho. La segunda copia dibuja sus logos con `<use href="#logo-…">`, apuntando a los trazados de la primera copia: escritos dos veces eran 168 KB de HTML.
- `contain: inline-size` impide que un contenido ancho (la marquesina, una ruta larga en una barra de título) ensanche la página. `overflow: hidden` solo no lo consigue.
- `@container` no añade especificidad, así que una container query tiene que ir después de la regla que sobrescribe.

## Problemas y soluciones

- A 320px, los nombres tenían una letra de ancho: con un simple `auto`, la columna del nivel se quedaba con todo el espacio que sobraba. `fit-content(50%)` le pone un tope.
- El rendimiento bajó de 99 a 93: el HTML sigue teniendo cada trazado de logo dos veces (filas y marquesina). Un sprite SVG lo arreglaría.

## Enlaces

- [MDN: clip-path](https://developer.mozilla.org/es/docs/Web/CSS/clip-path)
- [MDN: Intersection Observer API](https://developer.mozilla.org/es/docs/Web/API/Intersection_Observer_API)
- [MDN: la media feature `scripting`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/scripting)
- [MDN: mask-composite](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-composite)
- [MDN: `<use>`](https://developer.mozilla.org/es/docs/Web/SVG/Element/use)
- [Svelte: attachments](https://svelte.dev/docs/svelte/@attach)
- [Svelte: `:global`](https://svelte.dev/docs/svelte/global-styles)

## Siguiente

- Un sprite SVG para los logos, para volver a acercar el rendimiento a 100.
