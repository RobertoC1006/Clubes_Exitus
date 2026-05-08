import React from 'react';
import { X, Navigation } from 'lucide-react';
import type { Aula } from '../../types';
import { labelStyle, inputStyle } from '../../styles/adminStyles';

import { fetchWithAuth } from '../../utils/fetchWithAuth';

interface AulaModalProps {
  isOpen: boolean;
  editingAula: Aula | null;
  muestras: any[];
  calibrando: boolean;
  calibracionProgreso: number;
  calibracionPaso: number;
  calibracionCompletada: boolean;
  onClose: () => void;
  onFetchAulas: () => void;
  setCalibrando: (val: boolean) => void;
  setMuestras: (val: any[]) => void;
  setCalibracionProgreso: (val: number) => void;
  setCalibracionPaso: (val: number) => void;
  setCalibracionCompletada: (val: boolean) => void;
}

export function AulaModal({
  isOpen,
  editingAula,
  muestras,
  calibrando,
  calibracionProgreso,
  calibracionPaso,
  calibracionCompletada,
  onClose,
  onFetchAulas,
  setCalibrando,
  setMuestras,
  setCalibracionProgreso,
  setCalibracionPaso,
  setCalibracionCompletada,
}: AulaModalProps) {
  if (!isOpen) return null;

  const PUNTOS_CALIBRACION = [
    { label: 'Esquina 1 (Frente-Izquierda)', icon: '↖️' },
    { label: 'Esquina 2 (Frente-Derecha)', icon: '↗️' },
    { label: 'Esquina 3 (Fondo-Izquierda)', icon: '↙️' },
    { label: 'Esquina 4 (Fondo-Derecha)', icon: '↘️' },
    { label: 'Centro del Aula', icon: '⭐' },
  ];

  const iniciarCalibracion = () => {
    setCalibrando(true);
    setMuestras([]);
    setCalibracionProgreso(0);
    setCalibracionPaso(0);
    setCalibracionCompletada(false);
  };

  const capturarPuntoCalibrado = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const nuevaMuestra = {
          lat: latitude,
          lng: longitude,
          accuracy,
          label: PUNTOS_CALIBRACION[calibracionPaso].label,
        };

        const nuevasMuestras = [...muestras, nuevaMuestra];
        setMuestras(nuevasMuestras);

        const nextPaso = calibracionPaso + 1;
        setCalibracionProgreso(nextPaso * 20);

        if (nextPaso < 5) {
          setCalibracionPaso(nextPaso);
        } else {
          setCalibrando(false);
          setCalibracionCompletada(true);
        }
      },
      (err) => {
        alert('Error al obtener ubicación: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nombre: formData.get('nombre') as string,
      latitud: parseFloat(formData.get('latitud') as string),
      longitud: parseFloat(formData.get('longitud') as string),
      radioPermitido: parseInt(formData.get('radioPermitido') as string),
      codigoContingencia: formData.get('codigoContingencia') as string,
    };

    const path = editingAula ? `/admin/aulas/${editingAula.id}` : `/admin/aulas`;
    const method = editingAula ? 'PUT' : 'POST';

    try {
      await fetchWithAuth(path, { method, body: JSON.stringify(data) });
      onClose();
      onFetchAulas();
    } catch (error) {
      console.error('Error saving aula:', error);
      alert('Error al guardar el aula');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '1.5rem',
          width: '100%',
          maxWidth: '450px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--color-surface-container-high)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 900,
              color: 'var(--color-primary)',
            }}
          >
            {editingAula ? 'Editar' : 'Nueva'} Aula
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-outline)',
            }}
          >
            <X size={24} />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div>
            <label style={labelStyle}>Nombre del Aula / Punto de Marcaje</label>
            <input
              name="nombre"
              defaultValue={editingAula?.nombre}
              required
              style={inputStyle}
              placeholder="Ej: Aula 203, Campo de Fútbol"
            />
          </div>

          <div
            style={{
              background: 'var(--color-surface-container-lowest)',
              padding: '1rem',
              borderRadius: '1rem',
              border: '1px dashed var(--color-primary-container)',
            }}
          >
            <p
              style={{
                margin: '0 0 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
              }}
            >
              Calibración GPS — 5 Puntos del Aula
            </p>
            <p
              style={{
                margin: '0 0 1rem',
                fontSize: '0.65rem',
                color: 'var(--color-outline)',
                fontWeight: 600,
              }}
            >
              Captura las 4 esquinas y el centro del aula para máxima precisión.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <label style={{ ...labelStyle, fontSize: '0.6rem' }}>
                  Latitud (centroide)
                </label>
                <input
                  name="latitud"
                  value={
                    calibracionCompletada && muestras.length === 5
                      ? (
                          muestras.reduce((a, b) => a + b.lat, 0) / muestras.length
                        ).toFixed(7)
                      : muestras.length > 0 && !calibrando
                      ? (
                          muestras.reduce((a, b) => a + b.lat, 0) / muestras.length
                        ).toFixed(7)
                      : editingAula?.latitud?.toString() || ''
                  }
                  readOnly
                  style={{
                    ...inputStyle,
                    fontSize: '0.8rem',
                    background: calibracionCompletada ? '#e8f5e9' : undefined,
                  }}
                />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.6rem' }}>
                  Longitud (centroide)
                </label>
                <input
                  name="longitud"
                  value={
                    calibracionCompletada && muestras.length === 5
                      ? (
                          muestras.reduce((a, b) => a + b.lng, 0) / muestras.length
                        ).toFixed(7)
                      : muestras.length > 0 && !calibrando
                      ? (
                          muestras.reduce((a, b) => a + b.lng, 0) / muestras.length
                        ).toFixed(7)
                      : editingAula?.longitud?.toString() || ''
                  }
                  readOnly
                  style={{
                    ...inputStyle,
                    fontSize: '0.8rem',
                    background: calibracionCompletada ? '#e8f5e9' : undefined,
                  }}
                />
              </div>
            </div>

            {muestras.length > 0 && (
              <div
                style={{
                  marginBottom: '0.75rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.35rem',
                }}
              >
                {muestras.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.5rem',
                      background: 'var(--color-primary-fixed)',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <span>{PUNTOS_CALIBRACION[i]?.icon}</span>
                    <span>±{m.accuracy.toFixed(0)}m</span>
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                height: '6px',
                background: 'var(--color-surface-container-high)',
                borderRadius: '3px',
                marginBottom: '0.75rem',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${calibracionProgreso}%`,
                  height: '100%',
                  background: calibracionCompletada
                    ? '#4caf50'
                    : 'var(--color-secondary)',
                  transition: 'width 0.4s ease',
                }}
              ></div>
            </div>

            {calibrando && (
              <div
                style={{
                  background: 'var(--color-primary-fixed)',
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  marginBottom: '0.75rem',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: 'var(--color-primary)',
                  }}
                >
                  {PUNTOS_CALIBRACION[calibracionPaso]?.icon} Paso{' '}
                  {calibracionPaso + 1}/5
                </p>
                <p
                  style={{
                    margin: '0.25rem 0 0',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                  }}
                >
                  Ve a: <strong>{PUNTOS_CALIBRACION[calibracionPaso]?.label}</strong>
                </p>
                <p
                  style={{
                    margin: '0.25rem 0 0',
                    fontSize: '0.65rem',
                    color: 'var(--color-outline)',
                  }}
                >
                  Presiona "Capturar" cuando estés en posición
                </p>
              </div>
            )}

            {calibracionCompletada && (
              <div
                style={{
                  background: '#e8f5e9',
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  marginBottom: '0.75rem',
                  textAlign: 'center',
                  border: '1px solid #a5d6a7',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#2e7d32' }}>
                  ✅ Calibración completa — 5/5 puntos capturados
                </p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: '#558b2f' }}>
                  Precisión prom: ±
                  {(muestras.reduce((a, b) => a + b.accuracy, 0) / muestras.length).toFixed(
                    1
                  )}
                  m
                </p>
              </div>
            )}

            {!calibrando && !calibracionCompletada && (
              <button
                type="button"
                onClick={iniciarCalibracion}
                style={{
                  width: '100%',
                  height: '3rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  background: 'var(--color-secondary)',
                  color: 'white',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Navigation size={18} />
                {muestras.length > 0
                  ? 'Recalibrar (reinicia los 5 puntos)'
                  : 'Iniciar Calibración de 5 Puntos'}
              </button>
            )}

            {calibrando && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={capturarPuntoCalibrado}
                  style={{
                    flex: 2,
                    height: '3rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    background: 'var(--color-primary)',
                    color: 'white',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.95rem',
                  }}
                >
                  <Navigation size={18} />
                  Capturar {PUNTOS_CALIBRACION[calibracionPaso]?.icon}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCalibrando(false);
                    setMuestras([]);
                    setCalibracionProgreso(0);
                  }}
                  style={{
                    flex: 1,
                    height: '3rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    background: 'var(--color-surface-dim)',
                    color: 'var(--color-outline)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Radio (Metros)</label>
              <input
                name="radioPermitido"
                type="number"
                defaultValue={editingAula?.radioPermitido || 10}
                required
                min="3"
                max="50"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Cód. Contingencia</label>
              <input
                name="codigoContingencia"
                defaultValue={
                  editingAula?.codigoContingencia ||
                  Math.random().toString(36).substring(2, 8).toUpperCase()
                }
                required
                style={inputStyle}
              />
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
              style={{
                flex: 2,
                height: '3.5rem',
                borderRadius: '1rem',
                border: 'none',
                background: 'var(--color-primary)',
                color: 'white',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              Guardar Aula
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
