import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, CreditCard, User, Users, GraduationCap, BarChart2, BookOpen, UserPlus, Download, Bell, Check, Loader2, LogOut, Calendar } from 'lucide-react';
import { useUser } from './UserContext';
import { useState, useEffect, useRef } from 'react';

import { API_BASE_URL } from './config';

const API = API_BASE_URL;

import schoolLogo from './assets/hero.png';

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

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutModal(false);
  };

  const isProfesor = usuario?.rol === 'PROFESOR';
  const isAdmin = usuario?.rol === 'ADMINISTRADOR';
  const isPadre = usuario?.rol === 'PADRE';
  const homeRoute = isAdmin ? '/admin' : isPadre ? '/portal' : '/';
  const homeActive = ['/', '/admin', '/portal'].includes(location.pathname);

  const adminTabs = [
    { key: 'panel', icon: <BarChart2 size={22} />, label: 'Panel', path: '/admin?tab=panel' },
    { key: 'clubes', icon: <BookOpen size={22} />, label: 'Clubes', path: '/admin?tab=clubes' },
    { key: 'personas', icon: <UserPlus size={22} />, label: 'Personas', path: '/admin?tab=personas' },
    { key: 'pagos', icon: <CreditCard size={22} />, label: 'Pagos', path: '/admin?tab=pagos' },
    { key: 'horarios', icon: <Calendar size={22} />, label: 'Horarios', path: '/admin?tab=horarios' },
    { key: 'reporte', icon: <Download size={22} />, label: 'Reportes', path: '/admin?tab=reporte' },
  ];

  const globalLinks = [
    // Solo mostramos Inicio y Pagos para NO-admins en esta lista global
    ...(!isAdmin ? [{ key: 'inicio', icon: <LayoutDashboard size={22} />, label: 'Inicio', path: homeRoute, active: location.pathname === '/' || (isAdmin && location.pathname === '/admin') || (isPadre && location.pathname === '/portal') }] : []),
    ...(isProfesor ? [
      { key: 'clubes', icon: <BookOpen size={22} />, label: 'Clubes', path: '/?tab=clubes', active: new URLSearchParams(location.search).get('tab') === 'clubes' },
      { key: 'rendimiento', icon: <BarChart2 size={22} />, label: 'Rendimiento', path: '/rendimiento', active: location.pathname === '/rendimiento' },
      { key: 'horarios', icon: <Calendar size={22} />, label: 'Horarios', path: '/?tab=horarios', active: new URLSearchParams(location.search).get('tab') === 'horarios' }
    ] : []),
    ...(isPadre ? [{ key: 'pagos', icon: <CreditCard size={22} />, label: 'Pagos', path: '/pagos', active: location.pathname === '/pagos' }] : []),
    ...(!isAdmin ? [{ key: 'perfil', icon: <User size={22} />, label: 'Perfil', path: '/perfil', active: location.pathname === '/perfil' }] : []),
  ];

  return (
    <div className={usuario ? 'layout-root has-sidebar' : 'layout-root'} style={{ background: 'var(--color-surface)' }}>

      {/* 🔮 MODAL DE CIERRE DE SESIÓN SIMPLIFICADO */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem', zIndex: 99999
        }} onClick={() => setShowLogoutModal(false)}>
          <div style={{
            background: 'white', borderRadius: '1.25rem', width: '100%', maxWidth: '380px',
            overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-surface-container-high)' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>Confirmar Salida</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-outline)', fontWeight: 600, lineHeight: 1.5 }}>
                ¿Estás seguro de que deseas cerrar tu sesión actual?
              </p>
            </div>
            <div style={{ padding: '1rem 1.5rem 1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowLogoutModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '0.75rem', border: '1px solid var(--color-surface-container-high)', background: 'white', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={confirmLogout} style={{ padding: '0.6rem 1.2rem', borderRadius: '0.75rem', border: 'none', background: 'var(--color-error)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Cerrar Sesión</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR DESKTOP */}
      {usuario && (
        <aside className="sidebar-desktop">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '2.8rem', height: '2.8rem', background: 'white', borderRadius: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
              <img src={schoolLogo} alt="Fenix Mascot" style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ color: 'var(--color-primary)', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.05em' }}>EXITUS</span>
              {isAdmin && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '1px' }}>Administrador</span>}
            </div>
          </div>

          <nav style={{ flex: 1 }}>
            {isAdmin ? (
              adminTabs.map(t => {
                const isActive = new URLSearchParams(location.search).get('tab') === t.key || (!new URLSearchParams(location.search).get('tab') && t.key === 'panel');
                return (
                  <button key={t.key} onClick={() => navigate(t.path)} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                );
              })
            ) : (
              globalLinks.map(l => (
                <button key={l.key} onClick={() => navigate(l.path)} className={`sidebar-link ${l.active ? 'active' : ''}`}>
                  {l.icon}
                  <span>{l.label}</span>
                </button>
              ))
            )}
          </nav>

          <footer style={{ marginTop: 'auto', padding: '1rem 0' }}>
            <button
              onClick={handleLogout}
              className="sidebar-link"
              style={{ color: 'var(--color-error)', width: '100%', background: 'var(--color-surface-container-low)' }}
            >
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </footer>
        </aside>
      )}

      {/* ÁREA DE CONTENIDO (Header + Contenido de Página) */}
      <div className="content-area discrete-scroll">
        <header className="header-glass" style={{
          padding: '0.6rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)', maxHeight: '60px'
        }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* Solo mostrar Logo en Header si es móvil */}
            <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ background: 'white', width: '2.4rem', height: '2.4rem', borderRadius: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <img src={schoolLogo} alt="Logo" style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-primary)', margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1 }}>
                  EXITUS
                </h2>
                {isAdmin && <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Dashboard Administrador</p>}
              </div>
            </div>
            {/* En desktop el Logo ya está en el sidebar, podemos mostrar el título de la sección u otro elemento */}
            <div className="desktop-only" style={{ display: 'none' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary-container)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sistema de Gestión Escolar
              </p>
            </div>
          </div>

          {/* ACCIONES DERECHA (Notificaciones + Avatar) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
            {usuario && (
              <div style={{ textAlign: 'right', marginRight: '0.5rem' }} className="desktop-only">
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-primary)' }}>{usuario.nombre} {usuario.apellido}</p>
                <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
                  {isAdmin ? 'Administrador' : isProfesor ? 'Profesor' : 'Familia'}
                </p>
              </div>
            )}

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

        <div className="app-container">
          <main style={{ flex: 1, paddingBottom: '0.75rem' }}>


            {children}
          </main>
        </div>
      </div>

      {/* BOTTOM NAV (MOBILE ONLY) */}
      <nav className="bottom-nav-mobile" style={{
        position: 'fixed', bottom: 0, left: 0, width: '100%',
        background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(15px)',
        borderTop: '1px solid var(--color-surface-container-high)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0.6rem 0', paddingBottom: 'calc(0.6rem + env(safe-area-inset-bottom))',
        zIndex: 100, boxShadow: '0 -4px 24px rgba(29,40,72,0.05)'
      }}>
        {isAdmin ? (
          adminTabs.map(t => {
            const isActive = new URLSearchParams(location.search).get('tab') === t.key || (!new URLSearchParams(location.search).get('tab') && t.key === 'panel');
            return (
              <button
                key={t.key}
                onClick={() => navigate(t.path)}
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
          globalLinks.map(l => (
            <button key={l.key} onClick={() => navigate(l.path)} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', width: '33.33%', cursor: 'pointer', color: l.active ? 'var(--color-primary)' : 'var(--color-outline)' }}>
              <div style={{ background: l.active ? 'var(--color-primary-fixed)' : 'transparent', padding: '0.15rem 1rem', borderRadius: '99px', transition: 'all 0.2s' }}>
                {l.icon}
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>{l.label}</span>
            </button>
          ))
        )}
      </nav>

      {/* ESTILOS ESPECÍFICOS PARA HEADER/SIDEBAR VISIBILITY */}
      <style>{`
        @media (min-width: 768px) {
          .mobile-only { display: none !important; }
          .desktop-only { display: block !important; }
        }
        @media (max-width: 767px) {
          .desktop-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
