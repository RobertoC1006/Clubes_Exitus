import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Loader2, ChevronRight, Clock, Trophy } from 'lucide-react';
import { useUser } from './UserContext';
import './index.css';
import { API_BASE_URL } from './config';

const API = API_BASE_URL;

export default function HistorialAsistencia() {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const { usuario } = useUser();
  const [sesiones, setSesiones] = useState<any[]>([]);
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Paginación
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/sesiones?clubId=${clubId}`).then(res => res.json()),
      fetch(`${API}/clubes/${clubId}`).then(res => res.json())
    ])
      .then(([sesionesData, clubData]) => {
        setSesiones(Array.isArray(sesionesData) ? sesionesData : []);
        setClub(clubData);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
      })
      .finally(() => setLoading(false));
  }, [clubId]);

  const asistenciaPromedio = useMemo(() => {
    if (!Array.isArray(sesiones) || sesiones.length === 0) return '0%';
    
    let globalPresentes = 0;
    let globalTotalMarked = 0;

    sesiones.forEach(s => {
      if (Array.isArray(s.asistencias)) {
        s.asistencias.forEach((as: any) => {
          const est = String(as.estado || '').toUpperCase();
          if (est === 'PRESENTE' || est === 'JUSTIFICADO') {
            globalPresentes++;
          }
          if (est !== '') {
            globalTotalMarked++;
          }
        });
      }
    });

    if (globalTotalMarked === 0) return '0%';
    return Math.round((globalPresentes / globalTotalMarked) * 100) + '%';
  }, [sesiones]);

  const handleBack = () => {
    if (usuario?.rol === 'ADMINISTRADOR') {
      navigate('/admin?tab=clubes');
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
        <Loader2 className="animate-spin" size={48} strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="animate-enter" style={{ padding: '1.25rem', paddingBottom: '7rem' }}>
      
      {/* HEADER PREMIUM */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button onClick={handleBack} style={{ 
            background: 'var(--color-surface-dim)', border: 'none', 
            width: '3rem', height: '3rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
             <ArrowLeft size={22} color="var(--color-primary)" />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em', margin: 0, lineHeight: 1.1 }}>
              {club?.nombre || 'Historial'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
               <Trophy size={14} color="var(--color-secondary)" />
               <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Control de Sesiones
              </p>
            </div>
          </div>
        </div>

        {/* STATS SUMMARY BENTO */}
        <div className="bento-grid" style={{ marginBottom: '1rem' }}>
            <div className="bento-card" style={{ background: 'var(--color-primary)', color: 'white', padding: '1.25rem' }}>
                <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.7 }}>Sesiones</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '1.75rem', fontWeight: 900 }}>{sesiones.length}</p>
            </div>
            <div className="bento-card" style={{ padding: '1.25rem', border: '1px solid var(--color-surface-container-high)' }}>
                <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-outline)' }}>Asistencia Promedio</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-primary)' }}>{asistenciaPromedio}</p>
            </div>
        </div>
      </section>

      {/* LISTA DE SESIONES (GLASS DESIGN) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sesiones.length > 0 ? sesiones
          .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
          .map((sesion, index) => {
          const fechaObj = new Date(sesion.fecha);
          const fechaFormat = fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
          const diaSemana = fechaObj.toLocaleDateString('es-ES', { weekday: 'long' });
          const horaFormat = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={sesion.id} 
              onClick={() => navigate(`/clubes/${clubId}/sesion/${sesion.id}`)}
              className="bento-card animate-enter" 
              style={{
                background: 'white', padding: '1.25rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                animationDelay: `${index * 0.05}s`,
                cursor: 'pointer'
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

      <Pagination 
        current={currentPage} 
        total={Math.ceil(sesiones.length / ITEMS_PER_PAGE)} 
        onChange={setCurrentPage} 
      />

    </div>
  );
}

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.25rem', padding: '1rem 0' }}>
      <button 
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        style={{ 
          background: current === 1 ? 'var(--color-surface-container-lowest)' : 'var(--color-surface-container-high)', 
          color: 'var(--color-primary)', border: 'none', borderRadius: '0.6rem',
          padding: '0.45rem', opacity: current === 1 ? 0.3 : 1, width: '2.2rem', height: '2.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
        <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
      </button>
      <div style={{ 
        background: 'var(--color-surface-container-low)', 
        padding: '0.4rem 1rem', 
        borderRadius: '99px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-primary)' }}>{current}</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-outline)', opacity: 0.5 }}>/</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-outline)' }}>{total}</span>
      </div>
      <button 
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        style={{ 
          background: current === total ? 'var(--color-surface-container-lowest)' : 'var(--color-surface-container-high)', 
          color: 'var(--color-primary)', border: 'none', borderRadius: '0.6rem',
          padding: '0.45rem', opacity: current === total ? 0.3 : 1, width: '2.2rem', height: '2.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
