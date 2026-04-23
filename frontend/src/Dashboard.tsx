import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2, Activity, Calendar as CalendarIcon, Users,
  Loader2, Clock, Zap, Target, TrendingUp, AlertCircle, ChevronRight,
  BookOpen, Award
} from 'lucide-react';
import { useUser } from './UserContext';
import './index.css';
import { API_BASE_URL } from './config';

const API = API_BASE_URL;

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

function getActiveClubs(clubes: any[]) {
  const now = new Date();
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const currentDay = days[now.getDay()];
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

  return clubes.filter(club => {
    if (!club.horario || !club.horario[currentDay]) return false;
    const { start, end } = club.horario[currentDay];
    return currentTime >= start && currentTime <= end;
  });
}

// ── Dashboard Component ─────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = (searchParams.get('tab') || 'inicio') as 'inicio' | 'clubes' | 'horarios';
  const { usuario } = useUser();
  const [clubes, setClubes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Paginación (Punto: 3 clubes por página)
  const ITEMS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [activeModal, setActiveModal] = useState<'asistencia' | 'racha' | null>(null);

  // Datos dinámicos del dashboard
  const [metricas, setMetricas] = useState<any>(null);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    if (!usuario) return;

    // 🔹 Profesor ve SOLO sus clubes. Admin ve todos.
    const url = usuario.rol === 'ADMINISTRADOR'
      ? `${API}/clubes`
      : `${API}/clubes/mis-clubes/${usuario.id}`;

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
    fetch(`${API}/clubes/profesor-dashboard/${usuario.id}`)
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

  const activeClubs = useMemo(() => getActiveClubs(clubes), [clubes]);

  // ── Horarios ──
  const [activeDayMobile, setActiveDayMobile] = useState('Lunes');
  const DIAS_CALENDARIO = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const HORAS_START = 8;
  const HORAS_END = 20; // Reduced for professor view usually earlier
  const ROW_HEIGHT = 65;

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  const getPosForTime = (time: string) => {
    const min = timeToMinutes(time);
    const startMin = HORAS_START * 60;
    return ((min - startMin) / 60) * ROW_HEIGHT;
  };
  const getHeightForDuration = (start: string, end: string) => {
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);
    return ((endMin - startMin) / 60) * ROW_HEIGHT;
  };
  const normalizeDay = (dia: string) => {
    if (!dia) return '';
    const d = dia.toLowerCase();
    if (d.includes('lun')) return 'Lunes';
    if (d.includes('mar')) return 'Martes';
    if (d.includes('mi') || d.includes('mirc')) return 'Miércoles';
    if (d.includes('jue')) return 'Jueves';
    if (d.includes('vie')) return 'Viernes';
    if (d.includes('s') || d.includes('sba')) return 'Sábado';
    if (d.includes('d') || d.includes('dom')) return 'Domingo';
    return dia;
  };
  const getClubTheme = (clubName: string) => {
    const name = clubName.toLowerCase();
    if (name.includes('fút') || name.includes('fut')) return { grad: 'linear-gradient(135deg, #1e40af, #3b82f6)', main: '#3b82f6' };
    if (name.includes('natar') || name.includes('nata')) return { grad: 'linear-gradient(135deg, #0369a1, #0ea5e9)', main: '#0ea5e9' };
    if (name.includes('ajed')) return { grad: 'linear-gradient(135deg, #1e293b, #475569)', main: '#475569' };
    if (name.includes('danz')) return { grad: 'linear-gradient(135deg, #7e22ce, #a855f7)', main: '#a855f7' };
    if (name.includes('rob')) return { grad: 'linear-gradient(135deg, #c2410c, #f97316)', main: '#f97316' };
    return { grad: 'var(--grad-primary)', main: 'var(--color-primary)' };
  };

  // ── Auto-selección de día si hay un highlight ──
  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    const dayParam = searchParams.get('day');
    if (highlightId && tab === 'horarios') {
      if (dayParam) {
        setActiveDayMobile(dayParam);
      } else if (clubes.length > 0) {
        const targetClub = clubes.find(c => c.id.toString() === highlightId);
        if (targetClub && targetClub.horario) {
          const firstDay = Object.keys(targetClub.horario)[0];
          if (firstDay) setActiveDayMobile(normalizeDay(firstDay));
        }
      }
    }
  }, [searchParams, tab, clubes]);

  // ── Sesiones Ordenadas para el Timeline de Inicio ──
  const allSessions = useMemo(() => {
    const sessions: any[] = [];
    clubes.forEach(club => {
      if (club.horario) {
        Object.keys(club.horario).forEach(dia => {
          const normalized = normalizeDay(dia);
          sessions.push({
            id: club.id,
            nombre: club.nombre,
            dia: normalized,
            config: club.horario[dia]
          });
        });
      }
    });

    const dayOrder: any = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 7 };

    return sessions.sort((a, b) => {
      const dayDiff = (dayOrder[a.dia] || 9) - (dayOrder[b.dia] || 9);
      if (dayDiff !== 0) return dayDiff;
      return a.config.start.localeCompare(b.config.start);
    });
  }, [clubes]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
        <Loader2 className="animate-spin" size={48} strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="animate-enter" style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem 1.5rem',
      paddingBottom: '7rem',
      width: '100%'
    }}>

      {/* 🔹 HEADER SECTION */}
      {/* 🔮 CONDITIONAL WELCOME (Only on Inicio) */}
      {tab === 'inicio' && (
        <div className="animate-enter" style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.05em', lineHeight: 1.1 }}>
            Hola, <span style={{ color: 'var(--color-secondary)' }}>{(usuario as any).nombre?.split(' ')[0] || 'Profesor'}</span>
          </h1>
        </div>
      )}

      {/* 🔹 TAB CONTENT: INICIO */}
      {tab === 'inicio' && (
        <>
          {/* LIVE STATUS CARD */}
          {/* LIVE STATUS SECTION - Support for Multiple Live Classes */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1.5rem', 
            justifyContent: 'center', 
            marginBottom: '2.5rem' 
          }}>
            {activeClubs.length > 0 ? (
              activeClubs.map(club => (
                <div key={club.id} className="glass-card" style={{
                  background: 'var(--grad-primary)',
                  color: 'white',
                  padding: '2rem',
                  position: 'relative',
                  overflow: 'hidden',
                  border: 'none',
                  boxShadow: '0 20px 40px rgba(29, 40, 72, 0.2)',
                  flex: activeClubs.length === 1 ? '1' : '1 1 450px',
                  maxWidth: activeClubs.length === 1 ? '1200px' : '580px',
                  minWidth: '320px',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                      <div style={{ width: '12px', height: '12px', background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 15px #4ade80', animation: 'pulse 1.5s infinite' }}></div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Clase en Vivo</span>
                    </div>
                    <h3 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>{club.nombre}</h3>
                    <div style={{ margin: '0.5rem 0 2rem', opacity: 0.9, fontSize: '0.95rem', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <Users size={16} />
                        {club._count?.inscripciones || 0} Atletas en sala · <Clock size={16} /> {formatHorarioShort(club.horario)}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/clubes/${club.id}/asistencia`)}
                      style={{
                        width: 'fit-content', minWidth: '220px', padding: '1rem 2rem', borderRadius: '1.25rem',
                        background: 'white', color: 'var(--color-primary)', fontWeight: 900, fontSize: '1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)', cursor: 'pointer'
                      }}
                    >
                      <CheckCircle2 size={20} /> Tomar Lista Ahora
                    </button>
                  </div>
                  <Zap size={180} style={{ position: 'absolute', right: '-40px', bottom: '-40px', color: 'white', opacity: 0.08, transform: 'rotate(15deg)' }} />
                </div>
              ))
            ) : (
              <div className="glass-card" style={{ width: '100%', background: 'var(--color-surface-container-low)', padding: '2.5rem', textAlign: 'center', border: '2px dashed var(--color-surface-container-high)' }}>
                <Clock size={40} color="var(--color-outline)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>Sin clases activas</h3>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--color-outline)', fontWeight: 600 }}>Tu próxima clase comienza pronto. ¡Prepárate!</p>
              </div>
            )}
          </div>

          {/* METRICS GRID */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Desempeño Mensual</h3>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-outline)' }}>Abril 2025</span>
          </div>
          <div className="bento-grid" style={{ marginBottom: '3rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div
              className="glass-card metric-card-interactive"
              onClick={() => setActiveModal('asistencia')}
              style={{
                padding: '1.5rem', background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid var(--color-surface-container-high)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                <div style={{ width: '2.4rem', height: '2.4rem', borderRadius: '0.85rem', background: 'var(--color-secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(var(--color-secondary-rgb), 0.15)' }}>
                  <Target size={18} color="var(--color-on-secondary-container)" />
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-outline)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Asistencia Promedio</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                <p style={{ margin: 0, fontSize: '2.6rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                  {loadingDashboard ? '...' : `${metricas?.asistenciaPct ?? 0}%`}
                </p>
              </div>
            </div>

            <div
              className="glass-card metric-card-interactive"
              onClick={() => setActiveModal('racha')}
              style={{
                padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden', background: 'white', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid var(--color-surface-container-high)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', zIndex: 2 }}>
                <div style={{
                  background: 'linear-gradient(135deg, #facc15, #fbbf24, #9a6d4dff)', // Amarillo Institucional Dominante
                  width: '3.6rem', height: '3.6rem', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(250, 204, 21, 0.3)'
                }}>
                  <Zap size={24} color="var(--color-primary)" fill="var(--color-primary)" strokeWidth={2.5} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    Racha: {loadingDashboard ? '...' : `${metricas?.racha ?? 0} Sesiones`}
                  </p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#854d0e', fontWeight: 700 }}>Excelencia en compromiso</p>
                </div>
              </div>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: '#fef9c3', color: '#854d0e', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                <ChevronRight size={18} strokeWidth={3} />
              </div>
              <Zap size={90} style={{ position: 'absolute', right: '-15px', bottom: '-15px', opacity: 0.08, color: '#fbbf24', transform: 'rotate(15deg)' }} />
            </div>
          </div>

          {/* PRÓXIMAS SESIONES TIMELINE */}
          <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '1.25rem', letterSpacing: '0.05em' }}>Cronograma de la Semana</h3>
          <div className="discrete-scroll" style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1.5rem', marginBottom: '3rem', cursor: 'grab' }}>
            {allSessions.map((session, idx) => (
              <div
                key={`${session.id}-${session.dia}-${idx}`}
                className="glass-card"
                onClick={() => navigate(`/?tab=horarios&highlight=${session.id}&day=${session.dia}`)}
                style={{
                  minWidth: '180px',
                  padding: '1.25rem',
                  background: 'white',
                  border: '1px solid var(--color-surface-container-high)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.05em' }}>{session.dia}</p>
                <p style={{ margin: '0.4rem 0', fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.nombre}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-outline)', fontSize: '0.8rem', fontWeight: 700 }}>
                  <Clock size={14} /> {session.config.start} - {session.config.end}
                </div>
              </div>
            ))}
          </div>

        </>
      )}

      {/* 🔹 TAB CONTENT: CLUBES */}
      {tab === 'clubes' && (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <div className="flex-between" style={{ marginBottom: '1.2rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 950, color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>Mis Disciplinas</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--color-outline)', fontWeight: 600 }}>Administra tus clubes y el rendimiento de tus atletas</p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, background: 'var(--color-secondary-container)', padding: '0.5rem 1.2rem', borderRadius: '99px', color: 'var(--color-on-secondary)' }}>
                {clubes.length} Activos
              </span>
            </div>

            {/* Buscador de Disciplinas (Punto 4) */}
            <div style={{ 
              display: 'flex', gap: '1rem', background: 'white', padding: '0.6rem 1rem', 
              borderRadius: '1.25rem', border: '1px solid var(--color-surface-container-high)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <Users size={18} color="var(--color-outline)" />
              <input 
                type="text" 
                placeholder="Buscar disciplina por nombre..." 
                style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}
              />
            </div>
          </div>
          <div className="flex-column" style={{ gap: '1.5rem' }}>
            {clubes
              .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
              .map((club, index) => {
                const IconLogo = club.nombre.toLowerCase().includes('progra') ? BookOpen :
                                 club.nombre.toLowerCase().includes('nata') ? Activity : Users;
                
                const hoy = DIAS_CALENDARIO[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
                const hayClaseHoy = club.horario && Object.keys(club.horario).some(d => normalizeDay(d) === hoy);

                return (
                  <div key={club.id} className="glass-card card-discipline-premium" style={{
                    display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.8rem',
                    border: '1px solid var(--color-surface-container-high)',
                    background: 'white', position: 'relative', overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                      <div style={{
                        width: '4.8rem', height: '4.8rem', borderRadius: '1.5rem',
                        background: 'var(--color-surface-container-low)', color: 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid var(--color-surface-container-high)'
                      }}>
                        <IconLogo size={32} strokeWidth={2.5} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 950, color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>{club.nombre}</h4>
                          {hayClaseHoy && (
                            <span style={{ padding: '0.3rem 0.8rem', borderRadius: '99px', background: 'var(--color-success-container)', color: 'var(--color-success)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', animation: 'pulse 2s infinite' }}>Hoy</span>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-outline)' }}>
                            <Users size={14} /> {club._count?.inscripciones || 0} Atletas
                          </span>
                          <span style={{ opacity: 0.1 }}>|</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-outline)' }}>
                            <Clock size={14} /> {formatHorarioShort(club.horario)}
                          </span>
                        </div>
                      </div>

                      {/* Botones Institucionales (Punto 1 y 3) */}
                      <div className="discipline-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          onClick={() => navigate(`/clubes/${club.id}/asistencia`)}
                          className="btn-action-premium-filled"
                          style={{
                            padding: '0.8rem 1.4rem', borderRadius: '1rem', background: 'var(--color-primary)', 
                            color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', 
                            gap: '0.6rem', fontWeight: 900, fontSize: '0.8rem', transition: 'all 0.3s',
                            boxShadow: '0 8px 20px rgba(29, 40, 72, 0.2)'
                          }}
                        >
                          <CheckCircle2 size={18} strokeWidth={2.5} />
                          <span>Tomar Lista</span>
                        </button>
                        <button
                          onClick={() => navigate(`/clubes/${club.id}/historial`)}
                          className="btn-action-premium-filled"
                          style={{
                            padding: '0.8rem 1.4rem', borderRadius: '1rem', background: 'var(--color-secondary)', 
                            color: 'var(--color-on-secondary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', 
                            gap: '0.6rem', fontWeight: 900, fontSize: '0.8rem', transition: 'all 0.3s',
                            boxShadow: '0 8px 20px rgba(250, 204, 21, 0.2)'
                          }}
                        >
                          <CalendarIcon size={18} strokeWidth={2.5} />
                          <span>Historial</span>
                        </button>
                      </div>
                    </div>

                    {/* Salud del Club (Punto 3) */}
                    <div style={{ marginTop: '0.5rem', paddingTop: '1.2rem', borderTop: '1px solid var(--color-surface-container-high)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                       <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                             <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-outline)', textTransform: 'uppercase' }}>Consistencia de Asistencia</span>
                             <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-primary)' }}>{club.asistenciaPct || '0%'}</span>
                          </div>
                          <div style={{ height: '6px', background: 'var(--color-surface-container-low)', borderRadius: '3px', overflow: 'hidden' }}>
                             <div style={{ width: `${club.asistenciaPct || 0}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '3px' }}></div>
                          </div>
                       </div>
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

      {/* 🔹 TAB CONTENT: HORARIOS */}
      {tab === 'horarios' && (
        <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>
              Cronograma <span style={{ background: 'var(--color-secondary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Extracurricular</span>
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--color-outline)', fontWeight: 600 }}>Gestión centralizada de horarios y espacios</p>
          </div>

          {/* Mobile Day Selector */}
          <div className="mobile-day-selector" style={{ display: 'none', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
            {DIAS_CALENDARIO.map(dia => (
              <button key={dia} onClick={() => setActiveDayMobile(dia)} style={{
                padding: '0.6rem 1.2rem', borderRadius: '1rem', border: 'none',
                background: activeDayMobile === dia ? 'var(--color-primary)' : 'var(--color-surface-container-low)',
                color: activeDayMobile === dia ? 'white' : 'var(--color-outline)',
                fontWeight: 800, fontSize: '0.75rem', whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.3s'
              }}>
                {dia}
              </button>
            ))}
          </div>

          <div className="calendar-pro-wrapper" style={{
            background: 'var(--color-surface-container-lowest)', borderRadius: '1.5rem', border: '1px solid var(--color-surface-container-high)',
            position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', position: 'relative' }}>
              {/* Time Axis */}
              <div style={{ width: '64px', flexShrink: 0, borderRight: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.5)', paddingTop: '45px' }}>
                {Array.from({ length: HORAS_END - HORAS_START + 1 }, (_, i) => HORAS_START + i).map(h => (
                  <div key={h} style={{ height: `${ROW_HEIGHT}px`, position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-outline)', position: 'absolute', top: '-10px', background: 'white', padding: '2px 6px', borderRadius: '6px', zIndex: 10 }}>{h}:00</span>
                  </div>
                ))}
              </div>

              {/* Grid Area */}
              <div className="calendar-grid-container" style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', position: 'relative', background: 'white' }}>
                {DIAS_CALENDARIO.map((dia, dIdx) => {
                  const clubsDelDia = clubes.filter(c => {
                    const h = c.horario;
                    const keys = h ? Object.keys(h) : [];
                    return keys.some(k => normalizeDay(k) === dia);
                  });

                  return (
                    <div key={dia} className={`calendar-day-col ${activeDayMobile === dia ? 'is-active-mobile' : ''}`} style={{
                      borderRight: dIdx < 6 ? '1px solid var(--color-surface-container-low)' : 'none',
                      position: 'relative', minHeight: `${(HORAS_END - HORAS_START + 1) * ROW_HEIGHT}px`
                    }}>
                      <div style={{ height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--color-surface-container-low)', background: 'rgba(255,255,255,0.8)', position: 'sticky', top: 0, zIndex: 5 }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{dia}</span>
                      </div>

                      <div style={{ position: 'absolute', inset: '45px 0 0 0', pointerEvents: 'none' }}>
                        {Array.from({ length: HORAS_END - HORAS_START + 1 }, (_, i) => (
                          <div key={i} style={{ height: `${ROW_HEIGHT}px`, borderBottom: '1px solid rgba(0,0,0,0.03)' }}></div>
                        ))}
                      </div>

                      <div style={{ position: 'absolute', inset: '45px 4px 0 4px' }}>
                        {clubsDelDia.map(club => {
                          const conf = club.horario[Object.keys(club.horario).find(k => normalizeDay(k) === dia)!];
                          const theme = getClubTheme(club.nombre);
                          const isHighlighted = searchParams.get('highlight') === club.id.toString() && searchParams.get('day') === dia;

                          return (
                            <div key={`${club.id}-${dia}`}
                              className={`schedule-card-pro ${isHighlighted ? 'highlight-soft-gray' : ''}`}
                              style={{
                                position: 'absolute', top: `${getPosForTime(conf.start)}px`, height: `${getHeightForDuration(conf.start, conf.end)}px`,
                                width: '100%', padding: '0.5rem', background: isHighlighted ? 'var(--color-surface-dim)' : 'white', borderRadius: '0.8rem', zIndex: isHighlighted ? 20 : 2,
                                borderLeft: `4px solid ${theme.main}`,
                                boxShadow: isHighlighted ? '0 12px 28px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.08)',
                                overflow: 'hidden',
                                display: 'flex', flexDirection: 'column', boxSizing: 'border-box', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}>
                              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: theme.grad, opacity: 0.8 }}></div>

                              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{club.nombre}</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                                <Clock size={10} color={theme.main} />
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: theme.main }}>{conf.start}</span>
                              </div>

                              <div className="card-hover-extra" style={{
                                position: 'absolute', inset: 0, background: theme.grad, color: 'white',
                                padding: '0.6rem', opacity: 0, visibility: 'hidden', transition: 'all 0.3s', zIndex: 10,
                                display: 'flex', flexDirection: 'column', justifyContent: 'center'
                              }}>
                                <p style={{ margin: '0 0 0.2rem', fontSize: '0.8rem', fontWeight: 900 }}>{club.nombre}</p>
                                <div style={{ marginTop: '0.4rem', background: 'rgba(255,255,255,0.25)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 900, alignSelf: 'flex-start' }}>
                                  {conf.start} - {conf.end}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <style>{`
            @media (max-width: 900px) {
              .mobile-day-selector { display: flex !important; }
              .calendar-grid-container { grid-template-columns: 1fr !important; }
              .calendar-day-col { display: none; }
              .calendar-day-col.is-active-mobile { display: block !important; }
              .calendar-day-col { border-right: none !important; }
            }
            .schedule-card-pro:hover {
              transform: scale(1.02);
              z-index: 10 !important;
              box-shadow: var(--shadow-lg);
            }
            .schedule-card-pro:hover .card-hover-extra {
              opacity: 1 !important;
              visibility: visible !important;
            }
            .mobile-day-selector::-webkit-scrollbar { display: none; }
          `}</style>
        </div>
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
        .glass-card:hover {
           transform: translateY(-4px);
           box-shadow: var(--shadow-md);
           border-color: var(--color-secondary) !important;
        }
        @keyframes softBreath {
          0% { background: var(--color-surface-container-high); }
          50% { background: var(--color-surface-dim); }
          100% { background: var(--color-surface-container-high); }
        }
        .highlight-soft-gray {
          animation: softBreath 3s infinite ease-in-out;
          border: 1px solid var(--color-outline-variant) !important;
        }
      `}</style>
      <style>{`
        /* Corregido: Quitamos el resaltado azul del hover */
        .metric-card-interactive:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 30px rgba(29, 40, 72, 0.08) !important;
          border-color: var(--color-primary) !important;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .card-discipline-premium:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px rgba(29,40,72,0.1) !important;
          border-color: var(--color-primary) !important;
        }
        .btn-action-premium-filled:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(29, 40, 72, 0.3) !important;
        }
        .btn-action-premium-ghost:hover {
          background: white !important;
          border-color: var(--color-primary) !important;
          color: var(--color-primary) !important;
        }
      `}</style>

      {/* ── MODALES DE MÉTRICAS ── */}
      <MetricsModals
        active={activeModal}
        onClose={() => setActiveModal(null)}
        metricas={metricas}
        clubes={clubes}
      />
    </div>
  );
}

// ── Componente de Modales de Desempeño ──────────────────────
function MetricsModals({ active, onClose, metricas, clubes }: { active: 'asistencia' | 'racha' | null, onClose: () => void, metricas: any, clubes: any[] }) {
  if (!active) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
      animation: 'fadeIn 0.3s ease'
    }} onClick={onClose}>
      <div
        style={{
          background: 'var(--color-surface)', borderRadius: '2.5rem', width: '100%', maxWidth: '550px',
          padding: '2.5rem', boxShadow: '0 40px 100px rgba(0,0,0,0.4)', position: 'relative',
          overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)',
          animation: 'fadeInScale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Inspirado en Admin Pagos */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>
              {active === 'asistencia' ? 'Análisis de Asistencia' : 'Compromiso de Excelencia'}
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--color-outline)', fontWeight: 700 }}>
              {active === 'asistencia' ? 'Desglose detallado por disciplina ab-2025' : 'Hitos y consistencia institucional'}
            </p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'var(--color-surface-container-high)', width: '2.8rem', height: '2.8rem', borderRadius: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            <CheckCircle2 size={20} color="var(--color-primary)" strokeWidth={3} />
          </button>
        </div>

        {/* CONTENIDO: ASISTENCIA PROMEDIO */}
        {active === 'asistencia' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Grid de Resumen */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'var(--color-primary-fixed)', padding: '1.5rem', borderRadius: '1.8rem', position: 'relative', overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Promedio Global</p>
                <p style={{ margin: '0.4rem 0 0', fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>{metricas?.asistenciaPct ?? 0}%</p>
                <TrendingUp size={60} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1, color: 'var(--color-primary)' }} />
              </div>
              <div style={{ background: 'var(--color-secondary-container)', padding: '1.5rem', borderRadius: '1.8rem', position: 'relative', overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-on-secondary-container)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Alumnos Únicos</p>
                <p style={{ margin: '0.4rem 0 0', fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-on-secondary-container)', letterSpacing: '-0.03em' }}>{clubes.reduce((acc, c) => acc + (c._count?.inscripciones || 0), 0)}</p>
                <Users size={60} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1, color: 'var(--color-on-secondary-container)' }} />
              </div>
            </div>

            {/* Listado de Disciplinas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-outline)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Desglose por Club</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }} className="discrete-scroll">
                {clubes.map(club => {
                  const pct = club.asistenciaPct || 0; // Usar dato real o 0% si no existe
                  const status = pct >= 90 ? { label: 'Óptimo', color: '#4ade80', bg: '#dcfce7' } :
                    pct >= 70 ? { label: 'Estable', color: '#fbbf24', bg: '#fef3c7' } :
                      { label: 'Pendiente', color: 'var(--color-outline)', bg: 'var(--color-surface-container-high)' };

                  return (
                    <div key={club.id} style={{ padding: '1.2rem', borderRadius: '1.5rem', background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-surface-container-high)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <div style={{ width: '2.2rem', height: '2.2rem', borderRadius: '0.75rem', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            <BookOpen size={16} color="var(--color-primary)" />
                          </div>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)' }}>{club.nombre}</span>
                        </div>
                        <span style={{ padding: '0.25rem 0.6rem', borderRadius: '99px', background: status.bg, color: status.color, fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>{status.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '8px', background: 'var(--color-surface-container-high)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--grad-primary)', borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--color-primary)', minWidth: '40px', textAlign: 'right' }}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO: RACHA DE EXCELENCIA */}
        {active === 'racha' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            {/* Visualización Central - Amarillo Institucional */}
            <div style={{
              textAlign: 'center', padding: '2.5rem 2rem',
              background: 'linear-gradient(135deg, #facc15, #fbbf24, #9a6d4dff)', // Amarillo-Oro Dominante
              borderRadius: '2.5rem', color: 'var(--color-primary)', position: 'relative', overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(250, 204, 21, 0.4)'
            }}>
              <Zap size={150} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', opacity: 0.06, color: 'var(--color-primary)' }} />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                  width: '4.5rem', height: '4.5rem',
                  background: 'rgba(29, 40, 72, 0.1)',
                  borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.5rem', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(29, 40, 72, 0.1)'
                }}>
                  <Zap size={32} color="var(--color-primary)" fill="var(--color-primary)" />
                </div>
                <p style={{ margin: 0, fontSize: '3.4rem', fontWeight: 950, letterSpacing: '-0.05em', lineHeight: 1 }}>{metricas?.racha ?? 0}</p>
                <p style={{ margin: '0.2rem 0 1rem', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sesiones Invictas</p>
                <div style={{ padding: '0.5rem 1rem', borderRadius: '99px', background: 'rgba(29, 40, 72, 0.08)', display: 'inline-block', fontSize: '0.85rem', fontWeight: 800 }}>
                  ¡Compromiso del más alto nivel!
                </div>
              </div>
            </div>

            {/* Mapa de Calor - Estilo GitHub Verde */}
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-outline)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem' }}>Mapa de Actividad (30 días)</p>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: '6px',
                padding: '1.2rem', background: 'var(--color-surface-container-lowest)',
                borderRadius: '1.5rem', border: '1px solid var(--color-surface-container-high)'
              }}>
                {Array.from({ length: 30 }).map((_, i) => {
                  // Lógica Real Temporal: Solo se ilumina si hay data en el índice (simulando días pasados)
                  // Por ahora, como no hay historia en el objeto metricas, se verá gris.
                  const historial = metricas?.historialUltimos30Dias || []; 
                  const diaData = historial[i];
                  
                  let bgColor = 'var(--color-surface-container-high)'; // Por defecto gris (sin clase)

                  if (diaData) {
                    const pct = diaData.asistenciaPct || 0;
                    bgColor = pct >= 90 ? '#098c46ff' :
                             pct >= 50 ? '#10b981' : '#d1fae5';
                  }

                  return (
                    <div key={i} title={diaData ? `Día ${diaData.fecha}: ${diaData.asistenciaPct}%` : 'Sin actividad'} style={{
                      aspectRatio: '1/1', borderRadius: '4px',
                      background: bgColor,
                      transition: 'all 0.3s ease'
                    }}></div>
                  );
                })}
              </div>
            </div>

            {/* Roadmap de Logros */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-outline)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Próximos Hitos</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  { icon: <Award size={20} />, label: 'Bronce', req: 5, active: (metricas?.racha || 0) >= 5 },
                  { icon: <Zap size={20} />, label: 'Plata', req: 15, active: (metricas?.racha || 0) >= 15 },
                  { icon: <Target size={20} />, label: 'Oro', req: 30, active: (metricas?.racha || 0) >= 30 }
                ].map((hito, i) => (
                  <div key={i} style={{
                    flex: 1, padding: '1rem', borderRadius: '1.5rem', textAlign: 'center',
                    background: hito.active ? 'var(--color-primary-fixed)' : 'var(--color-surface-container-low)',
                    border: '1.5px solid', borderColor: hito.active ? 'var(--color-primary)' : 'transparent',
                    opacity: hito.active ? 1 : 0.6
                  }}>
                    <div style={{ color: hito.active ? 'var(--color-primary)' : 'var(--color-outline)', marginBottom: '0.4rem' }}>{hito.icon}</div>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900, color: 'var(--color-primary)' }}>{hito.label}</p>
                    <p style={{ margin: '0.1rem 0 0', fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-outline)' }}>{hito.req} Sesiones</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: '2.5rem', width: '100%', padding: '1.25rem', borderRadius: '1.5rem',
            background: 'var(--color-primary)', color: 'white', fontWeight: 900, fontSize: '1.05rem',
            border: 'none', cursor: 'pointer', boxShadow: '0 12px 24px rgba(29, 40, 72, 0.25)',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          ¡Seguir Adelante!
        </button>
      </div>
      <style>{`
        @keyframes loadBar { from { width: 0; } to { width: auto; } }
        .discrete-scroll::-webkit-scrollbar { width: 4px; }
        .discrete-scroll::-webkit-scrollbar-track { background: transparent; }
        .discrete-scroll::-webkit-scrollbar-thumb { background: var(--color-surface-container-high); borderRadius: 10px; }
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
