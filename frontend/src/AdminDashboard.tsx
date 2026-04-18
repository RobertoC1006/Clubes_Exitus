import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, Award, Loader2, Shield, TrendingUp } from 'lucide-react';
import './index.css';

// ✅ Datos Mock seguros directamente en el componente
const MOCK_STATS = {
  totalAlumnos: 10,
  totalClubes: 4,
  totalProfesores: 3,
  asistenciaGlobal: 84,
  clubes: [
    { id: 1, nombre: 'Fútbol Selección',    inscritos: 6, asistencia: 88, profesor: 'Juan Perez' },
    { id: 2, nombre: 'Taller de Ajedrez',    inscritos: 4, asistencia: 92, profesor: 'Juan Perez' },
    { id: 3, nombre: 'Danza Contemporánea',  inscritos: 4, asistencia: 80, profesor: 'Mariana López' },
    { id: 4, nombre: 'Robótica e IA',        inscritos: 4, asistencia: 75, profesor: 'Ricardo Suárez' },
  ],
  alertas: [
    { alumno: 'Diego Fernandez Ruiz',   club: 'Fútbol',   faltas: 4 },
    { alumno: 'Mateo Rodríguez Silva',  club: 'Robótica', faltas: 3 },
    { alumno: 'Camila Gómez León',      club: 'Danza',    faltas: 2 },
  ],
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const stats = MOCK_STATS; // Usamos datos directos sin fetch por ahora

  const clubesRanking = [...stats.clubes].sort((a, b) => b.asistencia - a.asistencia);

  return (
    <div className="app-container animate-enter" style={{ padding: '1.25rem', paddingBottom: '7rem' }}>

      {/* HERO HEADER */}
      <section style={{ marginBottom: '2rem' }}>
        <span style={{ color: 'var(--color-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>
          Command Center
        </span>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em', lineHeight: 1, margin: '0.25rem 0 0.5rem 0' }}>
          Panel Global
        </h2>
        <p style={{ margin: 0, color: 'var(--color-on-surface-variant)', fontSize: '0.9rem', fontWeight: 500 }}>
          Bienvenido, Director Carlos · Año Escolar 2025
        </p>
      </section>

      {/* BENTO GRID: MÉTRICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>

        {/* Atletás Activos — ocupa las 2 columnas */}
        <div style={{
          gridColumn: '1 / -1',
          background: 'var(--color-primary-container)',
          borderRadius: '1.5rem', padding: '1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 8px 32px rgba(29,40,72,0.3)'
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-primary-container)' }}>
              Atletas Activos
            </p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '3.5rem', fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-0.04em' }}>
              {stats.totalAlumnos}
            </p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-on-primary-container)', fontWeight: 600 }}>
              En {stats.totalClubes} disciplinas activas
            </p>
          </div>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '1.25rem', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={32} color="white" />
          </div>
        </div>

        {/* Asistencia Global */}
        <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: '1.25rem', padding: '1.25rem', boxShadow: '0 4px 16px rgba(14,26,57,0.04)' }}>
          <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-secondary)' }}>Asistencia</p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>
            {stats.asistenciaGlobal}%
          </p>
          <div style={{ marginTop: '0.75rem', height: '5px', borderRadius: '99px', background: 'var(--color-surface-container-high)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${stats.asistenciaGlobal}%`, background: 'var(--color-secondary-container)', borderRadius: '99px', transition: 'width 1s ease' }} />
          </div>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>Promedio global</p>
        </div>

        {/* Instructores */}
        <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: '1.25rem', padding: '1.25rem', boxShadow: '0 4px 16px rgba(14,26,57,0.04)' }}>
          <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-secondary)' }}>Instructores</p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>
            {stats.totalProfesores}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>activos este ciclo</p>
        </div>
      </div>

      {/* ALERTAS */}
      <section style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <AlertTriangle size={16} color="var(--color-error)" />
          <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>Requieren Atención</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {stats.alertas.map((a, i) => (
            <div key={i} style={{
              background: 'var(--color-surface-container-lowest)', borderRadius: '1rem',
              padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderLeft: '3px solid var(--color-error)'
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)' }}>{a.alumno}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>{a.club}</p>
              </div>
              <span style={{ background: 'var(--color-error-container)', color: 'var(--color-error)', padding: '0.3rem 0.7rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800 }}>
                {a.faltas} faltas
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* RANKING DE CLUBES */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <Award size={16} color="var(--color-secondary)" />
          <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>Ranking de Clubes</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {clubesRanking.map((club, i) => (
            <div key={club.id} style={{
              background: 'var(--color-surface-container-lowest)', borderRadius: '1rem',
              padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem'
            }}>
              <span style={{
                width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0,
                background: i === 0 ? 'var(--color-secondary-container)' : 'var(--color-surface-container-high)',
                color: i === 0 ? 'var(--color-on-secondary-container)' : 'var(--color-on-surface-variant)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '0.85rem'
              }}>
                {i + 1}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)' }}>{club.nombre}</p>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
                  {club.profesor} · {club.inscritos} alumnos
                </p>
              </div>
              <span style={{ fontWeight: 900, fontSize: '1.15rem', color: club.asistencia >= 85 ? 'var(--color-success)' : 'var(--color-error)' }}>
                {club.asistencia}%
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
