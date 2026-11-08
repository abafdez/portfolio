---
title: Ventanas de habilidades que se pliegan y se abren mientras lees
reviewed: false
---

## Qué hicimos

- Cada grupo de habilidades de `/about` es ahora una ventana que se pliega (`SkillWindow.svelte`). La barra de título es el botón, con "desplegar [+]" o "plegar [-]" a la derecha.
- Plegada, una ventana conserva su nombre, una descripción nueva de una línea (en `content/skills.yaml`), chips con sus cinco primeras habilidades y un "+N más", y todos los iconos en la barra de título, como un dock. Hay una luz encendida, en los colores de Mac (tokens nuevos): amarilla (minimizar) mientras está plegada y verde (zoom) mientras está abierta. Al cambiar se desvanece y aparece con un rebote (un muelle).
- Plegar y desplegar están animados: la lista se encoge mientras los chips crecen, y al revés. Los iconos del dock aparecen uno tras otro, y cuando no caben en la barra de título dan vueltas como la marquesina de logos.
- Las ventanas empiezan plegadas, salvo la primera, y se abren solas al llegar a los dos tercios superiores de la pantalla. En cuanto abro o cierro una, esa es mi elección y deja de abrirse sola, hasta que salgo o recargo. (Una primera versión guardaba las elecciones en `localStorage`; que una recarga empezara de cero me pareció mejor.)
- Los iconos genéricos (Lucide) tienen color: un tono sacado de un hash del nombre de la habilidad, así que cada uno mantiene el mismo color en todas partes y en cada build.

## Qué aprendí

- `hidden="until-found"` oculta el contenido pero deja que la búsqueda en la página (Ctrl+F) lo encuentre. Cuando hay una coincidencia, el navegador lanza `beforematch` sobre él y la ventana se abre.
- Un `display: none` impediría esa búsqueda, así que el CSS nunca lo usa en la lista. Antes de que se ejecute el JS, una lista plegada solo está en una fila de altura cero (más abajo); el atributo solo se pone cuando se ejecuta el JS.
- `@media (scripting: enabled)` otra vez: solo se pliega con JS. Sin él, todas las ventanas están abiertas y la pista está oculta, porque el botón no haría nada.
- La página prerenderizada no puede saber qué hay en pantalla, así que el servidor abre la primera ventana, la que ves al cargar la página. Las demás se habrían abierto después de cargar y habrían movido la página.
- Abrirse sola usa un IntersectionObserver sobre una región (los dos tercios superiores), no sobre una línea: un scroll rápido puede saltarse una línea, pero donde se detiene, una ventana en pantalla está dentro de la región.
- `$state(prop)` solo toma el primer valor de la prop, y Svelte avisa (`state_referenced_locally`). Aquí es justo lo que quiero, así que el aviso se silencia con un comentario que explica por qué.
- El nombre del botón para un lector de pantalla es el nombre del grupo, oculto, más la pista ("Lenguajes: plegar"), con `aria-expanded` para el estado. Las luces, la ruta y los iconos son `aria-hidden`.
- `height: auto` no se puede animar, pero un grid de una fila sí: `grid-template-rows` de `1fr` (la altura del contenido) a `0fr` (nada). El hijo necesita `min-block-size: 0` y `overflow: clip`; `overflow-clip-margin` evita que se corten los bordes brillantes de las filas.
- `hidden="until-found"` ocultaría la lista de golpe, antes de que pudiera encogerse, así que se pone en `transitionend`. Las transiciones de dentro de la lista (el rebote de una barra) también suben por el árbol, así que comprueba `event.target === event.currentTarget` y el nombre de la propiedad. Con reducción de movimiento no hay animación que esperar, así que se pone en el acto.
- Una animación se ejecuta cuando su elemento pasa de `display: none` a visible, así que la aparición de los iconos del dock se repite en cada pliegue, con `--i` para el escalonado.
- Si los iconos del dock caben se mide con un `ResizeObserver` sobre el dock (un dock oculto mide 0 de ancho, así que se vuelve a medir cuando aparece). Solo entonces se muestra la segunda copia.

## Problemas y soluciones

- El menú de secciones resaltaba la sección equivocada después de que una ventana se abriera sola: la página cambiaba de altura sin ningún evento de scroll. Ahora también se actualiza desde un `ResizeObserver` sobre el body.

## Enlaces

- [MDN: `hidden="until-found"`](https://developer.mozilla.org/es/docs/Web/HTML/Global_attributes/hidden)
- [MDN: beforematch](https://developer.mozilla.org/en-US/docs/Web/API/Element/beforematch_event)
- [MDN: aria-expanded](https://developer.mozilla.org/es/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-expanded)
- [MDN: ResizeObserver](https://developer.mozilla.org/es/docs/Web/API/ResizeObserver)
- [CSS-Tricks: animar la altura con grid](https://css-tricks.com/css-grid-can-do-auto-height-transitions/)
- [MDN: overflow-clip-margin](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-clip-margin)
- [Svelte: state_referenced_locally](https://svelte.dev/e/state_referenced_locally)

## Siguiente

- Revisar las descripciones de los grupos en `content/skills.yaml`, y luego el filtro por perfil y la PR.
