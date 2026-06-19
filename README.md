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
- Mensajeria entre usuarios desde reportes.
- Notificaciones internas, push y en tiempo real.
- Donativos generales simulados para apoyar la plataforma.
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
| `mensajeria-service` | `3006` | Conversaciones y mensajes entre usuarios. |
| `donativos-service` | `3007` | Registro y administracion de donativos simulados. |
| `notificaciones-service` | `3008` | Notificaciones internas, push y Socket.IO. |
| `eureka-server` | `8761` | Servicio de registro, disponible si se requiere. |

## Base De Datos

Los scripts estan en la raiz del proyecto:

- `DB Usuario.txt`
- `DB Perdida.txt`
- `DB Hallazgo.txt`
- `DB Geolocalizacion.txt`
- `DB Mensajeria.txt`
- `DB Notificaciones.txt`
- `DB Donativos.txt`

Cada servicio con persistencia usa su propia base de datos PostgreSQL.

## Variables De Entorno

Crear un archivo `.env` en la raiz usando `.env.example` como base:

```powershell
Copy-Item .env.example .env
```

Configurar las variables de puertos, URLs internas, conexion a base de datos, JWT, CORS y logs segun el entorno local.

No subir archivos `.env` al repositorio.

Crear las bases de datos de los servicios con persistencia y ejecutar el script SQL correspondiente.

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
| GET | `/api/usuarios` | Listar usuarios. |
| GET | `/api/usuarios/:id` | Obtener usuario. |
| GET | `/api/usuarios/contactos/:id` | Obtener datos de contacto de un usuario. |
| PUT | `/api/usuarios/:id` | Actualizar usuario. |
| GET | `/api/perdidas` | Listar perdidas. |
| POST | `/api/perdidas` | Crear perdida. |
| GET | `/api/perdidas/:id` | Ver perdida. |
| GET | `/api/perdidas/:id/imagen` | Obtener imagen de perdida. |
| PUT | `/api/perdidas/:id` | Actualizar perdida. |
| PATCH | `/api/perdidas/:id/estado` | Cambiar estado de perdida. |
| GET | `/api/hallazgos` | Listar hallazgos. |
| POST | `/api/hallazgos` | Crear hallazgo. |
| GET | `/api/hallazgos/:id` | Ver hallazgo. |
| GET | `/api/hallazgos/:id/imagen` | Obtener imagen de hallazgo. |
| PUT | `/api/hallazgos/:id` | Actualizar hallazgo. |
| GET | `/api/buscador` | Buscar coincidencias. |
| GET | `/api/buscador/:perdidaId` | Buscar coincidencias desde una perdida. |
| GET | `/api/buscador/hallazgo/:hallazgoId` | Buscar coincidencias desde un hallazgo. |
| GET | `/api/geolocalizacion/geocodificar` | Buscar coordenadas por direccion. |
| POST | `/api/geolocalizacion/geocodificar` | Buscar coordenadas por direccion usando body. |
| GET | `/api/geolocalizacion/reverso` | Buscar direccion por coordenadas. |
| POST | `/api/geolocalizacion/reverso` | Buscar direccion por coordenadas usando body. |
| GET | `/api/geolocalizacion/ubicaciones` | Listar ubicaciones. |
| POST | `/api/geolocalizacion/ubicaciones` | Guardar ubicacion de reporte. |
| GET | `/api/geolocalizacion/ubicaciones/:id` | Obtener ubicacion. |
| PUT | `/api/geolocalizacion/ubicaciones/:id` | Actualizar ubicacion. |
| PATCH | `/api/geolocalizacion/ubicaciones/:id/estado` | Cambiar estado de ubicacion. |
| GET | `/api/geolocalizacion/reportes/:tipoReporte/:reporteId` | Obtener ubicacion por reporte. |
| GET | `/api/geolocalizacion/zonas` | Listar zonas de interes. |
| POST | `/api/geolocalizacion/zonas` | Crear zona de interes. |
| GET | `/api/geolocalizacion/zonas/:id` | Obtener zona de interes. |
| PUT | `/api/geolocalizacion/zonas/:id` | Actualizar zona de interes. |
| PATCH | `/api/geolocalizacion/zonas/:id/estado` | Cambiar estado de zona de interes. |
| POST | `/api/mensajeria/conversaciones` | Crear conversacion. |
| GET | `/api/mensajeria/conversaciones/usuario/:uId` | Listar conversaciones de un usuario. |
| GET | `/api/mensajeria/conversaciones/:convId/mensajes` | Listar mensajes de una conversacion. |
| POST | `/api/mensajeria/mensajes` | Enviar mensaje. |
| PUT | `/api/mensajeria/mensajes/:msgId/leido` | Marcar mensaje como leido. |
| POST | `/api/notificaciones/dispositivos` | Registrar dispositivo para push. |
| PATCH | `/api/notificaciones/dispositivos/desactivar` | Desactivar dispositivo registrado. |
| GET | `/api/notificaciones` | Listar notificaciones del usuario autenticado. |
| PATCH | `/api/notificaciones/:id/leida` | Marcar notificacion como leida. |
| POST | `/api/notificaciones/enviar-prueba` | Enviar notificacion de prueba. |
| POST | `/api/donativos` | Registrar donativo simulado. |
| GET | `/api/donativos/resumen` | Obtener resumen de donativos para administracion. |
| GET | `/api/donativos/mis-donativos` | Listar donativos del usuario autenticado. |
| GET | `/api/donativos/admin` | Listar donativos para administracion. |
| GET | `/api/donativos/admin/:id` | Ver detalle de donativo para administracion. |

