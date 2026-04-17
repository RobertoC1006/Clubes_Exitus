import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Filter, Check, X, Info, ArrowLeft, Send } from 'lucide-react';
import './index.css';

// Mock Alumnos
const ALUMNOS_MOCKS = [
  { id: 1024, nombre: 'Alejandro Benitez', grado: '10º A', estado: 'PRESENTE' },
  { id: 1025, nombre: 'Valentina Morales', grado: '10º A', estado: 'AUSENTE' },
  { id: 1026, nombre: 'Gabriel Castillo', grado: '10º A', estado: null },
  { id: 1027, nombre: 'Diego Fernandez', grado: '10º B', estado: null },
  { id: 1028, nombre: 'Sofía Castro', grado: '10º A', estado: 'JUSTIFICADO' },
  { id: 1029, nombre: 'Mateo Rodríguez', grado: '10º A', estado: 'PRESENTE' }
];

export default function PaseLista() {
  const navigate = useNavigate();
  const { clubId } = useParams();
  
  const [alumnos, setAlumnos] = useState(ALUMNOS_MOCKS);
  const marcados = alumnos.filter(a => a.estado !== null).length;
  const faltan = alumnos.length - marcados;

  const handleMarcar = (id: number, estado: string) => {
    setAlumnos(prev => prev.map(a => a.id === id ? { ...a, estado } : a));
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

      {/* SECCIÓN DE LISTA */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, background: 'var(--color-surface-container-lowest)', borderRadius: '0.75rem', padding: '0.6rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <Search size={18} color="var(--color-outline-variant)" />
          <input type="text" placeholder="Buscar por apellido o ID..." style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'var(--color-on-surface)' }} />
        </div>
        <button style={{ background: 'var(--color-surface-container-lowest)', padding: '0.6rem 0.75rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <Filter size={18} color="var(--color-primary)" />
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
                   <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>{alumno.nombre}</h3>
                   <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-outline)' }}>#{alumno.id} • {alumno.grado}</p>
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
             color: 'white', border: 'none', borderRadius: '1rem'
          }} onClick={() => {
           if (faltan > 0) alert(`Aún faltan ${faltan} alumnos por marcar.`);
           else alert('¡Asistencia Guardada (Imagina esto sincronizándose en offline mode)!');
        }}>
           {faltan === 0 ? <Check size={18} /> : <Send size={18} />} 
           {faltan === 0 ? 'Guardar Asistencia' : `Finalizar Registro`}
        </button>  
      </div>

    </div>
  );
}
