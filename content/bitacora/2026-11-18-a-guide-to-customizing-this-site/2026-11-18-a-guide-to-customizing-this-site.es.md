---
title: Una guía para personalizar este sitio
reviewed: false
---

## Qué hicimos

- Escribí una guía de personalización en ocho capítulos, en `docs/customizing/` ([en GitHub](https://github.com/abafdez/portfolio/tree/main/docs/customizing)), más un índice con un mapa del proyecto y las cinco reglas que explican casi todo el código. La guía está en inglés.
- **1. El stack:** cada paquete, qué hace aquí, dónde se usa y por qué (SvelteKit 3 con adapter-static, Open Props a través de postcss-jit-props, Lucide en dos paquetes, Simple Icons, marked + svelte-markdown + Shiki, enhanced-img y la caché de imágenes commiteada, Pagefind, Sveltia CMS, Vitest, Playwright), y cada script.
- **2. Cómo encaja todo:** las carpetas, qué hace `pnpm build` paso a paso (plugins, prerenderizado, el adaptador, la compilación del CMS, Pagefind), la ruta base, el camino de un archivo markdown hasta una página, los dos idiomas, el layout raíz y dónde se guardan los ajustes del visitante.
- **3. Colores, tipografía y maquetación:** tokens primitivos frente a semánticos, `light-dark()` y por qué los tokens también se declaran en `[data-theme]`, los temas de color y su test de contraste, mezclar en `oklab`, las fuentes, los anchos y el zoom de lectura, el tamaño de texto, las tres capas de CSS y la regla de las hojas.
- **4. El catálogo de efectos:** cada efecto (la cuadrícula y el foco, la cabecera que se despega, el desplazamiento suave, el círculo del tema, los cuatro efectos de los temas de color, la búsqueda, el asa, el panel y los cinco estilos del pie, la entrada de la portada y lo que aparece al desplazarse, las barras, anillos, ventanas y la marquesina de `/about`, las tarjetas, las etiquetas, los bloques de código, los juegos del 404, la herramienta de cursores), con sus archivos, su técnica, cómo desactivarlo y qué hace con movimiento reducido y sin JavaScript.
- **5. Transiciones:** la View Transition API tal como la usa el sitio (fotos, nombres, tipos, clases, transiciones saltadas), y después los cambios de ruta, las tarjetas que se convierten en páginas paso a paso, el círculo del tema, los efectos de los temas de color y cómo depurarlos.
- **6. Recetas:** catorce técnicas reutilizables con código: la luz del puntero en los bordes, la inclinación en 3D y el imán, popovers animados, animaciones ligadas al desplazamiento, `@property`, animar hasta altura automática, observadores de "una vez en pantalla", valores del puntero una vez por fotograma, canvas que siguen al tema, contadores accesibles, ganchos de animación en componentes, máscaras SVG que se animan solas, efectos de puntero y patrones de mejora progresiva.
- **7. Añadir cosas:** listas de pasos para una página, un artículo, un proyecto o herramienta, un tema de color, una transición de tema, una variante del 404, un estilo del panel, un bloque de markdown, una lista Awesome, un texto de la interfaz, y una lista que debería pasar cualquier efecto nuevo.
- **8. Fuentes:** la documentación y los artículos por tema, de dónde salieron las ideas y una tabla que relaciona cada parte del sitio con las entradas del Devlog que cuentan su historia.
- Un `README.md` de verdad en la raíz que enlaza a la guía, y una copia de cada capítulo en mi bóveda de Obsidian.

## Qué aprendí

- Escribir el catálogo mostró lo coherentes que ya son los efectos: casi todos siguen los mismos tres interruptores (movimiento reducido, sin JavaScript, CSS que falta), así que desactivar uno suele ser borrar un bloque.
- La red de seguridad de movimiento reducido de `global.css` no llega a las view transitions (`*` no coincide con `::view-transition-*`), y por eso existe `canTransition()`.
- Las secciones de "Enlaces" del Devlog fueron la mejor lista de fuentes: 280 enlaces, ya ordenados por aquello para lo que se usaron.

## Siguiente

- Mantener la guía al día con el código: cuando cambie un efecto, un token o una librería, actualizar su capítulo.
