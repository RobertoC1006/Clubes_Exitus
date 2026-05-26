import React from 'react';
import { X, Award, AlertTriangle, History } from 'lucide-react';
import { Pagination } from '../ui/Pagination';

interface RetencionModalProps {
  isOpen: boolean;
  metricas: any;
  rankingSubTab: 'asistencias' | 'ausencias' | 'justificaciones';
  currentPage: number;
  setRankingSubTab: (tab: 'asistencias' | 'ausencias' | 'justificaciones') => void;
  onPageChange: (page: number) => void;
  onClose: () => void;
}

export function RetencionModal({
  isOpen,
  metricas,
  rankingSubTab,
  currentPage,
  setRankingSubTab,
  onPageChange,
  onClose,
}: RetencionModalProps) {
  if (!isOpen || !metricas) return null;
  const currentThemeColor =
    rankingSubTab === 'asistencias'
      ? 'var(--color-success)'
      : rankingSubTab === 'ausencias'
      ? 'var(--color-error)'
      : '#EAB308';

  const dataKey =
    rankingSubTab === 'asistencias'
      ? 'rankingAsistencias'
      : rankingSubTab === 'ausencias'
      ? 'rankingAusencias'
      : 'rankingJustificaciones';
  const list = metricas[dataKey] || [];
  const paginated = list.slice(
    (currentPage - 1) * 4,
    currentPage * 4
  );
  const totalPages = Math.ceil(list.length / 4);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '1.25rem',
          width: '100%',
          maxWidth: '650px',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-surface-container-high)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--color-primary)',
              }}
            >
              Análisis de <span style={{ color: 'var(--color-secondary)' }}>Retención</span>
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '0.75rem',
                color: 'var(--color-outline)',
                fontWeight: 600,
              }}
            >
              Asistencia y Tendencias
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--color-surface-dim)',
              border: 'none',
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Centered Pill Switcher for Rankings */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <div
              style={{
                display: 'flex',
                background: 'var(--color-surface-container-low)',
                padding: '0.3rem',
                borderRadius: '1.5rem',
                gap: '0.2rem',
                border: '1px solid var(--color-surface-container-high)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              {[
                {
                  id: 'asistencias',
                  label: 'Asistencias',
                  color: 'var(--color-success)',
                  icon: <Award size={16} />,
                },
                {
                  id: 'ausencias',
                  label: 'Ausencias',
                  color: 'var(--color-error)',
                  icon: <AlertTriangle size={16} />,
                },
                {
                  id: 'justificaciones',
                  label: 'Justificaciones',
                  color: '#EAB308',
                  icon: <History size={16} />,
                },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setRankingSubTab(st.id as any);
                    onPageChange(1);
                  }}
                  title={st.label}
                  style={{
                    padding: '1rem',
                    borderRadius: '1.2rem',
                    border: 'none',
                    cursor: 'pointer',
                    background: rankingSubTab === st.id ? st.color : 'transparent',
                    color: rankingSubTab === st.id ? 'white' : 'var(--color-outline)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow:
                      rankingSubTab === st.id ? `0 4px 12px ${st.color}44` : 'none',
                    width: '3.5rem',
                    height: '3.5rem',
                  }}
                >
                  {st.icon}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {list.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  background: 'var(--color-surface-container-lowest)',
                  borderRadius: '1.5rem',
                  border: '1.5px dashed var(--color-surface-container-high)',
                }}
              >
                <p style={{ margin: 0, color: 'var(--color-outline)', fontWeight: 600 }}>
                  No hay datos suficientes para generar este ranking.
                </p>
              </div>
            ) : (
              <>
                {paginated.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="ranking-item"
                    style={{
                      padding: '1.25rem',
                      borderRadius: '1.5rem',
                      background: 'white',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid var(--color-surface-container-low)',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '2.8rem',
                          height: '2.8rem',
                          borderRadius: '1rem',
                          background: 'var(--color-surface-dim)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '1.1rem',
                          color: currentThemeColor,
                          border: `2px solid ${currentThemeColor}11`,
                        }}
                      >
                        {(currentPage - 1) * 4 + i + 1}
                      </div>

                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 800,
                            fontSize: '1.05rem',
                            color: 'var(--color-primary)',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {item.alumno}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.8rem',
                            color: 'var(--color-outline)',
                            fontWeight: 700,
                          }}
                        >
                          {item.club}
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: 'right',
                        background: 'var(--color-surface-dim)',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '1.2rem',
                        border: '1px solid var(--color-surface-container-high)',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: '1.35rem',
                          fontWeight: 900,
                          color: currentThemeColor,
                          letterSpacing: '-0.03em',
                        }}
                      >
                        {item.cuenta}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.6rem',
                          fontWeight: 900,
                          color: 'var(--color-outline)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Registros
                      </p>
                    </div>
                  </div>
                ))}
                <style>{`
                  .ranking-item:hover {
                    transform: translateX(5px);
                    border-color: ${currentThemeColor}33;
                    background: var(--color-surface-container-lowest);
                  }
                `}</style>
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
}
