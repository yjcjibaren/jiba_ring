import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { NUT_ENEMY_MAX_HP } from "./constants";

export class NutEnemy extends Enemy {
  armorBroken = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.hp = NUT_ENEMY_MAX_HP;
    this.aggroRange = 210;
    this.attackRange = 64;
    this.speed = 38;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(42, 42);
    body.setOffset(7, 26);
  }

  override takeDamage(amount: number, knockback: number) {
    const reduced = this.armorBroken ? amount : Math.max(1, Math.round(amount * 0.22));
    return super.takeDamage(reduced, knockback * 0.25);
  }

  stompBreak() {
    if (!this.alive) return false;
    this.armorBroken = true;
    return super.takeDamage(NUT_ENEMY_MAX_HP, 0);
  }
}
