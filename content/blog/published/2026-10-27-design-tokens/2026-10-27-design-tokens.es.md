---
title: 'Design tokens: dales un trabajo a tus colores'
description: Por qué mis componentes usan --text-1 en vez de --gray-8, y cómo un pequeño tokens.css convirtió el modo oscuro en un cambio de un solo archivo.
cover: Elementos de design tokens sobre un engranaje.
reviewed: false
---

Open Props me da una paleta: de `--gray-0` a `--gray-12`, de `--blue-0` a `--blue-12`, etcétera. Es tentador usarlos directamente en los componentes. Este artículo explica por qué añado una capa en medio.

## Valores frente a decisiones

Un **design token** es una decisión de diseño con nombre. Compara:

```css
color: var(--gray-8); /* what it looks like */
color: var(--text-1); /* what it's for */
```

Los dos muestran hoy el mismo color. Solo el segundo te dice su función: el texto principal.

Así que uso dos tipos de tokens:

| Tipo      | Ejemplo                              | Responde a                  |
| --------- | ------------------------------------ | --------------------------- |
| Base      | `--gray-8`, `--blue-9`               | ¿Qué valores hay?           |
| Semántico | `--text-1`, `--brand`, `--surface-2` | ¿Para qué sirve cada valor? |

Open Props aporta los valores base, y mi `tokens.css` define los semánticos:

```css
:root {
	--brand: var(--blue-9);
	--text-1: var(--gray-9);
	--text-2: var(--gray-7);
	--surface-1: var(--gray-0);
	--surface-2: var(--gray-1);
	--surface-3: var(--gray-3);
}
```

**La regla:** los componentes usan tokens semánticos, y solo `tokens.css` usa los valores base.

## Por qué añadir la capa extra

- **El modo oscuro.** En modo oscuro, `--text-1` pasa a ser un gris claro. Es una línea en un solo archivo, y todos los componentes la siguen. Si los componentes usaran `--gray-8` directamente, tendría que editarlos uno por uno.
- **Cambiar de marca.** Pasar el color de marca de azul a naranja es editar `--brand` una vez.
- **Legibilidad.** `var(--text-2)` en un componente te dice que es texto atenuado. `var(--gray-7)`, no.

## Los nombres

- **Por su función, no por su aspecto.** `--light-gray` deja de ser verdad en modo oscuro. `--surface-2` sigue siéndolo en los dos temas.
- **Numerados por énfasis.** `--text-1` es el texto más fuerte y `--text-2` el atenuado. `--surface-1` es la página, y los números más altos son elementos elevados como tarjetas y campos.
- **Pocos tokens.** Solo añado uno cuando lo necesito. No envuelvo en tokens los tamaños de Open Props como `--size-3`, porque el espaciado no cambia entre temas. Un nombre semántico solo ayuda cuando recoge una decisión real.

## Elegir colores que pasen el contraste

Las escalas de color de Open Props van del 0 (el más claro) al 12 (el más oscuro). Como guía aproximada, del 0 al 2 sirven para fondos, del 6 al 8 para acentos y del 9 al 12 para texto.

Mi primer color de marca fue `--brown-0`, elegido al azar. Era casi blanco sobre un fondo blanco y habría suspendido el contraste de inmediato. El nivel AA de las WCAG exige:

- **4,5:1** para el texto normal, enlaces incluidos
- **3:1** para el texto grande y las partes de la interfaz como bordes e iconos

Para comprobarlo, haz clic en una muestra de color en DevTools. El selector muestra el ratio de contraste con el fondo y dibuja una línea que marca qué tonos pasan.

Me pilló una segunda vez. Al principio puse `--text-2` en `--gray-6` para el texto atenuado. Eso es solo unos 3:1 sobre mis fondos claros. Aun así Lighthouse pasaba, porque ninguna página usaba todavía `--text-2`. Cuando la portada tuvo un lema y tarjetas con texto atenuado, apareció el problema. Pasé `--text-2` a `--gray-7` (más de 7:1) y `--text-1` a `--gray-9` para que los dos sigan siendo claramente distintos. **Una auditoría solo comprueba los colores que una página usa de verdad**, así que comprueba un par de tokens nuevo al definirlo, no cuando una página lo usa por primera vez.

## Dos errores que cometí

```ts
import tokens from '#lib/styles/tokens.css'; // ❌ "default" is not exported
import '#lib/styles/tokens.css'; // ✅ side-effect import
```

Un archivo CSS no tiene exports. Un `import '…'` sin más le dice a Vite que añada la hoja de estilos a la página.

También envolví mi CSS en `export tokens { … }`. CSS no tiene ningún `export`. Una custom property declarada en `:root` (el elemento `<html>`) está disponible en todas partes porque los elementos la heredan.

**Actualización:** esta estructura dio sus frutos más tarde. Cuando le di al sitio su propio aspecto, cambié los grises y azules de Open Props por mi propia [paleta en oklch](./2026-10-31-dark-first-palette). Todos los cambios fueron en `tokens.css`; no cambió ningún componente.

Lo siguiente: [cascade layers](./2026-10-29-cascade-layers), para saber dónde se aplican estos tokens.
