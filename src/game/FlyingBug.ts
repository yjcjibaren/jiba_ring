import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { FLYING_BUG_MAX_HP } from "./constants";

export class FlyingBug extends Enemy {
  homeX: number;
  homeY: number;
  hoverSeed: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.hp = FLYING_BUG_MAX_HP;
    this.aggroRange = 420;
    this.attackRange = 98;
    this.speed = 122;
    this.homeX = x;
    this.homeY = y;
    this.hoverSeed = Math.random() * 1000;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(34, 26);
    body.setOffset(11, 18);
  }

  override update(playerX: number, now: number) {
    if (!this.alive) return;
    const dx = playerX - this.x;
    const absDx = Math.abs(dx);
    const hoverY = this.homeY + Math.sin(now / 360 + this.hoverSeed) * 26;
    this.setFlipX(dx < 0);

    if (absDx < this.aggroRange) {
      this.setVelocityX(Math.sign(dx) * this.speed);
      this.setVelocityY((hoverY - this.y) * 2.6);
    } else {
      const patrolX = this.homeX + Math.sin(now / 720 + this.hoverSeed) * 120;
      this.setVelocityX((patrolX - this.x) * 1.35);
      this.setVelocityY((hoverY - this.y) * 2.4);
    }

    if (this.tintTimer && now > this.tintTimer) {
      this.clearTint();
      this.tintTimer = 0;
    }
  }

  override wantsAttack(playerX: number, now: number) {
    return this.alive && Math.abs(playerX - this.x) <= this.attackRange && now - this.lastAttackAt > 1150;
  }
}
