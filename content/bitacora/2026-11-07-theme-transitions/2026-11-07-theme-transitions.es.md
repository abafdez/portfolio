---
title: Transiciones de tema con glitch y con una onda sobre la rejilla
reviewed: false
---

## Qué hicimos

- Cambiar el **tema de color** reproduce ahora una de dos transiciones, elegida al azar cada vez, empezando desde el radio que elegiste. El selector de claro y oscuro conserva su círculo (un efecto por control, decisión mía).
- **Onda sobre la rejilla:** las celdas de la rejilla de planos pasan al tema nuevo en una onda que sale del radio, con un borde pixelado. La página nueva se dibuja a través de una máscara: un SVG del tamaño de la pantalla, con un cuadrado por celda de la rejilla, cada uno apareciendo con `<animate>` tras un retraso que crece con su distancia (más algo de azar). Las celdas con el mismo retraso comparten un `<path>`, así que hay unas 30 animaciones, no miles.
- **Glitch:** durante 450 ms, la página nueva solo se ve en franjas horizontales al azar, desplazadas hacia los lados, con algunos fotogramas con los canales de color separados (un filtro SVG: el rojo a la izquierda y el verde y el azul a la derecha, mezclados con screen), y luego se asienta. Las franjas y los desplazamientos son aleatorios cada vez: los genera el JS y se los pasa a los keyframes como custom properties.
- Los dos viven en `src/lib/palette-transitions.ts`; el CSS está en `PalettePicker.svelte`, limitado con tipos de view transition (`palette` más el nombre del efecto). Con reducción de movimiento: sin transición, los colores simplemente cambian.
- El selector solo muestra los nombres; el crédito es una pista al pasar el ratón (`title`: "Tokyo Night, de Enkia"). Los avisos de licencia están en `themes/_licences.css` para que el build los conserve.

## Qué aprendí

- **Una view transition son dos fotos**, la página antes y después, como `::view-transition-old(root)` y `::view-transition-new(root)`. Cualquier cosa que pueda dar estilo a una imagen puede ser el efecto: una máscara, un filtro, `translate`. El truco de la máscara con un GIF que vi es la misma idea: una imagen en movimiento como máscara de la foto nueva.
- **Un SVG usado como imagen en CSS ejecuta sus propias animaciones.** Así que un SVG generado con `<animate>` dentro es una máscara que se anima sola, sin ejecutar JavaScript en cada fotograma.
- **`steps(1, end)`** convierte cada keyframe en un salto en vez de un fundido, que es lo que hace que un glitch parezca roto.
- `:active-view-transition-type(name)` limita el CSS a un tipo de transición, así que el círculo, el cambio de ruta y estos efectos nunca se cruzan.
- Para ver un efecto de 450 ms, lo pausé: las animaciones de la transición están en `document.getAnimations()`, así que `pause()` y `currentTime` congelan cualquier fotograma. El screencast de Chrome (CDP) capturó el resto fotograma a fotograma.

## Problemas y soluciones

- **Los cambios rápidos (con las flechas) rompían el efecto siguiente:** una transición nueva se salta la que está en marcha, cuya limpieza quitaba luego las propiedades que la nueva acababa de poner. Ahora solo limpia la última transición, y quita todo lo que cualquiera de ellas haya puesto.
- Una transición saltada rechaza su promesa `ready` ("Transition was skipped"), que aparecía como un error en la consola. Es lo esperado, así que se captura, en el selector de paleta y en el selector de claro y oscuro (tres clics rápidos hacían lo mismo).
- Los comentarios de licencia desaparecían del CSS generado: el minificador solo conserva un comentario `/*! */` al principio del todo del bundle. Los archivos de tema son los primeros del bundle (los imports del glob van antes que `tokens.css`), así que los avisos están en `_licences.css`, que se ordena el primero.

## Enlaces

- [MDN: View Transition API](https://developer.mozilla.org/es/docs/Web/API/View_Transition_API)
- [MDN: :active-view-transition-type()](https://developer.mozilla.org/en-US/docs/Web/CSS/:active-view-transition-type)
- [MDN: mask-image](https://developer.mozilla.org/es/docs/Web/CSS/mask-image)
- [MDN: SVG `<animate>`](https://developer.mozilla.org/es/docs/Web/SVG/Element/animate)
- [Ian Duffy: un selector de tema con view transitions](https://iankduffy.com/articles/creating-a-theme-switcher-using-view-transition) y [theme toggle effects](https://theme-toggle.rdsx.dev/), de donde salieron las ideas

## Siguiente

- Más efectos (líneas de CRT, disolución con tramado), o la mascota como máscara cuando esté diseñada.
