---
title: Resaltado de sintaxis con Shiki, coloreado con mis propios design tokens
description: Resaltar los bloques de código al construir el sitio con Shiki, y un pequeño tema de TextMate cuyos colores son variables de CSS, para que el código siga los temas de mi sitio.
cover: Una ventana con código de muchos colores.
reviewed: false
---

Los bloques de código de mi blog los resaltaba Prism, el que trae mdsvex por defecto, que avisaba de lenguajes que no podía cargar. Me pasé a Shiki, que usa las mismas gramáticas que VS Code. Lo difícil fueron los colores: mi sitio tiene un tema claro y uno oscuro, y más adelante quiero temas con nombre y temas creados por los visitantes. El código tenía que seguirlos todos.

## Resaltar mientras se construye el sitio

Shiki se ejecuta en `vite.config.ts`, mientras se construye el sitio. mdsvex llama a mi función por cada bloque de código, y yo le devuelvo HTML:

```ts
const shiki = createHighlighter({ themes: [codeTheme], langs: [] });

async function highlight(code: string, lang: string | null | undefined) {
	const highlighter = await shiki;
	let language = 'text';
	if (lang && lang in bundledLanguages) {
		await highlighter.loadLanguage(lang as BundledLanguage);
		language = lang;
	}
	const html = highlighter.codeToHtml(code, { lang: language, theme: 'tokens' });
	const escaped = html.replace(/[{}`\\]/g, (c) => `&#${c.charCodeAt(0)};`);
	return `<Components.CodeBlock lang="${language}">{@html \`${escaped}\`}</Components.CodeBlock>`;
}
```

El resaltador se crea una sola vez y empieza sin lenguajes. Cada uno se carga la primera vez que un bloque lo usa. Lo que llega al navegador es un `<pre>` lleno de `<span>` que ya tienen sus colores, y nada de JavaScript de resaltado.

El `<pre>` va envuelto en un pequeño componente `CodeBlock`, que añade el lenguaje, los números de línea y un botón de copiar. Eso es otra historia: [un marco para los bloques de código](./2026-11-02-a-code-block-frame).

## De dónde salen los colores

Shiki tiene tres formas de darle tema al código:

- **Temas dobles.** Le pasas un tema claro y uno oscuro, y Shiki escribe los dos colores en cada span. Un poco de CSS (o `defaultColor: 'light-dark()'`) cambia de uno a otro. Pero los colores salen de esos temas, no de mis tokens.
- **El tema de variables CSS.** Cada color es un `var(--…)` que defino yo. Pero la documentación de Shiki dice que es "mucho menos detallado" que otros temas, y tiene razón: solo unos diez tipos de token tenían color. Mi tema claro se veía apagado.
- **Un tema propio** con variables CSS como colores. Es lo que recomienda la documentación para obtener mejores resultados, y lo que elegí.

## Un pequeño tema de TextMate

Una gramática le da a cada token una lista de nombres de ámbito (scopes), de lo general a lo concreto. Un tema asigna colores a los ámbitos. El mío tiene ocho reglas, y cada color es un token de `tokens.css`:

```ts
export const codeTheme: ThemeRegistration = {
	name: 'tokens',
	fg: 'var(--code-foreground)',
	bg: 'var(--code-background)',
	settings: [
		{
			scope: ['string', 'punctuation.definition.string'],
			settings: { foreground: 'var(--code-string)' }
		},
		{
			scope: ['entity.name.tag'],
			settings: { foreground: 'var(--code-tag)' }
		}
		// …six more rules
	]
};
```

```css
--code-string: var(--brand);
--code-tag: light-dark(var(--red-dark), var(--red-bright));
```

`light-dark()` elige el color del tema actual, así que los temas oscuro y claro no necesitan nada más. Un futuro tema con nombre solo sobrescribe los tokens `--code-*`.

## Qué regla gana

Un selector coincide con un ámbito y con todo lo que cuelga de él: `entity.name.tag` coincide con `entity.name.tag.html`, con `entity.name.tag.css` y también con `entity.name.tag.yaml`, porque la gramática de YAML llama etiquetas a sus claves. Mis claves de YAML salían en rojo, como las etiquetas HTML.

Cuando coinciden varias reglas, gana la que coincide con más segmentos. Así que una regla para `entity.name.tag.yaml` pone las claves de YAML en verde azulado, sea cual sea el orden de las reglas. Funciona como la especificidad en CSS. Poner más selectores en una regla no la hace más fuerte: la lista solo significa "cualquiera de estos".

Para encontrar el ámbito de un token, el comando de VS Code **Developer: Inspect Editor Tokens and Scopes** muestra los mismos nombres que ve Shiki.

## Escapar, tres veces

El código está lleno de caracteres que significan algo en otro sitio:

- Shiki escapa `<` y `&`, así que un `<script>` dentro de un bloque de código se muestra como texto, no se ejecuta.
- El HTML va dentro de una plantilla de Svelte, donde `{count}` se leería como una expresión.
- Está dentro de una plantilla de texto de JavaScript, donde una comilla invertida terminaría la cadena y una barra invertida cambiaría el carácter siguiente.

La ayuda habitual de mdsvex, `escapeSvelte`, se ocupa de las llaves y las comillas invertidas, pero no de casi ninguna barra invertida. En mi ejemplo de CSS dentro de un grep, `\-\-` salía como `--`. Así que escapo los cuatro caracteres como entidades HTML, que en pantalla se ven igual.

Eso es escapar: codificar datos para que sigan siendo datos en un sitio concreto. No es sanear, que consiste en quitar las partes peligrosas de un HTML que sí quieres mostrar. El `{@html}` de Svelte nunca sanea. Está bien para el markdown que escribo yo, y es algo que tener en cuenta si algún día muestro markdown que no he escrito.

## Contraste

Cada color de código tiene que leerse bien sobre el fondo del bloque, en los dos temas. Comprobé cada par antes de usarlo: el más bajo es 5,3:1, por encima del 4,5:1 que piden las WCAG AA para el texto normal. También mantuve todos los colores dentro del rango sRGB, para que las pantallas muestren lo que comprobé.

**Actualización (2026-11-11):** mdsvex ya no está. El resaltador y el tema son los mismos, ahora en un módulo que comparten el render en el servidor y la vista previa del CMS. Un componente no puede esperar mientras se renderiza, así que los lenguajes que usa un post se cargan antes y el resaltado es síncrono.
