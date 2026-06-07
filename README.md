# Sanos y Salvos

Plataforma web y movil para registrar mascotas perdidas, publicar mascotas encontradas y buscar posibles coincidencias entre reportes.

## Descripcion

El proyecto esta construido con una arquitectura de microservicios. El frontend consume el `api-gateway`, y el gateway enruta las solicitudes hacia los servicios internos.

Funciones principales:

- Registro, login y edicion de usuarios.
- Registro de mascotas perdidas y encontradas.
- Listado, detalle y busqueda de reportes.
- Geolocalizacion de reportes.
- Busqueda de coincidencias entre perdidas y hallazgos.
- Autenticacion con JWT para acciones protegidas.

## Tecnologias

| Area | Tecnologias |
| --- | --- |
| Frontend | Ionic, Angular, TypeScript, Capacitor |
| Backend Node.js | Express, http-proxy-middleware, pino |
| Backend Java | Spring Boot, Spring Data JPA |
| Base de datos | PostgreSQL |
| App movil | Android con Capacitor |
| Autenticacion | JWT |

## Servicios

| Servicio | Puerto | Descripcion |
| --- | --- | --- |
| `frontend` | `4200` o `8100` | Aplicacion Ionic/Angular. |
| `api-gateway` | `3001` | Punto de entrada para el frontend. |
| `usuario-service` | `3004` | Usuarios, login y JWT. |
| `perdidas-service` | `3000` | Reportes de mascotas perdidas. |
| `hallazgos-service` | `3003` | Reportes de mascotas encontradas. |
| `buscador-service` | `3002` | Coincidencias entre reportes. |
| `geolocalizacion-service` | `3005` | Geocodificacion y ubicacion de reportes. |
| `eureka-server` | `8761` | Servicio de registro, disponible si se requiere. |

## Base De Datos

Los scripts estan en la raiz del proyecto:

- `DB Usuario.txt`
- `DB Perdida.txt`
- `DB Hallazgo.txt`
- `DB Geolocalizacion.txt`

Cada servicio con persistencia usa su propia base de datos PostgreSQL.

## Variables De Entorno

Crear un archivo `.env` en la raiz usando `.env.example` como base:

```powershell
Copy-Item .env.example .env
```

Configurar las variables de puertos, URLs internas, conexion a base de datos, JWT, CORS y logs segun el entorno local.

No subir archivos `.env` al repositorio.

## Instalacion

Instalar dependencias desde la raiz:

```powershell
.\instalar-todos.bat
```

O manualmente en cada servicio Node.js:

```bash
npm install
```

`usuario-service` y `eureka-server` usan Maven Wrapper.

## Ejecucion Local

Antes de levantar la aplicacion, crear las bases de datos y ejecutar los scripts SQL correspondientes.

Para levantar los servicios principales desde la raiz:

```powershell
.\ejecutar-servicios.ps1
```

Para levantar el frontend manualmente:

```bash
cd frontend
ionic serve
```

Tambien se puede usar:

```bash
npm start
```

El frontend local consume el backend desde:

```text
http://localhost:3001/api
```

## Android Local

El proyecto frontend esta preparado con Capacitor para Android.

Para compilar la version usada por emulador Android:

```powershell
cd frontend
npx ng build --configuration android
npx cap sync android
npx cap open android
```

En emulador Android, la app usa `10.0.2.2` para conectarse al backend local de la maquina anfitriona.

Antes de ejecutar la app en Android Studio, los servicios backend deben estar levantados localmente.

## Endpoints Principales

El frontend consume las rutas mediante el `api-gateway`:

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
| GET | `/api/buscador` | Buscar coincidencias. |
| GET | `/api/buscador/:perdidaId` | Buscar coincidencias desde una perdida. |
| GET | `/api/geolocalizacion/geocodificar` | Buscar coordenadas por direccion. |
| GET | `/api/geolocalizacion/reverso` | Buscar direccion por coordenadas. |

Los servicios incluyen endpoint `GET /health` para revision local.

## Autenticacion

El login entrega un token JWT. Las acciones protegidas deben enviar el token en el header:

```text
Authorization: Bearer <token>
```

Crear y editar reportes requiere sesion iniciada. Las consultas publicas de reportes y busqueda no requieren sesion.

## Consideraciones

- El gateway es el punto de entrada recomendado para el frontend.
- Mantener secretos, credenciales y configuraciones privadas fuera del repositorio.
- Los scripts SQL pueden reiniciar tablas si se ejecutan completos.
- Para pruebas Android locales se debe usar la configuracion `android` del frontend.
- Para produccion se debe configurar una URL publica segura para el gateway.

## Equipo

- Carlos Guerrero
- Carla Poveda
