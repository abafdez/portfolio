---
title: Imprimir el CV, y una copia de seguridad en JSON
reviewed: false
---

## Qué hicimos

- "Imprimir o guardar como PDF" en `/projects/cv`. Una hoja de estilos de impresión solo conserva el CV: A4, márgenes de 15mm, tamaños en puntos, sin tarjeta, encabezados que nunca se quedan solos al final de una página (`break-after: avoid`) y líneas que nunca se parten (`break-inside: avoid`).
- La cabecera, el pie y los planos se ocultan solos en papel, en todo el sitio, cada uno en su propio `<style>`. La ruta del CV oculta la cabecera del proyecto.
- `tokens.css` pasa al tema claro para imprimir (`color-scheme: light` en `:root, [data-theme]`, al final del archivo).
- Mientras se imprime, el título de la página es "Nombre Apellidos - CV - Perfil", así que el PDF recibe ese nombre (`beforeprint` / `afterprint`).
- "Exportar datos" descarga `cv-details.json`. "Importar datos" lo vuelve a cargar con el mismo `read()` que `localStorage`, que ahora devuelve cuántos campos ha cogido.
- Más tarde: la vista previa del CV es `contenteditable`, para un cambio de última hora justo antes de imprimir, con una pista bajo los botones. No se guarda: el CV está en un `{#key}` sobre una instantánea en JSON de todo lo que muestra, así que cualquier cambio en el formulario lo reconstruye a partir del formulario. Al pegar solo se conserva el texto (`onpaste`). Pulsar Ctrl+P mientras se escribe le quita primero el foco al CV (sin cursor en el papel), y al imprimir desaparece el anillo de foco.
- Probado: el PDF hecho desde una pantalla en tema oscuro es una página A4, negro sobre blanco, con texto de verdad en el orden de lectura.

## Qué aprendí

- Los estilos de los componentes no tienen capa, así que ganan a todo lo que está en las capas de `global.css`. Un componente que debe ocultarse en papel lo dice en su propio `<style>`.
- Los navegadores quitan los fondos al imprimir pero mantienen los colores del texto: sin el tema claro, el texto del tema oscuro se imprime en gris claro. Un solo `color-scheme` cambia todos los tokens con `light-dark()`. Tiene la misma especificidad que `[data-theme='dark']`, así que tiene que ir después.
- Una descarga hecha en la página: `Blob` → `URL.createObjectURL()` → un enlace con `download` → clic → `revokeObjectURL()`, o el Blob se queda en memoria hasta que se cierra la pestaña.
- `file.text()` lee un archivo elegido sin subirlo. `event.currentTarget` es `null` después de un `await`, así que primero hay que guardarlo en una variable. Después hay que vaciar el input, o al elegir otra vez el mismo archivo no se lanza `change`.
- Dentro de un `<form>`, un `<button>` sin `type="button"` lo envía.
- Svelte no sabe nada del texto escrito en un `contenteditable`: solo actualizaría el texto que escribió él y dejaría el mío mezclado, o fallaría en un nodo que yo hubiera borrado. `{#key}` tira el bloque y lo reconstruye.
- `contenteditable="plaintext-only"` ya hace que lo pegado sea texto plano, pero entonces Chrome fuerza `white-space: pre-wrap` en todo lo que hay dentro, incluso por encima de un `!important` en línea, y los saltos de línea entre los bloques de la plantilla se imprimían como líneas en blanco. `contenteditable="true"` más un `onpaste` que inserta `text/plain` hace el mismo trabajo. `execCommand('insertText')` está obsoleto, pero es la única forma de insertar texto que Ctrl+Z puede deshacer.

## Problemas y soluciones

- La comprobación rápida de este paso sigue pendiente (por qué la regla de impresión vive en `Header.svelte`; por qué `currentTarget` se guarda antes del `await`).

## Enlaces

- [MDN: imprimir](https://developer.mozilla.org/es/docs/Web/CSS/CSS_media_queries/Printing)
- [MDN: @page](https://developer.mozilla.org/es/docs/Web/CSS/@page)
- [MDN: break-after](https://developer.mozilla.org/es/docs/Web/CSS/break-after)
- [MDN: URL.createObjectURL()](https://developer.mozilla.org/es/docs/Web/API/URL/createObjectURL_static)
- [MDN: Blob.text() / File](https://developer.mozilla.org/es/docs/Web/API/Blob/text)

## Siguiente

- Imprimir un CV para cada perfil desde mi propio navegador, y comprobar que al seleccionar todo su texto sale el CV en orden.
