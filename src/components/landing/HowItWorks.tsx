export function HowItWorks() {
  return (
    <section className="landing-how" id="how">
      <div className="landing-container">
        <div className="landing-section-head">
          <span className="eyebrow">HOW IT WORKS</span>
          <h2>3단계, 그리고 끝.</h2>
        </div>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="num">01</div>
            <h4>족보를 붙여넣기</h4>
            <p>PDF에서 텍스트를 복사해 새 족보에 붙여넣고, 정답이 될 키워드를 드래그하세요.</p>
          </div>
          <div className="landing-step">
            <div className="num">02</div>
            <h4>학습 시작</h4>
            <p>전체·미학습·오답·셔플 4가지 모드 중 골라 빈칸을 채우거나 서술형을 작성합니다.</p>
          </div>
          <div className="landing-step">
            <div className="num">03</div>
            <h4>복습 알림 따라가기</h4>
            <p>오늘 복습할 문제 수가 자동으로 표시됩니다. 매일 5분, 시험까지 잊지 않습니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
