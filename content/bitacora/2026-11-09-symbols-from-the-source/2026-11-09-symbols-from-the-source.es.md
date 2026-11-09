---
title: Símbolos HTML, directamente de la fuente
reviewed: false
---

## Qué hicimos

- La segunda herramienta de la caja, Símbolos HTML (`/projects/toolbox/symbols`): búsqueda por palabras, un carácter pegado, `U+2192` o `&rarr;`; 20 grupos en una lista y en una fila de iconos (cada uno es un carácter de su propio grupo); una tarjeta con todas las formas de escribir un símbolo, cada una con su botón de copiar.
- Los datos salen de los propios estándares, no de la tabla de nadie: `scripts/symbols.ts` (`pnpm data:symbols`) descarga `UnicodeData.txt` y `Blocks.txt` de Unicode y `entities.json` de la especificación de HTML, y escribe `symbols.json`: 3169 caracteres, 1431 con nombre HTML, 33 KB comprimidos. Se ejecuta una vez, no en cada build.
- Todo lo demás (referencias decimales y hexadecimales, escapes de CSS y JS, codificación de URL, bytes UTF-8, unidades UTF-16) se calcula a partir del punto de código en `forms()`.
- Las dos fuentes piden un aviso, así que la herramienta les da crédito al pie (`ToolCredits.svelte`), con la licencia de Unicode completa. La regla de la caja en acción: dar crédito a lo que se usa, no a lo que inspiró.
- Pulida con Alfonso: los iconos de grupo, una vista previa al pasar el puntero o el foco mientras no hay nada elegido (pantallas anchas), el carácter que crece al pasar por encima, y la tarjeta fija abajo en el móvil solo cuando se elige un símbolo.

## Qué aprendí

- Ningún conjunto de datos trae juntos nombres, códigos HTML y escapes de CSS, y no hace falta: con el punto de código basta para escribir un carácter de todas las formas posibles.
- W3Schools sirvió de referencia para los grupos, pero sus tablas son contenido suyo: ideas, no datos.
- Los datos también tienen licencia: la Unicode License v3 quiere su aviso "con todas las copias", y los estándares del WHATWG son CC BY 4.0.
- `content-visibility: auto` permite mostrar una lista de 1431 botones sin que la página se ralentice: las fichas fuera de pantalla se saltan la maquetación y el pintado.
- Un radio oculto con `pointer-events: none` no se puede pulsar; estirado de forma invisible sobre su label (`inset: 0; opacity: 0`) recibe clics, foco y flechas.

## Problemas y soluciones

- El grupo de nombres HTML solo mostraba 300 símbolos: el límite pensado para las búsquedas también se aplicaba a los grupos.
- En el móvil, la tarjeta de detalles tapaba media cuadrícula; ahora solo aparece al elegir un símbolo, con un botón de cerrar que devuelve el foco.

## Enlaces

- [Unicode Character Database](https://www.unicode.org/ucd/)
- [Especificación de HTML: referencias de caracteres con nombre](https://html.spec.whatwg.org/multipage/named-characters.html)
- [MDN: `content-visibility`](https://developer.mozilla.org/es/docs/Web/CSS/content-visibility)

## Siguiente

- La herramienta de cursores y selección.
