import { Link } from 'react-router-dom';
import { DashboardPreview } from './DashboardPreview';

export function Hero() {
  return (
    <section className="landing-hero">
      <div className="landing-hero-left">
        <span className="eyebrow">EXAM HELPER · 시험 족보 암기장</span>
        <h1>족보를 외우는<br />가장 <span className="accent">스마트한</span> 방법.</h1>
        <p className="landing-hero-sub">
          단답형·서술형 암기, 효율적 복습, 자동 오답 노트.
          족보를 더욱 편리하게 암기해보세요.
        </p>
        <div className="landing-hero-cta">
          <Link to="/signup" className="eh-btn eh-btn-primary" style={{ height: 46, padding: '0 20px', fontSize: 14, borderRadius: 12 }}>
            지금 시작하기
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" style={{ marginLeft: 6 }}>
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </Link>
          <Link to="/dashboard" className="eh-btn eh-btn-secondary" style={{ height: 46, padding: '0 20px', fontSize: 14, borderRadius: 12 }}>
            비로그인으로 시작
          </Link>
        </div>
      </div>
      <DashboardPreview />
    </section>
  );
}
