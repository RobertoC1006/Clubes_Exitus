import { LogOut, ChevronRight, Shield, Bell, BookOpen, User, Fingerprint } from 'lucide-react';
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
      <div style={{ 
        width: '2.4rem', height: '2.4rem', borderRadius: '0.8rem', 
        background: danger ? 'rgba(211, 47, 47, 0.1)' : 'var(--color-surface-container)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
      }}>
        <Icon size={18} color={danger ? 'var(--color-error)' : 'var(--color-primary)'} strokeWidth={2.5} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: danger ? 'var(--color-error)' : 'var(--color-primary)' }}>{label}</p>
        {sublabel && <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>{sublabel}</p>}
      </div>
      <ChevronRight size={16} color="var(--color-outline-variant)" />
    </button>
  );
}

export default function Perfil() {
  const { usuario, logout } = useUser();

  if (!usuario) {
    return (
      <div className="flex-center">
        <p>No has iniciado sesión.</p>
      </div>
    );
  }

  return (
    <div className="animate-enter" style={{ padding: '1.25rem', paddingBottom: '7rem', maxWidth: '500px', margin: '0 auto' }}>

      {/* TARJETA DE PERFIL PREMIUM */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{
          background: 'var(--grad-primary)', borderRadius: '2rem',
          padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
          boxShadow: '0 20px 40px rgba(29,40,72,0.25)', border: '1px solid rgba(255,255,255,0.1)',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Decoración de fondo */}
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', opacity: 0.1 }}>
             <User size={150} color="white" />
          </div>

          {/* Avatar Initials */}
          <div style={{ 
            width: '5.5rem', height: '5.5rem', borderRadius: '1.75rem', 
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
            color: 'white', fontWeight: 900, fontSize: '2rem', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            zIndex: 1
          }}>
            {usuario.initials}
          </div>

          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>
              {usuario.nombre} {usuario.apellido}
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {rolLabel[usuario.rol]}
            </p>
          </div>
        </div>
      </section>

      {/* INFORMACIÓN DE IDENTIDAD */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-outline)' }}>
          Datos de acceso
        </h3>
        <div className="bento-card" style={{ background: 'white', border: '1px solid var(--color-surface-container-high)', borderRadius: '1.5rem', padding: '0.5rem' }}>
          <div style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', background: 'var(--color-primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Fingerprint size={20} color="var(--color-primary)" strokeWidth={2.5} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--color-outline)', fontWeight: 800, textTransform: 'uppercase' }}>DNI / Usuario</p>
              <p style={{ margin: 0, fontWeight: 900, color: 'var(--color-primary)', fontSize: '1.1rem' }}>{usuario.dni}</p>
            </div>
          </div>
          
          <div style={{ height: '1px', background: 'var(--color-surface-container-high)', margin: '0 1rem' }} />
          
          <div style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', background: 'var(--color-secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Shield size={20} color="var(--color-on-secondary-container)" strokeWidth={2.5} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--color-outline)', fontWeight: 800, textTransform: 'uppercase' }}>Rol del sistema</p>
              <p style={{ margin: 0, fontWeight: 900, color: 'var(--color-primary)', fontSize: '1.1rem' }}>{usuario.rol}</p>
            </div>
          </div>
        </div>
      </section>

      {/* MENÚ DE OPCIONES */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-outline)' }}>
          Preferencias
        </h3>
        <div style={{ background: 'white', borderRadius: '1.5rem', border: '1px solid var(--color-surface-container-high)', padding: '0.5rem' }}>
          <MenuItem icon={Bell} label="Notificaciones" sublabel="Gestionar alertas del sistema" />
          <div style={{ height: '1px', background: 'var(--color-surface-container-high)', margin: '0 1rem' }} />
          <MenuItem icon={LogOut} label="Cerrar Sesión" sublabel="Salir de la cuenta de forma segura" danger 
            onClick={() => {
              if (window.confirm('¿Deseas cerrar tu sesión actual?')) {
                logout();
              }
            }} 
          />
        </div>
      </section>

      <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--color-outline)', fontWeight: 700, opacity: 0.6 }}>
        PLATAFORMA CLUBES EXITUS • V2.5 
      </p>

    </div>
  );
}