Los servicios incluyen endpoint `GET /health` para revision local.

## Eventos En Tiempo Real

El gateway expone los sockets de los servicios internos:

| Servicio | Ruta gateway | Uso |
| --- | --- | --- |
| Mensajeria | `/api/mensajeria/socket.io` | Recibir mensajes nuevos en conversaciones. |
| Notificaciones | `/api/notificaciones/socket.io` | Recibir notificaciones nuevas y cambios de lectura. |

Ambos sockets requieren token JWT en la autenticacion de Socket.IO.

## Endpoints Internos

Algunos endpoints no estan pensados para el frontend y se usan entre servicios:

| Metodo | Ruta directa | Uso |
| --- | --- | --- |
| POST | `http://localhost:3008/notificaciones/eventos/mensaje` | Crear notificacion por mensaje. |
| POST | `http://localhost:3008/notificaciones/eventos/coincidencia` | Crear notificacion por coincidencia. |

Estos endpoints requieren el header `X-Internal-Token` con el valor configurado en `INTERNAL_SERVICE_TOKEN`.

## Autenticacion

El login entrega un token JWT. Las acciones protegidas deben enviar el token en el header:

```text
Authorization: Bearer <token>
```

Crear y editar reportes, ubicaciones, zonas, mensajeria y notificaciones requiere sesion iniciada. Las consultas publicas de reportes, imagenes, geolocalizacion y busqueda no requieren sesion.

El registro de donativos es publico y usa pago simulado. Las consultas administrativas de donativos requieren autenticacion y usuario autorizado.

## Consideraciones

- El gateway es el punto de entrada recomendado para el frontend.
- Mantener secretos, credenciales y configuraciones privadas fuera del repositorio.
- Los scripts SQL pueden reiniciar tablas si se ejecutan completos.
- Mensajeria usa REST para conversaciones y Socket.IO por medio del gateway para mensajes en tiempo real.
- Notificaciones usa REST para registro/listado, Firebase para push y Socket.IO por medio del gateway para eventos en tiempo real.
- Donativos registra aportes generales, sin integracion con pasarelas de pago reales.
- Para pruebas Android locales se debe usar la configuracion `android` del frontend.
- Para produccion se debe configurar una URL publica segura para el gateway.

## Equipo

- Carlos Guerrero
- Carla Poveda
