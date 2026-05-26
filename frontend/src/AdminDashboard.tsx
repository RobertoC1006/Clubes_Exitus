import { useState, useEffect, useCallback } from 'react';
import {
  Users, AlertTriangle, Award, TrendingUp,
  PlusCircle, Edit2, Trash2, UserCheck,
  Download, ChevronRight, X, Save,
  BarChart2, BookOpen, CreditCard, RefreshCw,
  GraduationCap, Search, ChevronDown, FileText, ExternalLink,
  Check, Calendar, Clock, History, CheckCircle,
  Ban, ShieldAlert, UserX, AlertCircle, MapPin, QrCode, ClipboardList, Navigation, Map
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './index.css';

import { API_BASE_URL } from './config';
import { fetchWithAuth } from './utils/fetchWithAuth';
import { normalizeDay, formatHorarioShort, formatHorarioFull } from './utils/formatters';
import { Pagination } from './components/ui/Pagination';
import { StatusPill as Pill } from './components/ui/StatusPill';
import { ImageViewer } from './components/ui/ImageViewer';

import type { Metricas, ClubMetrica, Profesor, Usuario, Alumno, Pago, Aula, AsistenciaDocente } from './types';
import { estadoColor } from './utils/constants';
import { labelStyle, inputStyle, timeInputStyle, iconBtnStyle, metricaCardStyle, metricaLabelStyle, metricaValueStyle } from './styles/adminStyles';

// Modales
import { ClubModal } from './components/modals/ClubModal';
import { UsuarioModal } from './components/modals/UsuarioModal';
import { AlumnoModal } from './components/modals/AlumnoModal';
import { AlumnosInscritosModal } from './components/modals/AlumnosInscritosModal';
import { ProfesoresModal } from './components/modals/ProfesoresModal';
import { RankingDisciplinasModal } from './components/modals/RankingDisciplinasModal';
import { PagosClubModal } from './components/modals/PagosClubModal';
import { AulaModal } from './components/modals/AulaModal';
import { SesionesModal } from './components/modals/SesionesModal';
import { RetencionModal } from './components/modals/RetencionModal';
import { ConfirmModal } from './components/modals/ConfirmModal';
import { PaymentActionModal } from './components/modals/PaymentActionModal';

// API
const API = API_BASE_URL;





// ══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = (searchParams.get('tab') || 'panel') as 'panel' | 'clubes' | 'personas' | 'pagos' | 'reporte' | 'horarios' | 'aulas' | 'asistencia-docente';
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [pagoFiltro, setPagoFiltro] = useState<string>('');
  const [pagoAlumnoFiltro, setPagoAlumnoFiltro] = useState<number | string>('');
  const [pagoClubFiltro, setPagoClubFiltro] = useState<number | string>('');
  const [tipoFiltroPago, setTipoFiltroPago] = useState<'ALUMNO' | 'CLUB'>('ALUMNO');

  // ── ESTADO: AULAS ────────────────────────────────
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loadingAulas, setLoadingAulas] = useState(false);
  const [isAulaModalOpen, setIsAulaModalOpen] = useState(false);
  const [editingAula, setEditingAula] = useState<Aula | null>(null);

  // ── ESTADO: ASISTENCIA DOCENTE ────────────────────
  const [asistenciaDocente, setAsistenciaDocente] = useState<AsistenciaDocente[]>([]);
  const [loadingAsistenciaDocente, setLoadingAsistenciaDocente] = useState(false);
  const [filtroProfesorId, setFiltroProfesorId] = useState<number | string>('');

  // ── CALIBRACIÓN GPS (5 puntos: 4 esquinas + centro) ──────────────────────────────
  const [calibrando, setCalibrando] = useState(false);
  const [muestras, setMuestras] = useState<{ lat: number, lng: number, accuracy: number, label: string }[]>([]);
  const [calibracionProgreso, setCalibracionProgreso] = useState(0);
  const [calibracionPaso, setCalibracionPaso] = useState(0); // 0-4 (5 puntos)
  const [calibracionCompletada, setCalibracionCompletada] = useState(false);
  const PUNTOS_CALIBRACION = [
    { label: 'Esquina 1 (Frente-Izquierda)', icon: '↖️' },
    { label: 'Esquina 2 (Frente-Derecha)', icon: '↗️' },
    { label: 'Esquina 3 (Fondo-Izquierda)', icon: '↙️' },
    { label: 'Esquina 4 (Fondo-Derecha)', icon: '↘️' },
    { label: 'Centro del Aula', icon: '⭐' },
  ];

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


  const fetchAulas = async () => {
    setLoadingAulas(true);
    try {
      const res = await fetchWithAuth('/admin/aulas');
      const data = await res.json();
      setAulas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAulas(false);
    }
  };

  const fetchAsistenciaDocente = async () => {
    setLoadingAsistenciaDocente(true);
    try {
      const query = filtroProfesorId ? `?profesorId=${filtroProfesorId}` : '';
      const res = await fetchWithAuth(`/admin/asistencia-docente${query}`);
      const data = await res.json();
      setAsistenciaDocente(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAsistenciaDocente(false);
    }
  };

  const iniciarCalibracion = () => {
    setCalibrando(true);
    setMuestras([]);
    setCalibracionProgreso(0);
    setCalibracionPaso(0);
    setCalibracionCompletada(false);
  };

  const capturarPuntoCalibrado = () => {
    const pasoActual = calibracionPaso;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nuevaMuestra = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          label: PUNTOS_CALIBRACION[pasoActual].label
        };
        setMuestras(prev => {
          const upd = [...prev, nuevaMuestra];
          setCalibracionProgreso((upd.length / 5) * 100);
          return upd;
        });

        if (pasoActual >= 4) {
          // Completado: 5 puntos capturados
          setCalibrando(false);
          setCalibracionCompletada(true);
        } else {
          setCalibracionPaso(pasoActual + 1);
        }
      },
      (err) => {
        console.error(err);
        alert(`Error GPS en ${PUNTOS_CALIBRACION[pasoActual].label}. Verifica permisos e intenta de nuevo.`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
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
  // Horarios & Responsive states
  const [filtroClubHorario, setFiltroClubHorario] = useState<number | string>('');
  const [filtroProfHorario, setFiltroProfHorario] = useState<number | string>('');
  const [activeDayMobile, setActiveDayMobile] = useState('Lunes');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setShowFilters(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Personas state
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [personasTab, setPersonasTab] = useState<'administradores' | 'profesores' | 'padres' | 'alumnos'>('administradores');
  const [modalUsuario, setModalUsuario] = useState<Partial<Usuario> | null>(null);
  const [modalAlumno, setModalAlumno] = useState<Partial<Alumno> | null>(null);
  const [savingPersona, setSavingPersona] = useState(false);

  // Club modal state
  const [modalClub, setModalClub] = useState<Partial<ClubMetrica> | null>(null);
  const [modalPagosClub, setModalPagosClub] = useState<ClubMetrica | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; title: string; type: 'CLUB' } | null>(null);


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
  const [currentPageAsistenciaDocente, setCurrentPageAsistenciaDocente] = useState(1);
  const ITEMS_PER_PAGE_DOCENTE = 4;


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
    setCurrentPageAsistenciaDocente(1);
  }, [tab, personasTab]);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'DANGER' | 'WARNING' | 'SUCCESS';
    onConfirm: () => void;
    icon?: React.ReactNode;
    isAlert?: boolean;
  }>({
    show: false, title: '', message: '', type: 'WARNING', onConfirm: () => { }
  });

  // Payment Validation Modal state
  const [paymentActionModal, setPaymentActionModal] = useState<{
    show: boolean,
    pago: any | null,
    type: 'VALIDAR' | 'RECHAZAR',
    observacion: string
  }>({ show: false, pago: null, type: 'VALIDAR', observacion: '' });

  // Payment Validation Modal state

  // ── Fetch ────────────────────────────────────────────────────
  const fetchMetricas = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetchWithAuth('/admin/metricas');
      if (!res.ok) throw new Error('Error al cargar métricas');
      setMetricas(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const fetchProfesores = useCallback(async () => {
    try {
      const [profRes, usrRes] = await Promise.all([
        fetchWithAuth('/admin/profesores'),
        fetchWithAuth('/admin/usuarios'),
      ]);
      setProfesores(await profRes.json());
      setUsuarios(await usrRes.json());
    } catch { /* silently fail */ }
  }, []);

  const fetchAlumnos = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/admin/alumnos');
      setAlumnos(await res.json());
    } catch { /* silently fail */ }
  }, []);

  const fetchSesiones = async (clubId: number) => {
    setLoadingSesiones(true);
    try {
      const res = await fetchWithAuth(`/admin/clubes/${clubId}/sesiones`);
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

      const res = await fetchWithAuth(url.replace(API, ''));
      setPagos(await res.json());
    } catch { /* silently fail */ }
  }, [pagoFiltro, pagoAlumnoFiltro, pagoClubFiltro]);

  useEffect(() => { fetchMetricas(); fetchProfesores(); }, []);
  useEffect(() => {
    if (tab === 'pagos' || modalPagosClub !== null) fetchPagos();
  }, [tab, pagoFiltro, pagoAlumnoFiltro, pagoClubFiltro, modalPagosClub]);
  useEffect(() => { if (tab === 'personas') { fetchAlumnos(); fetchProfesores(); } }, [tab]);
  useEffect(() => { if (tab === 'aulas') fetchAulas(); }, [tab]);
  useEffect(() => { if (tab === 'asistencia-docente') fetchAsistenciaDocente(); }, [tab, filtroProfesorId]);

  // ── CRUD Clubes ──────────────────────────────────────────────
  const handleSaveClub = async (data: { nombre: string; descripcion: string; precio: number; profesorId: number; horario: any }) => {
    const isEdit = modalClub && 'id' in modalClub && modalClub.id;
    const path = isEdit ? `/admin/clubes/${modalClub.id}` : `/admin/clubes`;
    const method = isEdit ? 'PUT' : 'POST';
    await fetchWithAuth(path, { method, body: JSON.stringify(data) });
    setModalClub(null);
    fetchMetricas();
  };

  const handleDeleteClub = async (id: number) => {
    setDeletingId(id);
    await fetchWithAuth(`/admin/clubes/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    setConfirmDelete(null);
    fetchMetricas();
  };

  // ── Validar Pago ─────────────────────────────────────────────
  const handleValidarPago = async (id: number, estado: 'PAGADO' | 'RECHAZADO', observacion = '') => {
    setValidandoPago(id);
    await fetchWithAuth(`/pagos/${id}/validar`, {
      method: 'PUT',
      body: JSON.stringify({ estado, observacion }),
    });
    setValidandoPago(null);
    fetchPagos();
  };

  const handleToggleUsuarioStatus = async (id: number, estado: string) => {
    try {
      await fetchWithAuth(`/admin/usuarios/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });
      fetchProfesores();
    } catch { alert('Error al cambiar estado'); }
  };

  const handleDeleteUsuario = async (id: number) => {
    try {
      const res = await fetchWithAuth(`/admin/usuarios/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProfesores();
        fetchAlumnos();
      } else {
        const err = await res.json();
        alert(err.message || 'Error al eliminar');
      }
    } catch { alert('Error de red'); }
  };

  const handleExportarCSV = () => {
    window.open(`${API}/admin/reporte/asistencia`, '_blank');
  };

  // ── CRUD Personas ─────────────────────────────────────────────
  const handleSaveUsuario = async (data: Partial<Usuario>) => {
    setSavingPersona(true);
    const isEdit = modalUsuario && 'id' in modalUsuario && (modalUsuario as any).id;
    const path = isEdit ? `/admin/usuarios/${(modalUsuario as any).id}` : `/admin/usuarios`;
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetchWithAuth(path, { method, body: JSON.stringify(data) });
      if (!res.ok) {
        const err = await res.json();
        setConfirmModal({
          show: true, title: 'Error', message: err.message ?? 'Error al guardar', type: 'DANGER', isAlert: true, onConfirm: () => { }
        });
      } else {
        setModalUsuario(null);
        fetchProfesores();
      }
    } catch {
      setConfirmModal({
        show: true, title: 'Error de Red', message: 'No se pudo conectar con el servidor', type: 'DANGER', isAlert: true, onConfirm: () => { }
      });
    } finally {
      setSavingPersona(false);
    }
  };

  const handleResetPassword = async (id: number) => {
    setConfirmModal({
      show: true,
      title: 'Resetear Contraseña',
      message: '¿Estás seguro de que deseas resetear la contraseña de este usuario? Se establecerá como "123456" y se le pedirá cambiarla en su próximo inicio de sesión.',
      type: 'WARNING',
      icon: <RefreshCw size={32} color="var(--color-warning)" />,
      onConfirm: async () => {
        try {
          const res = await fetchWithAuth(`/admin/usuarios/${id}/reset-password`, { method: 'PATCH' });
          if (res.ok) {
            setConfirmModal({
              show: true,
              title: 'Éxito',
              message: 'Contraseña reseteada con éxito (123456)',
              type: 'SUCCESS',
              isAlert: true,
              onConfirm: () => { }
            });
          } else {
            const err = await res.json();
            setConfirmModal({
              show: true,
              title: 'Error',
              message: err.message || 'Error al resetear',
              type: 'DANGER',
              isAlert: true,
              onConfirm: () => { }
            });
          }
        } catch {
          setConfirmModal({
            show: true,
            title: 'Error de Red',
            message: 'No se pudo conectar con el servidor',
            type: 'DANGER',
            isAlert: true,
            onConfirm: () => { }
          });
        }
      }
    });
  };

  const handleSaveAlumno = async (data: { nombre: string; apellido: string; grado: string; padreId?: number; clubIds?: number[]; nuevoPadre?: any }) => {
    setSavingPersona(true);
    const isEdit = modalAlumno && 'id' in modalAlumno && (modalAlumno as any).id;
    const path = isEdit ? `/admin/alumnos/${(modalAlumno as any).id}` : `/admin/alumnos`;
    const method = isEdit ? 'PUT' : 'POST';
    try {
      // Si hay un nuevo padre, lo creamos primero
      let finalPadreId = data.padreId;
      if (data.nuevoPadre) {
        const pRes = await fetchWithAuth('/admin/usuarios', {
          method: 'POST',
          body: JSON.stringify({ ...data.nuevoPadre, rol: 'PADRE' })
        });
        if (pRes.ok) {
          const pData = await pRes.json();
          finalPadreId = pData.id;
        }
      }

      const res = await fetchWithAuth(path, {
        method,
        body: JSON.stringify({ ...data, padreId: finalPadreId })
      });
      if (!res.ok) {
        const err = await res.json();
        setConfirmModal({
          show: true, title: 'Error', message: err.message ?? 'Error al guardar', type: 'DANGER', isAlert: true, onConfirm: () => { }
        });
      } else {
        setModalAlumno(null);
        fetchAlumnos();
        fetchMetricas();
        fetchProfesores();
      }
    } catch {
      setConfirmModal({
        show: true, title: 'Error de Red', message: 'No se pudo conectar con el servidor', type: 'DANGER', isAlert: true, onConfirm: () => { }
      });
    } finally {
      setSavingPersona(false);
    }
  };

  const handleDeleteAlumno = async (id: number) => {
    try {
      const res = await fetchWithAuth(`/admin/alumnos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAlumnos();
        fetchMetricas();
      } else {
        const err = await res.json();
        alert(err.message || 'Error al eliminar alumno');
      }
    } catch { alert('Error de red'); }
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
    <>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                  Disciplinas <span style={{ color: 'var(--color-primary)', fontSize: '0.75rem', verticalAlign: 'middle', marginLeft: '0.4rem', background: 'var(--color-secondary-container)', padding: '0.15rem 0.5rem', borderRadius: '99px' }}>{metricas?.clubes.length ?? 0}</span>
                </h3>
                <button onClick={() => setModalClub({})} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                  <PlusCircle size={14} /> Nuevo
                </button>
              </div>


              {/* SEARCH BAR */}
              <div style={{ marginBottom: '0.8rem', position: 'relative' }}>
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar disciplina o profesor..."
                  style={{ ...inputStyle, paddingLeft: '2.5rem', paddingTop: '0.65rem', paddingBottom: '0.65rem', borderRadius: '1rem', border: '1.5px solid var(--color-surface-container-high)', fontSize: '0.85rem' }}
                />
                <BarChart2 size={16} color="var(--color-outline)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>


              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(metricas?.clubes ?? [])
                  .filter(c => (c.nombre?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) || (c.profesor?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()))
                  .slice((currentPageClubes - 1) * ITEMS_PER_PAGE, currentPageClubes * ITEMS_PER_PAGE)
                  .map(club => (
                    <div key={club.id} className="bento-card" style={{
                      padding: '1.1rem',
                      borderLeft: '5px solid var(--color-primary)',
                      background: 'white',
                      borderRadius: '1rem'
                    }}>

                      <div className="card-header-adaptive">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: 0, fontWeight: 900, fontSize: '1.3rem', color: 'var(--color-primary)', letterSpacing: '-0.04em', wordBreak: 'break-word' }}>{club.nombre}</h4>
                          {club.descripcion && (
                            <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: 'var(--color-on-surface-variant)', lineHeight: 1.5, fontWeight: 500 }}>{club.descripcion}</p>
                          )}
                        </div>
                        <div className="card-actions-adaptive">
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
                          <button onClick={() => setConfirmDelete({ id: club.id, title: club.nombre, type: 'CLUB' })} disabled={deletingId === club.id}
                            style={{ ...iconBtnStyle('rgba(211, 47, 47, 0.08)', 'var(--color-error)'), width: '2.5rem', height: '2.5rem' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                        <Pill icon={<UserCheck size={12} />} label={club.profesor} bg="var(--color-primary-container)" color="white" />
                        <Pill icon={<Users size={12} />} label={`${club.inscritos} alumnos`} bg="var(--color-surface-container-high)" color="var(--color-primary)" />
                        <Pill icon={<CreditCard size={12} />} label={`S/ ${club.precio?.toFixed(2) ?? '50.00'}`} bg="var(--color-success-container)" color="var(--color-success)" />
                        {club.horario && (
                          <Pill icon={<Calendar size={12} />} label={formatHorarioShort(club.horario)} bg="var(--color-secondary-container)" color="var(--color-on-secondary-container)" />
                        )}
                        <Pill icon={<TrendingUp size={12} />} label={`${club.asistencia}%`}
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
              {/* Sub-tabs Admin / Profesores / Padres / Alumnos */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', background: 'var(--color-surface-container-low)', padding: '0.2rem', borderRadius: '1.25rem', overflowX: 'auto' }}>
                {[
                  { id: 'administradores', label: 'Admin', icon: <UserCheck size={16} /> },
                  { id: 'profesores', label: 'Profesores', icon: <GraduationCap size={16} /> },
                  { id: 'padres', label: 'Padres', icon: <Users size={16} /> },
                  { id: 'alumnos', label: 'Alumnos', icon: <BookOpen size={16} /> }
                ].map(st => (
                  <button key={st.id} onClick={() => setPersonasTab(st.id as any)} style={{
                    flex: 1, padding: '0.6rem 0.4rem', borderRadius: '1rem', border: 'none', cursor: 'pointer',
                    fontWeight: 800, fontSize: '0.75rem', whiteSpace: 'nowrap',
                    background: personasTab === st.id ? 'white' : 'transparent',
                    color: personasTab === st.id ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                    boxShadow: personasTab === st.id ? '0 4px 8px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.3s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                  }}>
                    {st.icon}
                    {st.label}
                  </button>
                ))}
              </div>

              {/* SEARCH BAR PERSONAS */}
              <div style={{ marginBottom: '1rem', position: 'relative' }}>
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, DNI o datos..."
                  style={{ ...inputStyle, paddingLeft: '2.8rem', borderRadius: '1.25rem', border: '1.5px solid var(--color-surface-container-high)' }}
                />
                <Search size={18} color="var(--color-outline)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

              {/* ─── Secciones de Usuarios (Admin, Profesores, Padres) ─── */}
              {['administradores', 'profesores', 'padres'].includes(personasTab) && (
                <>
                  {(() => {
                    const rolMap: Record<string, 'ADMINISTRADOR' | 'PROFESOR' | 'PADRE'> = {
                      administradores: 'ADMINISTRADOR',
                      profesores: 'PROFESOR',
                      padres: 'PADRE'
                    };
                    const rol = rolMap[personasTab];
                    const itemsFiltered = usuarios.filter(u => u.rol === rol)
                      .filter(u => (`${u.nombre ?? ''} ${u.apellido ?? ''} ${u.email ?? ''} ${u.dni ?? ''}`).toLowerCase().includes(searchTerm.toLowerCase()));

                    const rolLabel = { ADMINISTRADOR: 'Administradores', PROFESOR: 'Profesores', PADRE: 'Padres de Familia' }[rol];
                    const rolColor = { ADMINISTRADOR: 'var(--color-primary)', PROFESOR: 'var(--color-secondary)', PADRE: 'var(--color-outline)' }[rol];
                    const rolIcon = { ADMINISTRADOR: <UserCheck size={15} />, PROFESOR: <GraduationCap size={15} />, PADRE: <Users size={15} /> }[rol];

                    return (
                      <div className="animate-enter">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                            {rolLabel} registrados ({itemsFiltered.length})
                          </h3>
                          <button onClick={() => setModalUsuario({ rol })} style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            background: rolColor, color: 'white', border: 'none',
                            borderRadius: '99px', padding: '0.55rem 1rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                          }}>
                            <PlusCircle size={15} /> Nuevo {rol === 'PADRE' ? 'Padre' : rol === 'PROFESOR' ? 'Profesor' : 'Admin'}
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          {itemsFiltered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--color-on-surface-variant)' }}>
                              <Users size={48} strokeWidth={1} style={{ opacity: 0.2 }} />
                              <p style={{ marginTop: '1rem', fontWeight: 600 }}>No hay {rolLabel.toLowerCase()} registrados</p>
                            </div>
                          ) : (
                            itemsFiltered.slice((pagesUsuarios[rol] - 1) * ITEMS_PER_PAGE, pagesUsuarios[rol] * ITEMS_PER_PAGE).map(u => (
                              <div key={u.id} className="bento-card" style={{
                                padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1.1rem', background: 'white',
                                borderLeft: `4px solid ${rolColor}`
                              }}>
                                <div style={{
                                  width: '3.2rem', height: '3.2rem', borderRadius: '1rem', flexShrink: 0,
                                  background: u.estado === 'Desactivado' ? 'var(--color-error-container)' : 'var(--color-surface-dim)',
                                  display: 'flex', alignItems: 'center',
                                  justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', color: u.estado === 'Desactivado' ? 'var(--color-error)' : 'var(--color-primary)',
                                  opacity: u.estado === 'Desactivado' ? 0.6 : 1
                                }}>
                                  {(u.nombre[0] + (u.apellido[0] ?? '')).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, opacity: u.estado === 'Desactivado' ? 0.5 : 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <p style={{ margin: 0, fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                                      {u.nombre} {u.apellido}
                                    </p>
                                    {u.estado === 'Desactivado' && (
                                      <span style={{ fontSize: '0.6rem', fontWeight: 900, background: 'var(--color-error)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase' }}>Desactivado</span>
                                    )}
                                  </div>
                                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 600 }}>
                                    DNI: {u.dni || '---'} • Cel: {u.celular || '---'}
                                  </p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                  <button
                                    onClick={() => {
                                      const nuevoEstado = u.estado === 'Desactivado' ? 'Activado' : 'Desactivado';
                                      setConfirmModal({
                                        show: true,
                                        title: nuevoEstado === 'Activado' ? 'Activar Usuario' : 'Desactivar Usuario',
                                        message: `¿Estás seguro de que deseas ${nuevoEstado === 'Activado' ? 'activar' : 'desactivar'} a ${u.nombre}? ${nuevoEstado === 'Activado' ? 'Podrá volver a ingresar al sistema.' : 'No podrá iniciar sesión hasta que sea reactivado.'}`,
                                        type: nuevoEstado === 'Activado' ? 'SUCCESS' : 'WARNING',
                                        icon: nuevoEstado === 'Activado' ? <UserCheck size={32} color="var(--color-success)" /> : <Ban size={32} color="var(--color-warning)" />,
                                        onConfirm: () => handleToggleUsuarioStatus(u.id, nuevoEstado)
                                      });
                                    }}
                                    title={u.estado === 'Desactivado' ? "Activar" : "Desactivar"}
                                    style={iconBtnStyle(u.estado === 'Desactivado' ? 'var(--color-success-container)' : 'var(--color-surface-container-low)', u.estado === 'Desactivado' ? 'var(--color-success)' : 'var(--color-outline)')}
                                  >
                                    {u.estado === 'Desactivado' ? <UserCheck size={15} /> : <Ban size={15} />}
                                  </button>
                                  <button onClick={() => setModalUsuario(u)} style={iconBtnStyle('var(--color-surface-container-low)', 'var(--color-primary)')}>
                                    <Edit2 size={15} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setConfirmModal({
                                        show: true,
                                        title: 'Eliminar Usuario',
                                        message: `¿Estás seguro de que deseas eliminar permanentemente a ${u.nombre} ${u.apellido}? Esta acción no se puede deshacer y podría afectar registros históricos.`,
                                        type: 'DANGER',
                                        icon: <UserX size={32} color="var(--color-error)" />,
                                        onConfirm: () => handleDeleteUsuario(u.id)
                                      });
                                    }}
                                    title="Eliminar"
                                    style={iconBtnStyle('var(--color-error-container)', 'var(--color-error)')}
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <Pagination
                          current={pagesUsuarios[rol]}
                          total={Math.ceil(itemsFiltered.length / ITEMS_PER_PAGE)}
                          onChange={(p) => setPagesUsuarios(prev => ({ ...prev, [rol]: p }))}
                        />
                      </div>
                    );
                  })()}
                </>
              )}

              {/* ─── Sub-tab: ALUMNOS ─── */}
              {personasTab === 'alumnos' && (
                <div className="animate-enter">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      Alumnos registrados ({alumnos.length})
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
                              background: 'var(--color-surface-dim)', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-primary)',
                              boxShadow: 'var(--shadow-sm)'
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
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    show: true,
                                    title: 'Eliminar Alumno',
                                    message: `¿Estás seguro de que deseas eliminar permanentemente a ${alumno.nombre} ${alumno.apellido}? Esta acción no se puede deshacer y eliminará todas sus inscripciones y registros asociados.`,
                                    type: 'DANGER',
                                    icon: <UserX size={32} color="var(--color-error)" />,
                                    onConfirm: () => handleDeleteAlumno(alumno.id)
                                  });
                                }}
                                title="Eliminar Alumno"
                                style={iconBtnStyle('var(--color-error-container)', 'var(--color-error)')}
                              >
                                <Trash2 size={15} />
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
                </div>
              )}
            </>
          )}

          {/* ══════════ TAB: PAGOS ════════════════════════════ */}
          {tab === 'pagos' && (
            <div className="animate-enter">
              <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>
                      Gestión <span style={{ color: 'var(--color-secondary)' }}>Financiera</span>
                    </h2>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', color: 'var(--color-outline)', fontWeight: 600 }}>
                      Seguimiento de pagos y comprobantes ({pagos.length})
                    </p>
                  </div>

                  <div style={{ background: 'var(--color-surface-container-high)', padding: '0.3rem', borderRadius: '1.1rem', display: 'flex', gap: '0.2rem' }}>
                    {[
                      { id: 'ALUMNO', label: 'Por Alumno', icon: <Users size={14} /> },
                      { id: 'CLUB', label: 'Por Club', icon: <Award size={14} /> }
                    ].map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => { setTipoFiltroPago(mode.id as any); if (mode.id === 'ALUMNO') setPagoClubFiltro(''); else { setPagoAlumnoFiltro(''); setSearchTerm(''); } }}
                        style={{
                          padding: '0.5rem 1rem', borderRadius: '0.9rem', border: 'none', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
                          background: tipoFiltroPago === mode.id ? 'white' : 'transparent',
                          color: tipoFiltroPago === mode.id ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                          boxShadow: tipoFiltroPago === mode.id ? 'var(--shadow-sm)' : 'none',
                          transition: 'all 0.3s ease',
                          display: 'flex', alignItems: 'center', gap: '0.4rem'
                        }}>
                        {mode.icon} {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 2, minWidth: '280px' }}>
                    <input
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder={tipoFiltroPago === 'ALUMNO' ? "Buscar por nombre del alumno..." : "Buscar por nombre del club..."}
                      style={{ ...inputStyle, paddingLeft: '2.8rem', borderRadius: '1.25rem', height: '3.2rem' }}
                    />
                    <Search size={18} color="var(--color-outline)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>

                  <div style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
                    <select value={pagoFiltro} onChange={e => setPagoFiltro(e.target.value)} style={{
                      ...inputStyle, padding: '0.5rem 2.8rem 0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 750,
                      borderRadius: '1.25rem', background: 'white', appearance: 'none', height: '3.2rem'
                    }}>
                      <option value="">Todos los Estados</option>
                      <option value="PENDIENTE">⏳ Pendientes</option>
                      <option value="PAGADO">✅ Pagados</option>
                      <option value="RECHAZADO">❌ Rechazados</option>
                    </select>
                    <ChevronDown size={18} color="var(--color-primary)" style={{ position: 'absolute', right: '1.1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>

              {/* 💡 ESTUDIANTE SELECCIONADO: DETALLE ESPECIAL */}
              {tipoFiltroPago === 'ALUMNO' && searchTerm.length >= 3 && alumnos.some(a => `${a.nombre} ${a.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())) && (
                (() => {
                  const matchedAlumno = alumnos.find(a => `${a.nombre} ${a.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()));
                  if (!matchedAlumno) return null;
                  const filteredPagos = pagos.filter(p => Number(p.alumnoId) === matchedAlumno.id);
                  if (filteredPagos.length === 0) return null;

                  return (
                    <div className="bento-card animate-enter" style={{ padding: '1.25rem', background: 'var(--grad-primary)', color: 'white', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', right: '-2rem', top: '-2rem', opacity: 0.1 }}>
                        <Users size={120} color="white" />
                      </div>
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.1em' }}>Estatus del Alumno</span>
                            <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                              {matchedAlumno.nombre} {matchedAlumno.apellido}
                            </h3>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                          <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '1rem', flex: 1, backdropFilter: 'blur(10px)' }}>
                            <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase' }}>Pagados</p>
                            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>{filteredPagos.filter(p => p.estado === 'PAGADO').length}</p>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '1rem', flex: 1, backdropFilter: 'blur(10px)' }}>
                            <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase' }}>Pendientes</p>
                            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>{filteredPagos.filter(p => p.estado === 'PENDIENTE').length}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {(() => {
                  const results = pagos
                    .filter(p => {
                      const search = searchTerm.toLowerCase();
                      if (search.length < 3) return true;
                      if (tipoFiltroPago === 'ALUMNO') {
                        return (`${p.alumno.nombre} ${p.alumno.apellido}`).toLowerCase().includes(search);
                      } else {
                        return p.club.nombre.toLowerCase().includes(search);
                      }
                    })
                    .filter(p => pagoFiltro === '' || p.estado === pagoFiltro);

                  const pageResults = results.slice((currentPagePagos - 1) * 4, currentPagePagos * 4);

                  return (
                    <>
                      {pageResults.map(pago => {
                        const colors = estadoColor[pago.estado];
                        const isExpanded = expandedPagoId === pago.id;
                        return (
                          <div
                            key={pago.id}
                            className="bento-card"
                            style={{
                              padding: '1rem 1.25rem',
                              background: 'white',
                              cursor: 'pointer',
                              border: isExpanded ? '1.5px solid var(--color-primary)' : '1px solid var(--color-surface-container-high)',
                              boxShadow: isExpanded ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onClick={() => setExpandedPagoId(isExpanded ? null : pago.id)}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                  width: '2.8rem', height: '2.8rem', borderRadius: '0.85rem',
                                  background: isExpanded ? 'var(--color-primary-container)' : 'var(--color-surface-dim)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.3s ease', flexShrink: 0
                                }}>
                                  <CreditCard size={18} color={isExpanded ? 'white' : 'var(--color-primary)'} />
                                </div>
                                <div>
                                  <p style={{ margin: 0, fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>
                                    {pago.alumno.nombre} {pago.alumno.apellido}
                                  </p>
                                  <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 600 }}>
                                    {pago.club.nombre} • <span style={{ color: 'var(--color-primary)' }}>{pago.mes}</span>
                                  </p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{
                                  background: colors.bg, color: colors.fg,
                                  padding: '0.3rem 0.6rem', borderRadius: '99px', fontSize: '0.6rem', fontWeight: 900,
                                  textTransform: 'uppercase', letterSpacing: '0.05em'
                                }}>
                                  {pago.estado}
                                </span>
                                <ChevronDown size={14} color="var(--color-outline)" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="animate-enter" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1.5px dashed var(--color-surface-container-high)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }} onClick={e => e.stopPropagation()}>
                                <div style={{
                                  background: 'var(--color-surface-container-low)', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--color-surface-container-high)',
                                  position: 'relative', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                  {pago.urlComprobante ? (
                                    <img src={pago.urlComprobante.replace('/upload/', '/upload/w_800,c_limit,q_auto,f_auto/')} alt="Comprobante" style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: '350px', cursor: 'zoom-in' }} onClick={() => setViewerImage(pago.urlComprobante)} />
                                  ) : (
                                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-outline)' }}>
                                      <FileText size={40} opacity={0.2} style={{ marginBottom: '0.5rem' }} />
                                      <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>Sin comprobante</p>
                                    </div>
                                  )}
                                </div>
                                {pago.observacion && (
                                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', fontStyle: 'italic', background: 'var(--color-surface-container-low)', padding: '0.6rem', borderRadius: '0.6rem', fontWeight: 500 }}>
                                    “{pago.observacion}”
                                  </p>
                                )}
                              </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.85rem' }}>
                              {pago.monto && (
                                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                                  S/ {pago.monto.toFixed(2)}
                                </p>
                              )}

                              {pago.estado === 'PENDIENTE' && (
                                <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                                  <button
                                    disabled={validandoPago === pago.id}
                                    onClick={() => setPaymentActionModal({ show: true, type: 'VALIDAR', pago, observacion: '' })}
                                    style={iconBtnStyle('var(--color-success-container)', 'var(--color-success)')}>
                                    <Check size={16} strokeWidth={3} />
                                  </button>
                                  <button
                                    disabled={validandoPago === pago.id}
                                    onClick={() => setPaymentActionModal({ show: true, type: 'RECHAZAR', pago, observacion: '' })}
                                    style={iconBtnStyle('var(--color-error-container)', 'var(--color-error)')}>
                                    <X size={16} strokeWidth={3} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      <Pagination
                        current={currentPagePagos}
                        total={Math.ceil(results.length / 4)}
                        onChange={setCurrentPagePagos}
                      />
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ══════════ TAB: HORARIOS ═════════════════════════ */}
          {tab === 'horarios' && (
            <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Header */}
              <div style={{ marginBottom: isMobile ? '0.5rem' : '1rem' }}>
                <h3 style={{ margin: 0, fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>
                  Cronograma <span style={{ color: 'var(--color-secondary)' }}>Extracurricular</span>
                </h3>
                {!isMobile && <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--color-outline)', fontWeight: 600 }}>Gestión centralizada de horarios y espacios</p>}
              </div>

              {/* Filtros */}
              <div style={{
                background: isMobile ? 'var(--color-surface-container-low)' : 'transparent',
                padding: isMobile ? '0.75rem' : '0',
                borderRadius: '1.25rem',
                display: 'flex',
                flexDirection: 'row',
                gap: '0.6rem',
                width: '100%'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1, minWidth: 0 }}>
                  <label style={{ ...labelStyle, marginBottom: 0, fontSize: '0.65rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Disciplina</label>
                  <select
                    value={filtroClubHorario}
                    onChange={e => setFiltroClubHorario(e.target.value)}
                    style={{ ...inputStyle, padding: '0 0.5rem', borderRadius: '0.85rem', fontSize: '0.75rem', height: isMobile ? '2.6rem' : '3rem' }}
                  >
                    <option value="">Todas</option>
                    {(metricas?.clubes ?? []).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1, minWidth: 0 }}>
                  <label style={{ ...labelStyle, marginBottom: 0, fontSize: '0.65rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Profesor</label>
                  <select
                    value={filtroProfHorario}
                    onChange={e => setFiltroProfHorario(e.target.value)}
                    style={{ ...inputStyle, padding: '0 0.5rem', borderRadius: '0.85rem', fontSize: '0.75rem', height: isMobile ? '2.6rem' : '3rem' }}
                  >
                    <option value="">Cualquier</option>
                    {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                  </select>
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

          {/* ══════════ TAB: AULAS ════════════════════════════ */}
          {tab === 'aulas' && (
            <div className="animate-enter">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>
                    Gestión de <span style={{ color: 'var(--color-secondary)' }}>Aulas</span>
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--color-outline)', fontWeight: 600 }}>Configura los puntos de marcaje QR y GPS</p>
                </div>
                <button
                  onClick={() => { setEditingAula(null); setIsAulaModalOpen(true); }}
                  style={{
                    background: 'var(--color-primary)', color: 'white', border: 'none',
                    padding: '0.75rem 1.5rem', borderRadius: '1rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(var(--color-primary-rgb), 0.2)'
                  }}
                >
                  <MapPin size={18} /> Nueva Aula
                </button>
              </div>

              {loadingAulas ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}><RefreshCw className="spin" size={30} color="var(--color-primary)" /></div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {aulas.map(aula => (
                    <div key={aula.id} className="bento-card" style={{ padding: '1.5rem', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-primary)', width: '3rem', height: '3rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Map size={24} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => { setEditingAula(aula); setIsAulaModalOpen(true); }} style={{ background: 'var(--color-surface-container-low)', border: 'none', padding: '0.5rem', borderRadius: '0.6rem', cursor: 'pointer', color: 'var(--color-primary)' }}><FileText size={16} /></button>
                          <button onClick={() => setConfirmModal({
                            show: true,
                            title: 'Eliminar Aula',
                            message: `¿Estás seguro de que deseas eliminar el aula "${aula.nombre}"? Esta acción no se puede deshacer.`,
                            type: 'DANGER',
                            onConfirm: async () => {
                              await fetchWithAuth(`/admin/aulas/${aula.id}`, { method: 'DELETE' });
                              fetchAulas();
                              setConfirmModal(prev => ({ ...prev, show: false }));
                            }
                          })} style={{ background: 'var(--color-surface-container-low)', border: 'none', padding: '0.5rem', borderRadius: '0.6rem', cursor: 'pointer', color: 'var(--color-error)' }}><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>{aula.nombre}</h4>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.8rem', color: 'var(--color-outline)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Navigation size={12} /> {aula.latitud.toFixed(6)}, {aula.longitud.toFixed(6)}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-surface-container-high)' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary)' }}>Radio: {aula.radioPermitido}m</span>
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/pase-lista?aulaId=${aula.id}`;
                            // Aquí podrías generar un QR para imprimir
                            window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify({ aulaId: aula.id }))}`, '_blank');
                          }}
                          style={{ background: 'var(--color-secondary-container)', color: 'var(--color-primary)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.6rem', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <QrCode size={14} /> Imprimir QR
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════ TAB: ASISTENCIA DOCENTE ═══════════════ */}
          {tab === 'asistencia-docente' && (
            <div className="animate-enter">
              <div style={{ marginBottom: isMobile ? '1.5rem' : '2rem' }}>
                <h3 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>
                  Registro de <span style={{ color: 'var(--color-secondary)' }}>Asistencia Docente</span>
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--color-outline)', fontWeight: 600 }}>Auditoría de puntualidad y presencia física</p>
              </div>

              <div style={{ background: 'white', padding: isMobile ? '1.25rem' : '1.5rem', borderRadius: '1.5rem', border: '1px solid var(--color-surface-container-high)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Filtrar por Profesor</label>
                    <div style={{ position: 'relative' }}>
                      <select value={filtroProfesorId} onChange={e => setFiltroProfesorId(e.target.value)} style={{ ...inputStyle, paddingRight: '2.5rem' }}>
                        <option value="">Todos los profesores</option>
                        {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                      </select>
                      {/* <ChevronDown size={18} color="var(--color-primary)" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />*/}
                    </div>
                  </div>
                  <button onClick={fetchAsistenciaDocente} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.85rem 1.5rem', borderRadius: '1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Search size={20} />
                    {isMobile && <span>Buscar Asistencia</span>}
                  </button>
                </div>
              </div>

              {loadingAsistenciaDocente ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}><RefreshCw className="spin" size={30} color="var(--color-primary)" /></div>
              ) : (
                <>
                  {isMobile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {asistenciaDocente.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: '1.5rem', border: '1px dashed var(--color-surface-container-high)' }}>
                          <History size={48} color="var(--color-surface-container-high)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                          <p style={{ margin: 0, color: 'var(--color-outline)', fontWeight: 600 }}>No hay registros de asistencia para mostrar.</p>
                        </div>
                      ) : (
                        asistenciaDocente
                          .slice((currentPageAsistenciaDocente - 1) * ITEMS_PER_PAGE_DOCENTE, currentPageAsistenciaDocente * ITEMS_PER_PAGE_DOCENTE)
                          .map(reg => (
                            <div key={reg.id} className="bento-card" style={{ padding: '1.25rem', background: 'white', borderRadius: '1.25rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.85rem', background: 'var(--color-surface-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 900 }}>
                                    {(reg.club.profesor.nombre[0] + (reg.club.profesor.apellido[0] ?? '')).toUpperCase()}
                                  </div>
                                  <div>
                                    <p style={{ margin: 0, fontWeight: 900, fontSize: '0.95rem', color: 'var(--color-primary)' }}>{reg.club.profesor.nombre} {reg.club.profesor.apellido}</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 600 }}>{new Date(reg.fecha).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <span style={{
                                  padding: '0.3rem 0.7rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 900,
                                  background: reg.asistenciaDocente === 'PUNTUAL' ? 'var(--color-success-container)' : reg.asistenciaDocente === 'TARDE' ? 'var(--color-warning-container)' : 'var(--color-error-container)',
                                  color: reg.asistenciaDocente === 'PUNTUAL' ? 'var(--color-success)' : reg.asistenciaDocente === 'TARDE' ? 'var(--color-warning)' : 'var(--color-error)'
                                }}>
                                  {reg.asistenciaDocente || 'PENDIENTE'}
                                </span>
                              </div>

                              <div style={{ background: 'var(--color-surface-container-lowest)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-surface-container-low)', marginBottom: '1rem' }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>{reg.club.nombre}</p>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 700 }}>Aula: {reg.aula?.nombre || 'Sin aula'}</p>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-outline)' }}>
                                  <Clock size={14} />
                                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{reg.horaMarcajeDocente ? new Date(reg.horaMarcajeDocente).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}</span>
                                </div>
                                {reg.latitudDocente && (
                                  <a href={`https://www.google.com/maps?q=${reg.latitudDocente},${reg.longitudDocente}`} target="_blank" rel="noreferrer" style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-primary)', padding: '0.4rem 0.8rem', borderRadius: '0.75rem', fontSize: '0.7rem', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <MapPin size={14} /> Ver mapa
                                  </a>
                                )}
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  ) : (
                    <div style={{ background: 'white', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid var(--color-surface-container-high)', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: 'var(--color-surface-container-low)', textAlign: 'left' }}>
                              <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-outline)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha / Hora</th>
                              <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-outline)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profesor</th>
                              <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-outline)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Disciplina / Aula</th>
                              <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-outline)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</th>
                              <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-outline)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GPS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {asistenciaDocente.length === 0 ? (
                              <tr>
                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-outline)', fontStyle: 'italic' }}>No hay registros de asistencia.</td>
                              </tr>
                            ) : (
                              asistenciaDocente
                                .slice((currentPageAsistenciaDocente - 1) * ITEMS_PER_PAGE_DOCENTE, currentPageAsistenciaDocente * ITEMS_PER_PAGE_DOCENTE)
                                .map(reg => (
                                  <tr key={reg.id} style={{ borderBottom: '1px solid var(--color-surface-container-low)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-container-lowest)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '1.25rem' }}>
                                      <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-primary)' }}>{new Date(reg.fecha).toLocaleDateString()}</p>
                                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 600 }}>{reg.horaMarcajeDocente ? new Date(reg.horaMarcajeDocente).toLocaleTimeString() : 'N/A'}</p>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                      <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-primary)' }}>{reg.club.profesor.nombre} {reg.club.profesor.apellido}</p>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                      <p style={{ margin: 0, fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-primary)' }}>{reg.club.nombre}</p>
                                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 700 }}>{reg.aula?.nombre || 'Sin aula'}</p>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                      <span style={{
                                        padding: '0.4rem 0.8rem', borderRadius: '0.75rem', fontSize: '0.7rem', fontWeight: 900,
                                        background: reg.asistenciaDocente === 'PUNTUAL' ? 'var(--color-success-container)' : reg.asistenciaDocente === 'TARDE' ? 'var(--color-warning-container)' : 'var(--color-error-container)',
                                        color: reg.asistenciaDocente === 'PUNTUAL' ? 'var(--color-success)' : reg.asistenciaDocente === 'TARDE' ? 'var(--color-warning)' : 'var(--color-error)'
                                      }}>
                                        {reg.asistenciaDocente || 'PENDIENTE'}
                                      </span>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                      {reg.latitudDocente ? (
                                        <a href={`https://www.google.com/maps?q=${reg.latitudDocente},${reg.longitudDocente}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 800, textDecoration: 'none' }}>
                                          <MapPin size={14} /> Ver mapa
                                        </a>
                                      ) : '-'}
                                    </td>
                                  </tr>
                                ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <Pagination
                    current={currentPageAsistenciaDocente}
                    total={Math.ceil(asistenciaDocente.length / ITEMS_PER_PAGE_DOCENTE)}
                    onChange={setCurrentPageAsistenciaDocente}
                  />
                </>
              )}
            </div>
          )}
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
      </div>

      {/* ── SECCIÓN DE MODALES MODULARIZADOS ── */}
      {modalClub && (
        <ClubModal
          club={modalClub}
          profesores={profesores}
          aulas={aulas}
          onSave={handleSaveClub}
          onClose={() => setModalClub(null)}
        />
      )}

      {modalUsuario && (
        <UsuarioModal
          usuario={modalUsuario}
          saving={savingPersona}
          onSave={handleSaveUsuario}
          onResetPassword={handleResetPassword}
          onClose={() => setModalUsuario(null)}
        />
      )}

      {modalAlumno && (
        <AlumnoModal
          alumno={modalAlumno}
          clubes={metricas?.clubes ?? []}
          usuarios={usuarios}
          saving={savingPersona}
          onSave={handleSaveAlumno}
          onClose={() => setModalAlumno(null)}
        />
      )}

      <AlumnosInscritosModal
        isOpen={isAlumnosInscritosModalOpen}
        onClose={() => setIsAlumnosInscritosModalOpen(false)}
        alumnos={alumnos}
        searchTerm={searchTermAlumnosModal}
        onSearchChange={(term) => {
          setSearchTermAlumnosModal(term);
          setCurrentPageAlumnosModal(1);
        }}
        currentPage={currentPageAlumnosModal}
        onPageChange={setCurrentPageAlumnosModal}
      />

      <ProfesoresModal
        isOpen={isProfesoresModalOpen}
        onClose={() => setIsProfesoresModalOpen(false)}
        profesores={profesores}
        currentPage={currentPageProfesores}
        onPageChange={setCurrentPageProfesores}
        formatHorarioShort={formatHorarioShort}
      />

      <RankingDisciplinasModal
        isOpen={isRankingModalOpen}
        onClose={() => setIsRankingModalOpen(false)}
        clubesRanking={clubesRanking}
        currentPage={currentPageRanking}
        onPageChange={setCurrentPageRanking}
        onNavigateToHistory={(id) => {
          setIsRankingModalOpen(false);
          navigate(`/clubes/${id}/historial`);
        }}
      />

      {modalSesiones && (
        <SesionesModal
          modalSesiones={modalSesiones}
          sesionesClub={sesionesClub}
          loadingSesiones={loadingSesiones}
          currentPageSesiones={currentPageSesiones}
          expandedSesionId={expandedSesionId}
          ITEMS_PER_PAGE={4}
          setCurrentPageSesiones={setCurrentPageSesiones}
          setExpandedSesionId={setExpandedSesionId}
          onClose={() => setModalSesiones(null)}
        />
      )}


      <RetencionModal
        isOpen={isRetencionModalOpen}
        onClose={() => setIsRetencionModalOpen(false)}
        metricas={metricas}
        rankingSubTab={rankingSubTab}
        setRankingSubTab={setRankingSubTab}
        currentPage={currentPageRetencion}
        onPageChange={setCurrentPageRetencion}
      />



      <AulaModal
        isOpen={isAulaModalOpen}
        editingAula={editingAula}
        onClose={() => setIsAulaModalOpen(false)}
        onFetchAulas={fetchAulas}
        muestras={muestras}
        setMuestras={setMuestras}
        calibrando={calibrando}
        setCalibrando={setCalibrando}
        calibracionPaso={calibracionPaso}
        setCalibracionPaso={setCalibracionPaso}
        calibracionProgreso={calibracionProgreso}
        setCalibracionProgreso={setCalibracionProgreso}
        calibracionCompletada={calibracionCompletada}
        setCalibracionCompletada={setCalibracionCompletada}
      />

      <PagosClubModal
        isOpen={!!modalPagosClub}
        clubId={modalPagosClub?.id ?? 0}
        clubNombre={modalPagosClub?.nombre ?? ''}
        pagos={pagos}
        onAction={(pago, type) =>
          setPaymentActionModal({ show: true, type, pago, observacion: '' })
        }
        onShowImage={setViewerImage}
        onClose={() => setModalPagosClub(null)}
      />

      <ConfirmModal
        show={!!confirmDelete}
        title="¿Estás seguro?"
        message={confirmDelete ? `Eliminarás la disciplina "${confirmDelete.title}" de forma permanente. Esta acción no se puede deshacer.` : ''}
        type="DANGER"
        icon={<Trash2 size={32} color="var(--color-error)" />}
        onConfirm={() => {
          if (confirmDelete) handleDeleteClub(confirmDelete.id);
        }}
        onClose={() => setConfirmDelete(null)}
      />

      {viewerImage && (
        <ImageViewer url={viewerImage} onClose={() => setViewerImage(null)} />
      )}

      <PaymentActionModal
        show={paymentActionModal.show}
        type={paymentActionModal.type}
        pago={paymentActionModal.pago}
        observacion={paymentActionModal.observacion}
        onObservacionChange={(val) =>
          setPaymentActionModal((prev) => ({ ...prev, observacion: val }))
        }
        onClose={() =>
          setPaymentActionModal((prev) => ({ ...prev, show: false }))
        }
        onConfirm={(id, estado, obs) => {
          handleValidarPago(id, estado as 'PAGADO' | 'RECHAZADO', obs);
          setPaymentActionModal((prev) => ({ ...prev, show: false }));
        }}
      />

      <ConfirmModal
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        icon={confirmModal.icon}
        isAlert={confirmModal.isAlert}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, show: false }))}
      />

    </>
  );
}

