---
title: Los colores del código como clases, no como estilos en línea
description: Mis bloques de código llevaban un atributo style en cada palabra, escrito por Shiki a partir de un archivo de tema. Ahora twinkleplop da a cada token una clase y el CSS del sitio lo colorea. Comparé las dos versiones carácter a carácter antes de quedármelo.
reviewed: false
---

Mis artículos tienen mucho código, y cada bloque lo coloreaba [Shiki](https://shiki.style) al construir el sitio. Funcionaba bien, pero tenía dos costumbres que nunca me gustaron. Escribía el color en cada token, como `style="color:var(--code-keyword)"`, así que los colores vivían en el HTML en lugar de en el CSS. Y cargaba sus lenguajes de forma asíncrona, así que antes de dibujar un artículo había que reunir los lenguajes que usaba y esperarlos.

[twinkleplop](https://twinkleplop.pngwn.at/docs) es un resaltador de pngwn, el autor de mdsvex, y hace las dos cosas de otra manera.

## Clases en lugar de colores

twinkleplop escribe una clase según lo que es cada token, con los mismos nombres en todos los lenguajes:

```html
<span class="tok keyword">const</span> <span class="tok constant">a</span>
<span class="tok operator">=</span> <span class="tok number">1</span>
```

No hay archivo de tema que cargar. Mi CSS decide cómo se ve una palabra clave, con los mismos tokens `--code-*` que usaba el tema de Shiki, así que todos los temas de color del sitio siguen funcionando sin tocar el resaltador:

```css
.prose .code-block .tok {
	&.comment {
		color: var(--code-comment);
	}
	&:is(.keyword, .expression, .directive) {
		color: var(--code-keyword);
	}
	&:is(.string, .template, .regex, .inserted) {
		color: var(--code-string);
	}
}
```

Unas treinta clases se reparten entre ocho tokens. El tema TextMate que había escrito para Shiki, un archivo de ámbitos y colores, ha desaparecido, y con él unos cientos de atributos `style` por artículo.

## Síncrono, así que no hay nada que esperar

Cada lenguaje de twinkleplop es una función que convierte código en HTML, lista en cuanto se importa su módulo. Los lenguajes de Shiki se cargaban con una promesa, y por eso mi proceso de markdown tenía un paso que listaba los lenguajes de cada artículo y los esperaba antes de dibujarlo, al construir y otra vez en la vista previa del CMS. Ese paso, sus tipos y el `await` de la vista previa se han ido.

## La misma clase no significa lo mismo en todas partes

En el primer intento, el 80 % de los caracteres quedaba del color que les daba Shiki. La mayor diferencia venía de una clase que significa cosas distintas según el lenguaje: `property` es cada `obj.name` en TypeScript, donde lo quiero sin color; `identifier` en CSS es una palabra de valor como `none`, que quiero como constante; en YAML es un valor, que se lee mejor como texto.

Así que el marco del bloque dice qué lenguaje contiene, `data-lang="ts"`, y unas pocas reglas dependen de eso:

```css
.prose .code-block {
	&:is([data-lang='ts'], [data-lang='js'], [data-lang='svelte']) .tok:is(.property, .constant) {
		color: var(--code-foreground);
	}
	&[data-lang='css'] .tok.identifier {
		color: var(--code-constant);
	}
}
```

## Comparado antes de quedármelo

No quería juzgarlo mirando tres artículos. Un pequeño script leyó todos los bloques de código de la versión antigua y de la nueva, carácter a carácter: el texto y el color que acababa teniendo cada carácter.

- **Ningún bloque cambió de texto** en 67 páginas con código.
- **El 86,9 % de los 48.912 caracteres que no son espacios conserva su color.** TypeScript 93 %, JavaScript 99,6 %, YAML 99,4 %, HTML 99,7 %, JSON 97 %.
- **Los diffs mejoraron**: Shiki con mi tema los dejaba en gris; ahora las líneas añadidas salen en verde y las quitadas en rojo.
- **Algunos empeoraron**: bash no tiene tokens de comandos (17,5 %), la gramática de Svelte lee `<script lang="ts">` como JavaScript, y en un fragmento de CSS sin selector, funciones como `oklch()` dentro de una propiedad personalizada toman el color de los selectores. Esto último parece un fallo de la gramática que merece la pena avisar.

Los colores son cuestión de gusto; el texto no. Saber que nada del código había cambiado fue lo que me dejó aceptar el resto.

## Por qué se quedó

Por sí solo, no habría cambiado por esto. Vino con un cambio mayor: volví a pasar mis artículos a [mdsvex](https://mdsvex.pngwn.at), que resalta con twinkleplop, así que mi propio código de resaltado y sus once paquetes de lenguajes también se fueron. Lo que me quedé es lo que quería: los colores en el CSS, donde ya está el resto de colores del sitio.

## Enlaces

- [La documentación de twinkleplop](https://twinkleplop.pngwn.at/docs)
- [Shiki](https://shiki.style), que hizo el trabajo hasta ahora
