import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle2, Activity, Calendar as CalendarIcon, Users, 
  Loader2, Clock, Zap, Target, TrendingUp, AlertCircle, ChevronRight,
  BookOpen
} from 'lucide-react';
import { useUser } from './UserContext';
import './index.css';

// ── Helpers ────────────────────────────────────────────────────
function formatHorarioShort(horario: any): string {
  if (!horario) return '';
  const dias = Object.keys(horario);
  if (dias.length === 0) return '';
  
  if (dias.length === 1) {
    const d = dias[0];
    return `${d.slice(0, 3)} ${horario[d].start}-${horario[d].end}`;
  }

  const times = dias.map(d => `${horario[d].start}-${horario[d].end}`);
  const allSame = times.every(t => t === times[0]);
  
  if (allSame) {
    const diasStr = dias.map(d => d.slice(0, 3)).join(', ');
    return `${diasStr} ${times[0]}`;
  }

  return `${dias[0].slice(0, 3)} ${horario[dias[0]].start}+`;
}

function getActiveClub(clubes: any[]) {
  const now = new Date();
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const currentDay = days[now.getDay()];
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

  return clubes.find(club => {
    if (!club.horario || !club.horario[currentDay]) return false;
    const { start, end } = club.horario[currentDay];
    return currentTime >= start && currentTime <= end;
  });
}

