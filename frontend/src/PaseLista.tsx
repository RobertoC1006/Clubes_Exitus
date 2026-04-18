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
        
        alert("✔️ Asistencia guardada y notificaciones enviadas.");
        navigate(-1);
      } catch(err) {
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
    if(estado === 'PRESENTE') return 'var(--color-success)';
    if(estado === 'AUSENTE') return 'var(--color-error)';
    if(estado === 'JUSTIFICADO') return 'var(--color-secondary)';
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
      
      {/* HEADER PREMIUM */}
      <section style={{ padding: '1.5rem 1rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'var(--color-surface-dim)', border: 'none', borderRadius: '1rem', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <ArrowLeft size={24} color="var(--color-primary)" />
          </button>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.05em', lineHeight: 1 }}>Control de <br/> <span style={{ color: 'var(--color-secondary)' }}>Asistencia</span></h2>
            {isOffline && (
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
                <WifiOff size={12} /> SINCRONIZACIÓN LOCAL ACTIVA
              </span>
            )}
          </div>
        </div>
      </section>

      {/* DASHBOARD SUMARIO (BENTO) */}
      <section className="bento-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-outline)', margin: '0 0 0.5rem 0' }}>Sincronización Total</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 0.9, letterSpacing: '-0.06em' }}>{marcados}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-outline-variant)' }}>/ {alumnos.length}</span>
            </div>
          </div>
          <div style={{ 
              background: faltan === 0 ? 'var(--color-success-container)' : 'var(--color-surface-dim)',
              color: faltan === 0 ? 'var(--color-success)' : 'var(--color-primary)',
              padding: '0.6rem 1rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 900,
              boxShadow: 'var(--shadow-sm)'
          }}>
              {faltan > 0 ? `Quedan ${faltan}` : '✓ Completado'}
          </div>
        </div>
        <div style={{ marginTop: '1.75rem' }}>
            <div style={{ width: '100%', background: 'var(--color-surface-dim)', height: '10px', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ background: faltan === 0 ? 'var(--color-success)' : 'var(--grad-primary)', height: '100%', width: `${(marcados / alumnos.length) * 100}%`, transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}></div>
            </div>
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontWeight: 700, textAlign: 'right' }}>
                {Math.round((marcados / alumnos.length) * 100)}% Progreso Diario
            </p>
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
          const canWriteNote = alumno.estado === 'JUSTIFICADO';
          
          return (
            <div key={alumno.id} className="bento-card animate-enter" style={{ 
              padding: '1.25rem',
              borderLeft: `6px solid ${isActive ? getStatusColor(alumno.estado) : 'var(--color-surface-dim)'}`,
              display: 'flex', flexDirection: 'column', gap: '1rem',
              background: 'white',
              transform: isActive ? 'scale(1.01)' : 'scale(1)',
            }}>
               
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ 
                    width: '3.5rem', height: '3.5rem', borderRadius: '1.2rem', 
                    background: isActive ? getStatusColor(alumno.estado) : 'var(--color-surface-dim)',
                    color: isActive ? 'white' : 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '1.2rem', boxShadow: 'var(--shadow-sm)'
                  }}>
                     {getInitials(alumno.nombre)}
                  </div>
                  <div style={{ flex: 1 }}>
                     <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{alumno.nombre} {alumno.apellido}</h3>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-secondary)' }}>#{alumno.id}</span>
                        <span style={{ height: '4px', width: '4px', borderRadius: '50%', background: 'var(--color-outline-variant)' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-outline)' }}>{alumno.grado}</span>
                     </div>
                  </div>

                  {alumno.estadoPago !== 'PAGADO' && (
                    <div title="Pago Pendiente" style={{ background: 'rgba(211, 47, 47, 0.1)', color: 'var(--color-error)', width: '2rem', height: '2rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <AlertCircle size={14} strokeWidth={3} />
                    </div>
                  )}
               </div>

               {/* Controles de Estado Premium */}
               <div style={{ display: 'flex', background: 'var(--color-surface-dim)', borderRadius: '1rem', padding: '0.4rem', gap: '0.4rem' }}>
                  {['PRESENTE', 'AUSENTE', 'JUSTIFICADO'].map(label => {
                    const isS = alumno.estado === label;
                    return (
                      <button 
                        key={label}
                        onClick={() => handleMarcar(alumno.id, label)} 
                        style={{
                          flex: 1, padding: '0.75rem 0', borderRadius: '0.75rem', border: 'none',
                          background: isS ? getStatusColor(label) : 'transparent',
                          color: isS ? 'white' : 'var(--color-primary)',
                          fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', 
                          letterSpacing: '0.05em', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                        }}>
                        {label === 'PRESENTE' && (isS ? <Check size={14} strokeWidth={4} /> : 'Pres.')}
                        {label === 'AUSENTE' && (isS ? <X size={14} strokeWidth={4} /> : 'Aus.')}
                        {label === 'JUSTIFICADO' && (isS ? <StickyNote size={14} /> : 'Just.')}
                      </button>
                    );
                  })}
               </div>

               {/* NOTAS DINÁMICAS */}
               {isActive && (
                 <div style={{ animation: 'enter 0.3s ease-out' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--color-surface-dim)', padding: '0.75rem 1rem', borderRadius: '1rem', border: '1px solid var(--color-surface-container-highest)' }}>
                      <StickyNote size={16} color="var(--color-secondary)" />
                      <input 
                        type="text"
                        placeholder="Observación o nota (opcional)..."
                        value={alumno.observacion}
                        onChange={(e) => updateObservacion(alumno.id, e.target.value)}
                        style={{ 
                          flex: 1, border: 'none', background: 'transparent', outline: 'none',
                          fontSize: '0.85rem', color: 'var(--color-on-surface)', fontWeight: 600
                        }}
                      />
                   </div>
                 </div>
               )}
            </div>
          );
        })}
        
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
             opacity: saving ? 0.7 : 1, transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
             cursor: 'pointer'
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
