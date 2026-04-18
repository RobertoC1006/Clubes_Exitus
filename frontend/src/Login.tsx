import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import type { UsuarioSesion } from './UserContext';
import { GraduationCap, Shield, BookOpen, Users, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import './index.css';

const API = 'http://localhost:3000';

const ROL_CONFIG = {
  ADMINISTRADOR: { label: 'Administrador',  color: 'var(--color-primary)',            bg: 'var(--color-primary-container)',      icon: Shield,   emoji: '👑' },
  PROFESOR:      { label: 'Profesor',        color: 'var(--color-secondary)',           bg: 'var(--color-secondary-container)',    icon: BookOpen, emoji: '🎓' },
  PADRE:         { label: 'Padre / Tutor',   color: 'var(--color-on-surface-variant)', bg: 'var(--color-surface-container-high)', icon: Users,    emoji: '👨‍👩‍👦' },
} as const;

const GRUPOS = ['ADMINISTRADOR', 'PROFESOR', 'PADRE'] as const;

interface UsuarioDB {
  id: number; nombre: string; apellido: string; email: string;
  rol: 'ADMINISTRADOR' | 'PROFESOR' | 'PADRE'; dni?: string;
}

export default function Login() {
  const { login } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<number | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioDB[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  // Cargar usuarios reales de la BD
  useEffect(() => {
    setFetching(true);
    fetch(`${API}/admin/usuarios`)
      .then(r => r.json())
      .then(data => { setUsuarios(Array.isArray(data) ? data : []); setError(''); })
      .catch(() => setError('No se pudo conectar con el servidor'))
      .finally(() => setFetching(false));
  }, []);

  const handleLogin = (u: UsuarioDB) => {
    setLoading(u.id);
    const initials = (u.nombre[0] + (u.apellido?.[0] ?? '')).toUpperCase();
    const sesion: UsuarioSesion = { ...u, initials };
    setTimeout(() => {
      login(sesion);
      if (u.rol === 'ADMINISTRADOR') navigate('/admin');
      else if (u.rol === 'PROFESOR')  navigate('/');
      else                             navigate('/portal');
    }, 380);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <div style={{ background: 'var(--color-primary)', padding: '2.5rem 1.5rem 3.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', width: '3rem', height: '3rem', borderRadius: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={26} color="var(--color-secondary-container)" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', letterSpacing: '-0.04em' }}>EXITUS</span>
        </div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
          Clubes Escolares
        </h1>
        <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', fontWeight: 500 }}>
          Selecciona tu perfil para continuar
        </p>
      </div>

      {/* CARD SOLAPADA */}
      <div style={{ flex: 1, padding: '0 1.25rem 2rem', marginTop: '-1.75rem' }}>
        <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 8px 32px rgba(14,26,57,0.08)' }}>

          {fetching ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-on-surface-variant)' }}>
              <Loader2 size={32} strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>Cargando usuarios...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <p style={{ color: 'var(--color-error)', fontWeight: 700 }}>⚠️ {error}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>
                Verifica que el backend está corriendo en <code>localhost:3000</code>
              </p>
              <button onClick={() => window.location.reload()} style={{
                marginTop: '1rem', background: 'var(--color-primary)', color: 'white',
                border: 'none', borderRadius: '1rem', padding: '0.65rem 1.25rem',
                fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              }}>
                <RefreshCw size={14} /> Reintentar
              </button>
            </div>
          ) : (
            <>
              {GRUPOS.map(grupo => {
                const cfg = ROL_CONFIG[grupo];
                const Icon = cfg.icon;
                const usersDeGrupo = usuarios.filter(u => u.rol === grupo);
                if (usersDeGrupo.length === 0) return null;

                return (
                  <div key={grupo} style={{ marginBottom: '1.5rem' }}>
                    {/* Etiqueta del grupo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                      <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.45rem', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={14} color={cfg.color} strokeWidth={2.5} />
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: cfg.color }}>
                        {cfg.label} ({usersDeGrupo.length})
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
                            transition: 'all 0.15s', opacity: loading !== null && loading !== u.id ? 0.5 : 1,
                          }}
                        >
                          {/* Avatar con iniciales */}
                          <div style={{
                            width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem',
                            background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, fontSize: '1rem', fontWeight: 900, color: cfg.color,
                          }}>
                            {(u.nombre[0] + (u.apellido?.[0] ?? '')).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                              {u.nombre} {u.apellido}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>
                              {u.email ?? (u.dni ? `DNI: ${u.dni}` : 'Sin email')}
                            </p>
                          </div>
                          {loading === u.id
                            ? <Loader2 size={18} color={cfg.color} style={{ animation: 'spin 1s linear infinite' }} />
                            : <ChevronRight size={18} color="var(--color-outline)" />
                          }
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {usuarios.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-on-surface-variant)' }}>
                  <p style={{ fontWeight: 600 }}>No hay usuarios registrados aún.</p>
                  <p style={{ fontSize: '0.8rem' }}>Ejecuta <code>npx prisma db seed</code> para cargar datos iniciales.</p>
                </div>
              )}
            </>
          )}

          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--color-outline)', margin: '0.5rem 0 0', fontWeight: 500 }}>
            🔒 Modo demostración · Usuarios reales desde la BD
          </p>
        </div>
      </div>
    </div>
  );
}
