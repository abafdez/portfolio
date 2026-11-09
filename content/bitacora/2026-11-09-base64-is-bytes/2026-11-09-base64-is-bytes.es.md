---
title: Base64 codifica bytes, no texto
reviewed: false
---

## Qué hicimos

- La primera herramienta de la caja, Base64 (`/projects/toolbox/base64`): texto ↔ Base64 en UTF-8, con una opción apta para URLs (base64url), y un archivo → data URL con su tamaño, una vista previa para las imágenes y un fragmento de CSS. Cada resultado tiene un botón de copiar.
- La escribimos desde cero en vez de portar la de Omatsuri. Su worker llamaba a `btoa()` con el texto tal cual, y con un SVG enviaba dos resultados (no hay `else` entre la rama del SVG y la general).
- La lógica está en `base64.ts` con 19 tests unitarios (`base64.test.ts`); el formulario es `Base64.svelte`.
- Al pasar de Codificar a Decodificar, el resultado se convierte en la nueva entrada, así que "ñ" vuelve.
- Decodificar perdona lo que se pega: espacios, saltos de línea, base64url, `=` que faltan y una data URL entera.
- Archivos de hasta 2 MB. Los más grandes reciben un mensaje: una data URL es para iconos, no para fotos.

## Qué aprendí

- Base64 convierte bytes en texto, 3 bytes en 4 caracteres (un tercio más). El texto primero tiene que convertirse en bytes, y en la web eso es UTF-8 (`TextEncoder`).
- `btoa()` no recibe texto: recibe una "cadena binaria", un carácter por byte (códigos 0–255). `btoa('ñ')` da `8Q==`, su byte en Latin-1, no el `w7E=` de UTF-8, y `btoa('😀')` lanza un error.
- `new TextDecoder('utf-8', { fatal: true })` lanza un error con bytes que no son UTF-8 en vez de convertirlos en "�". Así la herramienta distingue "no es Base64" de "es Base64, pero no texto" (el principio de un PNG).
- `Uint8Array.prototype.toBase64()` se saltaría la cadena binaria, pero ni Node 22 (CI) ni 24 lo tienen todavía.
- Un input de archivo estirado sobre su label con `opacity: 0` recibe los clics y los archivos soltados de forma nativa: sin código de soltar, un solo manejador de `change`.
- `FileReader` ya es asíncrono, así que la página no se congela mientras lee: no hace falta un worker para archivos pequeños.

## Enlaces

- [MDN: Base64](https://developer.mozilla.org/es/docs/Glossary/Base64)
- [MDN: `btoa()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/btoa)
- [MDN: `TextDecoder` `fatal`](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/fatal)
- [RFC 4648: base64url](https://www.rfc-editor.org/rfc/rfc4648#section-5)

## Siguiente

- Paso 2: eventos de teclado.
