import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { CheckCircle2, Clock, AlertCircle, Search, Users, ExternalLink, Loader2, Bell } from 'lucide-react';
import './index.css';

const estadoConfig: Record<string, { bg: string; color: string; icon: any; label: string }> = {
  PAGADO:    { bg: 'var(--color-success-container)', color: 'var(--color-success)',  icon: CheckCircle2, label: 'Al Día' },
  PENDIENTE: { bg: 'var(--color-secondary-container)', color: 'var(--color-secondary)', icon: Clock,        label: 'Pendiente' },
  RECHAZADO: { bg: 'var(--color-error-container)',     color: 'var(--color-error)',    icon: AlertCircle,  label: 'Rechazado' },
};

export default function Pagos() {
  const { usuario } = useUser();
  const [monitor, setMonitor] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isProfesor = usuario?.rol === 'PROFESOR';

  useEffect(() => {
    if (!usuario) return;
    
    const url = isProfesor 
      ? `http://localhost:3000/pagos/monitor/${usuario.id}`
      : `http://localhost:3000/pagos/alumno/${usuario.id}`; // Simulado para padre

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setMonitor(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching payments:", err);
        setLoading(false);
      });
  }, [usuario, isProfesor]);

  const filtrados = monitor.filter(item => 
    `${item.nombre} ${item.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.clubNombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPendientes = monitor.filter(m => m.estadoPago !== 'PAGADO').length;

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '70vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
      </div>
    );
  }

  return (
    <div className="app-container animate-enter" style={{ padding: '1.25rem', paddingBottom: '7rem' }}>

      {/* HERO SECTION */}
      <section style={{ marginBottom: '2rem' }}>
        <span style={{ color: 'var(--color-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>
          {isProfesor ? 'Administración' : 'Mis Finanzas'}
        </span>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em', lineHeight: 1, margin: '0.25rem 0 0.5rem 0' }}>
          {isProfesor ? 'Monitor de Pagos' : 'Mis Pagos'}
        </h2>
        <p style={{ margin: 0, color: 'var(--color-on-surface-variant)', fontSize: '0.9rem', fontWeight: 500 }}>
          {isProfesor ? 'Estado de solvencia de tus clubes asignados' : 'Control de tus mensualidades y comprobantes'}
        </p>
      </section>

      {/* RESUMEN DE SOLVENCIA (Profesor) */}
      {isProfesor && (
        <div style={{ 
          background: totalPendientes > 0 ? 'var(--color-secondary-container)' : 'var(--color-primary-container)', 
          borderRadius: '1.5rem', padding: '1.5rem', marginBottom: '2rem', 
          color: totalPendientes > 0 ? 'var(--color-on-secondary-container)' : 'white',
          boxShadow: '0 8px 32px rgba(14,26,57,0.1)'
        }}>
          <div className="flex-between">
            <div>
              <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>Relación de Deuda</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>{totalPendientes} <span style={{ fontSize: '1rem', fontWeight: 700, opacity: 0.7 }}>Alumnos Pendientes</span></p>
            </div>
            <div style={{ textAlign: 'right' }}>
               <Users size={32} opacity={0.3} />
            </div>
          </div>
        </div>
      )}

      {/* BUSCADOR (Profesor) */}
      {isProfesor && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ background: 'white', border: '1px solid var(--color-surface-container-high)', borderRadius: '1rem', padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Search size={18} color="var(--color-outline)" />
            <input 
              type="text" 
              placeholder="Buscar por alumno o club..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }} 
            />
          </div>
        </div>
      )}

      {/* LISTADO DE PAGOS / MONITOR */}
      <section>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
          {isProfesor ? 'Relación de Alumnos' : 'Historial de Pagos'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filtrados.map((item, i) => {
            const cfg = estadoConfig[item.estadoPago] || estadoConfig.PENDIENTE;
            const Icon = cfg.icon;
            const isPending = item.estadoPago !== 'PAGADO';

            return (
              <div key={i} style={{ 
                background: 'var(--color-surface-container-lowest)', 
                borderRadius: '1.25rem', padding: '1.15rem', 
                display: 'flex', alignItems: 'center', gap: '1rem', 
                boxShadow: '0 2px 12px rgba(14,26,57,0.02)',
                border: isPending ? '1px solid var(--color-secondary-container)' : '1px solid transparent'
              }}>
                <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.85rem', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={cfg.color} strokeWidth={2.5} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                    {item.nombre} {item.apellido}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
                    {item.clubNombre} · {item.grado}
                  </p>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                  <span style={{ background: cfg.bg, color: cfg.color, padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 800, display: 'inline-block' }}>
                    {cfg.label}
                  </span>
                  {isProfesor && isPending && (
                    <button style={{ background: 'none', border: 'none', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}>
                      <Bell size={12} /> Recordar
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filtrados.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-outline)' }}>
               <Users size={32} style={{ marginBottom: '1rem' }} />
               <p style={{ fontWeight: 600 }}>No se encontraron registros.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
