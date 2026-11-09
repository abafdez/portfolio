---
title: 'El texto nunca va sobre la cuadrícula'
description: El fondo de mi sitio es una cuadrícula de plano que se ilumina alrededor del ratón. Quedaba genial y se leía mal. Cómo encontré cada texto que había encima, y la única regla que lo arregló todo.
reviewed: false
---

El fondo de mi sitio es una cuadrícula de plano: líneas finas, un `+` en cada cruce principal y un brillo que sigue al ratón. Es lo primero que se ve, y me gusta. Pero leer encima cansaba. Hace una semana medí el contraste del texto atenuado sobre las líneas iluminadas y arreglé los colores ([La decoración bajo el texto también necesita contraste](/blog/2026-11-04-decoration-under-text-needs-contrast)). Las proporciones pasaban. Seguía leyéndose mal.

El contraste mide un color frente a otro. No dice nada de una línea que atraviesa justo el centro de las letras. En los títulos las letras son lo bastante grandes como para ignorarla; a 16 px, y peor a 12 px, cada línea es un arañazo sobre el texto.

![La cabecera de un artículo antes: el título, la descripción y las etiquetas dibujados directamente sobre las líneas de la cuadrícula](./before.png 'Antes: cada línea de la descripción tiene líneas de la cuadrícula encima.')

## Encontrar cada sitio

No quería revisar veinte páginas a ojo, así que se lo pregunté al navegador. Para cada nodo de texto de una página, un pequeño script sube por sus ancestros y mira si alguno tiene fondo. Si ninguno lo tiene, el texto se dibuja directamente sobre la cuadrícula:

```js
let element = textNode.parentElement;
let covered = false;
while (element && element !== document.body) {
	const style = getComputedStyle(element);
	if (style.backgroundColor !== 'rgba(0, 0, 0, 0)' || style.backgroundImage !== 'none') {
		covered = true;
		break;
	}
	element = element.parentElement;
}
```

Pasado por una página de cada tipo, listó 152 textos en un solo artículo del blog, 225 en las tablas de mi comprobador de contraste, y todas las introducciones, etiquetas de formulario, migas de pan y el pie. Las ventanas de habilidades de mi página Sobre mí no estaban en la lista: son la única parte del sitio que ya tenía fondo, y la que se leía bien.

## Una regla

En vez de arreglar las páginas una a una, escribí una regla: **la cuadrícula es para los títulos grandes y el espacio vacío; el texto de tamaño normal o menor va sobre una superficie.**

La superficie es una clase, `.sheet` (hoja):

```css
.sheet {
	padding: var(--size-5) clamp(var(--size-4), 4vw, var(--size-7));
	border: var(--border-size-1) solid var(--surface-3);
	border-radius: var(--radius-3);
	background-color: var(--surface-1);
}
```

El truco es el color. `--surface-1` es el fondo de la propia página, el color que hay bajo la cuadrícula. Así una hoja no parece una caja encima de la página: parece un papel sobre el tablero de dibujo, con la cuadrícula asomando alrededor.

![La misma cabecera después: título, descripción y etiquetas sobre una hoja, con la cuadrícula alrededor](./after.png 'Después: la misma página, con el texto sobre una hoja.')

Los artículos, las introducciones, la barra lateral de etiquetas, los filtros, los formularios y las herramientas pasaron a ir sobre hojas. Los títulos grandes se quedaron sobre la cuadrícula, igual que el espacio vacío entre unas cosas y otras, que es donde mejor queda. Al volver a pasar el script: solo quedaban títulos de 20 px o más.

## Qué se rompió

**Mi clase global perdía ante mis componentes.** Los estilos globales viven en capas de cascada; los de un componente no están en ninguna capa, y los estilos sin capa ganan a los que la tienen, sea cual sea la especificidad. El `fieldset { padding: 0; border: none; }` de mi generador de CV le quitaba a la hoja su relleno y su borde sin avisar. La solución fue devolvérselos en ese componente.

**En el móvil el contenido se estrechaba.** El relleno de una hoja dentro del relleno de la página dejaba 254 px en una pantalla de 320 px, y no cabían ni una tabla ni una fila de formulario. En pantallas estrechas, una hoja va ahora de borde a borde, recuperando el relleno lateral de la página: su contenido tiene el ancho que tenía, y un papel de lado a lado queda bien en un móvil.

**Dos artículos ya estaban rotos.** Al probar a 320 px aparecieron dos artículos que ya se desplazaban de lado antes de todo esto, cada uno por una tabla ancha. La página es un grid, y un elemento de grid no encoge por debajo de su contenido más ancho (`min-width: auto`), así que una tabla hacía la página entera más ancha que el móvil. `min-inline-size: 0` en `<main>` arregló la página; un pequeño paso de la build mete ahora cada tabla en una caja que se desplaza por su cuenta, con `tabindex="0"` y un nombre para que también se pueda desplazar con el teclado.

## Enlaces

- [MDN: `min-width: auto` en elementos de grid](https://developer.mozilla.org/es/docs/Web/CSS/min-width#auto)
- [MDN: `@layer`](https://developer.mozilla.org/es/docs/Web/CSS/@layer) (y por qué ganan los estilos sin capa)
- [Deque: las regiones con desplazamiento deben ser accesibles con teclado](https://dequeuniversity.com/rules/axe/4.10/scrollable-region-focusable)
