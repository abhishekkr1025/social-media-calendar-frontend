import { useState } from 'react';
import { setToken } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

// const BASE_URL = 'https://prod.panditjee.com';
const BASE_URL = 'http://localhost:5000';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      setToken(data.token);
      navigate('/');
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      {/* Animated background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      {/* Grid overlay */}
      <div style={styles.grid} />

      <div style={styles.card}>
        {/* Logo mark */}
        <div style={styles.logoWrap}>
          <div style={styles.logoMark}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="white" strokeWidth="2" />
              <path d="M8 14 L14 8 L20 14 L14 20 Z" fill="white" />
              <circle cx="14" cy="14" r="3" fill="#f97316" />
            </svg>
          </div>
        </div>

        <h1 style={styles.brand}>Halla Bol</h1>
        <p style={styles.sub}>Social Media Command Centre</p>

        <div style={styles.divider} />

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorDot} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Username or Email</label>
            <div style={styles.inputWrap}>
              <svg style={styles.inputIcon} viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z" />
              </svg>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                style={styles.input}
                placeholder="admin"
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <svg style={styles.inputIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
              </svg>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={styles.input}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.btn,
              ...(loading ? styles.btnDisabled : {}),
            }}
          >
            {loading ? (
              <span style={styles.spinnerWrap}>
                <span style={styles.spinner} /> Signing in…
              </span>
            ) : (
              'Sign In →'
            )}
          </button>
        </form>

        <p style={styles.footer}>
          Cliq India · Admin Portal
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .login-card-anim {
          animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .login-input:focus {
          outline: none;
          border-color: #f97316 !important;
          background: rgba(255,255,255,0.08) !important;
        }
        .login-btn:hover:not(:disabled) {
          background: #ea6a00 !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(249,115,22,0.4) !important;
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f0f13',
    fontFamily: "'DM Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)',
    top: '-10%',
    right: '-10%',
    animation: 'blob 12s ease-in-out infinite',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
    bottom: '-10%',
    left: '-10%',
    animation: 'blob 16s ease-in-out infinite reverse',
    pointerEvents: 'none',
  },
  blob3: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
    top: '50%',
    left: '30%',
    animation: 'blob 20s ease-in-out infinite 4s',
    pointerEvents: 'none',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: 420,
    margin: '0 16px',
    padding: '44px 40px',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 24,
    animation: 'fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both',
  },
  logoWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 32px rgba(249,115,22,0.35)',
  },
  brand: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 32,
    color: '#ffffff',
    textAlign: 'center',
    margin: '0 0 6px',
    letterSpacing: '-0.5px',
  },
  sub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    margin: '0 0 28px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    fontWeight: 300,
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.06)',
    marginBottom: 28,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#fca5a5',
    fontSize: 13,
    borderRadius: 10,
    padding: '10px 14px',
    marginBottom: 20,
  },
  errorDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#f87171',
    flexShrink: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
  },
  inputWrap: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 16,
    height: 16,
    color: 'rgba(255,255,255,0.25)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#ffffff',
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, background 0.2s',
    className: 'login-input',
  },
  btn: {
    marginTop: 8,
    padding: '14px',
    background: '#f97316',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '0.2px',
    className: 'login-btn',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  spinnerWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  spinner: {
    display: 'inline-block',
    width: 14,
    height: 14,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  footer: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: '0.3px',
  },
};