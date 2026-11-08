---
title: Open Props en SvelteKit solo con las variables que usas
description: Cómo configuré Open Props con postcss-jit-props en un proyecto con SvelteKit 3. La configuración va en vite.config.ts, y explico por qué CSS necesita un plugin para hacer tree-shaking.
cover: Un árbol de dependencias
reviewed: false
---

[Open Props](https://open-props.style/) es un conjunto de custom properties de CSS listas para usar: colores, tamaños, fuentes, sombras y curvas de animación. Escribes `padding: var(--size-3)` y tienes una escala coherente sin diseñarla tú.

La pega es que hay cientos. Este artículo cuenta cómo envío solo las que mi sitio usa de verdad.

## Por qué importar no basta

Mi primer instinto fue pensar que el bundler se encargaría. Vite hace tree-shaking de JavaScript, así que ¿no haría lo mismo con el CSS?

Pues no. El tree-shaking funciona en JS porque los imports y los exports son explícitos. Si escribes `import { foo } from 'lib'`, el bundler puede ver que nunca tocaste `bar`. CSS no tiene nada parecido:

```css
@import 'open-props/colors.min.css';
```

Esto copia **el archivo entero** en tu bundle, unas 200 variables de color, aunque uses dos. El minificador acorta el texto, pero no puede quitar ninguna variable. Cualquiera de ellas podría leerse después con `var()` desde otro archivo, desde un `style` en línea o desde JavaScript.

Importar solo algunos módulos (`colors`, `sizes`) ayuda, pero sigues recibiendo todas las variables de cada módulo que importas.

## postcss-jit-props

[postcss-jit-props](https://github.com/GoogleChromeLabs/postcss-jit-props) hace el tree-shaking que le falta a CSS. Lee tu CSS, encuentra cada `var(--algo)` e inyecta solo esas definiciones en `:root`.

Necesita una tabla de consulta para saber qué significa `--size-3`. Open Props la proporciona: el paquete exporta un objeto JS con todas las variables.

## Configurarlo en Vite

El README muestra un archivo `postcss.config.js`. En un proyecto con Vite preferí poner la configuración de PostCSS dentro de `vite.config.ts`. Ya está en TypeScript, `defineConfig` da autocompletado y toda la configuración del build queda en un solo sitio.

```sh
pnpm add -D open-props postcss-jit-props
```

```ts
import { defineConfig } from 'vite';
import OpenProps from 'open-props';
import postcssJitProps from 'postcss-jit-props';

export default defineConfig({
	plugins: [/* sveltekit(), … */],
	css: {
		postcss: {
			plugins: [postcssJitProps(OpenProps)]
		}
	}
});
```

Dos cosas que me confundieron:

- **Hay dos listas de plugins.** `plugins`, en el nivel superior, tiene los plugins de Vite. `css.postcss.plugins` tiene los de PostCSS. El mismo nombre, herramientas distintas.
- **También cubre los componentes Svelte.** Svelte no ejecuta PostCSS por sí mismo. El bloque `<style>` de cada componente se convierte en un módulo CSS virtual y pasa por el pipeline de CSS de Vite, igual que un archivo `.css`.

En cuanto `css.postcss` está en la configuración, Vite deja de buscar archivos `postcss.config.*`, así que no conserves ninguno.

## ¿Dependencia de desarrollo o normal?

Los dos paquetes son dependencias de **desarrollo**. Mi sitio es estático, y GitHub Pages solo sirve la carpeta `build/`. Ni `node_modules` ni Node. Open Props solo se lee durante el build. El navegador recibe CSS normal como `:root{--size-3:1rem}` y nunca ve el paquete.

`dependencies` importa en librerías y en aplicaciones de servidor que instalan paquetes en producción. Un sitio estático no es ninguna de las dos.

## Comprobar que funciona

```sh
pnpm build
grep -ro "\-\-size-3:[^;]*" build/
```

Solo aparecen las variables que uso. Si busco `open-props` en `build/`, no encuentro nada.

## Cosas a tener en cuenta

- **JIT solo lee CSS.** Una variable que solo se usa en un atributo `style="…"` o en TypeScript no se inyecta, y el navegador recurre en silencio al valor de respaldo.
- **Las erratas también fallan en silencio.** `var(--size-33)` no existe, así que no se inyecta nada, y ni TypeScript ni el build te avisan.
- **Sin autocompletado en el editor de serie.** Las variables no están definidas en ningún archivo CSS de tu proyecto. Lo resolví con la extensión CSS Variable Autocomplete, apuntando a la hoja de estilos completa del paquete. Ese archivo solo se usa para las sugerencias del editor, nunca se importa:

```json
"cssVariables.lookupFiles": ["**/*.css", "node_modules/open-props/open-props.min.css"],
"cssVariables.languages": ["css", "svelte"]
```

Lo siguiente: [design tokens semánticos](./2026-10-27-design-tokens) encima de estos valores base.
