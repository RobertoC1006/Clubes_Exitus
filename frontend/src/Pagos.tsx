import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { CheckCircle2, Clock, AlertCircle, Search, Users, ExternalLink, Loader2, Bell, Upload, Image, RefreshCw, X } from 'lucide-react';
import './index.css';
import { API_BASE_URL } from './config';

const API = API_BASE_URL;

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isProfesor = usuario?.rol === 'PROFESOR';
  const isPadre = usuario?.rol === 'PADRE';

  useEffect(() => {
    if (!usuario) return;
    
    // Solo los padres deben cargar datos aquí
    if (isPadre) {
        fetch(`${API}/padre/pagos/${usuario.id}`)
          .then(res => res.json())
          .then(data => {
            setPadreData(data);
            setLoading(false);
          })
          .catch(err => { console.error(err); setLoading(false); });
    } else {
        setLoading(false);
    }
  }, [usuario, isPadre]);

  const handleUploadClick = (deuda: any) => {
    setSelectedDeuda(deuda);
    setShowModal(true);
  };

  const handleRealUpload = async () => {
    if (!selectedDeuda || !selectedFile) {
        alert('Por favor selecciona un archivo primero.');
        return;
    }
    setUploading(true);

    try {
      // 1. Subida a Cloudinary
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'Clubes Exitus'); // Tu Unsigned Upload Preset

      const cloudResp = await fetch(`https://api.cloudinary.com/v1_1/dgkkf5lmx/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!cloudResp.ok) throw new Error('Error al subir a Cloudinary');
      const cloudData = await cloudResp.json();
      const urlComprobante = cloudData.secure_url;

      // 2. Registro en nuestra DB
      const resp = await fetch(`${API}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumnoId: selectedDeuda.alumnoId,
          clubId: selectedDeuda.clubId,
          mes: selectedDeuda.mes,
          monto: selectedDeuda.monto,
          urlComprobante: urlComprobante
        })
      });

      if (!resp.ok) throw new Error('Error al registrar pago');

      setUploading(false);
      setShowModal(false);
      setSelectedFile(null);
      alert('¡Comprobante enviado con éxito! El administrador lo revisará pronto.');
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert('Error al procesar el pago. Por favor intenta de nuevo.');
      setUploading(false);
    }
  };

  if (!isPadre && !loading) {
    return <div className="flex-center" style={{ height: '70vh' }}>Acceso restringido</div>;
  }

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '70vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
      </div>
    );
  }

  return (
    <div className="animate-enter" style={{ padding: '1.25rem', paddingBottom: '7rem' }}>

      {/* HERO SECTION */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em', lineHeight: 1, margin: '0.25rem 0 0.5rem 0' }}>
          Mis Pagos
        </h2>
        <p style={{ margin: 0, color: 'var(--color-on-surface-variant)', fontSize: '0.9rem', fontWeight: 500 }}>
          Control de tus mensualidades y comprobantes
        </p>
      </section>



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

                   <div 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      style={{ 
                          border: `2px dashed ${selectedFile ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`, 
                          borderRadius: '1.5rem', 
                          padding: '2.5rem 1rem', textAlign: 'center', marginBottom: '1.5rem',
                          cursor: 'pointer', transition: 'all 0.2s', 
                          background: selectedFile ? 'var(--color-primary-container)' : 'var(--color-surface)',
                          opacity: uploading ? 0.6 : 1
                      }}>
                      <input 
                        type="file" 
                        id="file-upload" 
                        hidden 
                        accept="image/*" 
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      <div style={{ 
                        background: selectedFile ? 'white' : 'var(--color-primary-container)', 
                        width: '4rem', height: '4rem', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' 
                      }}>
                          {selectedFile ? <CheckCircle2 size={24} color="var(--color-primary)" /> : <Image size={24} color="var(--color-primary)" />}
                      </div>
                      <p style={{ margin: 0, fontWeight: 800, color: selectedFile ? 'white' : 'var(--color-primary)' }}>
                        {selectedFile ? selectedFile.name : 'Toca para seleccionar imagen'}
                      </p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: selectedFile ? 'rgba(255,255,255,0.8)' : 'var(--color-outline)' }}>
                        {selectedFile ? '¡Imagen lista!' : 'PNG, JPG hasta 5MB'}
                      </p>
                  </div>

                  <button 
                    disabled={uploading || !selectedFile}
                    onClick={handleRealUpload}
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '1.15rem', fontSize: '1rem', fontWeight: 900, opacity: (!selectedFile || uploading) ? 0.6 : 1 }}
                  >
                    {uploading ? <><RefreshCw size={18} className="spin" /> Subiendo...</> : 'Confirmar Envío'}
                  </button>
              </div>
          </div>
      )}

    </div>
  );
}
