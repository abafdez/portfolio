---
title: Validar formularios sin librería
description: El navegador ya sabe cuándo un campo es obligatorio, no es un correo o no encaja con un patrón. Yo solo tenía que decidir cuándo decirlo, y con qué palabras.
cover: Un formulario con campos de nombre, correo y contraseña, cada uno marcado como validado.
reviewed: false
---

El formulario de mi generador de CV necesitaba validación: un CV sin nombre ni correo no es un CV. No añadí ninguna librería. HTML ya tiene `required`, `type="email"` y `pattern`, y cada campo dice qué opina de su valor en `field.validity`.

## Decide el navegador

```ts
export function problem(field: HTMLInputElement): string {
	if (field.validity.valid) return '';
	if (field.validity.valueMissing) return 'Required.';
	return inputs.find(({ name }) => name === field.name)?.hint ?? field.validationMessage;
}
```

`validity` tiene una marca por cada tipo de problema. Escribo mis propios mensajes en vez de usar `validationMessage`, porque ese llega en el idioma del navegador, que no tiene por qué ser el de la página.

`novalidate` en el formulario desactiva los globos del navegador. Los campos se siguen comprobando solos.

## Cuándo decirlo

Ponerse en rojo mientras todavía estás escribiendo tu correo es de mala educación. Así que un campo se comprueba por primera vez cuando sales de él, con un único manejador `focusout` en el formulario (sube por el árbol; `blur`, no). A partir de ahí se comprueba con cada tecla, así que el mensaje desaparece en cuanto el valor está bien. CSS tiene exactamente esta regla de serie, `:user-invalid`, pero yo necesitaba el mensaje como texto, así que es JS.

## No solo rojo

Un borde rojo no le dice nada a quien no distingue el rojo. Cada problema también lleva un mensaje, fuera del `<label>` (dentro, pasaría a formar parte del nombre del campo), enlazado con `aria-describedby`. El borde reacciona a `aria-invalid="true"`, el mismo atributo que oye un lector de pantalla:

```css
[aria-invalid='true'] {
	border-color: var(--error);
	box-shadow: inset 0 0 0 1px var(--error);
}
```

La sombra hace que el borde parezca el doble de grueso sin mover nada.

## Una trampa: los patrones en modo v

El patrón evidente para un teléfono es `[0-9 ()-]`. Pero los navegadores compilan `pattern` con la marca `v` de las expresiones regulares, en la que `(`, `)` y `-` dentro de `[ ]` tienen que escaparse, y un patrón no válido se ignora sin avisar: el campo aceptaría cualquier cosa. El que uso:

```
\+?[0-9\s\(\)\-]{9,20}
```
