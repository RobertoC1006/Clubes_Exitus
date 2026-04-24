import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Award, TrendingUp, TrendingDown, Users, BookOpen, Star } from 'lucide-react';
import { useUser } from './UserContext';
import './index.css';
import { API_BASE_URL } from './config';

const API = API_BASE_URL;

export default function GlobalAsistencia() {
  const { usuario } = useUser();
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!usuario?.id) return;
    setLoading(true);
    fetch(`${API}/clubes/performance-alumnos/${usuario.id}`)
      .then(res => res.json())
      .then(data => {
        setAlumnos(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Error fetching performance data:", err))
      .finally(() => setLoading(false));
  }, [usuario?.id]);

  const filteredAlumnos = useMemo(() => {
    return alumnos.filter(a => 
      a.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.clubNombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [alumnos, searchTerm]);

  const stats = useMemo(() => {
    if (alumnos.length === 0) return { avg: 0, top: 0, risk: 0 };
    const avg = Math.round(alumnos.reduce((acc, a) => acc + a.pct, 0) / alumnos.length);
    const top = alumnos.filter(a => a.pct >= 90).length;
    const risk = alumnos.filter(a => a.pct < 50 && a.totalSesiones > 2).length;
    return { avg, top, risk };
  }, [alumnos]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
        <Loader2 className="animate-spin" size={48} strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="animate-enter" style={{ padding: '1.25rem', paddingBottom: '7rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER PERFORMANCE */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="header-text" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 'calc(1.4rem + 1vw)', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.05em', margin: 0, lineHeight: 1.1 }}>
            Rendimiento de <span style={{ color: 'var(--color-secondary)' }}>Atletas</span>
          </h2>
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: 'var(--color-outline)', fontWeight: 600 }}>
            Seguimiento de constancia global
          </p>
        </div>

        {/* METRICS GRID RESPONSIVE */}
        <div className="metrics-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
            <div className="glass-card metric-chip" style={{ padding: '1.25rem', background: 'white', border: '1px solid var(--color-surface-container-high)', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'var(--color-surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={18} color="var(--color-primary)" />
                  </div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-outline)', textTransform: 'uppercase' }}>Promedio</span>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, color: 'var(--color-primary)' }}>{stats.avg}%</p>
                </div>
            </div>
            <div className="glass-card metric-chip" style={{ padding: '1.25rem', background: 'var(--color-primary-fixed)', border: 'none', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Star size={18} color="var(--color-primary)" fill="var(--color-primary)" />
                  </div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Top (90%+)</span>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, color: 'var(--color-primary)' }}>{stats.top}</p>
                </div>
            </div>
            <div className="glass-card metric-chip" style={{ padding: '1.25rem', background: 'var(--color-error-container)', border: 'none', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingDown size={18} color="var(--color-error)" />
                  </div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-error)', textTransform: 'uppercase' }}>Riesgo</span>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, color: 'var(--color-error)' }}>{stats.risk}</p>
                </div>
            </div>
        </div>

        {/* SEARCH BAR */}
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)' }} />
          <input 
            type="text" 
            placeholder="Buscar atleta o club..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '1rem 1rem 1rem 3.2rem', borderRadius: '1.25rem',
              border: '1px solid var(--color-surface-container-high)', background: 'white',
              fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)',
              boxShadow: 'var(--shadow-sm)', outline: 'none', transition: 'all 0.2s'
            }}
          />
        </div>
      </section>

      {/* TABLE/LIST OF ALUMNOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {filteredAlumnos.length > 0 ? filteredAlumnos.map((a, i) => (
          <div key={`${a.id}-${a.clubNombre}`} className="glass-card item-row" style={{
            background: 'white', padding: '1.25rem', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', border: '1px solid var(--color-surface-container-high)',
            borderRadius: '1.25rem', transition: 'all 0.2s', animationDelay: `${i * 0.05}s`,
            flexWrap: 'wrap', gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 240px' }}>
              <div style={{ 
                width: '3rem', height: '3rem', borderRadius: '50%', 
                background: a.pct >= 90 ? 'var(--color-primary-fixed)' : 'var(--color-surface-container-low)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-primary)', fontWeight: 900, fontSize: '1rem',
                border: '2px solid white', boxShadow: 'var(--shadow-sm)', flexShrink: 0
              }}>
                {a.nombreCompleto.charAt(0)}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>{a.nombreCompleto}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'var(--color-surface-container-high)', padding: '0.05rem 0.4rem', borderRadius: '4px', color: 'var(--color-outline)' }}>{a.grado}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-outline)' }}>en {a.clubNombre}</span>
                </div>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              flex: '1 1 120px', 
              justifyContent: 'flex-end',
              marginLeft: 'auto'
            }}>
              <div style={{ textAlign: 'right', minWidth: '4.5rem' }}>
                <p style={{ 
                  margin: 0, fontSize: '1.1rem', fontWeight: 950, 
                  color: a.pct >= 90 ? '#059669' : a.pct < 50 ? 'var(--color-error)' : 'var(--color-primary)' 
                }}>
                  {a.pct}%
                </p>
                <div style={{ width: '100%', height: '4px', background: 'var(--color-surface-container-high)', borderRadius: '2px', marginTop: '4px' }}>
                  <div style={{ 
                    width: `${a.pct}%`, height: '100%', 
                    background: a.pct >= 90 ? '#10b981' : a.pct < 50 ? 'var(--color-error)' : 'var(--color-primary)', 
                    borderRadius: '2px' 
                  }} />
                </div>
              </div>
              {a.pct >= 90 && <Award size={20} color="#fbbf24" fill="#fbbf24" style={{ flexShrink: 0 }} />}
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Users size={40} color="var(--color-surface-container-high)" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--color-outline)', fontWeight: 600 }}>No hay atletas</p>
          </div>
        )}
      </div>

      <style>{`
        .item-row:hover {
          transform: translateY(-2px);
          border-color: var(--color-primary) !important;
          box-shadow: 0 8px 24px rgba(29,40,72,0.06);
        }
        @media (max-width: 480px) {
          .metrics-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 0.5rem !important; }
          .metric-chip { padding: 0.75rem 0.25rem !important; }
          .metric-chip p { fontSize: 1.1rem !important; }
          .metric-chip span { fontSize: 0.5rem !important; }
        }
      `}</style>
    </div>
  );
}
