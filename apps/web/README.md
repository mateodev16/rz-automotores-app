# RZ Automotores — Web (Astro)

Sitio público y panel de administración de RZ Automotores, en Astro 7 + Tailwind CSS v4.

## Comandos

```bash
npm run dev       # servidor de desarrollo (http://localhost:4321)
npm run build     # build SSR -> dist/ (servidor Node standalone)
npm run preview   # previsualiza el build
npm run astro     # CLI de Astro
```

## Configuración

```bash
cp .env.example .env
```

- `API_URL`: API que consulta el servidor en cada request (por defecto `http://localhost:4000`).
- `PUBLIC_API_URL`: API que usa el navegador (login y panel de administración).
- `PUBLIC_WHATSAPP_NUMBER`: número de WhatsApp de los CTA.

Si la API no responde, el sitio renderiza el catálogo de demostración de
`src/lib/demo-cars.ts`.

## Estructura

```
src/
+-- components/       # Header, Hero, Stock, CarCard, CarModal, About, Locations, Footer...
|   +-- admin/        # VehicleForm
+-- layouts/          # Layout (sitio público) y AdminLayout (panel)
+-- lib/
|   +-- config.ts     # Config compartida (API URL, WhatsApp)
|   +-- api.ts        # Cliente HTTP del servidor (usa process.env)
|   +-- client.ts     # Helpers de navegador para el panel (token, fetch)
|   +-- cars.ts       # Carga del catálogo + normalización + fallback demo
|   +-- demo-cars.ts  # Vehículos de demostración
|   +-- format.ts     # Formato de precio y kilometraje (es-UY)
|   +-- types.ts
+-- pages/
|   +-- index.astro
|   +-- vehiculos/index.astro
|   +-- vehiculo/[id].astro
|   +-- admin/...
+-- styles/global.css # Tema Tailwind v4 + clases del diseño
```

## Rutas

- `/` — home
- `/vehiculos` — catálogo con filtros
- `/vehiculo/[id]` — ficha del vehículo
- `/admin/login`, `/admin`, `/admin/autos/nuevo`, `/admin/autos/editar/[id]`
