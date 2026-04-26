import { Link } from 'react-router-dom';
import { ThemeToggle } from '../common/ThemeToggle';

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
          <ThemeToggle />
          <Link to="/signup" className="eh-btn eh-btn-secondary" style={{ height: 30, padding: '0 12px', fontSize: 12.5, borderRadius: 8 }}>
            회원가입
          </Link>
          <Link to="/dashboard" className="eh-btn eh-btn-primary" style={{ height: 30, padding: '0 12px', fontSize: 12.5, borderRadius: 8 }}>
            비로그인으로 시작
          </Link>
        </div>
      </div>
    </nav>
  );
}
