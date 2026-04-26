import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';

type Mode = 'signin' | 'signup';

export function Login() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, configured } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setBusy(true);
    if (mode === 'signin') {
      const { error } = await signInWithEmail(email.trim(), password);
      if (error) showToast(error, 'error');
      else showToast('로그인되었습니다.');
    } else {
      const { error, needsConfirm } = await signUpWithEmail(email.trim(), password);
      if (error) showToast(error, 'error');
      else if (needsConfirm) showToast('확인 메일을 발송했습니다. 메일함을 확인하세요.');
      else showToast('회원가입 완료!');
    }
    setBusy(false);
  };

  const handleGoogle = async () => {
    setBusy(true);
    const { error } = await signInWithGoogle();
    if (error) showToast(error, 'error');
    setBusy(false);
  };

  return (
    <div className="eh-shell" style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="eh-card" style={{ width: '100%', maxWidth: 420, padding: '32px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: 'var(--ink)', color: 'var(--bg)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
          }}>EH</div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-.01em' }}>Exam Helper</p>
            <p className="eh-mono eh-muted-2" style={{ margin: 0, fontSize: 11 }}>v2 · Cloud Sync</p>
          </div>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.015em', margin: 0, marginBottom: 6 }}>
          {mode === 'signin' ? '로그인' : '계정 만들기'}
        </h1>
        <p className="eh-muted" style={{ fontSize: 13, margin: 0, marginBottom: 22 }}>
          {mode === 'signin'
            ? '계정에 로그인하면 모든 기기에서 족보가 동기화됩니다.'
            : '이메일 또는 Google 계정으로 가입할 수 있습니다.'}
        </p>

        {!configured && (
          <div style={{
            padding: '12px 14px', borderRadius: 10,
            background: 'var(--warn-soft)',
            color: 'oklch(45% 0.12 68)',
            border: '1px solid var(--warn)',
            fontSize: 12.5, lineHeight: 1.55,
            marginBottom: 18,
          }}>
            <strong>백엔드 미설정.</strong> <code className="eh-mono">.env</code>에{' '}
            <code className="eh-mono">VITE_SUPABASE_URL</code>,{' '}
            <code className="eh-mono">VITE_SUPABASE_ANON_KEY</code>를 추가하세요. 미설정 상태에서는 오프라인 모드로 동작합니다.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="eh-field-label">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="eh-input"
            />
          </div>
          <div>
            <label className="eh-field-label">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              minLength={6}
              required
              className="eh-input"
            />
          </div>
          <Button size="lg" type="submit" disabled={busy || !configured} style={{ marginTop: 4 }}>
            {mode === 'signin' ? '로그인' : '회원가입'}
          </Button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
          <hr className="eh-divider" style={{ flex: 1 }} />
          <span className="eh-mono eh-muted-2" style={{ fontSize: 10.5, letterSpacing: '.08em' }}>OR</span>
          <hr className="eh-divider" style={{ flex: 1 }} />
        </div>

        <Button variant="secondary" size="lg" onClick={handleGoogle} disabled={busy || !configured} style={{ width: '100%' }}>
          <svg width="14" height="14" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.97 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.33z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
          </svg>
          Google로 계속하기
        </Button>

        <p style={{ fontSize: 13, marginTop: 22, textAlign: 'center', color: 'var(--ink-3)' }}>
          {mode === 'signin' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            style={{ color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {mode === 'signin' ? '회원가입' : '로그인'}
          </button>
        </p>

        <p style={{ fontSize: 11.5, color: 'var(--ink-4)', textAlign: 'center', marginTop: 18, lineHeight: 1.55 }}>
          가입 시 <Link to="/privacy" style={{ color: 'var(--ink-3)', textDecoration: 'underline' }}>개인정보처리방침</Link>에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
