import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users, AlertTriangle, Award, TrendingUp,
  PlusCircle, Edit2, Trash2, UserCheck,
  Download, ChevronRight, X, Save,
  BarChart2, BookOpen, CreditCard, RefreshCw,
  GraduationCap, Search, ChevronDown, FileText, ExternalLink,
  Check
} from 'lucide-react';
import './index.css';

const API = 'http://localhost:3000';

// ── Tipos ──────────────────────────────────────────────────────
interface Metricas {
  totalAlumnos: number;
  totalClubes: number;
  totalProfesores: number;
  asistenciaGlobal: number;
  clubes: ClubMetrica[];
  alertas: { alumno: string; club: string; faltas: number }[];
}
interface ClubMetrica {
  id: number; nombre: string; descripcion: string | null;
  profesorId: number; profesor: string; inscritos: number; asistencia: number;
}
interface Profesor { id: number; nombre: string; apellido: string; email: string }
interface Usuario { id: number; nombre: string; apellido: string; email: string; rol: 'ADMINISTRADOR' | 'PROFESOR' | 'PADRE'; dni?: string }
interface Alumno {
  id: number; nombre: string; apellido: string; grado: string;
  padre?: { nombre: string; apellido: string } | null;
  inscripciones: { club: { nombre: string } }[];
  _count: { asistencias: number };
}
interface Pago {
  id: number; mes: string; monto: number | null; estado: 'PENDIENTE' | 'PAGADO' | 'RECHAZADO';
  urlComprobante: string | null; observacion: string | null;
  alumno: { nombre: string; apellido: string; grado: string };
  club: { nombre: string };
}

// ── Colores de estado ──────────────────────────────────────────
const estadoColor = {
  PENDIENTE: { bg: 'var(--color-warning-container, #FFF3CD)', fg: '#856404' },
  PAGADO:    { bg: 'var(--color-success-container, #D1FAE5)', fg: '#065F46' },
  RECHAZADO: { bg: 'var(--color-error-container)',            fg: 'var(--color-error)' },
};

