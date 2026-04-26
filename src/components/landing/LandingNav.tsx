import { Link } from 'react-router-dom';

export function LandingNav() {
  return (
    <nav className="landing-nav">
      <div className="landing-nav-inner">
        <div className="landing-logo">
          <span className="mark">E</span> Exam Helper
        </div>
        <div className="landing-nav-right">
          <a href="#features">기능</a>
          <a href="#how">사용법</a>
          <Link to="/login" className="eh-btn eh-btn-secondary" style={{ height: 30, padding: '0 12px', fontSize: 12.5, borderRadius: 8 }}>
            로그인
          </Link>
          <Link to="/signup" className="eh-btn eh-btn-primary" style={{ height: 30, padding: '0 12px', fontSize: 12.5, borderRadius: 8 }}>
            무료 시작
          </Link>
        </div>
      </div>
    </nav>
  );
}
