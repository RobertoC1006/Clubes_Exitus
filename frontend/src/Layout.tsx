import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, CreditCard, User, GraduationCap, BarChart2, BookOpen, UserPlus, Download } from 'lucide-react';
import { useUser } from './UserContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isProfesor = usuario?.rol === 'PROFESOR';
  const isAdmin    = usuario?.rol === 'ADMINISTRADOR';
  const isPadre    = usuario?.rol === 'PADRE';

  const homeRoute  = isAdmin ? '/admin' : isPadre ? '/portal' : '/';
  const homeActive = ['/', '/admin', '/portal'].includes(location.pathname);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-surface)' }}>

      {/* TOP NAV */}
      <header style={{
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        padding: '0.8rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid var(--color-surface-container-high)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'var(--color-primary)', width: '2.2rem', height: '2.2rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={20} color="var(--color-secondary-container)" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)', margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1 }}>
              EXITUS
            </h2>
            {usuario && (
              <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>
                {isAdmin ? '👑 Admin' : isProfesor ? '👨‍🏫 Profesor' : '👨‍👩‍👦 Familia'}
              </p>
            )}
          </div>
        </div>

        {/* Avatar → logout al tocar */}
        <button onClick={handleLogout} title="Cerrar sesión" style={{
          background: 'var(--color-surface-container-highest)',
          width: '2.4rem', height: '2.4rem', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.85rem',
          border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer'
        }}>
          {usuario?.initials ?? '??'}
        </button>
      </header>

      {/* CONTENIDO */}
      <main style={{ flex: 1, paddingBottom: '6.5rem' }}>
        {children}
      </main>

      {/* BOTTOM NAV */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, width: '100%',
        background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(15px)',
        borderTop: '1px solid var(--color-surface-container-high)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0.6rem 0', paddingBottom: 'calc(0.6rem + env(safe-area-inset-bottom))',
        zIndex: 100, boxShadow: '0 -4px 24px rgba(29,40,72,0.05)'
      }}>
        {(isAdmin && (location.pathname.startsWith('/admin') || location.pathname === '/')) ? (
          // ── ADMIN SPECIFIC NAVIGATION ──
          ([
            { key: 'panel',    icon: <BarChart2 size={24}/>,  label: 'Panel' },
            { key: 'clubes',   icon: <BookOpen size={24}/>,   label: 'Clubes' },
            { key: 'personas', icon: <UserPlus size={24}/>,   label: 'Personas' },
            { key: 'pagos',    icon: <CreditCard size={24}/>, label: 'Pagos' },
            { key: 'reporte',  icon: <Download size={24}/>,   label: 'Reporte' },
          ] as const).map(t => {
            const isActive = new URLSearchParams(location.search).get('tab') === t.key || (!new URLSearchParams(location.search).get('tab') && t.key === 'panel');
            return (
              <button
                key={t.key}
                onClick={() => navigate(`/admin?tab=${t.key}`)}
                style={{
                  background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '0.2rem', width: '20%', cursor: 'pointer',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-outline)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  background: isActive ? 'var(--color-primary-fixed)' : 'transparent',
                  padding: '0.15rem 0.8rem', borderRadius: '99px', transition: 'all 0.2s'
                }}>
                  {t.icon}
                </div>
                <span style={{ fontSize: '0.62rem', fontWeight: 800 }}>{t.label}</span>
              </button>
            );
          })
        ) : (
          // ── GLOBAL NAVIGATION ──
          <>
            {/* Inicio */}
            <button onClick={() => navigate(homeRoute)} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', width: '25%', cursor: 'pointer', color: homeActive ? 'var(--color-primary)' : 'var(--color-outline)' }}>
              <div style={{ background: homeActive ? 'var(--color-primary-fixed)' : 'transparent', padding: '0.15rem 1rem', borderRadius: '99px', transition: 'all 0.2s' }}>
                <LayoutDashboard size={22} strokeWidth={homeActive ? 2.5 : 2} />
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Inicio</span>
            </button>

            {/* Asistencia — solo Profesores */}
            {isProfesor && (
              <button onClick={() => location.pathname !== '/' && navigate(-1)} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', width: '25%', cursor: 'pointer', color: location.pathname.includes('/asistencia') ? 'var(--color-primary)' : 'var(--color-outline)' }}>
                <div style={{ background: location.pathname.includes('/asistencia') ? 'var(--color-primary-fixed)' : 'transparent', padding: '0.15rem 1rem', borderRadius: '99px', transition: 'all 0.2s' }}>
                  <CheckSquare size={22} strokeWidth={location.pathname.includes('/asistencia') ? 2.5 : 2} />
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Asistencia</span>
              </button>
            )}

            {/* Pagos */}
            <button onClick={() => navigate('/pagos')} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', width: '25%', cursor: 'pointer', color: location.pathname === '/pagos' ? 'var(--color-primary)' : 'var(--color-outline)' }}>
              <div style={{ background: location.pathname === '/pagos' ? 'var(--color-primary-fixed)' : 'transparent', padding: '0.15rem 1rem', borderRadius: '99px', transition: 'all 0.2s' }}>
                <CreditCard size={22} strokeWidth={location.pathname === '/pagos' ? 2.5 : 2} />
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Pagos</span>
            </button>

            {/* Perfil */}
            <button onClick={() => navigate('/perfil')} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', width: '25%', cursor: 'pointer', color: location.pathname === '/perfil' ? 'var(--color-primary)' : 'var(--color-outline)' }}>
              <div style={{ background: location.pathname === '/perfil' ? 'var(--color-primary-fixed)' : 'transparent', padding: '0.15rem 1rem', borderRadius: '99px', transition: 'all 0.2s' }}>
                <User size={22} strokeWidth={location.pathname === '/perfil' ? 2.5 : 2} />
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Perfil</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
