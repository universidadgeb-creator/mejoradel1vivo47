# Dashboard Mejora del 1% — Vivo 47

Dashboard de seguimiento de la iniciativa "Mejora del 1%" de Vivo 47, construido con Next.js. Lee en vivo la hoja de Google Sheets ["1% Mejor | Base y Dashboard"](https://docs.google.com/spreadsheets/d/17jANIWXZYQt6EY0p7VRpC1XeAzH-2ploBhebml-9XyU/edit) (hoja `Respuestas`) vía su export CSV público, sin necesidad de credenciales.

## Qué incluye

- KPIs: Total YTD, mejoras del mes, última semana completa vs. meta, cumplimiento semanal, club/país líder y racha de país líder.
- Tendencia semanal (Vivo 47 / por club / por país) contra la meta.
- Mejoras por club y por país, top 10 países, top 5 rachas.
- Participación por club (mejoras y países activos de la última semana completa vs. su universo de países).
- Filtros por rango de fechas, semana, mes, año y por club (tabs).
- Exportar a CSV los datos actualmente filtrados.
- **Quién sube las mejoras**: ranking de colaboradores y desglose por sucursal → equipo (país) → colaborador, con búsqueda y orden por columna.

## Cómo funciona la data

- `src/lib/sheet.ts` descarga la hoja `Respuestas` como CSV público (`/gviz/tq?tqx=out:csv&sheet=...`), cacheado 5 minutos (`revalidate: 300`); el botón "Refrescar" fuerza una lectura sin caché.
- `src/lib/normalize.ts` convierte cada fila en un objeto `Mejora` (fecha, semana ISO, club, país, colaborador, etc.) y descarta las filas de "Oficina Central" (pruebas internas).
- `src/lib/rosters.ts` define el universo oficial de países por club (Naciones Unidas, Gourmetería, Valle Real), usado para calcular metas semanales y participación. Si cambia el roster de un club, actualízalo ahí.
- `src/lib/stats.ts` calcula todas las métricas del dashboard a partir de los datos normalizados y los filtros activos.

## Desarrollo local

```bash
npm install
npm run generate-data   # descarga el sheet y genera public/data.json (necesita salida a internet)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El repo ya incluye un `public/data.json` de arranque para que `npm run dev` muestre datos reales sin tener que correr `generate-data` primero.

## Deploy: GitHub Pages

El sitio es 100% estático (`output: "export"` en `next.config.ts`) porque Google Sheets no permite leer el CSV directamente desde el navegador (sin CORS), así que los datos se descargan **en el build**, no en el navegador del usuario:

1. `.github/workflows/deploy.yml` corre en cada push a `main`, cada 30 minutos (`schedule`) y manualmente (`workflow_dispatch`).
2. El workflow ejecuta `npm run generate-data` (trae el sheet fresco a `public/data.json`), luego `npm run build` (export estático a `out/`) y publica ese resultado en GitHub Pages.
3. La app en el navegador solo lee el `data.json` ya generado — el botón "Refrescar" vuelve a pedir ese mismo archivo sin caché, útil si el workflow acaba de correr.

**Activar Pages una sola vez:** en el repo de GitHub, ve a `Settings → Pages` y en "Source" elige **GitHub Actions**. Después de eso, el sitio queda publicado en `https://<usuario>.github.io/mejoradel1vivo47/` y se mantiene actualizado solo.

Si el repo cambia de nombre, actualiza `repoName` en `next.config.ts` (controla el `basePath` con el que se sirven los assets).
