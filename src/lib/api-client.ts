import axios, { AxiosInstance, AxiosError } from 'axios';

// URL base del backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nestjs-vama-production.up.railway.app/api';

// Crear instancia de axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token en cada request
apiClient.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage (en el cliente)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Si el error es 401, eliminar token y redirigir a login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        // Redirigir a login solo si no estamos ya en esa página
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login';
        }
      }
    }
    
    // Silenciar errores 404/500 esperados de endpoints no implementados
    const url = error.config?.url || '';
    const status = error.response?.status;
    
    if ((status === 404 || status === 500) && (
      url.includes('/my-trivias') ||
      url.includes('/questions') ||
      url.includes('/publish') ||
      url.includes('/archive')
    )) {
      console.warn(`⚠️ Endpoint no disponible en backend: ${url} (${status})`);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_URL };

