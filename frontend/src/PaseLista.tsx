import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Check, X, ArrowLeft, Send, Loader2, StickyNote, WifiOff, Users, AlertCircle, BookOpen, ShieldAlert } from 'lucide-react';
import { db } from './db';
import { useUser } from './UserContext';
import './index.css';
import { API_BASE_URL } from './config';

const API = API_BASE_URL;

export default function PaseLista() {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const { usuario } = useUser();
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const isAdmin = usuario?.rol === 'ADMINISTRADOR';

  // Estado para la nota seleccionada
  const [noteAlumnoId, setNoteAlumnoId] = useState<number | null>(null);

  // 🔹 Monitor de conexión
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 🔹 Traer Alumnos Reales del Club
  useEffect(() => {
    fetch(`${API}/clubes/${clubId}/alumnos`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        const asignados = list.map((a: any) => ({
          ...a,
          nombre: a.nombre || 'Sin Nombre',
          apellido: a.apellido || '',
          estadoPago: a.estadoPago || 'PENDIENTE',
          estado: null,
          observacion: ''
        }));
        setAlumnos(asignados);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching students:", err);
        setAlumnos([]);
        setLoading(false);
      });
  }, [clubId]);

  const marcados = alumnos.filter(a => a.estado !== null).length;
  const faltan = alumnos.length - marcados;

  const handleMarcar = (id: number, estado: string) => {
    if (isAdmin) return;
    if (estado !== 'JUSTIFICADO' && noteAlumnoId === id) {
      setNoteAlumnoId(null);
    }
    setAlumnos(prev => prev.map(a => a.id === id ? { ...a, estado } : a));
  };

  const updateObservacion = (id: number, observacion: string) => {
    if (isAdmin) return;
    setAlumnos(prev => prev.map(a => a.id === id ? { ...a, observacion } : a));
  };

  const guardarAsistencia = async () => {
    if (isAdmin) return;
    if (faltan > 0) {
      alert(`Aún faltan ${faltan} alumnos por marcar.`);
      return;
    }

    setSaving(true);

    const payloadAsistencias = alumnos.map(a => ({
      alumnoId: a.id,
      estado: a.estado,
      observacion: a.observacion
    }));

    if (navigator.onLine) {
      try {
        const reqSesion = await fetch(`${API}/sesiones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clubId: Number(clubId), fecha: new Date().toISOString() })
        });
        const sesion = await reqSesion.json();

        await fetch(`${API}/sesiones/${sesion.id}/asistencia`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asistencias: payloadAsistencias })
        });

        alert("✔️ Asistencia guardada y notificaciones enviadas.");
        navigate(-1);
      } catch (err) {
        alert("Error de red. Guardando copia local...");
        saveOffline(payloadAsistencias);
      }
    } else {
      saveOffline(payloadAsistencias);
    }
  };

  const saveOffline = async (payload: any[]) => {
    try {
      await db.asistenciasPendientes.add({
        clubId: Number(clubId),
        fecha: new Date().toISOString(),
        asistencias: payload,
        syncStatus: 'pending'
      });
      alert("📡 MODO OFFLINE: El pase de lista se guardó localmente.");
      navigate(-1);
    } catch (e) {
      alert("Error crítico al guardar localmente.");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (estado: string | null) => {
    if (estado === 'PRESENTE') return '#22c55e'; // Verde Pro
    if (estado === 'AUSENTE') return '#ef4444'; // Rojo Pro
    if (estado === 'JUSTIFICADO') return 'var(--color-secondary)'; // Amarillo Exitus
    return 'transparent';
  };

  const getInitials = (nombre: string) => {
    const parts = nombre.split(' ');
    if (!parts[0]) return '?';
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  };

  const alumnosFiltrados = alumnos.filter(a => {
    const fullName = `${a.nombre || ''} ${a.apellido || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      (a.id && a.id.toString().includes(searchTerm));
    return matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
        <Loader2 className="animate-spin" size={48} strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="animate-enter" style={{ paddingBottom: '16rem' }}>

      {/* HEADER PREMIUM */}
      <section style={{ padding: '1.5rem 1rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'var(--color-surface-dim)', border: 'none', borderRadius: '1rem', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={24} color="var(--color-primary)" />
          </button>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.05em', lineHeight: 1 }}>Control de <br /> <span style={{ color: 'var(--color-secondary)' }}>Asistencia</span></h2>
            {isOffline && (
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
                <WifiOff size={12} /> SINCRONIZACIÓN LOCAL ACTIVA
              </span>
            )}
          </div>
        </div>
      </section>

        {/* RESUMEN SLIM */}
      <section className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderRadius: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--color-primary)' }}>{marcados}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-outline)' }}>/ {alumnos.length} presentes</span>
          </div>
          <div style={{ 
              padding: '0.4rem 0.8rem', borderRadius: '99px', background: faltan === 0 ? 'var(--color-success-container)' : 'var(--color-surface-dim)', 
              color: faltan === 0 ? 'var(--color-success)' : 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 900 
          }}>
              {faltan > 0 ? `Faltan ${faltan}` : '✓ Completo'}
          </div>
        </div>
        <div style={{ marginTop: '0.75rem' }}>
            <div style={{ width: '100%', background: 'var(--color-surface-dim)', height: '6px', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--color-primary)', height: '100%', width: `${(marcados / alumnos.length) * 100}%`, transition: 'all 0.6s ease-out' }}></div>
            </div>
        </div>
      </section>

      {/* BUSCADOR PREMIUM */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          background: 'white',
          border: '1px solid var(--color-surface-container-high)',
          borderRadius: '1.25rem', padding: '0.85rem 1.25rem',
          display: 'flex', gap: '0.85rem', alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          transition: 'all 0.3s'
        }}>
          <Search size={20} color="var(--color-outline)" />
          <input
            type="text"
            placeholder="Buscar por nombre o identificación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', color: 'var(--color-on-surface)', fontWeight: 700 }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ background: 'var(--color-surface-dim)', border: 'none', borderRadius: '50%', width: '1.5rem', height: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={14} color="var(--color-primary)" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-column" style={{ gap: '1.25rem', paddingBottom: '2rem' }}>
        {alumnosFiltrados.map((alumno, idx) => {
          const isActive = alumno.estado !== null;
          const statusColor = getStatusColor(alumno.estado);

          return (
            <div key={alumno.id} className="glass-card" style={{ 
              padding: '1rem',
              borderRadius: '1.25rem',
              border: '1px solid var(--color-surface-container-high)',
              display: 'flex', flexDirection: 'column', gap: '1rem',
              background: 'white',
              animation: `fadeInSlideUp 0.4s ease-out forwards ${idx * 0.03}s`,
              opacity: 0,
              transform: 'translateY(10px)',
              transition: 'all 0.2s ease'
            }}>
               
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '3rem', height: '3rem', borderRadius: '1rem', 
                    background: 'var(--color-surface-dim)',
                    color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '1.1rem'
                  }}>
                     {getInitials(alumno.nombre)}
                  </div>
                  <div style={{ flex: 1 }}>
                     <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{alumno.nombre} {alumno.apellido}</h3>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-outline)' }}>ID: {alumno.id}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-outline-variant)' }}>•</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-outline)' }}>{alumno.grado || 'Estudiante'}</span>
                     </div>
                  </div>
               </div>

               {/* Controles de Estado Institucionales */}
               <div style={{ display: 'flex', background: 'var(--color-surface-dim)', borderRadius: '1.25rem', padding: '0.4rem', gap: '0.4rem' }}>
                  {[
                    { label: 'PRESENTE', icon: Check, color: 'var(--color-primary)', text: 'Presente' },
                    { label: 'AUSENTE', icon: X, color: '#ef4444', text: 'Falta' },
                    { label: 'JUSTIFICADO', icon: StickyNote, color: 'var(--color-secondary)', text: 'Justif.' }
                  ].map(status => {
                    const isS = alumno.estado === status.label;
                    const Icon = status.icon;
                    const bg = isS ? status.color : 'transparent';
                    const fg = isS ? (status.label === 'JUSTIFICADO' ? 'var(--color-on-secondary)' : 'white') : 'var(--color-outline)';
                    
                    return (
                      <button 
                        key={status.label}
                        onClick={() => handleMarcar(alumno.id, status.label)} 
                        style={{
                          flex: 1, padding: '0.85rem 0', borderRadius: '1rem', border: 'none',
                          background: bg,
                          color: fg,
                          fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', 
                          letterSpacing: '0.05em', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                          cursor: 'pointer',
                          boxShadow: isS ? `0 4px 12px ${status.color}30` : 'none'
                        }}>
                        <Icon size={16} strokeWidth={3} />
                        <span>{status.text}</span>
                      </button>
                    );
                  })}
               </div>

              {alumno.estado === 'JUSTIFICADO' && (
                <div style={{ animation: 'fadeInScale 0.3s ease-out' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: 'var(--color-surface-dim)',
                    padding: '1rem', borderRadius: '1.25rem',
                    border: '1.5px solid var(--color-secondary-container)',
                  }}>
                    <StickyNote size={18} color="var(--color-secondary)" />
                    <input
                      type="text"
                      placeholder="Motivo de la observación..."
                      value={alumno.observacion}
                      onChange={(e) => updateObservacion(alumno.id, e.target.value)}
                      autoFocus
                      style={{
                        flex: 1, border: 'none', background: 'transparent', outline: 'none',
                        fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 800
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {alumnosFiltrados.length === 0 && (
        <div style={{
          padding: '5rem 2rem', textAlign: 'center',
          background: 'var(--color-surface-container-lowest)',
          borderRadius: '2rem', border: '2px dashed var(--color-surface-container-high)'
        }}>
          <div style={{ color: 'var(--color-outline-variant)', marginBottom: '1rem' }}>
            <Users size={48} strokeWidth={1.5} style={{ opacity: 0.5 }} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {searchTerm ? 'No hay coincidencias' : 'Sin alumnos asignados'}
          </h3>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>
            {searchTerm
              ? 'Prueba con otro nombre o número de identificación.'
              : 'Este club aún no tiene estudiantes registrados por el administrador.'}
          </p>
        </div>
      )}

         {/* CHIP FLOTANTE DE ACCIONES MASIVAS */}
      {faltan > 0 && faltan < alumnos.length && (
        <div style={{ position: 'fixed', bottom: '11.5rem', left: 0, width: '100%', padding: '0 1.25rem', zIndex: 100, display: 'flex', justifyContent: 'center', animation: 'fadeInSlideUp 0.4s ease-out' }}>
           <div style={{ 
              background: 'rgba(29, 40, 72, 0.95)', backdropFilter: 'blur(10px)', color: 'white', padding: '0.8rem 1.2rem', borderRadius: '99px',
              display: 'flex', alignItems: 'center', gap: '1.2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)'
           }}>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, whiteSpace: 'nowrap' }}>¿Faltan {faltan} alumnos?</p>
              <button 
                onClick={() => setAlumnos(prev => prev.map(a => a.estado === null ? { ...a, estado: 'PRESENTE' } : a))}
                style={{ background: 'var(--color-secondary)', color: 'var(--color-on-secondary)', padding: '0.5rem 1.2rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Completar con Presente
              </button>
           </div>
        </div>
      )}

          {/* BOTÓN DE GUARDADO FLOTANTE */}
          <div style={{ position: 'fixed', bottom: '6.5rem', left: 0, width: '100%', padding: '0 1.25rem', zIndex: 90, display: 'flex', justifyContent: 'center' }}>
            {isAdmin ? (
              <div style={{
                width: '100%', maxWidth: '448px', padding: '1rem',
                background: 'var(--color-surface-container-high)', color: 'var(--color-primary)',
                borderRadius: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                justifyContent: 'center', fontWeight: 800, border: '1px solid var(--color-outline-variant)'
              }}>
                <ShieldAlert size={20} /> Solo lectura (Modo Administrador)
              </div>
            ) : (
              <button className="btn" style={{
                width: '100%', maxWidth: '448px', padding: '1.25rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '0.75rem',
                boxShadow: '0 12px 32px rgba(29, 40, 72, 0.4)',
                background: faltan === 0 ? 'var(--color-success)' : 'var(--color-primary)',
                color: 'white', border: 'none', borderRadius: '1.25rem',
                opacity: saving ? 0.7 : 1, transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                transform: faltan === 0 ? 'scale(1.02)' : 'scale(1)'
              }}
                disabled={saving}
                onClick={guardarAsistencia}>

                {saving ? <Loader2 className="animate-spin" size={20} /> : (faltan === 0 ? <Check size={20} strokeWidth={3} /> : <Send size={20} />)}
                {saving ? 'Procesando...' : (faltan === 0 ? 'Finalizar y Notificar Padres' : `Registrar (${marcados}/${alumnos.length})`)}
              </button>
            )}
          </div>
        </div>
      );
    }
