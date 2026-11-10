---
title: Un acordeón sin JavaScript
description: Dales el mismo name a varios elementos <details> y, al abrir uno, se cierran los demás. El formulario de mi generador de CV se pliega así, con una pega relacionada con el foco.
cover: Un elemento que se despliega y se pliega como un acordeón.
reviewed: false
---

El formulario de mi generador de CV se hizo largo: mis datos y luego diez grupos de habilidades. Cuando ya he rellenado algo, quiero quitarlo de en medio. El navegador tiene secciones plegables desde hace años, `<details>` y `<summary>`. Lo nuevo es que pueden funcionar como un acordeón:

```html
<details name="cv-form" open>
	<summary>About you</summary>
	…
</details>
<details name="cv-form">
	<summary>Skills</summary>
	…
</details>
```

El mismo `name`, y al abrir uno se cierran los demás. Sin JavaScript y sin un `aria-expanded` que mantener sincronizado: el navegador les dice a los lectores de pantalla si cada uno está abierto.

## Un resumen que dice cómo va

Una sección cerrada no debería esconder que algo va mal dentro. Cada resumen lleva un estado, calculado a partir del formulario:

```svelte
<summary>About you <span class="note">{aboutStatus}</span></summary>
```

"Faltan 4 campos obligatorios", luego "2 campos por corregir" cuando ya los he repasado, y al final solo mi nombre.

## La pega: el foco

Antes de imprimir, el formulario comprueba todos los campos y lleva el foco al primero que tiene un problema. Si ese campo está dentro de un `<details>` cerrado, `focus()` no hace nada: el contenido oculto no puede recibir el foco. Así que primero se abre la sección:

```ts
function reveal(field: HTMLElement) {
	const section = field.closest('details');
	if (section) section.open = true;
	field.focus();
}
```

Abrirla mediante `open` también respeta el acordeón: la otra sección se cierra.

## Una más: el marcador

Convertí el summary en una fila flex para poner el estado junto al título. Eso hace desaparecer el triangulito: el marcador pertenece a `display: list-item`, que es lo que es `<summary>` por defecto. Así que, con `display: flex`, dibujo el mío:

```css
summary::before {
	content: '▸';
}

details[open] > summary::before {
	content: '▾';
}
```
