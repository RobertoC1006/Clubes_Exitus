import { useState, useEffect, useMemo, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Check, X, ArrowLeft, Send, Loader2, StickyNote, WifiOff, Users, AlertCircle, BookOpen, ShieldAlert, CheckCircle2, QrCode, Navigation } from 'lucide-react';
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
  const [docenteStatus, setDocenteStatus] = useState<string | null>(null);
  const [verificandoDocente, setVerificandoDocente] = useState(false);
  const [errorVerificacion, setErrorVerificacion] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isVerifyingRef = useRef(false);

  // Auto-update time to refresh isActuallyLive state
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

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
        if (sesionHoy) {
          setExistingSessionId(sesionHoy.id);
          setDocenteStatus(sesionHoy.asistenciaDocente);
          if (sesionHoy.asistencias) {
            asistenciasHoy = sesionHoy.asistencias;
          }
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
      // Forzar hora de Perú (America/Lima)
      const peruDate = new Date(currentTime.toLocaleString('en-US', { timeZone: 'America/Lima' }));
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const currentDay = days[peruDate.getDay()];
      
      let h = club.horario;
      if (typeof h === 'string') {
        h = JSON.parse(h);
      }

      const dMatchKey = Object.keys(h).find(d => normalizeDay(d) === currentDay);
      if (dMatchKey) {
        const sessionData = h[dMatchKey];
        const sessions = Array.isArray(sessionData) ? sessionData : [sessionData];
        
        const currentMins = peruDate.getHours() * 60 + peruDate.getMinutes();
        
        isActuallyLive = sessions.some((s: any) => {
          if (!s || !s.start || !s.end) return false;
          const [startH, startM] = s.start.split(':').map(Number);
          const [endH, endM] = s.end.split(':').map(Number);
          const sMins = startH * 60 + startM;
          const eMins = endH * 60 + endM;
          // Tolerance of 5 minutes before start
          return currentMins >= (sMins - 5) && currentMins <= eMins;
        });
      }
    }
  } catch (err) {
    console.error("Error evaluating live status", err);
  }

  // Bloqueo total: es Solo Lectura SI es Admin O SI NO está en vivo O SI el docente no ha verificado presencia
  const isReadOnly = isAdmin || !isActuallyLive || (!isAdmin && !docenteStatus);

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

  const handleValidarDocente = async (qrDataRaw: string) => {
    // Si ya estamos verificando, no hacer nada (doble capa de seguridad con ref y state)
    if (verificandoDocente || isVerifyingRef.current) return;
    
    const qrData = qrDataRaw.trim();
    if (!qrData) return;

    isVerifyingRef.current = true;
    setVerificandoDocente(true);
    setErrorVerificacion('');
    
    try {
      // 1. Obtener ubicación
      const pos: any = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
      });

      const { latitude, longitude, accuracy } = pos.coords;
      console.log(`[GPS-SCAN] Coords: ${latitude}, ${longitude} | Accuracy: ±${accuracy?.toFixed(1)}m`);

      // 2. Enviar al backend
      const payload: any = {
        clubId: Number(clubId),
        latitud: latitude,
        longitud: longitude,
        accuracy: accuracy,
      };

      // Intentar parsear si el QR contiene un JSON (formato del AdminDashboard)
      let parsedData: any = null;
      try {
        if (qrData.startsWith('{')) {
          parsedData = JSON.parse(qrData);
        }
      } catch (e) {
        console.warn("QR no es JSON:", qrData);
      }

      if (parsedData && parsedData.aulaId) {
        payload.aulaId = Number(parsedData.aulaId);
      } else if (/^\d+$/.test(qrData)) {
        // Si es un número puro
        payload.aulaId = Number(qrData);
      } else {
        // Si no, es un código de contingencia (o el QR es el código directamente)
        payload.codigoContingencia = qrData.toUpperCase();
      }

      const res = await fetch(`${API}/sesiones/validar-docente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.message || 'Error en la validación');
      }

      setDocenteStatus(result.sesion?.asistenciaDocente || result.asistenciaDocente || result.estado);
      if (result.sesion?.id) setExistingSessionId(result.sesion.id);
      
      setShowScanner(false);
      
      // Mostrar mensaje de éxito
      setSuccessInfo({ 
        title: '¡Verificado!', 
        message: `Asistencia registrada como ${result.estado || 'PUNTUAL'}. Ya puedes pasar lista.` 
      });
      setShowSuccessModal(true);
      
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Error al validar ubicación';
      
      // Asegurarnos de que el mensaje sea legible si viene de NestJS
      const finalMsg = typeof msg === 'string' ? msg : JSON.stringify(msg);
      setErrorVerificacion(finalMsg);
      
      // Si el error es de "Fuera de rango", "QR Inválido" o falta de asignación, mostramos un modal especial
      if (finalMsg.toLowerCase().includes('fuera de rango') || 
          finalMsg.toLowerCase().includes('distancia') ||
          finalMsg.toLowerCase().includes('rango') ||
          finalMsg.toLowerCase().includes('qr inválido') ||
          finalMsg.toLowerCase().includes('qr invalido') ||
          finalMsg.toLowerCase().includes('no hay un aula asignada')) {
        setSuccessInfo({ 
          title: 'Error de Verificación', 
          message: finalMsg 
        });
        setShowSuccessModal(true);
      }
    } finally {
      setVerificandoDocente(false);
      isVerifyingRef.current = false;
    }
  };

  // 🔹 Efecto para el Escáner QR
  useEffect(() => {
    let scanner: Html5Qrcode | null = null;

    if (showScanner) {
      const startScanner = async () => {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setErrorVerificacion("Cámara no soportada o requiere HTTPS.");
            return;
          }

          scanner = new Html5Qrcode("reader");
          
          const qrConfig = {
            fps: 10,
            qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
              const minEdgePercentage = 0.7; // 70% del borde más pequeño
              const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
              const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
              return { width: qrboxSize, height: qrboxSize };
            },
            aspectRatio: 1.0
          };

          await scanner.start(
            { facingMode: "environment" }, 
            qrConfig,
            (decodedText) => {
              console.log("QR Detectado:", decodedText);
              handleValidarDocente(decodedText);
            },
            () => {}
          ).catch((err) => {
            console.warn("Fallo cámara trasera, intentando frontal...", err);
            return scanner?.start(
              { facingMode: "user" }, 
              qrConfig,
              (decodedText) => {
                console.log("QR Detectado (Frontal):", decodedText);
                handleValidarDocente(decodedText);
              },
              () => {}
            );
          });
        } catch (err: any) {
          console.error("General Scanner Error:", err);
          setErrorVerificacion("Fallo al abrir cámara. Revisa los permisos.");
        }
      };

      startScanner();
    }

    return () => {
      if (scanner) {
        if (scanner.isScanning) {
          scanner.stop().then(() => {
            scanner?.clear();
          }).catch(e => console.warn("Error al detener scanner:", e));
        } else {
          try { scanner.clear(); } catch(e) {}
        }
      }
    };
  }, [showScanner]);

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
      
      {/* HEADER BANNER DE BLOQUEO / ESTADO */}
      {(isReadOnly || docenteStatus) && (
        <div style={{ 
          padding: '1rem', 
          background: docenteStatus ? 'var(--color-success-container)' : 'var(--color-surface-container-high)', 
          borderBottom: '1px solid var(--color-outline-variant)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          animation: 'fadeInDown 0.4s ease' 
        }}>
          {docenteStatus ? <CheckCircle2 size={20} color="var(--color-success)" /> : <ShieldAlert size={20} color="var(--color-primary)" />}
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: docenteStatus ? 'var(--color-success)' : 'var(--color-primary)' }}>
            {isAdmin ? 'Modo Administrador: Solo lectura.' : 
             !isActuallyLive ? 'Registro deshabilitado: La clase no está en vivo actualmente.' :
             docenteStatus === 'PUNTUAL' ? 'Presencia Verificada: ¡Buen trabajo, llegaste a tiempo!' :
             docenteStatus === 'TARDE' ? 'Presencia Verificada: Registro con tardanza.' :
             'Debes verificar tu ubicación antes de pasar lista.'}
          </p>
        </div>
      )}

      {/* ESCUDO DE VERIFICACIÓN (Teacher Verification Gate) */}
      {!isAdmin && isActuallyLive && !docenteStatus && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(var(--color-primary-rgb), 0.98)',
          backdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '2rem', textAlign: 'center', color: 'white',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          {/* Círculo de Icono */}
          <div style={{ 
            width: '8rem', height: '8rem', borderRadius: '3rem', 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))', 
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '2.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <ShieldAlert size={56} color="var(--color-secondary)" className="pulse" />
            <div style={{ position: 'absolute', inset: '-10px', borderRadius: '3.5rem', border: '2px solid var(--color-secondary)', opacity: 0.3, animation: 'ping 2s infinite' }} />
          </div>

          <h2 style={{ fontSize: '2.5rem', fontWeight: 950, margin: '0 0 1rem', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            Control de <br />
            <span style={{ color: 'var(--color-secondary)' }}>Presencia</span>
          </h2>
          
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '3rem', maxWidth: '320px', fontWeight: 500, lineHeight: 1.5 }}>
            Para habilitar el registro de asistencia, confirma que estás en el aula escaneando el **Código QR oficial**.
          </p>
          
          {errorVerificacion && (
            <div className="animate-shake" style={{ 
              background: 'rgba(211, 47, 47, 0.15)', 
              color: '#ff8a80', 
              padding: '1.25rem', 
              borderRadius: '1.25rem', 
              marginBottom: '2rem', 
              fontSize: '0.9rem', 
              fontWeight: 700, 
              width: '100%', 
              maxWidth: '340px',
              border: '1px solid rgba(211, 47, 47, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <AlertCircle size={20} />
              <span style={{ textAlign: 'left' }}>{errorVerificacion}</span>
            </div>
          )}

          <div style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              onClick={() => {
                setErrorVerificacion('');
                setShowScanner(true);
              }}
              disabled={verificandoDocente}
              className="btn"
              style={{ 
                height: '4.5rem', 
                borderRadius: '1.5rem', border: 'none', 
                background: 'var(--color-secondary)', color: 'var(--color-on-secondary)', 
                fontWeight: 900, fontSize: '1.2rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                boxShadow: '0 15px 30px rgba(237, 198, 32, 0.3)',
                width: '100%'
              }}
            >
              {verificandoDocente ? <Loader2 className="spin" /> : <QrCode size={26} />}
              {verificandoDocente ? 'Validando...' : 'Escanear QR'}
            </button>
            
            <p style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 600 }}>
              Colegio Exitus • Sistema de Gestión de Clubes
            </p>
          </div>
          
          <style>{`
            @keyframes ping {
              0% { transform: scale(1); opacity: 0.3; }
              70% { transform: scale(1.3); opacity: 0; }
              100% { transform: scale(1.3); opacity: 0; }
            }
          `}</style>
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

      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => {
          setShowSuccessModal(false);
          // Si fue éxito, volvemos al dashboard
          if (successInfo.title === '¡Asistencia Registrada!' || successInfo.title === 'Guardado Local') {
            navigate('/dashboard');
          }
        }} 
        title={successInfo.title} 
        message={successInfo.message} 
      />

      {/* MODAL ESCÁNER QR */}
      {showScanner && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'black', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
            <button onClick={() => setShowScanner(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '1rem', width: '3rem', height: '3rem', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>
          
          <div style={{ width: '80vw', height: '80vw', maxWidth: '400px', maxHeight: '400px', border: '4px solid var(--color-secondary)', borderRadius: '2rem', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
             <div id="reader" style={{ width: '100%', height: '100%' }}></div>
             <div style={{ width: '100%', height: '2px', background: 'var(--color-secondary)', position: 'absolute', top: 0, animation: 'scan 2s infinite linear', boxShadow: '0 0 15px var(--color-secondary)', zIndex: 10, pointerEvents: 'none' }} />
             
             {/* Loader de Validación */}
             {verificandoDocente && (
               <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                 <Loader2 className="animate-spin" size={48} color="var(--color-secondary)" />
                 <p style={{ color: 'white', fontWeight: 800 }}>Validando...</p>
               </div>
             )}
          </div>
          
          <div style={{ marginTop: '3rem', width: '100%', maxWidth: '300px', textAlign: 'center', padding: '0 1rem' }}>
            {errorVerificacion && (
              <p style={{ color: '#ff8a80', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', background: 'rgba(211,47,47,0.2)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                {errorVerificacion}
              </p>
            )}
            <p style={{ color: 'white', fontWeight: 700, marginBottom: '1.5rem', fontSize: '0.9rem' }}>Escanear QR o ingresar código de contingencia</p>
            <input 
              autoFocus
              placeholder="Código de 6 caracteres"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleValidarDocente(e.currentTarget.value);
                }
              }}
              style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '1rem', textAlign: 'center', fontSize: '1.5rem', height: '4.5rem', letterSpacing: '0.2em', fontWeight: 900, outline: 'none' }}
            />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginTop: '1.25rem', fontWeight: 600 }}>
              Usa el código de 6 caracteres si el GPS o la cámara fallan.
            </p>
            <button 
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling?.previousElementSibling as HTMLInputElement;
                if (input.value) handleValidarDocente(input.value);
              }}
              disabled={verificandoDocente}
              style={{ marginTop: '1.5rem', width: '100%', height: '3.5rem', borderRadius: '1rem', border: 'none', background: 'var(--color-secondary)', color: 'white', fontWeight: 900, cursor: 'pointer', opacity: verificandoDocente ? 0.5 : 1 }}>
              {verificandoDocente ? 'Validando...' : 'Validar Código'}
            </button>
          </div>

          <style>{`
            @keyframes scan {
              0% { top: 0; }
              100% { top: 100%; }
            }
            .pulse { animation: pulse 2s infinite; }
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.7; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
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
