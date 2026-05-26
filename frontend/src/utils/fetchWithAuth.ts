import { API_BASE_URL } from '../config';

/**
 * Wrapper sobre fetch para incluir el token JWT automáticamente
 * y manejar errores de sesión expirada (401).
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Si la sesión expiró o es inválida, limpiamos y redirigimos al login
    localStorage.removeItem('access_token');
    localStorage.removeItem('exitus_user');
    window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
  }

  return response;
}
