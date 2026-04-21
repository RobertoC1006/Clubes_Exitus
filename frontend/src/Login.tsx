import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import type { UsuarioSesion } from './UserContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import './index.css';
import loginBg from './assets/login_bg.png';

import { API_BASE_URL } from './config';

const API = API_BASE_URL;

const svgPaths = {
  dni: "M16.6587 3.33173H3.33173C2.4117 3.33173 1.66587 4.07757 1.66587 4.9976V14.9928C1.66587 15.9128 2.4117 16.6587 3.33173 16.6587H16.6587C17.5787 16.6587 18.3245 15.9128 18.3245 14.9928V4.9976C18.3245 4.07757 17.5787 3.33173 16.6587 3.33173Z",
  dniLine: "M18.3245 5.83053L10.8531 10.5783C10.596 10.7394 10.2987 10.8248 9.9952 10.8248C9.69175 10.8248 9.39443 10.7394 9.13728 10.5783L1.66587 5.83053",
  password: "M15.8257 9.16227H4.16467C3.24463 9.16227 2.4988 9.9081 2.4988 10.8281V16.6587C2.4988 17.5787 3.24463 18.3245 4.16467 18.3245H15.8257C16.7458 18.3245 17.4916 17.5787 17.4916 16.6587V10.8281C17.4916 9.9081 16.7458 9.16227 15.8257 9.16227Z",
  passwordLock: "M5.83053 9.16227V5.83053C5.83053 4.726 6.26931 3.6667 7.05034 2.88567C7.83136 2.10464 8.89066 1.66587 9.9952 1.66587C11.0997 1.66587 12.159 2.10464 12.9401 2.88567C13.7211 3.6667 14.1599 4.726 14.1599 5.83053V9.16227"
};

export default function Login() {
  const { login } = useUser();
  const navigate = useNavigate();
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Credenciales inválidas');
      }

      const user = await response.json();
      const initials = (user.nombre[0] + (user.apellido?.[0] ?? '')).toUpperCase();
      const sesion: UsuarioSesion = { ...user, initials };

      login(sesion);

      // Redirección por rol
      if (user.rol === 'ADMINISTRADOR') navigate('/admin');
      else if (user.rol === 'PROFESOR') navigate('/');
      else navigate('/portal');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative', background: 'black', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Background Container */}
      <div className="login-bg-container" style={{ backgroundImage: `url(${loginBg})` }} />
      <div className="login-overlay" />

      {/* Login Form Container */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        <div style={{ width: '100%', maxWidth: '420px', padding: '0 1.5rem', animation: 'fadeInSlideUp 0.7s forwards' }}>
          
          <div className="login-card-glass">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2.5rem' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                   <div style={{ width: '2.5rem', height: '2.5rem', background: '#EDC620', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(237, 198, 32, 0.3)' }}>
                      <span style={{ color: 'white', fontWeight: 900, fontSize: '1.25rem', fontStyle: 'italic' }}>E</span>
                   </div>
                   <span style={{ color: 'white', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.05em' }}>EXITUS</span>
                </div>
                <h1 style={{ margin: 0, color: 'white', fontSize: '1.875rem', fontWeight: 800 }}>Bienvenido</h1>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>Gestiona tus clubes con alto impacto</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className={`login-error-msg ${error ? 'animate-shake' : ''}`}>
                  {error}
                </div>
              )}

              {/* Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* DNI Input */}
                <div className="login-input-group">
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: 'rgba(255,255,255,0.4)' }}>
                    <svg fill="none" viewBox="0 0 20 20">
                      <path d={svgPaths.dni} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      <path d={svgPaths.dniLine} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="Documento de Identidad (DNI)"
                    className="login-input"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Password Input */}
                <div className="login-input-group">
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: 'rgba(255,255,255,0.4)' }}>
                    <svg fill="none" viewBox="0 0 20 20">
                      <path d={svgPaths.password} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      <path d={svgPaths.passwordLock} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="login-input"
                    style={{ paddingRight: '3rem' }}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Remember Me & Recover */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Recordarme</span>
                  </label>
                  <button type="button" style={{ background: 'none', border: 'none', color: '#EDC620', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="login-btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginTop: '0.5rem' }}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Iniciar sesión"
                  )}
                </button>
              </div>
            </form>
          </div>

          <p style={{ marginTop: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700 }}>
            © 2026 EXITUS • Innovación Educativa
          </p>
        </div>
      </div>
    </div>
  );
}
