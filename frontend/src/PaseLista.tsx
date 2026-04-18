import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Filter, Check, X, Info, ArrowLeft, Send, UserPlus, Loader2 } from 'lucide-react';
import './index.css';

export default function PaseLista() {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modal Estados
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [nuevoAlumno, setNuevoAlumno] = useState({ nombre: '', apellido: '', grado: '10º A' });

  // 🔹 Traer Alumnos Reales del Club
  useEffect(() => {
    fetch(`http://localhost:3000/clubes/${clubId}/alumnos`)
      .then(res => res.json())
      .then(data => {
        // Inicializa el estado para el UI
        const asignados = data.map((a: any) => ({ ...a, estado: null }));
        setAlumnos(asignados);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [clubId]);

  const marcados = alumnos.filter(a => a.estado !== null).length;
  const faltan = alumnos.length - marcados;

  const handleMarcar = (id: number, estado: string) => {
    setAlumnos(prev => prev.map(a => a.id === id ? { ...a, estado } : a));
  };

  const guardarAsistencia = async () => {
    if (faltan > 0) {
      alert(`Aún faltan ${faltan} alumnos por marcar.`);
      return;
    }
    
    setSaving(true);
    try {
        // 1. Crear Nueva Sesión hoy
        const reqSesion = await fetch(`http://localhost:3000/sesiones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clubId: Number(clubId), fecha: new Date().toISOString() })
        });
        const sesion = await reqSesion.json();
        
        // 2. Preparar el formato que espera el Backend
        const payloadAsistencias = alumnos.map(a => ({
            alumnoId: a.id,
            estado: a.estado // Mapea PRESENTE, AUSENTE, JUSTIFICADO
        }));

        // 3. Guardar las asistencias en lote
        await fetch(`http://localhost:3000/sesiones/${sesion.id}/asistencia`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ asistencias: payloadAsistencias })
        });
        
        alert("✔️ Asistencia guardada correctamente en la Base de Datos!");
        navigate(-1); // Regresamos al maestro al inicio
    } catch(err) {
        alert("Ocurrió un error guardando la sesión.");
        setSaving(false);
    }
  };

  // 🔹 Enviar nuevo Alumno y matricularlo en la Base de Datos
  const handleAddAlumno = async () => {
    setAdding(true);
    try {
      const res = await fetch(`http://localhost:3000/clubes/${clubId}/alumnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoAlumno)
      });
      const newAlumnoRecibido = await res.json();
      
      // Lo inyectamos silenciosamente a la lista que estamos viendo para evitar recargar
      setAlumnos(prev => [...prev, { ...newAlumnoRecibido, estado: null }]);
      
      // Reseteamos y Cerramos Modal
      setNuevoAlumno({ nombre: '', apellido: '', grado: '10º A' });
      setShowAddModal(false);
    } catch(err) {
      alert("Error al intentar matricular alumno");
    } finally {
      setAdding(false);
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
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
        <Loader2 className="animate-spin" size={48} strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="app-container animate-enter" style={{ paddingBottom: '10rem' }}>
      
      {/* HEADER */}
      <div className="flex-between" style={{ padding: '0.5rem 0 1rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', padding: '0.2rem', marginLeft: '-0.3rem' }}>
             <ArrowLeft size={24} color="var(--color-primary)" />
          </button>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--color-primary)' }}>Pase de Lista</h2>
        </div>
      </div>

      {/* DASHBOARD SUMARIO PREMIUM PERO COMPACTO */}
      <section className="glass-card" style={{ 
        padding: '1.25rem', 
        marginBottom: '1.25rem',
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
        border: '1px solid var(--color-surface-container-high)'
      }}>
        <div className="flex-between" style={{ alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-secondary)', margin: 0, marginBottom: '0.2rem' }}>Reporte de Asistencia</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1, letterSpacing: '-0.05em' }}>{marcados}/{alumnos.length}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>listos</span>
            </div>
          </div>
          <div style={{ paddingBottom: '0.3rem', textAlign: 'right' }}>
            <span style={{ 
                background: faltan === 0 ? 'var(--color-success-container)' : 'var(--color-surface-container-highest)',
                color: faltan === 0 ? 'var(--color-success)' : 'var(--color-primary)',
                padding: '0.3rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700
            }}>
                {faltan > 0 ? `Faltan ${faltan}` : 'Completado'}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div style={{ width: '100%', background: 'var(--color-surface-container-high)', height: '6px', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ background: faltan === 0 ? 'var(--color-success)' : 'var(--color-secondary-container)', height: '100%', width: `${(marcados / alumnos.length) * 100}%`, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
        </div>
      </section>

      {/* SECCIÓN DE BUSCADOR Y AGREGAR */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, background: 'var(--color-surface-container-lowest)', borderRadius: '0.75rem', padding: '0.6rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <Search size={18} color="var(--color-outline-variant)" />
          <input type="text" placeholder="Buscar alumno..." style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'var(--color-on-surface)' }} />
        </div>
        
        {/* Botón Mágico: Agregar Nuevo Alumno */}
        <button 
          onClick={() => setShowAddModal(true)} 
          style={{ background: 'var(--color-primary)', border: 'none', padding: '0.6rem 0.85rem', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(29, 40, 72, 0.2)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
          <UserPlus size={18} strokeWidth={2.5}/>
          <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Nuevo</span>
        </button>
      </div>

      <div className="flex-column" style={{ gap: '0.75rem' }}>
        {alumnos.map((alumno) => {
          const isActive = alumno.estado !== null;
          
          return (
          <div key={alumno.id} style={{ 
            background: 'var(--color-surface-container-lowest)',
            borderRadius: '1rem', 
            padding: '0.85rem', 
            boxShadow: isActive ? '0 4px 12px rgba(14,26,57,0.03)' : 'none',
            border: `1px solid ${isActive ? getStatusColor(alumno.estado) : 'var(--color-surface-container-highest)'}`,
            display: 'flex', flexDirection: 'column', gap: '0.85rem',
            transition: 'all 0.25s ease'
          }}>
             
             {/* Datos del Alumno - Se reemplazó la foto por Iniciales dinámicas */}
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '2.5rem', height: '2.5rem', borderRadius: '50%', 
                  background: isActive ? getStatusColor(alumno.estado) : 'var(--color-surface-container-high)',
                  color: isActive ? 'white' : 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em',
                  transition: 'all 0.3s'
                }}>
                   {getInitials(alumno.nombre)}
                </div>
                <div>
                   <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>{alumno.nombre} {alumno.apellido}</h3>
                   <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-outline)' }}>#{alumno.id} • Grado {alumno.grado}</p>
                </div>
             </div>

             {/* Segmented Control Premium (Controles parecidos a iOS) */}
             <div style={{ 
                display: 'flex', background: 'var(--color-surface-container)', 
                borderRadius: '0.6rem', padding: '0.25rem', gap: '0.25rem'
             }}>
                <button onClick={() => handleMarcar(alumno.id, 'PRESENTE')} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                    padding: '0.5rem 0', borderRadius: '0.4rem',
                    background: alumno.estado === 'PRESENTE' ? 'var(--color-success)' : 'transparent',
                    color: alumno.estado === 'PRESENTE' ? 'white' : 'var(--color-outline)',
                    transition: 'all 0.2s', border: 'none', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase'
                }}>
                    <Check size={14} strokeWidth={alumno.estado === 'PRESENTE' ? 3 : 2} /> Pres
                </button>

                <button onClick={() => handleMarcar(alumno.id, 'AUSENTE')} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                    padding: '0.5rem 0', borderRadius: '0.4rem',
                    background: alumno.estado === 'AUSENTE' ? 'var(--color-error)' : 'transparent',
                    color: alumno.estado === 'AUSENTE' ? 'white' : 'var(--color-outline)',
                    transition: 'all 0.2s', border: 'none', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase'
                }}>
                    <X size={14} strokeWidth={alumno.estado === 'AUSENTE' ? 3 : 2} /> Aus
                </button>

                <button onClick={() => handleMarcar(alumno.id, 'JUSTIFICADO')} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                    padding: '0.5rem 0', borderRadius: '0.4rem',
                    background: alumno.estado === 'JUSTIFICADO' ? 'var(--color-primary-fixed-dim)' : 'transparent',
                    color: alumno.estado === 'JUSTIFICADO' ? 'white' : 'var(--color-outline)',
                    transition: 'all 0.2s', border: 'none', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase'
                }}>
                    <Info size={14} strokeWidth={alumno.estado === 'JUSTIFICADO' ? 3 : 2} /> Just
                </button>
             </div>

          </div>
        )})}
      </div>

      {/* FLOAT ACTION BUTTON */}
      <div style={{ position: 'fixed', bottom: '5.5rem', left: 0, width: '100%', padding: '0 1.25rem', zIndex: 90, display: 'flex', justifyContent: 'center' }}>
        <button className="btn" style={{ 
             width: '100%', maxWidth: '448px', padding: '0.9rem', fontSize: '0.95rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', 
             boxShadow: '0 8px 24px rgba(29, 40, 72, 0.4)',
             background: faltan === 0 ? 'var(--color-success)' : 'var(--color-primary)',
             color: 'white', border: 'none', borderRadius: '1rem',
             opacity: saving ? 0.7 : 1
          }} 
          disabled={saving}
          onClick={guardarAsistencia}>
           
           {saving ? <Loader2 className="animate-spin" size={18} /> : (faltan === 0 ? <Check size={18} /> : <Send size={18} />)} 
           {saving ? 'Guardando en BD...' : (faltan === 0 ? 'Guardar Asistencia en BD' : `Finalizar Registro`)}
        </button>  
      </div>

      {/* MODAL: REGISTRAR Y MATRICULAR NUEVO ALUMNO */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100, 
          background: 'rgba(14,26,57,0.4)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem'
        }}>
           <div className="glass-card animate-enter" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem', borderRadius: '1.5rem', boxShadow: '0 16px 40px rgba(0,0,0,0.15)' }}>
              <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                 <h3 style={{ margin: 0, color: 'var(--color-primary)', fontWeight: 800 }}>Inscribir Alumno</h3>
                 <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-outline)' }}><X size={20}/></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-secondary)' }}>NOMBRES</label>
                    <input type="text" value={nuevoAlumno.nombre} onChange={e => setNuevoAlumno({...nuevoAlumno, nombre: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--color-surface-container-highest)', marginTop: '0.3rem', background: 'var(--color-surface-container-lowest)', color: 'var(--color-on-surface)' }} placeholder="Ej: Juan Carlos" />
                 </div>
                 <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-secondary)' }}>APELLIDOS</label>
                    <input type="text" value={nuevoAlumno.apellido} onChange={e => setNuevoAlumno({...nuevoAlumno, apellido: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--color-surface-container-highest)', marginTop: '0.3rem', background: 'var(--color-surface-container-lowest)', color: 'var(--color-on-surface)' }} placeholder="Ej: Perez Gómez" />
                 </div>
                 <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-secondary)' }}>GRADO ESCOLAR</label>
                    <select value={nuevoAlumno.grado} onChange={e => setNuevoAlumno({...nuevoAlumno, grado: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--color-surface-container-highest)', marginTop: '0.3rem', background: 'var(--color-surface-container-lowest)', color: 'var(--color-on-surface)', fontWeight: 600 }}>
                      <option value="1ro Secundaria">1ro Secundaria</option>
                      <option value="2do Secundaria">2do Secundaria</option>
                      <option value="3ro Secundaria">3ro Secundaria</option>
                      <option value="10º A">10º A</option>
                      <option value="10º B">10º B</option>
                      <option value="11º A">11º A</option>
                    </select>
                 </div>
                 
                 <button className="btn btn-primary" onClick={handleAddAlumno} disabled={adding || !nuevoAlumno.nombre || !nuevoAlumno.apellido} style={{ width: '100%', padding: '0.9rem', borderRadius: '1rem', marginTop: '0.5rem', opacity: (adding || (!nuevoAlumno.nombre || !nuevoAlumno.apellido)) ? 0.6 : 1, fontWeight: 800, border: 'none' }}>
                    {adding ? <><Loader2 size={18} className="animate-spin" /> Matriculando...</> : 'Matricular y Añadir a la Lista'}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
