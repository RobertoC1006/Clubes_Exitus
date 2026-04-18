import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import type { UsuarioSesion } from './UserContext';
import { GraduationCap, Shield, BookOpen, Users, Loader2, RefreshCw } from 'lucide-react';
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
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--color-surface)', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* BACKGROUND DECORATION */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, var(--color-secondary-container) 0%, transparent 70%)',
        opacity: 0.1, zIndex: 0, filter: 'blur(60px)'
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', left: '-15%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, var(--color-primary-container) 0%, transparent 70%)',
        opacity: 0.08, zIndex: 0, filter: 'blur(80px)'
      }} />

      {/* HEADER HERO */}
      <div className="animate-enter" style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem',
          background: 'rgba(255,255,255,0.4)', padding: '0.6rem 1.25rem', borderRadius: '100px',
          backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
        }}>
          <div style={{ 
            background: 'var(--color-primary)', width: '2.5rem', height: '2.5rem', 
            borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(29,40,72,0.2)'
          }}>
            <GraduationCap size={22} color="var(--color-secondary-container)" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>EXITUS</span>
        </div>
        
        <h1 style={{ 
          margin: 0, fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-primary)', 
          letterSpacing: '-0.05em', lineHeight: 1 
        }}>
          Bienvenido <br/>
          <span style={{ color: 'var(--color-secondary)' }}>al Campus Digital</span>
        </h1>
        <p style={{ 
          margin: '0.75rem auto 0', color: 'var(--color-on-surface-variant)', 
          fontSize: '0.92rem', fontWeight: 500, maxWidth: '280px', lineHeight: 1.4
        }}>
          Selecciona tu cuenta institucional para comenzar tu jornada.
        </p>
      </div>

      {/* ACCESS CARD */}
      <div className="animate-enter glass-card" style={{ 
        position: 'relative', zIndex: 1, 
        padding: '1.75rem', width: '100%', maxWidth: '440px', margin: '0 auto',
        animationDelay: '0.1s', background: 'rgba(255,255,255,0.7)'
      }}>
        
        {fetching ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <RefreshCw size={36} color="var(--color-primary)" className="spin" style={{ animation: 'spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite', opacity: 0.6 }} />
            <p style={{ marginTop: '1.25rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sincronizando...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ background: 'var(--color-error-container)', width: '3.5rem', height: '3.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Shield size={24} color="var(--color-error)" />
            </div>
            <p style={{ color: 'var(--color-error)', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Fallo de conexión</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontWeight: 500, lineHeight: 1.5, marginBottom: '1.5rem' }}>
              No pudimos establecer contacto con el servidor regional. Por favor, verifica tu conexión.
            </p>
            <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
              <RefreshCw size={16} /> Reintentar Acceso
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {GRUPOS.map(grupo => {
              const cfg = ROL_CONFIG[grupo];
              const Icon = cfg.icon;
              const usersDeGrupo = usuarios.filter(u => u.rol === grupo);
              if (usersDeGrupo.length === 0) return null;

              return (
                <div key={grupo}>
                  <p style={{ 
                    margin: '0 0 0.85rem', fontSize: '0.72rem', fontWeight: 900, 
                    textTransform: 'uppercase', letterSpacing: '0.12em', color: cfg.color,
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <div style={{ width: 12, height: 2, background: cfg.color, borderRadius: 2 }}></div>
                    {cfg.label}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {usersDeGrupo.map(u => (
                      <button
                        key={u.id}
                        onClick={() => handleLogin(u)}
                        disabled={loading !== null}
                        className="login-item"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '1rem',
                          background: 'white', border: '1.5px solid var(--color-surface-container-high)', 
                          borderRadius: '1.25rem', padding: '0.85rem 1rem', cursor: 'pointer', 
                          width: '100%', textAlign: 'left', position: 'relative',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          opacity: loading !== null && loading !== u.id ? 0.4 : 1,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{
                          width: '2.8rem', height: '2.8rem', borderRadius: '1rem',
                          background: 'var(--color-surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--color-primary)',
                          border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                        }}>
                          {(u.nombre[0] + (u.apellido?.[0] ?? '')).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 900, fontSize: '0.98rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                            {u.nombre} {u.apellido}
                          </p>
                          <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
                            {u.email ?? (u.dni ? `ID: ${u.dni}` : 'Acceso Estándar')}
                          </p>
                        </div>
                        {loading === u.id
                          ? <Loader2 size={20} color="var(--color-primary)" className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                          : null
                        }
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {usuarios.length === 0 && (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-on-surface-variant)' }}>
                <Users size={40} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Base de datos vacía</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>No hay perfiles configurados en este momento.</p>
              </div>
            )}
          </div>
        )}

        <div style={{ 
          marginTop: '2rem', borderTop: '1px solid var(--color-surface-container-high)', 
          paddingTop: '1rem', textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-outline)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Powered by EXITUS Tech
          </p>
        </div>
      </div>

      <style>{`
        .login-item:active { transform: scale(0.97); }
        @media (hover: hover) {
          .login-item:hover { 
            border-color: var(--color-primary);
            box-shadow: 0 8px 16px rgba(0,0,0,0.06);
            transform: translateY(-2px);
          }
        }
      `}</style>
    </div>
  );
}
