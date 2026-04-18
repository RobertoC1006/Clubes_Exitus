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
      
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', marginTop: '0.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ 
          background: 'white', border: '1px solid var(--color-surface-container-high)', 
          padding: '0.5rem', borderRadius: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
           <ArrowLeft size={18} color="var(--color-primary)" />
        </button>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>
            Historial
          </h2>
          <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sesiones Anteriores
          </p>
        </div>
      </div>

      {/* LISTA DE SESIONES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sesiones.length > 0 ? sesiones.map((sesion) => {
          const fechaObj = new Date(sesion.fecha);
          const fechaFormat = fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
          const horaFormat = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={sesion.id} style={{
              background: 'white', borderRadius: '1.5rem', padding: '1.25rem',
              border: '1px solid var(--color-surface-container-high)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ 
                  width: '3rem', height: '3rem', borderRadius: '1rem', 
                  background: 'var(--color-surface-container-low)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-primary)'
                }}>
                  <Calendar size={22} />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                    {fechaFormat}
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.15rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Clock size={12} /> {horaFormat}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Users size={12} /> Sesión #{sesion.id}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                width: '2.5rem', height: '2.5rem', borderRadius: '0.85rem', 
                background: 'var(--color-surface-container-low)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                 <ChevronRight size={20} color="var(--color-primary)" />
              </div>
            </div>
          );
        }) : (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-outline)' }}>
            <Calendar size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>No hay registros de sesiones</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>Abre una nueva lista para empezar a generar historial.</p>
          </div>
        )}
      </div>

    </div>
  );
}
