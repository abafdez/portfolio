---
title: Portadas, iconos y una línea de tiempo que se llena
reviewed: false
---

## Qué hicimos

- **La línea de tiempo del Devlog:** tres animaciones ligadas al desplazamiento en `Timeline.svelte`. Una línea del color de marca se llena a lo largo de cada fase cuando la pasa el centro de la pantalla, cada entrada aparece barrida desde la línea al entrar y su punto da un salto. Sin animaciones ligadas al desplazamiento, o con movimiento reducido, se queda la línea gris.
- **Portadas de los proyectos:** una captura en tema oscuro de cada proyecto (1600 × 900, sin la cabecera ni el pie del sitio y sin datos personales: el generador de CV estaba vacío), guardada como `content/projects/<slug>/cover.avif` con sharp. El código de portadas que ya existía las encuentra por carpeta, como las de los artículos; el texto alternativo es `cover: { en, es }` en `projects.ts`, y un test falla si llega uno sin el otro. Se ven en `/projects` y en los proyectos destacados de la portada.
- **Iconos de las listas Awesome:** `icon:` (un nombre de Lucide) o `logo:` (un slug de Simple Icons) en el YAML de cada lista, resueltos al construir por `glyph.server.ts`, que falla con un nombre que no existe. Los dibuja `Glyph.svelte` en el recuadro de la tarjeta (con un brillo suave del color de marca) y junto al título de la lista. Chispas para la IA, los logotipos de CSS y Svelte y un globo para la plataforma web.
- **El CMS** solo mostraba Modern CSS: las tres listas de ayer no tenían editor. Ahora las cuatro comparten un mismo conjunto de campos (un ancla de YAML), con los dos campos del icono.
- Empecé el día en una rama nueva, `feat/covers-icons-and-motion`, desde un `main` al día.

## Qué aprendí

- `view(50% 50%)` reduce el viewport a una línea en su centro, así que `animation-range: cover 0% cover 100%` va desde que el principio de la lista llega al centro de la pantalla hasta que su final lo deja atrás: una barra de progreso de la lectura.
- Un barrido con `clip-path` en una entrada también recorta lo que se dibuja fuera de su caja, como el punto de la línea. El recorte necesita margen por ese lado, en los dos extremos de la animación (`inset()` no se interpola hasta `none`).
- Un selector más específico añadido para una disposición (`.thumbnail:has(.tile.glyph)`) también ganaba a la regla de la otra, el cuadrado junto al texto, así que hubo que añadirlo ahí también.

## Siguiente

- Decidir qué hacer con las preguntas del CMS: un campo para elegir iconos, una colección de entradas para las listas Awesome, y la marca y los colores del tema en archivos de datos.
