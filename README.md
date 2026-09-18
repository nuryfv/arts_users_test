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

## Despliegue

El reparto es: **interfaz en Vercel**, **API en Render o Railway** y **base de
datos en Supabase**. Vercel no ejecuta PHP, por eso el backend va aparte.

### Base de datos (Supabase)

Supabase es PostgreSQL, así que el backend se conecta con el driver `Postgre`.
En el panel de Supabase, la cadena de conexión está en *Connect > Connection
string*. Hay que tomar la del **Session pooler**, no la de conexión directa:

```ini
database.default.hostname = aws-0-<region>.pooler.supabase.com
database.default.database = postgres
database.default.username = postgres.<referencia-del-proyecto>
database.default.password = <tu-contraseña>
database.default.DBDriver = Postgre
database.default.port     = 5432
database.default.schema   = public
database.default.charset  = UTF8
```

Dos detalles que hacen fallar la conexión si se pasan por alto:

- **El host directo (`db.<ref>.supabase.co`) solo publica registro IPv6.** En
  una red sin IPv6 no resuelve y el error es `could not translate host name
  ... Name or service not known`, que parece un fallo de DNS pero es falta de
  IPv4. El pooler sí responde por IPv4, y su usuario lleva el sufijo del
  proyecto: `postgres.<referencia>`.
- **`charset` debe ser `UTF8`.** El valor por defecto de CodeIgniter es
  `utf8mb4`, propio de MySQL, y PostgreSQL lo rechaza con
  `invalid value for parameter "client_encoding"`.

La tabla se crea en el esquema `public`. Supabase ya tiene una tabla `users`
propia en el esquema `auth` para su sistema de autenticación: son distintas y
no se interfieren, pero conviene saberlo porque algún comando de CodeIgniter
(como `spark db:table users`) puede mostrar la de `auth` en su lugar.

Las migraciones se aplican igual que en local:

```bash
php spark migrate
php spark db:seed UserSeeder
```

### API (Render)

La raíz del repositorio incluye `render.yaml`, así que el servicio se crea
desde un *Blueprint*: en Render, **New > Blueprint** y seleccionar este
repositorio. El resto (imagen Docker, contexto, comprobación de salud en
`/api/health`) ya viene definido.

Render pedirá las variables marcadas como secretas:

| Variable | Valor |
|---|---|
| `database_default_hostname` | host del *Session pooler* de Supabase |
| `database_default_username` | `postgres.<referencia-del-proyecto>` |
| `database_default_password` | la contraseña de la base |
| `cors_allowedOrigins` | el dominio de Vercel, p. ej. `https://arts-users-test.vercel.app` |

**Los nombres van con guion bajo, no con punto.** En el archivo `.env` local se
escriben como `database.default.hostname`, pero el panel de Render no admite
puntos en los nombres de variables. CodeIgniter reconoce las dos formas
(`BaseConfig::getEnvValue` prueba ambas), así que basta con sustituir los
puntos por guiones bajos: `database.default.hostname` pasa a ser
`database_default_hostname`, y `app.baseURL` a `app_baseURL`.

Si se usan puntos, no fallará de forma visible: la aplicación arrancará
igualmente y usará los valores por defecto de `app/Config/Database.php`, que
apuntan a MySQL. El síntoma es un error de driver `mysqli` no disponible, que
despista bastante porque no menciona las variables.

Las demás (`CI_ENVIRONMENT`, driver, puerto, esquema) ya están fijadas en el
blueprint. `cors_allowedOrigins` admite varios dominios separados por comas; si
no se define, se usan los orígenes de desarrollo de `app/Config/Cors.php`.

Para crear la tabla en el primer despliegue hay que poner `RUN_MIGRATIONS` en
`true` (y `RUN_SEED` en `true` si quieres los 12 usuarios de ejemplo) y volver
a desplegar. Conviene devolverlas a `false` después: las migraciones ya
aplicadas no se repiten, pero así el arranque es más rápido.

> **Plan gratuito de Render:** el servicio se suspende tras unos 15 minutos sin
> tráfico y la siguiente petición tarda cerca de un minuto en responder
> mientras el contenedor vuelve a arrancar. La primera carga de la interfaz
> después de un rato de inactividad parecerá colgada; no es un fallo de la
> aplicación. El disco también es efímero: `writable/` se vacía en cada
> despliegue, lo cual no afecta a nada porque solo guarda caché y registros.

### Interfaz (Vercel)

Al importar el repositorio hay que indicar:

- **Root Directory**: `frontend`
- **Framework Preset**: Vite (lo detecta solo)

No hace falta definir `VITE_API_URL`. `frontend/vercel.json` reenvía todo lo
que llegue a `/api` hacia el backend de Render, de modo que el navegador
siempre habla con un único dominio:

```json
{ "source": "/api/:ruta*", "destination": "https://<servicio>.onrender.com/api/:ruta*" }
```

Esto tiene dos ventajas: **CORS deja de intervenir** (no hay cruce de
orígenes) y la URL del backend vive en un archivo versionado en vez de en una
variable del panel. Si cambia el dominio de Render, hay que actualizar ese
`destination`.

El orden de los `rewrites` importa: la regla de `/api` va **antes** que la
que redirige todo a `index.html`. Al revés, las llamadas a la API devolverían
la página HTML con un código 200, y la aplicación fallaría al interpretar esa
respuesta como JSON.

Si prefieres que el navegador llame directamente a Render en lugar de pasar
por el proxy, define `VITE_API_URL` con la URL completa de la API
(`https://<servicio>.onrender.com/api`) y añade el dominio de Vercel a
`cors_allowedOrigins` en Render. Esa variable se lee **al compilar**, así que
hay que volver a desplegar en Vercel cada vez que cambie.

### Orden recomendado

1. Crear la base en Supabase y anotar la cadena de conexión.
2. Desplegar la API con `RUN_MIGRATIONS=true` y comprobar que responde en
   `/api/health`.
3. Desplegar la interfaz en Vercel con `VITE_API_URL` apuntando a esa API.
4. Añadir el dominio de Vercel a `cors.allowedOrigins` en el servicio de la API
   y volver a desplegarla.

El paso 4 es fácil de olvidar: sin él, el navegador bloquea las peticiones por
CORS aunque la API funcione perfectamente al llamarla directamente.

## Seguridad

La API **no tiene autenticación**: cualquiera con acceso al puerto puede listar,
modificar o eliminar usuarios. Esto es aceptable en local, pero **una vez
desplegada queda abierta a Internet**: cualquiera que encuentre la URL puede
leer, modificar o borrar los registros. Antes de dejarla publicada de forma
permanente hay que añadir una capa de autenticación.
