import { useNavigate } from 'react-router-dom';

export function Guide() {
  const navigate = useNavigate();

  return (
    <div className="eh-shell">
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '44px 28px 64px' }}>
        <header style={{ marginBottom: 32 }}>
          <p className="eh-eyebrow" style={{ marginBottom: 10 }}>GUIDE</p>
          <h1 style={{
            fontSize: 34, fontWeight: 600, letterSpacing: '-.025em',
            color: 'var(--ink)', margin: 0, lineHeight: 1.15,
          }}>
            사용법
          </h1>
          <p className="eh-muted" style={{ fontSize: 15, marginTop: 8, maxWidth: 600, lineHeight: 1.6 }}>
            Exam Helper를 활용하여 시험 족보를 효율적으로 학습하는 방법을 소개합니다.
          </p>
        </header>

        <div className="eh-card" style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>1. 족보 세트 만들기</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0 }}>
              대시보드에서 <strong>"새 족보"</strong> 버튼을 클릭하여 과목명과 태그를 입력하세요. 
              족보 세트가 생성되면 상세 페이지로 이동합니다.
            </p>
          </section>

          <hr className="eh-divider" />

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>2. 문제 추가하기</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0 }}>
              족보 상세 페이지에서 <strong>"문제 추가"</strong>를 누릅니다. 문제는 크게 두 가지 유형으로 나뉩니다:
            </p>
            <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--ink-2)', fontSize: 14.5, lineHeight: 1.6 }}>
              <li><strong>단답형 (빈칸):</strong> 문제 내용의 일부를 빈칸으로 만들고 싶을 때 사용합니다. 키워드를 드래그하면 <code>{'{{빈칸}}'}</code> 형식으로 자동 변환됩니다.</li>
              <li><strong>서술형:</strong> 모범 답안을 보고 직접 긴 문장을 작성하며 연습할 때 사용합니다.</li>
            </ul>
          </section>

          <hr className="eh-divider" />

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>3. 학습 시작</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0 }}>
              <strong>"학습 시작"</strong> 버튼을 누르면 생성한 문제들을 순차적으로 풀 수 있습니다. 단답형은 정답을 입력하고, 서술형은 모범 답안을 확인한 후 스스로 채점할 수 있습니다. 
            </p>
          </section>

          <hr className="eh-divider" />

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>4. 연습 모드</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0 }}>
              문제를 눈으로만 보는 것이 아니라 직접 따라 쓰며 외우고 싶다면 <strong>"연습하기"</strong> 기능을 사용해 보세요. 정답을 그대로 따라 치면서 암기할 수 있습니다.
            </p>
          </section>

          <hr className="eh-divider" />

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>5. 내보내기 & 가져오기</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0 }}>
              완성된 족보는 <strong>"내보내기"</strong> 기능을 통해 JSON 파일로 백업할 수 있습니다. 백업된 파일을 친구에게 공유하거나, 대시보드의 <strong>"가져오기"</strong> 버튼을 통해 복원할 수도 있습니다.
            </p>
          </section>
        </div>

        <div style={{ marginTop: 24 }}>
          <button onClick={() => navigate('/')} className="eh-btn eh-btn-secondary">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M10 3L5 8l5 5"/></svg>
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
