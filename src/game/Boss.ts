import Phaser from "phaser";
import { BOSS_MAX_HP } from "./constants";

export type BossMove =
  | "idle"
  | "sweep"
  | "charge"
  | "trample"
  | "turnslash"
  | "shockwave"
  | "doublecharge"
  | "slamcombo";

export class Boss extends Phaser.Physics.Arcade.Sprite {
  hp = BOSS_MAX_HP;
  alive = true;
  phaseTwo = false;
  activeMove: BossMove = "idle";
  moveStartedAt = 0;
  moveEndsAt = 0;
  cooldownUntil = 0;
  lastPlayerSide = 1;
  spawned = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "boss");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(124, 126);
    body.setOffset(18, 18);
    body.setDragX(900);
    body.setMaxVelocity(620, 1600);
    this.setImmovable(false);
    this.setVisible(false);
    this.disableBody(true, true);
  }

  awaken(x: number, y: number) {
    this.enableBody(true, x, y, true, true);
    this.setVisible(true);
    this.hp = BOSS_MAX_HP;
    this.alive = true;
    this.phaseTwo = false;
    this.activeMove = "idle";
    this.moveStartedAt = this.scene.time.now;
    this.moveEndsAt = 0;
    this.cooldownUntil = this.scene.time.now + 900;
    this.spawned = true;
  }

  updateFacing(playerX: number) {
    const side = playerX >= this.x ? 1 : -1;
    this.setFlipX(side < 0);
    this.lastPlayerSide = side;
  }

  canChooseMove(now: number) {
    return this.alive && this.spawned && now >= this.cooldownUntil && now >= this.moveEndsAt;
  }

  takeDamage(amount: number, knockback: number) {
    if (!this.alive) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.setTintFill(0xffd37a);
    this.scene.time.delayedCall(120, () => this.clearTint());
    this.setVelocityX(knockback * 0.18);
    if (this.hp <= 0) {
      this.alive = false;
      this.setVelocityX(0);
    }
    return true;
  }
}
