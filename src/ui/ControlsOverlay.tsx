export function ControlsOverlay() {
  return (
    <div className="controls-overlay">
      <div className="controls-title">战斗操作</div>
      <div className="controls-list">
        <span>A / D / ← / →</span>
        <span>移动</span>
        <span>W / ↑ / Space</span>
        <span>跳跃</span>
        <span>Shift</span>
        <span>翻滚闪避</span>
        <span>J / 鼠标左键</span>
        <span>魔法弹</span>
        <span>K / 鼠标右键</span>
        <span>强力术式</span>
        <span>L / Q</span>
        <span>召回仓鼠</span>
        <span>R / F</span>
        <span>释放大招</span>
        <span>I / E</span>
        <span>喝药</span>
        <span>ESC / P</span>
        <span>暂停</span>
      </div>
      <div className="controls-tip">平A命中可积攒能量。仓鼠会自动锁敌并独立承伤，大招会回满仓鼠血量并强化火力。</div>
    </div>
  );
}
