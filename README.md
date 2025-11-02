# 🎮 TriviaTime - Frontend Next.js

Frontend de la aplicación TriviaTime desarrollado con Next.js 14, TypeScript y React.

## 📋 Características Implementadas

- ✅ Autenticación (Login y Registro)
- ✅ Manejo de tokens JWT
- ✅ **Gestión de estado con Zustand** (10% del proyecto)
  - Estado de autenticación y autorización centralizado
  - Persistencia en localStorage
  - Sincronización con tokens JWT
- ✅ Integración con backend NestJS
- ✅ Páginas de Login y Registro
- ✅ Dashboard básico

## 🛠️ Tecnologías

- **Next.js** 14.0.0 - Framework React
- **TypeScript** - Tipado estático
- **Zustand** 4.4.7 - Gestión de estado (requisito 10%)
- **Axios** - Cliente HTTP para llamadas API
- **CSS Modules** - Estilos modulares

## 📦 Instalación

1. Instalar dependencias:

```bash
npm install
```

2. Configurar variables de entorno:

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=https://nestjs-vama-production.up.railway.app/api
```

3. Ejecutar en modo desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🚀 Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Compilar para producción
- `npm run start` - Ejecutar en producción
- `npm run lint` - Ejecutar linter

## 📁 Estructura del Proyecto

```
nextjs-vama/
├── src/
│   ├── app/                    # Rutas de Next.js (App Router)
│   │   ├── auth/
│   │   │   ├── login/          # Página de login
│   │   │   └── register/       # Página de registro
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── layout.tsx          # Layout raíz
│   │   ├── page.tsx            # Página principal (redirige)
│   │   └── globals.css         # Estilos globales
│   ├── stores/                 # Stores de Zustand
│   │   ├── authStore.ts        # Store de autenticación
│   │   └── README.md           # Documentación de stores
│   ├── hooks/                  # Hooks personalizados
│   │   └── useAuth.ts          # Hook para autenticación
│   ├── lib/                    # Utilidades
│   │   └── api-client.ts       # Cliente API configurado
│   ├── services/               # Servicios
│   │   └── auth.service.ts     # Servicio de autenticación
│   └── types/                  # Tipos TypeScript
│       └── auth.ts             # Tipos de autenticación
├── .gitignore
├── next.config.js
├── package.json
└── tsconfig.json
```

## 🔐 Autenticación

El sistema de autenticación utiliza:

- **JWT Tokens** almacenados en `localStorage`
- **Zustand Store** para gestión centralizada del estado de autenticación
- **Persist middleware** para guardar estado en localStorage
- **Interceptores Axios** para agregar token automáticamente
- **Redirección automática** si el token expira o es inválido

### Gestión del Estado (10%)

La aplicación implementa gestión de estado con **Zustand**:

- ✅ **Estado centralizado**: Store único para autenticación (`authStore.ts`)
- ✅ **Autenticación y autorización**: Gestionadas de manera centralizada
- ✅ **Persistencia**: El estado se guarda en localStorage automáticamente
- ✅ **Sincronización**: El estado se sincroniza con tokens JWT al rehidratar

Ver más detalles en: [`src/stores/README.md`](src/stores/README.md)

### Endpoints utilizados

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil (futuro)

## 🌐 Conexión con Backend

La URL del backend está configurada en:
- `next.config.js` - Variable `NEXT_PUBLIC_API_URL`
- `.env.local` - Para sobrescribir en desarrollo local

Por defecto apunta a: `https://nestjs-vama-production.up.railway.app/api`

## 📝 Próximas Implementaciones

- [ ] Dashboard completo con trivias
- [ ] Página de juego
- [ ] Rankings
- [ ] Perfil de usuario
- [ ] Gestión de trivias (admin)
- [ ] Reportes y estadísticas

## 👨‍💻 Desarrollo

Para contribuir o continuar el desarrollo:

1. Crear rama desde `main`
2. Implementar funcionalidad
3. Probar con el backend desplegado
4. Hacer commit y push

---

Desarrollado como proyecto académico - Universidad
