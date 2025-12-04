import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import MDEditor from '@uiw/react-md-editor';

const API_BASE = 'http://localhost:8080';
const WS_URL = 'http://localhost:8080/ws';

function EditorPage() {
  const { docId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // markdown string
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const [activeUsers, setActiveUsers] = useState([]); // names of active users

  const stompRef = useRef(null); // STOMP client
  const activeUsersRef = useRef({}); // { username: lastActiveTimestamp }

  const currentName = user ? user.username || user.email : '';

  // Helper: mark a user as active "now"
  const markUserActive = (name) => {
    if (!name) return;
    const now = Date.now();
    const cutoff = now - 15000; // 15 seconds "active" window

    // Update timestamp
    activeUsersRef.current = {
      ...activeUsersRef.current,
      [name]: now,
    };

    // Remove stale entries and build list
    const filtered = Object.entries(activeUsersRef.current).filter(
      ([, ts]) => ts >= cutoff
    );
    activeUsersRef.current = Object.fromEntries(filtered);
    setActiveUsers(filtered.map(([n]) => n));
  };

  // Periodically clean inactive users (in case no new events happen)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      const cutoff = now - 15000;
      const filtered = Object.entries(activeUsersRef.current).filter(
        ([, ts]) => ts >= cutoff
      );
      activeUsersRef.current = Object.fromEntries(filtered);
      setActiveUsers(filtered.map(([n]) => n));
    }, 5000); // every 5s

    return () => clearInterval(intervalId);
  }, []);

  // Load user, redirect if not logged in
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) {
      navigate('/login');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setUser(parsed);
      const name = parsed.username || parsed.email;
      markUserActive(name); // mark self active on open
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  // Load document from backend when page opens or docId changes
  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`${API_BASE}/api/documents/${docId}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to load document');
        }

        const data = await res.json();
        setTitle(data.title || 'Untitled Document');
        setContent(data.content || '');
      } catch (err) {
        console.error(err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [docId]);

  const handleBack = () => {
    navigate('/documents');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // ===== WebSocket / STOMP setup =====
  useEffect(() => {
    if (!user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      debug: () => {
        // mute logs
      },
    });

    client.onConnect = () => {
      client.subscribe(`/topic/documents/${docId}`, (frame) => {
        try {
          const body = JSON.parse(frame.body);
          const sender = body.sender;
          const incomingContent = body.content ?? '';

          const me = user.username || user.email;

          if (sender && sender !== me) {
            // remote user typed
            markUserActive(sender);
            setContent(incomingContent);
          }
        } catch (e) {
          console.error('Error handling WS message', e);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP broker error:', frame.headers['message']);
    };

    client.activate();
    stompRef.current = client;

    return () => {
      client.deactivate();
      stompRef.current = null;
    };
  }, [docId, user]);

  const sendEditOverSocket = (newContent) => {
    const client = stompRef.current;
    if (!client || !client.connected || !user) return;

    const senderId = user.username || user.email;

    client.publish({
      destination: `/app/documents/${docId}/edit`,
      body: JSON.stringify({
        docId,
        content: newContent,
        sender: senderId,
      }),
    });
  };

  // Called whenever the markdown editor content changes
  const handleEditorChange = (value) => {
    const text = value ?? '';
    setContent(text);

    // Mark self as active whenever we type
    if (currentName) {
      markUserActive(currentName);
    }

    // Try WS, plus we have polling auto-sync
    sendEditOverSocket(text);
  };

  // Debounced auto-save title + content (markdown)
  useEffect(() => {
    if (loading || error) return;

    const timeoutId = setTimeout(async () => {
      try {
        setSaving(true);
        const res = await fetch(`${API_BASE}/api/documents/${docId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            content,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to save document');
        }

        setLastSaved(new Date());
      } catch (err) {
        console.error(err);
      } finally {
        setSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [title, content, docId, loading, error]);

  // 🔁 Polling: keep other clients in sync every 0.3 seconds
  useEffect(() => {
    if (loading || error) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/documents/${docId}`);
        if (!res.ok) return;

        const data = await res.json();

        if (data.content !== content) {
          setContent(data.content || '');
        }
        if (data.title !== title) {
          setTitle(data.title || 'Untitled Document');
        }
      } catch (err) {
        // ignore polling errors
      }
    }, 2000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId, loading, error, content, title]);

  const lastSavedText = lastSaved
    ? `Saved at ${lastSaved.toLocaleTimeString()}`
    : 'Not saved yet';

  // Pretty label for active users
  const activeUsersLabel = (() => {
    if (activeUsers.length === 0) return '';
    return activeUsers.join(', ');
  })();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#020617',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <header
        style={{
          padding: '10px 20px',
          borderBottom: '1px solid #1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background:
            'radial-gradient(circle at top left, rgba(79,70,229,0.25), transparent 55%), #020617',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Document
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#e5e7eb',
            }}
          >
            ID: {docId}
          </div>
          {title && (
            <div
              style={{
                fontSize: '13px',
                color: '#9ca3af',
                marginTop: '2px',
              }}
            >
              {title}
            </div>
          )}
          <div
            style={{
              fontSize: '11px',
              color: '#9ca3af',
              marginTop: '4px',
            }}
          >
            {saving ? 'Saving…' : lastSavedText}
          </div>

          {activeUsersLabel && (
            <div
              style={{
                marginTop: '4px',
                fontSize: '11px',
                color: '#a5b4fc',
              }}
            >
              Active now: {activeUsersLabel}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {user && (
            <span
              style={{
                fontSize: '13px',
                color: '#e5e7eb',
              }}
            >
              {currentName}
            </span>
          )}

          <button
            type="button"
            onClick={handleBack}
            style={{
              borderRadius: '999px',
              border: '1px solid #4b5563',
              background: 'transparent',
              color: '#e5e7eb',
              fontSize: '12px',
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            ← Documents
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              borderRadius: '999px',
              border: '1px solid #4b5563',
              background: '#111827',
              color: '#f9fafb',
              fontSize: '12px',
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Editor area */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '30px 16px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '900px',
            minHeight: '70vh',
            background: '#f9fafb',
            borderRadius: '18px',
            boxShadow: '0 25px 60px rgba(15,23,42,0.65)',
            padding: '26px 32px',
            border: '1px solid #e5e7eb',  // ✅ fixed line
          }}
        >
          {/* Toolbar placeholder */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '14px',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '8px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '999px',
                background: '#e5e7eb',
              }}
            />
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '999px',
                background: '#e5e7eb',
              }}
            />
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '999px',
                background: '#e5e7eb',
              }}
            />
          </div>

          {loading ? (
            <div
              style={{
                fontSize: '14px',
                color: '#6b7280',
              }}
            >
              Loading document…
            </div>
          ) : error ? (
            <div
              style={{
                fontSize: '14px',
                color: '#b91c1c',
              }}
            >
              {error}
            </div>
          ) : (
            <>
              {/* Editable title */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Document"
                style={{
                  width: '100%',
                  fontSize: '22px',
                  fontWeight: 600,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  marginBottom: '12px',
                  color: '#111827',
                }}
              />

              {/* Markdown Editor */}
              <div data-color-mode="light">
                <MDEditor
                  value={content}
                  onChange={handleEditorChange}
                  height={500}
                />
              </div>

              {content === '' && (
                <div
                  style={{
                    marginTop: '8px',
                    fontSize: '14px',
                    color: '#9ca3af',
                  }}
                >
                  Start typing here... (supports **bold**, _italic_, headings,
                  code blocks, etc.)
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default EditorPage;
