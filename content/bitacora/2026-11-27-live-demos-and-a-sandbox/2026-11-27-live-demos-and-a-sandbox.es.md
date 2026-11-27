---
title: Demos en vivo, y un sandbox para la vista previa del CMS
reviewed: false
---

## Qué hicimos

- **Bloques de código que se ejecutan.** ` ```svelte run ` convierte el bloque en un módulo que la página importa; `markdown/Pre.svelte` dibuja su componente encima del código, en una región llamada "Demo en vivo". En un bloque ` ```ts run ` se llama a la exportación por defecto y se enseña el resultado; `run=client` espera a un botón "Ejecutar la demo". `:::demo[Título]` enmarca una demo en una ventana.
- La demo y su bloque de código comparten un marco fuera del `<figure>`: la comprobación de accesibilidad de Svelte decía que un `<figcaption>` tiene que ser el primero o el último. Los bloques de código normales conservan exactamente su marcado de antes.
- **En la vista previa del CMS, las demos se ejecutan en un sandbox.** El módulo de cada demo es `SandboxDemo.svelte`, que compila la demo y envía el JavaScript a un `<iframe sandbox="allow-scripts">` que carga `demo.html`; la página de dentro lo monta con su propia copia de Svelte y devuelve su altura y cualquier error. Los bloques de script no se ejecutan ahí; una línea lo dice.
- `cms/blob-modules.ts` reúne la reescritura de imports que comparten la vista previa y el marco. La página del marco es una segunda entrada de la construcción del CMS; `scripts/serve.ts` envía `Access-Control-Allow-Origin: *` como GitHub Pages.
- Probado: una demo hostil en la vista previa recibió `SecurityError` al leer `localStorage`, `parent.document` y `document.cookie`, y al navegar `top`; la demo del contador funcionó en su marco; y la página del marco construida también funcionó desde un origen opaco. Un borrador cuenta la historia, en los dos idiomas.

## Qué aprendí

- `sandbox="allow-scripts"` sin `allow-same-origin` le da al marco un **origen opaco**: sin almacenamiento, sin cookies, sin acceso a la página que lo rodea y sin poder navegar la pestaña (Chrome escribe "Unsafe attempt to initiate navigation").
- Un origen opaco envía `Origin: null`, y los scripts de módulo se piden con CORS, así que el servidor tiene que permitirlo. GitHub Pages ya envía `*`; el servidor de desarrollo de Vite necesitó `'null'` en `server.cors`.
- `postMessage` desde el código de un marco va a la ventana sobre la que lo llamas, y `event.source` es la ventana cuyo código lo envió, no el marco que contiene el elemento.

## Problemas y soluciones

- El primer sandbox no ejecutaba nada: Sveltia dibuja su vista previa en un marco propio, así que quien enviaba la demo era el código del CMS (en la ventana principal), no la madre del marco, y el marco lo ignoraba; sus respuestas iban a `parent`, donde nadie escuchaba. Ahora acepta a su madre o a la ventana principal y responde a quien se lo pidió.
- Un `{#if}` en su propia línea añadía un nodo de espacio a cada bloque de código; ahora la demo vive fuera del figure, así que nada cambió para los bloques normales.

## Enlaces

- [mdsvex: código que se ejecuta](https://mdsvex.pngwn.at/docs/reference/code-that-runs)
- [MDN: `sandbox` de iframe](https://developer.mozilla.org/es/docs/Web/HTML/Reference/Elements/iframe#sandbox)

## Siguiente

- El artículo sobre las llaves (qué podrían hacer `{ }`, que siguen prohibidas), y luego page-data y un feed RSS.
