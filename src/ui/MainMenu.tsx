type MainMenuProps = {
  onStart: () => void;
};

export function MainMenu({ onStart }: MainMenuProps) {
  return (
    <div className="overlay center-panel">
      <div className="panel title-panel">
        <p className="eyebrow">Dark Fantasy Side-Scrolling Action Demo</p>
        <h1>寄吧人法环</h1>
        <h2>第一章：大寄吧守卫</h2>
        <p>
          你将扮演无名褪火者，穿越黄金废墟，击败腐败守墓兵，并挑战守门的暗金重骑士。
        </p>
        <div className="controls-grid">
          <span>A / D</span>
          <span>移动</span>
          <span>W / Space</span>
          <span>跳跃</span>
          <span>Shift</span>
          <span>翻滚</span>
          <span>J / 鼠标左键</span>
          <span>轻攻击</span>
          <span>K / 鼠标右键</span>
          <span>重攻击</span>
          <span>L / Q</span>
          <span>切换武器</span>
          <span>I / E</span>
          <span>喝药</span>
          <span>ESC / P</span>
          <span>暂停</span>
        </div>
        <button className="primary-button" onClick={onStart}>
          进入黄金废墟
        </button>
      </div>
    </div>
  );
}
