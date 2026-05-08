import React, { useState } from 'react';
import { X, ChevronDown, RefreshCw, GraduationCap } from 'lucide-react';
import type { Alumno, Usuario } from '../../types';
import { labelStyle, inputStyle } from '../../styles/adminStyles';

interface AlumnoModalProps {
  alumno: Partial<Alumno>;
  saving: boolean;
  clubes: any[];
  usuarios?: Usuario[];
  onSave: (data: any) => void;
  onClose: () => void;
}

export function AlumnoModal({
  alumno,
  saving,
  clubes,
  usuarios,
  onSave,
  onClose,
}: AlumnoModalProps) {
  const padres = (usuarios ?? []).filter((u) => u.rol === 'PADRE');
  const currentClubIds =
    (alumno as any).inscripciones?.map((i: any) => i.clubId) ?? [];
  const [nombre, setNombre] = useState((alumno as any).nombre ?? '');
  const [apellido, setApellido] = useState((alumno as any).apellido ?? '');
  const [grado, setGrado] = useState((alumno as any).grado ?? '');
  const [padreId, setPadreId] = useState<number | string>(
    (alumno as any).padreId ?? ''
  );
  const [selectedClubIds, setSelectedClubIds] =
    useState<number[]>(currentClubIds);

  // Estado para creación rápida de padre
  const [creandoPadre, setCreandoPadre] = useState(false);
  const [pNombre, setPNombre] = useState('');
  const [pApellido, setPApellido] = useState('');
  const [pDni, setPDni] = useState('');

  const toggleClub = (id: number) => {
    setSelectedClubIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      nombre,
      apellido,
      grado,
      clubIds: selectedClubIds,
      padreId: padreId === '' ? undefined : Number(padreId),
    };

    if (creandoPadre && pNombre && pApellido) {
      payload.nuevoPadre = { nombre: pNombre, apellido: pApellido, dni: pDni };
    }

    onSave(payload);
  };

  const GRADOS = [
    '1ro Primaria',
    '2do Primaria',
    '3ro Primaria',
    '4to Primaria',
    '5to Primaria',
    '6to Primaria',
    '1ro Secundaria',
    '2do Secundaria',
    '3ro Secundaria',
    '4to Secundaria',
    '5to Secundaria',
  ];

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
          maxWidth: '480px',
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
              {(alumno as any).id ? 'Modificar' : 'Inscribir'}{' '}
              <span style={{ color: 'var(--color-secondary)' }}>Alumno</span>
            </h3>
            <p
              style={{
                margin: '0.2rem 0 0',
                fontSize: '0.85rem',
                color: 'var(--color-outline)',
                fontWeight: 700,
              }}
            >
              Gestión académica y asignación de tutor
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
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
          >
            <div>
              <label style={labelStyle}>Nombre</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: María"
                required
                style={{ ...inputStyle, borderRadius: '0.85rem', height: '3.2rem' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Apellido</label>
              <input
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Ej: García"
                required
                style={{ ...inputStyle, borderRadius: '0.85rem', height: '3.2rem' }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Grado Escolar</label>
            <div style={{ position: 'relative' }}>
              <select
                value={grado}
                onChange={(e) => setGrado(e.target.value)}
                required
                style={{
                  ...inputStyle,
                  borderRadius: '0.85rem',
                  height: '3.2rem',
                  appearance: 'none',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="">— Selecciona un grado —</option>
                {GRADOS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                color="var(--color-primary)"
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          <div
            style={{
              background: 'var(--color-surface-container-lowest)',
              padding: '1.25rem',
              borderRadius: '1.25rem',
              border: '1px solid var(--color-surface-container-high)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Padre / Tutor Responsable
              </label>
              <button
                type="button"
                onClick={() => setCreandoPadre(!creandoPadre)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-secondary)',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {creandoPadre ? '✕ Cancelar' : '+ Nuevo Padre'}
              </button>
            </div>

            {creandoPadre ? (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                  }}
                >
                  <input
                    value={pNombre}
                    onChange={(e) => setPNombre(e.target.value)}
                    placeholder="Nombres"
                    style={{
                      ...inputStyle,
                      padding: '0.5rem 0.8rem',
                      fontSize: '0.8rem',
                      height: '2.8rem',
                    }}
                  />
                  <input
                    value={pApellido}
                    onChange={(e) => setPApellido(e.target.value)}
                    placeholder="Apellidos"
                    style={{
                      ...inputStyle,
                      padding: '0.5rem 0.8rem',
                      fontSize: '0.8rem',
                      height: '2.8rem',
                    }}
                  />
                </div>
                <input
                  value={pDni}
                  onChange={(e) => setPDni(e.target.value)}
                  placeholder="DNI del Padre"
                  style={{
                    ...inputStyle,
                    padding: '0.5rem 0.8rem',
                    fontSize: '0.8rem',
                    height: '2.8rem',
                  }}
                />
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <select
                  value={padreId}
                  onChange={(e) => setPadreId(e.target.value)}
                  style={{
                    ...inputStyle,
                    borderRadius: '0.75rem',
                    height: '2.8rem',
                    fontSize: '0.85rem',
                    appearance: 'none',
                  }}
                >
                  <option value="">— Sin asignar —</option>
                  {padres.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.apellido}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  color="var(--color-primary)"
                  style={{
                    position: 'absolute',
                    right: '0.8rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Disciplinas Inscritas</label>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                maxHeight: '140px',
                overflowY: 'auto',
                padding: '1rem',
                background: 'var(--color-surface-container-lowest)',
                borderRadius: '1.25rem',
                border: '1px solid var(--color-surface-container-high)',
              }}
            >
              {clubes.map((c) => {
                const isSelected = selectedClubIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '0.85rem',
                      background: isSelected
                        ? 'var(--color-primary-fixed)'
                        : 'transparent',
                      transition: 'all 0.2s',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: isSelected
                        ? 'var(--color-primary)'
                        : 'var(--color-outline)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleClub(c.id)}
                      style={{
                        width: '1.1rem',
                        height: '1.1rem',
                        accentColor: 'var(--color-primary)',
                      }}
                    />
                    {c.nombre}
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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
              disabled={saving}
              style={{
                flex: 2,
                height: '3.5rem',
                borderRadius: '1rem',
                border: 'none',
                background: 'var(--color-primary)',
                color: 'white',
                fontWeight: 900,
                cursor: 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 8px 24px rgba(var(--color-primary-rgb), 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {saving ? (
                <RefreshCw size={20} className="spin" />
              ) : (
                <GraduationCap size={20} />
              )}
              {saving ? 'Guardando...' : 'Guardar Alumno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
