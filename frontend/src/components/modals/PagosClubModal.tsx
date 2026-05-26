import React, { useState } from 'react';
import { X, Check, Clock, Search, CreditCard, ChevronDown, FileText } from 'lucide-react';
import type { Pago } from '../../types';
import { iconBtnStyle, inputStyle } from '../../styles/adminStyles';
import { estadoColor } from '../../utils/constants';

interface PagosClubModalProps {
  isOpen: boolean;
  clubId: number;
  clubNombre: string;
  pagos: Pago[];
  onAction: (pago: Pago, type: 'VALIDAR' | 'RECHAZAR') => void;
  onShowImage: (url: string) => void;
  onClose: () => void;
}

export function PagosClubModal({
  isOpen,
  clubNombre,
  pagos,
  onAction,
  onShowImage,
  onClose,
}: PagosClubModalProps) {
  if (!isOpen) return null;
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPagoId, setExpandedPagoId] = useState<number | null>(null);

  const clubPagos = pagos
    .filter((p) => p.club.nombre === clubNombre)
    .filter((p) =>
      `${p.alumno.nombre} ${p.alumno.apellido}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  const pagados = clubPagos.filter((p) => p.estado === 'PAGADO');
  const pendientes = clubPagos.filter((p) => p.estado === 'PENDIENTE');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: '2rem',
          padding: '2rem',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 900,
                color: 'var(--color-primary)',
                letterSpacing: '-0.04em',
              }}
            >
              Pagos:{' '}
              <span style={{ color: 'var(--color-secondary)' }}>{clubNombre}</span>
            </h3>
            <p
              style={{
                margin: '0.25rem 0 0',
                fontSize: '0.8rem',
                color: 'var(--color-outline)',
                fontWeight: 700,
              }}
            >
              Control financiero detallado de la disciplina
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--color-surface-dim)',
              border: 'none',
              borderRadius: '1rem',
              width: '2.5rem',
              height: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={20} color="var(--color-primary)" />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              background: 'var(--color-success-container)',
              padding: '1rem',
              borderRadius: '1.2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  color: 'var(--color-success)',
                  textTransform: 'uppercase',
                }}
              >
                Realizados
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: 'var(--color-success)',
                }}
              >
                {pagados.length}
              </p>
            </div>
            <Check size={24} color="var(--color-success)" style={{ opacity: 0.3 }} />
          </div>
          <div
            style={{
              background: 'var(--color-error-container)',
              padding: '1rem',
              borderRadius: '1.2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  color: 'var(--color-error)',
                  textTransform: 'uppercase',
                }}
              >
                Pendientes
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: 'var(--color-error)',
                }}
              >
                {pendientes.length}
              </p>
            </div>
            <Clock size={24} color="var(--color-error)" style={{ opacity: 0.3 }} />
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de alumno..."
            style={{
              ...inputStyle,
              paddingLeft: '2.8rem',
              borderRadius: '1.1rem',
              background: 'var(--color-surface-container-lowest)',
            }}
          />
          <Search
            size={18}
            color="var(--color-outline)"
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {clubPagos.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'var(--color-outline)',
                fontStyle: 'italic',
              }}
            >
              No se encontraron pagos vinculados a este filtro.
            </div>
          ) : (
            clubPagos.map((p) => {
              const colors = (estadoColor as any)[p.estado];
              const isExpanded = expandedPagoId === p.id;
              return (
                <div
                  key={p.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '1.25rem',
                    background: isExpanded
                      ? 'white'
                      : 'var(--color-surface-container-lowest)',
                    border: isExpanded
                      ? '1.5px solid var(--color-primary)'
                      : '1px solid var(--color-surface-container-low)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    boxShadow: isExpanded ? 'var(--shadow-md)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => setExpandedPagoId(isExpanded ? null : p.id)}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}
                    >
                      <div
                        style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '0.85rem',
                          background: isExpanded
                            ? 'var(--color-primary-container)'
                            : colors.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <CreditCard
                          size={18}
                          color={isExpanded ? 'white' : colors.fg}
                        />
                      </div>
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            color: 'var(--color-primary)',
                          }}
                        >
                          {p.alumno.nombre} {p.alumno.apellido}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.7rem',
                            color: 'var(--color-outline)',
                            fontWeight: 700,
                          }}
                        >
                          {p.mes} • S/ {(p.monto ?? 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {p.estado === 'PENDIENTE' ? (
                        <div
                          style={{ display: 'flex', gap: '0.35rem' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onAction(p, 'VALIDAR')}
                            style={iconBtnStyle(
                              'var(--color-success-container)',
                              'var(--color-success)'
                            )}
                          >
                            <Check size={16} strokeWidth={3} />
                          </button>
                          <button
                            onClick={() => onAction(p, 'RECHAZAR')}
                            style={iconBtnStyle(
                              'var(--color-error-container)',
                              'var(--color-error)'
                            )}
                          >
                            <X size={16} strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 900,
                            color: colors.fg,
                            textTransform: 'uppercase',
                            background: colors.bg,
                            padding: '0.25rem 0.6rem',
                            borderRadius: '99px',
                          }}
                        >
                          {p.estado}
                        </span>
                      )}
                      <ChevronDown
                        size={14}
                        color="var(--color-outline)"
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s',
                        }}
                      />
                    </div>
                  </div>

                  {/* SECCIÓN EXPANDIBLE */}
                  {isExpanded && (
                    <div
                      className="animate-enter"
                      style={{
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px dashed var(--color-surface-container-high)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        style={{
                          background: 'var(--color-surface-container-low)',
                          borderRadius: '1rem',
                          overflow: 'hidden',
                          border: '1px solid var(--color-surface-container-high)',
                          minHeight: '150px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {p.urlComprobante ? (
                          <img
                            src={p.urlComprobante.replace(
                              '/upload/',
                              '/upload/w_600,c_limit,q_auto,f_auto/'
                            )}
                            alt="Comprobante"
                            style={{
                              width: '100%',
                              display: 'block',
                              objectFit: 'contain',
                              maxHeight: '300px',
                              cursor: 'zoom-in',
                            }}
                            onClick={() => onShowImage(p.urlComprobante!)}
                            onError={(e) => {
                              (e.target as any).src =
                                'https://placehold.co/400x300?text=Error+al+cargar+imagen';
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              textAlign: 'center',
                              padding: '1.5rem',
                              color: 'var(--color-outline)',
                            }}
                          >
                            <FileText
                              size={32}
                              opacity={0.2}
                              style={{ marginBottom: '0.25rem' }}
                            />
                            <p style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                              Sin comprobante
                            </p>
                          </div>
                        )}
                      </div>
                      {p.observacion && (
                        <div
                          style={{
                            background: 'var(--color-surface-container-low)',
                            padding: '0.75rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--color-surface-container-high)',
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: '0.7rem',
                              color: 'var(--color-on-surface-variant)',
                              fontStyle: 'italic',
                              fontWeight: 600,
                            }}
                          >
                            Motivo: “{p.observacion}”
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
