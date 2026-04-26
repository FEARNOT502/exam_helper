import { useState, useRef, useEffect } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { ThemeToggle } from './NavBar';
import { useAuth } from '../../context/AuthContext';
import { useExamSetsContext as useExamSets } from '../../context/ExamSetsContext';
import { useToast } from '../../context/ToastContext';

export function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, configured } = useAuth();
  const { syncing, online, cloudEnabled } = useExamSets();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Hide topbar inside the immersive study screen
  const isStudy = /\/study(\/|$|\?)/.test(location.pathname + location.search);
  if (isStudy) return null;

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    showToast('로그아웃되었습니다.', 'info');
    navigate('/');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'color-mix(in oklch, var(--bg) 85%, transparent)',
      backdropFilter: 'saturate(180%) blur(10px)',
      WebkitBackdropFilter: 'saturate(180%) blur(10px)',
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{
        maxWidth: 1080, margin: '0 auto',
        display: 'flex', alignItems: 'center', gap: 20,
        height: 60, padding: '0 28px',
      }}>
        {/* Brand */}
        <button
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div style={{
            width: 26, height: 26, borderRadius: 8,
            background: 'var(--ink)', color: 'var(--bg)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
          }}>EH</div>
          <span style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--ink)' }}>
            Exam Helper
          </span>
          <span className="eh-mono" style={{
            fontSize: 11, color: 'var(--ink-3)',
            padding: '2px 7px', border: '1px solid var(--line)', borderRadius: 6,
          }}>v2</span>
        </button>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 12 }}>
          <NavTab to="/" label="족보" exact />
          <NavTab to="/stats" label="통계" />
          <NavTab to="/guide" label="사용법" />
        </nav>

        {/* Right */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <SyncBadge syncing={syncing} online={online} cloudEnabled={cloudEnabled} configured={configured} />
          <ThemeToggle />
          {user ? (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="eh-icon-btn"
                style={{
                  width: 32, height: 32, borderRadius: 999,
                  background: 'var(--accent-soft)', color: 'var(--accent-ink)',
                  fontWeight: 600, fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                }}
                title={user.email ?? '계정'}
              >
                {(user.email ?? '?').slice(0, 1).toUpperCase()}
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 220,
                  background: 'var(--surface)', border: '1px solid var(--line)',
                  borderRadius: 12, boxShadow: 'var(--shadow-2)',
                  padding: 8, zIndex: 50,
                  animation: 'eh-fade-in .12s ease',
                }}>
                  <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--line)', marginBottom: 6 }}>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)' }}>로그인 계정</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--ink)' }} className="truncate">
                      {user.email}
                    </p>
                  </div>
                  <MenuItem label="통계" onClick={() => { setMenuOpen(false); navigate('/stats'); }} />
                  <MenuItem label="개인정보처리방침" onClick={() => { setMenuOpen(false); navigate('/privacy'); }} />
                  <MenuItem label="로그아웃" onClick={handleSignOut} tone="danger" />
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="eh-btn eh-btn-secondary eh-btn-sm"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function NavTab({ to, label, exact }: { to: string; label: string; exact?: boolean }) {
  return (
    <NavLink
      to={to}
      end={exact}
      style={({ isActive }) => ({
        fontSize: 13,
        color: isActive ? 'var(--ink)' : 'var(--ink-3)',
        background: isActive ? 'var(--surface)' : 'transparent',
        padding: '6px 12px',
        borderRadius: 7,
        textDecoration: 'none',
        fontWeight: isActive ? 600 : 500,
        transition: 'all .15s',
        border: isActive ? '1px solid var(--line)' : '1px solid transparent',
      })}
    >
      {label}
    </NavLink>
  );
}

function MenuItem({
  label, onClick, tone,
}: {
  label: string;
  onClick: () => void;
  tone?: 'danger';
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '8px 10px', borderRadius: 7,
        fontSize: 13,
        color: tone === 'danger' ? 'var(--bad)' : 'var(--ink-2)',
        background: 'transparent', border: 'none', cursor: 'pointer',
        transition: 'background .12s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {label}
    </button>
  );
}

function SyncBadge({
  syncing, online, cloudEnabled, configured,
}: {
  syncing: boolean;
  online: boolean;
  cloudEnabled: boolean;
  configured: boolean;
}) {
  let label = '';
  let color = 'var(--ink-4)';
  let bg = 'var(--surface-2)';
  if (!configured) {
    label = '오프라인';
    color = 'var(--ink-3)';
  } else if (!online) {
    label = '오프라인';
    color = 'var(--bad)';
    bg = 'var(--bad-soft)';
  } else if (syncing) {
    label = '동기화 중';
    color = 'var(--accent-ink)';
    bg = 'var(--accent-soft)';
  } else if (cloudEnabled) {
    label = '동기화됨';
    color = 'var(--ok)';
    bg = 'var(--ok-soft)';
  } else {
    label = '로컬';
    color = 'var(--ink-3)';
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      height: 24, padding: '0 9px',
      borderRadius: 999, fontSize: 11,
      fontFamily: 'var(--font-mono)', letterSpacing: '.02em',
      color, background: bg,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: 999,
        background: 'currentColor', opacity: .8,
      }} />
      {label}
    </span>
  );
}
