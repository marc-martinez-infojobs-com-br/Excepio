# DATABASE.md – Modelo de Datos

Este documento define la estructura de datos del sistema de registro de excepciones.

## Diagrama de Tablas

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Level       │     │    Platform     │     │    Project      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (int, PK)    │     │ id (int, PK)    │     │ id (UUID, PK)   │
│ name            │     │ name            │     │ name            │
│ order           │     │ statusId (FK)   │     │ apiKey (unique) │
│ statusId (FK)   │     └─────────────────┘     │ statusId (FK)   │
└─────────────────┘                             │ createdAt       │
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
         │ projectId (FK → Project)                       │
         │ levelId (FK → Level)                           │
         │ platformId (FK → Platform)                     │
         │ message (string)                               │
         │ stackTrace (text, opcional)                    │
         │ userId (string, opcional)                      │
         │ url (string, opcional)                         │
         │ userAgent (string, opcional)                   │
         │ appVersion (string, opcional)                  │
         │ metadata (JSON, opcional)                      │
         │ createdAt (datetime)                           │
         └────────────────────────────────────────────────┘
```

## Tablas de Diccionario

### Status

Tabla compartida para borrado lógico en Level, Platform y Project.

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

### Platform

Plataformas desde donde se registran las excepciones.

| id | name | statusId |
|----|------|----------|
| 1 | WEB | 2 |
| 2 | WM | 2 |
| 3 | ANDROID | 2 |
| 4 | IOS | 2 |
| 5 | API | 2 |

## Tablas Principales

### Project

Proyectos/aplicaciones que envían excepciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria autogenerada |
| name | string | Nombre del proyecto |
| apiKey | string (unique) | API key para autenticar peticiones |
| statusId | int (FK) | Estado del registro |
| createdAt | datetime | Fecha de creación |

### Exception

Registro de excepciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria autogenerada |
| projectId | UUID (FK) | Proyecto que reporta la excepción |
| levelId | int (FK) | Nivel de severidad |
| platformId | int (FK) | Plataforma de origen |
| message | string | Mensaje de la excepción |
| stackTrace | text (opcional) | Stack trace completo |
| userId | string (opcional) | Identificador del usuario afectado |
| url | string (opcional) | URL/ruta donde ocurrió |
| userAgent | string (opcional) | Browser/dispositivo |
| appVersion | string (opcional) | Versión de la aplicación |
| metadata | JSON (opcional) | Datos adicionales flexibles |
| createdAt | datetime | Fecha de inserción |

## Notas

- **Borrado lógico**: Level, Platform y Project usan `statusId` para borrado lógico. Esto evita romper las FK en Exception.
- **Exception no se borra**: Las excepciones nunca se eliminan, por lo que no tienen `statusId`.
- **Usuarios**: La tabla de usuarios para acceso web se definirá más adelante.
