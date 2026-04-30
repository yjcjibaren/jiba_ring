type PauseMenuProps = {
  onResume: () => void;
  onQuit: () => void;
};

export function PauseMenu({ onResume, onQuit }: PauseMenuProps) {
  return (
    <div className="overlay center-panel">
      <div className="panel small-panel">
        <h2>暂停</h2>
        <p>风暴仍在废墟尽头等待。喘口气，然后继续。</p>
        <button className="primary-button" onClick={onResume}>
          继续战斗
        </button>
        <button className="secondary-button" onClick={onQuit}>
          返回主菜单
        </button>
      </div>
    </div>
  );
}
