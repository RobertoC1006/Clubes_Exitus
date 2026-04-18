import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users, AlertTriangle, Award, TrendingUp,
  PlusCircle, Edit2, Trash2, UserCheck, CheckCircle,
  XCircle, Download, ChevronRight, X, Save,
  BarChart2, BookOpen, CreditCard, RefreshCw, UserPlus,
  GraduationCap,
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

  // Validando pago
  const [validandoPago, setValidandoPago] = useState<number | null>(null);

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

  const handleDeleteUsuario = async (id: number) => {
    if (!window.confirm('¿Eliminar este usuario? Esta acción es permanente.')) return;
    await fetch(`${API}/admin/usuarios/${id}`, { method: 'DELETE' });
    fetchProfesores();
  };

  const handleSaveAlumno = async (data: { nombre: string; apellido: string; grado: string; padreId?: number; clubIds?: number[] }) => {
    setSavingPersona(true);
    const isEdit = modalAlumno && 'id' in modalAlumno && (modalAlumno as any).id;
    const url    = isEdit ? `${API}/admin/alumnos/${(modalAlumno as any).id}` : `${API}/admin/alumnos`;
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) { const err = await res.json(); alert(err.message ?? 'Error al guardar'); }
      else { setModalAlumno(false); fetchAlumnos(); fetchMetricas(); }
    } catch { alert('Error de red'); }
    finally { setSavingPersona(false); }
  };

  const handleDeleteAlumno = async (id: number) => {
    if (!window.confirm('¿Eliminar este alumno? Se eliminarán sus registros de asistencia.')) return;
    await fetch(`${API}/admin/alumnos/${id}`, { method: 'DELETE' });
    fetchAlumnos(); fetchMetricas();
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

  const clubesRanking = metricas ? [...metricas.clubes].sort((a, b) => b.asistencia - a.asistencia) : [];

  return (
    <div className="app-container animate-enter" style={{ paddingBottom: '7rem' }}>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <section style={{ padding: '1.25rem 1.25rem 0' }}>
        <span style={{ color: 'var(--color-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>
          Command Center
        </span>
        <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em', lineHeight: 1, margin: '0.2rem 0 0.4rem 0' }}>
          Panel Global
        </h2>
        <p style={{ margin: 0, color: 'var(--color-on-surface-variant)', fontSize: '0.85rem', fontWeight: 500 }}>
          {metricas?.totalAlumnos ?? '…'} atletas · {metricas?.totalClubes ?? '…'} disciplinas
        </p>
      </section>


      <div style={{ padding: '1.25rem' }}>

        {/* ══════════ TAB: PANEL ════════════════════════════ */}
        {tab === 'panel' && metricas && (
          <>
            {/* BENTO MÉTRICAS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <div style={{
                gridColumn: '1 / -1',
                background: 'var(--color-primary-container)', borderRadius: '1.5rem',
                padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 8px 32px rgba(29,40,72,0.25)',
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-primary-container)' }}>Atletas Activos</p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '3.25rem', fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-0.04em' }}>{metricas.totalAlumnos}</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: 'var(--color-on-primary-container)', fontWeight: 600 }}>En {metricas.totalClubes} disciplinas activas</p>
                </div>
                <div style={{ width: '3.75rem', height: '3.75rem', borderRadius: '1.25rem', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={28} color="white" />
                </div>
              </div>

              <div style={metricaCardStyle}>
                <p style={metricaLabelStyle}>Asistencia</p>
                <p style={metricaValueStyle}>{metricas.asistenciaGlobal}%</p>
                <div style={{ marginTop: '0.6rem', height: '5px', borderRadius: '99px', background: 'var(--color-surface-container-high)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${metricas.asistenciaGlobal}%`, background: 'var(--color-secondary-container)', borderRadius: '99px', transition: 'width 1s ease' }} />
                </div>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.68rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>Promedio global</p>
              </div>

              <div style={metricaCardStyle}>
                <p style={metricaLabelStyle}>Instructores</p>
                <p style={metricaValueStyle}>{metricas.totalProfesores}</p>
                <p style={{ margin: '0.4rem 0 0', fontSize: '0.68rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>activos este ciclo</p>
              </div>
            </div>

            {/* ALERTAS */}
            {metricas.alertas.length > 0 && (
              <section style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <AlertTriangle size={15} color="var(--color-error)" />
                  <h3 style={{ margin: 0, fontSize: '0.83rem', fontWeight: 800, color: 'var(--color-primary)' }}>Requieren Atención</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {metricas.alertas.map((a, i) => (
                    <div key={i} style={{
                      background: 'var(--color-surface-container-lowest)', borderRadius: '1rem',
                      padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderLeft: '3px solid var(--color-error)',
                    }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-primary)' }}>{a.alumno}</p>
                        <p style={{ margin: 0, fontSize: '0.73rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>{a.club}</p>
                      </div>
                      <span style={{ background: 'var(--color-error-container)', color: 'var(--color-error)', padding: '0.3rem 0.65rem', borderRadius: '99px', fontSize: '0.68rem', fontWeight: 800 }}>
                        {a.faltas} faltas
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* RANKING */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Award size={15} color="var(--color-secondary)" />
                <h3 style={{ margin: 0, fontSize: '0.83rem', fontWeight: 800, color: 'var(--color-primary)' }}>Ranking de Clubes</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {clubesRanking.map((club, i) => (
                  <div key={club.id} style={{
                    background: 'var(--color-surface-container-lowest)', borderRadius: '1rem',
                    padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem',
                  }}>
                    <span style={{
                      width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0,
                      background: i === 0 ? 'var(--color-secondary-container)' : 'var(--color-surface-container-high)',
                      color: i === 0 ? 'var(--color-on-secondary-container)' : 'var(--color-on-surface-variant)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: '0.85rem',
                    }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-primary)' }}>{club.nombre}</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
                        {club.profesor} · {club.inscritos} alumnos
                      </p>
                    </div>
                    <span style={{ fontWeight: 900, fontSize: '1.1rem', color: club.asistencia >= 85 ? 'var(--color-success, #16a34a)' : 'var(--color-error)' }}>
                      {club.asistencia}%
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ══════════ TAB: CLUBES ═══════════════════════════ */}
        {tab === 'clubes' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                Gestión de Clubes ({metricas?.clubes.length ?? 0})
              </h3>
              <button onClick={() => setModalClub({})} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: 'var(--color-primary)', color: 'white', border: 'none',
                borderRadius: '99px', padding: '0.55rem 1rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
              }}>
                <PlusCircle size={15} /> Nuevo Club
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(metricas?.clubes ?? []).map(club => (
                <div key={club.id} style={{
                  background: 'var(--color-surface-container-lowest)', borderRadius: '1.25rem',
                  padding: '1.1rem 1.1rem 1.1rem 1.25rem',
                  borderLeft: '4px solid var(--color-secondary-container)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)' }}>{club.nombre}</p>
                      {club.descripcion && (
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>{club.descripcion}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', marginLeft: '0.5rem' }}>
                      <button onClick={() => setModalClub(club)} style={iconBtnStyle('#EEF2FF', 'var(--color-primary)')}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDeleteClub(club.id)} disabled={deletingId === club.id} style={iconBtnStyle('#FEE2E2', 'var(--color-error)')}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <Pill icon={<UserCheck size={12}/>} label={club.profesor} />
                    <Pill icon={<Users size={12}/>} label={`${club.inscritos} alumnos`} />
                    <Pill icon={<TrendingUp size={12}/>} label={`${club.asistencia}% asist.`}
                      color={club.asistencia >= 85 ? '#065F46' : 'var(--color-error)'}
                      bg={club.asistencia >= 85 ? '#D1FAE5' : 'var(--color-error-container)'} />
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
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {(['profesores', 'alumnos'] as const).map(st => (
                <button key={st} onClick={() => setPersonasTab(st)} style={{
                  flex: 1, padding: '0.6rem', borderRadius: '0.85rem', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.82rem',
                  background: personasTab === st ? 'var(--color-primary)' : 'var(--color-surface-container-low)',
                  color: personasTab === st ? 'white' : 'var(--color-on-surface-variant)',
                  transition: 'all 0.2s',
                }}>
                  {st === 'profesores' ? '🎓 Profesores' : '🏃 Alumnos'}
                </button>
              ))}
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
                  const grupo = usuarios.filter(u => u.rol === rol);
                  if (grupo.length === 0) return null;
                  const rolLabel = { ADMINISTRADOR: '👑 Administradores', PROFESOR: '🎓 Profesores', PADRE: '👨‍👩‍👦 Padres' }[rol];
                  const rolColor = { ADMINISTRADOR: 'var(--color-primary)', PROFESOR: 'var(--color-secondary)', PADRE: 'var(--color-on-surface-variant)' }[rol];
                  return (
                    <div key={rol} style={{ marginBottom: '1.25rem' }}>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: rolColor }}>
                        {rolLabel} ({grupo.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {grupo.map(u => (
                          <div key={u.id} style={{
                            background: 'var(--color-surface-container-lowest)', borderRadius: '1rem',
                            padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                          }}>
                            <div style={{
                              width: '2.5rem', height: '2.5rem', borderRadius: '0.65rem', flexShrink: 0,
                              background: 'var(--color-primary-container)', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', color: 'var(--color-primary)',
                            }}>
                              {(u.nombre[0] + (u.apellido[0] ?? '')).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontWeight: 800, fontSize: '0.88rem', color: 'var(--color-primary)' }}>
                                {u.nombre} {u.apellido}
                              </p>
                              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-on-surface-variant)' }}>
                                {u.email ?? (u.dni ? `DNI: ${u.dni}` : 'Sin contacto')}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button onClick={() => setModalUsuario(u)} style={iconBtnStyle('#EEF2FF', 'var(--color-primary)')}>
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDeleteUsuario(u.id)} style={iconBtnStyle('#FEE2E2', 'var(--color-error)')}>
                                <Trash2 size={14} />
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {alumnos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-on-surface-variant)' }}>
                      <GraduationCap size={40} strokeWidth={1.5} />
                      <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>No hay alumnos registrados</p>
                    </div>
                  ) : alumnos.map(alumno => (
                    <div key={alumno.id} style={{
                      background: 'var(--color-surface-container-lowest)', borderRadius: '1rem',
                      padding: '0.9rem 1rem 0.9rem 1.1rem',
                      borderLeft: '3px solid var(--color-secondary-container)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '2.5rem', height: '2.5rem', borderRadius: '0.65rem', flexShrink: 0,
                          background: 'var(--color-secondary-container)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', color: 'var(--color-secondary)',
                        }}>
                          {(alumno.nombre[0] + (alumno.apellido[0] ?? '')).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 800, fontSize: '0.88rem', color: 'var(--color-primary)' }}>
                            {alumno.nombre} {alumno.apellido}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-on-surface-variant)' }}>
                            {alumno.grado}
                            {alumno.inscripciones.length > 0 && ` · ${alumno.inscripciones.map(i => i.club.nombre).join(', ')}`}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button onClick={() => setModalAlumno(alumno)} style={iconBtnStyle('#EEF2FF', 'var(--color-primary)')}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteAlumno(alumno.id)} style={iconBtnStyle('#FEE2E2', 'var(--color-error)')}>
                            <Trash2 size={14} />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                Comprobantes de Pago
              </h3>
              <select value={pagoFiltro} onChange={e => setPagoFiltro(e.target.value)} style={{
                ...inputStyle, width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.78rem', fontWeight: 600,
              }}>
                <option value="">Todos</option>
                <option value="PENDIENTE">⏳ Pendientes</option>
                <option value="PAGADO">✅ Pagados</option>
                <option value="RECHAZADO">❌ Rechazados</option>
              </select>
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
                    <div key={pago.id} style={{
                      background: 'var(--color-surface-container-lowest)', borderRadius: '1.25rem', padding: '1.1rem',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                            {pago.alumno.nombre} {pago.alumno.apellido}
                          </p>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.73rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
                            {pago.club.nombre} · {pago.mes}
                          </p>
                          {pago.monto && (
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                              S/ {pago.monto.toFixed(2)}
                            </p>
                          )}
                        </div>
                        <span style={{
                          background: colors.bg, color: colors.fg,
                          padding: '0.3rem 0.75rem', borderRadius: '99px', fontSize: '0.68rem', fontWeight: 800,
                        }}>
                          {pago.estado === 'PENDIENTE' ? '⏳' : pago.estado === 'PAGADO' ? '✅' : '❌'} {pago.estado}
                        </span>
                      </div>

                      {pago.urlComprobante && (
                        <a href={pago.urlComprobante} target="_blank" rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.65rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>
                          <ChevronRight size={13} /> Ver comprobante
                        </a>
                      )}

                      {pago.observacion && (
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontStyle: 'italic', background: 'var(--color-surface-container-low)', padding: '0.5rem 0.75rem', borderRadius: '0.65rem' }}>
                          💬 {pago.observacion}
                        </p>
                      )}

                      {pago.estado === 'PENDIENTE' && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
                          <button
                            disabled={validandoPago === pago.id}
                            onClick={() => handleValidarPago(pago.id, 'PAGADO')}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#D1FAE5', color: '#065F46', border: 'none', borderRadius: '0.75rem', padding: '0.6rem', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
                            <CheckCircle size={14} /> Aprobar
                          </button>
                          <button
                            disabled={validandoPago === pago.id}
                            onClick={() => {
                              const obs = prompt('Motivo del rechazo (opcional):') ?? '';
                              handleValidarPago(pago.id, 'RECHAZADO', obs);
                            }}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: 'var(--color-error-container)', color: 'var(--color-error)', border: 'none', borderRadius: '0.75rem', padding: '0.6rem', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
                            <XCircle size={14} /> Rechazar
                          </button>
                        </div>
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
            <div style={{
              background: 'var(--color-primary-container)', borderRadius: '1.5rem',
              padding: '2rem 1.5rem', marginBottom: '1.5rem',
            }}>
              <Download size={48} color="white" strokeWidth={1.5} />
              <h3 style={{ color: 'white', fontWeight: 900, fontSize: '1.3rem', margin: '0.75rem 0 0.4rem' }}>
                Exportar Reporte
              </h3>
              <p style={{ color: 'var(--color-on-primary-container)', fontSize: '0.85rem', margin: 0 }}>
                Descarga el historial completo de asistencias como CSV compatible con Excel.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={handleExportarCSV} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                background: 'var(--color-primary)', color: 'white', border: 'none',
                borderRadius: '1rem', padding: '1rem', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
              }}>
                <Download size={18} /> Descargar Todos los Clubes
              </button>

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
  borderRadius: '1.25rem', padding: '1.1rem',
  boxShadow: '0 4px 16px rgba(14,26,57,0.04)',
};
const metricaLabelStyle: React.CSSProperties = {
  margin: 0, fontSize: '0.6rem', fontWeight: 800,
  textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-secondary)',
};
const metricaValueStyle: React.CSSProperties = {
  margin: '0.25rem 0 0', fontSize: '2.35rem', fontWeight: 900,
  color: 'var(--color-primary)', lineHeight: 1, letterSpacing: '-0.04em',
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
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const currentClubIds = (alumno as any).inscripciones?.map((i: any) => i.clubId) ?? [];
  const [nombre,   setNombre]   = useState((alumno as any).nombre   ?? '');
  const [apellido, setApellido] = useState((alumno as any).apellido ?? '');
  const [grado,    setGrado]    = useState((alumno as any).grado    ?? '');
  const [selectedClubIds, setSelectedClubIds] = useState<number[]>(currentClubIds);

  const toggleClub = (id: number) => {
    setSelectedClubIds(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ nombre, apellido, grado, clubIds: selectedClubIds });
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

