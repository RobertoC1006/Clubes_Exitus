import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2, Activity, Calendar as CalendarIcon, Users,
  Loader2, Clock, Zap, Target, TrendingUp, AlertCircle, ChevronRight,
  BookOpen
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
  const tab = (searchParams.get('tab') || 'inicio') as 'inicio' | 'clubes' | 'horarios';
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

  const activeClub = useMemo(() => getActiveClub(clubes), [clubes]);

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
          <div style={{ marginBottom: '2.5rem' }}>
            {activeClub ? (
              <div className="glass-card" style={{
                background: 'var(--grad-primary)',
                color: 'white',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
                border: 'none',
                boxShadow: '0 20px 40px rgba(29, 40, 72, 0.2)'
              }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: '12px', height: '12px', background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 15px #4ade80', animation: 'pulse 1.5s infinite' }}></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Clase en Vivo</span>
                  </div>
                  <h3 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>{activeClub.nombre}</h3>
                  <p style={{ margin: '0.5rem 0 2rem', opacity: 0.9, fontSize: '0.95rem', fontWeight: 600 }}>
                    <Users size={16} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
                    {activeClub._count?.inscripciones || 0} Atletas en sala · <Clock size={16} style={{ verticalAlign: 'middle', margin: '0 0.4rem' }} /> {formatHorarioShort(activeClub.horario)}
                  </p>
                  <button
                    onClick={() => navigate(`/clubes/${activeClub.id}/asistencia`)}
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
            ) : (
              <div className="glass-card" style={{ background: 'var(--color-surface-container-low)', padding: '2.5rem', textAlign: 'center', border: '2px dashed var(--color-surface-container-high)' }}>
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
            <div className="glass-card" style={{ padding: '1.5rem', background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'var(--color-secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={20} color="var(--color-on-secondary-container)" />
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-outline)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Asistencia Promedio</p>
              </div>
              <p style={{ margin: 0, fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {loadingDashboard ? '...' : `${metricas?.asistenciaPct ?? 0}%`}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', zIndex: 2 }}>
                <div style={{ background: 'var(--color-primary-container)', width: '3.5rem', height: '3.5rem', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={24} color="white" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                    Racha: {loadingDashboard ? '...' : `${metricas?.racha ?? 0} Sesiones`}
                  </p>
                  <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 600 }}>Superando el 70% de asistencia</p>
                </div>
              </div>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'var(--color-surface-container-highest)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ChevronRight size={20} strokeWidth={3} />
              </div>
              <Zap size={80} style={{ position: 'absolute', right: '-15px', bottom: '-15px', opacity: 0.04, transform: 'rotate(15deg)' }} />
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
                  <div key={club.id} className="glass-card card-premium" style={{
                    display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem',
                    border: '1px solid var(--color-surface-container-high)',
                    background: 'white',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    cursor: 'default'
                  }}>
                    <div style={{
                      width: '4.5rem', height: '4.5rem', borderRadius: '1.5rem',
                      background: 'var(--color-surface-container-low)',
                      color: 'var(--color-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <IconLogo size={32} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>{club.nombre}</h4>
                      <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={16} /> {club._count?.inscripciones || 0} Atletas</span>
                        {club.horario && Object.keys(club.horario).length > 0 && (
                          <>
                            <span style={{ opacity: 0.3 }}>•</span>
                            <span style={{ color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Clock size={16} /> {formatHorarioShort(club.horario)}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <button
                        onClick={() => navigate(`/clubes/${club.id}/asistencia`)}
                        className="btn-icon-premium"
                        title="Pasar Lista"
                        style={{ width: '3.2rem', height: '3.2rem', borderRadius: '1.2rem', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(29, 40, 72, 0.2)' }}
                      >
                        <CheckCircle2 size={22} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => navigate(`/clubes/${club.id}/historial`)}
                        className="btn-icon-premium"
                        title="Ver Historial"
                        style={{ width: '3.2rem', height: '3.2rem', borderRadius: '1.2rem', background: 'var(--color-surface-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', border: 'none', cursor: 'pointer' }}
                      >
                        <CalendarIcon size={22} />
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
