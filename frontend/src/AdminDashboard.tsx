import { useState, useEffect, useCallback } from 'react';
import {
  Users, AlertTriangle, Award, TrendingUp,
  PlusCircle, Edit2, Trash2, UserCheck,
  Download, ChevronRight, X, Save,
  BarChart2, BookOpen, CreditCard, RefreshCw,
  GraduationCap, Search, ChevronDown, FileText, ExternalLink,
  Check, Calendar, Clock, History
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './index.css';

import { API_BASE_URL } from './config';

const API = API_BASE_URL;

// ── Tipos ──────────────────────────────────────────────────────
interface Metricas {
  totalAlumnos: number;
  totalClubes: number;
  totalProfesores: number;
  asistenciaGlobal: number;
  rankingAsistencias: { alumno: string; club: string; cuenta: number }[];
  rankingAusencias: { alumno: string; club: string; cuenta: number }[];
  rankingJustificaciones: { alumno: string; club: string; cuenta: number }[];
  clubes: ClubMetrica[];
  alertas: { alumno: string; club: string; faltas: number }[];
}
interface ClubMetrica {
  id: number; nombre: string; descripcion: string | null;
  profesorId: number; profesor: string; inscritos: number; asistencia: number;
  horario: any | null;
}
interface Profesor { 
  id: number; 
  nombre: string; 
  apellido: string; 
  email: string; 
  clubes?: { id: number; nombre: string; horario: any }[];
}
interface Usuario { id: number; nombre: string; apellido: string; email: string; rol: 'ADMINISTRADOR' | 'PROFESOR' | 'PADRE'; dni: string; password?: string }
interface Alumno {
  id: number; nombre: string; apellido: string; grado: string;
  padreId?: number | null;
  padre?: { nombre: string; apellido: string } | null;
  inscripciones: { clubId: number; club: { nombre: string } }[];
  _count: { asistencias: number };
}
interface Pago {
  id: number; mes: string; monto: number | null; estado: 'PENDIENTE' | 'PAGADO' | 'RECHAZADO';
  urlComprobante: string | null; observacion: string | null;
  alumnoId: number;
  alumno: { nombre: string; apellido: string; grado: string };
  club: { nombre: string };
}

// ── Colores de estado ──────────────────────────────────────────
const estadoColor = {
  PENDIENTE: { bg: 'var(--color-warning-container, #FFF3CD)', fg: '#856404' },
  PAGADO: { bg: 'var(--color-success-container, #D1FAE5)', fg: '#065F46' },
  RECHAZADO: { bg: 'var(--color-error-container)', fg: 'var(--color-error)' },
};

// ── Modal de Club ──────────────────────────────────────────────
function ClubModal({
  club, profesores, onSave, onClose,
}: {
  club: Partial<ClubMetrica> | null;
  profesores: Profesor[];
  onSave: (data: { nombre: string; descripcion: string; profesorId: number; horario: any }) => void;
  onClose: () => void;
}) {
  const [nombre, setNombre] = useState(club?.nombre ?? '');
  const [desc, setDesc] = useState(club?.descripcion ?? '');
  const [profId, setProfId] = useState<number>(club?.profesorId ?? (profesores[0]?.id ?? 0));

  // Horario inicial: Lunes a Domingo desactivado por defecto
  const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  const initialHorario = (() => {
    if (!club?.horario) return {};
    if (typeof club.horario === 'string') {
      try { return JSON.parse(club.horario); } catch { return {}; }
    }
    return club.horario;
  })();

  const [horario, setHorario] = useState<any>(initialHorario);

  const toggleDia = (dia: string) => {
    setHorario((prev: any) => {
      let current = prev;
      if (typeof prev === 'string') {
        try { current = JSON.parse(prev); } catch { current = {}; }
      }
      const newHorario = { ...current };
      if (newHorario[dia]) {
        delete newHorario[dia];
      } else {
        newHorario[dia] = { start: '16:00', end: '17:30' };
      }
      return newHorario;
    });
  };

  const updateTime = (dia: string, key: 'start' | 'end', val: string) => {
    setHorario((prev: any) => {
      let current = prev;
      if (typeof prev === 'string') {
        try { current = JSON.parse(prev); } catch { current = {}; }
      }
      return {
        ...current,
        [dia]: { ...current[dia], [key]: val }
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !profId) return;
    onSave({ nombre, descripcion: desc, profesorId: profId, horario });
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

          <div>
            <label style={labelStyle}>Horario Semanal</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {DIAS.map(dia => {
                const activo = !!horario[dia];
                return (
                  <div key={dia} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem', borderRadius: '0.75rem',
                    background: activo ? 'var(--color-primary-fixed)' : 'var(--color-surface-container-low)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <input type="checkbox" checked={activo} onChange={() => toggleDia(dia)}
                        style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer', accentColor: 'var(--color-primary)' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: activo ? 'var(--color-primary)' : 'var(--color-outline)' }}>{dia}</span>
                    </div>
                    {activo && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <input type="time" value={horario[dia].start} onChange={e => updateTime(dia, 'start', e.target.value)}
                          style={timeInputStyle} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-primary)' }}>—</span>
                        <input type="time" value={horario[dia].end} onChange={e => updateTime(dia, 'end', e.target.value)}
                          style={timeInputStyle} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button type="submit" style={{
            background: 'var(--color-primary)', color: 'white', border: 'none',
            borderRadius: '1rem', padding: '0.85rem', fontWeight: 800, fontSize: '0.95rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            marginTop: '0.5rem'
          }}>
            <Save size={16} /> Guardar Club
          </button>
        </form>
      </div>
    </div>
  );
}

const timeInputStyle: React.CSSProperties = {
  background: 'white', border: '1px solid var(--color-primary-container)',
  borderRadius: '0.4rem', padding: '0.15rem 0.35rem', fontSize: '0.75rem',
  fontWeight: 800, color: 'var(--color-primary)', outline: 'none'
};

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = (searchParams.get('tab') || 'panel') as 'panel' | 'clubes' | 'personas' | 'pagos' | 'reporte' | 'horarios';
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [pagoFiltro, setPagoFiltro] = useState<string>('');
  const [pagoAlumnoFiltro, setPagoAlumnoFiltro] = useState<number | string>('');
  const [pagoClubFiltro, setPagoClubFiltro] = useState<number | string>('');
  const [tipoFiltroPago, setTipoFiltroPago] = useState<'ALUMNO' | 'CLUB'>('ALUMNO');

  // Horarios Filtros
  const [filtroProfHorario, setFiltroProfHorario] = useState('');
  const [activeDayMobile, setActiveDayMobile] = useState('Lunes');

  const DIAS_CALENDARIO = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const HORAS_START = 8;
  const HORAS_END = 22;
  const ROW_HEIGHT = 65; // px per hour

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const getPosForTime = (time: string) => {
    const min = timeToMinutes(time);
    const startMin = HORAS_START * 60;
    return ((min - startMin) / 60) * ROW_HEIGHT;
  };

  const getHeightForDuration = (start: string, end: string) => {
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);
    return ((endMin - startMin) / 60) * ROW_HEIGHT;
  };

  const normalizeDay = (dia: string) => {
    if (!dia) return '';
    const d = dia.toLowerCase();
    if (d.includes('lun')) return 'Lunes';
    if (d.includes('mar')) return 'Martes';
    if (d.includes('mi') || d.includes('mirc')) return 'Miércoles';
    if (d.includes('jue')) return 'Jueves';
    if (d.includes('vie')) return 'Viernes';
    if (d.includes('s') || d.includes('sba')) return 'Sábado';
    if (d.includes('d') || d.includes('dom')) return 'Domingo';
    return dia;
  };

  const getClubTheme = (clubName: string) => {
    const name = clubName.toLowerCase();
    if (name.includes('fút') || name.includes('fut')) return { grad: 'linear-gradient(135deg, #1e40af, #3b82f6)', main: '#3b82f6', light: '#dbeafe' };
    if (name.includes('natar') || name.includes('nata')) return { grad: 'linear-gradient(135deg, #0369a1, #0ea5e9)', main: '#0ea5e9', light: '#e0f2fe' };
    if (name.includes('ajed')) return { grad: 'linear-gradient(135deg, #1e293b, #475569)', main: '#475569', light: '#f1f5f9' };
    if (name.includes('danz')) return { grad: 'linear-gradient(135deg, #7e22ce, #a855f7)', main: '#a855f7', light: '#f3e8ff' };
    if (name.includes('rob')) return { grad: 'linear-gradient(135deg, #c2410c, #f97316)', main: '#f97316', light: '#ffedd5' };
    // Default Fénix
    return { grad: 'var(--grad-primary)', main: 'var(--color-primary)', light: 'var(--color-surface-container-highest)' };
  };
  const [filtroClubHorario, setFiltroClubHorario] = useState<number | string>('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Personas state
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [personasTab, setPersonasTab] = useState<'profesores' | 'alumnos'>('profesores');
  const [modalUsuario, setModalUsuario] = useState<Partial<Usuario> | false>(false);
  const [modalAlumno, setModalAlumno] = useState<Partial<Alumno> | false>(false);
  const [savingPersona, setSavingPersona] = useState(false);

  // Club modal state
  const [modalClub, setModalClub] = useState<Partial<ClubMetrica> | null | false>(false);
  const [modalPagosClub, setModalPagosClub] = useState<ClubMetrica | null | false>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Validando pago
  const [validandoPago, setValidandoPago] = useState<number | null>(null);
  const [expandedPagoId, setExpandedPagoId] = useState<number | null>(null);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  // Alumnos Inscritos Modal state
  const [isAlumnosInscritosModalOpen, setIsAlumnosInscritosModalOpen] = useState(false);
  const [currentPageAlumnosModal, setCurrentPageAlumnosModal] = useState(1);
  const [searchTermAlumnosModal, setSearchTermAlumnosModal] = useState('');

  // Pagination states
  const ITEMS_PER_PAGE = 5;
  const [currentPageClubes, setCurrentPageClubes] = useState(1);
  const [currentPageAlumnos, setCurrentPageAlumnos] = useState(1);
  const [currentPagePagos, setCurrentPagePagos] = useState(1);
  const [currentPageReportes, setCurrentPageReportes] = useState(1);
  const [currentPageRanking, setCurrentPageRanking] = useState(1);
  
  // Retención Modal state
  const [isRetencionModalOpen, setIsRetencionModalOpen] = useState(false);
  const [rankingSubTab, setRankingSubTab] = useState<'asistencias' | 'ausencias' | 'justificaciones'>('asistencias');
  const [currentPageRetencion, setCurrentPageRetencion] = useState(1);
  const [isProfesoresModalOpen, setIsProfesoresModalOpen] = useState(false);
  const [currentPageProfesores, setCurrentPageProfesores] = useState(1);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [pagesUsuarios, setPagesUsuarios] = useState<Record<string, number>>({
    ADMINISTRADOR: 1,
    PROFESOR: 1,
    PADRE: 1
  });
  
  // Sesiones Modal state
  const [modalSesiones, setModalSesiones] = useState<any | null>(null);
  const [sesionesClub, setSesionesClub] = useState<any[]>([]);
  const [loadingSesiones, setLoadingSesiones] = useState(false);
  const [currentPageSesiones, setCurrentPageSesiones] = useState(1);
  const [expandedSesionId, setExpandedSesionId] = useState<number | null>(null);

  // Reset pagination when search or tab changes
  useEffect(() => {
    setSearchTerm('');
    setCurrentPageClubes(1);
    setCurrentPageAlumnos(1);
    setCurrentPagePagos(1);
    setCurrentPageReportes(1);
    setCurrentPageRanking(1);
    setFiltroProfHorario('');
    setFiltroClubHorario('');
    setPagesUsuarios({ ADMINISTRADOR: 1, PROFESOR: 1, PADRE: 1 });
  }, [tab, personasTab]);

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

  const fetchSesiones = async (clubId: number) => {
    setLoadingSesiones(true);
    try {
      const res = await fetch(`${API}/admin/clubes/${clubId}/sesiones`);
      if (!res.ok) throw new Error();
      setSesionesClub(await res.json());
      setCurrentPageSesiones(1);
      setExpandedSesionId(null);
    } catch {
      alert('Error al cargar sesiones');
    } finally {
      setLoadingSesiones(false);
    }
  };

  const fetchPagos = useCallback(async () => {
    try {
      let url = `${API}/pagos?`;
      if (pagoFiltro) url += `estado=${pagoFiltro}&`;
      if (pagoAlumnoFiltro) url += `alumnoId=${pagoAlumnoFiltro}&`;
      if (pagoClubFiltro) url += `clubId=${pagoClubFiltro}&`;

      const res = await fetch(url);
      setPagos(await res.json());
    } catch { /* silently fail */ }
  }, [pagoFiltro, pagoAlumnoFiltro, pagoClubFiltro]);

  useEffect(() => { fetchMetricas(); fetchProfesores(); }, []);
  useEffect(() => {
    if (tab === 'pagos' || modalPagosClub !== false) fetchPagos();
  }, [tab, pagoFiltro, pagoAlumnoFiltro, pagoClubFiltro, modalPagosClub]);
  useEffect(() => { if (tab === 'personas') { fetchAlumnos(); fetchProfesores(); } }, [tab]);

  // ── CRUD Clubes ──────────────────────────────────────────────
  const handleSaveClub = async (data: { nombre: string; descripcion: string; profesorId: number; horario: any }) => {
    const isEdit = modalClub && 'id' in modalClub && modalClub.id;
    const url = isEdit ? `${API}/admin/clubes/${modalClub.id}` : `${API}/admin/clubes`;
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
    const url = isEdit ? `${API}/admin/usuarios/${(modalUsuario as any).id}` : `${API}/admin/usuarios`;
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
    const url = isEdit ? `${API}/admin/alumnos/${(modalAlumno as any).id}` : `${API}/admin/alumnos`;
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
    <div className="animate-enter" style={{ paddingBottom: '7rem' }}>

      <div className="pro-container" style={{ paddingBottom: '2.5rem', marginTop: '2rem' }}>

        {/* ══════════ TAB: PANEL ════════════════════════════ */}
        {tab === 'panel' && metricas && (
          <>
            {/* BENTO MÉTRICAS (Premium) */}
            <div className="bento-grid" style={{ marginBottom: '2.5rem' }}>
              <div className="bento-card" 
                onClick={async () => { 
                  if (alumnos.length === 0) await fetchAlumnos();
                  setIsAlumnosInscritosModalOpen(true); 
                }}
                style={{
                  gridColumn: '1 / -1',
                  background: 'var(--grad-primary)',
                  padding: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  boxShadow: '0 24px 48px rgba(29,40,72,0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px) scale(1.01)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
              >
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)' }}>Alumnos inscritos</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '5.5rem', fontWeight: 900, color: 'white', lineHeight: 0.9, letterSpacing: '-0.08em' }}>{metricas.totalAlumnos}</p>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                    <span style={{ padding: '0.4rem 0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.75rem', fontWeight: 800, border: '1px solid rgba(255,255,255,0.1)' }}>{metricas.totalClubes} clubes</span>
                    <span style={{ padding: '0.4rem 0.75rem', borderRadius: '0.75rem', background: 'var(--color-secondary)', color: 'var(--color-on-secondary)', fontSize: '0.75rem', fontWeight: 900 }}>Ver listado completo</span>
                  </div>
                </div>
                <div style={{ opacity: 0.15 }}>
                  <Users size={140} color="white" />
                </div>
                {/* Subtle shine effect */}
                <div style={{
                  position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%',
                  background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)',
                  transform: 'skewX(-25deg)',
                  animation: 'shimmer 3s infinite'
                }} />
              </div>

              <div className="bento-card"
                onClick={() => setIsRetencionModalOpen(true)}
                style={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '0.75rem', background: 'var(--color-success-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={16} color="var(--color-success)" />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-outline)', textTransform: 'uppercase' }}>Retención</p>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.05em' }}>{metricas?.asistenciaGlobal ?? 0}%</p>
                <div style={{ marginTop: '1rem', height: '8px', borderRadius: '99px', background: 'var(--color-surface-dim)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${metricas?.asistenciaGlobal ?? 0}%`, background: 'var(--color-success)', borderRadius: '99px', transition: 'width 1s ease' }} />
                </div>
                <p style={{ margin: '0.75rem 0 0', fontSize: '0.65rem', color: 'var(--color-outline)', fontWeight: 700, textTransform: 'uppercase' }}>Ver Rankings</p>
              </div>

              <div className="bento-card"
                onClick={async () => {
                  if (profesores.length === 0) await fetchProfesores();
                  setIsProfesoresModalOpen(true);
                }}
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '0.75rem', background: 'var(--color-primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={16} color="var(--color-primary)" />
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-outline)', textTransform: 'uppercase' }}>Profesores</p>
                </div>
                <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.05em' }}>{metricas?.totalProfesores ?? 0}</p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontWeight: 700 }}>Personal Activo</p>
                <p style={{ margin: '0.75rem 0 0', fontSize: '0.65rem', color: 'var(--color-outline)', fontWeight: 700, textTransform: 'uppercase' }}>Ver staff completo</p>
              </div>

              <div className="bento-card"
                onClick={() => setIsRankingModalOpen(true)}
                style={{ 
                  gridColumn: '1 / -1',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'white',
                  padding: '2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1.5px solid var(--color-secondary-container)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px) scale(1.01)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '0.75rem', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                      <Award size={16} color="var(--color-secondary)" />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Top Disciplinas</p>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>
                    {clubesRanking[0]?.nombre || 'Cargando...'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-secondary)' }}>{clubesRanking[0]?.asistencia ?? 0}%</p>
                      <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-outline)', textTransform: 'uppercase' }}>Asistencia Promedio</p>
                    </div>
                    <div style={{ width: '2px', height: '2rem', background: 'rgba(0,0,0,0.05)' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-primary)' }}>{clubesRanking[0]?.inscritos ?? 0}</p>
                      <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-outline)', textTransform: 'uppercase' }}>Alumnos Activos</p>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    width: '4.5rem', height: '4.5rem', borderRadius: '1.5rem', background: 'white', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 0 1rem auto',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.08)', fontSize: '2rem', fontWeight: 900, color: 'var(--color-secondary)'
                  }}>
                    1°
                  </div>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-secondary)', fontWeight: 800 }}>VER RANKING COMPLETO <ChevronRight size={14} style={{ verticalAlign: 'middle' }} /></p>
                </div>
              </div>
            </div>


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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(metricas?.clubes ?? [])
                .filter(c => (c.nombre?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) || (c.profesor?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()))
                .slice((currentPageClubes - 1) * ITEMS_PER_PAGE, currentPageClubes * ITEMS_PER_PAGE)
                .map(club => (
                  <div key={club.id} className="bento-card" style={{
                    padding: '1.75rem',
                    borderLeft: '6px solid var(--color-primary)',
                    background: 'white',
                    borderRadius: '1.2rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontWeight: 900, fontSize: '1.3rem', color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>{club.nombre}</h4>
                        {club.descripcion && (
                          <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: 'var(--color-on-surface-variant)', lineHeight: 1.5, fontWeight: 500 }}>{club.descripcion}</p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button onClick={() => setModalPagosClub(club)}
                          title="Ver Pagos del Club"
                          style={{ ...iconBtnStyle('var(--color-primary-fixed)', 'var(--color-primary)'), width: '2.5rem', height: '2.5rem' }}>
                          <CreditCard size={16} />
                        </button>
                        <button onClick={() => {
                            setModalSesiones(club);
                            fetchSesiones(club.id);
                          }}
                          title="Ver Asistencia"
                          style={{ ...iconBtnStyle('var(--color-secondary-container)', 'var(--color-on-secondary-container)'), width: '2.5rem', height: '2.5rem' }}>
                          <History size={16} />
                        </button>
                        <button onClick={() => setModalClub(club)}
                          style={{ ...iconBtnStyle('var(--color-surface-dim)', 'var(--color-primary)'), width: '2.5rem', height: '2.5rem' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteClub(club.id)} disabled={deletingId === club.id}
                          style={{ ...iconBtnStyle('rgba(211, 47, 47, 0.08)', 'var(--color-error)'), width: '2.5rem', height: '2.5rem' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                      <Pill icon={<UserCheck size={14} />} label={club.profesor} bg="var(--color-primary-container)" color="white" />
                      <Pill icon={<Users size={14} />} label={`${club.inscritos} alumnos`} bg="var(--color-surface-container-high)" color="var(--color-primary)" />
                      {club.horario && (
                        <Pill icon={<Calendar size={14} />} label={formatHorarioShort(club.horario)} bg="var(--color-secondary-container)" color="var(--color-on-secondary-container)" />
                      )}
                      <Pill icon={<TrendingUp size={14} />} label={`${club.asistencia}% racha`}
                        color={club.asistencia >= 85 ? 'var(--color-success)' : 'var(--color-error)'}
                        bg={club.asistencia >= 85 ? 'var(--color-success-container)' : 'var(--color-error-container)'} />
                    </div>
                  </div>
                ))}
            </div>

            <Pagination
              current={currentPageClubes}
              total={Math.ceil(((metricas?.clubes ?? []).filter(c => (c.nombre?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) || (c.profesor?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())).length) / ITEMS_PER_PAGE)}
              onChange={setCurrentPageClubes}
            />
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
                  {st === 'profesores' ? <GraduationCap size={18} /> : <Users size={18} />}
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

            {/* ─── Sub-tab: PROFESOR ─── */}
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
                  const itemsFiltered = usuarios.filter(u => u.rol === rol)
                    .filter(u => (`${u.nombre ?? ''} ${u.apellido ?? ''} ${u.email ?? ''} ${u.dni ?? ''}`).toLowerCase().includes(searchTerm.toLowerCase()));

                  if (itemsFiltered.length === 0) return null;

                  const paginatedItems = itemsFiltered.slice((pagesUsuarios[rol] - 1) * ITEMS_PER_PAGE, pagesUsuarios[rol] * ITEMS_PER_PAGE);
                  const rolLabel = { ADMINISTRADOR: 'Administradores', PROFESOR: 'Docentes', PADRE: 'Padres de Familia' }[rol];
                  const rolColor = { ADMINISTRADOR: 'var(--color-primary)', PROFESOR: 'var(--color-secondary)', PADRE: 'var(--color-outline)' }[rol];

                  return (
                    <div key={rol} style={{ marginBottom: '2rem' }}>
                      <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: rolColor, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 12, height: 2, background: rolColor, borderRadius: 2 }}></div>
                        {rolLabel} ({itemsFiltered.length})
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        {paginatedItems.map(u => (
                          <div key={u.id} className="bento-card animate-enter" style={{
                            padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'white',
                            borderLeft: `5px solid ${rolColor}`
                          }}>
                            <div style={{
                              width: '3.5rem', height: '3.5rem', borderRadius: '1.25rem', flexShrink: 0,
                              background: 'var(--color-surface-dim)', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-primary)',
                              boxShadow: 'var(--shadow-sm)'
                            }}>
                              {(u.nombre[0] + (u.apellido[0] ?? '')).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                                {u.nombre} {u.apellido}
                              </p>
                              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--color-outline)', fontWeight: 600 }}>
                                {u.email ?? (u.dni ? `DNI: ${u.dni}` : 'Sin correo registrado')}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                              <button onClick={() => setModalUsuario(u)} style={iconBtnStyle('var(--color-surface-dim)', 'var(--color-primary)')}>
                                <Edit2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Pagination
                        current={pagesUsuarios[rol]}
                        total={Math.ceil(itemsFiltered.length / ITEMS_PER_PAGE)}
                        onChange={(p) => setPagesUsuarios(prev => ({ ...prev, [rol]: p }))}
                      />
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
                    .slice((currentPageAlumnos - 1) * ITEMS_PER_PAGE, currentPageAlumnos * ITEMS_PER_PAGE)
                    .map(alumno => (
                      <div key={alumno.id} className="bento-card" style={{
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

                <Pagination
                  current={currentPageAlumnos}
                  total={Math.ceil(alumnos.filter(a => (`${a.nombre ?? ''} ${a.apellido ?? ''} ${a.grado ?? ''}`).toLowerCase().includes(searchTerm.toLowerCase())).length / ITEMS_PER_PAGE)}
                  onChange={setCurrentPageAlumnos}
                />
              </>
            )}
          </>
        )}

        {/* ══════════ TAB: PAGOS ════════════════════════════ */}
        {tab === 'pagos' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                  Finanzas <span style={{ color: 'var(--color-secondary)', fontSize: '0.8rem', background: 'var(--color-secondary-container)', padding: '0.2rem 0.6rem', borderRadius: '99px', marginLeft: '0.5rem' }}>{pagos.length}</span>
                </h3>

                {/* SELECTOR DE MODO */}
                <div style={{ background: 'var(--color-surface-container-high)', padding: '0.25rem', borderRadius: '1rem', display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={() => { setTipoFiltroPago('ALUMNO'); setPagoClubFiltro(''); }}
                    style={{
                      padding: '0.4rem 1rem', borderRadius: '0.8rem', border: 'none', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                      background: tipoFiltroPago === 'ALUMNO' ? 'white' : 'transparent',
                      color: tipoFiltroPago === 'ALUMNO' ? 'var(--color-primary)' : 'var(--color-outline)',
                      boxShadow: tipoFiltroPago === 'ALUMNO' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s'
                    }}>
                    👤 POR ALUMNO
                  </button>
                  <button
                    onClick={() => { setTipoFiltroPago('CLUB'); setPagoAlumnoFiltro(''); setSearchTerm(''); }}
                    style={{
                      padding: '0.4rem 1rem', borderRadius: '0.8rem', border: 'none', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                      background: tipoFiltroPago === 'CLUB' ? 'white' : 'transparent',
                      color: tipoFiltroPago === 'CLUB' ? 'var(--color-primary)' : 'var(--color-outline)',
                      boxShadow: tipoFiltroPago === 'CLUB' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s'
                    }}>
                    🏆 POR CLUB
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 2, minWidth: '250px' }}>
                  <input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder={tipoFiltroPago === 'ALUMNO' ? "Buscar por nombre de alumno..." : "Buscar por nombre de club..."}
                    style={{ ...inputStyle, paddingLeft: '2.5rem', borderRadius: '1.2rem', border: '1.5px solid var(--color-surface-container-high)', fontSize: '0.9rem', height: '3rem' }}
                  />
                  <Search size={18} color="var(--color-outline)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>

                <div style={{ position: 'relative' }}>
                  <select value={pagoFiltro} onChange={e => setPagoFiltro(e.target.value)} style={{
                    ...inputStyle, width: 'auto', padding: '0.5rem 2.8rem 0.5rem 1.2rem', fontSize: '0.85rem', fontWeight: 700,
                    borderRadius: '1.2rem', background: 'white', border: '1.5px solid var(--color-surface-container-high)', appearance: 'none', height: '3rem'
                  }}>
                    <option value="">Estado: Todos</option>
                    <option value="PENDIENTE">⏳ Realizados</option>
                    <option value="PAGADO">✅ Pagados</option>
                    <option value="RECHAZADO">❌ Rechazados</option>
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>

            {/* 💡 ESTUDIANTE SELECCIONADO: DETALLE ESPECIAL (Si el buscador tiene un nombre exacto o muy cercano) */}
            {/* 💡 ESTUDIANTE SELECCIONADO: DETALLE ESPECIAL (Si el buscador tiene un nombre exacto o muy cercano) */}
            {tipoFiltroPago === 'ALUMNO' && searchTerm.length >= 3 && alumnos.some(a => `${a.nombre} ${a.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())) && (
              (() => {
                const matchedAlumno = alumnos.find(a => `${a.nombre} ${a.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()));
                if (!matchedAlumno) return null;
                const filteredPagos = pagos.filter(p => Number(p.alumnoId) === matchedAlumno.id);
                if (filteredPagos.length === 0) return null;

                return (
                  <div className="bento-card animate-enter" style={{ padding: '1.5rem', background: 'var(--grad-primary)', color: 'white', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-5%', top: '-20%', opacity: 0.1 }}>
                      <Users size={120} color="white" />
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.15em' }}>Estatus Financiero del Alumno</span>
                          <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
                            {matchedAlumno.nombre} {matchedAlumno.apellido}
                          </h3>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1.1rem', flex: 1, backdropFilter: 'blur(10px)' }}>
                          <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase' }}>Pagados</p>
                          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>{filteredPagos.filter(p => p.estado === 'PAGADO').length}</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1.1rem', flex: 1, backdropFilter: 'blur(10px)' }}>
                          <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase' }}>Pendientes</p>
                          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>{filteredPagos.filter(p => p.estado === 'PENDIENTE').length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pagos
                .filter(p => {
                  const search = searchTerm.toLowerCase();
                  if (search.length < 3) return true;
                  if (tipoFiltroPago === 'ALUMNO') {
                    return (`${p.alumno.nombre} ${p.alumno.apellido}`).toLowerCase().includes(search);
                  } else {
                    return p.club.nombre.toLowerCase().includes(search);
                  }
                })
                .filter(p => pagoFiltro === '' || p.estado === pagoFiltro)
                .slice((currentPagePagos - 1) * ITEMS_PER_PAGE, currentPagePagos * ITEMS_PER_PAGE)
                .map(pago => {
                  const colors = estadoColor[pago.estado];
                  const isExpanded = expandedPagoId === pago.id;
                  return (
                    <div 
                      key={pago.id} 
                      className="bento-card" 
                      style={{
                        padding: '1.25rem', 
                        background: 'white',
                        cursor: 'pointer',
                        border: isExpanded ? '1.5px solid var(--color-primary)' : '1px solid var(--color-surface-container-high)',
                        boxShadow: isExpanded ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      onClick={() => setExpandedPagoId(isExpanded ? null : pago.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <div style={{ 
                            width: '3rem', height: '3rem', borderRadius: '1.1rem', 
                            background: isExpanded ? 'var(--color-primary-container)' : 'var(--color-surface-container-low)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.3s ease'
                          }}>
                            <CreditCard size={20} color={isExpanded ? 'white' : 'var(--color-primary)'} />
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
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                          <span style={{
                            background: colors.bg, color: colors.fg,
                            padding: '0.4rem 0.8rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 900,
                            textTransform: 'uppercase', letterSpacing: '0.05em'
                          }}>
                            {pago.estado}
                          </span>
                          <ChevronDown size={16} color="var(--color-outline)" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                        </div>
                      </div>

                      {/* SECCIÓN EXPANDIBLE: COMPROBANTE */}
                      {isExpanded && (
                        <div 
                          className="animate-enter"
                          style={{ 
                            marginTop: '1.25rem', 
                            paddingTop: '1.25rem', 
                            borderTop: '1.5px dashed var(--color-surface-container-high)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                           <div style={{ 
                             background: 'var(--color-surface-container-low)', 
                             borderRadius: '1.25rem', 
                             overflow: 'hidden',
                             border: '1px solid var(--color-surface-container-high)',
                             position: 'relative',
                             minHeight: '200px',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center'
                           }}>
                             {pago.urlComprobante ? (
                               <img 
                                 src={pago.urlComprobante.replace('/upload/', '/upload/w_800,c_limit,q_auto,f_auto/')} 
                                 alt="Comprobante de pago"
                                 style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: '400px', cursor: 'zoom-in' }}
                                 onClick={() => setViewerImage(pago.urlComprobante)}
                                 onError={(e) => {
                                    (e.target as any).src = 'https://placehold.co/600x400?text=Error+al+cargar+imagen';
                                 }}
                               />
                             ) : (
                               <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-outline)' }}>
                                 <FileText size={48} opacity={0.2} style={{ marginBottom: '0.5rem' }} />
                                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Sin comprobante adjunto</p>
                               </div>
                             )}
                           </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-surface-container-low)' }}>
                        <div>
                          {pago.monto && (
                            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                              S/ {pago.monto.toFixed(2)}
                            </p>
                          )}
                        </div>

                        {pago.estado === 'PENDIENTE' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
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

              <Pagination
                current={currentPagePagos}
                total={Math.ceil(pagos.filter(p => {
                  const search = searchTerm.toLowerCase();
                  if (search.length < 3) return true;
                  if (tipoFiltroPago === 'ALUMNO') {
                    return (`${p.alumno.nombre} ${p.alumno.apellido}`).toLowerCase().includes(search);
                  } else {
                    return p.club.nombre.toLowerCase().includes(search);
                  }
                })
                .filter(p => pagoFiltro === '' || p.estado === pagoFiltro).length / ITEMS_PER_PAGE)}
                onChange={setCurrentPagePagos}
              />
            </div>

          </>
        )}

        {/* ══════════ TAB: HORARIOS ═════════════════════════ */}
        {tab === 'horarios' && (
          <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header / Filtros */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>
                  Cronograma <span style={{ background: 'var(--grad-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Extracurricular</span>
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--color-outline)', fontWeight: 600 }}>Gestión centralizada de horarios y espacios</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Disciplina</label>
                  <select 
                    value={filtroClubHorario} 
                    onChange={e => setFiltroClubHorario(e.target.value)}
                    style={{ ...inputStyle, padding: '0.5rem 0.75rem', borderRadius: '0.75rem', fontSize: '0.8rem', minWidth: '160px' }}
                  >
                    <option value="">Todas las disciplinas</option>
                    {(metricas?.clubes ?? []).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Profesor</label>
                  <select 
                    value={filtroProfHorario} 
                    onChange={e => setFiltroProfHorario(e.target.value)}
                    style={{ ...inputStyle, padding: '0.5rem 0.75rem', borderRadius: '0.75rem', fontSize: '0.8rem', minWidth: '160px' }}
                  >
                    <option value="">Cualquier profesor</option>
                    {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Day Selector */}
            <div className="mobile-day-selector" style={{ 
              display: 'none', 
              gap: '0.5rem', 
              overflowX: 'auto', 
              paddingBottom: '0.5rem',
              scrollbarWidth: 'none'
            }}>
              {DIAS_CALENDARIO.map(dia => (
                <button
                  key={dia}
                  onClick={() => setActiveDayMobile(dia)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '1rem',
                    border: 'none',
                    background: activeDayMobile === dia ? 'var(--grad-primary)' : 'var(--color-surface-container-low)',
                    color: activeDayMobile === dia ? 'white' : 'var(--color-outline)',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  {dia}
                </button>
              ))}
            </div>

            {/* Calendar Pro Container */}
            <div className="calendar-pro-wrapper" style={{ 
              background: 'rgb(241, 243, 245)', // Lighter background for the container
              borderRadius: '1.5rem', 
              border: '1px solid var(--color-surface-container-high)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', position: 'relative' }}>
                
                {/* Time Axis (Left) */}
                <div style={{ 
                  width: '64px', 
                  flexShrink: 0, 
                  borderRight: '1px solid rgba(0,0,0,0.08)',
                  background: 'rgba(255,255,255,0.8)',
                  paddingTop: '40px' 
                }}>
                  {Array.from({ length: HORAS_END - HORAS_START + 1 }, (_, i) => HORAS_START + i).map(h => (
                    <div key={h} style={{ 
                      height: `${ROW_HEIGHT}px`, 
                      position: 'relative',
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 900, 
                        color: 'var(--color-primary)', 
                        position: 'absolute',
                        top: '-8px',
                        background: 'white',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        zIndex: 10
                      }}>
                        {h}:00
                      </span>
                    </div>
                  ))}
                </div>

                {/* Grid Area */}
                <div className="calendar-grid-container" style={{ 
                  flex: 1, 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  position: 'relative',
                  background: 'white' // White grid for cards to stand out on
                }}>
                  {DIAS_CALENDARIO.map((dia, dIdx) => {
                    const clubsDelDiaRaw = (metricas?.clubes ?? [])
                      .map(c => {
                        let parsed = c.horario;
                        if (typeof c.horario === 'string') {
                          try { parsed = JSON.parse(c.horario); } catch { parsed = null; }
                        }
                        
                        // Normalizer: allow finding the day even if it has encoding issues
                        let config = null;
                        if (parsed) {
                          const keys = Object.keys(parsed);
                          const matchingKey = keys.find(k => normalizeDay(k) === dia);
                          if (matchingKey) config = parsed[matchingKey];
                        }

                        return { ...c, horarioParsed: parsed, config };
                      })
                      .filter(c => {
                        const matchesFiltro = (!filtroClubHorario || c.id === Number(filtroClubHorario)) && 
                                              (!filtroProfHorario || c.profesorId === Number(filtroProfHorario));
                        return matchesFiltro && c.config;
                      });

                    // Overlap Detection
                    const processedClubs = clubsDelDiaRaw.map((club, i) => {
                      const concurrent = clubsDelDiaRaw.filter((other, j) => {
                        if (i === j) return false;
                        const s1 = timeToMinutes(club.config.start);
                        const e1 = timeToMinutes(club.config.end);
                        const s2 = timeToMinutes(other.config.start);
                        const e2 = timeToMinutes(other.config.end);
                        // Check if time ranges overlap
                        return s1 < e2 && s2 < e1;
                      });
                      
                      // For a simple split, we look at position in the concurrent list
                      // This is a basic "smart grid" approach
                      const colIndex = concurrent.filter(other => other.id < club.id).length;
                      const maxCols = concurrent.length + 1;

                      return { ...club, colIndex, maxCols };
                    });

                    return (
                      <div key={dia} className={`calendar-day-col ${activeDayMobile === dia ? 'is-active-mobile' : ''}`} style={{ 
                        borderRight: dIdx < 6 ? '1px solid var(--color-surface-container-lowest)' : 'none',
                        position: 'relative',
                        minHeight: `${(HORAS_END - HORAS_START + 1) * ROW_HEIGHT}px`
                      }}>
                        {/* Day Header */}
                        <div style={{ 
                          height: '40px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          borderBottom: '1px solid var(--color-surface-container-high)',
                          background: 'rgba(255,255,255,0.3)',
                          position: 'sticky',
                          top: 0,
                          zIndex: 5
                        }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{dia}</span>
                        </div>

                        {/* Hour Lines Background */}
                        <div style={{ position: 'absolute', inset: '40px 0 0 0', pointerEvents: 'none' }}>
                           {Array.from({ length: HORAS_END - HORAS_START + 1 }, (_, i) => (
                             <div key={i} style={{ height: `${ROW_HEIGHT}px`, borderBottom: '1px solid rgba(0,0,0,0.06)' }}></div>
                           ))}
                        </div>

                        {/* Session Cards */}
                        <div style={{ position: 'absolute', inset: '40px 4px 0 4px' }}>
                          {processedClubs.map(club => {
                            const width = 100 / club.maxCols;
                            const left = club.colIndex * width;
                            const theme = getClubTheme(club.nombre);

                            return (
                              <div key={`${club.id}-${dia}`} 
                                className="schedule-card-pro"
                                style={{
                                  position: 'absolute',
                                  left: `${left}%`,
                                  width: `calc(${width}% - 4px)`,
                                  top: `${getPosForTime(club.config.start)}px`,
                                  height: `${getHeightForDuration(club.config.start, club.config.end)}px`,
                                  padding: '0.5rem',
                                  background: 'white',
                                  borderRadius: '0.8rem',
                                  zIndex: 2,
                                  borderLeft: `4px solid ${theme.main}`,
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                  overflow: 'hidden',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.15rem',
                                  transition: 'all 0.3s',
                                  boxSizing: 'border-box',
                                  margin: '0 2px'
                                }}
                              >
                                 <div style={{ 
                                   position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: theme.grad, opacity: 0.8
                                 }}></div>
                                 <p style={{ margin: '2px 0 0', fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                   {club.nombre}
                                 </p>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Clock size={10} color={theme.main} />
                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: theme.main }}>{club.config.start}</span>
                                 </div>
                                 
                                 <div className="card-hover-extra" style={{
                                   position: 'absolute', inset: 0, background: theme.grad, color: 'white',
                                   padding: '0.6rem', opacity: 0, visibility: 'hidden', transition: 'all 0.3s', zIndex: 10,
                                   display: 'flex', flexDirection: 'column', justifyContent: 'center'
                                 }}>
                                    <p style={{ margin: '0 0 0.2rem', fontSize: '0.8rem', fontWeight: 900 }}>{club.nombre}</p>
                                    <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 700, opacity: 0.9 }}>Prof. {club.profesor}</p>
                                    <div style={{ marginTop: '0.4rem', background: 'rgba(255,255,255,0.25)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 900, alignSelf: 'flex-start' }}>
                                      {club.config.start} - {club.config.end}
                                    </div>
                                 </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            <style>{`
              @media (max-width: 900px) {
                .mobile-day-selector { display: flex !important; }
                .calendar-grid-container { grid-template-columns: 1fr !important; }
                .calendar-day-col { display: none; }
                .calendar-day-col.is-active-mobile { display: block !important; }
                .calendar-day-col { border-right: none !important; }
              }
              .schedule-card-pro:hover {
                transform: scale(1.02);
                z-index: 10 !important;
                box-shadow: var(--shadow-lg);
              }
              .schedule-card-pro:hover .card-hover-extra {
                opacity: 1 !important;
                visibility: visible !important;
              }
              .mobile-day-selector::-webkit-scrollbar { display: none; }
            `}</style>
          </div>
        )}

        {/* ══════════ TAB: REPORTE ══════════════════════════ */}
        {tab === 'reporte' && (
          <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
            <div className="bento-card" style={{
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

              {(metricas?.clubes ?? [])
                .slice((currentPageReportes - 1) * ITEMS_PER_PAGE, currentPageReportes * ITEMS_PER_PAGE)
                .map(club => (
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

              <Pagination
                current={currentPageReportes}
                total={Math.ceil((metricas?.clubes ?? []).length / ITEMS_PER_PAGE)}
                onChange={setCurrentPageReportes}
              />
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

      {/* ── MODAL ALUMNOS INSCRITOS ──────────────────────── */}
      {isAlumnosInscritosModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setIsAlumnosInscritosModalOpen(false)}>
          <div style={{
            background: 'var(--color-surface)', borderRadius: '2rem', padding: '2.5rem',
            width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.05em' }}>
                  Alumnos <span style={{ color: 'var(--color-secondary)' }}>Inscritos</span>
                </h3>
                <p style={{ margin: '0.4rem 0 0', fontSize: '0.9rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
                  Listado global y asignación de disciplinas.
                </p>
              </div>
              <button onClick={() => setIsAlumnosInscritosModalOpen(false)} style={{ background: 'var(--color-surface-dim)', border: 'none', borderRadius: '1.25rem', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                <X size={24} color="var(--color-primary)" />
              </button>
            </div>

            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <input
                value={searchTermAlumnosModal}
                onChange={e => { setSearchTermAlumnosModal(e.target.value); setCurrentPageAlumnosModal(1); }}
                placeholder="Buscar alumno por nombre o apellido..."
                style={{ ...inputStyle, paddingLeft: '3.2rem', borderRadius: '1.25rem', height: '3.5rem', background: 'var(--color-surface-container-lowest)', fontSize: '1rem' }}
              />
              <Search size={22} color="var(--color-outline)" style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(() => {
                const filtered = alumnos.filter(a => `${a.nombre} ${a.apellido}`.toLowerCase().includes(searchTermAlumnosModal.toLowerCase()));
                const paginated = filtered.slice((currentPageAlumnosModal - 1) * 5, currentPageAlumnosModal * 5);
                const totalPages = Math.ceil(filtered.length / 5);

                if (filtered.length === 0) return (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-outline)' }}>
                    <Users size={48} strokeWidth={1} style={{ opacity: 0.3 }} />
                    <p style={{ marginTop: '1rem', fontWeight: 600 }}>No se encontraron alumnos</p>
                  </div>
                );

                return (
                  <>
                    {paginated.map(alumno => (
                      <div key={alumno.id} style={{
                        padding: '1.25rem', borderRadius: '1.25rem', background: 'var(--color-surface-container-lowest)',
                        border: '1px solid var(--color-surface-container-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        transition: 'transform 0.2s ease'
                      }}>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                          <div style={{ 
                            width: '3.5rem', height: '3.5rem', borderRadius: '1.2rem', 
                            background: 'var(--grad-secondary)', color: 'var(--color-on-secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem'
                          }}>
                            {(alumno.nombre[0] + (alumno.apellido[0] ?? '')).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                              {alumno.nombre} {alumno.apellido}
                            </p>
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--color-outline)', fontWeight: 700 }}>
                              {alumno.grado} • {alumno.padre ? `Padre: ${alumno.padre.nombre}` : 'Sin tutor'}
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '200px' }}>
                          {alumno.inscripciones.length > 0 ? alumno.inscripciones.map((ins, idx) => (
                            <span key={idx} style={{ 
                              fontSize: '0.6rem', fontWeight: 900, background: 'var(--color-primary-container)', 
                              color: 'white', padding: '0.25rem 0.6rem', borderRadius: '99px', textTransform: 'uppercase'
                            }}>
                              {ins.club.nombre}
                            </span>
                          )) : (
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-error)', fontStyle: 'italic' }}>
                              Sin clubes
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    <Pagination 
                      current={currentPageAlumnosModal}
                      total={totalPages}
                      onChange={setCurrentPageAlumnosModal}
                    />
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROFESORES */}
      {isProfesoresModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
          padding: '1.5rem', animation: 'fadeIn 0.3s'
        }}>
          <div className="modal-content animate-pop" style={{
            background: 'var(--color-surface)', width: '100%', maxWidth: '550px',
            borderRadius: '2.5rem', padding: '2.5rem', position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
          }}>
            <button onClick={() => setIsProfesoresModalOpen(false)} style={{
              position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--color-surface-container-high)',
              border: 'none', width: '3rem', height: '3rem', borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}>
              <X size={20} color="var(--color-primary)" />
            </button>

            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
              <div style={{ 
                width: '4rem', height: '4rem', borderRadius: '1.25rem', background: 'var(--color-primary-container)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                boxShadow: '0 8px 16px rgba(var(--color-primary-rgb), 0.2)'
              }}>
                <Award size={24} color="var(--color-primary)" />
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)', margin: '0 0 0.5rem', letterSpacing: '-0.04em' }}>Staff Docente</h2>
              <p style={{ margin: 0, color: 'var(--color-outline)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Gestión de Expertos</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {profesores.length > 0 ? (
                <>
                  {profesores
                    .slice((currentPageProfesores - 1) * 5, currentPageProfesores * 5)
                    .map((prof, i) => (
                      <div key={prof.id} style={{ 
                        padding: '1.5rem', borderRadius: '1.75rem', background: 'white', 
                        border: '1px solid var(--color-surface-container-low)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
                          <div style={{ 
                            width: '3.2rem', height: '3.2rem', borderRadius: '1.1rem', background: 'var(--color-surface-dim)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-primary)'
                          }}>
                            {prof.nombre.charAt(0)}{prof.apellido.charAt(0)}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 900, fontSize: '1.15rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{prof.nombre} {prof.apellido}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-outline)', fontWeight: 700 }}>{prof.email || 'Sin correo registrado'}</p>
                          </div>
                        </div>
                        
                        <div style={{ 
                          background: 'var(--color-surface-container-lowest)', padding: '1rem 1.25rem', 
                          borderRadius: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
                          border: '1px solid var(--color-surface-container-low)'
                        }}>
                          {prof.clubes && prof.clubes.length > 0 ? prof.clubes.map((c: any) => (
                            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-secondary)' }}></div>
                                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-primary)' }}>{c.nombre}</span>
                              </div>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-outline)', background: 'white', padding: '0.2rem 0.6rem', borderRadius: '0.5rem', border: '1px solid var(--color-surface-container-high)' }}>
                                {formatHorarioShort(c.horario)}
                              </span>
                            </div>
                          )) : (
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-outline)', fontStyle: 'italic', textAlign: 'center' }}>Sin clubes asignados</p>
                          )}
                        </div>
                      </div>
                    ))}
                  <Pagination 
                    current={currentPageProfesores} 
                    total={Math.ceil(profesores.length / 5)} 
                    onChange={setCurrentPageProfesores} 
                  />
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <Users size={48} color="var(--color-surface-container-high)" style={{ marginBottom: '1rem' }} />
                  <p style={{ margin: 0, color: 'var(--color-outline)', fontWeight: 600 }}>Cargando staff docente...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RANKING DISCIPLINAS */}
      {isRankingModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
          padding: '1.5rem', animation: 'fadeIn 0.3s'
        }}>
          <div className="modal-content animate-pop" style={{
            background: 'var(--color-surface)', width: '100%', maxWidth: '600px',
            borderRadius: '2.5rem', padding: '2.5rem', position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
          }}>
            <button onClick={() => setIsRankingModalOpen(false)} style={{
              position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--color-surface-dim)',
              border: 'none', width: '3rem', height: '3rem', borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}>
              <X size={20} color="var(--color-primary)" />
            </button>

            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <div style={{ 
                width: '4rem', height: '4rem', borderRadius: '1.25rem', background: 'var(--color-secondary-container)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                boxShadow: '0 8px 16px rgba(var(--color-secondary-rgb), 0.2)'
              }}>
                <Award size={24} color="var(--color-secondary)" />
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)', margin: '0 0 0.5rem', letterSpacing: '-0.04em' }}>Ranking de Disciplinas</h2>
              <p style={{ margin: 0, color: 'var(--color-outline)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Basado en niveles de asistencia</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {clubesRanking
                  .slice((currentPageRanking - 1) * ITEMS_PER_PAGE, currentPageRanking * ITEMS_PER_PAGE)
                  .map((club, i) => {
                    const rank = (currentPageRanking - 1) * ITEMS_PER_PAGE + i + 1;
                    return (
                      <div key={club.id} style={{
                        padding: '1.25rem', borderRadius: '1.5rem', background: 'white', 
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        border: '1px solid var(--color-surface-container-low)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}>
                        <div style={{
                          width: '2.8rem', height: '2.8rem', borderRadius: '1rem',
                          background: rank <= 3 ? 'var(--grad-gold)' : 'var(--color-surface-container-high)',
                          color: rank <= 3 ? 'var(--color-on-secondary)' : 'var(--color-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900,
                          fontSize: '1.2rem', boxShadow: rank <= 3 ? '0 4px 12px rgba(212, 175, 55, 0.3)' : 'none'
                        }}>
                          {rank}
                        </div>
                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => {
                          setIsRankingModalOpen(false);
                          navigate(`/clubes/${club.id}/historial`);
                        }}>
                          <p style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                            {club.nombre}
                          </p>
                          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.15rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 700 }}>{club.profesor}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 900 }}>• {club.inscritos} alumnos</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ display: 'block', fontWeight: 900, fontSize: '1.4rem', color: club.asistencia >= 85 ? 'var(--color-success)' : 'var(--color-warning)', lineHeight: 1 }}>
                            {club.asistencia}%
                          </span>
                          <span style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--color-outline)', textTransform: 'uppercase' }}>Asistencia</span>
                        </div>
                      </div>
                    );
                  })}
                
                <Pagination current={currentPageRanking} total={Math.ceil(clubesRanking.length / ITEMS_PER_PAGE)} onChange={setCurrentPageRanking} />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HISTORIAL DE SESIONES */}
      {modalSesiones && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
          padding: '1.5rem', animation: 'fadeIn 0.3s'
        }}>
          <div className="modal-content animate-pop" style={{
            background: 'var(--color-surface)', width: '100%', maxWidth: '600px',
            borderRadius: '2.5rem', padding: '2.5rem', position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflowY: 'auto', maxHeight: '90vh'
          }}>
            <button onClick={() => setModalSesiones(null)} style={{
              position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--color-surface-dim)',
              border: 'none', width: '3rem', height: '3rem', borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}>
              <X size={20} color="var(--color-primary)" />
            </button>

            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <div style={{ 
                width: '4rem', height: '4rem', borderRadius: '1.25rem', background: 'var(--color-secondary-container)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                boxShadow: '0 8px 16px rgba(var(--color-secondary-rgb), 0.2)'
              }}>
                <History size={24} color="var(--color-secondary)" />
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)', margin: '0 0 0.5rem', letterSpacing: '-0.04em' }}>Historial</h2>
              <p style={{ margin: 0, color: 'var(--color-outline)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>{modalSesiones.nombre}</p>
            </div>

            {loadingSesiones ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div className="animate-spin" style={{ width: '2.5rem', height: '2.5rem', border: '3px solid var(--color-surface-dim)', borderTopColor: 'var(--color-secondary)', borderRadius: '50%', margin: '0 auto' }}></div>
              </div>
            ) : sesionesClub.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-outline)' }}>
                 No hay sesiones registradas aún.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {sesionesClub
                  .slice((currentPageSesiones - 1) * ITEMS_PER_PAGE, currentPageSesiones * ITEMS_PER_PAGE)
                  .map((sesion) => {
                    const pres = sesion.asistencias.filter((a: any) => a.estado === 'PRESENTE').length;
                    const aus = sesion.asistencias.filter((a: any) => a.estado === 'AUSENTE').length;
                    const jus = sesion.asistencias.filter((a: any) => a.estado === 'JUSTIFICADO').length;
                    const total = sesion.asistencias.length;
                    const isExpanded = expandedSesionId === sesion.id;

                    return (
                      <div key={sesion.id} style={{
                        padding: '1.25rem', borderRadius: '1.5rem', background: 'white', 
                        border: '1px solid var(--color-surface-container-low)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                              {new Date(sesion.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--color-outline)', fontWeight: 600 }}>
                              {sesion.tema || 'Sin tema específico'}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
                              <span title="Presentes" style={{ background: 'var(--color-success-container)', color: 'var(--color-success)', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 900 }}>{pres}</span>
                              <span title="Ausentes" style={{ background: 'var(--color-error-container)', color: 'var(--color-error)', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 900 }}>{aus}</span>
                              <span title="Justificados" style={{ background: 'var(--color-warning-container)', color: 'var(--color-warning)', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 900 }}>{jus}</span>
                            </div>
                            <button 
                              onClick={() => setExpandedSesionId(isExpanded ? null : sesion.id)}
                              style={{ border: 'none', background: 'none', color: 'var(--color-secondary)', fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}
                            >
                              {isExpanded ? 'OCULTAR DETALLE ↑' : 'VER ASISTENCIA ↓'}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-surface-container-low)' }}>
                            {sesion.asistencias.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {sesion.asistencias.map((a: any) => (
                                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{a.alumno.nombre} {a.alumno.apellido}</span>
                                    <span style={{ 
                                      padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 900,
                                      background: a.estado === 'PRESENTE' ? 'var(--color-success-container)' : a.estado === 'AUSENTE' ? 'var(--color-error-container)' : 'var(--color-warning-container)',
                                      color: a.estado === 'PRESENTE' ? 'var(--color-success)' : a.estado === 'AUSENTE' ? 'var(--color-error)' : 'var(--color-warning)'
                                    }}>
                                      {a.estado}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontSize: '0.8rem', color: 'var(--color-outline)', textAlign: 'center' }}>No hay registros en esta sesión.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                
                <Pagination current={currentPageSesiones} total={Math.ceil(sesionesClub.length / ITEMS_PER_PAGE)} onChange={setCurrentPageSesiones} />
              </div>
            )}
          </div>
        </div>
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

      {/* ── MODAL RETENCIÓN ─────────────────────────────── */}
      {isRetencionModalOpen && metricas && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setIsRetencionModalOpen(false)}>
          <div style={{
            background: 'var(--color-surface)', borderRadius: '2rem', padding: '2.5rem',
            width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)'
          }} onClick={e => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.05em' }}>
                  Análisis de <span style={{ color: 'var(--color-secondary)' }}>Retención</span>
                </h3>
                <p style={{ margin: '0.4rem 0 0', fontSize: '0.9rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
                  Compromiso, asistencia y tendencias de los alumnos.
                </p>
              </div>
              <button onClick={() => setIsRetencionModalOpen(false)} style={{ background: 'var(--color-surface-dim)', border: 'none', borderRadius: '1.25rem', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={24} color="var(--color-primary)" />
              </button>
            </div>

            {/* Centered Pill Switcher for Rankings */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
              <div style={{ 
                display: 'flex', background: 'var(--color-surface-container-low)', 
                padding: '0.3rem', borderRadius: '1.5rem', gap: '0.2rem',
                border: '1px solid var(--color-surface-container-high)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
              }}>
                {[
                  { id: 'asistencias', label: 'Asistencias', color: 'var(--color-success)', icon: <Award size={16} /> },
                  { id: 'ausencias', label: 'Ausencias', color: 'var(--color-error)', icon: <AlertTriangle size={16} /> },
                  { id: 'justificaciones', label: 'Justificaciones', color: '#EAB308', icon: <History size={16} /> }
                ].map(st => (
                  <button 
                    key={st.id} 
                    onClick={() => { setRankingSubTab(st.id as any); setCurrentPageRetencion(1); }}
                    title={st.label}
                    style={{
                      padding: '1rem', borderRadius: '1.2rem', border: 'none', cursor: 'pointer',
                      background: rankingSubTab === st.id ? st.color : 'transparent',
                      color: rankingSubTab === st.id ? 'white' : 'var(--color-outline)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: rankingSubTab === st.id ? `0 4px 12px ${st.color}44` : 'none',
                      width: '3.5rem', height: '3.5rem'
                    }}
                  >
                    {st.icon}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(() => {
                const dataKey = rankingSubTab === 'asistencias' ? 'rankingAsistencias' : 
                              rankingSubTab === 'ausencias' ? 'rankingAusencias' : 'rankingJustificaciones';
                const list = metricas[dataKey] || [];
                const paginated = list.slice((currentPageRetencion - 1) * 5, currentPageRetencion * 5);
                const totalPages = Math.ceil(list.length / 5);
                const currentThemeColor = rankingSubTab === 'asistencias' ? 'var(--color-success)' : 
                                        rankingSubTab === 'ausencias' ? 'var(--color-error)' : '#EAB308';

                if (list.length === 0) return (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--color-surface-container-lowest)', borderRadius: '1.5rem', border: '1.5px dashed var(--color-surface-container-high)' }}>
                    <p style={{ margin: 0, color: 'var(--color-outline)', fontWeight: 600 }}>No hay datos suficientes para generar este ranking.</p>
                  </div>
                );

                return (
                  <>
                    {paginated.map((item, i) => (
                      <div key={i} className="ranking-item" style={{ 
                        padding: '1.25rem', borderRadius: '1.5rem', background: 'white', 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        border: '1px solid var(--color-surface-container-low)',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                      }}>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                          <div style={{ 
                            width: '2.8rem', height: '2.8rem', borderRadius: '1rem', background: 'var(--color-surface-dim)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', 
                            color: currentThemeColor, border: `2px solid ${currentThemeColor}11`
                          }}>{(currentPageRetencion - 1) * 5 + i + 1}</div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{item.alumno}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-outline)', fontWeight: 700 }}>{item.club}</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', background: 'var(--color-surface-dim)', padding: '0.6rem 1.2rem', borderRadius: '1.2rem', border: '1px solid var(--color-surface-container-high)' }}>
                          <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: currentThemeColor, letterSpacing: '-0.03em' }}>{item.cuenta}</p>
                          <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-outline)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registros</p>
                        </div>
                      </div>
                    ))}
                    <style>{`
                      .ranking-item:hover {
                        transform: translateX(5px);
                        border-color: ${currentThemeColor}33;
                        background: var(--color-surface-container-lowest);
                      }
                    `}</style>
                    <Pagination current={currentPageRetencion} total={totalPages} onChange={setCurrentPageRetencion} />
                  </>
                );
              })()}
            </div>

          </div>
        </div>
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

      {/* ── MODAL PAGOS CLUB ─────────────────────────────── */}
      {modalPagosClub && (
        <PagosClubModal
          clubId={modalPagosClub.id}
          clubNombre={modalPagosClub.nombre}
          pagos={pagos}
          onValidate={handleValidarPago}
          onShowImage={setViewerImage}
          onClose={() => setModalPagosClub(false)}
        />
      )}

      {/* ── VISOR DE IMÁGENES ────────────────────────────── */}
      {viewerImage && (
        <ImageViewer 
          url={viewerImage} 
          onClose={() => setViewerImage(null)} 
        />
      )}

    </div>
  );
}

// ── Sub-componentes Adicionales ────────────────────────────────
function PagosClubModal({ clubId, clubNombre, pagos, onValidate, onShowImage, onClose }: {
  clubId: number;
  clubNombre: string;
  pagos: Pago[];
  onValidate: (id: number, estado: 'PAGADO' | 'RECHAZADO', obs?: string) => void;
  onShowImage: (url: string) => void;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPagoId, setExpandedPagoId] = useState<number | null>(null);
  const clubPagos = pagos.filter(p => p.club.nombre === clubNombre)
    .filter(p => (`${p.alumno.nombre} ${p.alumno.apellido}`).toLowerCase().includes(searchTerm.toLowerCase()));

  const pagados = clubPagos.filter(p => p.estado === 'PAGADO');
  const pendientes = clubPagos.filter(p => p.estado === 'PENDIENTE');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={onClose}>
      <div style={{
        background: 'var(--color-surface)', borderRadius: '2rem', padding: '2rem',
        width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)'
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>
              Pagos: <span style={{ color: 'var(--color-secondary)' }}>{clubNombre}</span>
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--color-outline)', fontWeight: 700 }}>
              Control financiero detallado de la disciplina
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--color-surface-dim)', border: 'none', borderRadius: '1rem', width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={20} color="var(--color-primary)" />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--color-success-container)', padding: '1rem', borderRadius: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-success)', textTransform: 'uppercase' }}>Realizados</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-success)' }}>{pagados.length}</p>
            </div>
            <Check size={24} color="var(--color-success)" style={{ opacity: 0.3 }} />
          </div>
          <div style={{ background: 'var(--color-error-container)', padding: '1rem', borderRadius: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-error)', textTransform: 'uppercase' }}>Pendientes</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-error)' }}>{pendientes.length}</p>
            </div>
            <Clock size={24} color="var(--color-error)" style={{ opacity: 0.3 }} />
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de alumno..."
            style={{ ...inputStyle, paddingLeft: '2.8rem', borderRadius: '1.1rem', background: 'var(--color-surface-container-lowest)' }}
          />
          <Search size={18} color="var(--color-outline)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {clubPagos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-outline)', fontStyle: 'italic' }}>
              No se encontraron pagos vinculados a este filtro.
            </div>
          ) : clubPagos.map(p => {
            const colors = estadoColor[p.estado];
            const isExpanded = expandedPagoId === p.id;
            return (
              <div 
                key={p.id} 
                style={{
                  padding: '1.25rem', 
                  borderRadius: '1.25rem', 
                  background: isExpanded ? 'white' : 'var(--color-surface-container-lowest)',
                  border: isExpanded ? '1.5px solid var(--color-primary)' : '1px solid var(--color-surface-container-low)',
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: isExpanded ? 'var(--shadow-md)' : 'none',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setExpandedPagoId(isExpanded ? null : p.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                    <div style={{ 
                      width: '2.5rem', height: '2.5rem', borderRadius: '0.85rem', 
                      background: isExpanded ? 'var(--color-primary-container)' : colors.bg, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                      <CreditCard size={18} color={isExpanded ? 'white' : colors.fg} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-primary)' }}>{p.alumno.nombre} {p.alumno.apellido}</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-outline)', fontWeight: 700 }}>{p.mes} • S/ {(p.monto ?? 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {p.estado === 'PENDIENTE' ? (
                      <div style={{ display: 'flex', gap: '0.35rem' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => onValidate(p.id, 'PAGADO')} style={iconBtnStyle('var(--color-success-container)', 'var(--color-success)')}>
                          <Check size={16} strokeWidth={3} />
                        </button>
                        <button onClick={() => {
                          const obs = prompt('Motivo del rechazo:') ?? '';
                          onValidate(p.id, 'RECHAZADO', obs);
                        }} style={iconBtnStyle('var(--color-error-container)', 'var(--color-error)')}>
                          <X size={16} strokeWidth={3} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: colors.fg, textTransform: 'uppercase', background: colors.bg, padding: '0.25rem 0.6rem', borderRadius: '99px' }}>
                        {p.estado}
                      </span>
                    )}
                    <ChevronDown size={14} color="var(--color-outline)" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                  </div>
                </div>

                {/* SECCIÓN EXPANDIBLE EN MODAL */}
                {isExpanded && (
                  <div 
                    className="animate-enter"
                    style={{ 
                      marginTop: '0.75rem', 
                      paddingTop: '0.75rem', 
                      borderTop: '1px dashed var(--color-surface-container-high)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div style={{ 
                      background: 'var(--color-surface-container-low)', 
                      borderRadius: '1rem', 
                      overflow: 'hidden',
                      border: '1px solid var(--color-surface-container-high)',
                      minHeight: '150px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {p.urlComprobante ? (
                        <img 
                          src={p.urlComprobante.replace('/upload/', '/upload/w_600,c_limit,q_auto,f_auto/')} 
                          alt="Comprobante"
                          style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: '300px', cursor: 'zoom-in' }}
                          onClick={() => onShowImage(p.urlComprobante!)}
                          onError={(e) => {
                            (e.target as any).src = 'https://placehold.co/400x300?text=Error+al+cargar+imagen';
                          }}
                        />
                      ) : (
                        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-outline)' }}>
                          <FileText size={32} opacity={0.2} style={{ marginBottom: '0.25rem' }} />
                          <p style={{ fontSize: '0.7rem', fontWeight: 600 }}>Sin comprobante</p>
                        </div>
                      )}
                    </div>
                    {p.observacion && (
                      <div style={{ background: 'var(--color-surface-container-low)', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--color-surface-container-high)' }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', fontStyle: 'italic', fontWeight: 600 }}>
                          Motivo: “{p.observacion}”
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
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

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.25rem', padding: '0.5rem 0' }}>
      <button
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        style={{ ...iconBtnStyle(current === 1 ? 'var(--color-surface-container-lowest)' : 'var(--color-surface-container-high)', 'var(--color-primary)'), opacity: current === 1 ? 0.3 : 1, width: '2.2rem', height: '2.2rem', boxShadow: current === 1 ? 'none' : 'var(--shadow-sm)' }}>
        <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
      </button>
      <div style={{
        background: 'var(--color-surface-container-low)',
        padding: '0.4rem 1rem',
        borderRadius: '99px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-primary)' }}>{current}</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-outline)', opacity: 0.5 }}>/</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-outline)' }}>{total}</span>
      </div>
      <button
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        style={{ ...iconBtnStyle(current === total ? 'var(--color-surface-container-lowest)' : 'var(--color-surface-container-high)', 'var(--color-primary)'), opacity: current === total ? 0.3 : 1, width: '2.2rem', height: '2.2rem', boxShadow: current === total ? 'none' : 'var(--shadow-sm)' }}>
        <ChevronRight size={18} />
      </button>
    </div>
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
  const [nombre, setNombre] = useState(usuario.nombre ?? '');
  const [apellido, setApellido] = useState(usuario.apellido ?? '');
  const [rol, setRol] = useState<'ADMINISTRADOR' | 'PROFESOR' | 'PADRE'>(usuario.rol ?? 'PROFESOR');
  const [dni, setDni] = useState(usuario.dni ?? '');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ nombre, apellido, rol, dni, password: password || undefined });
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
            <label style={labelStyle}>DNI (Usuario para login)</label>
            <input value={dni} onChange={e => setDni(e.target.value)} placeholder="12345678" style={inputStyle} required />
          </div>
          {!usuario.id && (
            <div>
              <label style={labelStyle}>Contraseña Inicial</label>
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" style={inputStyle} required={!usuario.id} />
            </div>
          )}
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
  alumno, saving, clubes, usuarios, onSave, onClose,
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
  const [nombre, setNombre] = useState((alumno as any).nombre ?? '');
  const [apellido, setApellido] = useState((alumno as any).apellido ?? '');
  const [grado, setGrado] = useState((alumno as any).grado ?? '');
  const [padreId, setPadreId] = useState<number | string>((alumno as any).padreId ?? '');
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


// ── Utilidades ──────────────────────────────────────────────
function formatHorarioShort(horario: any): string {
  if (!horario) return 'Por definir';
  
  let parsed = horario;
  if (typeof horario === 'string') {
    try { 
      parsed = JSON.parse(horario); 
    } catch { 
      return 'Error horario'; 
    }
  }

  if (!parsed || typeof parsed !== 'object') return 'Por definir';

  const daysOrdered = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const activeDays = daysOrdered.filter(d => parsed[d]);
  
  if (activeDays.length === 0) return 'Sin horario';

  // Agrupar por horario idéntico
  const groups: { hours: string, days: string[] }[] = [];
  activeDays.forEach(day => {
    const hours = `${parsed[day].start}-${parsed[day].end}`;
    const group = groups.find(g => g.hours === hours);
    if (group) group.days.push(day);
    else groups.push({ hours, days: [day] });
  });

  return groups.map(g => {
    const daysStr = g.days.map(d => d.substring(0, 3)).join(',');
    return `${daysStr}: ${g.hours}`;
  }).join(' | ');
}

function ImageViewer({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000, 
      background: 'rgba(10,15,30,0.92)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }} onClick={onClose}>
      <button 
        onClick={onClose}
        style={{
          position: 'absolute', top: '1.5rem', right: '1.5rem', 
          background: 'rgba(255,255,255,0.15)', border: 'none', 
          width: '3rem', height: '3rem', borderRadius: '1.2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          cursor: 'pointer', color: 'white', zIndex: 10
        }}
      >
        <X size={24} />
      </button>
      
      <div 
        style={{ position: 'relative', maxWidth: '95vw', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        <img 
          src={url.replace('/upload/', '/upload/w_1200,c_limit,q_auto,f_auto/')}
          alt="Comprobante extendido"
          style={{ width: 'auto', maxHeight: '90vh', borderRadius: '1.5rem', boxShadow: '0 32px 100px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <div style={{
          position: 'absolute', bottom: '-2.5rem', left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', pointerEvents: 'none'
        }}>
          <AlertTriangle size={14} /> Haz clic fuera para cerrar
        </div>
      </div>
    </div>
  );
}
