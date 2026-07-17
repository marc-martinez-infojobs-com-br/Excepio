# DATABASE.md – Modelo de Datos

Este documento define la estructura de datos del sistema de registro de excepciones.

## Diagrama de Tablas

```
┌─────────────────┐     ┌─────────────────┐
│     Level       │     │    Platform     │
├─────────────────┤     ├─────────────────┤
│ id (int, PK)    │     │ id (int, PK)    │
│ name            │     │ name            │
│ order           │     │ apiKey (unique) │
│ statusId (FK)   │     │ statusId (FK)   │
└─────────────────┘     │ createdAt       │
                        └─────────────────┘

              ┌─────────────┐
              │   Status    │
              ├─────────────┤
              │ id (int, PK)│
              │ name        │
              └─────────────┘

         ┌────────────────────────────────────────────────┐
         │                  Exception                     │
         ├────────────────────────────────────────────────┤
         │ id (UUID, PK auto)                             │
         │ platformId (FK → Platform)                     │
         │ levelId (FK → Level)                           │
         │ message (string)                               │
         │ stackTrace (text, opcional)                    │
         │ userId (string, opcional)                      │
         │ url (string, opcional)                         │
         │ userAgent (string, opcional)                   │
         │ appVersion (string, opcional)                  │
         │ metadata (JSON, opcional)                      │
         │ createdAt (datetime)                           │
         └────────────────────────────────────────────────┘

         ┌────────────────────────────────────────────────┐
         │                     User                       │
         ├────────────────────────────────────────────────┤
         │ id (UUID, PK auto)                             │
         │ email (string, unique)                         │
         │ password (string, bcrypt hash)                 │
         │ name (string)                                  │
         │ role (enum: ADMINISTRADOR, USUARIO)            │
         │ lastLoginAt (datetime, opcional)               │
         │ createdAt (datetime)                           │
         │ updatedAt (datetime)                           │
         │ statusId (FK → Status)                         │
         └────────────────────────────────────────────────┘
```

## Tablas de Diccionario

### Status

Tabla compartida para borrado lógico en Level, Platform y User.

| id | name |
|----|------|
| 1 | PENDING |
| 2 | ACTIVE |
| 3 | EXPIRED |
| 4 | DELETED |

### Level

Niveles de severidad de las excepciones.

| id | name | order | statusId |
|----|------|-------|----------|
| 1 | DEBUG | 1 | 2 |
| 2 | INFO | 2 | 2 |
| 3 | WARNING | 3 | 2 |
| 4 | ERROR | 4 | 2 |
| 5 | FATAL | 5 | 2 |

### UserRole (Enum)

Roles de usuario para el sistema de autenticación web.

| Valor | Descripción |
|-------|-------------|
| ADMINISTRADOR | Acceso completo: CRUD de usuarios, gestión de plataformas, visualización de todas las excepciones |
| USUARIO | Acceso de solo lectura a excepciones y plataformas |

## Tablas Principales

### Platform

Plataformas/aplicaciones que envían excepciones. Cada plataforma representa una aplicación específica (ej. "Web", "Android", "iOS").

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | int | Clave primaria asignada por el administrador |
| name | string | Nombre de la plataforma |
| apiKey | string (unique) | API key autogenerada para autenticar peticiones |
| statusId | int (FK) | Estado del registro |
| createdAt | datetime | Fecha de creación |

**Notas:**
- El `id` es numérico y asignado manualmente por el administrador al crear la plataforma
- El `apiKey` se genera automáticamente y solo puede regenerarse mediante endpoint específico

### Exception

Registro de excepciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria autogenerada |
| platformId | int (FK) | Plataforma que reporta la excepción |
| levelId | int (FK) | Nivel de severidad |
| message | string | Mensaje de la excepción |
| stackTrace | text (opcional) | Stack trace completo |
| userId | string (opcional) | Identificador del usuario afectado |
| url | string (opcional) | URL/ruta donde ocurrió |
| userAgent | string (opcional) | Browser/dispositivo |
| appVersion | string (opcional) | Versión de la aplicación |
| metadata | JSON (opcional) | Datos adicionales flexibles |
| createdAt | datetime | Fecha de inserción |

### User

Usuarios del sistema que acceden a la plataforma web para gestionar y visualizar excepciones.

**Importante:** Los usuarios se autentican mediante JWT (email + password). Esto es independiente del sistema de API Key que usan las Platforms para reportar excepciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria autogenerada |
| email | string (unique) | Email del usuario (identificador único) |
| password | string | Contraseña hasheada con bcrypt (min 8 caracteres) |
| name | string | Nombre completo del usuario |
| role | UserRole (enum) | Rol: ADMINISTRADOR o USUARIO |
| lastLoginAt | datetime (opcional) | Fecha del último login exitoso |
| createdAt | datetime | Fecha de creación |
| updatedAt | datetime | Fecha de última actualización |
| statusId | int (FK) | Estado del usuario (activado/desactivado) |

**Usuarios iniciales en seed:**

1. **Administrador**:
   - Email: `admin@excepio.com`
   - Password: `Admin123!`
   - Role: ADMINISTRADOR

2. **Usuario básico**:
   - Email: `user@excepio.com`
   - Password: `User123!`
   - Role: USUARIO

## Notas

- **Borrado lógico**: Level, Platform y User usan `statusId` para borrado lógico. Esto evita romper las FK en Exception.
- **Exception no se borra**: Las excepciones nunca se eliminan, por lo que no tienen `statusId`.
- **Dos sistemas de autenticación**:
  - **JWT (User)**: Para usuarios humanos que acceden a la plataforma web (email + password)
  - **API Key (Platform)**: Para aplicaciones que reportan excepciones
- **Sin relación User-Platform**: Actualmente cualquier usuario autenticado puede ver excepciones de todas las plataformas.


## Conexión a la Base de Datos

Para conectarte con un cliente como TablePlus, DBeaver, etc:

| Campo | Valor |
|-------|-------|
| Host | `localhost` |
| Puerto | `5432` |
| Usuario | `postgres` |
| Password | `gzQFyXv95B2@Xe` |
| Base de datos | `excepio` |