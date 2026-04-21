import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { Users, LayoutDashboard, Calendar, Bell, CheckCircle2, XCircle, Trophy, CreditCard, Clock, History, RefreshCw, ChevronRight } from 'lucide-react';
import './index.css';

import { API_BASE_URL } from './config';

const API = API_BASE_URL;

const CALENDAR_ITEMS_PER_PAGE = 5;

// Estilos globales internos para el Carousel y animaciones
const globalStyles = `
  .notices-carousel {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 1.25rem;
    padding: 0.5rem 0 1.5rem;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none;  /* IE and Edge */
  }
  .notices-carousel::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
  .notice-card {
    flex: 0 0 88%;
    scroll-snap-align: center;
    transition: transform 0.3s ease;
  }
  .notice-card:active {
    transform: scale(0.98);
  }
  .dot-active {
    background: var(--color-primary) !important;
    width: 1.2rem !important;
  }
`;

function getSemanaActual() {
  const dias = ['L', 'M', 'X', 'J', 'V'];
  const hoy = new Date();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - (hoy.getDay() === 0 ? 6 : hoy.getDay() - 1));
  return dias.map((label, i) => {
    const fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + i);
    return { label, esFuturo: fecha > hoy };
  });
}

interface Hijo {
    id: number;
    nombre: string;
    apellido: string;
    grado: string;
}

interface Resumen {
    alumno: Hijo;
    clubes: any[];
    pago: any;
    logros: any[];
    calendario: any[];
    avisos: any[];
    performance: {
        totalAsistencias: number;
        puntuacion: number;
        nivel: string;
    };
}

