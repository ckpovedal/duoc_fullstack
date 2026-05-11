# Sanos y Salvos

Plataforma para registrar mascotas perdidas, publicar mascotas encontradas y buscar posibles coincidencias entre reportes.

## Descripcion

El proyecto esta construido con una arquitectura de microservicios. El frontend consume el `api-gateway`, y el gateway enruta las solicitudes hacia los servicios internos.

Funciones principales:

- Registro, login y edicion de usuarios.
- Registro de mascotas perdidas y encontradas.
- Listado, detalle y busqueda de reportes.
- Busqueda de coincidencias entre perdidas y hallazgos.
- Autenticacion con JWT para acciones protegidas.

## Tecnologias

| Area | Tecnologias |
| --- | --- |
| Frontend | Ionic, Angular, TypeScript |
| Backend Node.js | Express, http-proxy-middleware, pino |
| Backend Java | Spring Boot, Spring Data JPA |
| Base de datos | PostgreSQL |
| Autenticacion | JWT |

## Estructura

```text
duoc_fullstack/
  frontend/
  api-gateway/
  usuario-service/
  perdidas-service/
  hallazgos-service/
  buscador-service/
  logs/
```

## Servicios

| Servicio | Puerto | Descripcion |
| --- | --- | --- |
| `frontend` | `4200` o `8100` | Aplicacion Ionic/Angular. |
| `api-gateway` | `3001` | Punto de entrada para el frontend. |
| `usuario-service` | `3004` | Usuarios, login, claves hasheadas y JWT. |
| `perdidas-service` | `3000` | Reportes de mascotas perdidas. |
| `hallazgos-service` | `3003` | Reportes de mascotas encontradas. |
| `buscador-service` | `3002` | Coincidencias entre reportes. |

## Base De Datos

Los scripts estan en la raiz del proyecto:

- `DB Usuario.txt`
- `DB Perdida.txt`
- `DB Hallazgo.txt`

Bases utilizadas:

| Servicio | Base de datos | Tabla |
| --- | --- | --- |
| `usuario-service` | `usuario_db` | `USUARIO` |
| `perdidas-service` | `perdida_db` | `PERDIDA` |
| `hallazgos-service` | `hallazgo_db` | `HALLAZGO` |

`buscador-service` no tiene base de datos propia; consulta perdidas y hallazgos.

## Variables De Entorno

Crear un archivo `.env` en la raiz usando `.env.example` como base:

```powershell
Copy-Item .env.example .env
```

Variables principales:

- Puertos y URLs de servicios: `API_GATEWAY_PORT`, `USUARIO_SERVICE_URL`, `PERDIDAS_SERVICE_URL`, `HALLAZGOS_SERVICE_URL`, `BUSCADOR_SERVICE_URL`.
- Conexion a PostgreSQL: `USUARIO_DB_*`, `PERDIDAS_DB_*`, `HALLAZGOS_DB_*`.
- JWT: `JWT_SECRET`, `JWT_EXPIRACION_MS`.
- Logs: `LOG_LEVEL`.

## Instalacion

Instalar dependencias manualmente:

```bash
cd frontend
npm install

cd ../api-gateway
npm install

cd ../perdidas-service
npm install

cd ../hallazgos-service
npm install

cd ../buscador-service
npm install
```

`usuario-service` usa Maven Wrapper, por lo que no requiere `npm install`.

Tambien se puede instalar todo desde la raiz:

```powershell
.\instalar-todos.bat
```

## Ejecucion

Antes de levantar la aplicacion, crear las bases de datos y ejecutar los scripts SQL correspondientes.

Para levantar todo desde la raiz:

```powershell
.\ejecutar-servicios.ps1
```

Para levantar manualmente:

```bash
cd api-gateway
npm run dev
```

```bash
cd perdidas-service
npm run dev
```

```bash
cd hallazgos-service
npm run dev
```

```bash
cd buscador-service
npm run dev
```

```powershell
cd usuario-service
.\mvnw.cmd spring-boot:run
```

```bash
cd frontend
npm start
```

Si se usa Ionic CLI:

```bash
ionic serve
```

## Endpoints Principales

El frontend consume el backend desde:

```text
http://localhost:3001/api
```

| Metodo | Ruta | Uso |
| --- | --- | --- |
| POST | `/api/usuarios` | Crear usuario. |
| POST | `/api/usuarios/login` | Iniciar sesion. |
| GET | `/api/usuarios/:id` | Obtener usuario. |
| PUT | `/api/usuarios/:id` | Actualizar usuario. |
| GET | `/api/perdidas` | Listar perdidas. |
| POST | `/api/perdidas` | Crear perdida. |
| GET | `/api/perdidas/:id` | Ver perdida. |
| PUT | `/api/perdidas/:id` | Actualizar perdida. |
| PATCH | `/api/perdidas/:id/estado` | Cambiar estado de perdida. |
| GET | `/api/hallazgos` | Listar hallazgos. |
| POST | `/api/hallazgos` | Crear hallazgo. |
| GET | `/api/hallazgos/:id` | Ver hallazgo. |
| PUT | `/api/hallazgos/:id` | Actualizar hallazgo. |
| GET | `/api/buscador` | Buscar coincidencias por parametros. |
| GET | `/api/buscador/:perdidaId` | Buscar coincidencias desde una perdida. |

Los servicios tambien tienen `GET /health` para revisar si estan operativos.

## Autenticacion

El login entrega un token JWT. Las acciones de escritura deben enviarlo en el header:

```text
Authorization: Bearer <token>
```

Crear y editar reportes requiere sesion iniciada. Las consultas publicas de perdidas, hallazgos y buscador no requieren token.

## Logs

Los logs locales quedan en la carpeta `logs/`. El nivel se controla con `LOG_LEVEL` desde `.env`.

## Consideraciones

- Los scripts de base de datos incluyen `DROP TABLE`, por lo que reinician las tablas si se ejecutan completos.
- El gateway es el punto de entrada recomendado para el frontend.
- `perdidas-service` y `hallazgos-service` validan usuarios consultando `usuario-service`.
- No subir `.env`, logs ni archivos temporales al repositorio.

## Equipo

- Carlos Guerrero
- Carla Poveda
