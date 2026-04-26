export function FeatureGrid() {
  return (
    <section className="landing-features" id="features">
      <div className="landing-container">
        <div className="landing-section-head">
          <span className="eyebrow">FEATURES</span>
          <h2>외우는 데 필요한 모든 것.<br />그 이상은 없습니다.</h2>
        </div>

        <div className="landing-feat-grid">
          <div className="landing-feat">
            <div className="landing-feat-icon">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 4h12M2 8h12M2 12h7"/>
              </svg>
            </div>
            <h4>드래그 → 빈칸</h4>
            <p>족보 본문을 붙여넣고, 정답 키워드를 마우스로 드래그하면 자동으로 <span className="eh-mono" style={{ color: 'var(--accent-ink)' }}>{`{{빈칸}}`}</span> 형식으로 변환됩니다.</p>
            <span className="tag">QUESTION EDITOR</span>
          </div>
          
          <div className="landing-feat">
            <div className="landing-feat-icon">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6"/><path d="M8 4v4l2.5 2.5"/>
              </svg>
            </div>
            <h4>간격 반복 복습</h4>
            <p>SM-2 알고리즘이 각 문제의 다음 복습 시점을 자동 계산합니다. 시험까지 남은 날에 맞춰 강도를 조절하세요.</p>
            <span className="tag">SPACED REPETITION</span>
          </div>
          
          <div className="landing-feat">
            <div className="landing-feat-icon">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3h10v10H3z"/><path d="M5 7l2 2 4-4"/>
              </svg>
            </div>
            <h4>서술형 자기평가</h4>
            <p>모범답안을 작성한 뒤 본인 답변과 비교, 정답·부분정답·오답 3단계로 평가합니다. 점수 대신 '얼마나 정확했는가'에 집중하세요.</p>
            <span className="tag">ESSAY MODE</span>
          </div>
          
          <div className="landing-feat">
            <div className="landing-feat-icon">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3l10 10M13 3L3 13"/>
              </svg>
            </div>
            <h4>오답 노트 자동화</h4>
            <p>틀린 문제만 따로 모이고, '오답만 다시' 버튼 하나로 재학습합니다. 시험 직전 30분의 가장 효율적인 정리.</p>
            <span className="tag">WRONG NOTES</span>
          </div>
          
          <div className="landing-feat">
            <div className="landing-feat-icon">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2v8M5 7l3 3 3-3M3 13h10"/>
              </svg>
            </div>
            <h4>JSON 가져오기/내보내기</h4>
            <p>친구가 만든 족보를 받아서 바로 학습. 내가 만든 족보는 한 번에 백업. 클라우드 잠금 없이 데이터는 늘 내 손에.</p>
            <span className="tag">PORTABILITY</span>
          </div>
          
          <div className="landing-feat">
            <div className="landing-feat-icon">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 11h.01"/>
              </svg>
            </div>
            <h4>키보드 우선</h4>
            <p>Tab으로 다음 빈칸, Enter로 제출, →로 다음 문제. 마우스 없이도 시험장에 들어가는 그 속도로 학습합니다.</p>
            <span className="tag">KEYBOARD</span>
          </div>
        </div>
      </div>
    </section>
  );
}
