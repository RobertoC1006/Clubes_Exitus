import { useState } from 'react';
import { User, Fingerprint, Activity, ShieldCheck, LogOut, Phone } from 'lucide-react';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';
import './index.css';

const rolLabel: Record<string, string> = {
  PROFESOR:      '👨‍🏫 Profesor Especialista',
  ADMINISTRADOR: '💎 Administrador General',
  PADRE:         '👨‍👩‍👦 Padre de Familia',
  ALUMNO:        '🎒 Alumno Exitus',
};

// Colors based on the Fenix Design System
const colors = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  surface: 'var(--color-surface-container-lowest)',
  outline: 'var(--color-outline)',
  success: '#10b981',
  error: '#ef4444',
};

export default function Perfil() {
  const { usuario, logout } = useUser();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  if (!usuario) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-container-lowest)' }}>
         <div style={{ textAlign: 'center' }}>
            <Activity size={48} color={colors.primary} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 800, color: colors.outline }}>Sesión no iniciada</p>
         </div>
      </div>
    );
  }

  const confirmLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="animate-enter" style={{ 
       padding: '1.5rem', 
       paddingBottom: '8rem', 
       maxWidth: '500px', 
       margin: '0 auto',
       background: 'transparent'
    }}>

      {/* 🔮 MODAL DE CONFIRMACIÓN PREMIUM */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
          animation: 'fadeIn 0.3s ease'
        }} onClick={() => setShowConfirm(false)}>
          <div 
            style={{
              background: 'white', borderRadius: '2.5rem', width: '100%', maxWidth: '400px',
              padding: '2.5rem', boxShadow: '0 40px 100px rgba(0,0,0,0.3)', position: 'relative',
              overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)',
              animation: 'fadeInScale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              textAlign: 'center'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ 
              width: '4.5rem', height: '4.5rem', background: 'var(--color-error-container)', 
              borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <LogOut size={32} color="var(--color-error)" strokeWidth={2.5} />
            </div>
            
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>
              ¿Cerrar Sesión?
            </h3>
            <p style={{ margin: '0 0 2rem', fontSize: '0.95rem', color: 'var(--color-outline)', fontWeight: 600, lineHeight: 1.6 }}>
              Tu sesión se cerrará de forma segura y volverás a la pantalla de acceso.
            </p>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button 
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1, padding: '1.1rem', borderRadius: '1.25rem',
                  background: 'var(--color-surface-container-low)', color: 'var(--color-primary)',
                  fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                No, Volver
              </button>
              <button 
                onClick={confirmLogout}
                style={{
                  flex: 1, padding: '1.1rem', borderRadius: '1.25rem',
                  background: 'var(--color-error)', color: 'white',
                  fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(239, 68, 68, 0.25)', transition: 'all 0.2s'
                }}
              >
                Sí, Salir
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 👑 CABECERA DE PERFIL SIMPLIFICADA PERO PREMIUM */}
      <section style={{ marginBottom: '2.5rem', position: 'relative' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #1d2b48 100%)',
          borderRadius: '2.5rem',
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          boxShadow: '0 25px 50px -12px rgba(29, 43, 72, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Capas decorativas de fondo */}
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.08 }}>
             <User size={220} color="white" />
          </div>

          {/* Avatar Initials */}
          <div style={{ 
            width: '6.5rem', height: '6.5rem', borderRadius: '2.2rem', 
            background: 'rgba(255, 255, 255, 0.12)', 
            backdropFilter: 'blur(12px)',
            color: 'white', fontWeight: 900, fontSize: '2.4rem', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            boxShadow: '0 12px 24px rgba(0,0,0,0.2)', 
            border: '1px solid rgba(255, 255, 255, 0.25)',
            zIndex: 2,
            position: 'relative'
          }}>
            {usuario.initials || 'RR'}
          </div>

          <div style={{ textAlign: 'center', zIndex: 2 }}>
            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'white', letterSpacing: '-0.04em' }}>
              {usuario.nombre} {usuario.apellido}
            </h2>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {rolLabel[usuario.rol] || usuario.rol}
            </p>
          </div>
        </div>
      </section>

      {/* 📄 SECCIÓN: DATOS DE ACCESO */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0.75rem', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.outline }}>
          Información de Cuenta
        </h3>
        
        <div className="bento-card" style={{ 
          background: 'white', 
          border: '1px solid var(--color-surface-container-high)', 
          borderRadius: '2rem', 
          padding: '0.75rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* DNI */}
          <div style={{ padding: '1.1rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ 
              width: '3.2rem', height: '3.2rem', borderRadius: '1.2rem', 
              background: 'var(--color-primary-container)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
               <Fingerprint size={24} color="var(--color-primary)" strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.65rem', color: colors.outline, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Número de DNI</p>
              <p style={{ margin: 0, fontWeight: 900, color: colors.primary, fontSize: '1.3rem', letterSpacing: '0.02em' }}>{usuario.dni}</p>
            </div>
          </div>
          
          <div style={{ height: '1.5px', background: 'var(--color-surface-container-low)', margin: '0 1rem' }} />
          
          {/* CELULAR */}
          <div style={{ padding: '1.1rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ 
              width: '3.2rem', height: '3.2rem', borderRadius: '1.2rem', 
              background: 'var(--color-primary-container)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
               <Phone size={24} color="var(--color-primary)" strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.65rem', color: colors.outline, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Número Celular</p>
              <p style={{ margin: 0, fontWeight: 900, color: colors.primary, fontSize: '1.3rem', letterSpacing: '0.02em' }}>{usuario.celular || 'No registrado'}</p>
            </div>
          </div>
          
          <div style={{ height: '1.5px', background: 'var(--color-surface-container-low)', margin: '0 1rem' }} />
          
          {/* ESTADO ACTIVO */}
          <div style={{ padding: '1.1rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ 
              width: '3.2rem', height: '3.2rem', borderRadius: '1.2rem', 
              background: 'rgba(16, 185, 129, 0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
               <ShieldCheck size={24} color={colors.success} strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.65rem', color: colors.outline, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estatus de Usuario</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <p style={{ margin: 0, fontWeight: 900, color: colors.success, fontSize: '1.2rem' }}>Activo</p>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.success }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚪 BOTÓN CERRAR SESIÓN (SOLO MÓVIL) */}
      <section className="mobile-logout-section" style={{ marginTop: '3rem' }}>
        <button
          onClick={() => setShowConfirm(true)}
          style={{
            width: '100%',
            padding: '1.25rem',
            borderRadius: '1.5rem',
            background: 'var(--color-error-container)',
            color: 'var(--color-error)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            fontWeight: 900,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(239, 68, 68, 0.1)'
          }}
        >
          <LogOut size={20} strokeWidth={3} />
          Cerrar Sesión
        </button>
      </section>

      {/* Footer minimalista */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p style={{ margin: 0, fontSize: '0.65rem', color: colors.outline, fontWeight: 800, opacity: 0.5, letterSpacing: '0.1em' }}>
          PLATAFORMA CLUBES EXITUS • V3.0
        </p>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .mobile-logout-section { display: none !important; }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

    </div>
  );
}
