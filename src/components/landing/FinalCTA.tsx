import { Link } from 'react-router-dom';

export function FinalCTA() {
  return (
    <section className="landing-cta">
      <h2>다음 시험까지<br />며칠 남았나요?</h2>
      <p>지금 첫 족보를 만들고, 매일 5분씩 시험 당일까지 잊지 마세요.</p>
      <Link to="/signup" className="eh-btn eh-btn-primary" style={{ height: 46, padding: '0 20px', fontSize: 14, borderRadius: 12 }}>
        무료로 시작하기
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" style={{ marginLeft: 6 }}>
          <path d="M3 8h10M9 4l4 4-4 4"/>
        </svg>
      </Link>
    </section>
  );
}
