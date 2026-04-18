import { LogOut, ChevronRight, Shield, Bell, Mail, BookOpen } from 'lucide-react';
import { useUser } from './UserContext';
import './index.css';

const rolLabel: Record<string, string> = {
  PROFESOR:      '👨‍🏫 Profesor',
  ADMINISTRADOR: '👑 Administrador',
  PADRE:         '👨‍👩‍👦 Padre de Familia',
  ALUMNO:        '🎒 Alumno',
};

interface MenuItemProps { icon: any; label: string; sublabel?: string; danger?: boolean; onClick?: () => void; }
function MenuItem({ icon: Icon, label, sublabel, danger, onClick }: MenuItemProps) {
  return (
    <button onClick={onClick} style={{
      width: '100%', background: 'none', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '0.85rem',
      padding: '0.9rem 1rem', borderRadius: '0.75rem', textAlign: 'left',
      transition: 'background 0.15s'
    }}>
      <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.65rem', background: danger ? 'var(--color-error-container)' : 'var(--color-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={danger ? 'var(--color-error)' : 'var(--color-primary)'} strokeWidth={2} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: danger ? 'var(--color-error)' : 'var(--color-primary)' }}>{label}</p>
        {sublabel && <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>{sublabel}</p>}
      </div>
      <ChevronRight size={16} color="var(--color-outline)" />
    </button>
  );
}

export default function Perfil() {
  const { usuario, logout } = useUser();

  if (!usuario) {
    return (
      <div className="app-container flex-center">
        <p>No has iniciado sesión.</p>
      </div>
    );
  }

  return (
    <div className="app-container animate-enter" style={{ padding: '1.25rem', paddingBottom: '7rem' }}>

      {/* TARJETA DE PERFIL */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{
          background: 'var(--color-primary-container)', borderRadius: '1.5rem',
          padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem',
          boxShadow: '0 8px 32px rgba(29,40,72,0.25)'
        }}>
          {/* Avatar */}
          <div style={{ width: '5rem', height: '5rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 900, fontSize: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            {usuario.initials}
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>
              {usuario.nombre} {usuario.apellido}
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-on-primary-container)', fontWeight: 600 }}>
              {rolLabel[usuario.rol]}
            </p>
          </div>
          {/* Badge de ID (Simulado si no hay DNI) */}
          <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '0.3rem 0.9rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em' }}>
            USUARIO ID: #{usuario.id}
          </span>
        </div>
      </section>

      {/* INFO PERSONAL */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
          Información Personal
        </h3>
        <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Mail size={16} color="var(--color-outline)" />
            <div>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>Correo Institucional</p>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9rem' }}>{usuario.email}</p>
            </div>
          </div>
          <div style={{ height: '1px', background: 'var(--color-surface-container-high)', margin: '0 1rem' }} />
          <div style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <BookOpen size={16} color="var(--color-outline)" />
            <div>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>Rol en Plataforma</p>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9rem' }}>{usuario.rol}</p>
            </div>
          </div>
        </div>
      </section>

      {/* MENÚ DE OPCIONES */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
          Configuración
        </h3>
        <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: '1.25rem' }}>
          <MenuItem icon={Bell}         label="Notificaciones"  sublabel="Gestionar alertas y avisos" />
          <div style={{ height: '1px', background: 'var(--color-surface-container-high)', margin: '0 1rem' }} />
          <MenuItem icon={Shield}       label="Privacidad"      sublabel="Tus datos y permisos"       />
        </div>
      </section>

      {/* CERRAR SESIÓN */}
      <section>
        <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: '1.25rem' }}>
          <MenuItem
            icon={LogOut}
            label="Cerrar Sesión"
            sublabel="Salir de la cuenta de forma segura"
            danger
            onClick={() => {
              if (window.confirm('¿Seguro que quieres cerrar sesión?')) {
                logout();
              }
            }}
          />
        </div>
      </section>

    </div>
  );
}
