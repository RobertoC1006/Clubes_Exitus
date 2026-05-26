import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from './hooks/useRole';
import { useUser } from './UserContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';

import { API_BASE_URL } from './config';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { usuario } = useRole();
  const { logout } = useUser();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutModal(false);
  };

  return (
    <div className={usuario ? 'layout-root has-sidebar' : 'layout-root'} style={{ background: 'var(--color-surface)' }}>

      {/* 🔮 MODAL DE CIERRE DE SESIÓN SIMPLIFICADO */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem', zIndex: 99999
        }} onClick={() => setShowLogoutModal(false)}>
          <div style={{
            background: 'white', borderRadius: '1.25rem', width: '100%', maxWidth: '380px',
            overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-surface-container-high)' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>Confirmar Salida</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-outline)', fontWeight: 600, lineHeight: 1.5 }}>
                ¿Estás seguro de que deseas cerrar tu sesión actual?
              </p>
            </div>
            <div style={{ padding: '1rem 1.5rem 1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowLogoutModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '0.75rem', border: '1px solid var(--color-surface-container-high)', background: 'white', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={confirmLogout} style={{ padding: '0.6rem 1.2rem', borderRadius: '0.75rem', border: 'none', background: 'var(--color-error)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Cerrar Sesión</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR DESKTOP */}
      {usuario && <Sidebar onLogout={handleLogout} />}

      {/* ÁREA DE CONTENIDO (Header + Contenido de Página) */}
      <div className="content-area discrete-scroll">
        <Header />

        <div className="app-container">
          <main style={{ flex: 1, paddingBottom: '0.75rem' }}>
            {children}
          </main>
        </div>
      </div>

      {/* BOTTOM NAV (MOBILE ONLY) */}
      {usuario && <BottomNav />}

      {/* ESTILOS ESPECÍFICOS PARA HEADER/SIDEBAR VISIBILITY */}
      <style>{`
        @media (min-width: 768px) {
          .mobile-only { display: none !important; }
          .desktop-only { display: block !important; }
        }
        @media (max-width: 767px) {
          .desktop-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
