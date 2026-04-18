import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { CheckCircle2, Clock, AlertCircle, Search, Users, ExternalLink, Loader2, Bell, Upload, Image, RefreshCw, X } from 'lucide-react';
import './index.css';

const estadoConfig: Record<string, { bg: string; color: string; icon: any; label: string }> = {
  PAGADO:    { bg: 'var(--color-success-container)', color: 'var(--color-success)',  icon: CheckCircle2, label: 'Al Día' },
  PENDIENTE: { bg: 'var(--color-secondary-container)', color: 'var(--color-secondary)', icon: Clock,        label: 'Pendiente' },
  RECHAZADO: { bg: 'var(--color-error-container)',     color: 'var(--color-error)',    icon: AlertCircle,  label: 'Rechazado' },
};

export default function Pagos() {
  const { usuario } = useUser();
  const [monitor, setMonitor] = useState<any[]>([]);
  const [padreData, setPadreData] = useState<{ deudas: any[], historial: any[] }>({ deudas: [], historial: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDeuda, setSelectedDeuda] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const isProfesor = usuario?.rol === 'PROFESOR';
  const isPadre = usuario?.rol === 'PADRE';

  useEffect(() => {
    if (!usuario) return;
    
    if (isProfesor) {
        fetch(`http://localhost:3000/pagos/monitor/${usuario.id}`)
          .then(res => res.json())
          .then(data => {
            setMonitor(Array.isArray(data) ? data : []);
            setLoading(false);
          })
          .catch(err => { console.error(err); setLoading(false); });
    } else if (isPadre) {
        fetch(`http://localhost:3000/padre/pagos/${usuario.id}`)
          .then(res => res.json())
          .then(data => {
            setPadreData(data);
            setLoading(false);
          })
          .catch(err => { console.error(err); setLoading(false); });
    } else {
        setLoading(false);
    }
  }, [usuario, isProfesor, isPadre]);

  const handleUploadClick = (deuda: any) => {
    setSelectedDeuda(deuda);
    setShowModal(true);
  };

  const handleSimulateUpload = () => {
    setUploading(true);
    // Simular guardado en backend
    setTimeout(() => {
        setUploading(false);
        setShowModal(false);
        alert('Comprobante enviado con éxito. El administrador lo revisará pronto.');
        window.location.reload(); 
    }, 1500);
  };

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

      {/* INFO DE DEPÓSITOS (Padre) */}
      {isPadre && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--color-primary-container)', padding: '0.8rem', borderRadius: '1rem' }}>
                    <ExternalLink size={20} color="var(--color-primary)" />
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: 'var(--color-primary)' }}>Instrucciones de Pago</h4>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', fontWeight: 500, lineHeight: 1.5 }}>
                        Realiza el depósito a la cuenta BCP: <strong>191-2345-6789-01</strong> <br/>
                        A nombre de: <strong>Clubes Exitus S.A.C.</strong>
                    </p>
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

      {/* DEUDAS PENDIENTES (Padre) */}
      {isPadre && padreData.deudas.length > 0 && (
         <section style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
              Pagos Pendientes ({padreData.deudas.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {padreData.deudas.map((deuda, i) => (
                    <div key={i} className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--color-secondary-container)' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-secondary)', textTransform: 'uppercase' }}>{deuda.clubNombre}</p>
                            <p style={{ margin: '0.1rem 0', fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-primary)' }}>{deuda.alumnoNombre}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-outline)' }}>Mes: {deuda.mes} · S/ {deuda.monto.toFixed(2)}</p>
                        </div>
                        <button onClick={() => handleUploadClick(deuda)} className="btn btn-primary" style={{ padding: '0.6rem 1rem', borderRadius: '0.85rem' }}>
                            <Upload size={16} /> Subir Comprobante
                        </button>
                    </div>
                ))}
            </div>
         </section>
      )}

      {/* LISTADO DE MONITOR (Profesor) */}
      {isProfesor && (
          <section>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
              Relación de Alumnos
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
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)' }}>{item.nombre} {item.apellido}</p>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>{item.clubNombre} · {item.grado}</p>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                      <span style={{ background: cfg.bg, color: cfg.color, padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 800 }}>{cfg.label}</span>
                      {isPending && (
                        <button style={{ background: 'none', border: 'none', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}>
                          <Bell size={12} /> Recordar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
      )}

      {/* HISTORIAL (Padre) */}
      {isPadre && (
          <section>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
              Historial de Pagos
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {padreData.historial.map((p, i) => {
                    const cfg = estadoConfig[p.estado] || estadoConfig.PENDIENTE;
                    const Icon = cfg.icon;
                    return (
                        <div key={i} className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: p.estado === 'RECHAZADO' ? 0.7 : 1 }}>
                            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon size={18} color={cfg.color} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-primary)' }}>{p.alumno} · {p.club}</p>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>{p.mes} · S/ {p.monto.toFixed(2)}</p>
                                {p.observacion && <p style={{ margin: '0.25rem 0 0', fontSize: '0.65rem', color: 'var(--color-error)', fontWeight: 700 }}>Nota: {p.observacion}</p>}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ color: cfg.color, fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase' }}>{cfg.label}</span>
                            </div>
                        </div>
                    );
                })}
                {padreData.historial.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-outline)' }}>
                        <Clock size={32} opacity={0.3} style={{ marginBottom: '0.5rem' }} />
                        <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>No hay historial registrado.</p>
                    </div>
                )}
            </div>
          </section>
      )}

      {/* MODAL DE SUBIDA */}
      {showModal && (
          <div style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(14,26,57,0.6)', backdropFilter: 'blur(5px)', 
              zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' 
          }}>
              <div className="animate-enter" style={{ 
                  background: 'white', width: '100%', maxWidth: '480px', 
                  borderTopLeftRadius: '2rem', borderTopRightRadius: '2rem', 
                  padding: '2rem', position: 'relative', boxShadow: '0 -10px 40px rgba(0,0,0,0.1)'
              }}>
                  <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--color-surface-container-high)', border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={18} />
                  </button>

                  <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)' }}>Subir Comprobante</h3>
                  <p style={{ margin: '0.5rem 0 1.5rem', fontSize: '0.9rem', color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>
                    Confirmando pago para <strong>{selectedDeuda?.alumnoNombre}</strong> en <strong>{selectedDeuda?.clubNombre}</strong>.
                  </p>

                  <div style={{ 
                      border: '2px dashed var(--color-outline-variant)', borderRadius: '1.5rem', 
                      padding: '3rem 1rem', textAlign: 'center', marginBottom: '1.5rem',
                      cursor: 'pointer', transition: 'all 0.2s', background: 'var(--color-surface)'
                  }}>
                      <div style={{ background: 'var(--color-primary-container)', width: '4rem', height: '4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                          <Image size={24} color="var(--color-primary)" />
                      </div>
                      <p style={{ margin: 0, fontWeight: 800, color: 'var(--color-primary)' }}>Toca para seleccionar imagen</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-outline)' }}>PNG, JPG hasta 5MB</p>
                  </div>

                  <button 
                    disabled={uploading}
                    onClick={handleSimulateUpload}
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '1.15rem', fontSize: '1rem', fontWeight: 900 }}
                  >
                    {uploading ? <><RefreshCw size={18} className="spin" /> Procesando...</> : 'Confirmar Envío'}
                  </button>
              </div>
          </div>
      )}

    </div>
  );
}
