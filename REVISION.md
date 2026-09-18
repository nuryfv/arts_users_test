# Guía de revisión

Prueba técnica: CRUD de usuarios con **CodeIgniter 4** (API REST) y **React +
TypeScript** (interfaz), desplegado con **Vercel**, **Render** y **Supabase**.

## Enlaces

| Qué | Dónde |
|---|---|
| Aplicación | https://frontend-mu-eight-lp1gcli032.vercel.app |
| API | https://arts-users-test.onrender.com |
| Estado del sistema | https://arts-users-test.onrender.com/api/health |
| Código | https://github.com/nuryfv/arts_users_test |

> **La primera carga puede tardar cerca de un minuto.** El backend está en el
> plan gratuito de Render, que suspende el servicio tras unos 15 minutos sin
> tráfico. Mientras despierta, la tabla mostrará «Cargando usuarios...». No es
> un fallo: basta esperar o recargar. A partir de ahí la respuesta es
> inmediata.

Para comprobar de un vistazo que todo está en pie, `/api/health` responde algo
así:

```json
{
  "status": "ok",
  "framework": "CodeIgniter 4.7.4",
  "php": "8.3.33",
  "environment": "production",
  "database": { "connected": true, "driver": "Postgre", "users": 12 },
  "time": "2026-09-18T18:01:01+00:00"
}
```

Si `database.connected` fuera `false`, el campo `reason` explicaría el motivo.

## Cómo está montado

```
Navegador
   │
   ├──► Vercel ............ interfaz React compilada (archivos estáticos)
   │
   └──► Render ............ API CodeIgniter 4 en contenedor Docker
             │
             └──► Supabase ... PostgreSQL 17.6
```

Vercel no ejecuta PHP, así que la API vive en Render, que sí corre el
contenedor definido en `backend/Dockerfile` (PHP 8.3 + Apache + drivers de
PostgreSQL). La interfaz llama a la API por HTTPS y Render autoriza el dominio
de Vercel mediante CORS.

El repositorio incluye además un reenvío en `frontend/vercel.json` que permite
servir la API bajo el propio dominio de Vercel (`/api` → Render). Es una
alternativa al esquema anterior que evita CORS por completo; ambas rutas
funcionan.

## Recorrido sugerido

1. Abre la aplicación y espera a que cargue la tabla (12 usuarios de ejemplo).
2. **Buscar**: escribe en el buscador; filtra por nombre, apellido o correo.
3. **Ordenar**: pulsa las cabeceras `#`, `Nombre`, `Correo` o `Edad`.
4. **Crear**: botón *Nuevo usuario*. Pulsa *Crear usuario* con el formulario
   vacío para ver la validación del navegador (no llega a salir ninguna
   petición). Prueba también un correo repetido: ese error solo puede
   detectarlo el servidor y llega como `422`.
5. **Editar**: *Editar* en cualquier fila; el formulario llega relleno.
6. **Eliminar**: pide confirmación antes de borrar.
7. **Tema claro/oscuro**: botón de la esquina superior derecha; la preferencia
   se recuerda.

La aplicación es de una sola pantalla, así que no hay enrutador.

## La API

El recurso está publicado en dos rutas equivalentes sobre el mismo
controlador: `/users` y `/api/users`.

| Método | Ruta | Respuestas |
|---|---|---|
| `GET` | `/users` | `200` — listado paginado con bloque `meta` |
| `GET` | `/users/{id}` | `200` · `404` |
| `POST` | `/users` | `201` · `422` |
| `PUT` \| `PATCH` | `/users/{id}` | `200` · `422` · `404` |
| `DELETE` | `/users/{id}` | `204` · `404` |

El listado acepta `?page=`, `?perPage=` (máximo 100), `?q=` (busca en nombre,
apellido y correo) y `?sort=` / `?order=`. Los campos ordenables están en lista
blanca, de modo que `?sort=` no admite inyección.

### Probar desde la terminal

```bash
# Listado
curl https://arts-users-test.onrender.com/users

# Detalle e inexistente
curl -i https://arts-users-test.onrender.com/users/1
curl -i https://arts-users-test.onrender.com/users/9999      # 404

# Validación: campos obligatorios
curl -i -X POST https://arts-users-test.onrender.com/users \
  -H 'Content-Type: application/json' -d '{}'                # 422

# Validación: edad fuera de rango
curl -i -X POST https://arts-users-test.onrender.com/users \
  -H 'Content-Type: application/json' \
  -d '{"first_name":"Ana","last_name":"Diaz","email":"a@b.co","gender":"otro","age":200}'
```

Los errores de validación llegan con el detalle por campo:

```json
{
  "status": 422,
  "error": 422,
  "messages": {
    "email": "Ya existe un usuario registrado con ese correo.",
    "age": "La edad no puede ser mayor a 125."
  }
}
```

## Qué pedía la prueba y dónde está

### Backend

