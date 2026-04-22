import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Check, X, ArrowLeft, Loader2, StickyNote, Clock, Users, Calendar, Save, ShieldAlert } from 'lucide-react';
import { useUser } from './UserContext';
import './index.css';
import { API_BASE_URL } from './config';

const API = API_BASE_URL;

export default function DetalleSesion() {
  const navigate = useNavigate();
  const { usuario } = useUser();
  const { clubId, sesionId } = useParams();
  const [sesion, setSesion] = useState<any>(null);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tema, setTema] = useState('');

  useEffect(() => {
    fetch(`${API}/sesiones/${sesionId}`)
      .then(res => res.json())
      .then(data => {
        setSesion(data);
        setTema(data.tema || '');
        
        // Mapear asistencias a un formato manejable
        const asistenciasMap = new Map();
        data.asistencias.forEach((as: any) => {
          asistenciasMap.set(as.alumnoId, { estado: as.estado, observacion: as.observacion });
        });

        // Traer todos los alumnos del club para asegurar que la lista esté completa (por si se agregaron alumnos después)
        // O simplemente usar los que ya estaban en la sesión. 
        // Para "Historial", lo correcto es mostrar quiénes estaban en esa sesión.
        const list = data.asistencias.map((as: any) => ({
          ...as.alumno,
          estado: as.estado,
          observacion: as.observacion || ''
        }));
        
        setAlumnos(list);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching session details:", err);
        setLoading(false);
      });
  }, [sesionId]);

  const handleMarcar = (id: number, estado: string) => {
    if (usuario?.rol === 'ADMINISTRADOR') return;
    setAlumnos(prev => prev.map(a => a.id === id ? { ...a, estado } : a));
  };

  const updateObservacion = (id: number, observacion: string) => {
    if (usuario?.rol === 'ADMINISTRADOR') return;
    setAlumnos(prev => prev.map(a => a.id === id ? { ...a, observacion } : a));
  };

  const guardarCambios = async () => {
    if (usuario?.rol === 'ADMINISTRADOR') return;
    setSaving(true);
    const payloadAsistencias = alumnos.map(a => ({
      alumnoId: a.id,
      estado: a.estado,
      observacion: a.observacion
    }));

    try {
      await fetch(`${API}/sesiones/${sesionId}/asistencia`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asistencias: payloadAsistencias, tema })
      });
      alert("✔️ Cambios guardados correctamente.");
      navigate(-1);
    } catch (err) {
      alert("Error al guardar los cambios.");
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
    return fullName.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
        <Loader2 className="animate-spin" size={48} strokeWidth={2} />
      </div>
    );
  }

  const fechaObj = new Date(sesion.fecha);
  const fechaFormat = fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="animate-enter" style={{ paddingBottom: '11rem' }}>
      
      <section style={{ padding: '1.5rem 1rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'var(--color-surface-dim)', border: 'none', borderRadius: '1rem', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <ArrowLeft size={24} color="var(--color-primary)" />
          </button>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.05em', lineHeight: 1 }}>Detalle de <br/> <span style={{ color: 'var(--color-secondary)' }}>Sesión</span></h2>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-outline)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} /> {fechaFormat}
            </p>
          </div>
        </div>
      </section>

      {/* TEMA DE LA SESIÓN */}
      <section className="bento-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'white' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-outline)', margin: '0 0 0.75rem 0' }}>Tema / Actividad</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--color-surface-dim)', padding: '0.85rem 1rem', borderRadius: '1rem' }}>
          <StickyNote size={18} color="var(--color-primary)" />
          <input 
            type="text" 
            placeholder="Ej: Práctica de tiros libres..." 
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            disabled={usuario?.rol === 'ADMINISTRADOR'}
            style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', color: 'var(--color-primary)', fontWeight: 700, opacity: usuario?.rol === 'ADMINISTRADOR' ? 0.6 : 1 }}
          />
        </div>
      </section>

      {/* BUSCADOR */}
      <div style={{ marginBottom: '1.25rem', padding: '0 1rem' }}>
        <div style={{ background: 'white', border: '1px solid var(--color-surface-container-high)', borderRadius: '1rem', padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Search size={18} color="var(--color-outline)" />
          <input 
            type="text" 
            placeholder="Filtrar por nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'var(--color-on-surface)', fontWeight: 600 }} 
          />
        </div>
      </div>

      {/* LISTA DE ALUMNOS */}
      <div className="flex-column" style={{ gap: '0.75rem', padding: '0 1rem 2rem' }}>
        {alumnosFiltrados.map((alumno) => {
          const isActive = alumno.estado !== null;
          return (
            <div key={alumno.id} className="bento-card" style={{ 
              padding: '1.25rem',
              borderLeft: `6px solid ${getStatusColor(alumno.estado)}`,
              display: 'flex', flexDirection: 'column', gap: '1rem',
              background: 'white'
            }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ 
                    width: '3.5rem', height: '3.5rem', borderRadius: '1.2rem', 
                    background: getStatusColor(alumno.estado),
                    color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '1.2rem'
                  }}>
                     {getInitials(alumno.nombre)}
                  </div>
                  <div style={{ flex: 1 }}>
                     <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{alumno.nombre} {alumno.apellido}</h3>
                     <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-outline)' }}>{alumno.grado}</span>
                  </div>
               </div>

               <div style={{ display: 'flex', background: 'var(--color-surface-dim)', borderRadius: '1rem', padding: '0.4rem', gap: '0.4rem' }}>
                  {['PRESENTE', 'AUSENTE', 'JUSTIFICADO'].map(label => {
                    const isS = alumno.estado === label;
                    return (
                      <button 
                        key={label}
                        onClick={() => handleMarcar(alumno.id, label)} 
                        style={{
                          flex: 1, padding: '0.6rem 0', borderRadius: '0.75rem', border: 'none',
                          background: isS ? getStatusColor(label) : 'transparent',
                          color: isS ? 'white' : 'var(--color-primary)',
                          fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase'
                        }}>
                        {label.slice(0, 5)}
                      </button>
                    );
                  })}
               </div>

               {alumno.estado === 'JUSTIFICADO' && (
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.75rem', 
                    background: 'var(--color-surface-container-low)', 
                    padding: '0.75rem 1rem', borderRadius: '1rem'
                  }}>
                     <StickyNote size={14} color="var(--color-secondary)" />
                     <input 
                       type="text"
                       placeholder="Observación..."
                       value={alumno.observacion}
                       onChange={(e) => updateObservacion(alumno.id, e.target.value)}
                       style={{ 
                         flex: 1, border: 'none', background: 'transparent', outline: 'none',
                         fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700
                       }}
                     />
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {usuario?.rol === 'ADMINISTRADOR' ? (
        <div style={{ position: 'fixed', bottom: '6.5rem', left: 0, width: '100%', padding: '0 1.25rem', zIndex: 90, display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            width: '100%', maxWidth: '448px', padding: '1rem', background: 'var(--color-secondary-container)', 
            color: 'var(--color-secondary)', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '0.9rem',
            border: '1px solid var(--color-secondary)'
          }}>
            <ShieldAlert size={20} /> Modo Reporte: Solo lectura para administrador.
          </div>
        </div>
      ) : (
        <div style={{ position: 'fixed', bottom: '6.5rem', left: 0, width: '100%', padding: '0 1.25rem', zIndex: 90, display: 'flex', justifyContent: 'center' }}>
          <button className="btn" style={{ 
               width: '100%', maxWidth: '448px', padding: '1.25rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', 
               boxShadow: '0 12px 32px rgba(29, 40, 72, 0.4)',
               background: 'var(--color-primary)',
               color: 'white', border: 'none', borderRadius: '1.25rem',
               opacity: saving ? 0.7 : 1, cursor: 'pointer'
            }} 
            disabled={saving}
            onClick={guardarCambios}>
             {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
             {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>  
        </div>
      )}
    </div>
  );
}
