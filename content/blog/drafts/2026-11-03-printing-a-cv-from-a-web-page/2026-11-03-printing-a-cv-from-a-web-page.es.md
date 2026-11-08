---
title: 'Imprimir un CV desde una página web'
description: Mi generador de CV hace su PDF con el propio diálogo de impresión del navegador. Una hoja de estilos de impresión, el tema claro en el papel y un título de página que se convierte en el nombre del archivo.
reviewed: false
---

Mi generador de CV no genera PDFs. Ya lo hace el navegador: "Guardar como PDF" en el diálogo de impresión da un PDF con texto de verdad, que se puede seleccionar, que es lo que necesitan los sistemas de seguimiento de candidaturas (ATS). Mi trabajo es una hoja de estilos de impresión que deje solo el CV en la página.

<!-- TODO: una captura de la vista previa de impresión junto a la página -->

## Ocultar el sitio

La cabecera, el pie y la rejilla del fondo se ocultan solos:

```css
@media print {
	header {
		display: none;
	}
}
```

Cada uno en su propio componente, no en mi hoja de estilos global. Mi CSS global vive en cascade layers, y los estilos de los componentes no tienen capa, así que ganan a cualquier capa, sea cual sea la especificidad. Un `display: none` global perdería ante cualquier `display` que un componente se ponga a sí mismo.

<!-- TODO: probar la regla en global.css y contar qué se imprimió -->

## El papel es blanco

Los navegadores dejan fuera los fondos al imprimir, pero mantienen los colores del texto. En mi tema oscuro, el texto es gris claro, así que sobre el papel blanco apenas se veía. Cada token de color es un `light-dark()`, así que una línea pasa todo el sitio a su tema claro en el papel:

```css
@media print {
	:root,
	[data-theme] {
		color-scheme: light;
	}
}
```

Va al final del archivo: el `[data-theme='dark']` del selector de tema tiene la misma especificidad, y con la misma especificidad gana la regla de después.

## La hoja

```css
@page {
	size: A4;
	margin: 15mm;
}
```

Dentro del CV, tamaños en puntos y dos reglas sobre los saltos de página: un encabezado nunca se queda solo al final de una página (`break-after: avoid`), y una línea de habilidades nunca se parte en dos (`break-inside: avoid`).

## El nombre del archivo

El navegador nombra el PDF según el título de la página, así que mientras el diálogo de impresión está abierto, el título es el del CV:

```ts
function beforePrint() {
	pageTitle = document.title;
	document.title = `${fullName || 'CV'} - CV - ${profile.name}`;
}
```

con `afterPrint` devolviéndolo a su sitio, los dos en `<svelte:window onbeforeprint onafterprint>`.

## Un cambio de última hora

A veces quiero cambiar una línea para una candidatura concreta, sin tocar mis datos guardados. El CV es `contenteditable`, así que puedo hacer clic dentro y escribir; el diálogo de impresión imprime la página tal como está, con lo escrito incluido.

Pero Svelte no sabe nada de lo que escribo ahí. Cuando cambia el formulario, solo actualiza el texto que escribió él, y el mío acabaría mezclado, o fallaría en un trozo de la página que yo hubiera borrado. Así que el CV se reconstruye desde cero:

```svelte
{#key shown}
	<article class="cv" contenteditable="true" onpaste={pastePlain}>…</article>
{/key}
```

`shown` es una cadena JSON con todo lo que muestra el CV. Cualquier cambio en el formulario la cambia, y `{#key}` tira el CV anterior. La pista bajo los botones lo dice.

Quería `contenteditable="plaintext-only"`, que ya hace que lo pegado desde Word sea texto plano. Pero entonces Chrome fuerza `white-space: pre-wrap` en todo lo que hay dentro, incluso por encima de un `!important` en línea, y los saltos de línea entre los bloques de mi plantilla se imprimían como líneas en blanco. Así que es `"true"`, más un manejador del pegado que inserta solo el texto plano del portapapeles.

<!-- TODO: editar una línea, imprimir y luego cambiar un campo: contar qué pasó -->

<!-- TODO: abrir el PDF, seleccionarlo todo y pegarlo en un editor de texto: ¿está en orden? -->
