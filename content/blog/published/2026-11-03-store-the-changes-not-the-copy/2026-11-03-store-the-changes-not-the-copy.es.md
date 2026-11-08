---
title: 'Guarda los cambios, no la copia'
description: Mi generador de CV me deja editar las habilidades de cada perfil de empleo. Guardar mis cambios sobre la lista, en vez de una copia, mantuvo al mando los datos del sitio, y un ??= me enseñó cómo funcionan los proxies de Svelte.
cover: Un formulario roto que se repara, conectado al almacenamiento del navegador y a la sincronización.
reviewed: false
---

Mi generador de CV toma sus habilidades de los datos de mi sitio, un archivo YAML. Para una candidatura real quiero cambiarlas: dejar una fuera del CV de mainframe, redactar otra de otra manera, añadir una que no está en el sitio. Esos cambios son míos, así que viven en el navegador, como el resto del formulario.

<!-- TODO: una captura del editor con una habilidad desmarcada y una mía -->

## Cambios, no una copia

Lo fácil sería copiar la lista en `localStorage` y editar la copia. Pero entonces el YAML deja de importar: una habilidad que añada al sitio el mes que viene nunca llega al CV. Así que solo guardo lo que es distinto, por perfil:

```ts
interface ProfileEdits {
	on: string[]; // switched on, though the YAML doesn't give this profile
	off: string[]; // switched off, though it does
	labels: Record<string, string>; // my wording, by skill key
	added: Record<string, { id: string; text: string }[]>; // my own, by group
	order: Record<string, string[]>; // my order, by group: skill names and my skills' ids
}
```

Mis propias habilidades recibieron un id cuando añadí la reordenación: el orden tiene que apuntar a ellas, y su posición en la lista cambia cada vez que se quita una de las anteriores.

Si una habilidad está en el CV se calcula cada vez:

```ts
included(skill: CvSkill, profile: string) {
	const { on, off } = this.get(profile);
	return on.includes(skill.key) || (skill.profiles.includes(profile) && !off.includes(skill.key));
}
```

Volver a dejar una habilidad como dice el YAML la quita de las dos listas, así que "Restablecer" no es más que olvidar los cambios del perfil.

**Actualización:** antes los cambios se guardaban por el nombre de la habilidad. Cuando el sitio tuvo versión en español, el nombre de una habilidad pasó a depender del idioma, así que ahora cada habilidad tiene una `key`, su nombre en inglés, para guardar, y `name` es solo lo que se muestra. Los cambios guardados antes siguen coincidiendo, porque la clave es el nombre con el que se guardaron.

<!-- TODO: abrir DevTools → Application → Local Storage y pegar cómo se ven mis cambios -->

## El ??= que no funcionaba

La primera vez que cambio un perfil, hay que crear su objeto de cambios:

```ts
(this.all[profile] ??= { on: [], off: [], labels: {}, added: {}, order: {} }).off.push(name);
```

Parece correcto, pero no actualizaba la página. `this.all` es `$state`, un proxy profundo: el objeto que asigno se envuelve en un proxy nuevo al guardarse. Pero `a ??= b` se evalúa como `b`, el objeto normal que pasé, no como el proxy. Hacer push sobre el objeto normal cambia los datos sin avisar a Svelte. La solución es volver a leerlo:

```ts
this.all[profile] ??= empty();
return this.all[profile];
```

<!-- TODO: ¿entendí por qué antes de leer esto? Probar la versión rota en el playground -->

## Una casilla enlazada a un cálculo

"¿Está esta habilidad en el CV?" no es una variable, es el YAML más mis cambios. Un enlace de función deja que la casilla lo lea y lo escriba de todas formas:

```svelte
<input
	type="checkbox"
	bind:checked={
		() => edits.included(skill, profile.id), (value) => edits.include(skill, profile.id, value)
	}
/>
```
