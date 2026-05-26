import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  CreditCard,
  User,
  Users,
  BarChart2,
  BookOpen,
  UserPlus,
  Download,
  LogOut,
  Calendar,
  MapPin,
} from 'lucide-react';
import { useRole } from '../../hooks/useRole';
import schoolLogo from '../../assets/hero.png';

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isProfesor, isPadre } = useRole();

  const homeRoute = isAdmin ? '/admin' : isPadre ? '/portal' : '/';
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');

  const adminTabs = [
    { key: 'panel', icon: <BarChart2 size={22} />, label: 'Panel', path: '/admin?tab=panel' },
    { key: 'clubes', icon: <BookOpen size={22} />, label: 'Clubes', path: '/admin?tab=clubes' },
    { key: 'personas', icon: <UserPlus size={22} />, label: 'Personas', path: '/admin?tab=personas' },
    { key: 'pagos', icon: <CreditCard size={22} />, label: 'Pagos', path: '/admin?tab=pagos' },
    { key: 'horarios', icon: <Calendar size={22} />, label: 'Horarios', path: '/admin?tab=horarios' },
    { key: 'aulas', icon: <MapPin size={22} />, label: 'Aulas', path: '/admin?tab=aulas' },
    { key: 'asistencia-docente', icon: <CheckSquare size={22} />, label: 'Asistencia Docente', path: '/admin?tab=asistencia-docente' },
    { key: 'reporte', icon: <Download size={22} />, label: 'Reportes', path: '/admin?tab=reporte' },
  ];

  const globalLinks = [
    ...(!isAdmin ? [{ key: 'inicio', icon: <LayoutDashboard size={22} />, label: 'Inicio', path: homeRoute, active: (location.pathname === '/' || (isPadre && location.pathname === '/portal')) && (!currentTab || currentTab === 'inicio') }] : []),
    ...(isProfesor ? [
      { key: 'clubes', icon: <BookOpen size={22} />, label: 'Clubes', path: '/?tab=clubes', active: currentTab === 'clubes' },
      { key: 'rendimiento', icon: <BarChart2 size={22} />, label: 'Rendimiento', path: '/rendimiento', active: location.pathname === '/rendimiento' },
      { key: 'horarios', icon: <Calendar size={22} />, label: 'Horarios', path: '/?tab=horarios', active: currentTab === 'horarios' }
    ] : []),
    ...(isPadre ? [{ key: 'pagos', icon: <CreditCard size={22} />, label: 'Pagos', path: '/pagos', active: location.pathname === '/pagos' }] : []),
    ...(!isAdmin ? [{ key: 'perfil', icon: <User size={22} />, label: 'Perfil', path: '/perfil', active: location.pathname === '/perfil' }] : []),
  ];

  return (
    <aside className="sidebar-desktop">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
        <div style={{ width: '2.8rem', height: '2.8rem', background: 'white', borderRadius: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
          <img src={schoolLogo} alt="Fenix Mascot" style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ color: 'var(--color-primary)', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.05em' }}>EXITUS</span>
          {isAdmin && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '1px' }}>Administrador</span>}
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {isAdmin ? (
          adminTabs.map(t => {
            const isActive = currentTab === t.key || (!currentTab && t.key === 'panel');
            return (
              <button key={t.key} onClick={() => navigate(t.path)} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })
        ) : (
          globalLinks.map(l => (
            <button key={l.key} onClick={() => navigate(l.path)} className={`sidebar-link ${l.active ? 'active' : ''}`}>
              {l.icon}
              <span>{l.label}</span>
            </button>
          ))
        )}
      </nav>

      <footer style={{ marginTop: 'auto', padding: '1rem 0' }}>
        <button
          onClick={onLogout}
          className="sidebar-link"
          style={{ color: 'var(--color-error)', width: '100%', background: 'var(--color-surface-container-low)' }}
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </footer>
    </aside>
  );
}
