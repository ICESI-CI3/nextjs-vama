import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook personalizado para usar el store de autenticación
 * Inicializa el estado al montar el componente
 */
export function useAuth() {
  const store = useAuthStore();
  const { initialize, isLoading } = store;

  // Inicializar estado al montar el componente solo una vez
  useEffect(() => {
    if (isLoading) {
      initialize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  return store;
}

