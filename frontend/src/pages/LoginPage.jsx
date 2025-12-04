import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8080';

function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let endpoint = '';
      let payload = {};

      if (mode === 'login') {
        endpoint = '/api/auth/login';
        payload = { email, password };
      } else {
        endpoint = '/api/auth/register';
        payload = { username, email, password };
      }

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        // Backend sends plain text on error, so just show that
        throw new Error(text || 'Something went wrong');
      }

      const data = await res.json();
      // data = { userId, username, email }
      localStorage.setItem('user', JSON.stringify(data));

      navigate('/documents');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'white',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 20px 40px rgba(15,23,42,0.45)',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '4px',
            color: '#0f172a',
          }}
        >
          Collaborative Text Editor
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '20px',
          }}
        >
          {mode === 'login'
            ? 'Log in to start or join a document.'
            : 'Create an account to collaborate in real time.'}
        </p>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            background: '#e5e7eb',
            borderRadius: '999px',
            padding: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: '999px',
              padding: '8px 0',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              background: mode === 'login' ? 'white' : 'transparent',
              color: mode === 'login' ? '#0f172a' : '#6b7280',
              boxShadow:
                mode === 'login'
                  ? '0 8px 16px rgba(15,23,42,0.15)'
                  : 'none',
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: '999px',
              padding: '8px 0',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              background: mode === 'register' ? 'white' : 'transparent',
              color: mode === 'register' ? '#0f172a' : '#6b7280',
              boxShadow:
                mode === 'register'
                  ? '0 8px 16px rgba(15,23,42,0.15)'
                  : 'none',
            }}
          >
            Register
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500 }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={mode === 'register'}
                placeholder="e.g. sairaj"
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                marginTop: '4px',
                fontSize: '13px',
                color: '#b91c1c',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '10px 0',
              borderRadius: '999px',
              border: 'none',
              background: loading
                ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white',
              fontWeight: '600',
              fontSize: '14px',
              cursor: loading ? 'default' : 'pointer',
              boxShadow: '0 10px 25px rgba(79,70,229,0.35)',
            }}
          >
            {loading
              ? mode === 'login'
                ? 'Logging in...'
                : 'Creating account...'
              : mode === 'login'
              ? 'Login'
              : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
