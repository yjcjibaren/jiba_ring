type GameOverProps = {
  onRestart: () => void;
  onQuit: () => void;
};

export function GameOver({ onRestart, onQuit }: GameOverProps) {
  return (
    <div className="overlay center-panel gameover-overlay">
      <div className="gameover-kanji">区</div>
      <div className="panel small-panel gameover-panel">
        <h2>你已陨落</h2>
        <p>褪火者倒在黄金废墟前，但挑战仍可立即重启。</p>
        <button className="primary-button" onClick={onRestart}>
          重新挑战
        </button>
        <button className="secondary-button" onClick={onQuit}>
          返回主菜单
        </button>
      </div>
    </div>
  );
}
