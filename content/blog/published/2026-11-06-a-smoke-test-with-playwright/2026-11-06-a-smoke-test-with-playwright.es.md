---
title: 'Una prueba de humo: ¿sigue cargando cada página?'
description: Un test de Playwright que pulsa cada enlace del menú de mi sitio, y por qué busca errores que un build no puede ver.
cover: Un servidor y un portátil con humo que sale de un chip, y una comprobación superada.
reviewed: false
---

Mis tests unitarios comprueban funciones pequeñas. No pueden decirme si el sitio funciona: si una página carga, si arranca su JavaScript, si un enlace va adonde debe. Para eso, algo tiene que abrir el sitio en un navegador y pulsar por ahí, como hago yo antes de cada fusión. Eso es un **test de extremo a extremo**: prueba el conjunto, de un extremo al otro.

El más pequeño que sirve de algo es una **prueba de humo**. El nombre viene del hardware: enciendes la placa nueva y, si sale humo, no te molestas en probar nada más. La mía hace una sola pregunta: ¿carga cada página del menú?

<!-- TODO: qué comprobaba a mano antes de cada fusión -->

## Lo que ya comprueba el build

SvelteKit prerenderiza mi sitio: al construirlo empieza por la portada, sigue cada enlace y escribe cada página como un archivo HTML. Un enlace a una página que no existe hace fallar el build. Así que los enlaces rotos ya están cubiertos.

Lo que el build no puede ver es lo que pasa después en el navegador. Llega el HTML y luego el JavaScript lo **hidrata**: se hace cargo de la página para que funcionen los botones, los filtros y el router. Si ese JavaScript lanza un error, la página sigue viéndose bien. El texto está ahí, pero no funciona nada de lo que hay detrás. Ningún paso del build se daría cuenta.

## Preparar Playwright

[Playwright](https://playwright.dev/) maneja navegadores de verdad (Chromium, Firefox, WebKit) desde un archivo de test.

```sh
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

La segunda línea descarga el propio navegador. Luego, un archivo de configuración, `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

const base = process.env.BASE_PATH ?? '/portfolio';
const port = 4174;

export default defineConfig({
	testDir: 'e2e',
	use: { baseURL: `http://localhost:${port}${base}/` },
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: `pnpm preview --port ${port} --strictPort`,
		env: { BASE_PATH: base },
		url: `http://localhost:${port}${base}/`
	}
});
```

`webServer` es la parte útil: Playwright arranca mi servidor de previsualización antes de los tests, espera a que `url` responda y lo para al final. El servidor sirve el **build**, con la misma ruta base que GitHub Pages, porque eso es lo que reciben los visitantes. Desarrollo no tiene ruta base, así que un enlace que se la olvida funciona en desarrollo y se rompe en producción.

Un script construye primero y luego prueba:

```json
"test:e2e": "BASE_PATH=/portfolio vite build && playwright test"
```

## El test

```ts
test('every nav link loads its page when clicked', async ({ page }) => {
	const errors = collectErrors(page);
	await page.goto('');
	const nav = page.getByRole('navigation', { name: 'Main navigation' });
	const links = await navLinks(page);

	for (const { label, url } of links) {
		await test.step(label, async () => {
			const link = nav.getByRole('link', { name: label, exact: true });
			await link.click();
			await expect(page).toHaveURL(url);
			await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
			await expect(link).toHaveAttribute('aria-current', 'page');
		});
	}
	expect(errors).toEqual([]);
});
```

Unas cuantas cosas que no esperaba:

- **Todas las funciones de Playwright son `async`**, porque cada una habla con un navegador que se ejecuta en otro proceso. Si olvidas un `await`, el test sigue adelante antes de que haya ocurrido el clic.
- **`getByRole` encuentra las cosas como lo hace un lector de pantalla**: una navegación llamada "Main navigation", un enlace llamado "Blog". Si mi menú perdiera su `aria-label`, el test fallaría. Es una ventaja: comprueba que la página está etiquetada.
- **Los enlaces salen del menú**, no de una lista en el test. Añade una sección, y ya se prueba.
- **`expect(page).toHaveURL()` espera.** Un clic inicia una navegación, que tarda un momento. En vez de un `sleep`, el `expect` de Playwright reintenta durante hasta cinco segundos hasta que la comprobación se cumple. `toBeVisible()` hace lo mismo.
- **`test.step()`** le pone nombre a cada enlace en el informe, así que un fallo dice "Blog", no solo "línea 41".

Un segundo test abre cada enlace directamente, sin pulsarlo: una carga completa de la página, como un visitante que llega desde un resultado de búsqueda. Comprueba que haya un `200` y un título que termine en mi nombre.

**Actualización:** el sitio ya está en inglés y en español, así que los dos tests se ejecutan una vez por idioma, empezando desde `/` y desde `/es`. El menú en español se llama "Navegación principal", cada enlace suyo tiene que seguir bajo `/es` y cada página tiene que decir `lang="es-ES"`. Un tercer test pulsa ahí el selector de idioma, de ida y vuelta.

## Detectar errores que no se ven

`collectErrors` es la parte que ve lo que el build no puede ver:

```ts
function collectErrors(page: Page): string[] {
	const errors: string[] = [];
	const add = (message: string) => errors.push(`${new URL(page.url()).pathname}: ${message}`);
	page.on('pageerror', (error) => add(error.message));
	page.on('console', (message) => {
		if (message.type() === 'error') add(message.text());
	});
	return errors;
}
```

`pageerror` se lanza con cualquier error no capturado en la página; los errores de `console` incluyen los archivos que no se pudieron cargar. Cada uno empieza con la ruta de la página, así que un fallo dice dónde ha sido.

Para comprobar que el test puede fallar, rompí una página a propósito:

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	onMount(() => {
		throw new Error('broken on purpose');
	});
</script>
```

El build pasó. Los dos tests fallaron, con `/portfolio/projects: Error: broken on purpose`. Un test que nunca has visto fallar todavía no ha demostrado nada.

<!-- TODO: probarlo: romper tú una página y leer el fallo, y luego abrir la traza (pnpm exec playwright show-trace …) -->

## En la CI

Mi workflow de GitHub ya comprobaba, pasaba el lint y construía cada PR. Ahora también ejecuta los tests unitarios y, después del build, la prueba de humo:

```yaml
- name: Unit tests
  run: pnpm test

- name: Build
  run: pnpm run build
  env:
    BASE_PATH: '/${{ github.event.repository.name }}'

- name: Install Chromium for Playwright
  run: pnpm exec playwright install --with-deps chromium

- name: Smoke test
  run: pnpm exec playwright test
  env:
    BASE_PATH: '/${{ github.event.repository.name }}'

- name: Upload Playwright traces
  if: failure()
  uses: actions/upload-artifact@v7
  with:
    name: playwright-traces
    path: test-results/
```

`--with-deps` también instala las librerías de Linux que necesita Chromium, que una máquina recién creada no tiene. Cuando la prueba de humo falla, se suben las trazas, y una traza es una repetición paso a paso del test, con una instantánea de la página en cada paso.

Una PR que rompe una página no se puede fusionar sin que antes vea yo una cruz roja.

## Enlaces

- [Playwright: escribir tests](https://playwright.dev/docs/writing-tests)
- [Playwright: localizadores](https://playwright.dev/docs/locators)
- [Playwright: servidor web](https://playwright.dev/docs/test-webserver)
- [Playwright: integración continua](https://playwright.dev/docs/ci)
- [Mis primeros tests unitarios encontraron un bug a la primera](./2026-11-04-unit-tests-with-vitest)