// ── Dashboard Component ─────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = (searchParams.get('tab') || 'inicio') as 'inicio' | 'clubes';
  const { usuario } = useUser();
  const [clubes, setClubes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Paginación
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Datos dinámicos del dashboard
  const [metricas, setMetricas] = useState<any>(null);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

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

    // 🔹 Cargar métricas del dashboard
    setLoadingDashboard(true);
    fetch(`http://localhost:3000/clubes/profesor-dashboard/${usuario.id}`)
      .then(res => res.json())
      .then(data => {
        setMetricas(data.metricas);
        setAlertas(data.alertas);
        setLoadingDashboard(false);
      })
      .catch(err => {
        console.error("Error fetching dashboard metrics:", err);
        setLoadingDashboard(false);
      });
  }, [usuario]);

  const activeClub = useMemo(() => getActiveClub(clubes), [clubes]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
        <Loader2 className="animate-spin" size={48} strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="app-container animate-enter" style={{ padding: '1.25rem', paddingBottom: '7rem' }}>
      
      {/* 🔹 HEADER SECCTION */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ color: 'var(--color-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.65rem', marginBottom: '0.5rem', display: 'block' }}>
              Instructor Command Center
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: 0 }}>
              Hola, <br/><span style={{ background: 'var(--grad-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{(usuario as any).nombre?.split(' ')[0] || 'Profesor'}</span>
            </h2>
          </div>
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 900, fontSize: '1.2rem', border: '2px solid var(--color-primary-fixed)', boxShadow: 'var(--shadow-lg)' }}>
             {(usuario as any).initials || 'P'}
          </div>
        </div>
      </section>

      {/* 🔹 TAB CONTENT: INICIO */}
      {tab === 'inicio' && (
        <>
          {/* LIVE STATUS CARD */}
          <div style={{ marginBottom: '2rem' }}>
            {activeClub ? (
              <div className="bento-card" style={{ background: 'var(--grad-primary)', color: 'white', padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
                 <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                       <div style={{ width: '10px', height: '10px', background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 15px #4ade80', animation: 'pulse 1.5s infinite' }}></div>
                       <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Clase en Vivo</span>
                    </div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{activeClub.nombre}</h3>
                    <p style={{ margin: '0.25rem 0 1.5rem', opacity: 0.8, fontSize: '0.85rem', fontWeight: 600 }}>
                      {activeClub._count?.inscripciones || 0} Atletas en sala · {formatHorarioShort(activeClub.horario)}
                    </p>
                    <button 
                      onClick={() => navigate(`/clubes/${activeClub.id}/asistencia`)}
                      style={{ 
                        width: '100%', padding: '0.9rem', borderRadius: '1rem', 
                        background: 'white', color: 'var(--color-primary)', fontWeight: 900, fontSize: '0.9rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                      }}
                    >
                      <CheckCircle2 size={18} /> Tomar Lista Ahora
                    </button>
                 </div>
                 <Zap size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', color: 'white', opacity: 0.05, transform: 'rotate(15deg)' }} />
              </div>
            ) : (
              <div className="bento-card" style={{ background: 'var(--color-surface-container-low)', padding: '1.5rem', textAlign: 'center', border: '2px dashed var(--color-surface-container-high)' }}>
                 <Clock size={32} color="var(--color-outline)" style={{ marginBottom: '0.75rem' }} />
                 <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>Sin clases activas</h3>
                 <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 500 }}>Tu próxima clase comienza pronto. ¡Aprovecha para hidratarte!</p>
              </div>
            )}
          </div>

          {/* METRICS GRID */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Desempeño Mensual</h3>
             <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-outline)' }}>Abril 2025</span>
          </div>
          <div className="bento-grid" style={{ marginBottom: '2.5rem' }}>
             <div className="bento-card" style={{ padding: '1.25rem', border: '1px solid var(--color-surface-container-high)', background: 'white' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'var(--color-secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Target size={18} color="var(--color-on-secondary-container)" />
                </div>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>
                  {loadingDashboard ? '...' : `${metricas?.asistenciaPct ?? 0}%`}
                </p>
                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-outline)', textTransform: 'uppercase' }}>Asistencia</p>
             </div>
             <div className="bento-card" style={{ gridColumn: 'span 2', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--color-surface-container-high)', position: 'relative', overflow: 'hidden', background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 2 }}>
                   <div style={{ background: 'var(--grad-gold)', width: '3.2rem', height: '3.2rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)' }}>
                      <Zap size={24} color="white" />
                   </div>
                   <div>
                      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                        Racha: {loadingDashboard ? '...' : `${metricas?.racha ?? 0} Sesiones`}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-outline)', fontWeight: 600 }}>Con asistencia superior al 70%. ¡Sigue así!</p>
                   </div>
                </div>
                <div style={{ width: '2.2rem', height: '2.2rem', borderRadius: '50%', background: 'var(--color-surface-container-highest)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <ChevronRight size={18} strokeWidth={3} />
                </div>
                <Zap size={60} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.03, transform: 'rotate(15deg)' }} />
             </div>
          </div>

          {/* PRÓXIMAS SESIONES TIMELINE */}
          <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Cronograma de la Semana</h3>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem' }}>
            {clubes.map((club) => {
               const dias = Object.keys(club.horario || {});
               return dias.map(dia => (
                 <div key={`${club.id}-${dia}`} className="bento-card" style={{ minWidth: '160px', padding: '1rem', background: 'white', border: '1px solid var(--color-surface-container-high)' }}>
                    <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-secondary)', textTransform: 'uppercase' }}>{dia}</p>
                    <p style={{ margin: '0.2rem 0', fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{club.nombre}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-outline)', fontSize: '0.75rem', fontWeight: 600 }}>
                       <Clock size={12} /> {club.horario[dia].start}
                    </div>
                 </div>
               ));
            })}
          </div>

        </>
      )}

      {/* 🔹 TAB CONTENT: CLUBES */}
      {tab === 'clubes' && (
        <>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
             <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mis Disciplinas</h3>
             <span style={{ fontSize: '0.7rem', fontWeight: 900, background: 'var(--color-secondary-container)', padding: '0.4rem 1rem', borderRadius: '99px', color: 'var(--color-on-secondary)' }}>
                {clubes.length} Activos
             </span>
          </div>
          <div className="flex-column" style={{ gap: '1.25rem' }}>
             {clubes
               .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
               .map((club, index) => {
               const icons = [Activity, Users, CalendarIcon, BookOpen];
               const IconLogo = icons[index % icons.length];

               return (
                 <div key={club.id} className="bento-card card-premium" style={{ 
                   display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem',
                   border: '1px solid var(--color-surface-container-high)',
                   background: 'white',
                   transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                 }}>
                   <div style={{ 
                     width: '4rem', height: '4rem', borderRadius: '1.25rem', 
                     background: 'var(--color-surface-container-low)',
                     color: 'var(--color-primary)',
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     boxShadow: 'var(--shadow-sm)'
                   }}>
                     <IconLogo size={28} />
                   </div>
                   <div style={{ flex: 1 }}>
                     <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>{club.nombre}</h4>
                     <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Users size={14} /> {club._count?.inscripciones || 0} Atletas</span>
                       {club.horario && Object.keys(club.horario).length > 0 && (
                         <>
                           <span style={{ opacity: 0.3 }}>•</span>
                           <span style={{ color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                             <Clock size={14} /> {formatHorarioShort(club.horario)}
                           </span>
                         </>
                       )}
                     </p>
                   </div>
                   <div style={{ display: 'flex', gap: '0.75rem' }}>
                     <button 
                       onClick={() => navigate(`/clubes/${club.id}/asistencia`)}
                       className="btn-icon-premium"
                       title="Pasar Lista"
                       style={{ width: '3rem', height: '3rem', borderRadius: '1rem', background: 'var(--color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: 'none', cursor: 'pointer' }}
                     >
                       <CheckCircle2 size={20} strokeWidth={2.5} />
                     </button>
                     <button 
                       onClick={() => navigate(`/clubes/${club.id}/historial`)}
                       className="btn-icon-premium"
                       title="Ver Historial"
                       style={{ width: '3rem', height: '3rem', borderRadius: '1rem', background: 'var(--color-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', border: 'none', cursor: 'pointer' }}
                     >
                       <CalendarIcon size={20} />
                     </button>
                   </div>
                 </div>
               );
             })}
          </div>

          <Pagination 
            current={currentPage} 
            total={Math.ceil(clubes.length / ITEMS_PER_PAGE)} 
            onChange={setCurrentPage} 
          />
        </>
      )}

      <style>{`
        @keyframes pulse {
           0% { transform: scale(1); opacity: 1; }
           50% { transform: scale(1.5); opacity: 0.5; }
           100% { transform: scale(1); opacity: 1; }
        }
        .card-premium:hover {
           transform: translateY(-4px);
           box-shadow: 0 12px 24px rgba(0,0,0,0.06);
           border-color: var(--color-primary-fixed) !important;
        }
        .btn-icon-premium {
           transition: all 0.2s;
        }
        .btn-icon-premium:active {
           transform: scale(0.9);
        }
      `}</style>
    </div>
  );
}

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', padding: '1rem 0' }}>
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
        padding: '0.44rem 1rem', 
        borderRadius: '99px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem'
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
