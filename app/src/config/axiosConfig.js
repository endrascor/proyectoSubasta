import axios from 'axios';

/**
 * Configura axios con un interceptor para incluir el token JWT en todas las peticiones
 */
export const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor para manejar respuestas con errores de autenticación
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('token');
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );
};

export default axios;
