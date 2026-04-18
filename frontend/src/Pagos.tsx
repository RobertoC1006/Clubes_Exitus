import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, CheckCircle2, Clock, AlertCircle, ArrowUpRight, Receipt } from 'lucide-react';
import './index.css';

const MOCK_PAGOS = [
  { mes: 'Abril 2026',     monto: 'Q150.00', estado: 'PAGADO',    fecha: '01/04/2026', club: 'Fútbol Selección' },
  { mes: 'Marzo 2026',     monto: 'Q150.00', estado: 'PAGADO',    fecha: '01/03/2026', club: 'Fútbol Selección' },
  { mes: 'Febrero 2026',   monto: 'Q150.00', estado: 'PAGADO',    fecha: '01/02/2026', club: 'Fútbol Selección' },
  { mes: 'Mayo 2026',      monto: 'Q100.00', estado: 'PENDIENTE', fecha: 'Vence 01/05', club: 'Robótica e IA' },
];

const estadoConfig: Record<string, { bg: string; color: string; icon: any; label: string }> = {
  PAGADO:   { bg: 'var(--color-success-container, #d4f5e2)', color: 'var(--color-success)',  icon: CheckCircle2, label: 'Pagado'   },
  PENDIENTE:{ bg: 'var(--color-secondary-container)',        color: 'var(--color-secondary)', icon: Clock,        label: 'Pendiente'},
  VENCIDO:  { bg: 'var(--color-error-container)',            color: 'var(--color-error)',    icon: AlertCircle,  label: 'Vencido' },
};

export default function Pagos() {
  const totalPendiente = MOCK_PAGOS.filter(p => p.estado === 'PENDIENTE').reduce((s, p) => s + parseFloat(p.monto.replace('Q','')), 0);

  return (
    <div className="app-container animate-enter" style={{ padding: '1.25rem', paddingBottom: '7rem' }}>

      {/* HERO */}
      <section style={{ marginBottom: '2rem' }}>
        <span style={{ color: 'var(--color-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>
          Finanzas
        </span>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em', lineHeight: 1, margin: '0.25rem 0 0.5rem 0' }}>
          Mis Pagos
        </h2>
        <p style={{ margin: 0, color: 'var(--color-on-surface-variant)', fontSize: '0.9rem', fontWeight: 500 }}>
          Control de mensualidades y comprobantes
        </p>
      </section>

      {/* TARJETA RESUMEN */}
      {totalPendiente > 0 ? (
        <div style={{ background: 'var(--color-secondary-container)', borderRadius: '1.5rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 8px 32px rgba(237,198,32,0.25)' }}>
          <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-secondary)' }}>Total Pendiente</p>
          <p style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '3rem', fontWeight: 900, color: 'var(--color-on-secondary-container)', lineHeight: 1 }}>Q{totalPendiente.toFixed(2)}</p>
          <button className="btn" style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.85rem 1.5rem', borderRadius: '0.75rem', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
            <ArrowUpRight size={18} /> Subir Comprobante
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: '1.5rem', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 16px rgba(14,26,57,0.04)' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'var(--color-success-container, #d4f5e2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} color="var(--color-success)" />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 800, color: 'var(--color-primary)' }}>¡Todo al día!</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>Sin pagos pendientes este mes.</p>
          </div>
        </div>
      )}

      {/* HISTORIAL DE PAGOS */}
      <section>
        <h3 style={{ margin: '0 0 0.85rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
          Historial de Pagos
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {MOCK_PAGOS.map((pago, i) => {
            const cfg = estadoConfig[pago.estado] || estadoConfig.PENDIENTE;
            const Icon = cfg.icon;
            return (
              <div key={i} style={{ background: 'var(--color-surface-container-lowest)', borderRadius: '1rem', padding: '1rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem', boxShadow: '0 2px 8px rgba(14,26,57,0.03)' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={cfg.color} strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)' }}>{pago.mes}</p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>{pago.club} · {pago.fecha}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)' }}>{pago.monto}</p>
                  <span style={{ background: cfg.bg, color: cfg.color, padding: '0.15rem 0.5rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 800 }}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
