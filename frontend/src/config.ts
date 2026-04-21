// Configuración centralizada de la API
// En desarrollo (Vite dev server) apuntamos al localhost:3000
// En producción (Docker/Nginx) usamos el proxy /api que redirige al contenedor backend

export const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3000' 
  : '/api';

export default API_BASE_URL;
