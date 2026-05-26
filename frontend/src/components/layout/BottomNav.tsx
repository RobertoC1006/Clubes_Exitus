import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  User,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { useRole } from '../../hooks/useRole';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isProfesor, isPadre } = useRole();

  const homeRoute = isAdmin ? '/admin' : isPadre ? '/portal' : '/';
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');

  const adminTabs = [
    { key: 'panel', icon: <Calendar size={22} />, label: 'Panel', path: '/admin?tab=panel' },
    { key: 'clubes', icon: <BookOpen size={22} />, label: 'Clubes', path: '/admin?tab=clubes' },
    { key: 'personas', icon: <User size={22} />, label: 'Personas', path: '/admin?tab=personas' },
    { key: 'pagos', icon: <CreditCard size={22} />, label: 'Pagos', path: '/admin?tab=pagos' },
    { key: 'horarios', icon: <Calendar size={22} />, label: 'Horarios', path: '/admin?tab=horarios' },
    { key: 'aulas', icon: <Calendar size={22} />, label: 'Aulas', path: '/admin?tab=aulas' },
    { key: 'asistencia-docente', icon: <Calendar size={22} />, label: 'Asistencia', path: '/admin?tab=asistencia-docente' },
    { key: 'reporte', icon: <Calendar size={22} />, label: 'Reportes', path: '/admin?tab=reporte' },
  ];

  const globalLinks = [
    ...(!isAdmin ? [{ key: 'inicio', icon: <LayoutDashboard size={22} />, label: 'Inicio', path: homeRoute, active: (location.pathname === '/' || (isPadre && location.pathname === '/portal')) && (!currentTab || currentTab === 'inicio') }] : []),
    ...(isProfesor ? [
      { key: 'clubes', icon: <BookOpen size={22} />, label: 'Clubes', path: '/?tab=clubes', active: currentTab === 'clubes' },
      { key: 'rendimiento', icon: <BookOpen size={22} />, label: 'Rendimiento', path: '/rendimiento', active: location.pathname === '/rendimiento' },
      { key: 'horarios', icon: <Calendar size={22} />, label: 'Horarios', path: '/?tab=horarios', active: currentTab === 'horarios' }
    ] : []),
    ...(isPadre ? [{ key: 'pagos', icon: <CreditCard size={22} />, label: 'Pagos', path: '/pagos', active: location.pathname === '/pagos' }] : []),
    ...(!isAdmin ? [{ key: 'perfil', icon: <User size={22} />, label: 'Perfil', path: '/perfil', active: location.pathname === '/perfil' }] : []),
  ];

  return (
    <nav className="bottom-nav-mobile" style={{
      position: 'fixed', bottom: 0, left: 0, width: '100%',
      background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(15px)',
      borderTop: '1px solid var(--color-surface-container-high)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '0.6rem 0', paddingBottom: 'calc(0.6rem + env(safe-area-inset-bottom))',
      zIndex: 100, boxShadow: '0 -4px 24px rgba(29,40,72,0.05)'
    }}>
      {isAdmin ? (
        adminTabs.map(t => {
          const isActive = currentTab === t.key || (!currentTab && t.key === 'panel');
          return (
            <button
              key={t.key}
              onClick={() => navigate(t.path)}
              style={{
                background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '0.2rem', width: '12.5%', cursor: 'pointer',
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
        globalLinks.map(l => (
          <button key={l.key} onClick={() => navigate(l.path)} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', width: '33.33%', cursor: 'pointer', color: l.active ? 'var(--color-primary)' : 'var(--color-outline)' }}>
            <div style={{ background: l.active ? 'var(--color-primary-fixed)' : 'transparent', padding: '0.15rem 1rem', borderRadius: '99px', transition: 'all 0.2s' }}>
              {l.icon}
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>{l.label}</span>
          </button>
        ))
      )}
    </nav>
  );
}
