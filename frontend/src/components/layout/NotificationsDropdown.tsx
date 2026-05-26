import { Bell, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../../utils/fetchWithAuth';
import { useRole } from '../../hooks/useRole';

export function NotificationsDropdown() {
  const { usuario } = useRole();
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
      const res = await fetchWithAuth(`/notificaciones?usuarioId=${usuario.id}&page=${page}`);
      const data = await res.json();
      if (append) {
        setNotificaciones(prev => [...prev, ...data.items]);
      } else {
        setNotificaciones(data.items);
      }
      setHasMoreNotifs(data.page < data.lastPage);
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
    const interval = setInterval(() => fetchNotificaciones(), 20000);
    return () => clearInterval(interval);
  }, [usuario?.id]);

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
      await fetchWithAuth(`/notificaciones/${id}/leer`, { method: 'PUT' });
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  return (
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
  );
}
