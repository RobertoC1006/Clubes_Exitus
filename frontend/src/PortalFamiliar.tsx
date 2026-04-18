import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { Users, LayoutDashboard, Calendar, Bell, CheckCircle2, XCircle, Trophy, CreditCard, Clock, RefreshCw, ChevronRight } from 'lucide-react';
import './index.css';

const API = 'http://localhost:3000';

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
    <div className="app-container animate-enter" style={{ padding: '1.25rem', paddingBottom: '7rem' }}>

      {/* KID SELECTOR (Style Netflix/Profiles) */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--color-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>
                Mis Hijos
            </span>
            {fetchingResumen && <RefreshCw size={14} color="var(--color-secondary)" className="spin" style={{ animation: 'spin 1s linear infinite' }} />}
        </div>
        
        <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', padding: '0.5rem 0.25rem' }}>
            {hijos.map(h => {
                const isSelected = selectedId === h.id;
                const initials = (h.nombre?.[0] || '') + (h.apellido?.[0] || '');
                return (
                    <button 
                        key={h.id} 
                        onClick={() => setSelectedId(h.id)}
                        style={{ 
                            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
                            opacity: isSelected ? 1 : 0.5,
                            transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <div style={{ 
                            width: '4rem', height: '4rem', borderRadius: '1.5rem', 
                            background: isSelected ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
                            color: isSelected ? 'white' : 'var(--color-on-surface-variant)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem', fontWeight: 900,
                            boxShadow: isSelected ? '0 12px 24px rgba(29,40,72,0.3)' : 'none',
                            border: isSelected ? '3px solid white' : '2px solid transparent'
                        }}>
                            {initials || '?'}
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isSelected ? 'var(--color-primary)' : 'var(--color-outline)' }}>
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
          {/* HERO */}
          <section style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>
                  {resumen.alumno.nombre}
                </h2>
                <p style={{ margin: '0.4rem 0 0 0', color: 'var(--color-on-surface-variant)', fontWeight: 600, fontSize: '0.95rem' }}>
                  {resumen.alumno.grado} · <span style={{ color: 'var(--color-secondary)' }}>ID: #{resumen.alumno.id}</span>
                </p>
              </div>
              <div style={{ background: 'var(--color-success-container)', color: 'var(--color-success)', padding: '0.4rem 0.75rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>
                Estudiante Activo
              </div>
            </div>
          </section>

          {/* LOGROS */}
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 0.85rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
              Logros de {resumen.alumno.nombre}
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {resumen.logros.map((logro, i) => (
                <div key={i} style={{ 
                    background: 'var(--color-secondary-container)', borderRadius: '1.25rem', padding: '1rem 1.25rem', 
                    minWidth: '150px', flexShrink: 0, boxShadow: '0 4px 16px rgba(237,198,32,0.15)',
                    border: '1px solid rgba(237,198,32,0.2)'
                }}>
                  <span style={{ fontSize: '1.75rem' }}>{logro.icon}</span>
                  <p style={{ margin: '0.4rem 0 0 0', fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-on-secondary-container)' }}>{logro.titulo}</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.7rem', color: 'var(--color-secondary)', fontWeight: 600 }}>{logro.desc}</p>
                </div>
              ))}
              {resumen.logros.length === 0 && (
                  <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: '1.25rem', padding: '1rem 1.25rem', minWidth: '150px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', border: '2px dashed var(--color-surface-container-high)' }}>
                    <Trophy size={28} color="var(--color-outline-variant)" />
                    <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-outline)', textAlign: 'center' }}>Pronto nuevos logros</p>
                  </div>
              )}
            </div>
          </section>

          {/* CLUBES CON HEATMAP SEMANAL */}
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
              Seguimiento de Asistencia
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {resumen.clubes.map((club: any) => (
                <div key={club.id} style={{ background: 'white', borderRadius: '1.5rem', padding: '1.25rem', boxShadow: '0 8px 24px rgba(14,26,57,0.05)', border: '1px solid var(--color-surface-container-high)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{club.nombre}</p>
                      <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>{club.profesor}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontWeight: 900, fontSize: '1.4rem', color: club.asistenciaPct >= 85 ? 'var(--color-success)' : 'var(--color-error)' }}>
                          {club.asistenciaPct}%
                        </span>
                        <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-outline)' }}>Rendimiento</span>
                    </div>
                  </div>

                  {/* Heatmap semanal (Ultimas 5 sesiones registradas) */}
                  <div style={{ background: 'var(--color-surface-container-lowest)', padding: '0.85rem', borderRadius: '1rem', border: '1px solid var(--color-surface-container)' }}>
                    <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-secondary)' }}>
                        Estado de últimas clases
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {club.asistencias.map((asistio: boolean, i: number) => (
                            <div key={i} style={{ flex: 1, height: '1.5rem', borderRadius: '0.4rem', background: asistio ? 'var(--color-success)' : 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.85 }}>
                                {asistio ? <CheckCircle2 size={12} color="white" strokeWidth={3} /> : <XCircle size={12} color="white" strokeWidth={3} />}
                            </div>
                        ))}
                        {[...Array(5 - club.asistencias.length)].map((_, i) => (
                            <div key={i + 10} style={{ flex: 1, height: '1.5rem', borderRadius: '0.4rem', background: 'var(--color-surface-container-high)', opacity: 0.3 }} />
                        ))}
                    </div>
                  </div>
                </div>
              ))}
              {resumen.clubes.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--color-surface-container-lowest)', borderRadius: '1.5rem' }}>
                      <p style={{ fontWeight: 600, color: 'var(--color-outline)' }}>Sin clubes inscritos todavía.</p>
                  </div>
              )}
            </div>
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
