---
title: Demos en vivo en mis artículos, y un sandbox para verlas en la vista previa
description: 'Un bloque de código de mis artículos ahora puede ejecutarse: la página enseña lo que hace el código encima del propio código. En el CMS, donde vive mi token de GitHub, la misma demo se ejecuta en un marco aislado que no puede alcanzarlo.'
reviewed: false
---

El motivo por el que pasé mis artículos a [mdsvex](https://mdsvex.pngwn.at) fue este: un artículo sobre un componente debería poder enseñar el componente, funcionando, junto a su código. mdsvex lo llama [código que se ejecuta](https://mdsvex.pngwn.at/docs/reference/code-that-runs). Escribe `run` después del lenguaje de un bloque de código, y el bloque se muestra como código y además es un módulo que la página importa.

:::demo[Un contador]

```svelte run
<script>
	let count = $state(0);
</script>

<button onclick={() => count++}>Pulsado {count} {count === 1 ? 'vez' : 'veces'}</button>
```

El botón de arriba es el código de abajo, compilado con el resto del artículo y funcionando en esta página.

:::

## Cómo lo enseña la página

mdsvex pasa el módulo del bloque al componente que dibuja mis bloques de código, y ese componente decide qué significa ejecutarlo. Para un bloque de Svelte, dibuja su componente encima del código, en una región que un lector de pantalla llama "Demo en vivo". Para un script, llama a la exportación por defecto y enseña lo que devuelve:

```ts run
export default () =>
	new Intl.DateTimeFormat('es-ES', { dateStyle: 'full' }).format(new Date(2026, 10, 27));
```

La demo es parte de la página: se renderiza en el servidor con el resto del artículo y se vuelve interactiva cuando se ejecuta el JavaScript de la página. Sus estilos tienen alcance propio, como los de cualquier componente.

## Una demo que espera

Hay código que solo puede ejecutarse en un navegador, o que pesa lo bastante como para no cargarlo hasta que alguien lo quiera. `run=client` lo deja fuera de la página y pone un botón en su lugar:

```js run=client
export default () => `Esta ventana mide ${innerWidth} píxeles de ancho.`;
```

## Un marco alrededor

`:::demo[Un título]` alrededor de un bloque y su explicación dibuja una ventana, con el título en la barra, como el contador del principio.

## En el CMS: un sandbox

Mi CMS enseña una vista previa junto al editor, y compila cada artículo en el navegador, igual que la construcción. Una demo es código que escribió el autor del artículo, y la vista previa se ejecuta en la página donde está guardado mi token de GitHub. Por eso las llaves están prohibidas en mis artículos. Ejecutar demos ahí desharía esa regla: un artículo que alguien me enviara podría leer el token.

Así que en la vista previa una demo nunca se ejecuta en la página del CMS. Se ejecuta en un marco:

```html
<iframe sandbox="allow-scripts" src="/admin/demo.html"></iframe>
```

`sandbox` le quita todo al marco, y `allow-scripts` le devuelve solo los scripts. Lo que importa es lo que falta: sin `allow-same-origin`, el marco recibe un origen opaco. Para el navegador es un sitio aparte, sin almacenamiento ni cookies, que no puede tocar la página que lo rodea. Tampoco puede abrir ventanas ni navegar la pestaña.

El CMS compila la demo con el compilador de Svelte y envía el JavaScript al marco. La página de dentro lo importa con su propia copia de Svelte y lo monta. Devuelve su altura para que el marco crezca a su medida, y cualquier error como texto. Son los dos únicos mensajes que el CMS le acepta.

Para comprobarlo, previsualicé una demo que intenta todo lo que no debería:

```text
storage blocked (SecurityError) | parent blocked (SecurityError) | cookie blocked (SecurityError) | top blocked (SecurityError)
```

Leer `localStorage`, meterse en la página del CMS, leer las cookies y mandar la pestaña entera a otro sitio: todo falla. Chrome añade su propia línea sobre lo último: el marco "is sandboxed" y no puede navegar la ventana principal.

Dos detalles que no esperaba. Los scripts de módulo en un marco de origen opaco se piden con CORS, como si vinieran de otro sitio, así que el servidor tiene que permitir el origen `null`: GitHub Pages ya envía `Access-Control-Allow-Origin: *`, y el servidor de desarrollo necesitó un ajuste. Y mi primera versión nunca llegó a ejecutarse: Sveltia dibuja su vista previa en un marco propio, así que la ventana que enviaba la demo no era la madre del marco, y el marco la ignoraba. Ahora responde a la ventana que se lo pidió.

Los bloques de script no se ejecutan en la vista previa: una línea dice que el resultado sale en la página publicada. Una demo de Svelte, el caso que me importa, funciona ahí igual que en el sitio.

## Enlaces

- [mdsvex: código que se ejecuta](https://mdsvex.pngwn.at/docs/reference/code-that-runs)
- [MDN: el atributo `sandbox` de `<iframe>`](https://developer.mozilla.org/es/docs/Web/HTML/Reference/Elements/iframe#sandbox)
- [MDN: los orígenes opacos](https://developer.mozilla.org/es/docs/Glossary/Origin)
