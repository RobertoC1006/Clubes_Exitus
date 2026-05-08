import React from 'react';
import { X, Users } from 'lucide-react';
import type { Profesor } from '../../types';
import { Pagination } from '../ui/Pagination';

interface ProfesoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  profesores: Profesor[];
  currentPage: number;
  onPageChange: (page: number) => void;
  formatHorarioShort: (horario: any) => string;
}

export const ProfesoresModal: React.FC<ProfesoresModalProps> = ({
  isOpen,
  onClose,
  profesores,
  currentPage,
  onPageChange,
  formatHorarioShort,
}) => {
  if (!isOpen) return null;

  const ITEMS_PER_PAGE = 4;
  const paginated = profesores.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(profesores.length / ITEMS_PER_PAGE);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '1.25rem', width: '100%', maxWidth: '550px',
        overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-surface-container-high)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              Staff <span style={{ color: 'var(--color-secondary)' }}>Docente</span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 600 }}>Gestión de Docentes</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'var(--color-surface-dim)', border: 'none', width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {profesores.length > 0 ? (
              <>
                {paginated.map((prof) => (
                  <div key={prof.id} style={{
                    padding: '1.1rem', borderRadius: '1.5rem', background: 'white',
                    border: '1px solid var(--color-surface-container-low)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: '3rem', height: '3rem', borderRadius: '1rem', background: 'var(--color-surface-dim)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-primary)'
                      }}>
                        {prof.nombre.charAt(0)}{prof.apellido.charAt(0)}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 900, fontSize: '1.05rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{prof.nombre} {prof.apellido}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 700 }}>
                          DNI: {prof.dni || '---'} • Cel: {prof.celular || '---'}
                        </p>
                      </div>
                    </div>

                    <div style={{
                      background: 'var(--color-surface-container-lowest)', padding: '0.8rem 1rem',
                      borderRadius: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem',
                      border: '1px solid var(--color-surface-container-low)'
                    }}>
                      {prof.clubes && prof.clubes.length > 0 ? prof.clubes.map((c: any) => (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-secondary)' }}></div>
                            <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--color-primary)' }}>{c.nombre}</span>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-outline)', background: 'white', padding: '0.15rem 0.5rem', borderRadius: '0.4rem', border: '1px solid var(--color-surface-container-high)' }}>
                            {formatHorarioShort(c.horario)}
                          </span>
                        </div>
                      )) : (
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-outline)', fontStyle: 'italic', textAlign: 'center' }}>Sin clubes asignados</p>
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
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Users size={48} color="var(--color-surface-container-high)" style={{ marginBottom: '1rem' }} />
                <p style={{ margin: 0, color: 'var(--color-outline)', fontWeight: 600 }}>No hay profesores registrados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
