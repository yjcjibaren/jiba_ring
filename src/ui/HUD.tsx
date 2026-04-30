import type { WeaponType } from "../store/gameStore";

type HUDProps = {
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  energy: number;
  maxEnergy: number;
  potions: number;
  weapon: WeaponType;
  summonHp: number;
  summonMaxHp: number;
  chapterTitle: string;
  bossVisible: boolean;
  bossName: string;
  bossSubtitle: string;
  bossHp: number;
  bossMaxHp: number;
};

function Bar({
  label,
  value,
  max,
  className
}: {
  label: string;
  value: number;
  max: number;
  className: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="bar-block">
      <div className="bar-label-row">
        <span>{label}</span>
        <span>
          {Math.ceil(value)} / {max}
        </span>
      </div>
      <div className="bar-shell">
        <div className={`bar-fill ${className}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function HUD(props: HUDProps) {
  return (
    <>
      <div className="hud top-left">
        <div className="chapter-chip">{props.chapterTitle}</div>
        <Bar label="HP" value={props.hp} max={props.maxHp} className="hp" />
        <Bar label="耐力" value={props.stamina} max={props.maxStamina} className="stamina" />
        <Bar label="能量" value={props.energy} max={props.maxEnergy} className="energy" />
        <Bar label="仓鼠" value={props.summonHp} max={props.summonMaxHp} className="summon" />
        <div className="hud-row">
          <span>武器：{props.weapon === "summon" ? "绯晶魔弹" : props.weapon}</span>
          <span>圣瓶：{props.potions}</span>
        </div>
      </div>
      {props.bossVisible && (
        <div className="hud boss-bar">
          <div className="boss-name">{props.bossName}</div>
          {props.bossSubtitle ? <div className="boss-subtitle">{props.bossSubtitle}</div> : null}
          <div className="boss-hp-number">
            {Math.ceil(props.bossHp)} / {props.bossMaxHp}
          </div>
          <div className="bar-shell boss-shell">
            <div
              className="bar-fill boss"
              style={{ width: `${Math.max(0, (props.bossHp / props.bossMaxHp) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </>
  );
}
