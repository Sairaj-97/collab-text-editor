import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8080';

function DocumentsPage() {
  const [joinId, setJoinId] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // Load user from localStorage, redirect if missing
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) {
      navigate('/login');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setUser(parsed);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreate = async () => {
    setError('');
    if (!user) {
      setError('You must be logged in.');
      navigate('/login');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/api/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title || 'Untitled Document',
          ownerId: user.userId,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create document');
      }

      const data = await res.json(); // { docId, title }
      navigate(`/documents/${data.docId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    setError('');
    const id = joinId.trim();
    if (!id) {
      setError('Please enter a document ID to join.');
      return;
    }
    navigate(`/documents/${id}`);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          background: 'white',
          borderRadius: '16px',
          padding: '24px 28px 28px',
          boxShadow: '0 20px 40px rgba(15,23,42,0.45)',
        }}
      >
        {/* Top row: title + user + logout */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px',
            alignItems: 'center',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: '700',
                margin: 0,
                color: '#0f172a',
              }}
            >
              Your Documents
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: '#6b7280',
                marginTop: '4px',
              }}
            >
              Create a new collaborative document or join one with a document ID.
            </p>
          </div>

          {user && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '4px',
                marginLeft: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  color: '#4b5563',
                }}
              >
                {user.username || user.email}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  borderRadius: '999px',
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb',
                  color: '#374151',
                  fontSize: '11px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Title input + create button */}
        <div
          style={{
            marginBottom: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <label style={{ fontSize: '13px', fontWeight: 500, color: '#4b5563' }}>
            New document title
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Project notes"
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
              }}
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: creating
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                  : 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                fontWeight: '600',
                fontSize: '13px',
                cursor: creating ? 'default' : 'pointer',
                boxShadow: '0 10px 24px rgba(22,163,74,0.35)',
              }}
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>

        {/* Join area */}
        <div
          style={{
            marginTop: '4px',
            paddingTop: '12px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#4b5563',
              marginBottom: '8px',
            }}
          >
            Join with Document ID
          </p>
          <form
            onSubmit={handleJoin}
            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <input
              type="text"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value.toUpperCase())}
              placeholder="e.g. Q4SDEQ"
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                textTransform: 'uppercase',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: '#4f46e5',
                color: 'white',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Join
            </button>
          </form>
        </div>

        {error && (
          <div
            style={{
              marginTop: '12px',
              fontSize: '13px',
              color: '#b91c1c',
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentsPage;
