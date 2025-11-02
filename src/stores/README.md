# Stores de Zustand

Este directorio contiene los stores de Zustand para la gestión centralizada del estado de la aplicación.

## Gestión del Estado (10%)

La aplicación utiliza **Zustand** como solución para la gestión del estado, cumpliendo con los requisitos:

- ✅ Utilizar una solución para la gestión del estado (Zustand)
- ✅ Gestionar el estado de autenticación y autorización de manera centralizada
- ✅ Manejar el estado de los datos principales que la aplicación consume

## Store de Autenticación (`authStore.ts`)

### Estado Gestionado:
- `user`: Usuario autenticado (null si no hay sesión)
- `isLoading`: Estado de carga inicial
- `isAuthenticated`: Boolean que indica si hay sesión activa

### Acciones Disponibles:
- `login()`: Iniciar sesión y actualizar estado
- `register()`: Registrar nuevo usuario y actualizar estado
- `logout()`: Cerrar sesión y limpiar estado
- `refreshUser()`: Actualizar datos del usuario desde el servidor
- `initialize()`: Inicializar estado desde localStorage

### Persistencia:
El store utiliza el middleware `persist` de Zustand para:
- Guardar el usuario en `localStorage` (clave: `auth-storage`)
- Sincronizar estado con token JWT almacenado
- Rehidratar estado al recargar la página

### Uso:

```typescript
import { useAuthStore } from '@/stores/authStore';

// En un componente
const { user, isAuthenticated, login, logout } = useAuthStore();

// O usando el hook personalizado
import { useAuth } from '@/hooks/useAuth';
const { user, login } = useAuth();
```

## Próximos Stores

Se pueden crear stores adicionales para:
- `triviaStore.ts` - Estado de trivias
- `gameSessionStore.ts` - Estado de sesiones de juego
- `rankingStore.ts` - Estado de rankings
- `uiStore.ts` - Estado de la interfaz (modales, notificaciones, etc.)

