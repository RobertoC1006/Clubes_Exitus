import { User, Fingerprint, Activity, ShieldCheck } from 'lucide-react';
import { useUser } from './UserContext';
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
  const { usuario } = useUser();

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

  return (
    <div className="animate-enter" style={{ 
       padding: '1.5rem', 
       paddingBottom: '8rem', 
       maxWidth: '500px', 
       margin: '0 auto',
       background: 'transparent'
    }}>
      
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

      {/* Footer minimalista */}
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <p style={{ margin: 0, fontSize: '0.65rem', color: colors.outline, fontWeight: 800, opacity: 0.5, letterSpacing: '0.1em' }}>
          PLATAFORMA CLUBES EXITUS • V3.0
        </p>
      </div>

    </div>
  );
}
