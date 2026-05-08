import React, { useState } from 'react';
import { X, ChevronDown, RefreshCw, Save } from 'lucide-react';
import type { Usuario } from '../../types';
import { labelStyle, inputStyle } from '../../styles/adminStyles';

interface UsuarioModalProps {
  usuario: Partial<Usuario>;
  saving: boolean;
  onSave: (data: any) => void;
  onResetPassword: (id: number) => void;
  onClose: () => void;
}

export function UsuarioModal({
  usuario,
  saving,
  onSave,
  onResetPassword,
  onClose,
}: UsuarioModalProps) {
  const [nombre, setNombre] = useState(usuario.nombre ?? '');
  const [apellido, setApellido] = useState(usuario.apellido ?? '');
  const [rol, setRol] = useState<'ADMINISTRADOR' | 'PROFESOR' | 'PADRE'>(
    usuario.rol ?? 'PROFESOR'
  );
  const [dni, setDni] = useState(usuario.dni ?? '');
  const [celular, setCelular] = useState(usuario.celular ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ nombre, apellido, rol, dni, celular });
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
              {usuario.id ? 'Perfeccionar' : 'Crear'}{' '}
              <span style={{ color: 'var(--color-secondary)' }}>Perfil</span>
            </h3>
            <p
              style={{
                margin: '0.2rem 0 0',
                fontSize: '0.85rem',
                color: 'var(--color-outline)',
                fontWeight: 700,
              }}
            >
              Administra los accesos y credenciales del usuario
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
                placeholder="Ej: Roberto"
                required
                style={{ ...inputStyle, borderRadius: '0.85rem', height: '3.2rem' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Apellido</label>
              <input
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Ej: Carlos"
                required
                style={{ ...inputStyle, borderRadius: '0.85rem', height: '3.2rem' }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Rol del Sistema</label>
            <div style={{ position: 'relative' }}>
              <select
                value={rol}
                onChange={(e) =>
                  setRol(e.target.value as 'ADMINISTRADOR' | 'PROFESOR' | 'PADRE')
                }
                style={{
                  ...inputStyle,
                  borderRadius: '0.85rem',
                  height: '3.2rem',
                  appearance: 'none',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="PROFESOR">🎓 Profesor</option>
                <option value="PADRE">👨‍👩‍👦 Padre / Tutor</option>
                <option value="ADMINISTRADOR">👑 Administrador</option>
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
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
          >
            <div>
              <label style={labelStyle}>DNI (Acceso)</label>
              <input
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="DNI del usuario"
                style={{ ...inputStyle, borderRadius: '0.85rem', height: '3.2rem' }}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Celular</label>
              <input
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                placeholder="Ej: 987654321"
                style={{ ...inputStyle, borderRadius: '0.85rem', height: '3.2rem' }}
              />
            </div>
          </div>

          {!usuario.id ? (
            <div
              style={{
                background: 'rgba(var(--color-primary-rgb), 0.05)',
                padding: '1rem',
                borderRadius: '1rem',
                border: '1px dashed var(--color-primary)',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                }}
              >
                🔑 Contraseña temporal asignada:{' '}
                <span style={{ fontWeight: 900 }}>123456</span>
              </p>
              <p
                style={{
                  margin: '0.25rem 0 0',
                  fontSize: '0.75rem',
                  color: 'var(--color-outline)',
                }}
              >
                Se le pedirá cambiarla al primer inicio de sesión.
              </p>
            </div>
          ) : (
            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => onResetPassword(usuario.id!)}
                style={{
                  width: '100%',
                  height: '3rem',
                  borderRadius: '0.85rem',
                  border: '1.5px solid var(--color-error)',
                  background: 'transparent',
                  color: 'var(--color-error)',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
              >
                <RefreshCw size={18} /> Resetear Contraseña a 123456
              </button>
            </div>
          )}

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
                <Save size={20} />
              )}
              {saving ? 'Guardando...' : 'Guardar Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
