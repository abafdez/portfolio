---
title: Un tema claro de papel cuadriculado
reviewed: false
---

## Qué hicimos

- Le di al tema claro por defecto la dirección "cuaderno de ingeniería" de `design/light-theme-directions.md`: papel crema cálido (`--paper-0/1/3`, tono 95–100) y texto de lápiz cálido (`--pencil-1/2`, tono 60) en lugar de los gris azulados adaptados del tema oscuro.
- La cuadrícula clara usa ahora el color de marca (líneas menores al 5 %, mayores al 6 %, cruces al 25 %), así que la mitad clara de cada tema de color tiene una cuadrícula de su propio color.
- El foco del tema claro es más suave (brillo al 3 %, líneas al 6 %/10 %), para que cuadrícula y foco sumen menos color de marca que el 4 % + 15 % del oscuro.
- La sombra de la cabecera flotante en claro es un 14 % de `--text-1` en lugar de un 35 % de casi negro.
- `palettes.test.ts` tiene en cuenta ahora la línea de la cuadrícula bajo el foco en claro, para los seis temas con nombre.

## Qué aprendí

- Medido en el navegador, cada par en claro llega al menos a 4,5:1 (el verde de marca es el más bajo, 4,63:1). Con una línea de cuadrícula de marca al 9 % bajo el punto más brillante del foco, el texto gris del menú bajaba a 4,42:1: el menú de la cabecera está sobre la cuadrícula, así que ahí la decoración cuenta.
- Cinco temas con nombre estaban ajustados al límite; suavizar el foco los mantuvo a todos aprobados sin retocar ninguno.
- `light-dark()` solo acepta colores: `color-mix(…, var(--brand) light-dark(6%, 8%), …)` no es válido. Hay que escribir la mezcla entera dos veces.

- **Más tarde, el mismo día:** la cuadrícula quedaba recargada y el verde brillante, horrible sobre el crema. Comparé tres direcciones nuevas con capturas (verde tinta, azul plano, grafito) y elegí **verde tinta**: un blanco cálido suave, texto grafito, la marca como un verde tinta oscuro (`oklch(42% 0.085 165)`) y una cuadrícula sin líneas menores, solo líneas mayores tenues y cruces del color del texto. Todos los pares en claro aprueban (texto atenuado a 5,09:1 en el punto más brillante del foco, marca a 5,6:1).

## Siguiente

- Pasar Lighthouse al tema claro nuevo, que no llegué a hacer.
