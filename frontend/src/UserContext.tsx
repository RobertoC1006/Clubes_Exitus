import { createContext, useContext, useState } from 'react';

export interface UsuarioSesion {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  celular?: string;
  rol: 'ADMINISTRADOR' | 'PROFESOR' | 'PADRE' | 'ALUMNO';
  initials: string;
  mustChangePassword?: boolean;
}

interface UserContextType {
  usuario: UsuarioSesion | null;
  login: (u: UsuarioSesion) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  usuario: null,
  login: () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => {
    try {
      const saved = localStorage.getItem('exitus_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const login = (u: UsuarioSesion) => {
    localStorage.setItem('exitus_user', JSON.stringify(u));
    setUsuario(u);
  };

  const logout = () => {
    localStorage.removeItem('exitus_user');
    setUsuario(null);
  };

  return (
    <UserContext.Provider value={{ usuario, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
