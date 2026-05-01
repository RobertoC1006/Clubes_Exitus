// Configuración centralizada de la API
// En desarrollo (Vite dev server) detectamos la IP automáticamente para permitir acceso desde el celular en la misma red
// En producción (Docker/Nginx) usamos el proxy /api que redirige al contenedor backend

const getApiUrl = () => {
  if (!import.meta.env.DEV) return '/api';

  // Si estamos en desarrollo, usamos el mismo host que el navegador pero con el puerto 3000 (backend)
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${hostname}:3000`;
};

export const API_BASE_URL = getApiUrl();
export default API_BASE_URL;