// ── Modal de Club ──────────────────────────────────────────────
function ClubModal({
  club, profesores, onSave, onClose,
}: {
  club: Partial<ClubMetrica> | null;
  profesores: Profesor[];
  onSave: (data: { nombre: string; descripcion: string; profesorId: number }) => void;
  onClose: () => void;
}) {
  const [nombre, setNombre]       = useState(club?.nombre ?? '');
  const [desc, setDesc]           = useState(club?.descripcion ?? '');
  const [profId, setProfId]       = useState<number>(club?.profesorId ?? (profesores[0]?.id ?? 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !profId) return;
    onSave({ nombre, descripcion: desc, profesorId: profId });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--color-surface)', borderRadius: '1.5rem', padding: '1.5rem',
        width: '100%', maxWidth: '420px', boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {club?.id ? 'Editar Club' : 'Nuevo Club'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} color="var(--color-on-surface-variant)" />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Nombre del Club</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Ajedrez Avanzado" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Descripción (opcional)</label>
            <input value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Breve descripción..." style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Profesor a cargo</label>
            <select value={profId} onChange={e => setProfId(Number(e.target.value))} required style={inputStyle}>
              {profesores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
              ))}
            </select>
          </div>
          <button type="submit" style={{
            background: 'var(--color-primary)', color: 'white', border: 'none',
            borderRadius: '1rem', padding: '0.85rem', fontWeight: 800, fontSize: '0.95rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          }}>
            <Save size={16} /> Guardar Club
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Estilos inline reutilizables ──────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.72rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.08em',
  color: 'var(--color-on-surface-variant)', marginBottom: '0.35rem',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: '0.85rem',
  border: '1.5px solid var(--color-surface-container-high)',
  background: 'var(--color-surface-container-lowest)',
  fontSize: '0.9rem', color: 'var(--color-primary)', outline: 'none',
  boxSizing: 'border-box',
};

// ══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const tab = (searchParams.get('tab') || 'panel') as 'panel' | 'clubes' | 'personas' | 'pagos' | 'reporte';
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [pagos, setPagos]       = useState<Pago[]>([]);
  const [pagoFiltro, setPagoFiltro] = useState<string>('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Personas state
  const [usuarios, setUsuarios]       = useState<Usuario[]>([]);
  const [alumnos, setAlumnos]         = useState<Alumno[]>([]);
  const [personasTab, setPersonasTab] = useState<'profesores' | 'alumnos'>('profesores');
  const [modalUsuario, setModalUsuario] = useState<Partial<Usuario> | false>(false);
  const [modalAlumno, setModalAlumno]   = useState<Partial<Alumno> | false>(false);
  const [savingPersona, setSavingPersona] = useState(false);

  // Club modal state
  const [modalClub, setModalClub]  = useState<Partial<ClubMetrica> | null | false>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Validando pago
  const [validandoPago, setValidandoPago] = useState<number | null>(null);

  // Reset search when tab changes
  useEffect(() => setSearchTerm(''), [tab]);

  // ── Fetch ────────────────────────────────────────────────────
  const fetchMetricas = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/admin/metricas`);
      if (!res.ok) throw new Error('Error al cargar métricas');
      setMetricas(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const fetchProfesores = useCallback(async () => {
    try {
      const [profRes, usrRes] = await Promise.all([
        fetch(`${API}/admin/profesores`),
        fetch(`${API}/admin/usuarios`),
      ]);
      setProfesores(await profRes.json());
      setUsuarios(await usrRes.json());
    } catch { /* silently fail */ }
  }, []);

  const fetchAlumnos = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/alumnos`);
      setAlumnos(await res.json());
    } catch { /* silently fail */ }
  }, []);

  const fetchPagos = useCallback(async () => {
    try {
      const url = pagoFiltro ? `${API}/pagos?estado=${pagoFiltro}` : `${API}/pagos`;
      const res = await fetch(url);
      setPagos(await res.json());
    } catch { /* silently fail */ }
  }, [pagoFiltro]);

  useEffect(() => { fetchMetricas(); fetchProfesores(); }, []);
  useEffect(() => { if (tab === 'pagos') fetchPagos(); }, [tab, pagoFiltro]);
  useEffect(() => { if (tab === 'personas') { fetchAlumnos(); fetchProfesores(); } }, [tab]);

  // ── CRUD Clubes ──────────────────────────────────────────────
  const handleSaveClub = async (data: { nombre: string; descripcion: string; profesorId: number }) => {
    const isEdit = modalClub && 'id' in modalClub && modalClub.id;
    const url    = isEdit ? `${API}/admin/clubes/${modalClub.id}` : `${API}/admin/clubes`;
    const method = isEdit ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    setModalClub(false);
    fetchMetricas();
  };

  const handleDeleteClub = async (id: number) => {
    if (!window.confirm('¿Eliminar este club? Esta acción es permanente.')) return;
    setDeletingId(id);
    await fetch(`${API}/admin/clubes/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    fetchMetricas();
  };

  // ── Validar Pago ─────────────────────────────────────────────
  const handleValidarPago = async (id: number, estado: 'PAGADO' | 'RECHAZADO', observacion = '') => {
    setValidandoPago(id);
    await fetch(`${API}/pagos/${id}/validar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado, observacion }),
    });
    setValidandoPago(null);
    fetchPagos();
  };

  const handleExportarCSV = () => {
    window.open(`${API}/admin/reporte/asistencia`, '_blank');
  };

  // ── CRUD Personas ─────────────────────────────────────────────
  const handleSaveUsuario = async (data: Partial<Usuario>) => {
    setSavingPersona(true);
    const isEdit = modalUsuario && 'id' in modalUsuario && (modalUsuario as any).id;
    const url    = isEdit ? `${API}/admin/usuarios/${(modalUsuario as any).id}` : `${API}/admin/usuarios`;
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) { const err = await res.json(); alert(err.message ?? 'Error al guardar'); }
      else { setModalUsuario(false); fetchProfesores(); }
    } catch { alert('Error de red'); }
    finally { setSavingPersona(false); }
  };

  const handleSaveAlumno = async (data: { nombre: string; apellido: string; grado: string; padreId?: number; clubIds?: number[]; nuevoPadre?: any }) => {
    setSavingPersona(true);
    const isEdit = modalAlumno && 'id' in modalAlumno && (modalAlumno as any).id;
    const url    = isEdit ? `${API}/admin/alumnos/${(modalAlumno as any).id}` : `${API}/admin/alumnos`;
    const method = isEdit ? 'PUT' : 'POST';
    try {
      // Si hay un nuevo padre, lo creamos primero
      let finalPadreId = data.padreId;
      if (data.nuevoPadre) {
        const pRes = await fetch(`${API}/admin/usuarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data.nuevoPadre, rol: 'PADRE' })
        });
        if (pRes.ok) {
           const pData = await pRes.json();
           finalPadreId = pData.id;
        }
      }

      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ ...data, padreId: finalPadreId }) 
      });
      if (!res.ok) { const err = await res.json(); alert(err.message ?? 'Error al guardar'); }
      else { setModalAlumno(false); fetchAlumnos(); fetchMetricas(); fetchProfesores(); }
    } catch { alert('Error de red'); }
    finally { setSavingPersona(false); }
  };

  // ── Render ────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh', flexDirection: 'column', gap: '1rem' }}>
      <RefreshCw size={32} color="var(--color-secondary)" className="spin" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>Cargando datos reales...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <AlertTriangle size={40} color="var(--color-error)" />
      <p style={{ color: 'var(--color-error)', fontWeight: 700, marginTop: '0.75rem' }}>{error}</p>
      <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.85rem' }}>
        ¿El backend está corriendo? <code>npm run start:dev</code>
      </p>
      <button onClick={fetchMetricas} style={{
        marginTop: '1rem', background: 'var(--color-primary)', color: 'white',
        border: 'none', borderRadius: '1rem', padding: '0.75rem 1.5rem', fontWeight: 700, cursor: 'pointer',
      }}>
        Reintentar
      </button>
    </div>
  );

  const clubesRanking = (metricas?.clubes && Array.isArray(metricas.clubes)) 
    ? [...metricas.clubes].sort((a, b) => (b.asistencia ?? 0) - (a.asistencia ?? 0)) 
    : [];

  return (
    <div className="app-container animate-enter" style={{ paddingBottom: '7rem' }}>

      <section style={{ padding: '2rem 1.25rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <div style={{ padding: '0.4rem 0.8rem', borderRadius: '99px', background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            v2.4 Pro
          </div>
          <span style={{ color: 'var(--color-on-surface-variant)', fontWeight: 700, fontSize: '0.75rem' }}>
            COMMAND CENTER
          </span>
        </div>
        <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.05em', lineHeight: 0.95, margin: '0 0 0.6rem 0' }}>
          Gestión <br/><span style={{ color: 'var(--color-secondary)' }}>Institucional</span>
        </h2>
        <p style={{ margin: 0, color: 'var(--color-on-surface-variant)', fontSize: '0.9rem', fontWeight: 500, opacity: 0.8 }}>
          Supervisando <strong>{metricas?.totalAlumnos ?? '…'} alumnos</strong> en <strong>{metricas?.totalClubes ?? '…'} disciplinas</strong>.
        </p>
      </section>


      <div style={{ padding: '1.25rem' }}>

        {/* ══════════ TAB: PANEL ════════════════════════════ */}
        {tab === 'panel' && metricas && (
          <>
            {/* BENTO MÉTRICAS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{
                gridColumn: '1 / -1',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-container))',
                borderRadius: '2rem',
                padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 20px 40px rgba(29,40,72,0.25)',
                position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.1 }}>
                  <Users size={180} color="white" />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.7)' }}>Atletas Activos</p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '4.5rem', fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-0.06em' }}>{metricas.totalAlumnos}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                    <span style={{ padding: '0.3rem 0.6rem', borderRadius: '99px', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '0.65rem', fontWeight: 700 }}>{metricas.totalClubes} disciplinas</span>
                    <span style={{ padding: '0.3rem 0.6rem', borderRadius: '99px', background: 'var(--color-secondary)', color: 'var(--color-on-secondary)', fontSize: '0.65rem', fontWeight: 800 }}>Ciclo 2024</span>
                  </div>
                </div>
              </div>

              <div style={metricaCardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                   <div style={{ width: '1.8rem', height: '1.8rem', borderRadius: '0.5rem', background: 'var(--color-success-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={14} color="var(--color-success)" />
                   </div>
                   <p style={metricaLabelStyle}>Retención</p>
                </div>
                <p style={metricaValueStyle}>{metricas.asistenciaGlobal}%</p>
                <div style={{ marginTop: '1rem', height: '6px', borderRadius: '99px', background: 'var(--color-surface-container-high)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${metricas.asistenciaGlobal}%`, background: 'var(--color-secondary)', borderRadius: '99px', transition: 'width 1s ease' }} />
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>Asistencia Global</p>
              </div>

              <div style={metricaCardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                   <div style={{ width: '1.8rem', height: '1.8rem', borderRadius: '0.5rem', background: 'var(--color-primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <GraduationCap size={14} color="var(--color-primary)" />
                   </div>
                   <p style={metricaLabelStyle}>Expertos</p>
                </div>
                <p style={metricaValueStyle}>{metricas.totalProfesores}</p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>Cuerpo docente</p>
              </div>
            </div>

            {/* ALERTAS */}
            {metricas.alertas.length > 0 && (
              <section style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-error)', animation: 'pulse 2s infinite' }}></div>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Atención Prioritaria</h3>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-error)' }}>{metricas.alertas.length} incidencias</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {metricas.alertas.slice(0, 5).map((a, i) => (
                    <div key={i} className="glass-card" style={{
                      padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(211, 47, 47, 0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{ width: '2.4rem', height: '2.4rem', borderRadius: '50%', background: 'var(--color-error-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <AlertTriangle size={16} color="var(--color-error)" />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-primary)' }}>{a.alumno}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>{a.club}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 900, color: 'var(--color-error)' }}>{a.faltas}</span>
                        <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-outline)' }}>FALTAS</span>
                      </div>
                    </div>
                  ))}
                  <style>{`@keyframes pulse { 0% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0.5; transform: scale(1); } }`}</style>
                </div>
              </section>
            )}

            {/* RANKING */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Award size={18} color="var(--color-secondary)" />
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ranking de disciplinas</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {clubesRanking.map((club, i) => (
                  <div key={club.id} className="glass-card" style={{
                    padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
                  }}>
                    <div style={{
                      width: '2.5rem', height: '2.5rem', borderRadius: '0.85rem', flexShrink: 0,
                      background: i === 0 ? 'var(--color-secondary)' : 'var(--color-surface-container-high)',
                      color: i === 0 ? 'var(--color-on-secondary)' : 'var(--color-on-surface-variant)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: '1rem',
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)' }}>{club.nombre}</p>
                      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.15rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-outline)', fontWeight: 600 }}>{club.profesor}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-secondary)', fontWeight: 800 }}>• {club.inscritos} alumnos</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <span style={{ display: 'block', fontWeight: 900, fontSize: '1.25rem', color: club.asistencia >= 85 ? 'var(--color-success)' : 'var(--color-error)', lineHeight: 1 }}>
                        {club.asistencia}%
                      </span>
                      <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--color-outline)' }}>ASISTENCIA</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ══════════ TAB: CLUBES ═══════════════════════════ */}
        {tab === 'clubes' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                Disciplinas <span style={{ color: 'var(--color-secondary)', fontSize: '0.8rem', verticalAlign: 'middle', marginLeft: '0.5rem', background: 'var(--color-secondary-container)', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>{metricas?.clubes.length ?? 0}</span>
              </h3>
              <button onClick={() => setModalClub({})} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                <PlusCircle size={15} /> Nuevo
              </button>
            </div>

            {/* SEARCH BAR */}
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <input 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar disciplina o profesor..." 
                style={{ ...inputStyle, paddingLeft: '2.8rem', borderRadius: '1.25rem', border: '1.5px solid var(--color-surface-container-high)' }} 
              />
              <BarChart2 size={18} color="var(--color-outline)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(metricas?.clubes ?? [])
                .filter(c => (c.nombre?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) || (c.profesor?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()))
                .map(club => (
                <div key={club.id} className="glass-card" style={{
                  padding: '1.25rem',
                  borderLeft: '5px solid var(--color-primary)',
                  background: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{club.nombre}</p>
                      {club.descripcion && (
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', lineHeight: 1.4, fontWeight: 500 }}>{club.descripcion}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
                      <button onClick={() => setModalClub(club)} style={iconBtnStyle('var(--color-surface-container-lowest)', 'var(--color-primary)')}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDeleteClub(club.id)} disabled={deletingId === club.id} style={iconBtnStyle('var(--color-error-container)', 'var(--color-error)')}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                    <Pill icon={<UserCheck size={12}/>} label={club.profesor} bg="var(--color-primary-fixed)" color="var(--color-primary)" />
                    <Pill icon={<Users size={12}/>} label={`${club.inscritos} alumnos`} />
                    <Pill icon={<TrendingUp size={12}/>} label={`${club.asistencia}% asist.`}
                      color={club.asistencia >= 85 ? 'var(--color-success)' : 'var(--color-error)'}
                      bg={club.asistencia >= 85 ? 'var(--color-success-container)' : 'var(--color-error-container)'} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══════════ TAB: PERSONAS ════════════════════════ */}
        {tab === 'personas' && (
          <>
            {/* Sub-tabs Profesores / Alumnos */}
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', background: 'var(--color-surface-container-low)', padding: '0.4rem', borderRadius: '1.25rem' }}>
              {(['profesores', 'alumnos'] as const).map(st => (
                <button key={st} onClick={() => setPersonasTab(st)} style={{
                  flex: 1, padding: '0.75rem', borderRadius: '0.9rem', border: 'none', cursor: 'pointer',
                  fontWeight: 800, fontSize: '0.85rem',
                  background: personasTab === st ? 'white' : 'transparent',
                  color: personasTab === st ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                  boxShadow: personasTab === st ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}>
                  {st === 'profesores' ? <GraduationCap size={18}/> : <Users size={18}/>}
                  {st === 'profesores' ? 'Profesores' : 'Alumnos'}
                </button>
              ))}
            </div>

            {/* SEARCH BAR PERSONAS */}
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <input 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={personasTab === 'profesores' ? "Buscar por nombre, email o DNI..." : "Buscar por nombre o club..."} 
                style={{ ...inputStyle, paddingLeft: '2.8rem', borderRadius: '1.25rem', border: '1.5px solid var(--color-surface-container-high)' }} 
              />
              <Search size={18} color="var(--color-outline)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {/* ─── Sub-tab: PROFESORES ─── */}
            {personasTab === 'profesores' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    Usuarios registrados ({usuarios.length})
                  </h3>
                  <button onClick={() => setModalUsuario({ rol: 'PROFESOR' })} style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    background: 'var(--color-primary)', color: 'white', border: 'none',
                    borderRadius: '99px', padding: '0.55rem 1rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                  }}>
                    <PlusCircle size={15} /> Nuevo Usuario
                  </button>
                </div>

                {(['ADMINISTRADOR', 'PROFESOR', 'PADRE'] as const).map(rol => {
                  const grupo = usuarios.filter(u => u.rol === rol)
                    .filter(u => (`${u.nombre ?? ''} ${u.apellido ?? ''} ${u.email ?? ''} ${u.dni ?? ''}`).toLowerCase().includes(searchTerm.toLowerCase()));
                  if (grupo.length === 0) return null;
                  const rolLabel = { ADMINISTRADOR: 'Administradores', PROFESOR: 'Docentes', PADRE: 'Padres de Familia' }[rol];
                  const rolColor = { ADMINISTRADOR: 'var(--color-primary)', PROFESOR: 'var(--color-secondary)', PADRE: 'var(--color-outline)' }[rol];
                  return (
                    <div key={rol} style={{ marginBottom: '1.5rem' }}>
                      <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: rolColor, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 12, height: 2, background: rolColor, borderRadius: 2 }}></div>
                        {rolLabel}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {grupo.map(u => (
                          <div key={u.id} className="glass-card" style={{
                            padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'white'
                          }}>
                            <div style={{
                              width: '2.8rem', height: '2.8rem', borderRadius: '1rem', flexShrink: 0,
                              background: 'var(--color-primary-fixed)', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)',
                              border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                            }}>
                              {(u.nombre[0] + (u.apellido[0] ?? '')).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontWeight: 900, fontSize: '0.95rem', color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>
                                {u.nombre} {u.apellido}
                              </p>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>
                                {u.email ?? (u.dni ? `ID: ${u.dni}` : 'Sin contacto')}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button onClick={() => setModalUsuario(u)} style={iconBtnStyle('var(--color-surface-container-low)', 'var(--color-primary)')}>
                                <Edit2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* ─── Sub-tab: ALUMNOS ─── */}
            {personasTab === 'alumnos' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    Alumnos ({alumnos.length})
                  </h3>
                  <button onClick={() => setModalAlumno({})} style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    background: 'var(--color-secondary)', color: 'white', border: 'none',
                    borderRadius: '99px', padding: '0.55rem 1rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                  }}>
                    <GraduationCap size={15} /> Nuevo Alumno
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {alumnos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--color-on-surface-variant)' }}>
                      <Users size={48} strokeWidth={1} style={{ opacity: 0.3 }} />
                      <p style={{ marginTop: '1rem', fontWeight: 600 }}>No hay alumnos registrados</p>
                    </div>
                  ) : alumnos
                    .filter(a => (`${a.nombre ?? ''} ${a.apellido ?? ''} ${a.grado ?? ''}`).toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(alumno => (
                    <div key={alumno.id} className="glass-card" style={{
                      padding: '1rem 1.15rem',
                      borderLeft: '4px solid var(--color-secondary)',
                      background: 'white'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '3rem', height: '3rem', borderRadius: '1.2rem', flexShrink: 0,
                          background: 'var(--color-secondary-container)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-secondary)',
                          boxShadow: '0 6px 15px rgba(237, 198, 32, 0.2)'
                        }}>
                          {(alumno.nombre[0] + (alumno.apellido[0] ?? '')).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                            {alumno.nombre} {alumno.apellido}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>{alumno.grado}</span>
                            {alumno.padre ? (
                                <>
                                    <span style={{ color: 'var(--color-outline-variant)' }}>•</span>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--color-outline)', fontWeight: 700 }}>Padre: {alumno.padre.nombre}</span>
                                </>
                            ) : (
                                <>
                                    <span style={{ color: 'var(--color-outline-variant)' }}>•</span>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--color-error)', fontWeight: 800 }}>⚠️ Sin Padre</span>
                                </>
                            )}
                            {alumno.inscripciones.length > 0 && (
                              <>
                                <span style={{ color: 'var(--color-outline-variant)' }}>•</span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 800 }}>{alumno.inscripciones.length} clubes</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => setModalAlumno(alumno)} style={iconBtnStyle('var(--color-surface-container-low)', 'var(--color-primary)')}>
                            <Edit2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ══════════ TAB: PAGOS ════════════════════════════ */}
        {tab === 'pagos' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                Finanzas <span style={{ color: 'var(--color-secondary)', fontSize: '0.8rem', verticalAlign: 'middle', marginLeft: '0.5rem', background: 'var(--color-secondary-container)', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>{pagos.length}</span>
              </h3>
              <div style={{ position: 'relative' }}>
                <select value={pagoFiltro} onChange={e => setPagoFiltro(e.target.value)} style={{
                  ...inputStyle, width: 'auto', padding: '0.5rem 2rem 0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700,
                  borderRadius: '1rem', background: 'white', border: '1.5px solid var(--color-surface-container-high)',
                  appearance: 'none'
                }}>
                  <option value="">Filtrar: Todos</option>
                  <option value="PENDIENTE">⏳ Pendientes</option>
                  <option value="PAGADO">✅ Pagados</option>
                  <option value="RECHAZADO">❌ Rechazados</option>
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            {pagos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-on-surface-variant)' }}>
                <CreditCard size={40} strokeWidth={1.5} />
                <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>No hay comprobantes con este filtro</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pagos.map(pago => {
                  const colors = estadoColor[pago.estado];
                  return (
                    <div key={pago.id} className="glass-card" style={{
                      padding: '1.25rem', background: 'white'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                           <div style={{ width: '3rem', height: '3rem', borderRadius: '1.1rem', background: 'var(--color-surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <CreditCard size={20} color="var(--color-primary)" />
                           </div>
                           <div>
                              <p style={{ margin: 0, fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>
                                {pago.alumno.nombre} {pago.alumno.apellido}
                              </p>
                              <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
                                {pago.club.nombre} • <span style={{ color: 'var(--color-primary)' }}>{pago.mes}</span>
                              </p>
                           </div>
                        </div>
                        <span style={{
                          background: colors.bg, color: colors.fg,
                          padding: '0.4rem 0.8rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 900,
                          textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                          {pago.estado}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-surface-container-low)' }}>
                         <div>
                            {pago.monto && (
                               <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                                 S/ {pago.monto.toFixed(2)}
                               </p>
                            )}
                            {pago.urlComprobante && (
                              <a href={pago.urlComprobante} target="_blank" rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-secondary)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <ExternalLink size={12} /> Comprobante
                              </a>
                            )}
                         </div>

                         {pago.estado === 'PENDIENTE' && (
                           <div style={{ display: 'flex', gap: '0.5rem' }}>
                             <button
                               disabled={validandoPago === pago.id}
                               onClick={() => handleValidarPago(pago.id, 'PAGADO')}
                               style={iconBtnStyle('var(--color-success-container)', 'var(--color-success)')}>
                               <Check size={18} strokeWidth={3} />
                             </button>
                             <button
                               disabled={validandoPago === pago.id}
                               onClick={() => {
                                 const obs = prompt('Motivo del rechazo (opcional):') ?? '';
                                 handleValidarPago(pago.id, 'RECHAZADO', obs);
                               }}
                               style={iconBtnStyle('var(--color-error-container)', 'var(--color-error)')}>
                               <X size={18} strokeWidth={3} />
                             </button>
                           </div>
                         )}
                      </div>

                      {pago.observacion && (
                        <p style={{ margin: '0.75rem 0 0', fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', fontStyle: 'italic', background: 'var(--color-surface-container-low)', padding: '0.6rem 0.85rem', borderRadius: '0.85rem', fontWeight: 500 }}>
                          “{pago.observacion}”
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ══════════ TAB: REPORTE ══════════════════════════ */}
        {tab === 'reporte' && (
          <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
            <div className="glass-card" style={{
              background: 'linear-gradient(135deg, var(--color-primary), #2a3c74)', borderRadius: '2rem',
              padding: '2.5rem 2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', opacity: 0.1 }}>
                 <FileText size={160} color="white" />
              </div>
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'left' }}>
                <h3 style={{ color: 'white', fontWeight: 900, fontSize: '1.5rem', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
                  Inteligencia de Datos
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', margin: '0 0 1.5rem', lineHeight: 1.5, fontWeight: 500 }}>
                  Genera reportes detallados de asistencia y rendimiento por disciplina.
                </p>
                <button onClick={handleExportarCSV} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem' }}>
                  <Download size={16} /> Exportar Consolidado (.csv)
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 12, height: 2, background: 'var(--color-primary)', borderRadius: 2 }}></div>
                  Reportes Individuales
               </p>

              {(metricas?.clubes ?? []).map(club => (
                <button key={club.id}
                  onClick={() => window.open(`${API}/admin/reporte/asistencia?clubId=${club.id}`, '_blank')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--color-surface-container-lowest)', border: 'none',
                    borderRadius: '1rem', padding: '1rem 1.25rem', fontWeight: 700, fontSize: '0.9rem',
                    color: 'var(--color-primary)', cursor: 'pointer',
                  }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={16} color="var(--color-secondary)" /> {club.nombre}
                  </span>
                  <ChevronRight size={16} color="var(--color-on-surface-variant)" />
                </button>
              ))}
            </div>

            <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>
              Formato CSV con BOM para compatibilidad con Microsoft Excel
            </p>
          </div>
        )}

      </div>

      {/* ── MODAL CLUB ───────────────────────────────────── */}
      {modalClub !== false && (
        <ClubModal
          club={modalClub as Partial<ClubMetrica>}
          profesores={profesores}
          onSave={handleSaveClub}
          onClose={() => setModalClub(false)}
        />
      )}

      {/* ── MODAL USUARIO ────────────────────────────────── */}
      {modalUsuario !== false && (
        <UsuarioModal
          usuario={modalUsuario as Partial<Usuario>}
          saving={savingPersona}
          onSave={handleSaveUsuario}
          onClose={() => setModalUsuario(false)}
        />
      )}

      {/* ── ALUMNO MODAL ─────────────────────────────────── */}
      {modalAlumno !== false && (
        <AlumnoModal
          alumno={modalAlumno as Partial<Alumno>}
          saving={savingPersona}
          clubes={metricas?.clubes ?? []}
          usuarios={usuarios}
          onSave={handleSaveAlumno}
          onClose={() => setModalAlumno(false)}
        />
      )}

    </div>
  );
}

// ── Sub-componentes ────────────────────────────────────────────
function Pill({ icon, label, color, bg }: { icon: React.ReactNode; label: string; color?: string; bg?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: bg ?? 'var(--color-surface-container-low)',
      color: color ?? 'var(--color-on-surface-variant)',
      padding: '0.2rem 0.65rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700,
    }}>
      {icon} {label}
    </span>
  );
}

function iconBtnStyle(bg: string, color: string): React.CSSProperties {
  return {
    background: bg, color, border: 'none', borderRadius: '0.6rem',
    padding: '0.45rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
}

const metricaCardStyle: React.CSSProperties = {
  background: 'var(--color-surface-container-lowest)',
  borderRadius: '1.5rem', padding: '1.25rem',
  boxShadow: '0 8px 24px rgba(14,26,57,0.06)',
  border: '1px solid var(--color-surface-container-high)',
  display: 'flex', flexDirection: 'column', justifyContent: 'center',
  transition: 'transform 0.2s ease',
};
const metricaLabelStyle: React.CSSProperties = {
  margin: 0, fontSize: '0.65rem', fontWeight: 800,
  textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-on-surface-variant)',
};
const metricaValueStyle: React.CSSProperties = {
  margin: '0.2rem 0 0', fontSize: '2.5rem', fontWeight: 900,
  color: 'var(--color-primary)', lineHeight: 1, letterSpacing: '-0.05em',
};

// ── Modal Usuario ──────────────────────────────────────────────
function UsuarioModal({
  usuario, saving, onSave, onClose,
}: {
  usuario: Partial<Usuario>;
  saving: boolean;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [nombre,   setNombre]   = useState(usuario.nombre   ?? '');
  const [apellido, setApellido] = useState(usuario.apellido ?? '');
  const [email,    setEmail]    = useState(usuario.email    ?? '');
  const [rol,      setRol]      = useState<'ADMINISTRADOR' | 'PROFESOR' | 'PADRE'>(usuario.rol ?? 'PROFESOR');
  const [dni,      setDni]      = useState(usuario.dni      ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ nombre, apellido, email: email || undefined, rol, dni: dni || undefined });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: 'var(--color-surface)', borderRadius: '1.5rem', padding: '1.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {usuario.id ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--color-on-surface-variant)" /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Juan" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Apellido</label>
              <input value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Pérez" required style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Rol</label>
            <select value={rol} onChange={e => setRol(e.target.value as any)} style={inputStyle}>
              <option value="PROFESOR">🎓 Profesor</option>
              <option value="PADRE">👨‍👩‍👦 Padre / Tutor</option>
              <option value="ADMINISTRADOR">👑 Administrador</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Email (opcional)</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exitus.edu" type="email" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>DNI (para padres)</label>
            <input value={dni} onChange={e => setDni(e.target.value)} placeholder="12345678" style={inputStyle} />
          </div>
          <button type="submit" disabled={saving} style={{
            background: 'var(--color-primary)', color: 'white', border: 'none',
            borderRadius: '1rem', padding: '0.85rem', fontWeight: 800, fontSize: '0.95rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            opacity: saving ? 0.7 : 1,
          }}>
            <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Usuario'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Modal Alumno ───────────────────────────────────────────────
function AlumnoModal({
  alumno, saving, clubes, onSave, onClose,
}: {
  alumno: Partial<Alumno>;
  saving: boolean;
  clubes: any[];
  usuarios?: Usuario[];
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const padres = (usuarios ?? []).filter(u => u.rol === 'PADRE');
  const currentClubIds = (alumno as any).inscripciones?.map((i: any) => i.clubId) ?? [];
  const [nombre,   setNombre]   = useState((alumno as any).nombre   ?? '');
  const [apellido, setApellido] = useState((alumno as any).apellido ?? '');
  const [grado,    setGrado]    = useState((alumno as any).grado    ?? '');
  const [padreId,  setPadreId]  = useState<number | string>((alumno as any).padreId ?? '');
  const [selectedClubIds, setSelectedClubIds] = useState<number[]>(currentClubIds);

  // Estado para creación rápida de padre
  const [creandoPadre, setCreandoPadre] = useState(false);
  const [pNombre, setPNombre] = useState('');
  const [pApellido, setPApellido] = useState('');
  const [pDni, setPDni] = useState('');

  const toggleClub = (id: number) => {
    setSelectedClubIds(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { 
        nombre, 
        apellido, 
        grado, 
        clubIds: selectedClubIds,
        padreId: padreId === '' ? undefined : Number(padreId)
    };
    
    if (creandoPadre && pNombre && pApellido) {
        payload.nuevoPadre = { nombre: pNombre, apellido: pApellido, dni: pDni };
    }

    onSave(payload);
  };

  const GRADOS = [
    '1ro Primaria', '2do Primaria', '3ro Primaria', '4to Primaria', '5to Primaria', '6to Primaria',
    '1ro Secundaria', '2do Secundaria', '3ro Secundaria', '4to Secundaria', '5to Secundaria',
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: 'var(--color-surface)', borderRadius: '1.5rem', padding: '1.5rem', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {(alumno as any).id ? 'Editar Alumno' : 'Nuevo Alumno'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--color-on-surface-variant)" /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="María" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Apellido</label>
              <input value={apellido} onChange={e => setApellido(e.target.value)} placeholder="García" required style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Grado</label>
            <select value={grado} onChange={e => setGrado(e.target.value)} required style={inputStyle}>
              <option value="">— Selecciona un grado —</option>
              {GRADOS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={labelStyle}>Asignar Padre / Tutor</label>
              <button 
                type="button"
                onClick={() => setCreandoPadre(!creandoPadre)}
                style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase' }}
              >
                {creandoPadre ? '✕ Cancelar' : '+ Nuevo Padre'}
              </button>
            </div>

            {creandoPadre ? (
                <div style={{ background: 'var(--color-secondary-container)', padding: '0.85rem', borderRadius: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-on-secondary-container)', textTransform: 'uppercase' }}>Registro Rápido de Padre</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <input value={pNombre} onChange={e => setPNombre(e.target.value)} placeholder="Nombre Padre" style={{ ...inputStyle, padding: '0.5rem', fontSize: '0.8rem' }} />
                        <input value={pApellido} onChange={e => setPApellido(e.target.value)} placeholder="Apellido" style={{ ...inputStyle, padding: '0.5rem', fontSize: '0.8rem' }} />
                    </div>
                    <input value={pDni} onChange={e => setPDni(e.target.value)} placeholder="DNI / ID" style={{ ...inputStyle, padding: '0.5rem', fontSize: '0.8rem' }} />
                </div>
            ) : (
                <select value={padreId} onChange={e => setPadreId(e.target.value)} style={inputStyle}>
                    <option value="">— Sin padre asignado —</option>
                    {padres.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre} {p.apellido} ({p.dni || 'Sin DNI'})</option>
                    ))}
                </select>
            )}
          </div>
          
          <div>
            <label style={labelStyle}>Inscribir en Clubes</label>
            <div style={{ 
              display: 'flex', flexDirection: 'column', gap: '0.5rem', 
              maxHeight: '150px', overflowY: 'auto', padding: '0.75rem', 
              background: 'var(--color-surface-container-lowest)', borderRadius: '0.75rem',
              border: '1px solid var(--color-outline-variant)'
            }}>
              {clubes.map(c => {
                const isSelected = selectedClubIds.includes(c.id);
                return (
                  <label key={c.id} style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.6rem', 
                    cursor: 'pointer', padding: '0.4rem', borderRadius: '0.5rem',
                    background: isSelected ? 'var(--color-secondary-container)' : 'transparent',
                    transition: 'all 0.2s', fontSize: '0.85rem', fontWeight: 600,
                    color: isSelected ? 'var(--color-on-secondary-container)' : 'var(--color-on-surface)'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleClub(c.id)}
                      style={{ width: '1.1rem', height: '1.1rem', accentColor: 'var(--color-secondary)' }}
                    />
                    {c.nombre}
                  </label>
                );
              })}
              {clubes.length === 0 && <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', margin: 0 }}>No hay clubes disponibles</p>}
            </div>
          </div>

          <button type="submit" disabled={saving} style={{
            background: 'var(--color-secondary)', color: 'white', border: 'none',
            borderRadius: '1rem', padding: '0.85rem', fontWeight: 800, fontSize: '0.95rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            opacity: saving ? 0.7 : 1, marginTop: '0.5rem'
          }}>
            <GraduationCap size={16} /> {saving ? 'Guardando...' : 'Guardar Alumno'}
          </button>
        </form>
      </div>
    </div>
  );
}

