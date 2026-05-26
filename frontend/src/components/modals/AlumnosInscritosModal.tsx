import React from 'react';
import { X, Users } from 'lucide-react';
import type { Alumno } from '../../types';
import { Pagination } from '../ui/Pagination';

interface AlumnosInscritosModalProps {
  isOpen: boolean;
  onClose: () => void;
  alumnos: Alumno[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const AlumnosInscritosModal: React.FC<AlumnosInscritosModalProps> = ({
  isOpen,
  onClose,
  alumnos,
  searchTerm,
  onSearchChange,
  currentPage,
  onPageChange,
}) => {
  if (!isOpen) return null;

  const filtered = alumnos.filter(a => 
    `${a.nombre} ${a.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const ITEMS_PER_PAGE = 4;
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '1.5rem', width: '100%', maxWidth: '550px',
        overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-surface-container-high)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              Alumnos <span style={{ color: 'var(--color-secondary)' }}>Inscritos</span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 600 }}>Vista General de Estudiantes</p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--color-surface-dim)', border: 'none', width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Buscar alumno..."
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: '1rem',
                border: '1.5px solid var(--color-surface-container-high)',
                fontSize: '0.85rem', fontWeight: 600, outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-outline)' }}>
                <Users size={48} strokeWidth={1} style={{ opacity: 0.3 }} />
                <p style={{ marginTop: '1rem', fontWeight: 600 }}>No se encontraron alumnos</p>
              </div>
            ) : (
              <>
                {paginated.map(alumno => (
                  <div key={alumno.id} style={{
                    padding: '1.1rem', borderRadius: '1.25rem', background: 'var(--color-surface-container-lowest)',
                    border: '1px solid var(--color-surface-container-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'transform 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{
                        width: '3.2rem', height: '3.2rem', borderRadius: '1rem',
                        background: 'var(--grad-secondary)', color: 'var(--color-on-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem'
                      }}>
                        {(alumno.nombre[0] + (alumno.apellido[0] ?? '')).toUpperCase()}
                      </div>

                      <div>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                          {alumno.nombre} {alumno.apellido}
                        </p>
                        <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 700 }}>
                          {alumno.grado} • {alumno.padre ? `Padre: ${alumno.padre.nombre}` : 'Sin tutor'}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '200px' }}>
                      {alumno.inscripciones.length > 0 ? alumno.inscripciones.map((ins, idx) => (
                        <span key={idx} style={{
                          fontSize: '0.6rem', fontWeight: 900, background: 'var(--color-primary-container)',
                          color: 'white', padding: '0.25rem 0.6rem', borderRadius: '99px', textTransform: 'uppercase'
                        }}>
                          {ins.club.nombre}
                        </span>
                      )) : (
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-error)', fontStyle: 'italic' }}>
                          Sin clubes
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <Pagination
                  current={currentPage}
                  total={totalPages}
                  onChange={onPageChange}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
