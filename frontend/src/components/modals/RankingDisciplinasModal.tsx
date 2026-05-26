import React from 'react';
import { X } from 'lucide-react';
import type { ClubMetrica } from '../../types';
import { Pagination } from '../ui/Pagination';

interface RankingDisciplinasModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubesRanking: ClubMetrica[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onNavigateToHistory: (id: number) => void;
}

export const RankingDisciplinasModal: React.FC<RankingDisciplinasModalProps> = ({
  isOpen,
  onClose,
  clubesRanking,
  currentPage,
  onPageChange,
  onNavigateToHistory,
}) => {
  if (!isOpen) return null;

  const ITEMS_PER_PAGE = 4;
  const paginated = clubesRanking.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(clubesRanking.length / ITEMS_PER_PAGE);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem'
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '1.25rem', width: '100%', maxWidth: '550px',
        overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-surface-container-high)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>Ranking de Disciplinas</h3>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-outline)', fontWeight: 700, textTransform: 'uppercase' }}>Por Nivel de Asistencia</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'var(--color-surface-dim)', border: 'none', width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {paginated.map((club, i) => {
            const rank = (currentPage - 1) * ITEMS_PER_PAGE + i + 1;
            return (
              <div key={club.id} style={{
                padding: '1.25rem', borderRadius: '1.1rem', background: 'white',
                display: 'flex', alignItems: 'center', gap: '1rem',
                border: '1px solid var(--color-surface-container-low)',
                transition: 'all 0.2s ease'
              }} className="ranking-item">
                <div style={{
                  width: '2.8rem', height: '2.8rem', borderRadius: '0.9rem',
                  background: rank <= 3 ? 'var(--grad-gold)' : 'var(--color-surface-dim)',
                  color: rank <= 3 ? 'white' : 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900,
                  fontSize: '1.1rem'
                }}>
                  {rank}
                </div>
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onNavigateToHistory(club.id)}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                    {club.nombre}
                  </p>
                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 600 }}>{club.profesor}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 800, opacity: 0.6 }}>• {club.inscritos} alumnos</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-primary)', lineHeight: 1 }}>
                    {club.asistencia}%
                  </span>
                  <span style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--color-outline)', textTransform: 'uppercase' }}>Asistencia</span>
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: '0.5rem' }}>
            <Pagination current={currentPage} total={totalPages} onChange={onPageChange} />
          </div>
        </div>
      </div>
      <style>{`
        .ranking-item:hover {
          transform: scale(1.01);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  );
};
