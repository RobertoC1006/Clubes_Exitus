import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import type { UsuarioSesion } from './UserContext';
import { GraduationCap, Shield, BookOpen, Users, ChevronRight, Loader2 } from 'lucide-react';
import './index.css';

// Usuarios del seed — en producción esto sería un form real de email/password
const USUARIOS_SEED = [
  { id: 2,  nombre: 'Carlos',   apellido: 'Mendoza Ríos',    email: 'director@exitus.edu',   rol: 'ADMINISTRADOR' as const, emoji: '👑' },
  { id: 3,  nombre: 'Juan',     apellido: 'Perez García',    email: 'jperez@exitus.edu',      rol: 'PROFESOR'      as const, emoji: '⚽' },
  { id: 4,  nombre: 'Mariana',  apellido: 'López Torres',    email: 'mlopez@exitus.edu',      rol: 'PROFESOR'      as const, emoji: '💃' },
  { id: 5,  nombre: 'Ricardo',  apellido: 'Suárez Vega',     email: 'rsuarez@exitus.edu',     rol: 'PROFESOR'      as const, emoji: '🤖' },
  { id: 6,  nombre: 'Alberto',  apellido: 'Benitez Ríos',    email: 'abenitez@gmail.com',     rol: 'PADRE'         as const, emoji: '👨‍👩‍👦' },
  { id: 7,  nombre: 'Silvia',   apellido: 'Morales Cruz',    email: 'smorales@gmail.com',     rol: 'PADRE'         as const, emoji: '👩‍👧' },
  { id: 8,  nombre: 'Miguel',   apellido: 'Fernandez Ruiz',  email: 'mfernandez@gmail.com',   rol: 'PADRE'         as const, emoji: '👨‍👦' },
];

const ROL_CONFIG = {
  ADMINISTRADOR: { label: 'Administrador',    color: 'var(--color-primary)',             bg: 'var(--color-primary-container)', icon: Shield },
  PROFESOR:      { label: 'Profesor',          color: 'var(--color-secondary)',            bg: 'var(--color-secondary-container)', icon: BookOpen },
  PADRE:         { label: 'Padre / Tutor',     color: 'var(--color-on-surface-variant)',  bg: 'var(--color-surface-container-high)', icon: Users },
};

const GRUPOS = ['ADMINISTRADOR', 'PROFESOR', 'PADRE'] as const;

export default function Login() {
  const { login } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<number | null>(null);

  const handleLogin = (u: typeof USUARIOS_SEED[0]) => {
    setLoading(u.id);
    const initials = (u.nombre[0] + u.apellido[0]).toUpperCase();
    const sesion: UsuarioSesion = { ...u, initials };

    // Simulamos latencia de red (420ms para darle realismo)
    setTimeout(() => {
      login(sesion);
      // Redirige según el rol
      if (u.rol === 'ADMINISTRADOR') navigate('/admin');
      else if (u.rol === 'PROFESOR')  navigate('/');
      else                            navigate('/portal');
    }, 420);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <div style={{ background: 'var(--color-primary)', padding: '2.5rem 1.5rem 3rem 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', width: '3rem', height: '3rem', borderRadius: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={26} color="var(--color-secondary-container)" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', letterSpacing: '-0.04em' }}>EXITUS</span>
        </div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
          Clubes Escolares
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', fontWeight: 500 }}>
          Selecciona tu perfil para continuar
        </p>
      </div>

      {/* CARD SOLAPADA */}
      <div style={{ flex: 1, padding: '0 1.25rem 2rem 1.25rem', marginTop: '-1.5rem' }}>
        <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 8px 32px rgba(14,26,57,0.08)' }}>

          {GRUPOS.map(grupo => {
            const cfg = ROL_CONFIG[grupo];
            const Icon = cfg.icon;
            const usersDeGrupo = USUARIOS_SEED.filter(u => u.rol === grupo);
            return (
              <div key={grupo} style={{ marginBottom: '1.5rem' }}>
                {/* Etiqueta del grupo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.45rem', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={14} color={cfg.color} strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: cfg.color }}>
                    {cfg.label}
                  </span>
                </div>

                {/* Lista de usuarios */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {usersDeGrupo.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleLogin(u)}
                      disabled={loading !== null}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.85rem',
                        background: 'var(--color-surface-container-low)', border: 'none', borderRadius: '1rem',
                        padding: '0.85rem 1rem', cursor: 'pointer', width: '100%', textAlign: 'left',
                        transition: 'all 0.15s', opacity: loading !== null && loading !== u.id ? 0.5 : 1
                      }}
                    >
                      {/* Avatar */}
                      <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.3rem' }}>
                        {u.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                          {u.nombre} {u.apellido}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>
                          {u.email}
                        </p>
                      </div>
                      {loading === u.id
                        ? <Loader2 size={18} color={cfg.color} className="animate-spin" />
                        : <ChevronRight size={18} color="var(--color-outline)" />
                      }
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--color-outline)', margin: '0.5rem 0 0 0', fontWeight: 500 }}>
            🔒 Modo demostración · Autenticación JWT próximamente
          </p>
        </div>
      </div>

    </div>
  );
}
