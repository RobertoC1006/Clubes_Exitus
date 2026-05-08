import React from 'react';
import { X } from 'lucide-react';
import { labelStyle, inputStyle } from '../../styles/adminStyles';

interface PaymentActionModalProps {
  show: boolean;
  type: 'VALIDAR' | 'RECHAZAR';
  pago: any;
  observacion: string;
  onObservacionChange: (val: string) => void;
  onConfirm: (id: number, estado: string, observacion: string) => void;
  onClose: () => void;
}

export function PaymentActionModal({
  show,
  type,
  pago,
  observacion,
  onObservacionChange,
  onConfirm,
  onClose,
}: PaymentActionModalProps) {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '1.25rem',
          width: '100%',
          maxWidth: '420px',
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
          <h2
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-primary)',
            }}
          >
            {type === 'VALIDAR' ? 'Validar Pago' : 'Rechazar Pago'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-outline)',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: 'var(--color-outline)',
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            ¿Deseas {type === 'VALIDAR' ? 'validar' : 'rechazar'} el pago de
            <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
              {' '}
              {pago?.alumno.nombre}
            </span>
            ?
          </p>

          {type === 'RECHAZAR' && (
            <div style={{ marginTop: '1.25rem' }}>
              <label style={{ ...labelStyle, fontSize: '0.7rem' }}>
                MOTIVO DEL RECHAZO
              </label>
              <textarea
                value={observacion}
                onChange={(e) => onObservacionChange(e.target.value)}
                placeholder="Ej: El comprobante no es legible..."
                style={{
                  ...inputStyle,
                  height: '80px',
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  resize: 'none',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          )}
        </div>

        <div
          style={{
            padding: '1rem 1.5rem 1.5rem',
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--color-surface-container-high)',
              background: 'white',
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(pago.id, type === 'VALIDAR' ? 'PAGADO' : 'RECHAZADO', observacion)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '0.75rem',
              border: 'none',
              background:
                type === 'VALIDAR' ? 'var(--color-success)' : 'var(--color-error)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
