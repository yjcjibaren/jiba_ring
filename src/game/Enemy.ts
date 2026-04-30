import Phaser from "phaser";
import { ENEMY_MAX_HP } from "./constants";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  hp = ENEMY_MAX_HP;
  alive = true;
  aggroRange = 250;
  attackRange = 72;
  speed = 86;
  lastAttackAt = 0;
  patrolDir: 1 | -1 = 1;
  tintTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "enemy");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(36, 62);
    body.setOffset(10, 8);
  }

  update(playerX: number, now: number) {
    if (!this.alive) return;
    const dx = playerX - this.x;
    const absDx = Math.abs(dx);
    this.setFlipX(dx < 0);
    if (absDx < this.attackRange) {
      this.setVelocityX(0);
    } else if (absDx < this.aggroRange) {
      this.setVelocityX(Math.sign(dx) * this.speed);
    } else {
      const body = this.body as Phaser.Physics.Arcade.Body;
      if (body.blocked.left || body.blocked.right) {
        this.patrolDir *= -1;
      }
      this.setVelocityX(this.patrolDir * 28);
    }
    if (this.tintTimer && now > this.tintTimer) {
      this.clearTint();
      this.tintTimer = 0;
    }
  }

  wantsAttack(playerX: number, now: number) {
    return this.alive && Math.abs(playerX - this.x) <= this.attackRange && now - this.lastAttackAt > 1400;
  }

  markAttack(now: number) {
    this.lastAttackAt = now;
  }

  takeDamage(amount: number, knockback: number) {
    if (!this.alive) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.setTintFill(0xff8f8f);
    this.tintTimer = this.scene.time.now + 110;
    this.setVelocityX(knockback);
    if (this.hp <= 0) {
      this.alive = false;
      this.disableBody();
      this.setVisible(false);
    }
    return true;
  }
}
