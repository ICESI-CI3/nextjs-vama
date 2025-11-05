# 🎮 TriviaTime - Plataforma de Trivia Gamificada

![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.0-blue)
![Zustand](https://img.shields.io/badge/Zustand-4.5.7-orange)

Plataforma web de trivias gamificadas desarrollada con **Next.js 14**, **TypeScript** y **React 18**, implementando autenticación JWT, autorización basada en roles (RBAC) y gestión de estado centralizada con **Zustand**.

---

## 📋 Tabla de Contenidos

1. [Características](#-características)
2. [Tecnologías](#️-tecnologías)
3. [Requisitos Previos](#-requisitos-previos)
4. [Instalación](#-instalación)
5. [Configuración](#️-configuración)
6. [Ejecutar la Aplicación](#-ejecutar-la-aplicación)
7. [Probar Funcionalidades](#-probar-funcionalidades)
8. [Testing](#-testing)
9. [Estructura del Proyecto](#-estructura-del-proyecto)
10. [Scripts Disponibles](#-scripts-disponibles)
11. [Usuarios de Prueba](#-usuarios-de-prueba)
12. [API Endpoints](#-api-endpoints)
13. [Troubleshooting](#-troubleshooting)
14. [Documentación Adicional](#-documentación-adicional)

---

## ✨ Características

### Autenticación y Autorización
- ✅ **Autenticación JWT completa** (Login, Registro, Logout)
- ✅ **Autorización basada en roles (RBAC)**: Player y Admin
- ✅ **Protección de rutas** con redirección automática
- ✅ **Persistencia de sesión** con localStorage
- ✅ **Manejo automático de tokens** con interceptores Axios

### Gestión de Estado
- ✅ **Zustand** para state management (10% del proyecto)
- ✅ **Persistencia automática** en localStorage
- ✅ **Rehidratación inteligente** al recargar la página
- ✅ **Type-safe** con TypeScript completo

### Funcionalidades de Usuario (Player)
- ✅ Dashboard personalizado
- ✅ Jugar trivias (propias o de OpenTDB API)
- ✅ Ver rankings globales y por categoría
- ✅ Historial de sesiones de juego
- ✅ Editar perfil personal
- ✅ Crear, editar y gestionar trivias propias
- ✅ Agregar preguntas a trivias (múltiple opción y verdadero/falso)

### Funcionalidades de Admin
- ✅ Dashboard de administrador
- ✅ Gestión de usuarios (activar/desactivar, cambiar roles)
- ✅ Reportes y estadísticas generales
- ✅ Todas las funcionalidades de Player

### Otras Características
- ✅ Integración con **OpenTDB API** (base de datos de trivias externa)
- ✅ Sistema de puntuación y rankings
- ✅ Gráficos y visualización de datos con Recharts
- ✅ Responsive design con CSS Modules
- ✅ Testing completo (Unit + Integration + E2E)

---

## 🛠️ Tecnologías

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 14.0.0 | Framework React con App Router |
| **React** | 18.2.0 | Librería de UI |
| **TypeScript** | 5.3.0 | Tipado estático |
| **Zustand** | 4.5.7 | Gestión de estado global |
| **Axios** | 1.6.2 | Cliente HTTP |
| **Recharts** | 3.3.0 | Gráficos y visualización |
| **Jest** | 29.7.0 | Testing unitario |
| **Playwright** | 1.40.0 | Testing E2E |

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js**: >= 18.0.0 (recomendado 20.x)
- **npm**: >= 9.0.0 (incluido con Node.js)
- **Git**: Para clonar el repositorio

### Verificar versiones instaladas:

```bash
node --version   # Debe mostrar v18.x o superior
npm --version    # Debe mostrar 9.x o superior
```

---

## 🚀 Instalación

### Paso 1: Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd nextjs-vama
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

Si encuentras conflictos de dependencias, usa:

```bash
npm install --force
```

> **Nota**: La instalación puede tomar 2-5 minutos dependiendo de tu conexión.

---

## ⚙️ Configuración

### Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://nestjs-vama-production.up.railway.app/api
```

> **Nota**: La URL del backend ya está configurada por defecto en `next.config.js`, pero puedes sobrescribirla con `.env.local` para desarrollo local.

---

## ▶️ Ejecutar la Aplicación

### Modo Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en:
- 🌐 **URL**: http://localhost:3000
- 🔄 **Hot Reload**: Habilitado (cambios se reflejan automáticamente)

### Modo Producción

```bash
# 1. Compilar para producción
npm run build

# 2. Iniciar servidor de producción
npm run start
```

La aplicación estará disponible en:
- 🌐 **URL**: http://localhost:3000
- ⚡ **Optimizado**: Build optimizado para producción

---

## 🧪 Probar Funcionalidades

A continuación, una guía paso a paso para probar todas las funcionalidades de la aplicación.

---

### 1️⃣ **Registro de Usuario**

#### Pasos:
1. Abre tu navegador en http://localhost:3000
2. Serás redirigido a `/auth/login`
3. Click en **"Regístrate aquí"**
4. Completa el formulario:
   - **Nombre**: Tu nombre
   - **Email**: tu@email.com
   - **Contraseña**: mínimo 6 caracteres
5. Click en **"Registrarse"**

#### Resultado Esperado:
- ✅ Usuario creado exitosamente
- ✅ Auto-login automático
- ✅ Redirección a `/dashboard` (rol: player por defecto)
- ✅ Mensaje de bienvenida con tu nombre

#### Validaciones:
- ❌ Email duplicado: "El usuario ya existe"
- ❌ Email inválido: "Formato de email inválido"
- ❌ Contraseña muy corta: "Mínimo 6 caracteres"

---

### 2️⃣ **Inicio de Sesión**

#### Pasos:
1. En `/auth/login`, ingresa credenciales:
   - **Email**: test@test.com
   - **Contraseña**: test123
2. Click en **"Iniciar Sesión"**

#### Resultado Esperado:
- ✅ Login exitoso
- ✅ Token JWT guardado en localStorage
- ✅ Usuario guardado en Zustand store
- ✅ Redirección según rol:
  - **Player** → `/dashboard`
  - **Admin** → `/admin/dashboard`

#### Credenciales de Prueba:
Ver sección [Usuarios de Prueba](#-usuarios-de-prueba)

---

### 3️⃣ **Dashboard de Usuario (Player)**

#### Pasos:
1. Inicia sesión como player: `test@test.com` / `test123`
2. Serás redirigido a `/dashboard`

#### Funcionalidades Disponibles:

##### A. Ver Información Personal
- ✅ Nombre de usuario
- ✅ Puntuación total
- ✅ Rol actual

##### B. Editar Perfil
1. Click en **"Mi Perfil"**
2. Modifica:
   - Nombre
   - Email
   - Imagen de perfil (URL)
3. Click en **"Guardar"**

**Resultado**: 
- ✅ Perfil actualizado
- ✅ Store de Zustand actualizado
- ✅ Cambios visibles en el header

##### C. Navegación
- 🎮 **Jugar Trivias** → `/play`
- 📊 **Mis Sesiones** → `/game-sessions`
- 🏆 **Rankings** → `/rankings`
- 📝 **Mis Trivias** → `/my-trivias`

---

### 4️⃣ **Crear y Gestionar Trivias**

#### A. Crear Nueva Trivia

##### Pasos:
1. Desde `/dashboard`, click en **"Mis Trivias"**
2. En `/my-trivias`, click en **"+ Crear Trivia"**
3. Completa el formulario:
   - **Título**: "Mi Primera Trivia"
   - **Categoría**: Selecciona una categoría
   - **Dificultad**: Easy/Medium/Hard
   - **Tiempo límite**: 30 segundos (opcional)
4. Click en **"Crear"**

##### Resultado Esperado:
- ✅ Trivia creada con `status: "draft"`
- ✅ Redirección automática a `/my-trivias/[id]/edit`
- ✅ Mensaje de éxito

#### B. Agregar Preguntas a la Trivia

##### Pasos:
1. En `/my-trivias/[id]/edit`, click en **"+ Agregar Pregunta"**
2. Selecciona tipo de pregunta:
   
   **Opción A: Pregunta de Opción Múltiple**
   - **Texto**: "¿Cuál es la capital de Francia?"
   - **Tipo**: Opción Múltiple
   - **Opciones**:
     - Opción 1: "París" ✅ (marca como correcta)
     - Opción 2: "Londres"
     - Opción 3: "Berlín"
     - Opción 4: "Madrid"
   - **Puntos**: 10
   
   **Opción B: Pregunta Verdadero/Falso**
   - **Texto**: "¿La Tierra es plana?"
   - **Tipo**: Verdadero/Falso
   - **Respuesta correcta**: Falso ✅
   - **Puntos**: 5

3. Click en **"Guardar Pregunta"**

##### Resultado Esperado:
- ✅ Pregunta creada en el backend
- ✅ Aparece inmediatamente en la lista (actualización optimista)
- ✅ Se puede editar o eliminar
- ✅ Se muestra el conteo de preguntas actualizado

#### C. Editar Pregunta

##### Pasos:
1. En la lista de preguntas, click en **"Editar"** en una pregunta
2. Modifica el texto, opciones o puntos
3. Click en **"Guardar Cambios"**

##### Resultado Esperado:
- ✅ Pregunta actualizada
- ✅ Cambios visibles inmediatamente

#### D. Eliminar Pregunta

##### Pasos:
1. Click en **"Eliminar"** en una pregunta
2. Confirma la eliminación

##### Resultado Esperado:
- ✅ Pregunta eliminada del backend
- ✅ Desaparece de la lista

#### E. Publicar Trivia

##### Pasos:
1. Asegúrate de tener al menos 1 pregunta
2. Click en **"Publicar Trivia"**
3. Confirma la acción

##### Resultado Esperado:
- ✅ `status` cambia de "draft" a "published"
- ✅ Trivia disponible para jugar
- ✅ Botón cambia a **"Archivar"**

#### F. Filtrar y Buscar Trivias

##### Pasos:
1. En `/my-trivias`:
   - **Buscar**: Escribe en el campo de búsqueda
   - **Filtrar por categoría**: Selecciona del dropdown
   - **Filtrar por dificultad**: Easy/Medium/Hard
   - **Filtrar por estado**: Draft/Published/Archived

##### Resultado Esperado:
- ✅ Lista actualizada dinámicamente
- ✅ Filtros combinables

---

### 5️⃣ **Jugar Trivias**

#### A. Seleccionar Tipo de Juego

##### Pasos:
1. Desde `/dashboard`, click en **"Jugar Trivias"**
2. En `/play`, elige un tipo:
   
   **Opción A: Trivias Propias**
   - Muestra trivias que has creado y publicado
   
   **Opción B: Trivias de OpenTDB**
   - Trivias de API externa
   - Puedes seleccionar:
     - Categoría
     - Dificultad
     - Número de preguntas (5-50)

##### Resultado Esperado:
- ✅ Lista de trivias disponibles
- ✅ Información de cada trivia (título, categoría, dificultad)

#### B. Iniciar Sesión de Juego

##### Pasos:
1. Selecciona una trivia
2. Click en **"Jugar"**
3. Se crea una sesión de juego

##### Resultado Esperado:
- ✅ Sesión creada en el backend
- ✅ Primera pregunta mostrada
- ✅ Timer iniciado (si hay límite de tiempo)
- ✅ Contador de progreso: "Pregunta 1 de X"

#### C. Responder Preguntas

##### Pasos:
1. Lee la pregunta
2. Selecciona una opción
3. Click en **"Enviar Respuesta"**

##### Resultado Esperado:
- ✅ Feedback inmediato:
  - ✅ **Correcto**: Mensaje verde + puntos ganados
  - ❌ **Incorrecto**: Mensaje rojo + respuesta correcta mostrada
- ✅ Botón **"Siguiente Pregunta"** habilitado
- ✅ Progreso actualizado

#### D. Finalizar Sesión

##### Pasos:
1. Responde todas las preguntas
2. Última pregunta automáticamente finaliza la sesión

##### Resultado Esperado:
- ✅ Pantalla de resultados:
  - Total de preguntas
  - Preguntas correctas
  - Puntuación total
  - Tiempo total
  - Promedio por pregunta
- ✅ Opciones:
  - Ver respuestas detalladas
  - Jugar de nuevo
  - Volver al dashboard

#### E. Continuar Sesión en Progreso

##### Pasos:
1. Si abandonaste una sesión, en `/play` verás:
   - **"Continuar Sesiones"**
2. Click en la sesión que quieres continuar

##### Resultado Esperado:
- ✅ Sesión reanudada desde la última pregunta
- ✅ Progreso conservado

---

### 6️⃣ **Ver Historial de Sesiones**

#### Pasos:
1. Desde `/dashboard`, click en **"Mis Sesiones"**
2. En `/game-sessions`, verás:
   - Lista de todas tus partidas
   - Información de cada sesión:
     - Trivia jugada
     - Fecha
     - Puntuación
     - Estado (completado/en progreso/abandonado)

#### Funcionalidades:

##### A. Filtrar Sesiones
- Por estado
- Por fecha
- Por trivia

##### B. Ver Detalles
1. Click en una sesión
2. Ver:
   - Preguntas respondidas
   - Respuestas correctas/incorrectas
   - Tiempo por pregunta

##### Resultado Esperado:
- ✅ Historial completo visible
- ✅ Estadísticas personales

---

### 7️⃣ **Ver Rankings**

#### Pasos:
1. Desde `/dashboard`, click en **"Rankings"**
2. En `/rankings`, verás:
   - **Ranking Global**: Top jugadores por puntuación
   - **Ranking por Categoría**: Top en cada categoría

#### Funcionalidades:

##### A. Filtros
- Top 10 / 50 / 100
- Por categoría específica

##### B. Información Mostrada
- Posición (#1, #2, #3...)
- Nombre del jugador
- Puntuación total
- Número de partidas jugadas

##### C. Gráficos
- Tendencias de puntuación (Recharts)
- Comparación entre jugadores

##### Resultado Esperado:
- ✅ Rankings actualizados
- ✅ Tu posición resaltada
- ✅ Visualización clara con gráficos

---

### 8️⃣ **Dashboard de Administrador**

> **Nota**: Necesitas iniciar sesión como admin.

#### Credenciales de Admin:
- **Email**: admin@test.com
- **Contraseña**: admin123

#### Pasos:
1. Logout (si estás logueado)
2. Login con credenciales de admin
3. Serás redirigido a `/admin/dashboard`

#### Funcionalidades Disponibles:

##### A. Gestión de Usuarios

###### Ver Lista de Usuarios
- ✅ Todos los usuarios del sistema
- ✅ Información: nombre, email, rol, estado, puntuación

###### Cambiar Rol de Usuario
1. Selecciona un usuario
2. Click en **"Cambiar Rol"**
3. Selecciona nuevo rol (Player/Admin)
4. Confirma

**Resultado**:
- ✅ Rol actualizado en el backend
- ✅ Usuario recibe nuevos permisos

###### Activar/Desactivar Usuario
1. Selecciona un usuario
2. Click en **"Desactivar"** o **"Activar"**

**Resultado**:
- ✅ Usuario desactivado no puede iniciar sesión
- ✅ Usuario activado puede iniciar sesión

##### B. Ver Reportes

1. En `/reports`, verás:
   - **Usuarios Activos**: Gráfico de actividad
   - **Trivias Más Jugadas**: Top 10 trivias
   - **Categorías Populares**: Distribución por categoría
   - **Actividad Diaria**: Gráfico de sesiones por día

2. Filtros disponibles:
   - Por rango de fechas
   - Por categoría
   - Por usuario

##### C. Exportar Reportes

1. Selecciona el tipo de reporte
2. Click en **"Exportar"**
3. Se descarga en formato CSV/JSON

##### Resultado Esperado:
- ✅ Reportes detallados y actualizados
- ✅ Gráficos interactivos
- ✅ Datos exportables

---

### 9️⃣ **Cerrar Sesión**

#### Pasos:
1. Click en **"Cerrar Sesión"** (en header)

#### Resultado Esperado:
- ✅ Token eliminado de localStorage
- ✅ Usuario eliminado de localStorage
- ✅ Zustand store limpiado:
  - `user = null`
  - `isAuthenticated = false`
- ✅ Redirección a `/auth/login`
- ✅ No se puede acceder a rutas protegidas

---

### 🔟 **Probar Protección de Rutas**

#### Escenario A: Usuario No Autenticado

##### Pasos:
1. Asegúrate de estar deslogueado
2. Intenta acceder directamente a:
   - http://localhost:3000/dashboard
   - http://localhost:3000/my-trivias
   - http://localhost:3000/admin/dashboard

##### Resultado Esperado:
- ✅ Redirección automática a `/auth/login`
- ✅ No se puede acceder sin autenticación

#### Escenario B: Player Intentando Acceder a Admin

##### Pasos:
1. Inicia sesión como player: `test@test.com` / `test123`
2. Intenta acceder a: http://localhost:3000/admin/dashboard

##### Resultado Esperado:
- ✅ Redirección automática a `/dashboard` (su dashboard)
- ✅ No se puede acceder a rutas de admin

#### Escenario C: Admin Puede Acceder a Todo

##### Pasos:
1. Inicia sesión como admin: `admin@test.com` / `admin123`
2. Accede a:
   - `/admin/dashboard` ✅
   - `/dashboard` ✅
   - `/my-trivias` ✅

##### Resultado Esperado:
- ✅ Admin puede acceder a todas las rutas
- ✅ Dashboard por defecto es `/admin/dashboard`

---

### 1️⃣1️⃣ **Probar Persistencia de Sesión**

#### Escenario: Recargar Página

##### Pasos:
1. Inicia sesión como cualquier usuario
2. Navega a cualquier página
3. **Recarga la página** (F5 o Ctrl+R)

##### Resultado Esperado:
- ✅ Sesión mantenida
- ✅ Usuario aún autenticado
- ✅ No redirección a login
- ✅ Zustand rehidrata el estado desde localStorage

#### Escenario: Cerrar y Abrir Navegador

##### Pasos:
1. Inicia sesión
2. Cierra completamente el navegador
3. Abre de nuevo y ve a http://localhost:3000

##### Resultado Esperado:
- ✅ Sesión mantenida (si el token no expiró)
- ✅ Redirección al dashboard correspondiente

#### Escenario: Token Expirado

##### Pasos:
1. Token expira (simulado o después de X tiempo)
2. Intenta hacer una petición (ej: ver trivias)

##### Resultado Esperado:
- ✅ Backend retorna 401
- ✅ Interceptor detecta 401
- ✅ Auto-logout automático
- ✅ Limpieza de localStorage
- ✅ Redirección a `/auth/login`

---

## 🧪 Testing

### Ejecutar Tests Unitarios

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar en modo watch (re-ejecuta al cambiar archivos)
npm run test:watch

# Generar reporte de coverage
npm run test:coverage
```

#### Tests Incluidos:
- ✅ `authStore.test.ts`: Store de Zustand
- ✅ `useAuth.test.tsx`: Hook de autenticación
- ✅ `auth.service.test.ts`: Servicio de auth
- ✅ `api-client.test.ts`: Cliente Axios
- ✅ `trivias.service.test.ts`: Servicio de trivias
- ✅ `questions.service.test.ts`: Servicio de preguntas
- ✅ `CreateTriviaModal.test.tsx`: Componente de crear trivia
- ✅ `TriviaCard.test.tsx`: Componente de tarjeta

### Ejecutar Tests E2E

```bash
# Ejecutar tests E2E
npm run test:e2e

# Ejecutar con UI interactivo
npm run test:e2e:ui

# Ver reporte de tests E2E
npm run test:e2e:report
```

#### Tests E2E Incluidos:
- ✅ Login completo
- ✅ Registro de usuario
- ✅ Navegación protegida
- ✅ Crear trivia
- ✅ Jugar trivia

---

## 📁 Estructura del Proyecto

```
nextjs-vama/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/               # Páginas de autenticación
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/          # Dashboard de usuario
│   │   ├── admin/              # Dashboard de admin
│   │   │   └── dashboard/
│   │   ├── my-trivias/         # Gestión de trivias
│   │   │   ├── components/
│   │   │   └── [id]/edit/      # Editar trivia
│   │   ├── play/               # Jugar trivias
│   │   ├── game-sessions/      # Historial
│   │   ├── rankings/           # Rankings
│   │   └── reports/            # Reportes (admin)
│   │
│   ├── stores/                 # Zustand Stores
│   │   └── authStore.ts        # Store de autenticación
│   │
│   ├── hooks/                  # Custom Hooks
│   │   └── useAuth.ts
│   │
│   ├── lib/                    # Utilidades
│   │   ├── api-client.ts       # Cliente Axios
│   │   ├── utils.ts
│   │   └── html-decoder.ts
│   │
│   ├── services/               # Servicios (API calls)
│   │   ├── auth.service.ts
│   │   ├── trivias.service.ts
│   │   ├── questions.service.ts
│   │   ├── game-sessions.service.ts
│   │   └── ...
│   │
│   └── types/                  # TypeScript Types
│       ├── auth.ts
│       ├── game.ts
│       └── ...
│
├── e2e/                        # Tests E2E (Playwright)
├── package.json
├── tsconfig.json
├── jest.config.js
├── playwright.config.ts
└── README.md
```

---

## 📜 Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| **Desarrollo** | `npm run dev` | Inicia servidor de desarrollo |
| **Build** | `npm run build` | Compila para producción |
| **Start** | `npm run start` | Inicia servidor de producción |
| **Lint** | `npm run lint` | Ejecuta ESLint |
| **Test** | `npm run test` | Ejecuta tests unitarios |
| **Test Watch** | `npm run test:watch` | Tests en modo watch |
| **Coverage** | `npm run test:coverage` | Reporte de cobertura |
| **E2E** | `npm run test:e2e` | Tests E2E con Playwright |
| **E2E UI** | `npm run test:e2e:ui` | Tests E2E con UI |
| **E2E Report** | `npm run test:e2e:report` | Ver reporte E2E |

---

## 👥 Usuarios de Prueba

El backend tiene usuarios pre-creados para pruebas:

### Player (Usuario Estándar)

| Email | Contraseña | Rol |
|-------|------------|-----|
| test@test.com | test123 | player |
| player1@test.com | player123 | player |
| player2@test.com | player123 | player |

**Permisos**:
- ✅ Jugar trivias
- ✅ Crear trivias propias
- ✅ Ver rankings
- ✅ Ver historial de sesiones
- ✅ Editar perfil personal
- ❌ No puede acceder a dashboard admin
- ❌ No puede gestionar usuarios

### Admin (Administrador)

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@test.com | admin123 | admin |

**Permisos**:
- ✅ Todo lo que puede hacer un player
- ✅ Acceder a dashboard admin
- ✅ Gestionar usuarios (activar/desactivar, cambiar roles)
- ✅ Ver reportes y estadísticas
- ✅ Moderar trivias

> **Nota**: Puedes crear nuevos usuarios con el formulario de registro. Por defecto, todos los nuevos usuarios tienen rol `player`.

---

## 🔌 API Endpoints

### Backend Base URL

```
https://nestjs-vama-production.up.railway.app/api
```

### Endpoints Principales

#### Autenticación
```
POST   /auth/login        - Iniciar sesión
POST   /auth/register     - Registrar usuario
GET    /auth/profile      - Obtener perfil actual
```

#### Usuarios
```
GET    /users             - Listar usuarios (admin)
GET    /users/:id         - Obtener usuario por ID
PATCH  /users/:id         - Actualizar usuario
PATCH  /users/:id/role    - Cambiar rol (admin)
PATCH  /users/:id/activate - Activar usuario (admin)
PATCH  /users/:id/deactivate - Desactivar usuario (admin)
```

#### Trivias
```
GET    /trivias           - Listar todas las trivias
GET    /trivias/:id       - Obtener trivia por ID
POST   /trivias           - Crear trivia
PATCH  /trivias/:id       - Actualizar trivia
DELETE /trivias/:id       - Eliminar trivia
```

#### Preguntas
```
GET    /questions         - Listar preguntas
POST   /questions         - Crear pregunta
PATCH  /questions/:id     - Actualizar pregunta
DELETE /questions/:id     - Eliminar pregunta
```

#### Sesiones de Juego
```
GET    /game-sessions                        - Listar sesiones
POST   /game-sessions                        - Crear sesión
GET    /game-sessions/:id                    - Obtener sesión
GET    /game-sessions/:id/questions/:number  - Obtener pregunta
POST   /game-sessions/:id/answers            - Enviar respuesta
PATCH  /game-sessions/:id/complete           - Completar sesión
```

#### Rankings
```
GET    /rankings/global                      - Ranking global
GET    /rankings/category/:categoryId        - Ranking por categoría
```

#### Reportes (Admin)
```
GET    /reports/users                        - Reporte de usuarios
GET    /reports/trivias                      - Reporte de trivias
GET    /reports/activity                     - Reporte de actividad
```

---

## 🔧 Troubleshooting

### Problema: `npm install` falla con conflictos

**Solución**:
```bash
npm install --force
```

o

```bash
npm install --legacy-peer-deps
```

---

### Problema: Error "Cannot find module 'next/navigation'"

**Solución**:
```bash
rm -rf node_modules
rm package-lock.json
npm install --force
```

---

### Problema: Puerto 3000 ya está en uso

**Solución**:

**Windows**:
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac**:
```bash
lsof -ti:3000 | xargs kill -9
```

o ejecuta en otro puerto:
```bash
PORT=3001 npm run dev
```

---

### Problema: "Failed to load resource: 500" al cargar trivias

**Causa**: Algunos endpoints del backend no están implementados.

**Solución**: La aplicación tiene fallbacks automáticos. Si ves warnings en la consola como:
```
⚠️ Endpoint no disponible en backend: /trivias/my-trivias (500)
```

Esto es **esperado** y la aplicación automáticamente usa rutas alternativas.

---

### Problema: Las preguntas "desaparecen" al recargar página de edición

**Causa**: El endpoint `/trivias/:id/questions` devuelve 404 en el backend.

**Solución**: Las preguntas se guardan correctamente, pero el backend no tiene el endpoint para listarlas. La aplicación usa **actualización optimista** para mostrar las preguntas agregadas en la sesión actual.

**Workaround**: Las preguntas SÍ se guardan en la base de datos y se usan al jugar la trivia.

---

### Problema: Token expirado después de un tiempo

**Causa**: El JWT tiene un tiempo de expiración configurado en el backend.

**Solución**: 
1. Cierra sesión
2. Vuelve a iniciar sesión
3. (Futuro) Implementar refresh token automático

---

### Problema: No aparecen categorías al crear trivia

**Solución**: Verifica que el backend esté funcionando:
```bash
curl https://nestjs-vama-production.up.railway.app/api/categories
```

Si devuelve categorías, recarga la aplicación.

---

### Problema: Tests fallan

**Solución**:
```bash
# Limpiar cache de Jest
npm run test -- --clearCache

# Re-ejecutar tests
npm run test
```

---

## 📚 Documentación Adicional

### Documentos Disponibles

| Documento | Ubicación | Descripción |
|-----------|-----------|-------------|
| **Informe Técnico** | `INFORME_TECNICO_TRIVIATIME.md` | Documentación técnica completa |
| **Testing Guide** | `TESTING.md` | Guía de testing |
| **Store Documentation** | `src/stores/README.md` | Documentación de Zustand stores |
| **My Trivias Feature** | `src/app/my-trivias/README.md` | Documentación del módulo de trivias |

### Enlaces Útiles

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Zustand Docs**: https://docs.pmnd.rs/zustand
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **OpenTDB API**: https://opentdb.com/api_config.php

---

## 🎯 Checklist de Pruebas Completas

Usa esta checklist para verificar todas las funcionalidades:

### Autenticación
- [ ] Registrar nuevo usuario
- [ ] Iniciar sesión con credenciales válidas
- [ ] Error al iniciar sesión con credenciales inválidas
- [ ] Cerrar sesión
- [ ] Persistencia de sesión al recargar página

### Dashboard
- [ ] Ver dashboard de player
- [ ] Ver dashboard de admin (con usuario admin)
- [ ] Editar perfil personal
- [ ] Navegación a todas las secciones

### Mis Trivias
- [ ] Listar trivias del usuario
- [ ] Crear nueva trivia
- [ ] Agregar preguntas (múltiple opción)
- [ ] Agregar preguntas (verdadero/falso)
- [ ] Editar pregunta
- [ ] Eliminar pregunta
- [ ] Publicar trivia
- [ ] Archivar trivia
- [ ] Buscar trivias
- [ ] Filtrar por categoría, dificultad, estado

### Jugar
- [ ] Seleccionar trivia propia
- [ ] Seleccionar trivia de OpenTDB
- [ ] Iniciar sesión de juego
- [ ] Responder preguntas
- [ ] Ver feedback (correcto/incorrecto)
- [ ] Completar sesión
- [ ] Ver resultados
- [ ] Continuar sesión en progreso

### Rankings
- [ ] Ver ranking global
- [ ] Ver ranking por categoría
- [ ] Filtrar rankings
- [ ] Ver gráficos

### Sesiones
- [ ] Ver historial de sesiones
- [ ] Filtrar sesiones
- [ ] Ver detalles de sesión

### Admin (solo con cuenta admin)
- [ ] Ver dashboard de admin
- [ ] Listar usuarios
- [ ] Cambiar rol de usuario
- [ ] Activar/desactivar usuario
- [ ] Ver reportes
- [ ] Exportar reportes

### Seguridad
- [ ] Rutas protegidas (sin auth)
- [ ] Player no puede acceder a admin
- [ ] Auto-logout en token expirado
- [ ] Redirección correcta según rol

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
npm run build

# Deploy carpeta .next
netlify deploy --prod --dir=.next
```

---

## 📝 Notas Importantes

### Limitaciones Conocidas del Backend

El backend tiene algunos endpoints no implementados o con errores:

1. ❌ `/trivias/my-trivias` → 500 (fallback automático a `/trivias`)
2. ❌ `/trivias/:id/questions` → 404 (actualización optimista en frontend)
3. ❌ `/trivias/:id/publish` → 404 (fallback a PATCH `/trivias/:id`)

**Solución**: El frontend implementa **fallbacks automáticos** y **resiliencia** para manejar estos casos.

### Features Futuras

- [ ] Implementar refresh token
- [ ] Modo offline (PWA)
- [ ] Notificaciones en tiempo real
- [ ] Chat entre jugadores
- [ ] Trivias multijugador en vivo
- [ ] Exportar trivias a PDF
- [ ] Importar trivias desde CSV

---

## 👨‍💻 Desarrollo

### Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Add nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

### Convenciones de Código

- **Componentes**: PascalCase (`TriviaCard.tsx`)
- **Funciones**: camelCase (`getDashboardRoute`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`)
- **CSS Modules**: kebab-case (`.trivia-card`)

---

## 📄 Licencia

Este proyecto es de uso académico.

---

## 🙏 Créditos

- **Framework**: Next.js
- **State Management**: Zustand
- **API Externa**: OpenTDB (Open Trivia Database)
- **Gráficos**: Recharts
- **Testing**: Jest, Playwright, Testing Library

---

## 📧 Contacto

**Equipo de Desarrollo**: TriviaTime  
**Fecha**: Noviembre 2025  
**Versión**: 1.0.0

---

**¡Gracias por usar TriviaTime! 🎮🎉**

Si encuentras algún problema o tienes sugerencias, por favor abre un issue en el repositorio.
