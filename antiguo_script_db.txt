-- =========================================================
-- SANOS Y SALVOS - SERVICIO DE REPORTES
-- RESET + DDL
-- =========================================================

--=========================================================
-- CONFIGURACION ZONA HORARIA
-- =========================================================
SET TIME ZONE 'UTC';

-- =========================================================
-- EXTENSIÓN
-- =========================================================
create extension if not exists pgcrypto;

-- =========================================================
-- DROP TABLAS
-- =========================================================

drop table if exists asignaciones_reporte cascade;
drop table if exists historial_estado_reporte cascade;
drop table if exists contactos_reporte cascade;
drop table if exists fotos_reporte cascade;
drop table if exists reportes cascade;
drop table if exists mascotas cascade;
drop table if exists usuarios_organizaciones cascade;
drop table if exists organizaciones cascade;
drop table if exists usuarios cascade;

-- =========================================================
-- DROP ENUMS
-- =========================================================

drop type if exists tipo_relacion_contacto cascade;
drop type if exists estado_asignacion cascade;
drop type if exists tipo_asignacion cascade;
drop type if exists estado_reporte cascade;
drop type if exists tipo_reporte cascade;
drop type if exists tamano_mascota cascade;
drop type if exists sexo_mascota cascade;
drop type if exists especie_mascota cascade;
drop type if exists tipo_organizacion cascade;
drop type if exists rol_usuario cascade;

-- =========================================================
-- ENUMS
-- =========================================================

create type rol_usuario as enum (
    'ADMIN',
    'DUENO',
    'CIUDADANO',
    'VETERINARIO',
    'OPERADOR_REFUGIO',
    'OPERADOR_MUNICIPAL'
);

create type tipo_organizacion as enum (
    'CLINICA',
    'REFUGIO',
    'MUNICIPALIDAD',
    'ONG'
);

create type especie_mascota as enum (
    'PERRO',
    'GATO',
    'OTRO'
);

create type sexo_mascota as enum (
    'MACHO',
    'HEMBRA',
    'DESCONOCIDO'
);

create type tamano_mascota as enum (
    'PEQUENO',
    'MEDIANO',
    'GRANDE'
);

create type tipo_reporte as enum (
    'PERDIDA',
    'ENCONTRADA',
    'AVISTAMIENTO'
);

create type estado_reporte as enum (
    'ABIERTO',
    'EN_REVISION',
    'COINCIDENCIA',
    'RESUELTO',
    'CERRADO',
    'CANCELADO'
);

create type tipo_asignacion as enum (
    'REVISION',
    'RESCATE',
    'SEGUIMIENTO'
);

create type estado_asignacion as enum (
    'ACTIVA',
    'COMPLETADA',
    'CANCELADA'
);

create type tipo_relacion_contacto as enum (
    'DUENO',
    'QUIEN_REPORTA',
    'VETERINARIO',
    'REFUGIO',
    'OTRO'
);

-- =========================================================
-- TABLA: USUARIOS
-- =========================================================

create table usuarios (
    id uuid primary key default gen_random_uuid(),
    nombre varchar(100) not null,
    apellido varchar(100),
    email varchar(150) not null unique,
    telefono varchar(30),
    password_hash text not null,
    rol rol_usuario not null,
    activo boolean not null default true,
    creado_en timestamptz not null default now(),
    actualizado_en timestamptz not null default now()
);

-- =========================================================
-- TABLA: ORGANIZACIONES
-- =========================================================

create table organizaciones (
    id uuid primary key default gen_random_uuid(),
    nombre varchar(150) not null,
    tipo tipo_organizacion not null,
    email varchar(150),
    telefono varchar(30),
    direccion text,
    comuna varchar(100),
    ciudad varchar(100),
    region varchar(100),
    activo boolean not null default true,
    creado_en timestamptz not null default now(),
    actualizado_en timestamptz not null default now()
);

-- =========================================================
-- TABLA: USUARIOS_ORGANIZACIONES
-- =========================================================

create table usuarios_organizaciones (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null references usuarios(id) on delete cascade,
    organizacion_id uuid not null references organizaciones(id) on delete cascade,
    cargo varchar(100),
    creado_en timestamptz not null default now(),
    unique (usuario_id, organizacion_id)
);

-- =========================================================
-- TABLA: MASCOTAS
-- =========================================================

create table mascotas (
    id uuid primary key default gen_random_uuid(),
    dueno_usuario_id uuid references usuarios(id) on delete set null,
    nombre varchar(100),
    especie especie_mascota not null,
    raza varchar(100),
    sexo sexo_mascota not null default 'DESCONOCIDO',
    tamano tamano_mascota,
    color_principal varchar(50),
    color_secundario varchar(50),
    fecha_nacimiento date,
    codigo_microchip varchar(100) unique,
    esterilizado boolean,
    marcas_distintivas text,
    creado_en timestamptz not null default now(),
    actualizado_en timestamptz not null default now()
);