| Requisito | Dónde verificarlo |
|---|---|
| CodeIgniter 4.7.x vía Composer, configuración por `.env` | `backend/composer.json`; `app/Config/Database.php` no lleva credenciales |
| Modelo + Query Builder + migraciones | `app/Models/UserModel.php`, `app/Database/Migrations/` |
| Validación en servidor: obligatorios, correo y unicidad | `UserModel::$validationRules` |
| API REST con los códigos indicados | `app/Controllers/Api/Users.php`, `app/Config/Routes.php` |
| CORS habilitado | `app/Config/Cors.php`, `app/Config/Filters.php` |
| Semilla de 10 o más usuarios | `app/Database/Seeds/UserSeeder.php` — inserta 12 |
| Prueba automatizada significativa | `tests/feature/UsersApiTest.php` — 15 pruebas de integración |

### Frontend

| Requisito | Dónde verificarlo |
|---|---|
| React + Vite + TypeScript consumiendo la API | `frontend/src/`, cliente en `src/lib/api.ts` |
| Tabla de usuarios | `src/components/UsersTable.tsx` |
| Formularios de alta y edición con validación en cliente | `src/components/UserForm.tsx`, `src/lib/validation.ts` |
| Borrado con confirmación | `src/components/ConfirmDialog.tsx` |
| Estados de carga y error | `src/App.tsx`, errores por campo traducidos en `src/services/users.ts` |

## Modelo de datos

Tabla `users` (esquema `public`):

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `integer` | clave primaria, autoincremental |
| `first_name` | `varchar(50)` | obligatorio |
| `last_name` | `varchar(50)` | obligatorio |
| `email` | `varchar(70)` | obligatorio, índice único |
| `gender` | `varchar(10)` | obligatorio |
| `telephone` | `varchar(20)` | opcional, `NULL` por defecto |
| `age` | `integer` | obligatorio, `CHECK (age >= 0 AND age <= 125)` |

Las reglas se aplican en tres capas: el navegador antes de enviar
(`validation.ts`), el servidor (`UserModel`) y la propia base de datos
(índice único y restricción `CHECK`).

## Ejecutar en local

Requisitos: PHP 8.1+ con `intl`, `mbstring`, `json`, `curl` y el driver de la
base; Composer 2; Node 20+; MySQL 8.0.16+ o PostgreSQL.

```bash
# Backend
cd backend
composer install
cp env .env          # completar CI_ENVIRONMENT, app.baseURL y database.default.*
php spark migrate
php spark db:seed UserSeeder
php spark serve --port 8080

# Frontend (en otra terminal)
cd frontend
npm install
cp .env.example .env # ajustar VITE_API_URL
npm run dev
```

El detalle de la configuración, incluidas las particularidades de Supabase,
está en el [README](README.md).

## Pruebas automatizadas

```bash
cd backend
./vendor/bin/phpunit --testdox
```

Deben pasar **20 pruebas**. Las 15 de `UsersApiTest` son de integración:
recorren ruta, controlador, modelo y base de datos, y comprueban los códigos de
estado, la persistencia real y los tres casos de validación. Se ejecutan sobre
SQLite en memoria, así que no necesitan configuración ni tocan ninguna base
real.

Comprobación de tipos del frontend:

```bash
cd frontend
npx tsc -b
```

## Decisiones que conviene conocer

**`PUT` se comporta como `PATCH`.** Los campos ausentes no se validan ni se
modifican, así que se puede actualizar solo un campo. Es cómodo, pero no es la
semántica estricta de `PUT` como reemplazo total.

**El listado viene paginado** (10 por página) en lugar de devolver todos los
registros de una vez.

**`gender` es un `varchar(10)` sin lista de valores.** La interfaz ofrece tres
opciones, pero la API acepta cualquier cadena de hasta 10 caracteres. Acotarlo
con `in_list[...]` o un `CHECK` sería el siguiente paso.

**La restricción `CHECK` de la edad depende del motor.** PostgreSQL la aplica
siempre; MySQL solo desde 8.0.16; SQLite no admite añadirla con `ALTER TABLE`,
y ahí queda cubierta por la validación del modelo. La migración contempla los
tres casos.

**El identificador se declara sin signo salvo en PostgreSQL**, que no tiene
enteros sin signo y crea la columna como `SERIAL`.

## Limitaciones conocidas

**La API no tiene autenticación.** Cualquiera que conozca la URL puede crear,
modificar o eliminar usuarios. No entraba en el alcance de la prueba, pero es
lo primero que habría que añadir antes de usar esto con datos reales.

**El backend se suspende por inactividad**, por el plan gratuito de Render.

**El disco del contenedor es efímero**: `writable/` se vacía en cada
despliegue. No afecta a nada porque solo guarda caché y registros.

**Los datos son de ejemplo.** Los 12 usuarios provienen del seeder y sus
correos usan el dominio ficticio `@artistshot.test`.
