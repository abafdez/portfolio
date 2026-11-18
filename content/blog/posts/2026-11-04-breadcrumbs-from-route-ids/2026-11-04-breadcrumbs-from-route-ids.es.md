---
title: Migas de pan en SvelteKit, y por qué comparo ids de ruta
description: Unas migas de pan a partir de datos que las rutas ya tienen, y el bug que encontré por el camino. El marcador de la página actual de mi menú nunca estuvo en el HTML prerenderizado, porque resolve() escribe enlaces relativos mientras prerenderiza.
cover: Un mapa de rutas que une Inicio, Blog y un artículo, con etiquetas de migas de pan.
reviewed: false
---

Dentro de un proyecto o de un artículo era fácil perder la pista de dónde estaba en mi sitio. El menú resaltaba la página actual, pero solo en las propias páginas de sección: en `/projects/cv` no se resaltaba nada.

Así que ahora las páginas anidadas tienen migas de pan:

```text
Inicio / Proyectos / Generador de CV
Inicio / Blog / #css
```

## Lo que tiene que decir una página

Cada página anidada de mi sitio pertenece a una sección, y la sección es la primera parte de su ruta: `/projects/cv` está en Proyectos, `/blog/tags/[tag]` está en Blog. Mi menú ya tenía la lista de secciones, así que la moví a `links.ts` y la usan los dos componentes:

```ts
export const sections: { href: RouteWithoutParams; label: string }[] = [
	{ href: '/', label: 'Home' },
	{ href: '/blog', label: 'Blog' }
	// …
];
```

(**Actualización:** desde que el sitio tiene versión en español, cada `label` es un mensaje, `label: m.navBlog`, que se llama como `label()`, así que sale en el idioma de la página.)

Lo único que las migas de pan no pueden deducir es el nombre de la propia página. La ruta lo sabe (de todas formas está cargando el artículo o el proyecto), así que lo dice en sus datos de load:

```ts
// src/routes/blog/[slug]/+page.server.ts
return { post, crumb: post.title };
```

`crumb` está tipado en `App.PageData` (`src/app.d.ts`), como la `composition` que mis rutas ya le mandan al layout. Eso hace que `page.data.crumb` sea un `string | undefined` en todas partes.

## El marcado

```svelte
{#if section && page.data.crumb}
	<nav aria-label="Breadcrumb">
		<ol>
			<li><a href={resolve('/')}>Home</a></li>
			<li><a href={resolve(section.href)}>{section.label}</a></li>
			<li aria-current="page">{page.data.crumb}</li>
		</ol>
	</nav>
{/if}
```

- Un `<nav>` con su propia etiqueta, para que aparezca como un punto de referencia distinto del menú principal.
- Una lista **ordenada**, porque el orden es lo importante.
- El último elemento es texto, no un enlace: un enlace a la página en la que ya estoy no haría nada. `aria-current="page"` le dice a un lector de pantalla que es donde estoy.

Las barras son CSS, con un texto alternativo:

```css
li + li::before {
	content: '/' / '';
}
```

La parte que va después de la segunda `/` es el texto alternativo del contenido generado. Está vacío, así que un lector de pantalla se salta la barra en vez de leer "barra" entre cada elemento.

## El bug: un marcador que nunca estuvo en el HTML

Para marcar la sección en el menú, primero comparé URLs, como siempre había hecho el menú:

```ts
page.url.pathname === resolve(link.href);
```

En pantalla funcionaba. Luego miré el archivo prerenderizado:

```sh
grep -c 'Breadcrumb' build/projects/cv.html # 0
```

Ni migas de pan ni `aria-current` en ningún enlace del menú, en ninguna página. Solo aparecían cuando se ejecutaba el JavaScript: sin JS no había ninguna página actual, y con JS el marcador aparecía de golpe después de cargar.

El motivo es `paths.relative`, que SvelteKit activa por defecto. Mientras prerenderiza, `resolve()` escribe los enlaces **relativos a la página**, para que el mismo HTML funcione con cualquier ruta base:

```html
<!-- build/projects/cv.html -->
<a href="../projects">Projects</a>
```

`'../projects'` nunca es igual a `'/portfolio/projects/cv'`. En el navegador, `resolve()` vuelve a dar rutas absolutas, así que ahí la comparación sí funcionaba.

La solución es comparar algo que no dependa de la URL: el **id de la ruta**. `page.route.id` es la ruta del archivo de la ruta, `/projects/cv` o `/blog/[slug]`. No tiene ruta base y es igual en el servidor y en el navegador:

```ts
export const isInside = (href: RouteWithoutParams, route: string | null) =>
	href !== '/' && !!route?.startsWith(`${href}/`);
```

(`null` es una página sin ruta, como un 404. Inicio se deja fuera porque todas las rutas empiezan por `/`.)

Ahora el menú dice `aria-current="page"` en la propia página de una sección y `aria-current="true"` en una página que hay dentro. `"true"` significa "el elemento actual de este conjunto", que es justo lo que es Proyectos mientras estoy en el generador de CV.

## Enlaces

- [WAI-ARIA APG: el patrón de migas de pan](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)
- [MDN: aria-current](https://developer.mozilla.org/es/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current)
- [MDN: content, texto alternativo](https://developer.mozilla.org/en-US/docs/Web/CSS/content#alternative_text_string_counter)
- [SvelteKit: paths.relative](https://svelte.dev/docs/kit/configuration#paths)
- [SvelteKit: page.route](https://svelte.dev/docs/kit/$app-state#page)
