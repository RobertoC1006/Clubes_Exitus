import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Check, X, ArrowLeft, Loader2, StickyNote, Calendar, ShieldAlert } from 'lucide-react';
import { useUser } from './UserContext';
import './index.css';
import { API_BASE_URL } from './config';

const API = API_BASE_URL;

export default function DetalleSesion() {
  const navigate = useNavigate();
  const { clubId, sesionId } = useParams();
  const [sesion, setSesion] = useState<any>(null);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${API}/sesiones/${sesionId}`)
      .then(res => res.json())
      .then(data => {
        setSesion(data);
        
        // Mapear asistencias de la sesión
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

  const getStatusColor = (estado: string | null) => {
    if(estado === 'PRESENTE') return 'var(--color-success)';
    if(estado === 'AUSENTE') return 'var(--color-error)';
    if(estado === 'JUSTIFICADO') return 'var(--color-secondary)';
    return 'var(--color-surface-container-high)';
  };

  const getInitials = (nombre: string) => {
    if (!nombre) return '?';
    const parts = nombre.split(' ');
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
    <div className="animate-enter" style={{ paddingBottom: '4rem' }}>
      
      {/* HEADER */}
      <section style={{ padding: '1.5rem 1rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'var(--color-surface-dim)', border: 'none', borderRadius: '1rem', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <ArrowLeft size={24} color="var(--color-primary)" />
          </button>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.05em', lineHeight: 1 }}>Detalle de <br/> <span style={{ color: 'var(--color-secondary)' }}>Sesión Registrada</span></h2>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-outline)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} /> {fechaFormat}
            </p>
          </div>
        </div>

        <div style={{ 
          background: 'var(--color-surface-container-low)', padding: '1rem', borderRadius: '1.25rem', border: '1px solid var(--color-surface-container-high)',
          display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem'
        }}>
           <ShieldAlert size={18} color="var(--color-primary)" />
           <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>Vista de Historial: Esta sesión es de solo lectura.</p>
        </div>
      </section>

      {/* BUSCADOR */}
      <div style={{ marginBottom: '1.25rem', padding: '0 1rem' }}>
        <div style={{ background: 'white', border: '1px solid var(--color-surface-container-high)', borderRadius: '1.25rem', padding: '0.85rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
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

      {/* LISTA DE ALUMNOS (MODO LECTURA) */}
      <div className="flex-column" style={{ gap: '0.85rem', padding: '0 1rem' }}>
        {alumnosFiltrados.map((alumno) => (
          <div key={alumno.id} className="glass-card" style={{ 
            padding: '1.25rem',
            borderLeft: `6px solid ${getStatusColor(alumno.estado)}`,
            display: 'flex', flexDirection: 'column', gap: '1rem',
            background: 'white', borderRadius: '1.5rem'
          }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ 
                  width: '3.5rem', height: '3.5rem', borderRadius: '1.1rem', 
                  background: getStatusColor(alumno.estado),
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '1.2rem'
                }}>
                   {getInitials(alumno.nombre)}
                </div>
                <div style={{ flex: 1 }}>
                   <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{alumno.nombre} {alumno.apellido}</h3>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                     <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'white', background: getStatusColor(alumno.estado), padding: '0.2rem 0.6rem', borderRadius: '99px', textTransform: 'uppercase' }}>
                       {alumno.estado}
                     </span>
                     <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-outline)' }}>{alumno.grado}</span>
                   </div>
                </div>
             </div>

             {alumno.observacion && (
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.75rem', 
                  background: 'var(--color-surface-dim)', 
                  padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-surface-container-high)'
                }}>
                   <StickyNote size={16} color="var(--color-secondary)" />
                   <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700, fontStyle: 'italic' }}>
                     "{alumno.observacion}"
                   </p>
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
