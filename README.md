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
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Deploy

Proyecto listo para desplegar en [Vercel](https://vercel.com/new) (framework Next.js, sin variables de entorno requeridas ya que el Sheet es de lectura pública).
