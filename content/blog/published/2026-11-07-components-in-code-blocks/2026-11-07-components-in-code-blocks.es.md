---
title: 'Componentes en bloques de código'
description: Un bloque de código cuyo lenguaje es el nombre de un componente, con YAML dentro, se convierte en ese componente en mi sitio. En cualquier otro sitio es un bloque de YAML que se puede leer. Y el build comprueba cada campo.
cover: Un bloque de código con la etiqueta de un componente que pasa por un cubo y se convierte en la vista previa de un gráfico.
reviewed: false
---

Mis artículos necesitaban un vídeo, y markdown no tiene sintaxis para eso. Podía escribir el HTML, y lo hice durante un tiempo, pero seis atributos y dos `<source>` en medio de mi texto se leían mal en Obsidian y en GitHub. Así que ahora un vídeo se escribe así:

````md
```video
src: ./awesome-filter.webm
width: 960
height: 540
caption: Al escribir en el cuadro de búsqueda, la lista se filtra mientras tecleas.
```
````

Y en este sitio sale así:

```video
src: ./awesome-filter.webm
width: 960
height: 540
caption: Al escribir en el cuadro de búsqueda, la lista se filtra mientras tecleas.
```

En Obsidian o en GitHub es un bloque de código con YAML: cinco líneas que cualquiera puede leer.

## Por qué un bloque de código

Quería una sintaxis que ya entendieran todas las herramientas de markdown, y los bloques de código con vallas son lo único en lo que todas están de acuerdo. El texto que va después de las tres comillas invertidas se supone que es el lenguaje, y nada impide que sea `video`. Las herramientas que no lo conocen muestran el bloque como texto sin más, lo cual está bien, porque el YAML se lee bien como texto sin más.

La otra forma habitual, las directivas (`::video{src=…}`), necesita un analizador de markdown más moderno que el mío, y Obsidian y GitHub muestran los dos puntos y las llaves tal cual.

## El enganche ya estaba ahí

Mi sitio resalta el código al construirse: mdsvex llama a una función `highlight` por cada bloque de código, con el código y su lenguaje. Así que ahí van los componentes. Antes de resaltar, la función le pregunta a un pequeño registro si el lenguaje es uno de mis componentes:

```ts
async function highlight(code: string, lang: string | null | undefined, file: string) {
	const component = renderBlock(lang, code, file);
	if (component !== undefined) return component;
	// …otherwise, highlight it with Shiki as before
}
```

Cada componente del registro lista sus campos y tiene un `render()` que devuelve marcado. El del vídeo es HTML sin más: el mismo `<video>` que antes escribía a mano, con todos los atributos que si no se me olvidarían (`controls`, `muted`, `playsinline`, `preload="metadata"`). Un componente que necesite JavaScript podría devolver un componente Svelte.

<!-- TODO: Alfonso, qué campo añadirías después, o el siguiente componente que quieres (¿una comparación de antes y después? ¿una demo en vivo?). -->

## El build comprueba el YAML

Una errata en un bloque de código es fácil de pasar por alto: simplemente mostraría lo que no es, o nada. Así que el build lee el YAML y falla, nombrando el artículo, cuando:

- falta un campo obligatorio (un vídeo sin `height`: la página saltaría al cargarlo),
- hay un campo que el componente no tiene (`autoplay: true` falla, a propósito),
- un valor es del tipo equivocado (`width: wide`, o un archivo sin `./` delante).

````text
post.md: the ```video block has no "autoplay" field. Its fields: src, webm, poster, width, height, caption
````

Los archivos con `./` pasan por el mismo paso que las imágenes: cada uno se convierte en un import, así que un archivo que falta también hace fallar el build, y el de verdad recibe un nombre con hash.

## Enlaces

- [mdsvex: resaltado](https://mdsvex.pngwn.io/docs#highlight)
- [MDN: el elemento video](https://developer.mozilla.org/es/docs/Web/HTML/Element/video)
- [El paquete yaml](https://eemeli.org/yaml/)
