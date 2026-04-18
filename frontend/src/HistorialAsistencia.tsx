import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Loader2, ChevronRight, Clock } from 'lucide-react';
import './index.css';

export default function HistorialAsistencia() {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const [sesiones, setSesiones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/sesiones/club/${clubId}`)
      .then(res => res.json())
      .then(data => {
        setSesiones(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching sessions:", err);
        setSesiones([]);
        setLoading(false);
      });
  }, [clubId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
        <Loader2 className="animate-spin" size={48} strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="app-container animate-enter" style={{ padding: '1.25rem', paddingBottom: '7rem' }}>
      
      {/* HEADER PREMIUM */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate(-1)} style={{ 
            background: 'var(--color-surface-dim)', border: 'none', 
            width: '3rem', height: '3rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
             <ArrowLeft size={22} color="var(--color-primary)" />
          </button>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>
              Historial
            </h2>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Control de Sesiones
            </p>
          </div>
        </div>

        {/* STATS SUMMARY BENTO */}
        <div className="bento-grid" style={{ marginBottom: '1rem' }}>
            <div className="bento-card" style={{ background: 'var(--color-primary)', color: 'white', padding: '1.25rem' }}>
                <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.7 }}>Sesiones</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '1.75rem', fontWeight: 900 }}>{sesiones.length}</p>
            </div>
            <div className="bento-card" style={{ padding: '1.25rem', border: '1px solid var(--color-surface-container-high)' }}>
                <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-outline)' }}>Asistencia</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-primary)' }}>92%</p>
            </div>
        </div>
      </section>

      {/* LISTA DE SESIONES (GLASS DESIGN) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sesiones.length > 0 ? sesiones.map((sesion, index) => {
          const fechaObj = new Date(sesion.fecha);
          const fechaFormat = fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
          const diaSemana = fechaObj.toLocaleDateString('es-ES', { weekday: 'long' });
          const horaFormat = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={sesion.id} className="bento-card animate-enter" style={{
              background: 'white', padding: '1.25rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              animationDelay: `${index * 0.05}s`
            }}>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div style={{ 
                  width: '3.5rem', height: '3.5rem', borderRadius: '1.25rem', 
                  background: 'var(--color-surface-container-low)', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-primary)', border: '1px solid var(--color-surface-container-high)'
                }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6 }}>{fechaFormat.split(' ')[1]}</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1 }}>{fechaFormat.split(' ')[0]}</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-primary)', letterSpacing: '-0.02em', textTransform: 'capitalize' }}>
                    {diaSemana}
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.15rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Clock size={12} /> {horaFormat}
                    </span>
                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--color-outline-variant)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-secondary)' }}>
                       {sesion.asistencias?.length || 0} Atletas
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                className="flex-center"
                style={{ 
                  width: '2.5rem', height: '2.5rem', borderRadius: '0.85rem', 
                  background: 'var(--color-surface-container-high)', border: 'none'
                }}>
                 <ChevronRight size={20} color="var(--color-primary)" />
              </button>
            </div>
          );
        }) : (
          <div style={{ 
            textAlign: 'center', padding: '5rem 2rem', 
            background: 'var(--color-surface-container-lowest)', 
            borderRadius: '2rem', border: '2px dashed var(--color-surface-container-high)' 
          }}>
            <Calendar size={48} strokeWidth={1.5} style={{ marginBottom: '1.5rem', color: 'var(--color-outline-variant)' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>No hay sesiones registradas</h3>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>
              Las sesiones aparecerán aquí una vez que completes tu primer pase de lista.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
