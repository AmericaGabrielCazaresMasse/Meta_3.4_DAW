# Rosters eSports: Frontend y Backend

Aplicación para que el rol **Admin** gestione jugadores y rosters de League of Legends.
Los GET son públicos (rol Público); crear, editar y eliminar exige sesión de Admin.

- **Backend:** Node.js, Express, Sequelize y MySQL (ES Modules) en `backend/esports-api`
- **Frontend:** Vue 3 y Vuetify (JavaScript) en `frontend/frontend-esports`
- **Autorización:** JWT en cookie HTTP-Only + token CSRF en el header `x-csrf-token`

## Requisitos

Node.js 22.12 o superior, MySQL 8 y Git.

## Backend

```bash
cd backend/esports-api
npm install
```

1. Copia `.env.example` a `.env` y completa los valores (incluye `JWT_SECRET`, `ADMIN_USER` y `ADMIN_PASS`).
2. Crea la base de datos:

```sql
CREATE DATABASE esports_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Migraciones, usuario Admin y servidor:

```bash
npx sequelize-cli db:migrate
npm run crear-admin
npm run dev
```

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api-docs`
- Pruebas REST Client: `backend/esports-api/tests/api.http` y `auth.http`

## Frontend

```bash
cd frontend/frontend-esports
npm install
npm run dev
```

Abre `http://localhost:5173` (usa `localhost`, no `127.0.0.1`) e inicia sesión con el Admin del `.env`.

## Autenticación

- `POST /api/v1/auth/login`: crea las cookies `jwt_token` (HTTP-Only) y `csrf_token`, y devuelve `csrfToken`.
- `POST /api/v1/auth/logout`: elimina las cookies.
- `GET /api/v1/auth/verify`: comprueba la sesión y devuelve `csrfToken`.
- POST, PUT y DELETE: requieren la cookie y el header `x-csrf-token` (401 sin sesión, 403 si el token CSRF es inválido).

## Pantallas del Admin

`/login`, `/jugadores`, `/rosters` y `/rosters/:id` (asignar jugadores, Titular/Suplente).

## Reglas de negocio

Nickname único (409), máximo 5 titulares por roster (409), sin dos titulares con el mismo rol (409),
un jugador puede estar en varios rosters y al eliminar un roster los jugadores permanecen.

## Alumno(a)

Cazares Masse América Gabriel
