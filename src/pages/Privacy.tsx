import { Link } from 'react-router-dom';

export function Privacy() {
  return (
    <div className="eh-shell">
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 28px 80px' }}>
        <p className="eh-eyebrow" style={{ marginBottom: 10 }}>POLICY</p>
        <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-.025em', margin: 0, marginBottom: 8 }}>
          개인정보처리방침
        </h1>
        <p className="eh-muted" style={{ fontSize: 13, marginBottom: 32 }}>
          최종 개정일: 2026년 4월 26일
        </p>

        <Section title="1. 수집하는 개인정보 항목">
          <p>
            Exam Helper(이하 "서비스")는 회원가입, 클라우드 동기화, 서비스 운영을 위해 다음 정보를 수집합니다.
          </p>
          <ul>
            <li><strong>필수</strong>: 이메일 주소, 비밀번호 해시(직접 가입 시), Google 계정 식별자(OAuth 가입 시)</li>
            <li><strong>자동 수집</strong>: 접속 IP, 브라우저 종류, 접속 시각, 학습 활동 로그(족보 ID, 정답률, 학습 일시)</li>
            <li><strong>이용자가 직접 입력</strong>: 족보 제목·본문·태그, 문제·정답, 학습 기록</li>
          </ul>
        </Section>

        <Section title="2. 개인정보의 수집·이용 목적">
          <ul>
            <li>회원 식별 및 인증, 부정이용 방지</li>
            <li>학습 데이터의 다중 기기 동기화 및 백업</li>
            <li>학습 통계(스트릭, 정답률, 학습 캘린더) 제공</li>
            <li>서비스 개선을 위한 익명 통계 분석</li>
          </ul>
        </Section>

        <Section title="3. 개인정보의 보유 및 이용기간">
          <p>
            회원이 직접 탈퇴를 요청하는 경우 또는 마지막 로그인 후 12개월이 경과한 경우, 보유 중인 개인정보를 즉시 파기합니다.
            관계 법령에 따라 보존이 필요한 경우(전자상거래 등에서의 소비자보호에 관한 법률 등) 해당 기간 동안 별도 보관 후 파기합니다.
          </p>
        </Section>

        <Section title="4. 개인정보의 제3자 제공">
          <p>
            서비스는 이용자의 개인정보를 외부에 제공하지 않습니다. 단, 다음과 같이 처리 위탁이 이루어집니다.
          </p>
          <ul>
            <li><strong>Supabase Inc.</strong> — 데이터베이스/인증/스토리지 호스팅</li>
            <li><strong>Google LLC</strong> — Google OAuth 로그인 사용 시 인증 처리</li>
            <li><strong>GitHub Pages</strong> — 정적 호스팅</li>
          </ul>
          <p>
            위탁 업체는 개인정보보호 의무를 준수하도록 계약하고 있으며, 위탁 목적 외 사용을 금지합니다.
          </p>
        </Section>

        <Section title="5. 개인정보의 파기 절차 및 방법">
          <p>
            DB에 저장된 개인정보는 즉시 삭제 처리합니다. 종이 인쇄물 등 물리 매체는 분쇄·소각하여 파기합니다.
          </p>
        </Section>

        <Section title="6. 이용자의 권리와 행사 방법">
          <ul>
            <li>이용자는 언제든지 본인 정보를 조회·수정·삭제·처리정지를 요청할 수 있습니다.</li>
            <li>회원 메뉴에서 직접 계정 삭제 또는 데이터 내보내기/삭제를 수행할 수 있습니다.</li>
            <li>요청은 아래 연락처로 접수해 주십시오.</li>
          </ul>
        </Section>

        <Section title="7. 개인정보 보호책임자">
          <p style={{ margin: 0 }}>
            <strong>책임자</strong>: 서비스 운영자<br />
            <strong>이메일</strong>: ljwoo050831@gmail.com
          </p>
        </Section>

        <Section title="8. 쿠키 및 로컬스토리지 사용">
          <p>
            서비스는 사용자 인증 세션 유지와 오프라인 모드 지원을 위해 브라우저 로컬스토리지를 사용합니다.
            브라우저 설정에서 언제든지 거부하거나 삭제할 수 있으며, 삭제 시 로그인 상태와 미동기화된 학습 기록이 손실될 수 있습니다.
          </p>
        </Section>

        <Section title="9. 정책의 변경">
          <p>
            본 방침은 법령·정책 또는 서비스 변경에 따라 수정될 수 있으며, 변경 시 시행 7일 전부터 본 페이지를 통해 공지합니다.
          </p>
        </Section>

        <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--line)', textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: 13, color: 'var(--accent)' }}>
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{
        fontSize: 16, fontWeight: 600, letterSpacing: '-.01em',
        margin: 0, marginBottom: 10, color: 'var(--ink)',
      }}>{title}</h2>
      <div style={{ fontSize: 13.5, lineHeight: 1.75, color: 'var(--ink-2)' }}>
        {children}
      </div>
      <style>{`
        section ul { margin: 8px 0 0 0; padding-left: 20px; }
        section li { margin-bottom: 4px; }
        section p { margin: 0 0 8px; }
      `}</style>
    </section>
  );
}
