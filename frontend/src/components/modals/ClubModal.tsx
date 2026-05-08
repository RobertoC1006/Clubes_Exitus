import React, { useState } from 'react';
import { X, Save, ChevronDown } from 'lucide-react';
import type { ClubMetrica, Profesor, Aula } from '../../types';
import { labelStyle, inputStyle } from '../../styles/adminStyles';

interface ClubModalProps {
  club: Partial<ClubMetrica> | null;
  profesores: Profesor[];
  aulas: Aula[];
  onSave: (data: {
    nombre: string;
    descripcion: string;
    precio: number;
    profesorId: number;
    horario: any;
  }) => void;
  onClose: () => void;
}

export function ClubModal({
  club,
  profesores,
  aulas,
  onSave,
  onClose,
}: ClubModalProps) {
  const [nombre, setNombre] = useState(club?.nombre ?? '');
  const [desc, setDesc] = useState(club?.descripcion ?? '');
  const [precio, setPrecio] = useState<number>(club?.precio ?? 50);
  const [profId, setProfId] = useState<number>(
    club?.profesorId ?? (profesores[0]?.id ?? 0)
  );

  const DIAS = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];

  const initialHorario = (() => {
    if (!club?.horario) return {};
    if (typeof club.horario === 'string') {
      try {
        return JSON.parse(club.horario);
      } catch {
        return {};
      }
    }
    return club.horario;
  })();

  const [horario, setHorario] = useState<any>(initialHorario);

  const toggleDia = (dia: string) => {
    setHorario((prev: any) => {
      let current = prev;
      if (typeof prev === 'string') {
        try {
          current = JSON.parse(prev);
        } catch {
          current = {};
        }
      }
      const newHorario = { ...current };
      if (newHorario[dia]) {
        delete newHorario[dia];
      } else {
        newHorario[dia] = {
          start: '16:00',
          end: '17:30',
          aulaId: aulas[0]?.id || null,
        };
      }
      return newHorario;
    });
  };

  const updateAula = (dia: string, aulaId: string) => {
    setHorario((prev: any) => {
      let current = prev;
      if (typeof prev === 'string') {
        try {
          current = JSON.parse(prev);
        } catch {
          current = {};
        }
      }
      return {
        ...current,
        [dia]: { ...current[dia], aulaId: Number(aulaId) },
      };
    });
  };

  const updateTime = (dia: string, key: 'start' | 'end', val: string) => {
    setHorario((prev: any) => {
      let current = prev;
      if (typeof prev === 'string') {
        try {
          current = JSON.parse(prev);
        } catch {
          current = {};
        }
      }
      return {
        ...current,
        [dia]: { ...current[dia], [key]: val },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !profId) return;
    onSave({ nombre, descripcion: desc, precio, profesorId: profId, horario });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: '2rem',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '550px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.6rem',
                fontWeight: 900,
                color: 'var(--color-primary)',
                letterSpacing: '-0.04em',
              }}
            >
              {club?.id ? 'Editar' : 'Nuevo'}{' '}
              <span style={{ color: 'var(--color-secondary)' }}>
                Club / Disciplina
              </span>
            </h3>
            <p
              style={{
                margin: '0.2rem 0 0',
                fontSize: '0.85rem',
                color: 'var(--color-outline)',
                fontWeight: 700,
              }}
            >
              {club?.id
                ? 'Actualiza la información y programación'
                : 'Crea una nueva disciplina deportiva o académica'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--color-surface-dim)',
              border: 'none',
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} color="var(--color-primary)" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Nombre de la Disciplina</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Ajedrez"
                required
                style={{ ...inputStyle, height: '3.5rem', borderRadius: '1rem' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Resumen / Descripción</label>
              <input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Breve descripción..."
                style={{ ...inputStyle, height: '3.5rem', borderRadius: '1rem' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Precio Mensual (S/)</label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(Number(e.target.value))}
                placeholder="Ej: 50"
                required
                min="0"
                style={{ ...inputStyle, height: '3.5rem', borderRadius: '1rem' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Profesor Responsable</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={profId}
                  onChange={(e) => setProfId(Number(e.target.value))}
                  required
                  style={{
                    ...inputStyle,
                    height: '3.5rem',
                    borderRadius: '1rem',
                    appearance: 'none',
                    paddingRight: '3rem',
                  }}
                >
                  {profesores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.apellido}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={20}
                  color="var(--color-primary)"
                  style={{
                    position: 'absolute',
                    right: '1.25rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Programación de Horarios</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '0.5rem',
                padding: '0.25rem',
              }}
            >
              {DIAS.map((dia) => {
                const isActive = !!horario[dia];
                return (
                  <div
                    key={dia}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '1.25rem',
                      border: '1.5px solid',
                      borderColor: isActive
                        ? 'var(--color-primary)'
                        : 'var(--color-surface-container-high)',
                      background: isActive
                        ? 'var(--color-primary-fixed)'
                        : 'var(--color-surface-container-lowest)',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleDia(dia)}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.4rem',
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          color: isActive
                            ? 'var(--color-primary)'
                            : 'var(--color-outline)',
                        }}
                      >
                        {dia}
                      </span>
                      <div
                        style={{
                          width: '0.6rem',
                          height: '0.6rem',
                          borderRadius: '50%',
                          background: isActive
                            ? 'var(--color-primary)'
                            : 'var(--color-surface-container-high)',
                        }}
                      ></div>
                    </div>
                    {isActive && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                          marginTop: '0.5rem',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.15rem',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.55rem',
                              fontWeight: 900,
                              color: 'var(--color-primary)',
                              opacity: 0.7,
                            }}
                          >
                            INICIO / FIN
                          </span>
                          <div style={{ display: 'flex', gap: '0.2rem' }}>
                            <input
                              type="time"
                              value={horario[dia].start}
                              onChange={(e) =>
                                updateTime(dia, 'start', e.target.value)
                              }
                              style={{
                                border: 'none',
                                background: 'white',
                                color: 'var(--color-primary)',
                                fontSize: '0.7rem',
                                fontWeight: 900,
                                padding: '0.2rem',
                                borderRadius: '0.4rem',
                                textAlign: 'center',
                                width: '100%',
                              }}
                            />
                            <input
                              type="time"
                              value={horario[dia].end}
                              onChange={(e) =>
                                updateTime(dia, 'end', e.target.value)
                              }
                              style={{
                                border: 'none',
                                background: 'white',
                                color: 'var(--color-primary)',
                                fontSize: '0.7rem',
                                fontWeight: 900,
                                padding: '0.2rem',
                                borderRadius: '0.4rem',
                                textAlign: 'center',
                                width: '100%',
                              }}
                            />
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.15rem',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.55rem',
                              fontWeight: 900,
                              color: 'var(--color-primary)',
                              opacity: 0.7,
                            }}
                          >
                            AULA ASIGNADA
                          </span>
                          <select
                            value={horario[dia].aulaId || ''}
                            onChange={(e) => updateAula(dia, e.target.value)}
                            style={{
                              border: 'none',
                              background: 'white',
                              color: 'var(--color-primary)',
                              fontSize: '0.65rem',
                              fontWeight: 900,
                              padding: '0.2rem',
                              borderRadius: '0.4rem',
                              width: '100%',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="">Seleccionar...</option>
                            {aulas.map((a: any) => (
                              <option key={a.id} value={a.id}>
                                {a.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: '3.5rem',
                borderRadius: '1rem',
                border: 'none',
                background: 'var(--color-surface-dim)',
                color: 'var(--color-primary)',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                flex: 2,
                height: '3.5rem',
                borderRadius: '1rem',
                border: 'none',
                background: 'var(--color-primary)',
                color: 'white',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(var(--color-primary-rgb), 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Save size={20} /> {club?.id ? 'Guardar Cambios' : 'Crear Disciplina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
