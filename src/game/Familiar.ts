import Phaser from "phaser";
import { SUMMON_MAX_HP } from "./constants";

export class Familiar extends Phaser.Physics.Arcade.Sprite {
  hp = SUMMON_MAX_HP;
  maxHp = SUMMON_MAX_HP;
  alive = true;
  attackCooldownUntil = 0;
  moveSpeed = 240;
  lastHitAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "hamsterArt", 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(34, 28);
    body.setOffset(6, 10);
  }

  restore() {
    this.hp = this.maxHp;
    this.alive = true;
    this.setVisible(true);
    this.setActive(true);
    this.enableBody(true, this.x, this.y, true, true);
  }

  recall(x: number, y: number) {
    this.setPosition(x, y);
    this.setVelocity(0, 0);
  }

  takeDamage(amount: number, knockbackX: number) {
    if (!this.alive) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.lastHitAt = this.scene.time.now;
    this.setTintFill(0xffb4c3);
    this.scene.time.delayedCall(120, () => this.clearTint());
    this.setVelocity(knockbackX, -120);
    if (this.hp <= 0) {
      this.alive = false;
      this.disableBody();
      this.setVisible(false);
    }
    return true;
  }
}
