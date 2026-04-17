import { useNavigate } from 'react-router-dom';
import { CheckCircle2, MapPin, Activity, Calendar as CalendarIcon, Users } from 'lucide-react';
import './index.css';

// ==========================================
// MOCK DATA (Inspirado en la semilla backend)
// ==========================================
export const MOCK_CLUBS = [
  { id: 1, nombre: 'Fútbol Selección', ubicacion: 'Campo Principal', estado: 'En Curso', count: 24, fecha: 'Hoy, 16:30', icon: Activity },
  { id: 2, nombre: 'Taller de Ajedrez', ubicacion: 'Biblioteca Central', estado: 'Programado', count: 12, fecha: 'Jueves, 15:00', icon: Users }
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="app-container animate-enter" style={{ padding: '1.25rem' }}>
      
      {/* 🔹 SECTION: HERO (MCP Lyceum Hub Design) */}
      <section style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <span style={{ color: 'var(--color-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>
            Panel de Instructor
          </span>
          <h2 style={{ fontSize: '2.75rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.05em', lineHeight: 1, margin: 0 }}>
            Mis Clubes
          </h2>
          <p style={{ marginTop: '0.85rem', color: 'var(--color-on-surface-variant)', fontWeight: 500, fontSize: '0.95rem', lineHeight: 1.4 }}>
            Gestiona tus actividades extracurriculares y mantén el control de la asistencia de tus atletas de manera eficiente.
          </p>
        </div>
        
        {/* Main Header CTA */}
        <button 
          className="btn btn-primary" 
          style={{ padding: '1.25rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', fontWeight: 800, borderRadius: '1rem', boxShadow: '0 8px 32px rgba(29, 40, 72, 0.3)', marginTop: '0.5rem' }} 
          onClick={() => navigate(`/clubes/${MOCK_CLUBS[0].id}/asistencia`)}
        >
          <CheckCircle2 size={22} strokeWidth={2.5} /> Tomar Asistencia Rápida
        </button>
      </section>

      {/* 🔹 SECTION: BENTO GRID DE CLUBES */}
      <div className="flex-column" style={{ gap: '1.5rem' }}>
        {MOCK_CLUBS.map((club) => {
          const isEnCurso = club.estado === 'En Curso';
          const IconLogo = club.icon;

          return (
            <div key={club.id} style={{ 
              background: 'var(--color-surface-container-lowest)', 
              borderRadius: '2rem', 
              padding: '1.75rem', 
              position: 'relative', 
              overflow: 'hidden', 
              display: 'flex', flexDirection: 'column', minHeight: '320px',
              border: '1px solid var(--color-surface-container-high)',
              boxShadow: '0 8px 32px rgba(14,26,57,0.02)'
            }}>
              
              {/* Background Decorative Shape Overlay */}
              <div style={{
                position: 'absolute', top: 0, right: 0, width: '10rem', height: '10rem',
                background: isEnCurso ? 'var(--color-primary-fixed)' : 'var(--color-surface-container)',
                opacity: isEnCurso ? 0.3 : 1, 
                borderBottomLeftRadius: '100%', marginRight: '-2rem', marginTop: '-2rem', transition: 'transform 0.3s'
              }}></div>

              <div style={{ position: 'relative', flex: 1, zIndex: 10 }}>
                
                {/* Cabecera de Tarjeta: Logo y Badge */}
                <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div style={{ 
                    width: '3.5rem', height: '3.5rem', borderRadius: '1rem', 
                    background: isEnCurso ? 'var(--color-secondary-container)' : 'var(--color-primary-container)',
                    color: isEnCurso ? 'var(--color-secondary)' : 'var(--color-primary-fixed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <IconLogo size={28} />
                  </div>
                  <span style={{ 
                    background: isEnCurso ? 'var(--color-primary-fixed)' : 'var(--color-surface-container-high)',
                    color: isEnCurso ? 'var(--color-on-primary-fixed)' : 'var(--color-on-surface-variant)',
                    padding: '0.35rem 0.85rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em'
                  }}>
                    {club.estado}
                  </span>
                </div>

                {/* Título y Ubicación */}
                <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.03em', margin: '0 0 0.5rem 0' }}>{club.nombre}</h3>
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', color: 'var(--color-on-surface-variant)' }}>
                  <MapPin size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{club.ubicacion}</span>
                </div>
              </div>

              {/* Botones y Data Card Inferior */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 10 }}>
                 
                 {/* Mini Dashboard del Curso */}
                 <div className="flex-between" style={{ background: 'var(--color-surface-container-low)', padding: '1rem', borderRadius: '1rem' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inscritos</p>
                      <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1, marginTop: '0.2rem' }}>{club.count}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Prox. Sesión</p>
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-primary)', display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '0.25rem', marginTop: '0.5rem' }}>
                         {club.fecha}
                      </p>
                    </div>
                 </div>

                 <button onClick={() => navigate(`/clubes/${club.id}/asistencia`)} style={{ 
                    width: '100%', padding: '0.85rem', borderRadius: '0.75rem',
                    background: 'transparent', border: '1px solid var(--color-surface-container-highest)',
                    color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center'
                 }}>
                   Abrir Lista de Asistencia
                 </button>
              </div>

            </div>
          )
        })}
      </div>

      {/* 🔹 SECTION: RENDIMIENTO SEMANAL (Widget UI) */}
      <div style={{ 
         marginTop: '2rem', background: 'var(--color-primary-container)', 
         borderRadius: '2rem', padding: '2.5rem 2rem', color: 'var(--color-primary-fixed)',
         boxShadow: '0 16px 40px rgba(29, 40, 72, 0.5)'
      }}>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            <h4 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em' }}>Rendimiento<br/>Semanal</h4>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-on-primary-container)', fontWeight: 500, lineHeight: 1.4, marginTop: '0.5rem' }}>
               Has completado el 85% de tus sesiones programadas para esta semana lectiva.
            </p>
         </div>

         <div style={{ display: 'flex', gap: '3rem' }}>
            <div>
               <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-primary-container)', marginBottom: '0.5rem' }}>Total Horas</p>
               <p style={{ margin: 0, fontSize: '2.25rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>12.5</p>
            </div>
            <div>
               <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-primary-container)', marginBottom: '0.5rem' }}>Asistencia Prom.</p>
               <p style={{ margin: 0, fontSize: '2.25rem', fontWeight: 900, color: 'var(--color-secondary-container)', lineHeight: 1 }}>94%</p>
            </div>
         </div>
      </div>

    </div>
  );
}