-- =========================================================
-- TABLA: REPORTES
-- =========================================================

create table reportes (
    id uuid primary key default gen_random_uuid(),
    mascota_id uuid not null references mascotas(id) on delete cascade,
    usuario_reporta_id uuid references usuarios(id) on delete set null,
    organizacion_id uuid references organizaciones(id) on delete set null,

    tipo tipo_reporte not null,
    estado estado_reporte not null default 'ABIERTO',

    titulo varchar(150),
    descripcion text,

    fecha_reporte timestamptz not null default now(),
    fecha_evento timestamptz,
    fecha_ultima_vez timestamptz,

    direccion text,
    comuna varchar(100),
    ciudad varchar(100),
    region varchar(100),

    latitud numeric(9,6),
    longitud numeric(9,6),

    recompensa numeric(10,2) check (recompensa is null or recompensa >= 0),

    nombre_contacto varchar(120),
    telefono_contacto varchar(30),
    email_contacto varchar(150),

    es_publico boolean not null default true,

    creado_en timestamptz not null default now(),
    actualizado_en timestamptz not null default now(),

    constraint chk_coordenadas
        check (
            (latitud is null and longitud is null)
            or
            (latitud is not null and longitud is not null)
        ),

    constraint chk_latitud
        check (latitud is null or latitud between -90 and 90),

    constraint chk_longitud
        check (longitud is null or longitud between -180 and 180)
);

-- =========================================================
-- TABLA: FOTOS_REPORTE
-- =========================================================

create table fotos_reporte (
    id uuid primary key default gen_random_uuid(),
    reporte_id uuid not null references reportes(id) on delete cascade,
    url_archivo text not null,
    nombre_archivo varchar(255),
    tipo_contenido varchar(100),
    orden integer not null default 0,
    subido_en timestamptz not null default now()
);

-- =========================================================
-- TABLA: CONTACTOS_REPORTE
-- =========================================================

create table contactos_reporte (
    id uuid primary key default gen_random_uuid(),
    reporte_id uuid not null references reportes(id) on delete cascade,
    nombre varchar(120) not null,
    telefono varchar(30),
    email varchar(150),
    tipo_relacion tipo_relacion_contacto not null default 'OTRO',
    es_principal boolean not null default false,
    creado_en timestamptz not null default now()
);

-- =========================================================
-- TABLA: HISTORIAL_ESTADO_REPORTE
-- =========================================================

create table historial_estado_reporte (
    id uuid primary key default gen_random_uuid(),
    reporte_id uuid not null references reportes(id) on delete cascade,
    estado_anterior estado_reporte,
    estado_nuevo estado_reporte not null,
    cambiado_por_usuario_id uuid references usuarios(id) on delete set null,
    comentario text,
    cambiado_en timestamptz not null default now()
);

-- =========================================================
-- TABLA: ASIGNACIONES_REPORTE
-- =========================================================

create table asignaciones_reporte (
    id uuid primary key default gen_random_uuid(),
    reporte_id uuid not null references reportes(id) on delete cascade,
    usuario_asignado_id uuid references usuarios(id) on delete set null,
    organizacion_asignada_id uuid references organizaciones(id) on delete set null,
    tipo_asignacion tipo_asignacion not null,
    estado estado_asignacion not null default 'ACTIVA',
    asignado_en timestamptz not null default now(),

    constraint chk_asignacion_destino
        check (
            usuario_asignado_id is not null
            or organizacion_asignada_id is not null
        )
);

-- =========================================================
-- ÍNDICES
-- =========================================================

create index idx_reportes_tipo on reportes(tipo);
create index idx_reportes_estado on reportes(estado);
create index idx_reportes_fecha_evento on reportes(fecha_evento);
create index idx_reportes_coordenadas on reportes(latitud, longitud);

-- =========================================================
-- TRIGGER updated_at
-- =========================================================

create or replace function actualizar_timestamp()
returns trigger as $$
begin
    new.actualizado_en = now();
    return new;
end;
$$ language plpgsql;

create trigger trg_usuarios_actualizado
before update on usuarios
for each row execute function actualizar_timestamp();

create trigger trg_organizaciones_actualizado
before update on organizaciones
for each row execute function actualizar_timestamp();

create trigger trg_mascotas_actualizado
before update on mascotas
for each row execute function actualizar_timestamp();

create trigger trg_reportes_actualizado
before update on reportes
for each row execute function actualizar_timestamp();