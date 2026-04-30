type VictoryScreenProps = {
  onRestart: () => void;
  onQuit: () => void;
};

export function VictoryScreen({ onRestart, onQuit }: VictoryScreenProps) {
  return (
    <div className="overlay center-panel">
      <div className="panel title-panel">
        <h2>第一章完成</h2>
        <p>黄金废墟的守门者已倒下。</p>
        <p>远处的断臂王座上，接肢王的残影正在苏醒……</p>
        <button className="primary-button" onClick={onRestart}>
          再战一次
        </button>
        <button className="secondary-button" onClick={onQuit}>
          返回主菜单
        </button>
      </div>
    </div>
  );
}
