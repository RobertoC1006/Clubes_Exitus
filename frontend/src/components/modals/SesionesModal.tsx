import React from 'react';
import { X, History, Calendar } from 'lucide-react';
import { Pagination } from '../ui/Pagination';

interface SesionesModalProps {
  modalSesiones: { id: number; nombre: string };
  sesionesClub: any[];
  loadingSesiones: boolean;
  currentPageSesiones: number;
  expandedSesionId: number | null;
  ITEMS_PER_PAGE: number;
  setCurrentPageSesiones: (page: number) => void;
  setExpandedSesionId: (id: number | null) => void;
  onClose: () => void;
}

export function SesionesModal({
  modalSesiones,
  sesionesClub,
  loadingSesiones,
  currentPageSesiones,
  expandedSesionId,
  ITEMS_PER_PAGE,
  setCurrentPageSesiones,
  setExpandedSesionId,
  onClose,
}: SesionesModalProps) {
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
          borderRadius: '1.25rem',
          width: '100%',
          maxWidth: '550px',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-surface-container-high)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--color-primary)',
              }}
            >
              Historial <span style={{ color: 'var(--color-secondary)' }}>de Clases</span>
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '0.75rem',
                color: 'var(--color-outline)',
                fontWeight: 700,
              }}
            >
              {modalSesiones.nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--color-surface-dim)',
              border: 'none',
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: '75vh' }}>
          <p
            style={{
              margin: '0 0 1.5rem',
              fontSize: '0.85rem',
              color: 'var(--color-outline)',
              fontWeight: 600,
            }}
          >
            Sesiones y asistencias del club: {modalSesiones.nombre}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                background: 'var(--color-primary-container)',
                padding: '1rem',
                borderRadius: '1.2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    color: 'white',
                    textTransform: 'uppercase',
                    opacity: 0.8,
                  }}
                >
                  Total Sesiones
                </p>
                <p
                  style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: 'white' }}
                >
                  {sesionesClub.length}
                </p>
              </div>
              <History size={24} color="white" style={{ opacity: 0.4 }} />
            </div>
            <div
              style={{
                background: 'var(--color-surface-container-high)',
                padding: '1rem',
                borderRadius: '1.2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    color: 'var(--color-primary)',
                    textTransform: 'uppercase',
                  }}
                >
                  Última Clase
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 900,
                    color: 'var(--color-primary)',
                  }}
                >
                  {sesionesClub.length > 0
                    ? new Date(sesionesClub[0].fecha).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                      })
                    : '---'}
                </p>
              </div>
              <Calendar size={20} color="var(--color-primary)" style={{ opacity: 0.3 }} />
            </div>
          </div>

          {loadingSesiones ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div
                className="animate-spin"
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  border: '3px solid var(--color-surface-dim)',
                  borderTopColor: 'var(--color-secondary)',
                  borderRadius: '50%',
                  margin: '0 auto',
                }}
              ></div>
            </div>
          ) : sesionesClub.length === 0 ? (
            <div
              style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-outline)' }}
            >
              No hay sesiones registradas aún.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sesionesClub
                .slice(
                  (currentPageSesiones - 1) * ITEMS_PER_PAGE,
                  currentPageSesiones * ITEMS_PER_PAGE
                )
                .map((sesion) => {
                  const pres = sesion.asistencias.filter(
                    (a: any) => a.estado === 'PRESENTE'
                  ).length;
                  const aus = sesion.asistencias.filter(
                    (a: any) => a.estado === 'AUSENTE'
                  ).length;
                  const isExpanded = expandedSesionId === sesion.id;

                  return (
                    <div
                      key={sesion.id}
                      style={{
                        padding: '1.1rem',
                        borderRadius: '1.5rem',
                        background: 'white',
                        border: isExpanded
                          ? '1.5px solid var(--color-primary)'
                          : '1px solid var(--color-surface-container-low)',
                        boxShadow: isExpanded
                          ? 'var(--shadow-md)'
                          : '0 2px 4px rgba(0,0,0,0.02)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 900,
                              fontSize: '1.05rem',
                              color: 'var(--color-primary)',
                              letterSpacing: '-0.02em',
                            }}
                          >
                            {new Date(sesion.fecha).toLocaleDateString('es-PE', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                          <p
                            style={{
                              margin: '0.15rem 0 0',
                              fontSize: '0.8rem',
                              color: 'var(--color-outline)',
                              fontWeight: 600,
                            }}
                          >
                            {sesion.tema || 'Sin tema específico'}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.3rem',
                              justifyContent: 'flex-end',
                              marginBottom: '0.25rem',
                            }}
                          >
                            <span
                              title="Presentes"
                              style={{
                                background: 'var(--color-success-container)',
                                color: 'var(--color-success)',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '0.4rem',
                                fontSize: '0.65rem',
                                fontWeight: 900,
                              }}
                            >
                              {pres}
                            </span>
                            <span
                              title="Ausentes"
                              style={{
                                background: 'var(--color-error-container)',
                                color: 'var(--color-error)',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '0.4rem',
                                fontSize: '0.65rem',
                                fontWeight: 900,
                              }}
                            >
                              {aus}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setExpandedSesionId(isExpanded ? null : sesion.id)
                            }
                            style={{
                              border: 'none',
                              background: 'none',
                              color: isExpanded
                                ? 'var(--color-primary)'
                                : 'var(--color-secondary)',
                              fontWeight: 900,
                              fontSize: '0.65rem',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            {isExpanded ? 'OCULTAR ↑' : 'DETALLES ↓'}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div
                          style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid var(--color-surface-container-low)',
                          }}
                        >
                          {sesion.asistencias.length > 0 ? (
                            <div
                              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                            >
                              {sesion.asistencias.map((a: any) => (
                                <div
                                  key={a.id}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '0.8rem',
                                  }}
                                >
                                  <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>
                                    {a.alumno.nombre} {a.alumno.apellido}
                                  </span>
                                  <span
                                    style={{
                                      padding: '0.2rem 0.6rem',
                                      borderRadius: '99px',
                                      fontSize: '0.6rem',
                                      fontWeight: 900,
                                      background:
                                        a.estado === 'PRESENTE'
                                          ? 'var(--color-success-container)'
                                          : a.estado === 'AUSENTE'
                                          ? 'var(--color-error-container)'
                                          : 'var(--color-warning-container)',
                                      color:
                                        a.estado === 'PRESENTE'
                                          ? 'var(--color-success)'
                                          : a.estado === 'AUSENTE'
                                          ? 'var(--color-error)'
                                          : 'var(--color-warning)',
                                    }}
                                  >
                                    {a.estado}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--color-outline)',
                                textAlign: 'center',
                              }}
                            >
                              No hay registros en esta sesión.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

              <Pagination
                current={currentPageSesiones}
                total={Math.ceil(sesionesClub.length / ITEMS_PER_PAGE)}
                onChange={setCurrentPageSesiones}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
