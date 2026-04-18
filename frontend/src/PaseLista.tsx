import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Check, X, ArrowLeft, Send, Loader2, StickyNote, WifiOff, Users, AlertCircle } from 'lucide-react';
import { db } from './db';
import './index.css';

export default function PaseLista() {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
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
    fetch(`http://localhost:3000/clubes/${clubId}/alumnos`)
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
    // Si cambiamos de estado y no es JUSTIFICADO, cerramos el input de nota si estaba abierto para ese alumno
    if (estado !== 'JUSTIFICADO' && noteAlumnoId === id) {
      setNoteAlumnoId(null);
    }
    setAlumnos(prev => prev.map(a => a.id === id ? { ...a, estado } : a));
  };

  const updateObservacion = (id: number, observacion: string) => {
    setAlumnos(prev => prev.map(a => a.id === id ? { ...a, observacion } : a));
  };

  const guardarAsistencia = async () => {
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

    // 🌐 FLUJO ONLINE
    if (navigator.onLine) {
      try {
        const reqSesion = await fetch(`http://localhost:3000/sesiones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clubId: Number(clubId), fecha: new Date().toISOString() })
        });
        const sesion = await reqSesion.json();
        
        await fetch(`http://localhost:3000/sesiones/${sesion.id}/asistencia`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asistencias: payloadAsistencias })
        });
        
        alert("✔️ Asistencia guardada y notificaciones enviadas (Opción A).");
        navigate(-1);
      } catch(err) {
        alert("Error de red. Guardando copia local...");
        saveOffline(payloadAsistencias);
      }
    } else {
      // 📡 FLUJO OFFLINE
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
      alert("📡 MODO OFFLINE: El pase de lista se guardó localmente. Se sincronizará cuando vuelvas a tener conexión.");
      navigate(-1);
    } catch (e) {
      alert("Error crítico al guardar localmente.");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (estado: string | null) => {
    if(estado === 'PRESENTE') return 'var(--color-success)';
    if(estado === 'AUSENTE') return 'var(--color-error)';
    if(estado === 'JUSTIFICADO') return 'var(--color-primary-fixed-dim)';
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
    <div className="app-container animate-enter" style={{ paddingBottom: '11rem' }}>
      
      {/* HEADER */}
      <div className="flex-between" style={{ padding: '0.5rem 0 1rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', padding: '0.2rem', marginLeft: '-0.3rem' }}>
             <ArrowLeft size={24} color="var(--color-primary)" />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>Pase de Lista</h2>
            {isOffline && (
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <WifiOff size={10} /> MODO OFFLINE ACTIVADO
              </span>
            )}
          </div>
        </div>
      </div>

      {/* DASHBOARD SUMARIO */}
      <section className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid var(--color-surface-container-high)', borderRadius: '1.5rem' }}>
        <div className="flex-between" style={{ alignItems: 'flex-end', marginBottom: '0.75rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-secondary)', margin: 0 }}>Reporte Hoy</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>{marcados}/{alumnos.length}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>listos</span>
            </div>
          </div>
          <span style={{ 
              background: faltan === 0 ? 'var(--color-success-container)' : 'var(--color-surface-container-highest)',
              color: faltan === 0 ? 'var(--color-success)' : 'var(--color-primary)',
              padding: '0.4rem 0.75rem', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 800
          }}>
              {faltan > 0 ? `Faltan ${faltan}` : '✓ Completado'}
          </span>
        </div>
        <div style={{ width: '100%', background: 'var(--color-surface-container-high)', height: '6px', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ background: faltan === 0 ? 'var(--color-success)' : 'var(--color-secondary)', height: '100%', width: `${(marcados / alumnos.length) * 100}%`, transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
        </div>
      </section>

      {/* BUSCADOR */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ background: 'white', border: '1px solid var(--color-surface-container-high)', borderRadius: '1rem', padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <Search size={18} color="var(--color-outline)" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'var(--color-on-surface)', fontWeight: 600 }} 
          />
          {searchTerm && <X size={16} color="var(--color-outline-variant)" onClick={() => setSearchTerm('')} />}
        </div>
      </div>

      {/* LISTA DE ALUMNOS */}
      <div className="flex-column" style={{ gap: '0.75rem', paddingBottom: '2rem' }}>
        {alumnosFiltrados.map((alumno) => {
          const isActive = alumno.estado !== null;
          const isWritingNote = noteAlumnoId === alumno.id;
          const canWriteNote = alumno.estado === 'JUSTIFICADO';
          
          return (
          <div key={alumno.id} style={{ 
            background: 'white', borderRadius: '1.25rem', padding: '1rem', 
            border: `1px solid ${isActive ? getStatusColor(alumno.estado) : 'var(--color-surface-container-high)'}`,
            display: 'flex', flexDirection: 'column', gap: '0.85rem',
            boxShadow: isActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ 
                  width: '2.75rem', height: '2.75rem', borderRadius: '50%', 
                  background: isActive ? getStatusColor(alumno.estado) : 'var(--color-surface-container-low)',
                  color: isActive ? 'white' : 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '0.95rem'
                }}>
                   {getInitials(alumno.nombre)}
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div>
                     <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>{alumno.nombre} {alumno.apellido}</h3>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-outline)' }}>ID #{alumno.id}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-secondary)' }}>• {alumno.grado}</span>
                     </div>
                   </div>

                   {/* Alerta de Deuda */}
                   {alumno.estadoPago !== 'PAGADO' && (
                     <div title="Pago Pendiente" style={{ background: 'var(--color-error-container)', color: 'var(--color-error)', width: '1.5rem', height: '1.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                       <AlertCircle size={12} strokeWidth={3} />
                     </div>
                   )}
                </div>

                {/* Botón de Observación - Solo habilitado si está JUSTIFICADO */}
                <button 
                  disabled={!canWriteNote}
                  onClick={() => setNoteAlumnoId(isWritingNote ? null : alumno.id)}
                  style={{
                    background: alumno.observacion ? 'var(--color-secondary-container)' : 'transparent',
                    border: 'none', padding: '0.5rem', borderRadius: '0.65rem',
                    color: canWriteNote ? (alumno.observacion ? 'var(--color-primary)' : 'var(--color-outline-variant)') : 'rgba(0,0,0,0.05)',
                    cursor: canWriteNote ? 'pointer' : 'not-allowed',
                    opacity: canWriteNote ? 1 : 0.2,
                    transition: 'all 0.2s'
                  }}
                >
                  <StickyNote size={20} fill={(canWriteNote && alumno.observacion) ? "var(--color-secondary)" : "none"} />
                </button>
             </div>

             {/* Input de Nota (se activa solo si está justificado) */}
             {isWritingNote && canWriteNote && (
               <div style={{ animation: 'enter 0.2s ease-out' }}>
                 <input 
                   autoFocus
                   type="text"
                   placeholder="Escribir justificante u observación..."
                   value={alumno.observacion}
                   onChange={(e) => updateObservacion(alumno.id, e.target.value)}
                   onBlur={() => setNoteAlumnoId(null)}
                   style={{ 
                     width: '100%', padding: '0.65rem', borderRadius: '0.75rem', 
                     border: '1px solid var(--color-outline-variant)', 
                     fontSize: '0.8rem', background: 'var(--color-surface-cyan)',
                     color: 'var(--color-on-surface)', fontWeight: 600
                   }}
                 />
               </div>
             )}

             {/* Controles Segmentados */}
             <div style={{ display: 'flex', background: 'var(--color-surface-container-low)', borderRadius: '0.75rem', padding: '0.25rem', gap: '0.25rem' }}>
                {['PRESENTE', 'AUSENTE', 'JUSTIFICADO'].map(label => (
                  <button 
                    key={label}
                    onClick={() => handleMarcar(alumno.id, label)} 
                    style={{
                      flex: 1, padding: '0.6rem 0', borderRadius: '0.6rem', border: 'none',
                      background: alumno.estado === label ? getStatusColor(label) : 'transparent',
                      color: alumno.estado === label ? 'white' : 'var(--color-outline)',
                      fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', transition: 'all 0.2s'
                    }}>
                    {label === 'PRESENTE' && 'Pres'}
                    {label === 'AUSENTE' && 'Aus'}
                    {label === 'JUSTIFICADO' && 'Just'}
                  </button>
                ))}
             </div>
          </div>
        )})}
        
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
      </div>

      {/* BOTÓN DE GUARDADO FLOTANTE */}
      <div style={{ position: 'fixed', bottom: '6.5rem', left: 0, width: '100%', padding: '0 1.25rem', zIndex: 90, display: 'flex', justifyContent: 'center' }}>
        <button className="btn" style={{ 
             width: '100%', maxWidth: '448px', padding: '1.25rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', 
             boxShadow: '0 12px 32px rgba(29, 40, 72, 0.4)',
             background: faltan === 0 ? 'var(--color-success)' : 'var(--color-primary)',
             color: 'white', border: 'none', borderRadius: '1.25rem',
             opacity: saving ? 0.7 : 1, transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }} 
          disabled={saving}
          onClick={guardarAsistencia}>
           
           {saving ? <Loader2 className="animate-spin" size={20} /> : (faltan === 0 ? <Check size={20} /> : <Send size={20} />)} 
           {saving ? 'Procesando...' : (faltan === 0 ? 'Confirmar y Enviar Notificaciones' : `Completar Registro (${marcados}/${alumnos.length})`)}
        </button>  
      </div>
    </div>
  );
}
