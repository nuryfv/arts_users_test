# Artistshot — Gestión de usuarios

Aplicación CRUD de usuarios con **CodeIgniter 4** como API REST y **React + TypeScript** como interfaz.

```
backend/    CodeIgniter 4.7 — API REST, migraciones, seeders y pruebas
frontend/   Vite + React 19 + TypeScript — interfaz que consume la API
```

## Requisitos

- PHP 8.1 o superior con las extensiones `intl`, `mbstring`, `json` y `curl`
- Composer 2
- Node.js 20 o superior
- MySQL 8.0.16 o superior

> La versión mínima de MySQL importa: la restricción `CHECK` que limita la edad
> solo se aplica desde 8.0.16. En versiones anteriores la base la ignora y el
> rango queda defendido únicamente por la validación del modelo.

## Puesta en marcha

### Backend

```bash
cd backend
composer install
cp env .env
```

Edita `.env` y completa al menos:

```ini
CI_ENVIRONMENT = development
app.baseURL = 'http://localhost:8080/'

database.default.hostname = 127.0.0.1
database.default.database = art_users_test
database.default.username = root
database.default.password = TU_CONTRASEÑA
database.default.DBDriver = MySQLi
database.default.port = 3306
```

Crea la base de datos, aplica las migraciones y carga los datos de ejemplo:

```bash
php spark migrate
php spark db:seed UserSeeder
php spark serve --port 8080
```

El seeder inserta 12 usuarios y es idempotente: puede ejecutarse varias veces
sin duplicar registros.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Ajusta `VITE_API_URL` en `.env` si la API no está en la URL por defecto.

## Origen único (opcional)

El backend puede servir también la interfaz, de modo que todo quede bajo un
mismo dominio y desaparezca el CORS. El build de Vite se escribe directamente
en `backend/public/app`:

```bash
cd frontend
npm run build
```

Con eso, la raíz del backend entrega la aplicación y la API queda en `/users`
del mismo dominio (en el `.env` de producción `VITE_API_URL` es `/api`).

El directorio `backend/public/app` no se versiona: se regenera con ese comando.

## API

El recurso está publicado en dos rutas equivalentes, `/users` y `/api/users`,
sobre el mismo controlador.

| Método | Ruta | Respuestas |
|---|---|---|
| `GET` | `/users` | `200` — listado paginado con bloque `meta` |
| `GET` | `/users/{id}` | `200` · `404` |
| `POST` | `/users` | `201` · `422` |
| `PUT` \| `PATCH` | `/users/{id}` | `200` · `422` · `404` |
| `DELETE` | `/users/{id}` | `204` · `404` |

El listado acepta `?page=`, `?perPage=` (máximo 100), `?q=` (busca en nombre,
apellido y correo) y `?sort=` / `?order=`. Los campos ordenables están en lista
blanca.

Los errores de validación llegan como `422` con el detalle por campo:

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

CORS está habilitado para `http://localhost:5173` en
`backend/app/Config/Cors.php`. Añade ahí cualquier otro origen que deba
consumir la API.

## Modelo de datos

Tabla `users`:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `INT UNSIGNED` | auto-increment, clave primaria |
| `first_name` | `VARCHAR(50)` | obligatorio |
| `last_name` | `VARCHAR(50)` | obligatorio |
| `email` | `VARCHAR(70)` | obligatorio, único |
| `gender` | `VARCHAR(10)` | obligatorio |
| `telephone` | `VARCHAR(20)` | opcional, `NULL` por defecto |
| `age` | `INT` | obligatorio, `CHECK (age >= 0 AND age <= 125)` |

Las mismas reglas se validan en tres capas: en el navegador antes de enviar
(`frontend/src/lib/validation.ts`), en el servidor
(`backend/app/Models/UserModel.php`) y en la propia base de datos.

## Pruebas

```bash
cd backend
./vendor/bin/phpunit --testdox
```

`tests/feature/UsersApiTest.php` contiene 15 pruebas de integración que
recorren ruta, controlador, modelo y base de datos. Se ejecutan sobre SQLite en
memoria, así que no tocan la base de desarrollo ni requieren configuración.

Comprobación de tipos del frontend:

```bash
cd frontend
npx tsc -b
```

## Seguridad

La API **no tiene autenticación**: cualquiera con acceso al puerto puede listar,
modificar o eliminar usuarios. Antes de exponerla fuera de un entorno local hay
que añadir una capa de autenticación.
