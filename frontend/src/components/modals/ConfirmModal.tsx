import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  type: 'DANGER' | 'WARNING' | 'SUCCESS';
  onConfirm: () => void;
  onClose: () => void;
  icon?: React.ReactNode;
  isAlert?: boolean;
}

export function ConfirmModal({
  show,
  title,
  message,
  type,
  onConfirm,
  onClose,
  icon,
  isAlert,
}: ConfirmModalProps) {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
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
          borderRadius: '2.5rem',
          width: '100%',
          maxWidth: '450px',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
        className="animate-pop"
      >
        <div
          style={{
            width: '5.5rem',
            height: '5.5rem',
            borderRadius: '2.2rem',
            background:
              type === 'DANGER'
                ? 'var(--color-error-container)'
                : type === 'SUCCESS'
                ? 'var(--color-success-container)'
                : 'var(--color-warning-container)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          {icon ||
            (type === 'DANGER' ? (
              <AlertCircle size={36} color="var(--color-error)" />
            ) : (
              <AlertCircle size={36} color="var(--color-warning)" />
            ))}
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: '1.8rem',
            fontWeight: 900,
            color: 'var(--color-primary)',
            letterSpacing: '-0.04em',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: '1rem 0 2rem',
            fontSize: '1rem',
            color: 'var(--color-outline)',
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {!isAlert && (
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '1.1rem',
                borderRadius: '1.25rem',
                border: 'none',
                background: 'var(--color-surface-dim)',
                color: 'var(--color-primary)',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          )}
          <button
            onClick={onConfirm}
            style={{
              flex: 1.5,
              padding: '1.1rem',
              borderRadius: '1.25rem',
              border: 'none',
              background:
                type === 'DANGER'
                  ? 'var(--color-error)'
                  : type === 'SUCCESS'
                  ? 'var(--color-success)'
                  : 'var(--color-warning)',
              color: 'white',
              fontWeight: 900,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            }}
          >
            {isAlert ? 'Entendido' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
