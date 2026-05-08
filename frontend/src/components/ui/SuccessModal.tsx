import React from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function SuccessModal({ isOpen, onClose, title, message }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '2rem',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          width: '100%',
          maxWidth: '400px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            margin: '0 0 1rem',
            fontSize: '1.5rem',
            fontWeight: 900,
            color: 'var(--color-primary)',
          }}
        >
          {title}
        </h3>
        <p style={{ margin: '0 0 2rem', color: 'var(--color-outline)', fontWeight: 600 }}>
          {message}
        </p>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '1rem',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
