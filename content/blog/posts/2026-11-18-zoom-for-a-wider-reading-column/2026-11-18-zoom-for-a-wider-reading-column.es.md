---
title: Zoom para una columna de lectura más ancha, y un control de tamaño de texto
description: A pantalla completa en un monitor grande, mis páginas eran una franja estrecha. Páginas más anchas, una columna de lectura que mantiene 80 caracteres por línea pero crece, un control de tamaño de texto que se recupera antes del primer pintado y una fuente menos.
reviewed: false
---

En un portátil mis páginas se veían bien. A pantalla completa en un monitor grande eran una franja estrecha con márgenes vacíos enormes: todas las páginas tenían un máximo de 70rem, 1120 píxeles.

## Páginas que crecen con la ventana

El ancho de página es un solo token, así que la solución es una línea:

```css
--content-width: clamp(70rem, 82vw, 96rem);
```

El 82 % de la ventana, nunca más estrecho que antes y nunca más de 1536 píxeles. La portada, las listas y las herramientas aprovechan el espacio.

## Una columna de lectura que mantiene 80 caracteres

Los artículos son otra cosa. Una línea de unos 80 caracteres se lee con comodidad; mucho más larga y la vista se pierde al volver al principio de la siguiente. Por eso la columna de lectura mide `80ch`, y en una pantalla grande 80 caracteres a 16 píxeles siguen siendo estrechos.

La respuesta es mantener los 80 caracteres y hacerlos más grandes. `ch` se mide con la fuente del propio elemento, así que una fuente más grande da una columna más ancha. Pero aquí no basta con un `font-size` mayor: los encabezados, el código y el texto pequeño están en `rem`, que no sigue la fuente de la columna, así que el texto normal alcanzaría a los encabezados. El `zoom` de CSS escala todo lo que hay dentro de un elemento por igual: texto, encabezados, código, imágenes y espacios.

```css
@media (min-width: 120rem) {
	main[data-composition='reading'] {
		zoom: 1.25;
	}
}
```

con escalones en 100rem (1,12) y 150rem (1,4). A 1920 píxeles la columna pasa de 700 a 875 píxeles y sigue teniendo 80 caracteres por línea.

![Un artículo a 1920 píxeles: la columna es más ancha y el texto más grande, con unos 80 caracteres por línea](./reading-1920.png 'El mismo artículo a 1920 píxeles de ancho, con zoom 1,25')

## Un control de tamaño de texto

El menú de temas tiene ahora una fila de tamaño de texto: más pequeño, el tamaño en porcentaje, más grande y restablecer, con iconos. Pone una sola propiedad personalizada en `<html>`:

```css
html {
	font-size: calc(var(--text-scale, 1) * 100%);
}
```

Todo en el sitio está en `rem`, así que el texto y los espacios crecen juntos, encima del tamaño que tenga puesto el navegador. La elección se guarda, y un pequeño script en el `<head>` de la página la recupera antes del primer pintado, igual que el tema, para que un tamaño mayor nunca aparezca pequeño primero. Las media queries no se mueven con él: un `rem` en una media query es el tamaño por defecto del navegador, no el de la página.

## Una fuente menos

El Devlog tenía su propia fuente, una manuscrita. Quedaba simpática en un título y cansaba en las entradas largas, así que ya no está. El Devlog se lee con la misma fuente del sistema que todo lo demás, y el sitio descarga un archivo de fuente menos.
