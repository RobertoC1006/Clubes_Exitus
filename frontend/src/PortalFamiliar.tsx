import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Trophy, CreditCard, Clock } from 'lucide-react';
import './index.css';

function getSemanaActual() {
  const dias = ['L', 'M', 'X', 'J', 'V'];
  const hoy = new Date();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - (hoy.getDay() === 0 ? 6 : hoy.getDay() - 1));
  return dias.map((label, i) => {
    const fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + i);
    return { label, esFuturo: fecha > hoy };
  });
}

const MOCK_DATA = {
  alumno: { nombre: 'Alejandro', apellido: 'Benitez Ríos', grado: '10º A', id: 1 },
  clubes: [
    { id: 1, nombre: 'Fútbol Selección',  profesor: 'Juan Perez',     asistencias: [true, true, false, true, false], asistenciaPct: 88 },
    { id: 4, nombre: 'Robótica e IA',     profesor: 'Ricardo Suárez', asistencias: [true, false, true, true, false], asistenciaPct: 75 },
  ],
  logros: [
    { titulo: '5 en Raya',        desc: '5 sesiones consecutivas', icon: '🔥' },
    { titulo: 'Deportista Activo',desc: 'Más de 10 este mes',       icon: '⚡' },
  ],
  pago: { estado: 'AL DÍA', monto: 'Q150.00', proxVencimiento: '30 de Abril, 2026' },
};

export default function PortalFamiliar() {
  const semana = getSemanaActual();
  const { alumno, clubes, logros, pago } = MOCK_DATA;

  return (
    <div className="app-container animate-enter" style={{ padding: '1.25rem', paddingBottom: '7rem' }}>

      {/* HERO */}
      <section style={{ marginBottom: '2rem' }}>
        <span style={{ color: 'var(--color-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>
          Portal Familiar
        </span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.25rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>
              {alumno.nombre}
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-on-surface-variant)', fontWeight: 600, fontSize: '0.9rem' }}>
              {alumno.grado} · #{alumno.id}
            </p>
          </div>
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: 'var(--color-primary-container)', color: 'white', fontWeight: 900, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {alumno.nombre[0]}{alumno.apellido[0]}
          </div>
        </div>
      </section>

      {/* LOGROS */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
          Logros Obtenidos
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {logros.map((logro, i) => (
            <div key={i} style={{ background: 'var(--color-secondary-container)', borderRadius: '1.25rem', padding: '1rem 1.25rem', minWidth: '145px', flexShrink: 0, boxShadow: '0 4px 16px rgba(237,198,32,0.2)' }}>
              <span style={{ fontSize: '1.75rem' }}>{logro.icon}</span>
              <p style={{ margin: '0.4rem 0 0 0', fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-on-secondary-container)' }}>{logro.titulo}</p>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.7rem', color: 'var(--color-secondary)', fontWeight: 600 }}>{logro.desc}</p>
            </div>
          ))}
          {/* Próximo logro placeholder */}
          <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: '1.25rem', padding: '1rem 1.25rem', minWidth: '145px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', border: '2px dashed var(--color-surface-container-high)' }}>
            <Trophy size={28} color="var(--color-outline)" />
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-outline)', textAlign: 'center' }}>Próximo logro</p>
          </div>
        </div>
      </section>

      {/* CLUBES CON HEATMAP SEMANAL */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
          Mis Clubes
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {clubes.map((club) => (
            <div key={club.id} style={{ background: 'var(--color-surface-container-lowest)', borderRadius: '1.25rem', padding: '1.25rem', boxShadow: '0 4px 16px rgba(14,26,57,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary)' }}>{club.nombre}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>Prof. {club.profesor}</p>
                </div>
                <span style={{ fontWeight: 900, fontSize: '1.25rem', color: club.asistenciaPct >= 85 ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {club.asistenciaPct}%
                </span>
              </div>

              {/* Heatmap semanal */}
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-secondary)' }}>
                Esta Semana
              </p>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {semana.map((dia, i) => {
                  const asistio = club.asistencias[i];
                  const futuro = dia.esFuturo;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                      <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-on-surface-variant)' }}>{dia.label}</p>
                      <div style={{
                        width: '100%', aspectRatio: '1', borderRadius: '0.5rem',
                        background: futuro ? 'var(--color-surface-container)' : (asistio ? 'var(--color-success)' : 'var(--color-error-container)'),
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {!futuro && (asistio
                          ? <CheckCircle2 size={14} color="white" strokeWidth={2.5} />
                          : <XCircle size={14} color="var(--color-error)" strokeWidth={2.5} />
                        )}
                        {futuro && <Clock size={12} color="var(--color-outline)" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PAGOS */}
      <section>
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
          Estado de Pagos
        </h3>
        <div style={{ background: 'var(--color-primary-container)', borderRadius: '1.25rem', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 32px rgba(29,40,72,0.2)' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-primary-container)' }}>Mensualidad</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{pago.monto}</p>
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-on-primary-container)', fontWeight: 600 }}>Vence: {pago.proxVencimiento}</p>
          </div>
          <span style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)', padding: '0.5rem 0.85rem', borderRadius: '99px', fontWeight: 900, fontSize: '0.75rem' }}>
            {pago.estado}
          </span>
        </div>
      </section>

    </div>
  );
}
