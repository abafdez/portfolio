---
title: Quince artículos sin portada, y un plan para hacer las mías
reviewed: false
---

## Qué hicimos

- **Publiqué los 15 borradores** escritos entre el 2026-11-09 y el 2026-11-18 (la caja de herramientas, el CMS, el tema claro, el panel de contratación, el 404, la búsqueda…), en la rama `articles`, fusionada en la PR #31. Solo esperaban una portada; las tarjetas muestran la ficha con la #etiqueta hasta que la tengan. Sus archivos en español siguen con `reviewed: false`.
- La nota de actualización del artículo del foco ahora enlaza al artículo de la cuadrícula en lugar de a la entrada del Devlog, porque ese artículo también está publicado.
- **Un plan para hacer portadas con mi propia GPU** (`design/cover-generation.md`): ComfyUI dentro de WSL en la RTX 3080 Ti, modelos con licencia Apache 2.0 (Z-Image-Turbo por velocidad, Qwen-Image-2512 cuando hay un título dibujado en la imagen), `pnpm cover <slug>` para cuatro candidatas y `pnpm cover:pick` para guardar una como AVIF 16:9. Es la fase 13 del tablero.
- También la fase 12 en el tablero: probar mdsvex 1.0 y su resaltador, twinkleplop.

## Qué aprendí

- Las licencias importan tanto en los modelos de imagen como en el código: algunos de los más conocidos solo permiten investigación o uso no comercial, y mi portafolio está pensado para que me contraten.
- Reglas para usar modelos en local: solo pesos `.safetensors` o GGUF (un archivo pickle puede ejecutar código al cargarse), ningún nodo personalizado aparte del de GGUF, y ComfyUI escuchando solo en 127.0.0.1.

## Siguiente

- Instalar ComfyUI (necesita `memory=24GB` en `.wslconfig` para el modelo grande) y luego las portadas de los 15 artículos.
