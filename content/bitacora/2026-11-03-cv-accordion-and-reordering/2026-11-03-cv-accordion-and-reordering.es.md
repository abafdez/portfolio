---
title: Un formulario de CV que se pliega, y habilidades que puedo reordenar
reviewed: false
---

## Qué hicimos

- "Sobre ti" y "Habilidades" son `<details name="cv-form">`: un acordeón, así que al abrir uno se cierra el otro. Cerrado, cada uno dice cómo va ("Faltan 4 campos obligatorios", "2 campos por corregir", mi nombre; "56 en el CV"). El perfil y los botones de "Tu CV" siguen visibles.
- Los grupos de habilidades dentro de Habilidades también son un acordeón (`name="cv-skill-groups"`).
- Cada fila de habilidad tiene ↑ ↓ (también mis propias habilidades, más ✕). El orden es por perfil, en `order` por grupo (nombres de habilidades e ids de las mías); lo que no está, como una habilidad nueva en el YAML, va al final. El editor y el CV leen el mismo `items()`, así que no pueden contradecirse.
- Mis propias habilidades tienen ahora un id (`crypto.randomUUID()`). Las habilidades guardadas a la antigua, como textos sueltos, siguen cargándose.
- Imprimir abre "Sobre ti" antes de llevar el foco a un campo que hay que corregir.
- Cada grupo de habilidades es un panel sobre `--surface-1` con un borde, para que destaque sobre la rejilla de planos; cada fila de habilidad es una franja de `--surface-2`, y sus campos de texto vuelven a `--surface-1` para que se sigan viendo como campos (idea de Alfonso: los grupos costaba leerlos).
- Los botones de "Tu CV" (imprimir, exportar, importar) salieron del formulario para colocarse sobre el CV en vivo sobre el que actúan. Un `<fieldset>` también funciona fuera de un formulario, así que los sigue desactivando hasta que se cargan los datos; al imprimir se oculta con el formulario.
- Un solo `.visually-hidden` en `global.css` en vez de cuatro copias (`Skill`, `SkillWindow`, `SkillEditor` y ahora `Cv`).

## Qué aprendí

- `<details>` con el mismo `name` es un acordeón exclusivo, en HTML, sin JS. Un campo dentro de un `<details>` cerrado no puede recibir el foco, así que primero hay que abrirlo (`details.open = true`).
- `display: flex` en un `<summary>` oculta su marcador (el marcador pertenece a `display: list-item`), así que dibujo uno con `::before`.
- Un `{#each}` con clave mueve el `<li>` en vez de reescribirlo, y `animate:flip` lo desliza hasta allí. `prefersReducedMotion` de `svelte/motion` pone la duración a 0 cuando se pide.
- Mover un elemento en el DOM le quita el foco a lo que tiene dentro, así que al mover se devuelve el foco a la misma flecha, o a la otra cuando la fila llega arriba o abajo del todo (un botón desactivado no puede recibir el foco).
- La lista se mueve en silencio para un lector de pantalla: un `role="status"` oculto a la vista dice "Python: 5 de 7 en Lenguajes."
- Botones de subir y bajar en vez de arrastrar y soltar: el arrastrar y soltar nativo no funciona con el tacto y no se puede usar desde el teclado, así que los botones tendrían que estar de todas formas.
- Un test que lee la página justo después de `reload()` puede adelantarse a la hidratación: hay que esperar a algo que solo cambia el JS (aquí, que los fieldsets pierdan `disabled`).

## Enlaces

- [MDN: details name (acordeón exclusivo)](https://developer.mozilla.org/es/docs/Web/HTML/Element/details#name)
- [Svelte: animate:flip](https://svelte.dev/docs/svelte/animate)
- [Svelte: prefersReducedMotion](https://svelte.dev/docs/svelte/svelte-motion#prefersReducedMotion)
- [MDN: crypto.randomUUID()](https://developer.mozilla.org/es/docs/Web/API/Crypto/randomUUID)

## Siguiente

- Editar e imprimir de verdad los tres CV, y luego la PR de la fase 5.5.
