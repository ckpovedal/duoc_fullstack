# Sanos y Salvos

Plataforma inteligente para la localizacion y recuperacion de mascotas perdidas.

## Descripcion

Sanos y Salvos permite registrar mascotas perdidas, registrar mascotas encontradas y buscar posibles coincidencias entre ambos registros.

El sistema esta construido con una arquitectura de microservicios. Cada servicio tiene una responsabilidad separada y el API Gateway funciona como punto de entrada para el frontend.

## Tecnologias

| Area | Tecnologias |
| --- | --- |
| Frontend | Ionic, Angular, TypeScript |
| Backend | Node.js, Express, Spring Boot |
| Base de datos | PostgreSQL |

## Estructura

```text
DUOC_FULLSTACK/
  frontend/
  api-gateway/
  usuario-service/
  perdidas-service/
  hallazgos-service/
  buscador-service/
```

## Microservicios

| Servicio | Responsabilidad |
| --- | --- |
| `usuario-service` | Gestiona usuarios y trabaja con la tabla `USUARIO`. |
| `perdidas-service` | Registra, consulta y actualiza mascotas perdidas. Trabaja con la tabla `PERDIDA`. |
| `hallazgos-service` | Registra y consulta mascotas encontradas. Trabaja con la tabla `HALLAZGO`. |
| `buscador-service` | Consulta perdidas y hallazgos para detectar posibles coincidencias. |
| `api-gateway` | Centraliza las solicitudes del frontend y enruta hacia los microservicios. |

## Base De Datos

Los scripts principales estan en la raiz del proyecto:

- `DB Usuario.txt`
- `DB Perdida.txt`
- `DB Hallazgo.txt`

Cada microservicio con persistencia usa su propia base de datos:

| Servicio | Base de datos |
| --- | --- |
| `usuario-service` | `usuario_db` |
| `perdidas-service` | `perdida_db` |
| `hallazgos-service` | `hallazgo_db` |

`perdidas-service` y `hallazgos-service` guardan el `u_id`, pero validan la existencia del usuario consultando a `usuario-service`.

## Instalacion

Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd DUOC_FULLSTACK
```

Hay dos formas para instalar las dependencias:

--- 01 ---

Instalar dependencias del frontend:

```bash
cd frontend
npm install
```

Instalar dependencias de los servicios Node.js:

```bash
cd ../api-gateway
npm install

cd ../hallazgos-service
npm install

cd ../perdidas-service
npm install

