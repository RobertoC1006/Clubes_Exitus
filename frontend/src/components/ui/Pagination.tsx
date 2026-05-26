import { ChevronRight } from 'lucide-react';

interface PaginationProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ current, total, onChange }: PaginationProps) {
  if (total <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '1.5rem',
        padding: '1rem 0',
      }}
    >
      <button
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        style={{
          background:
            current === 1
              ? 'var(--color-surface-container-lowest)'
              : 'var(--color-surface-container-high)',
          color: 'var(--color-primary)',
          border: 'none',
          borderRadius: '0.6rem',
          padding: '0.45rem',
          opacity: current === 1 ? 0.3 : 1,
          width: '2.2rem',
          height: '2.2rem',
          cursor: current === 1 ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: current === 1 ? 'none' : 'var(--shadow-sm)',
        }}
      >
        <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
      </button>

      <div
        style={{
          background: 'var(--color-surface-container-low)',
          padding: '0.44rem 1rem',
          borderRadius: '99px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
        }}
      >
        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-primary)' }}>
          {current}
        </span>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--color-outline)',
            opacity: 0.5,
          }}
        >
          /
        </span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-outline)' }}>
          {total}
        </span>
      </div>

      <button
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        style={{
          background:
            current === total
              ? 'var(--color-surface-container-lowest)'
              : 'var(--color-surface-container-high)',
          color: 'var(--color-primary)',
          border: 'none',
          borderRadius: '0.6rem',
          padding: '0.45rem',
          opacity: current === total ? 0.3 : 1,
          width: '2.2rem',
          height: '2.2rem',
          cursor: current === total ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: current === total ? 'none' : 'var(--shadow-sm)',
        }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
