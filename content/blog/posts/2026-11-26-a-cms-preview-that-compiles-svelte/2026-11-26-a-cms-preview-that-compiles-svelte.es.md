---
title: Una vista previa del CMS que compila Svelte en el navegador
description: 'Cuando mis artículos pasaron a ser componentes de Svelte, la vista previa del CMS no tenía nada que montar hasta compilarlos. Así que los compila, en el navegador, igual que la construcción: mdsvex, luego el compilador de Svelte, luego un módulo cuyos imports apuntan a las copias del propio CMS. Los 72 artículos se ven en la vista previa exactamente como en el sitio.'
reviewed: false
---

Mi CMS, [Sveltia](https://sveltiacms.app), muestra una vista previa junto al editor. Hasta ahora montaba en ese panel el componente de markdown del propio sitio, así que lo que veía mientras escribía lo dibujaba el mismo código que la página. Luego pasé mis artículos a [mdsvex](https://mdsvex.pngwn.at) 1.0, donde cada artículo se compila en un componente de Svelte, y la vista previa se encontró con un problema: no hay componente que montar hasta que el artículo está compilado.

Esta era la pregunta que podía acabar con el cambio. Si la vista previa no podía seguir, me habría quedado donde estaba.

## Compilar en el navegador

Dos piezas lo hacen posible. `mdsvex/compile` no importa nada de Node, así que funciona en un navegador. Y el compilador de Svelte también: es lo que usa el [playground de Svelte](https://svelte.dev/playground). Así que la vista previa hace lo mismo que la construcción, unos 150 ms después de que deje de escribir:

```text
markdown --mdsvex compile()--> Svelte source --svelte/compiler--> a JS module --> mount()
```

Las opciones vienen de un archivo que usan los dos, así que la construcción y la vista previa no pueden separarse: ids de los títulos, mis plugins de análisis, el plugin de enlaces externos y el resaltador con los mismos lenguajes.

## Imports que un navegador no puede resolver

El módulo compilado empieza como cualquier componente compilado:

```js
import * as $ from 'svelte/internal/client';
import { h2 as H2_MDSVEX_G, pre as Pre_MDSVEX_G } from 'preview:components';
```

En una construcción, Vite resuelve esos nombres. En el navegador, un módulo cargado desde una cadena no tiene a quién preguntar. Y además no debe tener su propia copia de Svelte: el módulo tiene que usar el mismo motor de Svelte que el CMS que lo monta.

Así que, para cada nombre que puede importar, la vista previa crea un módulo diminuto que entrega la copia del propio CMS:

```js
const m = globalThis.__previewModules['svelte/internal/client'];
const v0 = m['mount'];
const v1 = m['await'];
export { v0 as 'mount', v1 as 'await' /* …every export */ };
```

Las exportaciones pasan por variables locales porque una de las funciones del motor de Svelte se llama `await`, y `export const { await }` no es JavaScript válido. Fue el primer error con el que me topé. Cada uno de esos módulos se convierte en una URL `blob:`, los imports del principio del código compilado se reescriben para apuntar a ellos y el resultado se carga con `import()`. Solo los del principio: un artículo sobre imports tiene las mismas palabras más abajo, en sus bloques de código.

Otra sorpresa: Svelte rechaza `import 'svelte/internal/client'` dentro de un archivo `.svelte.ts`. Es privado y cambia sin avisar. Un archivo `.ts` normal sí puede importarlo. El compilador y el motor vienen del mismo paquete, así que siempre coinciden; el riesgo es que Svelte cierre esa puerta algún día, algo poco probable mientras su propio playground la necesite.

## Archivos e idioma desde el CMS

En el sitio, una imagen junto al artículo es un import, y el idioma de los enlaces viene de la página. En la vista previa, los archivos vienen de Sveltia (`getAsset()`, que responde con una URL vacía mientras lee el archivo), y el idioma es el del archivo. Ambos llegan a los componentes del artículo mediante contextos de Svelte, que `mount()` acepta, así que los mismos componentes sirven para la página y para la vista previa.

## Exactamente igual, medido

Con el backend de prueba de Sveltia, un script pegó cada uno de mis 72 artículos publicados en una entrada nueva y comparó la vista previa con la página construida, bloque a bloque y token a token en cada bloque de código: **72 de 72 idénticos.** Una compilación en caliente tarda unos 6 ms, 45 ms en el peor caso.

Los errores aparecen antes de guardar, como "The build would stop here": un tipo de aviso desconocido, HTML en el texto, un bloque con un campo mal escrito.

## Las llaves se ejecutan en el sitio, no en la vista previa

En mdsvex, `{…}` en una frase es una expresión de Svelte, y la vista previa _ejecuta_ lo que compila. En una construcción no hace daño. En el CMS, se ejecutaría en la página donde está guardado mi token de GitHub: un artículo que alguien me enviara, abierto en el flujo editorial, podría leerlo. Al principio prohibí las llaves del todo. Ahora una expresión simple está permitida en un artículo, y la vista previa la enseña como código, su fuente, en lugar de ejecutarla: `{metadata.title}` se lee `metadata.title` mientras escribo, y como el título en el sitio. Los bloques y etiquetas de Svelte (`{#if}`, `{@html}`) siguen haciendo fallar la construcción y la vista previa, igual que el HTML.

## El coste

Unos 490 kB comprimidos más que la vista previa anterior: el compilador de Svelte, el de mdsvex y sus gramáticas. Solo los descarga quien abre el CMS, una vez, en un CMS que ya pesa 23 MB. Quien visita el sitio no recibe nada de eso.

## Enlaces

- [El compile de mdsvex](https://mdsvex.pngwn.at/docs/reference/compile)
- [compile y mount de Svelte](https://svelte.dev/docs/svelte/svelte-compiler)
- [Sveltia CMS](https://sveltiacms.app)
