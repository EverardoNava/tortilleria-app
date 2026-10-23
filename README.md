# Cabrera · Tortillería de barrio

MVP full-stack con Next.js App Router, Tailwind CSS, Prisma y PostgreSQL. Incluye catálogo público, acceso de administración por sesión y CRUD de productos.

## Requisitos

- Node.js 20.9 o posterior
- PostgreSQL 14 o posterior
- npm

## Instalación

1. Instala dependencias:

	```bash
	npm install
	```

2. Crea una base PostgreSQL vacía llamada `tortilleria` y copia el archivo de entorno:

	```powershell
	Copy-Item .env.example .env
	```

	En macOS o Linux usa `cp .env.example .env`.

3. Edita `.env` con las credenciales de PostgreSQL y una contraseña de administrador propia. `ADMIN_PASSWORD` debe tener al menos 12 caracteres. Para desarrollo local configura `DATABASE_URL` y `DIRECT_URL` con la conexión directa a PostgreSQL (pueden tener el mismo valor).

4. Genera el cliente Prisma y aplica las migraciones:

	```bash
	npm run db:generate
	npm run db:migrate:deploy
	```

5. Crea el usuario administrador y los productos de ejemplo:

	```bash
	npm run db:seed
	```

6. Inicia la aplicación:

	```bash
	npm run dev
	```

Visita [http://localhost:3000](http://localhost:3000). El panel está en `/admin/login`.

## Docker

Con Docker Desktop en ejecución, prepara `.env` como en los pasos anteriores y cambia `POSTGRES_PASSWORD`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`. Después ejecuta:

```bash
docker compose up --build -d
```

Compose levanta PostgreSQL, espera a que esté saludable, crea las tablas, carga el usuario/productos iniciales y arranca Next.js en modo standalone. Abre [http://localhost:3000](http://localhost:3000); el panel está en `/admin/login`.

Para revisar los servicios usa `docker compose ps` y `docker compose logs -f app`. Para detenerlos ejecuta `docker compose down`; los datos PostgreSQL se conservan en el volumen `postgres_data`. `docker compose down -v` también elimina ese volumen y borra la base local.

El valor `milpa-dev-only` es solo una contraseña local de ejemplo para PostgreSQL. Cámbiala antes de compartir o publicar el stack; usa letras, números o guiones para que pueda incluirse sin ambigüedad en la URL de conexión que Compose construye.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | URL de conexión PostgreSQL usada por Prisma. |
| `DIRECT_URL` | URL directa usada por Prisma Migrate; puede igualar `DATABASE_URL` en local. |
| `ADMIN_EMAIL` | Correo del usuario creado por el seed. |
| `ADMIN_PASSWORD` | Contraseña inicial; el seed guarda únicamente su hash bcrypt. |
| `SESSION_COOKIE_SECURE` | `false` para desarrollo local por HTTP; configúralo como `true` al servir por HTTPS. En producción sin valor, la cookie se marca como segura. |

No uses los valores de ejemplo en producción. Mantén `.env` fuera del control de versiones.

## Administración

El inicio de sesión crea una cookie `httpOnly` con un token aleatorio; PostgreSQL conserva su hash y la sesión vence en siete días. Las rutas de alta, edición y borrado vuelven a comprobar la sesión en el servidor. Desde `/admin` puedes buscar, agregar, editar o eliminar productos.

La portada muestra productos activos. Si PostgreSQL aún no está configurado, el sitio público usa datos de muestra; el panel y las operaciones de escritura sí requieren una base disponible. Las imágenes se gestionan con una URL pública o una ruta local.

La oferta semanal, dirección, horario y contacto del sitio son contenido de ejemplo y se editan actualmente en `app/page.tsx`.

## Pedidos y ventas

Los clientes eligen productos, indican nombre, dirección y teléfono y reciben un folio aleatorio para consultar el estado en `/pedido/[folio]`. El estado se actualiza automáticamente en esa página. Los pedidos solo se aceptan de lunes a sábado de 07:00 a 19:00 y los domingos de 08:00 a 14:00, según la hora de Ciudad de México; el servidor vuelve a validar el horario antes de guardar.

En `/admin`, las secciones Pedidos y Ventas permiten revisar entregas, actualizar estados y descargar un CSV del corte del día. El reporte suma únicamente pedidos completados ese día.

## Despliegue en Vercel

El proyecto mantiene el build nativo de Next.js para Vercel. `vercel.json` ejecuta `npm run vercel-build`, que genera Prisma Client, aplica migraciones pendientes con `prisma migrate deploy` y compila Next.js. `output: standalone` solo se activa en la imagen Docker.

1. Sube el repositorio a Git y en Vercel selecciona **Add New Project** para importarlo. Conserva el preset **Next.js** y Node.js 22.
2. Provisiona PostgreSQL gestionado. Usa el endpoint pooled para `DATABASE_URL` en runtime y el endpoint directo para `DIRECT_URL` (migraciones). No uses la base local de Docker en Vercel.
3. En **Settings → Environment Variables**, configura `DATABASE_URL`, `DIRECT_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `SESSION_COOKIE_SECURE=true`. Usa contraseñas/usuarios propios, no los valores del ejemplo.
4. Asigna valores distintos a **Development**, **Preview** y **Production**. Preview debe tener una base aislada de Production para que una migración de una rama no altere datos reales. Vercel crea previews automáticamente para ramas/PRs y producción desde la rama configurada como Production Branch.
5. Importa o vincula el proyecto y despliega. El build ejecutará las migraciones antes de compilar; revisa el log del build para confirmar `prisma migrate deploy`.
6. Después del primer deploy, crea el administrador una sola vez usando variables del entorno de Production, sin escribirlas en un archivo local:

	```bash
	npx vercel env run -e production -- npm run db:seed
	```

### Base existente

Si la base de Vercel ya tiene las tablas creadas con `db:push`, marca la migración inicial como aplicada antes de activar el primer build Vercel. Hazlo solo después de confirmar que el esquema existente coincide con `prisma/schema.prisma`:

```bash
npx vercel env run -e production -- npx prisma migrate resolve --applied 20261022000000_init
```

No ejecutes ese comando sobre una base vacía. En una base vacía, el build aplica la migración inicial automáticamente.

### Migraciones futuras

En desarrollo local, configura también `DIRECT_URL` en `.env` (para PostgreSQL local puede ser igual a `DATABASE_URL`) y crea migraciones versionadas:

```bash
npm run db:migrate:dev -- --name nombre_del_cambio
```

Revisa y sube `prisma/migrations/` junto con el cambio de `schema.prisma`. Vercel aplicará esas migraciones al desplegar. No uses `db:push` en Production.

### Entornos

| Variable | Vercel Development | Vercel Preview | Vercel Production |
| --- | --- | --- | --- |
| `DATABASE_URL` | PostgreSQL de desarrollo, pooled o directo | Base Preview aislada, pooled | Base Production, pooled |
| `DIRECT_URL` | Endpoint directo de desarrollo | Endpoint directo Preview | Endpoint directo Production |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Cuenta de prueba | Cuenta Preview | Credenciales propias de producción |
| `SESSION_COOKIE_SECURE` | `true` al probar Vercel por HTTPS | `true` | `true` |

`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_PORT` solo son para Docker local; no son necesarios en Vercel. Mantén `.env` fuera de Git.

## Comprobaciones

```bash
npm test
npm run lint
npm run build
npm run db:migrate:deploy
```
