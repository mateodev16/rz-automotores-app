# RZ Automotores

Sitio web para RZ Automotores - Concesionaria de autos en Montevideo y Minas, Uruguay.

## Tecnologías
- Frontend: Astro + Tailwind CSS
- Backend: Node.js + Express
- Base de datos: PostgreSQL

## Instalación

### Requisitos
- Node.js 18+
- PostgreSQL

### Configuración

1. Instalar dependencias
`ash
npm install
`

2. Configurar base de datos
`ash
cd apps/api
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
`

3. Ejecutar migraciones
`ash
npm run migrate
`

Credenciales por defecto: admin@rzautomotores.com / admin123

4. Ejecutar en desarrollo
`ash
npm run dev
`

- Frontend: http://localhost:4321
- API: http://localhost:4000

## Panel de Administración
- URL: http://localhost:4321/admin/login
- Agregar, editar y eliminar vehículos
- Subir múltiples imágenes
- Marcar vehículos como destacados

## Contacto
WhatsApp: 095 530 258
