# API de Jugadores y Rosters (eSports)

Esta es una API REST creada para la gestión de jugadores y la creación de rosters de League of Legends

**Stack:** Node.js, Express, Sequelize (migraciones) y MySQL.
## Requisitos

- Node.js 22.12 o superior (para realizar este proyecto se usó 24)
- MySQL 8
- Git
- Extensión REST Client de VS Code (para realizar las pruebas)

## Instalación

```bash
git clone https://github.com/AmericaGabrielCazaresMasse/Meta_3.2_DAW.git
cd Meta_3.2_DAW
npm install
```

## Configuración

1. Primero, copiar el contenido de `.env.example` a `.env` y ajustar los datos:

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=esports_db
DB_USER=root
DB_PASS=tu_password
```

2. Después, crear la base de datos en MySQL:

```sql
CREATE DATABASE esports_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Ejecuta las migraciones:

```bash
npx sequelize-cli db:migrate
```

Para deshacerlas: `npm run db:migrate:undo`.

## Uso

```bash
npm run dev     # desarrollo con nodemon
npm start       # producción
```

- API: `http://localhost:3000/api/v1`
- Documentación Swagger: `http://localhost:3000/api-docs`
- Pruebas: abre `tests/api.http` en VS Code y ejecuta las peticiones en orden.

## Endpoints

| Recurso | Endpoints |
|---|---|
| Jugadores | `GET/POST /jugadores`, `GET/PUT/DELETE /jugadores/{id}` |
| Rosters | `GET/POST /rosters`, `GET/PUT/DELETE /rosters/{id}` |
| Asignaciones | `GET/POST /rosters/{id}/jugadores`, `PUT/DELETE /rosters/{id}/jugadores/{id_jugador}` |
| Auxiliares | `GET /roles`, `/estados`, `/tipos-roster`, `/health` |

Filtros: `/jugadores?rol=&estado=&search=` y `/rosters?tipo=&temporada=`.

## Reglas de negocio

- RN-01: el nickname es único (409).
- RN-02: máximo 5 titulares por roster (409).
- RN-03: no puede haber dos titulares con el mismo rol en un roster (409).
- RN-04: un jugador puede estar en varios rosters.
- RN-05: al eliminar un roster, los jugadores permanecen.

## Códigos HTTP

200, 201, 204, 400 (datos inválidos), 404 (no encontrado), 409 (conflicto) y 500 (error interno).

## Roles de usuario

Aunque en las instrucciones de la meta se mencionan dos roles: Admin y Público, esta versión aún no implementa autenticación, se puede acceder a todos los endpoints sin credenciales.

## Estructura

```
src/
├── config/        configuración del CLI de Sequelize
├── controllers/   reciben la petición y responden
├── docs/          openapi.yaml y Swagger UI
├── middlewares/   manejo de errores
├── models/        modelos de Sequelize y relaciones
├── routes/        definición de rutas
├── services/      lógica y reglas de negocio
├── utils/         errores HTTP
├── app.js
└── server.js
migrations/        migraciones de Sequelize
tests/api.http     pruebas para REST Client
```

## Nota técnica

Los archivos `.sequelizerc` y `src/config/database.cjs` están ambos en CommonJS porque `sequelize-cli` no logró leer la configuración estando en formato ES Module . El resto del proyecto junto a las migraciones utilizan ES Modules.

## Alumno(a):

Cazares Masse América Gabriel