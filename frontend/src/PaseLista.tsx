import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Check, X, ArrowLeft, Send, Loader2, StickyNote, WifiOff, Users, AlertCircle, BookOpen, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { db } from './db';
import { useUser } from './UserContext';
import './index.css';
import { API_BASE_URL } from './config';

const API = API_BASE_URL;

export default function PaseLista() {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const { usuario } = useUser();
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [club, setClub] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successInfo, setSuccessInfo] = useState({ title: '', message: '' });
  const [existingSessionId, setExistingSessionId] = useState<number | null>(null);

  const isAdmin = usuario?.rol?.toUpperCase() === 'ADMINISTRADOR';

  // Estado para la nota seleccionada
  const [noteAlumnoId, setNoteAlumnoId] = useState<number | null>(null);

  // 🔹 Monitor de conexión
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 🔹 Traer Info del Club, Horario y Alumnos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Traer datos del club para el horario
        const resClub = await fetch(`${API}/clubes/${clubId}`);
        const clubData = await resClub.json();
        setClub(clubData);

        // 2. Traer alumnos del club
        const resAlumnos = await fetch(`${API}/clubes/${clubId}/alumnos`);
        const alumnosData = await resAlumnos.json();
        
        // 3. Traer sesión de hoy si ya fue marcada
        const resSesionHoy = await fetch(`${API}/sesiones/hoy/${clubId}`);
        const textSesionHoy = await resSesionHoy.text();
        let sesionHoy = null;
        if (textSesionHoy) {
          try {
            sesionHoy = JSON.parse(textSesionHoy);
          } catch (e) {
            console.error("Error parsing sesionHoy", e);
          }
        }
        
        let asistenciasHoy: any[] = [];
        if (sesionHoy && sesionHoy.asistencias) {
          asistenciasHoy = sesionHoy.asistencias;
          setExistingSessionId(sesionHoy.id);
        }

        // 4. Mapear alumnos con su estado de hoy (si existe)
        const list = Array.isArray(alumnosData) ? alumnosData : [];
        const asignados = list.map((a: any) => {
          const asistenciaPrevia = asistenciasHoy.find(as => as.alumnoId === a.id);
          return {
            ...a,
            nombre: a.nombre || 'Sin Nombre',
            apellido: a.apellido || '',
            estadoPago: a.estadoPago || 'PENDIENTE',
            estado: asistenciaPrevia ? asistenciaPrevia.estado : null,
            observacion: asistenciaPrevia ? asistenciaPrevia.observacion : ''
          };
        });
        
        setAlumnos(asignados);
        
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clubId]);

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

  let isActuallyLive = false;
  try {
    if (club && club.horario) {
      const now = new Date();
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const currentDay = days[now.getDay()];
      
      let h = club.horario;
      if (typeof h === 'string') {
        h = JSON.parse(h);
      }

      const dMatchKey = Object.keys(h).find(d => normalizeDay(d) === currentDay);
      if (dMatchKey) {
        const sessionData = h[dMatchKey];
        const sessions = Array.isArray(sessionData) ? sessionData : [sessionData];
        const currentMins = now.getHours() * 60 + now.getMinutes();
        
        isActuallyLive = sessions.some((s: any) => {
          if (!s || !s.start || !s.end) return false;
          const [startH, startM] = s.start.split(':').map(Number);
          const [endH, endM] = s.end.split(':').map(Number);
          const sMins = startH * 60 + startM;
          const eMins = endH * 60 + endM;
          return currentMins >= sMins && currentMins <= eMins;
        });
      }
    }
  } catch (err) {
    console.error("Error evaluating live status", err);
  }

  // Bloqueo total: es Solo Lectura SI es Admin O SI NO está en vivo.
  const isReadOnly = isAdmin || !isActuallyLive;

  const marcados = alumnos.filter(a => a.estado !== null).length;
  const faltan = alumnos.length - marcados;

  const handleMarcar = (id: number, estado: string) => {
    if (isReadOnly) return;
    setAlumnos(prev => prev.map(a => a.id === id ? { ...a, estado } : a));
  };

  const updateObservacion = (id: number, observacion: string) => {
    if (isReadOnly) return;
    setAlumnos(prev => prev.map(a => a.id === id ? { ...a, observacion } : a));
  };

  const guardarAsistencia = async () => {
    if (isReadOnly) return;
    if (marcados < alumnos.length) {
      setSuccessInfo({ title: 'Faltan Alumnos', message: 'Por favor asigna un estado a todos los atletas antes de guardar.' });
      setShowSuccessModal(true);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        clubId: Number(clubId),
        fecha: new Date().toLocaleDateString('sv-SE'), // Formato YYYY-MM-DD local
        asistencias: alumnos.map(a => ({
          alumnoId: a.id,
          estado: a.estado,
          observacion: a.observacion || ''
        }))
      };

      if (isOffline) {
        await db.asistenciasPendientes.add({
          ...payload,
          fecha: new Date().toISOString(),
          syncStatus: 'pending'
        });
        setSuccessInfo({ title: 'Guardado Local', message: 'Te encuentras sin conexión. La lista se sincronizará cuando recuperes internet.' });
        setShowSuccessModal(true);
      } else {
        const url = existingSessionId 
          ? `${API}/sesiones/${existingSessionId}/asistencia`
          : `${API}/sesiones`;
        
        const method = existingSessionId ? 'PUT' : 'POST';
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          // Si era una sesión nueva, guardamos el ID para futuras ediciones sin recargar
          if (!existingSessionId) {
            const data = await res.json();
            if (data && data.id) setExistingSessionId(data.id);
          }
          setSuccessInfo({ title: '¡Asistencia Registrada!', message: 'La lista se ha guardado correctamente y los padres han sido notificados.' });
          setShowSuccessModal(true);
        } else {
          throw new Error('Error al guardar');
        }
      }
    } catch (err) {
      setSuccessInfo({ title: 'Error Crítico', message: 'No pudimos procesar la asistencia. Inténtalo de nuevo.' });
      setShowSuccessModal(true);
    } finally {
      setSaving(false);
    }
  };

  const alumnosFiltrados = alumnos.filter(a => {
    const fullName = `${a.nombre || ''} ${a.apellido || ''}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || (a.id && a.id.toString().includes(searchTerm));
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
        <Loader2 className="animate-spin" size={48} strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="animate-enter" style={{ paddingBottom: '16rem' }}>
      
      {/* HEADER BANNER DE BLOQUEO */}
      {isReadOnly && (
        <div style={{ padding: '1rem', background: 'var(--color-surface-container-high)', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'fadeInDown 0.4s ease' }}>
          <ShieldAlert size={20} color="var(--color-primary)" />
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {isAdmin ? 'Modo Administrador: Solo lectura.' : 'Registro deshabilitado: La clase no está en vivo actualmente.'}
          </p>
        </div>
      )}

      {/* HEADER PREMIUM */}
      <section style={{ padding: '1.5rem 1rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'var(--color-surface-dim)', border: 'none', borderRadius: '1rem', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={24} color="var(--color-primary)" />
          </button>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.05em', lineHeight: 1 }}>Control de <br /> <span style={{ color: 'var(--color-secondary)' }}>Asistencia</span></h2>
        </div>

        {/* RESUMEN SLIM */}
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderRadius: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--color-primary)' }}>{marcados}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-outline)' }}>/ {alumnos.length} presentes</span>
            </div>
            <div style={{ padding: '0.4rem 0.8rem', borderRadius: '99px', background: faltan === 0 ? 'var(--color-success-container)' : 'var(--color-surface-dim)', color: faltan === 0 ? 'var(--color-success)' : 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 900 }}>
               {faltan === 0 ? '✓ Completo' : `Faltan ${faltan}`}
            </div>
          </div>
          <div style={{ height: '6px', background: 'var(--color-surface-container-highest)', borderRadius: '99px', marginTop: '1rem', overflow: 'hidden' }}>
            <div style={{ width: `${(marcados/alumnos.length)*100}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="search-box-premium" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', padding: '1rem 1.25rem', borderRadius: '1.25rem', border: '1.5px solid var(--color-surface-container-high)', boxShadow: 'var(--shadow-sm)' }}>
          <Search size={20} color="var(--color-outline)" />
          <input type="text" placeholder="Buscar por nombre o identificación..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-primary)' }} />
        </div>
      </section>

      {/* LISTA ALUMNOS */}
      <div className="flex-column" style={{ gap: '1rem', padding: '0 1rem' }}>
        {alumnosFiltrados.map((alumno) => (
          <div key={alumno.id} className="glass-card" style={{ padding: '1.5rem', borderRadius: '1.8rem', border: '1px solid var(--color-surface-container-high)', opacity: isReadOnly ? 0.8 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '3.2rem', height: '3.2rem', borderRadius: '1.1rem', background: 'var(--color-surface-container-low)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 900 }}>
                {alumno.nombre[0]}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-primary)' }}>{alumno.nombre} {alumno.apellido}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-outline)', fontWeight: 700 }}>ID: {alumno.id} • {alumno.grado || 'S/G'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { label: 'PRESENTE', icon: Check, color: 'var(--color-primary)', text: 'Presente' },
                { label: 'AUSENTE', icon: X, color: 'var(--color-error)', text: 'Falta' },
                { label: 'JUSTIFICADO', icon: StickyNote, color: 'var(--color-secondary)', text: 'Justif.' }
              ].map(status => {
                const isS = alumno.estado === status.label;
                return (
                  <button key={status.label} onClick={() => handleMarcar(alumno.id, status.label)} disabled={isReadOnly} style={{ flex: 1, padding: '0.85rem 0', borderRadius: '1rem', border: 'none', background: isS ? status.color : 'var(--color-surface-container-low)', color: isS ? 'white' : 'var(--color-outline)', fontWeight: 900, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: isReadOnly ? 'default' : 'pointer', opacity: isReadOnly && !isS ? 0.3 : 1 }}>
                    <status.icon size={16} strokeWidth={3} />
                    <span>{status.text}</span>
                  </button>
                );
              })}
            </div>
            {alumno.estado === 'JUSTIFICADO' && (
              <input type="text" placeholder="Observación..." value={alumno.observacion} onChange={(e) => updateObservacion(alumno.id, e.target.value)} disabled={isReadOnly} style={{ width: '100%', marginTop: '1rem', padding: '0.8rem', borderRadius: '0.8rem', border: '1px solid var(--color-surface-container-high)', background: 'var(--color-surface-dim)', fontSize: '0.85rem' }} />
            )}
          </div>
        ))}
      </div>

      {/* BOTONES FLOTANTES */}
      <div style={{ position: 'fixed', bottom: '6.5rem', left: 0, width: '100%', padding: '0 1.25rem', zIndex: 90, display: 'flex', justifyContent: 'center' }}>
        {isReadOnly ? (
          <div style={{ width: '100%', maxWidth: '448px', padding: '1rem', background: 'var(--color-surface-container-high)', color: 'var(--color-primary)', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', fontWeight: 800 }}>
             <ShieldAlert size={20} /> Modo Solo Lectura
          </div>
        ) : (
          <button className="btn" onClick={guardarAsistencia} disabled={saving} style={{ width: '100%', maxWidth: '448px', padding: '1.25rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '1.25rem', fontWeight: 900, display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            {saving ? 'Guardando...' : (faltan === 0 ? 'Finalizar y Notificar Padres' : `Registrar (${marcados}/${alumnos.length})`)}
          </button>
        )}
      </div>

      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title={successInfo.title} message={successInfo.message} />
    </div>
  );
}

function SuccessModal({ isOpen, onClose, title, message }: any) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '2rem', padding: '2.5rem 2rem', textAlign: 'center', width: '100%', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)' }}>{title}</h3>
        <p style={{ margin: '0 0 2rem', color: 'var(--color-outline)', fontWeight: 600 }}>{message}</p>
        <button onClick={onClose} style={{ width: '100%', padding: '1rem', borderRadius: '1rem', background: 'var(--color-primary)', color: 'white', border: 'none', fontWeight: 900 }}>Entendido</button>
      </div>
    </div>
  );
}
