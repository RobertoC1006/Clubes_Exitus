import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './UserContext';
import Dashboard from './Dashboard';
import PaseLista from './PaseLista';
import AdminDashboard from './AdminDashboard';
import PortalFamiliar from './PortalFamiliar';
import Pagos from './Pagos';
import Perfil from './Perfil';
import Login from './Login';
import Layout from './Layout';
import './index.css';

// ==========================================
// Guard de Autenticación
// ==========================================
function RequireAuth({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const { usuario } = useUser();
  if (!usuario) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/login" replace />;
  return children;
}

// ==========================================
// Redirect inteligente al Home según rol
// ==========================================
function HomeRedirect() {
  const { usuario } = useUser();
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol === 'ADMINISTRADOR') return <Navigate to="/admin" replace />;
  if (usuario.rol === 'PADRE')         return <Navigate to="/portal" replace />;
  return <Dashboard />;
}

// ==========================================
// RUTAS PRINCIPALES
// ==========================================
function AppRoutes() {
  const { usuario } = useUser();

  return (
    <Routes>
      {/* Login: solo si no está logueado */}
      <Route
        path="/login"
        element={usuario ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Raíz → redirige según rol */}
      <Route path="/" element={
        <RequireAuth>
          <Layout><HomeRedirect /></Layout>
        </RequireAuth>
      } />

      {/* 👨‍🏫 PROFESOR */}
      <Route path="/clubes/:clubId/asistencia" element={
        <RequireAuth roles={['PROFESOR']}>
          <Layout><PaseLista /></Layout>
        </RequireAuth>
      } />

      {/* 👑 ADMINISTRADOR */}
      <Route path="/admin" element={
        <RequireAuth roles={['ADMINISTRADOR']}>
          <Layout><AdminDashboard /></Layout>
        </RequireAuth>
      } />

      {/* 👨‍👩‍👦 PADRE */}
      <Route path="/portal" element={
        <RequireAuth roles={['PADRE', 'ADMINISTRADOR']}>
          <Layout><PortalFamiliar /></Layout>
        </RequireAuth>
      } />

      {/* 💳 PAGOS */}
      <Route path="/pagos" element={
        <RequireAuth>
          <Layout><Pagos /></Layout>
        </RequireAuth>
      } />

      {/* 👤 PERFIL */}
      <Route path="/perfil" element={
        <RequireAuth>
          <Layout><Perfil /></Layout>
        </RequireAuth>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ==========================================
// RAÍZ DE LA APP
// ==========================================
export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  );
}
