---
title: Un segundo idioma sin librería
description: Mi sitio ya está en inglés y en español, con un hook de SvelteKit, dos archivos de mensajes y una regla sobre los enlaces. Lo que habría hecho Paraglide y lo que aprendí haciéndolo yo.
cover: Un globo terráqueo rodeado de códigos de idioma, con un sitio que cambia a otro idioma.
reviewed: false
---

Quería mi sitio también en español: es mi primera lengua, y mi CV me sirve en los dos idiomas. La respuesta habitual en SvelteKit es [Paraglide JS](https://paraglidejs.com), y es buena. Yo lo hice a mano, y esto es por qué y cómo.

## Por qué no una librería

Casi todo el texto de mi sitio no está en la interfaz. Son artículos, entradas del devlog y una lista de habilidades, todo en markdown y YAML, y una librería de mensajes no toca nada de eso. Lo que me daría es la parte de alrededor: en qué idioma está una URL y que los enlaces se queden en él. En SvelteKit, esa parte es un hook.

Aun así, mis mensajes se parecen a los de Paraglide, así que podría pasarme más adelante cambiando los imports:

```ts
// en.ts
export const en = {
	blogTitle: () => 'Blog',
	tagPostCount: ({ count }: Count) => plural('en', count, { one: ' post', other: ' posts' })
};

// es.ts: satisfies comprueba que están todos los mensajes, con los mismos parámetros
export const es = {
	blogTitle: () => 'Blog',
	tagPostCount: ({ count }: Count) => plural('es', count, { one: ' artículo', other: ' artículos' })
} satisfies Messages;
```

## El idioma está en la URL

El inglés sigue donde estaba, `/portfolio/blog`, y el español es `/portfolio/es/blog`. No quería una segunda copia de cada ruta, así que un hook `reroute` le dice a SvelteKit que `/es/blog` es la ruta `/blog`:

```ts
// src/hooks.ts
export const reroute: Reroute = ({ url }) => delocalize(url.pathname);
```

La URL no cambia, así que `page.url` sigue teniendo el `/es`, y de ahí lee el idioma el layout raíz. El id de la ruta tampoco cambia, y eso importó más de lo que esperaba: mis migas de pan y mi menú comparan ids de ruta, y siguieron funcionando sin tocar una línea.

## La única regla: todos los enlaces pasan por route()

La sorpresa de la prueba. Mientras SvelteKit prerenderiza una página, `resolve()` escribe los enlaces relativos a la URL real de esa página. En `/es/blog`, `resolve('/blog/[slug]')` da `../blog/x`, y ese es el artículo en inglés.

Así que todos los enlaces a una página pasan por mi propio `route()`, que es `resolve()` más el idioma justo después de la ruta base. Y para que no se me olvide, un test unitario lee todos los archivos y falla si alguno importa `resolve` sin un buen motivo.

## El idioma es de la página

Mi primera idea fue una variable, `currentLocale`, que cambiaría el selector. Habría roto el build: SvelteKit prerenderiza todas las páginas, en inglés y en español, en un solo proceso, así que el idioma de una página podría colarse en la siguiente. El idioma sale de la página que se está renderizando (`page.data.locale`), y cada mensaje lo consulta cuando se llama.

Una trampa más: `/blog` y `/es/blog` son la misma ruta, así que cambiar de idioma conserva el componente de la página y solo actualiza su plantilla. Lo que un componente calcula una vez en su script se queda en el idioma anterior. Envolver la página en `{#key getLocale()}` la vuelve a construir.

## El selector

El selector es un enlace en la cabecera a la misma página en el otro idioma, con `hreflang` y `lang` puestos al idioma al que lleva. Como toda la página cambia en el sitio, reproduce los mismos efectos que mis temas de color (una onda, un glitch, una línea de barrido o lluvia, por turnos), que arranca el `onNavigate` del layout raíz cuando la URL antigua y la nueva están en idiomas distintos. `data-sveltekit-reset="false"` te deja donde estabas leyendo en vez de saltar arriba del todo.

## Los buscadores

Cada página se lista a sí misma en los dos idiomas, para que Google mande a quien busca en español a la página en español:

```html
<link rel="alternate" hreflang="en" href="…/portfolio/blog" />
<link rel="alternate" hreflang="es-ES" href="…/portfolio/es/blog" />
<link rel="alternate" hreflang="x-default" href="…/portfolio/blog" />
```

El sitemap dice lo mismo, y `<html lang>` dice en qué idioma está cada página, para que un lector de pantalla elija la voz correcta.

## ¿Usaría Paraglide la próxima vez?
