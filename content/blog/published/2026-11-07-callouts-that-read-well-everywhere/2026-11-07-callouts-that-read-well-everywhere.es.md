---
title: Callouts que se leen bien en todas partes
description: GitHub y Obsidian dibujan "> [!note]" como una caja destacada. Un pequeño plugin de rehype hace que mi sitio también la dibuje, y en cualquier otro sitio sigue siendo una cita normal.
cover: La sintaxis de los avisos de markdown convirtiéndose en cajas de nota, advertencia y consejo.
reviewed: false
---

Quería cajas en mis artículos: una sugerencia, una advertencia, un "cuidado, esto se rompe en GitHub Pages". Hay dos formas de conseguirlas, y solo una se sigue leyendo bien cuando el markdown no está en mi sitio.

## Una sintaxis, tres sitios

Escribo mis artículos en Obsidian, viven en GitHub y se publican aquí. GitHub ("alerts") y Obsidian ("callouts") ya se ponen de acuerdo en una sintaxis: una cita cuya primera línea es `[!type]`.

```md
> [!tip]
> Prueba el build de producción, no el de desarrollo: desarrollo no tiene ruta base.
```

Que sale así:

> [!tip]
> Prueba el build de producción, no el de desarrollo: desarrollo no tiene ruta base.

En cualquier sitio que no conozca la sintaxis, un editor normal u otro sitio con markdown, es una cita con `[!tip]` en la primera línea. Se sigue leyendo. La otra sintaxis habitual, `:::tip`, muestra los dos puntos en GitHub y en Obsidian.

GitHub tiene cinco tipos: `note`, `tip`, `important`, `warning` y `caution`. Obsidian además deja que el resto de la primera línea sea un título:

```md
> [!warning] No en GitHub Pages
> No puede poner cabeceras, así que cada archivo se guarda en caché diez minutos.
```

> [!warning] No en GitHub Pages
> No puede poner cabeceras, así que cada archivo se guarda en caché diez minutos.

## Dónde se ejecuta el plugin

mdsvex convierte un artículo en un componente Svelte por pasos: texto markdown → un árbol de markdown → un árbol de HTML → código Svelte. Un plugin puede cambiar cualquiera de los dos árboles: los plugins de **remark** trabajan sobre el árbol de markdown, y los de **rehype** sobre el de HTML.

Hay plugins de remark para callouts, pero mdsvex 0.12 trae un analizador de markdown antiguo y no funcionan con él. En cambio, el árbol de HTML tiene la misma forma en todas las versiones, así que el mío es un plugin de rehype, como el `rehype-slug` que ya uso para los id de los encabezados.

Cuando se ejecuta, `> [!tip]` ya es esto:

```html
<blockquote>
	<p>[!tip] Test the production build…</p>
</blockquote>
```

Así que el plugin busca las citas cuyo primer párrafo empieza con `[!type]` y las convierte en un `<aside>`: primero el tipo (o el título propio), y luego el resto.

> [!note] Una sorpresa en el árbol
> El analizador antiguo lee `[!tip]` como un enlace a una referencia llamada `!tip`. No hay ninguna, así que devuelve el texto, pero como un nodo de texto propio. El plugin junta el texto del principio del párrafo antes de mirarlo.

## No solo el color

Cada tipo tiene un color, pero el color no puede ser la única forma de distinguirlos: quien no lo ve, o un lector de pantalla, no recibe nada. Así que la caja siempre dice su tipo con palabras, "Sugerencia", y además tiene un icono. Con un título propio el tipo sigue ahí, como texto oculto a la vista delante de él: un lector de pantalla lee "Advertencia: No en GitHub Pages".

Los cinco colores son tokens (`--callout-tip`…), de los mismos pasos que mis colores de código, así que ya pasan 5,3:1 sobre el fondo de la caja en los dos temas.

## Un tipo equivocado hace fallar el build

Obsidian tiene más tipos que GitHub (`info`, `bug`, `quote`…). En GitHub esos se ven como citas normales, así que prefiero enterarme: `> [!info]` hace fallar el build, nombrando el archivo y listando los cinco tipos.

> [!caution]
> Ya no se puede escribir una cita que de verdad empiece por `[!algo]`. De momento no lo he necesitado.

**Actualización (2026-11-11):** mdsvex y su parser antiguo ya no están, ni el plugin de rehype ni la unión de nodos de texto. marked deja `[!tip]` y el título en un solo token de texto, así que una pasada mía por sus tokens convierte la cita en un token `callout`, y dos componentes pequeños de Svelte lo dibujan. La misma sintaxis, el mismo HTML, las mismas reglas.

## Enlaces

- [Las alerts de GitHub](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)
- [Los callouts de Obsidian](https://help.obsidian.md/callouts)
- [rehype](https://github.com/rehypejs/rehype) y el [árbol de HTML sobre el que trabaja (hast)](https://github.com/syntax-tree/hast)
