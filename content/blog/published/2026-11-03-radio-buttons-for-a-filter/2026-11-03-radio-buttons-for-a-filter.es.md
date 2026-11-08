---
title: 'Botones de radio para un filtro, con estilo gracias a :has()'
description: Mi página sobre mí ahora filtra las habilidades por el tipo de empleo al que me presento. Una elección cada vez significa botones de radio, y :has() me deja darles estilo sin renunciar a lo que el navegador hace gratis.
cover: Tarjetas que pasan por un filtro, con botones de opción para categoría y fecha.
reviewed: false
---

Me presento a distintos tipos de empleo: desarrollo web, soporte informático, mainframe. Mi página sobre mí lista todas mis habilidades, y para un empleo de soporte la mitad son ruido. Así que la página tiene un filtro: `/about?profile=support` muestra solo las habilidades que importan para soporte, y ese es un enlace que puedo enviar.

## ¿Botones que se activan o radios?

Mis listas Awesome ya tienen un filtro: botones de etiqueta con `aria-pressed`, con los que puedes elegir varias etiquetas a la vez ([cómo funciona ese](./2026-11-02-filters-in-a-svelte-class)). Aquí eliges un perfil cada vez, y el navegador ya tiene un control justo para eso:

```svelte
<fieldset>
	<legend>Show skills for</legend>
	{#each [{ id: undefined, name: 'Everything' }, ...data.profiles] as option (option.id)}
		<label>
			<input
				type="radio"
				name="profile"
				checked={profile === option.id}
				onchange={() => pick(option.id)}
			/>{option.name}
		</label>
	{/each}
</fieldset>
```

El mismo `name`, y los inputs se convierten en un grupo. Lo que viene con eso, sin una sola línea de JavaScript mía:

- El tabulador entra en el grupo una vez y sale una vez, en vez de pararse en cada opción.
- Las flechas del teclado se mueven entre las opciones y las van eligiendo.
- Un lector de pantalla dice el nombre del grupo y luego "botón de opción, 2 de 4".

## Ocultar el círculo, no el input

No quería el radio redondo, quería los chips que usa el resto del sitio. Lo tentador es poner `display: none` en el input y dar estilo a la etiqueta. Pero `display: none` saca el input del orden del tabulador y del árbol de accesibilidad: sin foco, sin flechas, nada para un lector de pantalla. Así que el input se queda, invisible:

```css
input {
	position: absolute;
	opacity: 0;
	pointer-events: none;
}
```

Lo que se ve es la etiqueta, y `:has()` le deja mirar el input que tiene dentro:

```css
label:has(:checked) {
	border-color: var(--brand);
	background-color: var(--brand);
	color: var(--surface-1);
}

/* The input has the focus, so the label shows it. */
label:has(:focus-visible) {
	outline: 2px solid var(--brand);
	outline-offset: 3px;
}
```

Antes de `:has()`, esto necesitaba el input justo antes de la etiqueta, fuera de ella, para que el CSS pudiera llegar a la etiqueta con `input:checked + label`.

## Un solo estado

La página guarda un valor, el id del perfil, y calcula todo lo demás a partir de él:

```ts
let profile = $state<string>();

let groups = $derived.by(() => {
	const id = profile;
	if (!id) return data.groups;
	return data.groups
		.map((group) => ({ ...group, skills: group.skills.filter((s) => s.profiles.includes(id)) }))
		.filter((group) => group.skills.length);
});
let sections = $derived(groups.map(({ id, name }) => ({ id, label: name })));
```

El menú lateral (`sections`) sigue a los grupos, y el contador sigue a los dos. Podría haber actualizado el menú a mano cuando cambia un radio, pero el perfil también cambia cuando la página lo lee de la URL, y cada sitio que lo cambia tendría que acordarse del menú. Con `$derived` no hay nada de lo que acordarse.

El `const id = profile` es para TypeScript: estrecha `profile` a un texto después del `if`, pero no dentro del callback de `filter`, que en teoría podría ejecutarse más tarde. Un `const` no puede cambiar, así que el estrechamiento se mantiene.

## Por qué la URL se lee en `onMount`

La página está prerenderizada: se construye una vez en un único `about.html`, que el servidor envía para `/about`, `/about?profile=web` y cualquier otra cosa. Al construir no hay query string, así que solo puede leerla el navegador:

```ts
onMount(() => {
	const id = page.url.searchParams.get('profile');
	profile = data.profiles.find((p) => p.id === id)?.id;
});
```

Solo los ids que declaran los datos: `?profile=nope` lo muestra todo en vez de no mostrar nada. Sin JavaScript, la página muestra todas las habilidades y ningún filtro, que es la alternativa correcta: un filtro que no puede filtrar no debería estar.
