import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { Users, LayoutDashboard, Calendar, Bell, CheckCircle2, XCircle, Trophy, CreditCard, Clock, History, RefreshCw, ChevronRight, Zap, Target, Star } from 'lucide-react';
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
        racha?: number;
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

  // Nuevos estados para modales
  const [showDesempenoModal, setShowDesempenoModal] = useState(false);
  const [showRachaModal, setShowRachaModal] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [showClubModal, setShowClubModal] = useState(false);
  const [activeClubTab, setActiveClubTab] = useState<'pasadas' | 'proximas'>('pasadas');

  // Notificaciones
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

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

  // 3. Cargar Notificaciones del Padre
  useEffect(() => {
    if (!usuario) return;
    fetch(`${API}/notificaciones?usuarioId=${usuario.id}`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data.data) ? data.data : [];
        setNotifications(list);
        setUnreadNotifs(list.filter((n: any) => !n.leida).length);
      })
      .catch(err => console.error('Error fetching notifications:', err));
  }, [usuario, showNotifications]);

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
            <div onClick={() => setShowCalendar(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div onClick={(e) => e.stopPropagation()} className="animate-enter" style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
                <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>Mi Calendario</h3>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--color-outline)', fontWeight: 500 }}>{resumen.alumno.nombre} • {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
                  </div>
                  <button onClick={() => setShowCalendar(false)} style={{ background: 'white', border: '1px solid var(--color-surface-container-high)', borderRadius: '50%', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-outline)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                    <XCircle size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', padding: '0 1.5rem 1rem', gap: '0.5rem' }}>
                   <button 
                    onClick={() => { setActiveCalendarTab('pasadas'); setCurrentPageCalendar(1); }}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '99px', border: 'none', background: activeCalendarTab === 'pasadas' ? 'var(--color-primary)' : 'var(--color-surface-container-low)', color: activeCalendarTab === 'pasadas' ? 'white' : 'var(--color-outline)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                      Pasadas
                   </button>
                   <button 
                    onClick={() => { setActiveCalendarTab('proximas'); setCurrentPageCalendar(1); }}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '99px', border: 'none', background: activeCalendarTab === 'proximas' ? 'var(--color-primary)' : 'var(--color-surface-container-low)', color: activeCalendarTab === 'proximas' ? 'white' : 'var(--color-outline)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                      Programadas
                   </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem 1.5rem' }}>
                  {(() => {
                    const pasadas = resumen.calendario.filter((s: any) => s.estado !== 'PROGRAMADO').reverse();
                    const proximas = resumen.calendario.filter((s: any) => s.estado === 'PROGRAMADO');
                    const listaActual = activeCalendarTab === 'pasadas' ? pasadas : proximas;
                    const totalPaginas = Math.ceil(listaActual.length / CALENDAR_ITEMS_PER_PAGE);

                    if (listaActual.length === 0) {
                      return (
                        <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                            <Calendar size={40} color="var(--color-outline-variant)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
                            <p style={{ color: 'var(--color-outline)', fontWeight: 500, fontSize: '0.9rem' }}>
                              {activeCalendarTab === 'proximas' ? 'No hay más clases programadas.' : 'Aún no se han registrado asistencias.'}
                            </p>
                        </div>
                      );
                    }

                    return (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {listaActual
                            .slice((currentPageCalendar - 1) * CALENDAR_ITEMS_PER_PAGE, currentPageCalendar * CALENDAR_ITEMS_PER_PAGE)
                            .map((s: any) => {
                                let bg = 'var(--color-surface-container-high)';
                                let fg = 'var(--color-primary)';
                                let text = s.estado;
                                if (s.asistio) {
                                    bg = '#DCFCE7'; fg = '#166534'; text = 'ASISTIÓ';
                                } else if (s.estado === 'FALTO' || s.estado === 'FALTÓ' || s.estado === 'AUSENTE') {
                                    bg = '#FEE2E2'; fg = '#991B1B'; text = 'FALTÓ';
                                } else if (s.estado === 'JUSTIFICADO' || s.estado === 'EXCUSADO') {
                                    bg = '#FEF9C3'; fg = '#854D0E'; text = 'JUSTIFICADO';
                                } else if (s.estado === 'PROGRAMADO') {
                                    bg = 'var(--color-surface-container-high)'; fg = 'var(--color-outline)'; text = 'PROGRAMADO';
                                }

                                return (
                                <div key={s.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'var(--color-surface-container-low)', borderRadius: '0.75rem' }}>
                                   <div style={{ width: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{new Date(s.fecha).getDate()}</p>
                                      <p style={{ margin: '0.1rem 0 0', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-outline)' }}>
                                        {new Date(s.fecha).toLocaleDateString('es-ES', { month: 'short' })}
                                      </p>
                                   </div>
                                   <div style={{ flex: 1, borderLeft: '1px solid var(--color-surface-container-high)', paddingLeft: '1rem' }}>
                                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>{s.club}</p>
                                      <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-outline)' }}>{s.tema || 'Sesión Regular'}</p>
                                   </div>
                                   <div style={{ 
                                     padding: '0.25rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.65rem', fontWeight: 700,
                                     background: bg, color: fg
                                   }}>
                                     {text}
                                   </div>
                                </div>
                              );
                          })}
                        </div>
                        {totalPaginas > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
                              <button 
                                disabled={currentPageCalendar === 1}
                                onClick={() => setCurrentPageCalendar(p => Math.max(1, p - 1))}
                                style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '1px solid var(--color-surface-container-high)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-outline)', cursor: currentPageCalendar === 1 ? 'not-allowed' : 'pointer', opacity: currentPageCalendar === 1 ? 0.5 : 1 }}
                              >
                                <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                              </button>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-outline)' }}>
                                {currentPageCalendar} de {totalPaginas}
                              </span>
                              <button 
                                disabled={currentPageCalendar === totalPaginas}
                                onClick={() => setCurrentPageCalendar(p => Math.min(totalPaginas, p + 1))}
                                style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '1px solid var(--color-surface-container-high)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-outline)', cursor: currentPageCalendar === totalPaginas ? 'not-allowed' : 'pointer', opacity: currentPageCalendar === totalPaginas ? 0.5 : 1 }}
                              >
                                <ChevronRight size={16} />
                              </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
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
              
              <button 
                onClick={() => setShowNotifications(true)}
                style={{ 
                  background: 'white', border: 'none', width: '3.5rem', height: '3.5rem', borderRadius: '1.25rem', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)',
                  boxShadow: 'var(--shadow-md)', cursor: 'pointer', position: 'relative'
                }}
              >
                <Bell size={24} />
                {unreadNotifs > 0 && (
                  <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--color-error)', color: 'white', fontSize: '0.7rem', fontWeight: 900, width: '1.4rem', height: '1.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                    {unreadNotifs}
                  </span>
                )}
              </button>
            </div>
          </section>

          {/* MODAL NOTIFICACIONES */}
          {showNotifications && (
            <div onClick={() => setShowNotifications(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div onClick={(e) => e.stopPropagation()} className="animate-enter" style={{ background: 'white', width: '100%', maxWidth: '450px', borderRadius: '2rem', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-surface-container-high)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)' }}>Notificaciones</h3>
                  <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', color: 'var(--color-outline)', cursor: 'pointer' }}>
                    <XCircle size={24} />
                  </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                      <Bell size={40} color="var(--color-outline-variant)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                      <p style={{ color: 'var(--color-outline)', fontWeight: 600 }}>No tienes notificaciones todavía.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {notifications.map((n: any) => (
                        <div key={n.id} style={{ 
                          padding: '1.25rem', borderRadius: '1.25rem', background: n.leida ? 'var(--color-surface-container-lowest)' : 'var(--color-surface-container-high)',
                          border: n.leida ? '1px solid var(--color-surface-container-high)' : '1px solid var(--color-primary-container)',
                          position: 'relative'
                        }}>
                          {!n.leida && <div style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }}></div>}
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-primary)' }}>{n.titulo}</h4>
                          <p style={{ margin: '0.3rem 0 0.5rem', fontSize: '0.85rem', color: 'var(--color-on-surface-variant)', lineHeight: 1.4 }}>{n.mensaje}</p>
                          <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-outline)' }}>{new Date(n.createdAt).toLocaleString('es-ES')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ padding: '1rem', borderTop: '1px solid var(--color-surface-container-high)' }}>
                   <button 
                    onClick={async () => {
                      // Marcar todas como leídas
                      const unreadIds = notifications.filter(n => !n.leida).map(n => n.id);
                      for (const id of unreadIds) {
                        await fetch(`${API}/notificaciones/${id}/leer`, { method: 'PUT' });
                      }
                      setShowNotifications(false);
                      setUnreadNotifs(0);
                      setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
                    }}
                    style={{ width: '100%', padding: '1rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '1rem', fontWeight: 800, cursor: 'pointer' }}>
                     Entendido
                   </button>
                </div>
              </div>
            </div>
          )}
          
          {/* AVISOS Y NOTIFICACIONES (Carousel) */}
          <section style={{ marginBottom: '2.5rem' }}>
            <div className="notices-carousel">
              {resumen.avisos.map((aviso: any, idx: number) => (
                <div key={aviso.id} className="notice-card bento-card" style={{ padding: '1.5rem', background: 'white', border: '1px solid var(--color-surface-container-high)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ 
                    width: '3.5rem', height: '3.5rem', borderRadius: '1rem', 
                    background: aviso.tipo === 'alert' ? '#FEF2F2' : aviso.tipo === 'error' ? '#FFF1F2' : aviso.tipo === 'success' ? '#F0FDF4' : 'var(--color-surface-dim)',
                    color: aviso.tipo === 'alert' ? '#EF4444' : aviso.tipo === 'error' ? '#E11D48' : aviso.tipo === 'success' ? '#22C55E' : 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                  }}>
                    {aviso.icono || '📣'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-primary)' }}>{aviso.titulo}</h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 500, lineHeight: 1.4 }}>{aviso.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Dots del Carousel */}
            {resumen.avisos.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '-0.5rem' }}>
                {resumen.avisos.map((_: any, idx: number) => (
                  <div key={idx} style={{ 
                    width: '0.4rem', height: '0.4rem', borderRadius: '99px', 
                    background: 'var(--color-outline-variant)', opacity: 0.5 
                  }}></div>
                ))}
              </div>
            )}
          </section>



          {/* ESTATUS DE DESEMPEÑO Y RACHA */}
          <section style={{ marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Tarjeta Desempeño */}
            <div 
              onClick={() => setShowDesempenoModal(true)}
              className="bento-card" 
              style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', background: 'var(--grad-primary)', color: 'white', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative', overflow: 'hidden' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
               <div style={{ position: 'relative', width: '6rem', height: '6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ position: 'absolute', transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                     <circle cx="3rem" cy="3rem" r="2.5rem" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                     <circle cx="3rem" cy="3rem" r="2.5rem" fill="none" stroke="white" strokeWidth="8" strokeDasharray="157" strokeDashoffset={157 - (157 * resumen.performance.puntuacion / 100)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
                  </svg>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>{resumen.performance.puntuacion}%</span>
               </div>
               <div style={{ flex: 1, zIndex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>Nivel Institucional</p>
                  <h4 style={{ margin: '0.2rem 0 0.5rem', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.04em' }}>{resumen.performance.nivel}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                     Ver cumplimiento <ChevronRight size={14} />
                  </p>
               </div>
            </div>

            {/* Tarjeta Racha */}
            <div 
              onClick={() => setShowRachaModal(true)}
              className="bento-card" 
              style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'white', cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid var(--color-surface-container-high)' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
               <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '1.2rem', background: 'var(--color-secondary-container)', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={32} fill="currentColor" />
               </div>
               <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-outline)', textTransform: 'uppercase' }}>Compromiso</p>
                  <h4 style={{ margin: '0.2rem 0 0.5rem', fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--color-primary)' }}>Racha: {resumen.performance.racha || 0} Sesiones</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-secondary)' }}>
                     Excelencia en compromiso
                  </p>
               </div>
               <ChevronRight size={24} color="var(--color-outline-variant)" />
            </div>
          </section>

          {/* MODAL DESEMPEÑO */}
          {showDesempenoModal && (
            <div onClick={() => setShowDesempenoModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div onClick={(e) => e.stopPropagation()} className="animate-enter" style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '2rem', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <div style={{ width: '4rem', height: '4rem', background: 'var(--color-primary-container)', color: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Target size={32} />
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)' }}>Cumplimiento Integral</h3>
                  <p style={{ margin: '0 0 2rem', fontSize: '0.9rem', color: 'var(--color-outline)', lineHeight: 1.5 }}>
                    Este porcentaje representa el compromiso global de {resumen.alumno.nombre} con las normas de la institución, reflejando su responsabilidad y participación en todas las actividades.
                  </p>

                  <div style={{ background: 'var(--color-surface-container-low)', padding: '1.5rem', borderRadius: '1.25rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.9rem' }}>Nivel de Cumplimiento</span>
                      <span style={{ fontWeight: 900, color: 'var(--color-secondary)', fontSize: '1.1rem' }}>{resumen.performance.puntuacion}%</span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: 'var(--color-surface-container-high)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${resumen.performance.puntuacion}%`, height: '100%', background: 'var(--grad-primary)', borderRadius: '99px' }}></div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '1rem', borderTop: '1px solid var(--color-surface-container-high)' }}>
                  <button onClick={() => setShowDesempenoModal(false)} style={{ width: '100%', padding: '1rem', background: 'var(--color-surface-dim)', color: 'var(--color-primary)', border: 'none', borderRadius: '1rem', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}>
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL RACHA */}
          {showRachaModal && (
            <div onClick={() => setShowRachaModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div onClick={(e) => e.stopPropagation()} className="animate-enter" style={{ background: 'white', width: '100%', maxWidth: '360px', borderRadius: '2rem', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ padding: '2.5rem 2rem 2rem', textAlign: 'center' }}>
                  <div style={{ width: '5rem', height: '5rem', background: 'var(--color-secondary-container)', color: 'var(--color-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Zap size={40} fill="currentColor" />
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)' }}>{resumen.performance.racha || 0} Clases Seguidas</h3>
                  <p style={{ margin: '0 0 1.5rem', fontSize: '0.95rem', color: 'var(--color-outline)', lineHeight: 1.5 }}>
                    ¡Excelente compromiso! Mantener una racha demuestra responsabilidad, constancia y dedicación.
                  </p>
                </div>
                <div style={{ padding: '1rem', borderTop: '1px solid var(--color-surface-container-high)' }}>
                  <button onClick={() => setShowRachaModal(false)} style={{ width: '100%', padding: '1rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '1rem', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ASISTENCIA (Tarjetas Grid) */}
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-outline)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 15, height: 2, background: 'var(--color-secondary)' }}></div>
              Asistencia por Club
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {resumen.clubes.map((club: any) => (
                <div 
                  key={club.id} 
                  onClick={() => { setSelectedClubId(club.id); setShowClubModal(true); setActiveClubTab('pasadas'); }}
                  className="bento-card" 
                  style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid var(--color-surface-container-high)' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
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

                  <div style={{ background: 'var(--color-surface-container-low)', padding: '1rem', borderRadius: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Últimas 5 sesiones</span>
                        <ChevronRight size={14} color="var(--color-outline-variant)" />
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {club.asistencias.map((asistio: boolean, i: number) => (
                            <div key={i} style={{ 
                                flex: 1, height: '1.5rem', borderRadius: '0.5rem', 
                                background: asistio ? 'var(--color-success)' : 'var(--color-error)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: asistio ? '0 2px 8px rgba(46,125,50,0.2)' : 'none',
                            }}>
                                {asistio ? <CheckCircle2 size={12} color="white" /> : <XCircle size={12} color="white" />}
                            </div>
                        ))}
                        {[...Array(5 - (club.asistencias?.length || 0))].map((_, i) => (
                            <div key={i + 10} style={{ flex: 1, height: '1.5rem', borderRadius: '0.5rem', background: 'var(--color-surface-dim)', opacity: 0.5 }} />
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

          {/* MODAL ASISTENCIA POR CLUB */}
          {showClubModal && selectedClubId && (() => {
             const clubInfo = resumen.clubes.find((c: any) => c.id === selectedClubId);
             const calendarioClub = resumen.calendario.filter((s: any) => s.club === clubInfo?.nombre);
             const pasadas = calendarioClub.filter((s: any) => s.estado !== 'PROGRAMADO').reverse();
             const programadas = calendarioClub.filter((s: any) => s.estado === 'PROGRAMADO');
             const listaMostrada = activeClubTab === 'pasadas' ? pasadas : programadas;

             return (
              <div onClick={() => setShowClubModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <div onClick={(e) => e.stopPropagation()} className="animate-enter" style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
                  <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{clubInfo?.nombre}</h3>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--color-outline)', fontWeight: 500 }}>Registro de Asistencia</p>
                    </div>
                    <button onClick={() => setShowClubModal(false)} style={{ background: 'white', border: '1px solid var(--color-surface-container-high)', borderRadius: '50%', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-outline)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                      <XCircle size={18} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', padding: '0 1.5rem 1rem', gap: '0.5rem' }}>
                     <button 
                      onClick={() => setActiveClubTab('pasadas')}
                      style={{ flex: 1, padding: '0.75rem', borderRadius: '99px', border: 'none', background: activeClubTab === 'pasadas' ? 'var(--color-primary)' : 'var(--color-surface-container-low)', color: activeClubTab === 'pasadas' ? 'white' : 'var(--color-outline)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Pasadas
                     </button>
                     <button 
                      onClick={() => setActiveClubTab('proximas')}
                      style={{ flex: 1, padding: '0.75rem', borderRadius: '99px', border: 'none', background: activeClubTab === 'proximas' ? 'var(--color-primary)' : 'var(--color-surface-container-low)', color: activeClubTab === 'proximas' ? 'white' : 'var(--color-outline)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Programadas
                     </button>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem 1.5rem' }}>
                    {(() => {
                      // Calendario Grid
                      const now = new Date();
                      const currentMonth = now.getMonth();
                      const currentYear = now.getFullYear();
                      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun, 1=Mon...
                      
                      // Ajustar a Lunes como primer día (0=Lun, 6=Dom)
                      const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
                      
                      const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
                      const days = [];
                      for (let i = 0; i < adjustedFirstDay; i++) days.push(null);
                      for (let i = 1; i <= daysInMonth; i++) days.push(i);

                      return (
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ textAlign: 'center', marginBottom: '1.5rem', background: 'var(--color-surface-container-lowest)', padding: '0.8rem', borderRadius: '1rem', border: '1px solid var(--color-surface-container-high)' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'capitalize' }}>
                              {now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            {dayLabels.map(label => (
                              <div key={label} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-outline)', paddingBottom: '0.5rem' }}>
                                {label}
                              </div>
                            ))}
                            {days.map((day, idx) => {
                              if (day === null) return <div key={`empty-${idx}`} />;
                              
                              const session = calendarioClub.find(s => {
                                const d = new Date(s.fecha);
                                return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                              });

                              const isToday = day === now.getDate();
                              
                              let bgColor = 'transparent';
                              let textColor = 'var(--color-on-surface)';
                              let border = '1px solid var(--color-surface-container-high)';
                              let fontWeight = 500;

                              if (session) {
                                // Filtrar visibilidad según pestaña
                                const isPast = session.asistio || ['FALTO', 'FALTÓ', 'AUSENTE', 'JUSTIFICADO', 'EXCUSADO'].includes(session.estado);
                                const isFuture = session.estado === 'PROGRAMADO';
                                
                                const shouldShowColor = (activeClubTab === 'pasadas' && isPast) || (activeClubTab === 'proximas' && isFuture);

                                if (shouldShowColor) {
                                  fontWeight = 800;
                                  if (session.asistio) {
                                    bgColor = '#DCFCE7'; textColor = '#166534'; border = '1px solid #BBF7D0';
                                  } else if (['FALTO', 'FALTÓ', 'AUSENTE'].includes(session.estado)) {
                                    bgColor = '#FEE2E2'; textColor = '#991B1B'; border = '1px solid #FECACA';
                                  } else if (['JUSTIFICADO', 'EXCUSADO'].includes(session.estado)) {
                                    bgColor = '#FEF9C3'; textColor = '#854D0E'; border = '1px solid #FEF08A';
                                  } else if (session.estado === 'PROGRAMADO') {
                                    bgColor = 'var(--color-surface-container-high)'; textColor = 'var(--color-primary)'; border = 'none';
                                  }
                                }
                              }

                              return (
                                <div 
                                  key={day} 
                                  title={session ? `${session.estado}: ${session.tema || 'Sesión'}` : ''}
                                  style={{ 
                                    aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    borderRadius: '0.75rem', fontSize: '0.85rem', fontWeight,
                                    background: bgColor, color: textColor, border: isToday && bgColor === 'transparent' ? '2px solid var(--color-primary)' : border,
                                    position: 'relative', cursor: session ? 'help' : 'default',
                                    opacity: session && !((activeClubTab === 'pasadas' && (session.asistio || ['FALTO', 'FALTÓ', 'AUSENTE', 'JUSTIFICADO', 'EXCUSADO'].includes(session.estado))) || (activeClubTab === 'proximas' && session.estado === 'PROGRAMADO')) ? 0.3 : 1
                                  }}
                                >
                                  {day}
                                  {isToday && (
                                    <div style={{ position: 'absolute', bottom: '2px', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-primary)' }} />
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* LEYENDA */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', padding: '1rem', background: 'var(--color-surface-container-lowest)', borderRadius: '1.25rem', border: '1px solid var(--color-surface-container-high)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-outline)' }}>
                              <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#DCFCE7', border: '1px solid #BBF7D0' }} /> Asistió
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-outline)' }}>
                              <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#FEE2E2', border: '1px solid #FECACA' }} /> Faltó
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-outline)' }}>
                              <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#FEF9C3', border: '1px solid #FEF08A' }} /> Justificado
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-outline)' }}>
                              <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'var(--color-surface-container-high)' }} /> Programado
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
             );
          })()}
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
