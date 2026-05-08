import { useNavigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { NotificationsDropdown } from './NotificationsDropdown';
import schoolLogo from '../../assets/hero.png';

export function Header() {
  const navigate = useNavigate();
  const { usuario, isAdmin, isProfesor } = useRole();

  return (
    <header className="header-glass" style={{
      padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.02)', maxHeight: '72px'
    }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        {/* Solo mostrar Logo en Header si es móvil */}
        <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ background: 'white', width: '2.6rem', height: '2.6rem', borderRadius: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <img src={schoolLogo} alt="Logo" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)', margin: 0, letterSpacing: '-0.03em', textTransform: 'uppercase', lineHeight: 1 }}>
              EXITUS
            </h2>
            {isAdmin && <p style={{ margin: 0, fontSize: '0.55rem', fontWeight: 800, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dashboard Admin</p>}
          </div>
        </div>
        {/* En desktop el Logo ya está en el sidebar, podemos mostrar el título de la sección u otro elemento */}
        <div className="desktop-only" style={{ display: 'block' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary-container)', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>
            Sistema de Gestión Escolar
          </p>
        </div>
      </div>

      {/* ACCIONES DERECHA (Notificaciones + Avatar) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
        {usuario && (
          <div style={{ textAlign: 'right', marginRight: '0.5rem' }} className="desktop-only">
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-primary)' }}>{usuario.nombre} {usuario.apellido}</p>
            <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
              {isAdmin ? 'Administrador' : isProfesor ? 'Profesor' : 'Familia'}
            </p>
          </div>
        )}

        <NotificationsDropdown />

        <button onClick={() => navigate('/perfil')} title="Mi Perfil" style={{
          background: 'var(--color-surface-container-highest)',
          width: '2.4rem', height: '2.4rem', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.85rem',
          border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer'
        }}>
          {usuario?.initials ?? '??'}
        </button>
      </div>
    </header>
  );
}
