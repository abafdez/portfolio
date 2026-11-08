---
title: Validar formularios con lo que ya tiene el navegador
reviewed: false
---

## Qué hicimos

- El formulario del CV se comprueba solo, sin librerías: `required` en nombre, apellidos, teléfono y correo, `type="email"` y un `pattern` para el teléfono (`\+?[0-9\s\(\)\-]{9,20}`) y el código postal.
- Un campo con un problema recibe un borde rojo (el nuevo token `--error`) y un mensaje debajo. Se comprueba al salir de él, y luego con cada tecla hasta que está bien.
- Imprimir comprueba antes todos los campos: si algo está mal, lo dice y lleva el foco al primer campo incorrecto en vez de imprimir. Una importación comprueba lo que ha cargado.
- Los campos ahora son datos (`src/lib/projects/cv/inputs.ts`): etiqueta, tipo, autocomplete, required, pattern y pista. El formulario los recorre.
- `--error` es `--red-dark` / `--red-bright`: ≥ 5,74:1 en claro y ≥ 7,45:1 en oscuro sobre todas las superficies. El comprobador de contraste lo incluye.

## Qué aprendí

- La API de validación de restricciones: cada campo tiene `validity`, con una marca por cada problema (`valueMissing`, `typeMismatch`, `patternMismatch`…). `novalidate` en el formulario solo detiene los globos del navegador; los campos se siguen comprobando solos.
- Mensajes propios, no `validationMessage`: ese llega en el idioma del navegador.
- `focusout` sube por el árbol (`blur`, no), así que un solo manejador en el formulario escucha todos los campos. CSS tiene la misma regla de "después de que lo hayas tocado" con `:user-invalid`, pero un mensaje de texto necesita JS.
- El color solo no basta: el mensaje dice qué está mal. Está fuera del `<label>` (dentro, pasaría a formar parte del nombre del campo), enlazado con `aria-describedby`. El borde reacciona a `aria-invalid`, así que lo que se ve y lo que se oye no pueden contradecirse.
- Los navegadores compilan `pattern` en el modo `v` de las expresiones regulares, donde `(`, `)` y `-` dentro de `[ ]` tienen que escaparse. Un patrón no válido se ignora sin avisar.
- Svelte recorta los espacios al principio de un elemento: `" *"` se imprimía como `"*"`. En su lugar, un margen de CSS.

## Enlaces

- [MDN: validación de restricciones](https://developer.mozilla.org/es/docs/Web/HTML/Constraint_validation)
- [MDN: ValidityState](https://developer.mozilla.org/es/docs/Web/API/ValidityState)
- [MDN: :user-invalid](https://developer.mozilla.org/es/docs/Web/CSS/:user-invalid)
- [MDN: aria-invalid](https://developer.mozilla.org/es/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid)
- [MDN: pattern](https://developer.mozilla.org/es/docs/Web/HTML/Attributes/pattern)

## Siguiente

- Editar las habilidades del perfil elegido: ocultar una, cambiar su texto, añadir las mías. Guardadas en `localStorage` como mis datos.
