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

## Ejecucion

Abrir una terminal por servicio.

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

## Endpoints

### API Gateway

| Metodo | Ruta |
| --- | --- |
| GET | `/api/hallazgos` |
| POST | `/api/hallazgos` |
| GET | `/api/hallazgos/:id` |
| GET | `/api/perdidas` |
| POST | `/api/perdidas` |
| GET | `/api/perdidas/:id` |
| PUT | `/api/perdidas/:id` |
| PATCH | `/api/perdidas/:id/estado` |
| GET | `/api/buscador/:perdidaId` |

### Microservicios

| Servicio | Metodo | Ruta |
| --- | --- | --- |
| `hallazgos-service` | GET | `/hallazgos` |
| `hallazgos-service` | POST | `/hallazgos` |
| `hallazgos-service` | GET | `/hallazgos/:id` |
| `perdidas-service` | GET | `/perdidas` |
| `perdidas-service` | POST | `/perdidas` |
| `perdidas-service` | GET | `/perdidas/:id` |
| `perdidas-service` | PUT | `/perdidas/:id` |
| `perdidas-service` | PATCH | `/perdidas/:id/estado` |
| `buscador-service` | GET | `/buscador/:perdidaId` |

## Patrones Utilizados

- API Gateway
- Repository Pattern
- Factory Method
- Circuit Breaker conceptual

## Consideraciones

- `buscador-service` no tiene base de datos propia.
- `buscador-service` consume `perdidas-service` y `hallazgos-service`.
- `api-gateway` centraliza el acceso desde el frontend.
- Cada microservicio mantiene una responsabilidad separada.

## Equipo

- Carlos Guerrero
- Carla Poveda
