---
title: 'Un formulario que recuerda, con una clase $state y localStorage'
description: Mi generador de CV guarda lo que escribo en el navegador, nunca en un servidor. Un objeto $state, un $effect para guardarlo y un select que me enseñó que los eventos no siempre llegan en el orden que creo.
cover: Un currículum con flechas hacia formularios.
reviewed: false
---

Estoy construyendo una herramienta en este sitio que genera un CV para cada tipo de empleo al que me presento. Las habilidades salen de los propios datos del sitio. La parte personal (nombre, teléfono, correo, dónde vivo, una carta breve) no puede ir en el repositorio ni en el build: este es un sitio público. Así que se escribe en un formulario y se queda en el navegador, en `localStorage`.

<!-- TODO: una captura del formulario con el CV al lado (con datos inventados) -->

## Un objeto, no un estado por campo

Los valores del formulario viven en una clase, como un único objeto `$state`:

```ts
export class CvDetails {
	values: Details;
	loaded = $state(false);

	constructor(profiles: string[]) {
		const empty = Object.fromEntries(fields.map((field) => [field, ''])) as Details;
		this.values = $state({ ...empty, profile: profiles[0] });
	}
}
```

Un objeto `$state` es un proxy profundo, así que cada input puede enlazarse directamente a él (`bind:value={cv.values.name}`), y `JSON.stringify(cv.values)` da todos los campos. Si cada campo fuera su propio `$state` en la clase, Svelte los convertiría en getters y setters en el prototipo, y `JSON.stringify` no mira ahí: daría `{}`.

## Cargar: en el navegador, después de la hidratación

```ts
onMount(() => cv.load());
```

No en el constructor. La página se prerenderiza al construir el sitio, donde `localStorage` no existe. Y en el navegador, el primer renderizado tiene que coincidir con el HTML prerenderizado; `onMount` se ejecuta después.

Lo que lee `load()` pasa por `read(data: unknown)`, que solo se queda con los campos que conoce, solo con texto y solo con un perfil que siga existiendo. Son mis propios datos, pero `localStorage` pertenece al origen, y todos los proyectos que publico en `abafdez.github.io` lo comparten.

<!-- TODO: meter basura en localStorage desde DevTools, recargar y contar qué conservó read() -->

## Guardar: el bug que lo convirtió en un $effect

Mi primera versión guardaba desde el formulario:

```svelte
<form oninput={() => cv.save()}>
```

Los eventos input suben por el árbol, así que un solo manejador cubría todos los campos. Escribir funcionaba. Cambiar el perfil en el `<select>` guardaba el perfil que tenía _antes_. Un select lanza `input` y luego `change`, y Svelte actualiza `bind:value` de un select en `change`. Mi guardado se ejecutaba en medio.

Guardar en `localStorage` es mantener algo de fuera de Svelte al día con el estado, que es justo para lo que sirve `$effect`:

```ts
$effect(() => {
	if (cv.loaded) cv.save();
});
```

`save()` convierte todos los campos a texto, así que el efecto depende de todos y vuelve a ejecutarse cuando cambia cualquiera, sea cual sea el evento que lo cambió. El `if (cv.loaded)` es importante: sin él, un efecto que se ejecutara antes de `load()` guardaría el formulario vacío encima de lo que tenía.

<!-- TODO: qué habría hecho para encontrar el bug del select sin que me lo dijeran -->

## Detalles que hace el formulario

- `autocomplete="given-name"`, `"tel"`, `"postal-code"`: el navegador se ofrece a rellenarlos.
- `type="email"`, `type="tel"`, `inputmode="numeric"`: el teclado adecuado en el móvil.
- `onsubmit={(event) => event.preventDefault()}`: un formulario sin `action` envía sus campos a la misma página como `?name=…&phone=…`. Con datos personales, eso es la barra de direcciones y el historial del navegador.
- `<fieldset disabled={!cv.loaded}>`: no se puede escribir nada antes de que estén cargados los valores guardados, y sin JavaScript el formulario sigue desactivado.
