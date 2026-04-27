import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function CambiarContrasena() {
  const { usuario, login } = useUser();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Si no hay usuario logueado, al login
  useEffect(() => {
    if (!usuario) navigate('/login', { replace: true });
  }, [usuario, navigate]);

  // Validaciones
  const validLength = newPassword.length >= 6;
  const validNotDefault = newPassword !== '123456';
  const validMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isValid = validLength && validNotDefault && validMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !usuario) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: usuario.id, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al cambiar la contraseña');
      }

      // Actualizar sesión: mustChangePassword = false
      const updatedUser = { ...usuario, mustChangePassword: false };
      login(updatedUser);
      setSuccess(true);

      // Redirigir al dashboard según rol
      setTimeout(() => {
        if (usuario.rol === 'ADMINISTRADOR') navigate('/admin', { replace: true });
        else if (usuario.rol === 'PADRE') navigate('/portal', { replace: true });
        else navigate('/', { replace: true });
      }, 1500);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '24px',
    }}>
      {/* Fondo decorativo */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{
        width: '100%', maxWidth: '440px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Ícono */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '20px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', margin: '0 auto 24px',
          boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
        }}>
          🔐
        </div>

        {/* Título */}
        <h1 style={{
          color: '#fff', fontSize: '24px', fontWeight: 700,
          textAlign: 'center', margin: '0 0 8px',
        }}>
          Establece tu contraseña
        </h1>

        {/* Saludo */}
        <p style={{
          color: 'rgba(255,255,255,0.6)', textAlign: 'center',
          fontSize: '14px', margin: '0 0 24px', lineHeight: 1.6,
        }}>
          Hola, <strong style={{ color: 'rgba(255,255,255,0.9)' }}>{usuario.nombre}</strong>.<br />
          Tu cuenta tiene una contraseña temporal. Debes crear una contraseña personal para continuar.
        </p>

        {success ? (
          <div style={{
            textAlign: 'center', padding: '24px',
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '12px',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
            <p style={{ color: '#4ade80', fontWeight: 600, margin: 0 }}>
              ¡Contraseña establecida! Redirigiendo...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Campo nueva contraseña */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                Nueva contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Escribe tu nueva contraseña"
                  autoComplete="new-password"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '12px 44px 12px 16px',
                    background: 'rgba(255,255,255,0.07)',
                    border: `1px solid ${newPassword && !validLength ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px', color: '#fff', fontSize: '15px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.5)', fontSize: '16px', padding: '4px',
                  }}
                >
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Campo confirmar */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                Confirmar contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu nueva contraseña"
                  autoComplete="new-password"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '12px 44px 12px 16px',
                    background: 'rgba(255,255,255,0.07)',
                    border: `1px solid ${confirmPassword && !validMatch ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px', color: '#fff', fontSize: '15px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.5)', fontSize: '16px', padding: '4px',
                  }}
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Requisitos */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', padding: '14px 16px', marginBottom: '20px',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Requisitos
              </p>
              {[
                { ok: validLength, text: 'Mínimo 6 caracteres' },
                { ok: validNotDefault && newPassword.length > 0, text: 'No puede ser la contraseña temporal (123456)' },
                { ok: validMatch, text: 'Las contraseñas coinciden' },
              ].map((req) => (
                <div key={req.text} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: req.ok ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
                    {req.ok ? '✓' : '○'}
                  </span>
                  <span style={{ fontSize: '13px', color: req.ok ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)' }}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
                color: '#fca5a5', fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={!isValid || loading}
              style={{
                width: '100%', padding: '14px',
                background: isValid
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(255,255,255,0.1)',
                border: 'none', borderRadius: '12px',
                color: isValid ? '#fff' : 'rgba(255,255,255,0.3)',
                fontSize: '15px', fontWeight: 600, cursor: isValid ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: isValid ? '0 4px 15px rgba(99,102,241,0.4)' : 'none',
              }}
            >
              {loading ? 'Guardando...' : 'Establecer mi contraseña →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
