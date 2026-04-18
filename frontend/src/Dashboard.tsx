import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, MapPin, Activity, Calendar as CalendarIcon, Users, Loader2 } from 'lucide-react';
import { useUser } from './UserContext';
import './index.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { usuario } = useUser();
  const [clubes, setClubes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    
    // 🔹 Profesor ve SOLO sus clubes. Admin ve todos.
    const url = usuario.rol === 'ADMINISTRADOR'
      ? 'http://localhost:3000/clubes'
      : `http://localhost:3000/clubes/mis-clubes/${usuario.id}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setClubes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching clubs:", err);
        setClubes([]);
        setLoading(false);
      });
  }, [usuario]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
        <Loader2 className="animate-spin" size={48} strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="app-container animate-enter" style={{ padding: '1.25rem', paddingBottom: '7rem' }}>
      
      {/* 🔹 SECTION: HERO (MCP Lyceum Hub Design) */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ color: 'var(--color-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.65rem', marginBottom: '0.5rem', display: 'block' }}>
              Instructor Hub
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: 0 }}>
              Hola, <br/><span style={{ background: 'var(--grad-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{(usuario as any).nombre?.split(' ')[0] || 'Profesor'}</span>
            </h2>
          </div>
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.2rem', border: '2px solid white', boxShadow: 'var(--shadow-lg)' }}>
             {(usuario as any).initials || 'P'}
          </div>
        </div>
      </section>

      {/* 🔹 SECTION: BENTO DASHBOARD SUMMARY */}
      <div className="bento-grid" style={{ marginBottom: '2rem' }}>
         <div className="bento-card" style={{ gridColumn: 'span 2', background: 'var(--grad-primary)', color: 'white', padding: '1.5rem' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
               <Activity size={24} color="var(--color-secondary)" />
               <span style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>Sesión Actual</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
              {clubes.length > 0 ? clubes[0].nombre : 'Sin sesiones activas'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
               <div style={{ width: '8px', height: '8px', background: 'var(--color-secondary)', borderRadius: '50%', boxShadow: '0 0 10px var(--color-secondary)', animation: 'pulse 1.5s infinite' }}></div>
               <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{clubes.length > 0 ? 'Esperando pase de lista' : 'Relájate por ahora'}</span>
            </div>
            <button 
              onClick={() => clubes.length > 0 && navigate(`/clubes/${clubes[0].id}/asistencia`)}
              disabled={clubes.length === 0}
              style={{ 
                marginTop: '1.5rem', width: '100%', padding: '0.75rem', borderRadius: '0.85rem', 
                background: 'white', color: 'var(--color-primary)', fontWeight: 900, fontSize: '0.85rem',
                opacity: clubes.length === 0 ? 0.5 : 1
              }}
            >
              Comenzar Ahora
            </button>
         </div>

         <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <Users size={20} color="var(--color-primary)" />
            <div>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, lineHeight: 1 }}>{clubes.reduce((acc, c) => acc + (c._count?.inscripciones || 0), 0)}</p>
              <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-outline)', textTransform: 'uppercase' }}>Total Atletas</p>
            </div>
         </div>

         <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <Activity size={20} color="var(--color-secondary)" />
            <div>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, lineHeight: 1 }}>{clubes.length}</p>
              <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-outline)', textTransform: 'uppercase' }}>Mis Clubes</p>
            </div>
         </div>
      </div>

      {/* 🔹 SECTION: LISTADO DE CLUBES (NUEVO DISEÑO) */}
      <section style={{ marginBottom: '2.5rem' }}>
         <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mis Horarios</h3>
         </div>
         <div className="flex-column" style={{ gap: '1rem' }}>
            {clubes.map((club, index) => {
              const icons = [Activity, Users, CalendarIcon, CheckCircle2];
              const IconLogo = icons[index % icons.length];
              const profNombre = club.profesor ? `${club.profesor.nombre} ${club.profesor.apellido}` : 'Sin asignar';

              return (
                <div key={club.id} className="bento-card" style={{ 
                  display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem',
                  border: '1px solid var(--color-surface-container-high)',
                  background: 'white'
                }}>
                  <div style={{ 
                    width: '3.5rem', height: '3.5rem', borderRadius: '1rem', 
                    background: index === 0 ? 'var(--color-secondary-container)' : 'var(--color-surface-container-low)',
                    color: index === 0 ? 'var(--color-on-secondary)' : 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <IconLogo size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>{club.nombre}</h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-on-surface-variant)' }}>
                      {club._count?.inscripciones || 0} Atletas · {profNombre.split(' ')[0]}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => navigate(`/clubes/${club.id}/asistencia`)}
                      style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'var(--color-surface-container-highest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <button 
                      onClick={() => navigate(`/clubes/${club.id}/historial`)}
                      style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'var(--color-surface-container-highest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}
                    >
                      <CalendarIcon size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
         </div>
      </section>

      {/* 🔹 SECTION: WEEKLY COMMAND CENTER */}
      <div style={{ 
         background: 'var(--color-primary)', 
         borderRadius: '2rem', padding: '2rem', color: 'white',
         position: 'relative', overflow: 'hidden',
         boxShadow: '0 20px 50px rgba(29, 40, 72, 0.4)'
      }}>
         <div style={{ position: 'relative', zIndex: 10 }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
               <h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'white' }}>Command Center</h4>
               <span style={{ fontSize: '0.6rem', fontWeight: 900, background: 'rgba(255,255,255,0.2)', padding: '0.4rem 0.8rem', borderRadius: '99px', textTransform: 'uppercase' }}>Semana 12</span>
            </div>

            <div className="bento-grid">
               <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.4rem' }}>Asistencia Prom.</p>
                  <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-secondary)' }}>94.2%</p>
               </div>
               <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.4rem' }}>Sesiones</p>
                  <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>12 <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>/ 15</span></p>
               </div>
            </div>

            <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
               Tu rendimiento se mantiene en el rango <strong style={{ color: 'white' }}>Sobresaliente</strong> esta semana. ¡Sigue así!
            </p>
         </div>

         {/* Background Decoration */}
         <div style={{ position: 'absolute', bottom: '-2rem', right: '-2rem', width: '10rem', height: '10rem', background: 'var(--color-secondary)', opacity: 0.1, borderRadius: '50%', filter: 'blur(40px)' }}></div>
      </div>

      <style>{`
        @keyframes pulse {
           0% { transform: scale(1); opacity: 1; }
           50% { transform: scale(1.5); opacity: 0.5; }
           100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
