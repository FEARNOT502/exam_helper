export function DashboardPreview() {
  return (
    <div className="landing-preview-wrap">
      <div className="landing-preview-bg"></div>
      <div className="landing-preview">
        <div className="landing-preview-bar">
          <span className="dot"></span><span className="dot"></span><span className="dot"></span>
        </div>
        <div className="landing-preview-body">
          <div className="landing-preview-title">
            <h3>나의 족보</h3>
            <span className="num">04 SETS · 132 Q</span>
          </div>

          <div className="landing-preview-stats">
            <div className="landing-stat"><div className="l">전체</div><div className="v">132</div></div>
            <div className="landing-stat ok"><div className="l">암기</div><div className="v">68%</div></div>
            <div className="landing-stat warn"><div className="l">오늘 복습</div><div className="v">14</div></div>
          </div>

          <div className="landing-set-card">
            <div className="landing-set-card-head">
              <div>
                <h4>경영학원론</h4>
                <div className="sub">2026-1학기 중간고사</div>
              </div>
              <div className="landing-chips">
                <span className="landing-chip">3학년</span>
                <span className="landing-chip">전공필수</span>
              </div>
            </div>
            <div className="landing-pbar"><span style={{ width: '78%', background: 'var(--ok)' }}></span></div>
            <div className="landing-pmeta"><span>32 / 41</span><span>78%</span></div>
          </div>

          <div className="landing-set-card">
            <div className="landing-set-card-head">
              <div>
                <h4>회계원리</h4>
                <div className="sub">기말고사 대비</div>
              </div>
              <div className="landing-chips"><span className="landing-chip">2학년</span></div>
            </div>
            <div className="landing-pbar"><span style={{ width: '42%', background: 'var(--accent)' }}></span></div>
            <div className="landing-pmeta"><span>15 / 36</span><span>42%</span></div>
          </div>

          <div className="landing-set-card" style={{ opacity: 0.8 }}>
            <div className="landing-set-card-head">
              <div>
                <h4>마케팅 관리</h4>
                <div className="sub">7주차 까지</div>
              </div>
              <div className="landing-chips"><span className="landing-chip">전공선택</span></div>
            </div>
            <div className="landing-pbar"><span style={{ width: '18%', background: 'var(--warn)' }}></span></div>
            <div className="landing-pmeta"><span>5 / 28</span><span>18%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
