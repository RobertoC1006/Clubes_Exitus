import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, CreditCard, User, GraduationCap } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-surface)' }}>
       
       {/* ==========================================================
           1. TOP NAVBAR GLOBAL (LOGO COLEGIO + AVATAR)
           ========================================================== */}
       <header style={{ 
          background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
          padding: '0.8rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--color-surface-container-high)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
       }}>
          {/* Logo Exitus */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
             <div style={{ background: 'var(--color-primary)', width: '2.2rem', height: '2.2rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={20} color="var(--color-secondary-container)" strokeWidth={2.5} />
             </div>
             <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)', margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
               EXITUS
             </h2>
          </div>

          {/* Avatar Pequeño del Profesor */}
          <div style={{ 
             background: 'var(--color-surface-container-highest)', 
             width: '2.2rem', height: '2.2rem', borderRadius: '50%', 
             display: 'flex', alignItems: 'center', justifyContent: 'center', 
             fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.85rem',
             border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
             JP
          </div>
       </header>

       {/* ==========================================================
           2. CONTENIDO PRINCIPAL DE LA PANTALLA
           ========================================================== */}
       <main style={{ flex: 1, paddingBottom: '6.5rem' }}>
         {children}
       </main>

       {/* ==========================================================
           3. BOTTOM NAVBAR GLOBAL (MENÚ DE NAVEGACIÓN PWA)
           ========================================================== */}
       <nav style={{ 
          position: 'fixed', bottom: 0, left: 0, width: '100%', 
          background: 'rgba(255, 255, 255, 0.90)', backdropFilter: 'blur(15px)',
          borderTop: '1px solid var(--color-surface-container-high)',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          padding: '0.6rem 0', paddingBottom: 'calc(0.6rem + env(safe-area-inset-bottom))', zIndex: 100,
          boxShadow: '0 -4px 24px rgba(29, 40, 72, 0.05)'
       }}>
          {/* Nav Item: Mis Clubes */}
          <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', width: '25%', color: location.pathname === '/' ? 'var(--color-primary)' : 'var(--color-outline)' }}>
             <div style={{ background: location.pathname === '/' ? 'var(--color-primary-fixed)' : 'transparent', padding: '0.15rem 1rem', borderRadius: '99px', transition: 'all 0.2s' }}>
                <LayoutDashboard size={22} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
             </div>
             <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Clubes</span>
          </button>
          
          {/* Nav Item: Asistencia */}
          <button onClick={() => location.pathname !== '/' && navigate(-1)} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', width: '25%', color: location.pathname.includes('/asistencia') ? 'var(--color-primary)' : 'var(--color-outline)' }}>
             <div style={{ background: location.pathname.includes('/asistencia') ? 'var(--color-primary-fixed)' : 'transparent', padding: '0.15rem 1rem', borderRadius: '99px', transition: 'all 0.2s' }}>
                <CheckSquare size={22} strokeWidth={location.pathname.includes('/asistencia') ? 2.5 : 2} />
             </div>
             <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Asistencia</span>
          </button>

          {/* Nav Item: Pagos */}
          <button onClick={() => alert('Próximamente: Módulo de Pagos')} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', width: '25%', color: 'var(--color-outline)' }}>
             <div style={{ padding: '0.15rem 1rem', borderRadius: '99px' }}>
                <CreditCard size={22} strokeWidth={2} />
             </div>
             <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Pagos</span>
          </button>

          {/* Nav Item: Perfil */}
          <button onClick={() => alert('Próximamente: Módulo de Perfil')} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', width: '25%', color: 'var(--color-outline)' }}>
             <div style={{ padding: '0.15rem 1rem', borderRadius: '99px' }}>
                <User size={22} strokeWidth={2} />
             </div>
             <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Perfil</span>
          </button>
       </nav>
    </div>
  );
}
