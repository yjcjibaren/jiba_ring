import Phaser from "phaser";
import {
  PLAYER_MAX_ENERGY,
  PLAYER_MAX_HP,
  PLAYER_MAX_STAMINA,
  PLAYER_POTION_COUNT,
  PLAYER_POTION_HEAL
} from "./constants";
import type { WeaponType } from "../store/gameStore";

export type CastProfile = {
  damage: number;
  staminaCost: number;
  duration: number;
  speed: number;
  energyGain: number;
  heavy?: boolean;
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  hp = PLAYER_MAX_HP;
  stamina = PLAYER_MAX_STAMINA;
  energy = 0;
  potions = PLAYER_POTION_COUNT;
  weapon: WeaponType = "summon";
  facing: 1 | -1 = 1;
  moveSpeed = 305;
  jumpPower = 740;
  attackLockUntil = 0;
  dodgeUntil = 0;
  invulnerableUntil = 0;
  hitStunUntil = 0;
  lastCastAt = 0;
  empoweredUntil = 0;
  alive = true;
  private lastFacingChangeAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBounce(0);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(42, 78);
    body.setOffset(11, 8);
  }

  get isBusy() {
    return this.scene.time.now < this.attackLockUntil || this.scene.time.now < this.hitStunUntil;
  }

  get isDodging() {
    return this.scene.time.now < this.dodgeUntil;
  }

  get isEmpowered() {
    return this.scene.time.now < this.empoweredUntil;
  }

  get canAct() {
    return this.alive && !this.isBusy && !this.isDodging;
  }

  updateStamina(deltaMs: number) {
    if (!this.alive) return;
    const regenRate = this.isBusy || this.isDodging ? 18 : 30;
    this.stamina = Math.min(PLAYER_MAX_STAMINA, this.stamina + regenRate * (deltaMs / 1000));
  }

  move(dir: -1 | 0 | 1) {
    if (!this.alive) {
      this.setVelocityX(0);
      return;
    }
    if (this.isBusy) {
      this.setVelocityX(0);
      return;
    }
    if (this.isDodging) return;
    this.setVelocityX(dir * this.moveSpeed);
    if (dir !== 0) {
      if (dir !== this.facing) {
        this.lastFacingChangeAt = this.scene.time.now;
      }
      this.facing = dir;
      this.setFlipX(dir < 0);
    }
  }

  get justTurned() {
    return this.scene.time.now - this.lastFacingChangeAt < 120;
  }

  jump() {
    if (!this.alive || this.isBusy || this.isDodging) return false;
    if ((this.body as Phaser.Physics.Arcade.Body).blocked.down) {
      this.setVelocityY(-this.jumpPower);
      return true;
    }
    return false;
  }

  dodge() {
    if (!this.canAct || this.stamina < 22) return false;
    this.stamina -= 22;
    this.dodgeUntil = this.scene.time.now + 420;
    this.invulnerableUntil = this.scene.time.now + 280;
    this.setVelocityX(this.facing * 500);
    return true;
  }

  drinkPotion() {
    if (!this.canAct || this.potions <= 0 || this.hp >= PLAYER_MAX_HP) return false;
    this.attackLockUntil = this.scene.time.now + 700;
    this.potions -= 1;
    this.hp = Math.min(PLAYER_MAX_HP, this.hp + PLAYER_POTION_HEAL);
    return true;
  }

  gainEnergy(amount: number) {
    this.energy = Math.min(PLAYER_MAX_ENERGY, this.energy + amount);
  }

  castBasic() {
    if (!this.canAct || this.stamina < 8 || this.scene.time.now - this.lastCastAt < 160) return null;
    this.stamina -= 10;
    this.attackLockUntil = this.scene.time.now + 185;
    this.lastCastAt = this.scene.time.now;
    return {
      damage: this.isEmpowered ? 18 : 12,
      staminaCost: 10,
      duration: 185,
      speed: this.isEmpowered ? 1220 : 1080,
      energyGain: 12
    } satisfies CastProfile;
  }

  castHeavy() {
    if (!this.canAct || this.stamina < 20 || this.scene.time.now - this.lastCastAt < 320) return null;
    this.stamina -= 22;
    this.attackLockUntil = this.scene.time.now + 410;
    this.lastCastAt = this.scene.time.now;
    return {
      damage: this.isEmpowered ? 38 : 27,
      staminaCost: 22,
      duration: 410,
      speed: this.isEmpowered ? 940 : 820,
      energyGain: 20,
      heavy: true
    } satisfies CastProfile;
  }

  castUltimate() {
    if (!this.canAct || this.energy < PLAYER_MAX_ENERGY) return false;
    this.energy = 0;
    this.attackLockUntil = this.scene.time.now + 1500;
    this.empoweredUntil = this.scene.time.now + 12000;
    return true;
  }

  takeDamage(amount: number, knockbackX: number) {
    if (!this.alive || this.scene.time.now < this.invulnerableUntil) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.hitStunUntil = this.scene.time.now + 300;
    this.invulnerableUntil = this.scene.time.now + 520;
    this.setTintFill(0xff6a6a);
    this.scene.time.delayedCall(120, () => this.clearTint());
    this.setVelocity(knockbackX, -210);
    if (this.hp <= 0) {
      this.alive = false;
      this.setVelocity(0, -120);
      this.attackLockUntil = Number.MAX_SAFE_INTEGER;
    }
    return true;
  }
}