cd ../buscador-service
npm install
```

--- 02 ---
y la otra es ejecutando en la raíz (duoc_fullstack): .\instalar-todos.bat,
con lo cual se cargan todas las dependencias automáticamente.

`usuario-service` usa Spring Boot, por lo que no requiere `npm install`.

## Variables De Entorno

El archivo `.env` debe estar en la raiz del proyecto y no debe subirse al repositorio.

Usar `.env.example` como referencia para crear el archivo local.

Las variables de base de datos estan separadas por microservicio, por ejemplo `USUARIO_DB_NAME`, `PERDIDAS_DB_NAME` y `HALLAZGOS_DB_NAME`.

La variable `LOG_LEVEL` controla el detalle de logs. Por defecto debe quedar en `info`. Para depurar servicios localmente se puede usar `debug`.

## Ejecucion

Abrir una terminal por cada servicio en este orden:

API Gateway:

```bash
cd api-gateway
npm run dev
```

Perdidas Service:

```bash
cd perdidas-service
npm run dev
```

Hallazgos Service:

```bash
cd hallazgos-service
npm run dev
```

Buscador Service:

```bash
cd buscador-service
npm run dev
```

Usuario Service:

```powershell
cd usuario-service
.\mvnw.cmd spring-boot:run
```

Frontend:

```bash
cd frontend
ionic serve
```

--- 02 ---
y la otra es ejecutando en la raíz (duoc_fullstack) en PowerShell: .\ejecutar-servicios.ps1,
con lo cual se cargan todos los servicios en ventanas emergentes minimizadas automaticamente.

Los logs locales quedan disponibles en la carpeta `logs/`.

## Logs

El proyecto tiene una forma oficial de revisar logs para evitar `console.log` temporales con datos sensibles.

Servicios Node.js:

- `api-gateway`, `perdidas-service`, `hallazgos-service` y `buscador-service` usan `pino` y `pino-http`.
- Se registran metodo, ruta, estado HTTP, duracion y errores.
- Los logs se escriben en consola y en archivos dentro de `logs/`.
- Con `LOG_LEVEL=debug` aparecen logs resumidos de negocio, sin payloads completos.

`usuario-service`:

- Usa el logging nativo de Spring Boot.
- Los logs de aplicacion quedan en `logs/usuario-service.log`.
- Los access logs HTTP quedan como `logs/usuario-service-access*.log`.

Frontend Ionic:

- Usa `LoggerService` para logs controlados.
- Usa un interceptor HTTP para registrar llamadas al backend sin imprimir bodies.
- Usa un handler global para errores de Angular.

Reglas del equipo:

- No usar `console.log` para depurar.
- No registrar payloads completos.
- No registrar imagenes en base64 o hexadecimal.
- No registrar contrasenas, tokens, headers de autorizacion, direcciones completas ni datos personales completos.
- Para ver el detalle exacto de una request del frontend, usar la pestana Network del navegador.

## Endpoints

### API Gateway

| Metodo | Ruta |
| --- | --- |
| GET | `/api/usuarios` |
| POST | `/api/usuarios` |
| GET | `/api/usuarios/:id` |
| PUT | `/api/usuarios/:id` |
| POST | `/api/usuarios/login` |
| GET | `/api/hallazgos` |
| POST | `/api/hallazgos` |
| GET | `/api/hallazgos/:id` |
| GET | `/api/perdidas` |
| POST | `/api/perdidas` |
| GET | `/api/perdidas/:id` |
| PUT | `/api/perdidas/:id` |
| PATCH | `/api/perdidas/:id/estado` |
| GET | `/api/buscador` |
| GET | `/api/buscador/:perdidaId` |

### Microservicios

| Servicio | Metodo | Ruta |
| --- | --- | --- |
| `usuario-service` | GET | `/usuarios` |
| `usuario-service` | POST | `/usuarios` |
| `usuario-service` | GET | `/usuarios/:id` |
| `usuario-service` | PUT | `/usuarios/:id` |
| `usuario-service` | POST | `/usuarios/login` |
| `hallazgos-service` | GET | `/hallazgos` |
| `hallazgos-service` | POST | `/hallazgos` |
| `hallazgos-service` | GET | `/hallazgos/:id` |
| `perdidas-service` | GET | `/perdidas` |
| `perdidas-service` | POST | `/perdidas` |
| `perdidas-service` | GET | `/perdidas/:id` |
| `perdidas-service` | PUT | `/perdidas/:id` |
| `perdidas-service` | PATCH | `/perdidas/:id/estado` |
| `buscador-service` | GET | `/buscador` |
| `buscador-service` | GET | `/buscador/:perdidaId` |

### Buscador por parametros

El buscador permite buscar coincidencias desde una perdida registrada o desde parametros enviados por URL.

Busqueda por perdida registrada:

```text
GET http://localhost:3001/api/buscador/PRD00001
```

Busqueda manual por parametros:

```text
GET http://localhost:3001/api/buscador?tipo=1&comuna=Vitacura&region=Metropolitana&genero=2&fecha=2026-04-20&nombre=Luna&fisica=pelo%20blanco%20ojos%20azules
```

## Patrones Utilizados

- API Gateway
- Repository Pattern
- Factory Method
- Circuit Breaker conceptual

## Consideraciones

- `buscador-service` no tiene base de datos propia.
- `buscador-service` consume `perdidas-service` y `hallazgos-service`.
- `perdidas-service` consume `usuario-service` para validar usuarios.
- `hallazgos-service` consume `usuario-service` para validar usuarios.
- `api-gateway` centraliza el acceso desde el frontend.
- Cada microservicio mantiene una responsabilidad separada.

## Equipo

- Carlos Guerrero
- Carla Poveda
