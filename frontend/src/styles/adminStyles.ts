import React from 'react';

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.72rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-on-surface-variant)',
  marginBottom: '0.35rem',
};

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.85rem',
  border: '1.5px solid var(--color-surface-container-high)',
  background: 'var(--color-surface-container-lowest)',
  fontSize: '0.9rem',
  color: 'var(--color-primary)',
  outline: 'none',
  boxSizing: 'border-box',
};

export const timeInputStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid var(--color-primary-container)',
  borderRadius: '0.4rem',
  padding: '0.15rem 0.35rem',
  fontSize: '0.75rem',
  fontWeight: 800,
  color: 'var(--color-primary)',
  outline: 'none',
};

export function iconBtnStyle(bg: string, color: string): React.CSSProperties {
  return {
    background: bg,
    color,
    border: 'none',
    borderRadius: '0.6rem',
    padding: '0.45rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

export const metricaCardStyle: React.CSSProperties = {
  background: 'var(--color-surface-container-lowest)',
  borderRadius: '1.5rem',
  padding: '1.25rem',
  boxShadow: '0 8px 24px rgba(14,26,57,0.06)',
  border: '1px solid var(--color-surface-container-high)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  transition: 'transform 0.2s ease',
};

export const metricaLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.65rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'var(--color-on-surface-variant)',
};

export const metricaValueStyle: React.CSSProperties = {
  margin: '0.2rem 0 0',
  fontSize: '2.5rem',
  fontWeight: 900,
  color: 'var(--color-primary)',
  lineHeight: 1,
  letterSpacing: '-0.05em',
};
