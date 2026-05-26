import { useUser } from '../UserContext';

/**
 * Hook para gestionar y detectar roles de usuario de forma centralizada
 */
export function useRole() {
  const { usuario } = useUser();

  const rol = usuario?.rol?.toUpperCase() || '';

  return {
    isAdmin: rol === 'ADMINISTRADOR',
    isProfesor: rol === 'PROFESOR',
    isPadre: rol === 'PADRE',
    rol: rol,
    usuario: usuario
  };
}
