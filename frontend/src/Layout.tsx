import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, CreditCard, User, GraduationCap, BarChart2, BookOpen, UserPlus, Download, Bell, Check, Loader2 } from 'lucide-react';
import { useUser } from './UserContext';
import { useState, useEffect, useRef } from 'react';

const API = 'http://localhost:3000';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useUser();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [notifPage, setNotifPage] = useState(1);
  const [hasMoreNotifs, setHasMoreNotifs] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotificaciones = async (page = 1, append = false) => {
    if (!usuario) return;
    setLoadingNotifs(true);
    try {
      const res = await fetch(`${API}/notificaciones?usuarioId=${usuario.id}&page=${page}`);
      const data = await res.json();
      if (append) {
        setNotificaciones(prev => [...prev, ...data.items]);
      } else {
        setNotificaciones(data.items);
      }
      setHasMoreNotifs(data.page < data.lastPage);
      // Contar no leídas en total (o simplemente marcar como tenemos algo)
      setUnreadCount(data.items.filter((n: any) => !n.leida).length); 
    } catch (e) {
      console.error("Error fetching notifications", e);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    if (!usuario?.id) return;
    fetchNotificaciones();
    const interval = setInterval(() => fetchNotificaciones(), 20000); // Frecuencia normal (20s)
    return () => clearInterval(interval);
  }, [usuario?.id]); // Usar ID para evitar loops si el objeto cambia por referencia

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch(`${API}/notificaciones/${id}/leer`, { method: 'PUT' });
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    if (window.confirm('¿Seguro que quieres cerrar sesión?')) {
      logout();
      navigate('/login');
    }
  };

  const isProfesor = usuario?.rol === 'PROFESOR';
  const isAdmin    = usuario?.rol === 'ADMINISTRADOR';
  const isPadre    = usuario?.rol === 'PADRE';

  const homeRoute  = isAdmin ? '/admin' : isPadre ? '/portal' : '/';
  const homeActive = ['/', '/admin', '/portal'].includes(location.pathname);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-surface)' }}>

      {/* TOP NAV */}
      <header style={{
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        padding: '0.8rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid var(--color-surface-container-high)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'var(--color-primary)', width: '2.2rem', height: '2.2rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={20} color="var(--color-secondary-container)" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)', margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1 }}>
              EXITUS
            </h2>
            {usuario && (
              <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>
                {isAdmin ? '👑 Admin' : isProfesor ? '👨‍🏫 Profesor' : '👨‍👩‍👦 Familia'}
              </p>
            )}
          </div>
        </div>

        {/* ACCIONES DERECHA (Notificaciones + Avatar) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
          
          {/* Campanita */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: 'var(--color-surface-container-low)',
                width: '2.4rem', height: '2.4rem', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-primary)', border: 'none', cursor: 'pointer',
                transition: 'all 0.2s', position: 'relative'
              }}
            >
              <Bell size={20} strokeWidth={2.5} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '2px', right: '2px',
                  background: 'var(--color-error)', color: 'white',
                  fontSize: '0.6rem', fontWeight: 900,
                  minWidth: '1.1rem', height: '1.1rem', borderRadius: '99px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid white'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown de Notificaciones */}
            {showNotifications && (
              <div style={{
                position: 'absolute', top: '3rem', right: 0,
                width: '280px', background: 'white', borderRadius: '1.25rem',
                boxShadow: '0 15px 40px rgba(0,0,0,0.15)', zIndex: 1000,
                overflow: 'hidden', border: '1px solid var(--color-surface-container-high)',
                maxHeight: '400px', display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-surface-container-high)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: 'var(--color-primary)' }}>Notificaciones</h4>
                  {loadingNotifs && <Loader2 size={14} className="spin" style={{ animation: 'spin 1s linear infinite' }} />}
                </div>
                
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {notificaciones.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-outline)' }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>No hay notificaciones</p>
                    </div>
                  ) : (
                    <>
                      {notificaciones.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => !n.leida && handleMarkAsRead(n.id)}
                          style={{
                            padding: '1rem', borderBottom: '1px solid var(--color-surface-container-lowest)',
                            background: n.leida ? 'transparent' : 'var(--color-primary-fixed-dim)',
                            cursor: 'pointer', transition: 'background 0.2s'
                          }}
                        >
                          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>{n.titulo}</p>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--color-on-surface-variant)', lineHeight: 1.4 }}>{n.mensaje}</p>
                          <span style={{ fontSize: '0.6rem', color: 'var(--color-outline)', display: 'block', marginTop: '0.35rem' }}>
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {hasMoreNotifs && (
                        <button 
                          onClick={() => {
                            const nextPage = notifPage + 1;
                            setNotifPage(nextPage);
                            fetchNotificaciones(nextPage, true);
                          }}
                          style={{
                            width: '100%', padding: '0.75rem', border: 'none', background: 'var(--color-surface-container-low)',
                            color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer'
                          }}
                        >
                          Cargar más...
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => navigate('/perfil')} title="Mi Perfil" style={{
            background: 'var(--color-surface-container-highest)',
            width: '2.4rem', height: '2.4rem', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.85rem',
            border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer'
          }}>
            {usuario?.initials ?? '??'}
          </button>
        </div>
      </header>

      {/* CONTENIDO */}
      <main style={{ flex: 1, paddingBottom: '6.5rem' }}>
        {children}
      </main>

      {/* BOTTOM NAV */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, width: '100%',
        background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(15px)',
        borderTop: '1px solid var(--color-surface-container-high)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0.6rem 0', paddingBottom: 'calc(0.6rem + env(safe-area-inset-bottom))',
        zIndex: 100, boxShadow: '0 -4px 24px rgba(29,40,72,0.05)'
      }}>
        {(isAdmin && (location.pathname.startsWith('/admin') || location.pathname === '/')) ? (
          // ── ADMIN SPECIFIC NAVIGATION ──
          ([
            { key: 'panel',    icon: <BarChart2 size={24}/>,  label: 'Panel' },
            { key: 'clubes',   icon: <BookOpen size={24}/>,   label: 'Clubes' },
            { key: 'personas', icon: <UserPlus size={24}/>,   label: 'Personas' },
            { key: 'pagos',    icon: <CreditCard size={24}/>, label: 'Pagos' },
            { key: 'reporte',  icon: <Download size={24}/>,   label: 'Reporte' },
          ] as const).map(t => {
            const isActive = new URLSearchParams(location.search).get('tab') === t.key || (!new URLSearchParams(location.search).get('tab') && t.key === 'panel');
            return (
              <button
                key={t.key}
                onClick={() => navigate(`/admin?tab=${t.key}`)}
                style={{
                  background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '0.2rem', width: '20%', cursor: 'pointer',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-outline)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  background: isActive ? 'var(--color-primary-fixed)' : 'transparent',
                  padding: '0.15rem 0.8rem', borderRadius: '99px', transition: 'all 0.2s'
                }}>
                  {t.icon}
                </div>
                <span style={{ fontSize: '0.62rem', fontWeight: 800 }}>{t.label}</span>
              </button>
            );
          })
        ) : (
          // ── GLOBAL NAVIGATION ──
          <>
            {/* Inicio */}
            <button onClick={() => navigate(homeRoute)} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', width: '33.33%', cursor: 'pointer', color: location.pathname === '/' && (!new URLSearchParams(location.search).get('tab') || new URLSearchParams(location.search).get('tab') === 'inicio') ? 'var(--color-primary)' : 'var(--color-outline)' }}>
              <div style={{ background: (location.pathname === '/' && (!new URLSearchParams(location.search).get('tab') || new URLSearchParams(location.search).get('tab') === 'inicio')) ? 'var(--color-primary-fixed)' : 'transparent', padding: '0.15rem 1rem', borderRadius: '99px', transition: 'all 0.2s' }}>
                <LayoutDashboard size={22} strokeWidth={homeActive ? 2.5 : 2} />
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Inicio</span>
            </button>

            {/* Clubes — solo Profesores */}
            {isProfesor && (
              <button 
                onClick={() => navigate('/?tab=clubes')} 
                style={{ 
                  background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', 
                  alignItems: 'center', gap: '0.2rem', width: '33.33%', cursor: 'pointer', 
                  color: new URLSearchParams(location.search).get('tab') === 'clubes' ? 'var(--color-primary)' : 'var(--color-outline)' 
                }}
              >
                <div style={{ background: new URLSearchParams(location.search).get('tab') === 'clubes' ? 'var(--color-primary-fixed)' : 'transparent', padding: '0.15rem 1rem', borderRadius: '99px', transition: 'all 0.2s' }}>
                  <BookOpen size={22} strokeWidth={new URLSearchParams(location.search).get('tab') === 'clubes' ? 2.5 : 2} />
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Clubes</span>
              </button>
            )}

            {/* Pagos - Solo Padres */}
            {isPadre && (
              <button onClick={() => navigate('/pagos')} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', width: '33.33%', cursor: 'pointer', color: location.pathname === '/pagos' ? 'var(--color-primary)' : 'var(--color-outline)' }}>
                <div style={{ background: location.pathname === '/pagos' ? 'var(--color-primary-fixed)' : 'transparent', padding: '0.15rem 1rem', borderRadius: '99px', transition: 'all 0.2s' }}>
                  <CreditCard size={22} strokeWidth={location.pathname === '/pagos' ? 2.5 : 2} />
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Pagos</span>
              </button>
            )}

            {/* Perfil */}
            <button onClick={() => navigate('/perfil')} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', width: '33.33%', cursor: 'pointer', color: location.pathname === '/perfil' ? 'var(--color-primary)' : 'var(--color-outline)' }}>
              <div style={{ background: location.pathname === '/perfil' ? 'var(--color-primary-fixed)' : 'transparent', padding: '0.15rem 1rem', borderRadius: '99px', transition: 'all 0.2s' }}>
                <User size={22} strokeWidth={location.pathname === '/perfil' ? 2.5 : 2} />
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Perfil</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
