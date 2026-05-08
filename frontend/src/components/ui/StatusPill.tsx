import React from 'react';

interface StatusPillProps {
  icon?: React.ReactNode;
  label: string;
  color?: string;
  bg?: string;
}

export function StatusPill({ icon, label, color, bg }: StatusPillProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: bg || 'var(--color-surface-container-high)',
        color: color || 'var(--color-primary)',
        padding: '0.3rem 0.7rem',
        borderRadius: '99px',
        fontSize: '0.7rem',
        fontWeight: 800,
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
        border: '1px solid rgba(0,0,0,0.02)',
      }}
    >
      {icon} <span>{label}</span>
    </div>
  );
}