export default function PortalFamiliar() {
  const navigate = useNavigate();
  const semana = getSemanaActual();
  
  const { usuario } = useUser();
  const [hijos, setHijos] = useState<Hijo[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchingResumen, setFetchingResumen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeCalendarTab, setActiveCalendarTab] = useState<'proximas' | 'pasadas'>('proximas');
  const [currentPageCalendar, setCurrentPageCalendar] = useState(1);
  const [activeNoticeIndex, setActiveNoticeIndex] = useState(0);

  // 1. Cargar Lista de Hijos
  useEffect(() => {
    if (!usuario) {
        // Si no hay usuario en el contexto, esperamos o redirigimos
        return;
    }

    fetch(`${API}/padre/hijos/${usuario.id}`)
      .then(res => {
        if (!res.ok) throw new Error('El servidor no responde (Hijos)');
        return res.json();
      })
      .then(data => {
        setHijos(data);
        if (data.length > 0) {
            setSelectedId(data[0].id);
            setLoading(false);
        } else {
            setLoading(false);
        }
      })
      .catch((err) => {
        console.error('FETCH HIJOS ERROR:', err);
        setError('Error de comunicación con el servidor. Verifica que el backend esté corriendo.');
        setLoading(false);
      });
  }, [usuario, navigate]);

  // 2. Cargar Resumen del Hijo Seleccionado
  useEffect(() => {
    if (!selectedId) return;
    setFetchingResumen(true);
    setError(null);
    fetch(`${API}/padre/resumen-hijo/${selectedId}`)
      .then(res => {
        if (!res.ok) throw new Error('Servidor devolvió un error (Resumen)');
        return res.json();
      })
      .then(data => {
        setResumen(data);
        setLoading(false);
        setFetchingResumen(false);
      })
      .catch((err) => {
          console.error(err);
          setError('No pudimos obtener el resumen del alumno. Verifica que el servidor esté activo.');
          setLoading(false);
          setFetchingResumen(false);
      });
  }, [selectedId]);

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <XCircle size={60} color="var(--color-error)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
        <h2 style={{ color: 'var(--color-primary)', fontWeight: 900 }}>Error de Conexión</h2>
        <p style={{ color: 'var(--color-on-surface-variant)', marginTop: '0.5rem' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: '2rem' }}>
            <RefreshCw size={16} /> Reintentar
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '1rem' }}>
        <RefreshCw size={40} color="var(--color-primary)" className="spin" style={{ animation: 'spin 1.2s linear infinite' }} />
        <p style={{ fontWeight: 700, color: 'var(--color-outline)' }}>Sincronizando portal...</p>
      </div>
    );
  }

  if (hijos.length === 0 && !loading && !error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <Users size={60} color="var(--color-outline-variant)" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
        <h2 style={{ color: 'var(--color-primary)', fontWeight: 900 }}>¡Bienvenido, {usuario?.nombre}!</h2>
        <p style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.6, maxWidth: '280px', margin: '0.5rem auto 0' }}>
            Todavía no tienes hijos vinculados a tu cuenta. <br/> 
            Por favor, contacta a la administración.
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '2rem' }}>Ir al Inicio</button>
      </div>
    );
  }

  return (
    <div className="portal-container" style={{ padding: '1.5rem', background: '#F8F9FE', minHeight: '100vh', paddingBottom: '6rem' }}>
      <style>{globalStyles}</style>

      {/* MODAL CALENDARIO */}
      {showCalendar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="animate-enter" style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '2rem', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ background: 'var(--grad-primary)', padding: '1.5rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>Mi Calendario</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', opacity: 0.8, fontWeight: 700 }}>{resumen?.alumno.nombre} • {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
              </div>
              <button onClick={() => setShowCalendar(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <XCircle size={22} />
              </button>
            </div>

            {/* TABS CALENDARIO */}
            <div style={{ display: 'flex', background: 'var(--color-surface-dim)', padding: '0.5rem', gap: '0.5rem', borderBottom: '1px solid var(--color-surface-container-high)' }}>
               {[
                 { id: 'proximas', label: 'Próximas Clases', icon: <Clock size={16}/> },
                 { id: 'pasadas', label: 'Historial / Pasadas', icon: <History size={16}/> }
               ].map(tab => {
                 const isA = activeCalendarTab === tab.id;
                 return (
                   <button 
                    key={tab.id}
                    onClick={() => { setActiveCalendarTab(tab.id as any); setCurrentPageCalendar(1); }}
                    style={{ 
                      flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: 'none', 
                      background: isA ? 'white' : 'transparent', 
                      color: isA ? 'var(--color-primary)' : 'var(--color-outline)',
                      fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      boxShadow: isA ? 'var(--shadow-sm)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                   >
                     {tab.icon} {tab.label}
                   </button>
                 );
               })}
            </div>

            <div style={{ padding: '1.5rem', maxHeight: '55vh', overflowY: 'auto' }}>
              {(() => {
                const pasadas = resumen?.calendario.filter((s: any) => s.estado !== 'PROGRAMADO').reverse() || [];
                const proximas = resumen?.calendario.filter((s: any) => s.estado === 'PROGRAMADO') || [];
                const listaActual = activeCalendarTab === 'pasadas' ? pasadas : proximas;
                const totalPaginas = Math.ceil(listaActual.length / CALENDAR_ITEMS_PER_PAGE);

                if (listaActual.length === 0) {
                  return (
                    <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                        <Calendar size={48} color="var(--color-outline-variant)" style={{ marginBottom: '1.25rem', opacity: 0.3 }} />
                        <p style={{ fontWeight: 700, color: 'var(--color-outline)', fontSize: '0.9rem' }}>
                          {activeCalendarTab === 'proximas' ? 'No hay más clases programadas este mes.' : 'Aún no se han registrado asistencias.'}
                        </p>
                    </div>
                  );
                }

                return (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {listaActual
                        .slice((currentPageCalendar - 1) * CALENDAR_ITEMS_PER_PAGE, currentPageCalendar * CALENDAR_ITEMS_PER_PAGE)
                        .map((s: any) => (
                        <div key={s.id} className="animate-enter" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'var(--color-surface-dim)', borderRadius: '1.25rem', border: '1px solid var(--color-surface-container-high)' }}>
                           <div style={{ width: '3.5rem', textAlign: 'center', borderRight: '1.2px solid var(--color-surface-container-high)', paddingRight: '1rem' }}>
                              <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>{new Date(s.fecha).getDate()}</p>
                              <p style={{ margin: '0.1rem 0 0', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-outline)' }}>
                                {new Date(s.fecha).toLocaleDateString('es-ES', { month: 'short' })}
                              </p>
                           </div>
                           <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontWeight: 900, fontSize: '0.95rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{s.club}</p>
                              <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>{s.tema}</p>
                           </div>
                           <div style={{ 
                             padding: '0.45rem 0.85rem', borderRadius: '0.8rem', fontSize: '0.65rem', fontWeight: 900,
                             background: s.asistio ? 'var(--color-success-container)' : (s.estado === 'PENDIENTE' ? 'var(--color-surface-container-high)' : (s.estado === 'PROGRAMADO' ? 'var(--color-primary-container)' : 'var(--color-error-container)')),
                             color: s.asistio ? 'var(--color-success)' : (s.estado === 'PENDIENTE' ? 'var(--color-primary)' : (s.estado === 'PROGRAMADO' ? 'white' : 'var(--color-error)'))
                           }}>
                             {s.asistio ? 'ASISTIÓ' : s.estado}
                           </div>
                        </div>
                      ))}
                    </div>

                    {/* PAGINACIÓN MODAL */}
                    {totalPaginas > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', alignItems: 'center' }}>
                          <button 
                            disabled={currentPageCalendar === 1}
                            onClick={() => setCurrentPageCalendar(p => Math.max(1, p - 1))}
                            style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.8rem', border: 'none', background: 'var(--color-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', opacity: currentPageCalendar === 1 ? 0.3 : 1 }}
                          >
                            <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                          </button>
                          <div style={{ background: 'var(--color-surface-dim)', borderRadius: '99px', padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                            {currentPageCalendar} <span style={{ opacity: 0.4 }}>/</span> {totalPaginas}
                          </div>
                          <button 
                            disabled={currentPageCalendar === totalPaginas}
                            onClick={() => setCurrentPageCalendar(p => Math.min(totalPaginas, p + 1))}
                            style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.8rem', border: 'none', background: 'var(--color-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', opacity: currentPageCalendar === totalPaginas ? 0.3 : 1 }}
                          >
                            <ChevronRight size={18} />
                          </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-surface-container-high)', textAlign: 'center' }}>
               <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 600 }}>Los horarios específicos se coordinan con el docente del club.</p>
            </div>
          </div>
        </div>
      )}

      {/* KID SELECTOR (Premium Chips) */}
      <section style={{ marginBottom: '2rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.85rem' }}>
            {hijos.map(h => {
                const isSelected = selectedId === h.id;
                const initials = (h.nombre?.[0] || '') + (h.apellido?.[0] || '');
                return (
                    <button 
                        key={h.id} 
                        onClick={() => setSelectedId(h.id)}
                        className={`profile-chip ${isSelected ? 'active' : ''}`}
                    >
                        <div style={{ 
                            width: '2.2rem', height: '2.2rem', borderRadius: '50%', 
                            background: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-dim)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.85rem', fontWeight: 900
                        }}>
                            {initials}
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                            {h.nombre}
                        </span>
                    </button>
                );
            })}
        </div>
      </section>

      {!resumen && fetchingResumen && (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
            <RefreshCw size={32} color="var(--color-primary)" className="spin" style={{ animation: 'spin 1.2s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--color-outline)', fontWeight: 600 }}>Obteniendo detalles...</p>
        </div>
      )}

      {!resumen && !fetchingResumen && selectedId && (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--color-surface-container-low)', borderRadius: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-error)', fontWeight: 600 }}>No se pudo cargar el resumen del alumno.</p>
        </div>
      )}

      {resumen && (
        <div className={fetchingResumen ? 'fetching-fade' : ''}>
          
          {/* MODAL CALENDARIO */}
          {showCalendar && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div className="animate-enter" style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '2rem', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ background: 'var(--grad-primary)', padding: '1.5rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>Mi Calendario</h3>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', opacity: 0.8, fontWeight: 700 }}>{resumen.alumno.nombre} • {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
                  </div>
                  <button onClick={() => setShowCalendar(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <XCircle size={22} />
                  </button>
                </div>

                {/* TABS CALENDARIO */}
                <div style={{ display: 'flex', background: 'var(--color-surface-dim)', padding: '0.5rem', gap: '0.5rem', borderBottom: '1px solid var(--color-surface-container-high)' }}>
                   {[
                     { id: 'proximas', label: 'Próximas Clases', icon: <Clock size={16}/> },
                     { id: 'pasadas', label: 'Historial / Pasadas', icon: <History size={16}/> }
                   ].map(tab => {
                     const isA = activeCalendarTab === tab.id;
                     return (
                       <button 
                        key={tab.id}
                        onClick={() => { setActiveCalendarTab(tab.id as any); setCurrentPageCalendar(1); }}
                        style={{ 
                          flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: 'none', 
                          background: isA ? 'white' : 'transparent', 
                          color: isA ? 'var(--color-primary)' : 'var(--color-outline)',
                          fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                          boxShadow: isA ? 'var(--shadow-sm)' : 'none',
                          transition: 'all 0.3s ease'
                        }}
                       >
                         {tab.icon} {tab.label}
                       </button>
                     );
                   })}
                </div>

                <div style={{ padding: '1.5rem', maxHeight: '55vh', overflowY: 'auto' }}>
                  {(() => {
                    const pasadas = resumen.calendario.filter((s: any) => s.estado !== 'PROGRAMADO').reverse();
                    const proximas = resumen.calendario.filter((s: any) => s.estado === 'PROGRAMADO');
                    const listaActual = activeCalendarTab === 'pasadas' ? pasadas : proximas;
                    const totalPaginas = Math.ceil(listaActual.length / CALENDAR_ITEMS_PER_PAGE);

                    if (listaActual.length === 0) {
                      return (
                        <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                            <Calendar size={48} color="var(--color-outline-variant)" style={{ marginBottom: '1.25rem', opacity: 0.3 }} />
                            <p style={{ fontWeight: 700, color: 'var(--color-outline)', fontSize: '0.9rem' }}>
                              {activeCalendarTab === 'proximas' ? 'No hay más clases programadas este mes.' : 'Aún no se han registrado asistencias.'}
                            </p>
                        </div>
                      );
                    }

                    return (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {listaActual
                            .slice((currentPageCalendar - 1) * CALENDAR_ITEMS_PER_PAGE, currentPageCalendar * CALENDAR_ITEMS_PER_PAGE)
                            .map((s: any) => (
                            <div key={s.id} className="animate-enter" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'var(--color-surface-dim)', borderRadius: '1.25rem', border: '1px solid var(--color-surface-container-high)' }}>
                               <div style={{ width: '3.5rem', textAlign: 'center', borderRight: '1.2px solid var(--color-surface-container-high)', paddingRight: '1rem' }}>
                                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>{new Date(s.fecha).getDate()}</p>
                                  <p style={{ margin: '0.1rem 0 0', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-outline)' }}>
                                    {new Date(s.fecha).toLocaleDateString('es-ES', { month: 'short' })}
                                  </p>
                               </div>
                               <div style={{ flex: 1 }}>
                                  <p style={{ margin: 0, fontWeight: 900, fontSize: '0.95rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{s.club}</p>
                                  <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>{s.tema}</p>
                               </div>
                               <div style={{ 
                                 padding: '0.45rem 0.85rem', borderRadius: '0.8rem', fontSize: '0.65rem', fontWeight: 900,
                                 background: s.asistio ? 'var(--color-success-container)' : (s.estado === 'PENDIENTE' ? 'var(--color-surface-container-high)' : (s.estado === 'PROGRAMADO' ? 'var(--color-primary-container)' : 'var(--color-error-container)')),
                                 color: s.asistio ? 'var(--color-success)' : (s.estado === 'PENDIENTE' ? 'var(--color-primary)' : (s.estado === 'PROGRAMADO' ? 'white' : 'var(--color-error)'))
                               }}>
                                 {s.asistio ? 'ASISTIÓ' : s.estado}
                               </div>
                            </div>
                          ))}
                        </div>

                        {/* PAGINACIÓN MODAL */}
                        {totalPaginas > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', alignItems: 'center' }}>
                              <button 
                                disabled={currentPageCalendar === 1}
                                onClick={() => setCurrentPageCalendar(p => Math.max(1, p - 1))}
                                style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.8rem', border: 'none', background: 'var(--color-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', opacity: currentPageCalendar === 1 ? 0.3 : 1 }}
                              >
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                              </button>
                              <div style={{ background: 'var(--color-surface-dim)', borderRadius: '99px', padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                                {currentPageCalendar} <span style={{ opacity: 0.4 }}>/</span> {totalPaginas}
                              </div>
                              <button 
                                disabled={currentPageCalendar === totalPaginas}
                                onClick={() => setCurrentPageCalendar(p => Math.min(totalPaginas, p + 1))}
                                style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.8rem', border: 'none', background: 'var(--color-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', opacity: currentPageCalendar === totalPaginas ? 0.3 : 1 }}
                              >
                                <ChevronRight size={18} />
                              </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-surface-container-high)', textAlign: 'center' }}>
                   <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 600 }}>Los horarios específicos se coordinan con el docente del club.</p>
                </div>
              </div>
            </div>
          )}

          {/* HERO (Premium) */}
          <section style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.06em', lineHeight: 1.1, margin: 0 }}>
                  {resumen.alumno.nombre}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.6rem' }}>
                    <span style={{ background: 'var(--color-primary-container)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '0.6rem', fontSize: '0.7rem', fontWeight: 800 }}>
                        {resumen.alumno.grado}
                    </span>
                    <button 
                      onClick={() => setShowCalendar(true)}
                      style={{ background: 'white', border: '1px solid var(--color-surface-container-high)', padding: '0.3rem 0.8rem', borderRadius: '0.6rem', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}>
                        <Calendar size={12} /> VER CALENDARIO
                    </button>
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '4rem', height: '4rem', borderRadius: '1.2rem', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-surface-container-high)', boxShadow: 'var(--shadow-md)' }}>
                    <Users size={24} color="var(--color-primary)" />
                </div>
                <div style={{ position: 'absolute', top: -4, right: -4, width: 12, height: 12, borderRadius: '50%', background: 'var(--color-success)', border: '2.5px solid white' }}></div>
              </div>
            </div>
          </section>



          {/* LOGROS (Premium Badges) */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-outline)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 15, height: 2, background: 'var(--color-secondary)' }}></div>
              Evolución y Logros
            </h3>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
              {resumen.logros.map((logro, i) => {
                const colors = ['gold', 'silver', 'bronze'];
                const badgeClass = `badge-${colors[i % 3]}`;
                return (
                    <div key={i} className="bento-card animate-enter" style={{ minWidth: '180px', animationDelay: `${i * 0.1}s`, padding: '1.5rem' }}>
                      <div className={`badge-premium ${badgeClass}`} style={{ marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{logro.icon}</span>
                      </div>
                      <p style={{ margin: 0, fontWeight: 900, fontSize: '0.95rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{logro.titulo}</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.72rem', color: 'var(--color-on-surface-variant)', fontWeight: 600, lineHeight: 1.3 }}>{logro.desc}</p>
                    </div>
                );
              })}
              {resumen.logros.length === 0 && (
                  <div className="bento-card" style={{ minWidth: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--color-outline-variant)', background: 'none' }}>
                    <Trophy size={32} color="var(--color-outline-variant)" style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-outline)', textAlign: 'center' }}>Nuevos desafíos próximamente</p>
                  </div>
              )}
            </div>
          {/* ESTATUS DE DESEMPEÑO (Premium Stats) */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-outline)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 15, height: 2, background: 'var(--color-secondary)' }}></div>
              Estatus de Desempeño
            </h3>
            <div className="bento-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', background: 'var(--grad-primary)', color: 'white' }}>
               <div style={{ position: 'relative', width: '6rem', height: '6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ position: 'absolute', transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                     <circle cx="3rem" cy="3rem" r="2.5rem" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                     <circle cx="3rem" cy="3rem" r="2.5rem" fill="none" stroke="white" strokeWidth="8" strokeDasharray="157" strokeDashoffset={157 - (157 * resumen.performance.puntuacion / 100)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
                  </svg>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>{resumen.performance.puntuacion}%</span>
               </div>
               <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>Nivel de Disciplina</p>
                  <h4 style={{ margin: '0.2rem 0 0.5rem', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.04em' }}>{resumen.performance.nivel}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, lineHeight: 1.4 }}>
                     {resumen.alumno.nombre} ha completado {resumen.performance.totalAsistencias} sesiones con éxito este ciclo.
                  </p>
               </div>
            </div>
          </section>

          {/* ASISTENCIA (Track Lineal) */}
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-outline)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 15, height: 2, background: 'var(--color-secondary)' }}></div>
              Asistencia por Club
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {resumen.clubes.map((club: any) => (
                <div key={club.id} className="bento-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 900, fontSize: '1.15rem', color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>{club.nombre}</h4>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>Prof. {club.profesor}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                            fontSize: '1.6rem', fontWeight: 900, 
                            color: club.asistenciaPct >= 85 ? 'var(--color-success)' : 'var(--color-error)',
                            lineHeight: 1
                        }}>
                          {club.asistenciaPct}<span style={{ fontSize: '0.8rem' }}>%</span>
                        </div>
                    </div>
                  </div>

                  {/* Track Moderno */}
                  <div style={{ background: 'var(--color-surface-container-low)', padding: '1rem', borderRadius: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Historial Reciente</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {club.asistencias.map((_: any, idx: number) => (
                                <div key={idx} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-outline-variant)' }}></div>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                        {club.asistencias.map((asistio: boolean, i: number) => (
                            <div key={i} style={{ 
                                flex: 1, height: '1.75rem', borderRadius: '0.6rem', 
                                background: asistio ? 'var(--color-success)' : 'var(--color-error)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: asistio ? '0 4px 10px rgba(46,125,50,0.2)' : 'none',
                                opacity: 0.95
                            }}>
                                {asistio ? <CheckCircle2 size={14} color="white" /> : <XCircle size={14} color="white" />}
                            </div>
                        ))}
                        {[...Array(5 - club.asistencias.length)].map((_, i) => (
                            <div key={i + 10} style={{ flex: 1, height: '1.75rem', borderRadius: '0.6rem', background: 'var(--color-surface-dim)', opacity: 0.3 }} />
                        ))}
                    </div>
                  </div>
                </div>
              ))}
              {resumen.clubes.length === 0 && (
                  <div style={{ padding: '2.5rem', textAlign: 'center', background: 'var(--color-surface-container-low)', borderRadius: '1.5rem', border: '1px dashed var(--color-outline-variant)' }}>
                      <p style={{ fontWeight: 600, color: 'var(--color-outline)', fontSize: '0.85rem' }}>Sin clubes inscritos todavía.</p>
                  </div>
              )}
            </div>
          </section>
  </section>
        </div>
      )}

      <style>{`
        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .fetching-fade { opacity: 0.6; pointer-events: none; transition: opacity 0.3s; }
      `}</style>
    </div>
  );
}
