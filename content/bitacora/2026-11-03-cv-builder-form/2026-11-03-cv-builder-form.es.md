---
title: Un generador de CV con un formulario que recuerda
reviewed: false
---

## Qué hicimos

- `/projects/cv`: eliges un perfil, rellenas nombre, apellidos, teléfono, correo, ciudad, provincia, código postal y una carta breve, y un CV al lado del formulario lo sigue: nombre, perfil, línea de contacto, Resumen (la carta) y luego las habilidades del perfil por grupo, las más fuertes primero.
- Las habilidades salen de `content/skills.yaml`, recortadas en el servidor (`src/lib/projects/cv/skills.server.ts`): solo los nombres y los perfiles. Una habilidad sin nivel imprime la primera frase de su nota: "Español (Nativo)".
- El generador de CV tiene su propia ruta, `src/routes/projects/cv/`, con un `+page.server.ts`. El `tool` de `projects.ts` ahora es opcional, el `entries()` de `[tool]` se salta las herramientas que no lo tienen, y la cabecera de la página es `ProjectHeader.svelte`, compartida por las dos rutas.
- Mis datos viven en `CvDetails` (`details.svelte.ts`), una clase con `$state` que se guarda en `localStorage`. Nada llega al repositorio, al build ni a un servidor.

## Qué aprendí

- SvelteKit prefiere una ruta fija a una con `[param]`, así que `/projects/cv` gana a `/projects/[tool]`. Una ruta propia recibe los datos del servidor con su tipo exacto, en vez de una prop opcional en todas las herramientas.
- Un solo objeto `$state` para todo el formulario: es un proxy profundo, así que `bind:value={cv.values.name}` funciona y `JSON.stringify` ve todos los campos. Varios campos `$state` separados en una clase son getters en el prototipo, y `JSON.stringify` daría `{}`.
- `localStorage` se lee en `onMount`: no existe mientras se prerenderiza, y cargarlo antes de la hidratación haría que el primer renderizado fuera distinto del HTML.
- `read(data: unknown)` solo conserva los campos conocidos, solo texto y solo un perfil que exista. El almacenamiento pertenece al origen (`abafdez.github.io`, que comparten todos mis proyectos de Pages), así que puede contener cualquier cosa.
- Guardar es un `$effect`: mantener algo de fuera de Svelte al día con el estado. `save()` lee todos los campos, así que cualquier cambio lo vuelve a ejecutar. La condición `if (cv.loaded)` impide que el formulario vacío sobrescriba lo guardado, sea cual sea el orden en que se ejecuten los efectos.
- Los valores de `autocomplete` (`given-name`, `tel`, `postal-code`…) dejan que el navegador rellene el formulario. Un formulario sin `action` "envía" sus campos a la URL, así que `onsubmit` lo impide. Un `<fieldset>` desactivado desactiva todos los campos que contiene.

## Problemas y soluciones

- Cambiar el perfil guardaba el anterior. El formulario guardaba en `oninput`, pero un `<select>` lanza `input` antes que `change`, y Svelte actualiza `bind:value` de un select en `change`. El `$effect` no depende del orden de los eventos.
- La primera prueba mostró 14 errores: un servidor de previsualización de antes del build seguía en el puerto 4173, sirviendo la lista de archivos antigua. Hay que reiniciar la previsualización después de cada build.

## Enlaces

- [Svelte: `$effect`](https://svelte.dev/docs/svelte/$effect)
- [Svelte: `$state` (estado profundo)](https://svelte.dev/docs/svelte/$state#Deep-state)
- [SvelteKit: orden de las rutas](https://svelte.dev/docs/kit/advanced-routing#Sorting)
- [MDN: localStorage](https://developer.mozilla.org/es/docs/Web/API/Window/localStorage)
- [MDN: autocomplete](https://developer.mozilla.org/es/docs/Web/HTML/Attributes/autocomplete)

## Siguiente

- Imprimir: un botón y una hoja de estilos de impresión para un PDF que lea bien un ATS. Luego la validación nativa del formulario, editar las habilidades y la importación y exportación en JSON.
